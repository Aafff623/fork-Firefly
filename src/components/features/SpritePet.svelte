<script lang="ts">
/**
 * 站内桌宠：cc-haha spritesheet 渲染核的 Svelte 移植（MIT）。
 * 交互：分部位点击、双击、拖拽、站点控件联动。
 */
import { onDestroy, onMount } from "svelte";
import { type BuiltinPetId, findBuiltinPet } from "@/lib/pets/builtinPets";
import {
	getPetAnimationDurationMs,
	getPetAnimationPlaybackStep,
	getPetAnimationPlaybackTickAtElapsedMs,
	getPetLookFrame,
	PET_ATLAS_V2,
	type PetAnimationState,
	type PetAtlasFrame,
	type PetLookDirection,
	quantizePetLookDirection,
} from "@/lib/pets/petAnimation";
import { url } from "@/utils/url-utils";

interface Props {
	petId: BuiltinPetId;
	position?: "bottom-left" | "bottom-right";
	offsetX?: number;
	offsetY?: number;
	size?: number;
	motionEnabled?: boolean;
	draggable?: boolean;
	clickInteract?: boolean;
	lookFollow?: boolean;
	reactToSiteUi?: boolean;
	hideOnMobile?: boolean;
	mobileBreakpoint?: number;
	zIndex?: number;
}

let {
	petId,
	position = "bottom-left",
	offsetX = 12,
	offsetY = 12,
	size = 128,
	motionEnabled = true,
	draggable = true,
	clickInteract = true,
	lookFollow = true,
	reactToSiteUi = true,
	hideOnMobile = true,
	mobileBreakpoint = 768,
	zIndex = 1000,
}: Props = $props();

const STORAGE_KEY = "firefly-sprite-pet-pos";
const DRAG_THRESHOLD_PX = 4;
/** 进入视线跟随的距离；略大一点，避免边缘抖帧 */
const LOOK_DEADZONE_PX = 28;
/** 离开视线跟随要比进入更大，形成回滞 */
const LOOK_EXIT_DEADZONE_PX = 40;
/** 相邻视线方向切换的粘滞角（度），减轻 22.5° 硬切 */
const LOOK_STICKINESS_DEG = 12;
const DOUBLE_CLICK_MS = 280;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** 站点控件 → 桌宠动作（点到匹配选择器就触发） */
const SITE_UI_REACTIONS: ReadonlyArray<{
	selector: string;
	state: PetAnimationState;
}> = [
	{
		selector: "#search-switch, #search-bar, #search-bar-inside",
		state: "waiting",
	},
	{
		selector: "#display-setting, #display-settings-switch",
		state: "review",
	},
	{
		selector:
			".floating-controls-container button, #back-to-top, [aria-label*='Top'], [aria-label*='顶部']",
		state: "jumping",
	},
	{ selector: "nav a, .navbar a, header a", state: "running" },
	{
		selector: "button.copy, .copy, [data-code], .expressive-code button",
		state: "review",
	},
	{ selector: "a[href*='github'], a[href*='GitHub']", state: "waving" },
	{
		selector:
			"[aria-label*='like' i], [aria-label*='赞'], .sponsor button, button[data-like]",
		state: "jumping",
	},
];

const IDLE_WAITING_MS = 45_000;
const READ_SCROLL_TRIGGER_MS = 2_400;
const SCENARIO_COOLDOWN_MS = 8_000;

const CLICK_POOL_HEAD: PetAnimationState[] = ["waving", "waving", "review"];
const CLICK_POOL_BODY: PetAnimationState[] = ["review", "waiting", "waving"];
const CLICK_POOL_FEET: PetAnimationState[] = ["jumping", "running", "jumping"];

const pet = $derived(findBuiltinPet(petId));
const height = $derived(
	(size * PET_ATLAS_V2.cellHeight) / PET_ATLAS_V2.cellWidth,
);
const atlasUrl = $derived(url(pet.spritesheetPath));

let rootEl: HTMLDivElement | undefined = $state();
let spriteEl: HTMLDivElement | undefined = $state();
let hidden = $state(false);
let prefersReducedMotion = $state(false);
let animationState: PetAnimationState = $state("idle");
let lookDirection: PetLookDirection | null | undefined = $state(undefined);
let posX = $state<number | null>(null);
let posY = $state<number | null>(null);
let dragging = $state(false);

let playbackTimer: ReturnType<typeof setTimeout> | null = null;
let transientTimer: ReturnType<typeof setTimeout> | null = null;
let idleTimer: ReturnType<typeof setTimeout> | null = null;
let readScrollTimer: ReturnType<typeof setTimeout> | null = null;
let suppressClick = false;
let lastClickAt = 0;
let scenarioCooldownUntil = 0;
const scenarioKeyCooldown = new Map<string, number>();
let lookRaf = 0;
let pendingLook: { x: number; y: number } | null = null;
let gazeActive = $state(false);
/** 非响应式备份，避免 $effect 因 lookDirection 频繁重跑 */
let stickyLook: PetLookDirection | null | undefined;
let pointerPressed = false;
let captureEl: HTMLElement | null = null;
let dragStart: {
	pointerId: number;
	startClientX: number;
	startClientY: number;
	lastClientX: number;
	lastClientY: number;
	originLeft: number;
	originTop: number;
	moved: boolean;
	/** 最近一次有效水平移动方向，供静止帧保持朝向 */
	facing: "left" | "right";
} | null = null;

const effectiveMotion = $derived(motionEnabled && !prefersReducedMotion);

function angularDistanceDeg(a: number, b: number): number {
	const delta = Math.abs(a - b) % 360;
	return delta > 180 ? 360 - delta : delta;
}

/** 带粘滞的视线量化：优先保持当前方向，直到指针明显偏向邻居格 */
function resolveLookWithHysteresis(
	deltaX: number,
	deltaY: number,
	current: PetLookDirection | null | undefined,
): PetLookDirection | null | undefined {
	const distance = Math.hypot(deltaX, deltaY);
	const inGaze = current !== undefined;

	if (!inGaze && distance <= LOOK_DEADZONE_PX) return undefined;
	if (inGaze && distance <= LOOK_EXIT_DEADZONE_PX) {
		// 仍在跟随区边缘：保持中性脸，但不立刻退出 gaze（由 leave 事件退出）
		return null;
	}

	const next = quantizePetLookDirection(deltaX, deltaY, 0);
	if (current === undefined) return next;
	if (current === null) return next;
	if (next === current) return current;

	const angle = ((Math.atan2(deltaX, -deltaY) * 180) / Math.PI + 360) % 360;
	// 还没离开当前扇区足够远 → 粘住，避免来回跳帧
	if (angularDistanceDeg(angle, current) < 11.25 + LOOK_STICKINESS_DEG) {
		return current;
	}
	return next;
}

function applyGazeFrame(direction: PetLookDirection | null) {
	if (!spriteEl) return;
	stopPlayback();
	gazeActive = true;
	stickyLook = direction;
	lookDirection = direction;
	const look = getPetLookFrame(direction);
	applyFrame(look, "idle", "gaze");
}

function exitGazeAndResumeIdle() {
	if (!gazeActive && stickyLook === undefined) return;
	gazeActive = false;
	stickyLook = undefined;
	lookDirection = undefined;
	if (animationState === "idle") {
		startPlayback("idle");
	}
}

function pick<T>(items: readonly T[]): T {
	return items[Math.floor(Math.random() * items.length)] ?? items[0];
}

function getDadaFrameOffset(frame: PetAtlasFrame): {
	offsetX: number;
	offsetY: number;
} {
	const centerX: Record<number, number[]> = {
		1: [8.5, 6.5, 7, 14, 13.5, 7, 3, -1.5],
		2: [-3.5, 3, 2.5, 3, 5, -2, -4.5, -7.5],
	};
	const baselineY: Record<number, number[]> = {
		1: [2, 3, 3, 0, 3, 0, 0, 0],
		2: [-6, 1, -1, 0, 0, 0, 0, 0],
	};
	return {
		offsetX:
			((centerX[frame.rowIndex]?.[frame.columnIndex] ?? 0) * size) /
			PET_ATLAS_V2.cellWidth,
		offsetY:
			((baselineY[frame.rowIndex]?.[frame.columnIndex] ?? 0) * height) /
			PET_ATLAS_V2.cellHeight,
	};
}

function getFrameOffset(frame: PetAtlasFrame): {
	offsetX: number;
	offsetY: number;
} {
	return pet.id === "dada-code"
		? getDadaFrameOffset(frame)
		: { offsetX: 0, offsetY: 0 };
}

function atlasBackgroundPosition(frame: PetAtlasFrame): string {
	const { offsetX: ox, offsetY: oy } = getFrameOffset(frame);
	return `${-frame.columnIndex * size + ox}px ${-frame.rowIndex * height + oy}px`;
}

function applyFrame(
	frame: PetAtlasFrame,
	motionState: PetAnimationState,
	phase: string,
) {
	if (!spriteEl) return;
	spriteEl.dataset.petMotionState = motionState;
	spriteEl.dataset.petMotionPhase = phase;
	spriteEl.dataset.petRow = String(frame.rowIndex);
	spriteEl.dataset.petColumn = String(frame.columnIndex);
	spriteEl.style.backgroundPosition = atlasBackgroundPosition(frame);
}

function stopPlayback() {
	if (playbackTimer) {
		clearTimeout(playbackTimer);
		playbackTimer = null;
	}
}

function startPlayback(state: PetAnimationState) {
	stopPlayback();
	if (!spriteEl) return;

	// 视线跟随单独渲染，避免每次转头都重启动画循环
	if (state === "idle" && stickyLook !== undefined) {
		applyGazeFrame(stickyLook);
		return;
	}

	gazeActive = false;
	if (!effectiveMotion) {
		const step = getPetAnimationPlaybackStep(state, 0);
		applyFrame(step.frame, step.motionState, step.phase);
		return;
	}

	const startedAt = performance.now();
	const tick = () => {
		const next = getPetAnimationPlaybackTickAtElapsedMs(
			state,
			Math.max(0, performance.now() - startedAt),
		);
		applyFrame(next.frame, next.motionState, next.phase);
		playbackTimer = setTimeout(
			tick,
			Math.max(1, Math.ceil(next.remainingDurationMs)),
		);
	};
	tick();
}

function playTransient(
	state: PetAnimationState,
	loops = 3,
	onDone?: () => void,
) {
	if (!effectiveMotion && state !== "idle") return;
	if (transientTimer) clearTimeout(transientTimer);
	gazeActive = false;
	stickyLook = undefined;
	lookDirection = undefined;
	animationState = state;
	transientTimer = setTimeout(() => {
		animationState = "idle";
		transientTimer = null;
		onDone?.();
	}, getPetAnimationDurationMs(state) * loops);
}

function playSequence(
	steps: ReadonlyArray<{ state: PetAnimationState; loops?: number }>,
) {
	const run = (index: number) => {
		const step = steps[index];
		if (!step) return;
		playTransient(step.state, step.loops ?? 2, () => run(index + 1));
	};
	run(0);
}

function canTriggerScenario(key: string, cooldownMs = SCENARIO_COOLDOWN_MS) {
	const now = Date.now();
	if (now < scenarioCooldownUntil) return false;
	const until = scenarioKeyCooldown.get(key) ?? 0;
	if (now < until) return false;
	scenarioKeyCooldown.set(key, now + cooldownMs);
	scenarioCooldownUntil = now + 1_200;
	return true;
}

function isPostPath(pathname = window.location.pathname) {
	return /\/posts\//.test(pathname);
}

function is404Page() {
	return Boolean(document.querySelector('[data-page="404"]'));
}

function reactToRoute() {
	if (!reactToSiteUi || !effectiveMotion || hidden) return;
	if (is404Page()) {
		if (canTriggerScenario("404", 20_000)) playTransient("failed", 4);
		return;
	}
	if (isPostPath() && canTriggerScenario("post-open", 12_000)) {
		playTransient("review", 3);
	}
}

function resetIdleTimer() {
	if (idleTimer) clearTimeout(idleTimer);
	if (!reactToSiteUi || !effectiveMotion) return;
	idleTimer = setTimeout(() => {
		if (dragging || pointerPressed || animationState !== "idle") {
			resetIdleTimer();
			return;
		}
		if (canTriggerScenario("long-idle", 60_000)) {
			playTransient("waiting", 3);
		}
		resetIdleTimer();
	}, IDLE_WAITING_MS);
}

function resolveHitZone(clientY: number): "head" | "body" | "feet" {
	if (!rootEl) return "body";
	const rect = rootEl.getBoundingClientRect();
	const ratio = (clientY - rect.top) / Math.max(1, rect.height);
	if (ratio < 0.34) return "head";
	if (ratio > 0.72) return "feet";
	return "body";
}

function actionForPetClick(
	clientY: number,
	isDouble: boolean,
): PetAnimationState {
	if (isDouble) return "jumping";
	const zone = resolveHitZone(clientY);
	if (zone === "head") return pick(CLICK_POOL_HEAD);
	if (zone === "feet") return pick(CLICK_POOL_FEET);
	return pick(CLICK_POOL_BODY);
}

function updateHidden() {
	if (!hideOnMobile) {
		hidden = false;
		return;
	}
	hidden = window.innerWidth <= mobileBreakpoint;
}

function loadStoredPosition() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return;
		const parsed = JSON.parse(raw) as { x?: number; y?: number };
		if (
			typeof parsed.x === "number" &&
			typeof parsed.y === "number" &&
			Number.isFinite(parsed.x) &&
			Number.isFinite(parsed.y)
		) {
			posX = parsed.x;
			posY = parsed.y;
		}
	} catch {
		/* ignore */
	}
}

function persistPosition(x: number, y: number) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ x, y }));
	} catch {
		/* ignore */
	}
}

function clampToViewport(x: number, y: number): { x: number; y: number } {
	if (typeof window === "undefined") return { x, y };
	const maxX = Math.max(0, window.innerWidth - size);
	const maxY = Math.max(0, window.innerHeight - height);
	return {
		x: Math.min(maxX, Math.max(0, x)),
		y: Math.min(maxY, Math.max(0, y)),
	};
}

function defaultStyle(): string {
	const side =
		position === "bottom-right"
			? `right:${offsetX}px;left:auto;`
			: `left:${offsetX}px;right:auto;`;
	return `${side}bottom:${offsetY}px;top:auto;`;
}

function positionedStyle(): string {
	if (posX === null || posY === null) return defaultStyle();
	return `left:${posX}px;top:${posY}px;right:auto;bottom:auto;`;
}

function flushPendingLook() {
	lookRaf = 0;
	const pending = pendingLook;
	pendingLook = null;
	if (!pending || !rootEl) return;
	if (
		!lookFollow ||
		!effectiveMotion ||
		pointerPressed ||
		dragging ||
		animationState !== "idle"
	) {
		return;
	}

	const rect = rootEl.getBoundingClientRect();
	const next = resolveLookWithHysteresis(
		pending.x - (rect.left + rect.width / 2),
		pending.y - (rect.top + rect.height / 2),
		stickyLook,
	);

	if (next === undefined) {
		if (gazeActive) exitGazeAndResumeIdle();
		return;
	}

	if (next === stickyLook && gazeActive) return;
	applyGazeFrame(next);
}

function onPointerMoveLook(event: PointerEvent) {
	if (
		!lookFollow ||
		!effectiveMotion ||
		pointerPressed ||
		dragging ||
		animationState !== "idle"
	) {
		return;
	}
	pendingLook = { x: event.clientX, y: event.clientY };
	if (!lookRaf) {
		lookRaf = requestAnimationFrame(flushPendingLook);
	}
}

function onPointerLeaveLook() {
	if (pointerPressed || dragging) return;
	pendingLook = null;
	if (lookRaf) {
		cancelAnimationFrame(lookRaf);
		lookRaf = 0;
	}
	exitGazeAndResumeIdle();
}

function unbindDragWindowListeners() {
	if (typeof window === "undefined") return;
	window.removeEventListener("pointermove", onWindowPointerMove);
	window.removeEventListener("pointerup", onWindowPointerUp);
	window.removeEventListener("pointercancel", onWindowPointerUp);
}

function bindDragWindowListeners() {
	if (typeof window === "undefined") return;
	window.addEventListener("pointermove", onWindowPointerMove);
	window.addEventListener("pointerup", onWindowPointerUp);
	window.addEventListener("pointercancel", onWindowPointerUp);
}

function releaseCaptureSafe(pointerId: number) {
	const el = captureEl;
	captureEl = null;
	if (!el) return;
	try {
		if (el.hasPointerCapture(pointerId)) {
			el.releasePointerCapture(pointerId);
		}
	} catch {
		/* ignore */
	}
}

function finishDrag(pointerId: number, clientX: number, clientY: number) {
	if (!dragStart || dragStart.pointerId !== pointerId) return;
	const wasDrag = dragStart.moved;
	const origin = dragStart;
	dragStart = null;
	pointerPressed = false;
	dragging = false;
	unbindDragWindowListeners();
	releaseCaptureSafe(pointerId);

	if (!wasDrag) {
		// 普通点击：恢复 idle，交给 onclick 播交互动作
		if (animationState === "idle") startPlayback("idle");
		return;
	}

	suppressClick = true;
	setTimeout(() => {
		suppressClick = false;
	}, 0);

	const dx = clientX - origin.startClientX;
	const dy = clientY - origin.startClientY;
	const next = clampToViewport(origin.originLeft + dx, origin.originTop + dy);
	posX = next.x;
	posY = next.y;
	persistPosition(posX, posY);
	playTransient("jumping", 2);
}

function onWindowPointerMove(event: PointerEvent) {
	if (!dragStart || dragStart.pointerId !== event.pointerId) return;
	const dxFromOrigin = event.clientX - dragStart.startClientX;
	const dyFromOrigin = event.clientY - dragStart.startClientY;
	const stepX = event.clientX - dragStart.lastClientX;

	if (!dragStart.moved) {
		if (Math.hypot(dxFromOrigin, dyFromOrigin) < DRAG_THRESHOLD_PX) return;
		dragStart.moved = true;
		dragging = true;
		gazeActive = false;
		stickyLook = undefined;
		lookDirection = undefined;
	}

	// 按瞬时水平位移转向；几乎静止时保持上一朝向
	if (Math.abs(stepX) >= 1) {
		dragStart.facing = stepX > 0 ? "right" : "left";
	}
	dragStart.lastClientX = event.clientX;
	dragStart.lastClientY = event.clientY;

	const next = clampToViewport(
		dragStart.originLeft + dxFromOrigin,
		dragStart.originTop + dyFromOrigin,
	);
	posX = next.x;
	posY = next.y;
	// 图集朝向与屏幕拖拽方向相反，这里按视觉朝向映射
	animationState =
		dragStart.facing === "right" ? "running-left" : "running-right";
}

function onWindowPointerUp(event: PointerEvent) {
	finishDrag(event.pointerId, event.clientX, event.clientY);
}

function onPointerDown(event: PointerEvent) {
	if (!draggable || event.button !== 0 || !rootEl) return;
	if (!(event.currentTarget instanceof HTMLElement)) return;

	// 按下即暂停视线跟随，避免和拖拽抢事件
	pointerPressed = true;
	pendingLook = null;
	if (lookRaf) {
		cancelAnimationFrame(lookRaf);
		lookRaf = 0;
	}
	gazeActive = false;
	stickyLook = undefined;
	lookDirection = undefined;

	const rect = rootEl.getBoundingClientRect();
	dragStart = {
		pointerId: event.pointerId,
		startClientX: event.clientX,
		startClientY: event.clientY,
		lastClientX: event.clientX,
		lastClientY: event.clientY,
		originLeft: rect.left,
		originTop: rect.top,
		moved: false,
		facing: "right",
	};

	// 捕获必须打在当前按钮上；打在父节点会导致 pointerup 收不到、拖拽卡死
	captureEl = event.currentTarget;
	try {
		captureEl.setPointerCapture(event.pointerId);
	} catch {
		captureEl = null;
	}
	bindDragWindowListeners();
}

function onPointerUp(event: PointerEvent) {
	finishDrag(event.pointerId, event.clientX, event.clientY);
}

function onClick(event: MouseEvent) {
	if (suppressClick || !clickInteract) return;
	const now = performance.now();
	const isDouble = now - lastClickAt <= DOUBLE_CLICK_MS;
	lastClickAt = now;
	playTransient(actionForPetClick(event.clientY, isDouble), isDouble ? 4 : 3);
}

function onSitePointerDown(event: Event) {
	if (!reactToSiteUi || !effectiveMotion || hidden) return;
	const target = event.target;
	if (!(target instanceof Element)) return;
	if (rootEl?.contains(target)) return;
	resetIdleTimer();

	// 主题切换：思考 → 挥手
	if (target.closest("#scheme-switch")) {
		if (canTriggerScenario("theme", 4_000)) {
			playSequence([
				{ state: "review", loops: 2 },
				{ state: "waving", loops: 2 },
			]);
		}
		return;
	}

	for (const rule of SITE_UI_REACTIONS) {
		if (target.closest(rule.selector)) {
			playTransient(rule.state, 3);
			return;
		}
	}
}

// 不读取 lookDirection，避免转头触发整段动画重启
$effect(() => {
	void animationState;
	void effectiveMotion;
	void size;
	void height;
	void petId;
	if (animationState === "idle" && gazeActive && stickyLook !== undefined) {
		applyGazeFrame(stickyLook);
		return;
	}
	startPlayback(animationState);
});

// hidden 切换后根节点会重建，需再次挂到 body
$effect(() => {
	mountPetToBody(rootEl);
});

/** 挂到 body，避免被主栅格 transform / sticky 侧栏合成层盖住 */
function mountPetToBody(el: HTMLElement | null) {
	if (!el || typeof document === "undefined") return;
	if (el.parentElement !== document.body) {
		document.body.appendChild(el);
	}
}

onMount(() => {
	updateHidden();
	loadStoredPosition();
	mountPetToBody(rootEl);

	const media = window.matchMedia(REDUCED_MOTION_QUERY);
	prefersReducedMotion = media.matches;
	const onMotion = (e: MediaQueryListEvent) => {
		prefersReducedMotion = e.matches;
	};
	media.addEventListener("change", onMotion);

	const onResize = () => {
		updateHidden();
		if (posX !== null && posY !== null) {
			const clamped = clampToViewport(posX, posY);
			posX = clamped.x;
			posY = clamped.y;
		}
	};
	window.addEventListener("resize", onResize);

	// 捕获阶段：先于按钮自身逻辑感知「点了哪个控件」
	document.addEventListener("pointerdown", onSitePointerDown, true);

	const onUserActivity = () => resetIdleTimer();
	window.addEventListener("keydown", onUserActivity);
	window.addEventListener("pointermove", onUserActivity, { passive: true });

	// 读文章时持续滚动一会儿 → waiting
	const onScroll = () => {
		resetIdleTimer();
		if (!reactToSiteUi || !effectiveMotion || !isPostPath()) return;
		if (readScrollTimer) return;
		readScrollTimer = setTimeout(() => {
			readScrollTimer = null;
			if (canTriggerScenario("read-scroll", 14_000)) {
				playTransient("waiting", 2);
			}
		}, READ_SCROLL_TRIGGER_MS);
	};
	window.addEventListener("scroll", onScroll, { passive: true });

	// Swup 切页：离开时忙活，进入后按路由表态
	type SwupLike = {
		hooks?: {
			on: (event: string, cb: () => void) => void;
			off?: (event: string, cb: () => void) => void;
		};
	};
	const win = window as Window & { swup?: SwupLike };
	const onSwupLeave = () => {
		if (!reactToSiteUi || !effectiveMotion) return;
		if (canTriggerScenario("swup-leave", 3_000)) {
			playTransient("running", 2);
		}
	};
	const onSwupArrive = () => {
		observeFooter();
		// 稍微晚一点，等 DOM 就绪
		setTimeout(() => reactToRoute(), 80);
	};
	const bindSwup = () => {
		win.swup?.hooks?.on("animation:out:start", onSwupLeave);
		win.swup?.hooks?.on("page:view", onSwupArrive);
		win.swup?.hooks?.on("content:replace", onSwupArrive);
	};
	bindSwup();
	document.addEventListener("swup:enable", bindSwup);

	// 抵达页脚 → 挥手再见
	let footerObserver: IntersectionObserver | null = null;
	const observeFooter = () => {
		footerObserver?.disconnect();
		const footer = document.querySelector(".footer");
		if (!footer || typeof IntersectionObserver === "undefined") return;
		footerObserver = new IntersectionObserver(
			(entries) => {
				if (!entries.some((entry) => entry.isIntersecting)) return;
				if (canTriggerScenario("footer", 20_000)) {
					playTransient("waving", 3);
				}
			},
			{ threshold: 0.35 },
		);
		footerObserver.observe(footer);
	};
	observeFooter();

	// 背景视频/音乐开始播放
	const onBgPlayer = (event: Event) => {
		const detail = (event as CustomEvent<{ playing?: boolean }>).detail;
		if (!detail?.playing) return;
		if (canTriggerScenario("bg-player", 10_000)) {
			playTransient("jumping", 3);
		}
	};
	window.addEventListener("bg-player-state-change", onBgPlayer);

	// 搜索无结果 / 显式 pet 场景事件
	const onPetScenario = (event: Event) => {
		const detail = (event as CustomEvent<{ scenario?: string }>).detail;
		if (!detail?.scenario || !reactToSiteUi || !effectiveMotion) return;
		switch (detail.scenario) {
			case "search-empty":
				if (canTriggerScenario("search-empty", 8_000)) {
					playTransient("failed", 3);
				}
				break;
			case "copy-fail":
			case "form-fail":
				if (canTriggerScenario("fail", 6_000)) {
					playTransient("failed", 3);
				}
				break;
			case "like":
			case "comment-ok":
				if (canTriggerScenario("celebrate", 6_000)) {
					playTransient("jumping", 3);
				}
				break;
			default:
				break;
		}
	};
	window.addEventListener("firefly:pet-scenario", onPetScenario);

	// 表单校验失败
	const onInvalid = () => {
		if (canTriggerScenario("form-fail", 6_000)) playTransient("failed", 3);
	};
	document.addEventListener("invalid", onInvalid, true);

	// 入场挥手，再按路由表态
	if (effectiveMotion) {
		playTransient("waving", 2, () => {
			setTimeout(() => reactToRoute(), 120);
		});
	} else {
		reactToRoute();
	}
	resetIdleTimer();

	return () => {
		media.removeEventListener("change", onMotion);
		window.removeEventListener("resize", onResize);
		document.removeEventListener("pointerdown", onSitePointerDown, true);
		window.removeEventListener("keydown", onUserActivity);
		window.removeEventListener("pointermove", onUserActivity);
		window.removeEventListener("scroll", onScroll);
		document.removeEventListener("swup:enable", bindSwup);
		win.swup?.hooks?.off?.("animation:out:start", onSwupLeave);
		win.swup?.hooks?.off?.("page:view", onSwupArrive);
		win.swup?.hooks?.off?.("content:replace", onSwupArrive);
		window.removeEventListener("bg-player-state-change", onBgPlayer);
		window.removeEventListener("firefly:pet-scenario", onPetScenario);
		document.removeEventListener("invalid", onInvalid, true);
		footerObserver?.disconnect();
		if (idleTimer) clearTimeout(idleTimer);
		if (readScrollTimer) clearTimeout(readScrollTimer);
	};
});

onDestroy(() => {
	stopPlayback();
	if (transientTimer) clearTimeout(transientTimer);
	if (idleTimer) clearTimeout(idleTimer);
	if (readScrollTimer) clearTimeout(readScrollTimer);
	if (lookRaf) cancelAnimationFrame(lookRaf);
	unbindDragWindowListeners();
	if (dragStart) releaseCaptureSafe(dragStart.pointerId);
});
</script>

{#if !hidden}
	<div
		bind:this={rootEl}
		class="sprite-pet-root"
		class:is-dragging={dragging}
		style={`z-index:${zIndex};${positionedStyle()}`}
		data-swup-permanent
		data-pet-id={pet.id}
		onpointermove={onPointerMoveLook}
		onpointerleave={onPointerLeaveLook}
	>
		<button
			type="button"
			class="sprite-pet-hit"
			aria-label={`${pet.displayName}（点头挥手 / 点身思考 / 点脚跳跃 / 拖拽移动）`}
			title={`${pet.displayName}\n点头部：打招呼\n点身体：思考/等待\n点脚部：跳跃\n双击：开心跳\n按住拖拽：移动位置，松手放下`}
			onpointerdown={onPointerDown}
			onpointerup={onPointerUp}
			onpointercancel={onPointerUp}
			onclick={onClick}
		>
			<div
				class="pet-sprite-stage pet-sprite-stage--atlas"
				style={`width:${size}px;height:${height}px;`}
				data-pet-motion={effectiveMotion ? "enabled" : "disabled"}
				data-pet-motion-state={animationState}
			>
				<div
					bind:this={spriteEl}
					class="pet-sprite"
					role="img"
					aria-label={pet.displayName}
					data-pet-state={animationState}
					data-pet-motion={effectiveMotion ? "enabled" : "disabled"}
					style={`
						width:${size}px;
						height:${height}px;
						background-image:url(${JSON.stringify(atlasUrl)});
						background-repeat:no-repeat;
						background-size:${size * PET_ATLAS_V2.columns}px ${height * PET_ATLAS_V2.rows}px;
					`}
				></div>
			</div>
		</button>
	</div>
{/if}

<style>
	.sprite-pet-root {
		position: fixed;
		/* 高于主内容 z-30 / sticky 侧栏，低于或对齐浮动控件层 */
		z-index: 1000;
		pointer-events: auto;
		touch-action: none;
		user-select: none;
	}

	.sprite-pet-hit {
		display: block;
		padding: 0;
		margin: 0;
		border: 0;
		background: transparent;
		cursor: grab;
		appearance: none;
	}

	.sprite-pet-root.is-dragging .sprite-pet-hit {
		cursor: grabbing;
	}

	.sprite-pet-hit:focus-visible {
		outline: 2px solid color-mix(in srgb, var(--primary) 70%, transparent);
		outline-offset: 4px;
		border-radius: 12px;
	}

	.pet-sprite-stage {
		position: relative;
		z-index: 1;
		isolation: isolate;
		overflow: visible;
		transform: scale(1.1);
		transform-origin: 50% 88%;
	}

	.pet-sprite {
		position: relative;
		z-index: 1;
		transform-origin: 50% 88%;
		filter: drop-shadow(0 8px 12px rgba(35, 27, 54, 0.14));
		/* 禁止 background-position 过渡：图集会被拖糊成残影 */
		transition: none;
	}

	:global(html.dark) .pet-sprite {
		filter: drop-shadow(0 8px 14px rgba(0, 0, 0, 0.35));
	}
</style>
