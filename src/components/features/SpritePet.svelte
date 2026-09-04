<script lang="ts">
/**
 * 站内桌宠：spritesheet 渲染核。
 * 默认：浏览 defaultPetId · 文章 postPetId（路由换皮）。
 * 访客覆盖：设置里选 Codex 单皮 → 仅浏览态换皮；文章页始终 postPetId。
 */
import { onDestroy, onMount } from "svelte";
import {
	type BuiltinPetId,
	type DualRoutePetId,
	findBuiltinPet,
	isPickerPetId,
	resolvePetIdForPath,
	type StoredPetSelection,
} from "@/lib/pets/builtinPets";
import {
	getAtlas,
	getPetAnimationDurationMs,
	getPetAnimationPlaybackStep,
	getPetAnimationPlaybackTickAtElapsedMs,
	getPetLookFrame,
	type PetAnimationState,
	type PetAtlasFrame,
	type PetLookDirection,
	quantizePetLookDirection,
} from "@/lib/pets/petAnimation";
import {
	createPetRendererGate,
	shouldSkipPetSheet,
} from "@/lib/pets/petRendererGate";
import {
	facingForCorner,
	findVisibleAnchorById,
	isViewportCornerPark,
	listVisibleRoamAnchors,
	type PetRoamAnchorId,
	type PetRoamCorner,
	type PetRoamFacing,
	type PetRoamResolvedAnchor,
	pickNextRoamAnchor,
} from "@/lib/pets/petRoamAnchors";
import {
	canPlayByPriority,
	getPetPagePersonaDef,
	type PetScenarioPriority,
	resolvePostReadMood,
} from "@/lib/pets/petScenarios";
import {
	SIDEBAR_BALANCE_EVENT,
	SIDEBAR_IMBALANCE_EVENT,
} from "@/lib/sidebar/sidebarBalance";
import type { SpritePetRoamConfig } from "@/types/petConfig";
import { triggerPetYzhanByTheme } from "@/utils/ambient-fx";
import { getPetRoamEnabled } from "@/utils/setting-utils";
import { url } from "@/utils/url-utils";

interface Props {
	defaultPetId: DualRoutePetId;
	postPetId: DualRoutePetId;
	position?: "bottom-left" | "bottom-right";
	offsetX?: number;
	offsetY?: number;
	/** 文章页视口定格偏移；缺省跟 offsetX/Y */
	postOffsetX?: number;
	postOffsetY?: number;
	size?: number;
	motionEnabled?: boolean;
	draggable?: boolean;
	clickInteract?: boolean;
	lookFollow?: boolean;
	reactToSiteUi?: boolean;
	hideOnMobileBrowse?: boolean;
	hideOnMobilePost?: boolean;
	mobileBreakpoint?: number;
	roam?: SpritePetRoamConfig;
	zIndex?: number;
}

let {
	defaultPetId,
	postPetId,
	position = "bottom-right",
	offsetX = 28,
	offsetY = 96,
	postOffsetX,
	postOffsetY,
	size = 128,
	motionEnabled = true,
	draggable = true,
	clickInteract = true,
	lookFollow = true,
	reactToSiteUi = true,
	hideOnMobileBrowse = false,
	hideOnMobilePost = true,
	mobileBreakpoint = 768,
	roam = {
		enable: true,
		intervalMs: 7_500,
		minIntervalMs: 7_500,
		jitterMs: 0,
		fadeMs: 380,
		portalHoldMs: 160,
		scrollLeaveDelayMs: 2_400,
		resumeAfterDragMs: 2_000,
		nearMoveMaxPx: 420,
		nearMoveMs: 520,
		pauseWhenPinned: false,
	},
	zIndex = 1000,
}: Props = $props();

/** v3：默认锚到「最新动态」旁，废弃旧左下角记忆 */
/** v4：位置必须相对侧栏卡片角；丢弃旧版贴视口右下的坐标 */
const STORAGE_KEY = "firefly-sprite-pet-pos-v4";
/** 访客选宠：default = 双 DeepSeek 路由；否则为 PickerPetId */
const PET_ID_STORAGE_KEY = "firefly-sprite-pet-id-v1";
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
		state: "waving",
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
		state: "waving",
	},
];

const IDLE_WAITING_MS = 45_000;
const READ_SCROLL_TRIGGER_MS = 2_400;
const SCENARIO_COOLDOWN_MS = 8_000;
/** 路由换皮淡入淡出时长（ms）；reduced-motion 时跳过 */
const SKIN_CROSSFADE_MS = 200;
const THEME_PULSE_MS = 420;

const CLICK_POOL_HEAD: PetAnimationState[] = ["waving", "waving", "review"];
const CLICK_POOL_BODY: PetAnimationState[] = ["review", "waiting", "waving"];
/** 脚部点击偏轻动作；跳只在「抓取」时播一次 */
const CLICK_POOL_FEET: PetAnimationState[] = ["running", "waving", "waiting"];

function isPostPath(pathname = window.location.pathname) {
	return /\/posts\//.test(pathname);
}

/** 文章页窄屏不拉 spritesheet（门在 petRendererGate；生命周期仍要绑） */
function livePetRendererContext() {
	return {
		hideOnMobilePost,
		pathname: window.location.pathname,
		viewportWidth: window.innerWidth,
		mobileBreakpoint,
	};
}

function shouldSkipPetRenderer() {
	return shouldSkipPetSheet(livePetRendererContext());
}

/** 文章页是否用「文档绝对坐标」钉页（否：始终 position:fixed 贴视口） */
function isPostViewportMode(pathname = window.location.pathname) {
	return isPostPath(pathname);
}

function readStoredPetSelection(): StoredPetSelection {
	if (typeof window === "undefined") return "default";
	try {
		const raw = localStorage.getItem(PET_ID_STORAGE_KEY);
		if (!raw || raw === "default") return "default";
		if (isPickerPetId(raw)) return raw;
	} catch {
		/* ignore */
	}
	return "default";
}

function resolveActivePetId(
	selection: StoredPetSelection,
	pathname = typeof window !== "undefined" ? window.location.pathname : "/",
): BuiltinPetId {
	// 文章页锁定 OpenPet：设置换皮只改浏览态，不盖文章宠
	if (isPostPath(pathname)) return postPetId;
	if (selection !== "default") return selection;
	return defaultPetId;
}

function initialPetId(): BuiltinPetId {
	return resolveActivePetId(readStoredPetSelection());
}

/** 访客覆盖：非 default 时仅浏览态换皮；文章页仍强制 postPetId */
let visitorSelection: StoredPetSelection = $state(
	typeof window === "undefined" ? "default" : readStoredPetSelection(),
);
/** Swup 换页时更新，供 isOverrideMode 等派生量跟随路由 */
let routePathname = $state(
	typeof window !== "undefined" ? window.location.pathname : "/",
);
const isOverrideMode = $derived(
	visitorSelection !== "default" && !isPostPath(routePathname),
);

let activePetId: BuiltinPetId = $state(initialPetId());

const pet = $derived(findBuiltinPet(activePetId));
const atlas = $derived(getAtlas(pet.atlasVariant));
/** 按宠尺寸覆盖；缺省用布局传入的全局 size */
const effectiveSize = $derived(pet.sizePx ?? size);
const height = $derived((effectiveSize * atlas.cellHeight) / atlas.cellWidth);
const atlasUrl = $derived(url(pet.spritesheetPath));
/** classic-8x9 无 look 行，强制关闭；覆盖模式也关（首批均为 v1） */
const effectiveLookFollow = $derived(
	lookFollow && !isOverrideMode && pet.atlasVariant === "v2",
);
/** 卡间停留：按宠覆盖；拖后恢复仍用 roam.resumeAfterDragMs */
const effectiveRoamIntervalMs = $derived(pet.roamIntervalMs ?? roam.intervalMs);
/** idle/ambient 变慢倍数；瞬态动作不乘 */
const effectiveIdlePace = $derived(
	pet.idlePaceMultiplier && pet.idlePaceMultiplier > 0
		? pet.idlePaceMultiplier
		: 1,
);

/** 浏览态可游走：默认模式下的 Maid，或访客覆盖皮 */
function canRoamOnBrowse(): boolean {
	if (isPostPath()) return false;
	if (isOverrideMode) return true;
	return activePetId === defaultPetId;
}

let rootEl: HTMLDivElement | undefined = $state();
let spriteEl: HTMLDivElement | undefined = $state();
let hidden = $state(false);
let prefersReducedMotion = $state(false);
/** 换皮交叉淡化用（仅 opacity，不动 background-position） */
let skinOpacity = $state(1);
/** 换皮代数：并发 Swup 钩子只让最新一次落地，避免 opacity 卡在 0 / 皮错乱 */
let skinSwapGen = 0;
let themePulse = $state(false);
let animationState: PetAnimationState = $state("idle");
let lookDirection: PetLookDirection | null | undefined = $state(undefined);
let posX = $state<number | null>(null);
let posY = $state<number | null>(null);
let dragging = $state(false);
/** card=锚定侧栏卡片外侧（仍挂 body + fixed，避免卡片 overflow 裁切）；free=页面绝对坐标 */
let dockMode = $state<"card" | "free">("free");
let dockCorner = $state<PetRoamCorner>("bottom-right");
/** 停靠时面朝内容：左留白朝右、右留白朝左 */
let dockFacing = $state<PetRoamFacing>("right");
let dockHost: HTMLElement | null = null;
/** 卡片锚定的视口坐标（fixed）；随滚动/resize 重算 */
let dockFixedX = $state(0);
let dockFixedY = $state(0);
/** 当前贴着的侧栏锚点（浏览态游走） */
let currentAnchorId: PetRoamAnchorId | null = null;
let roamTimer: ReturnType<typeof setTimeout> | null = null;
let scrollLeaveTimer: ReturnType<typeof setTimeout> | null = null;
let resumeAfterDragTimer: ReturnType<typeof setTimeout> | null = null;
let roamMoving = false;
let roamLoopActive = false;
/** 浏览页侧栏失衡：钉日历下并停游走（文章页不进） */
let balanceParkActive = false;
/** 本轮 5s 倒计时锁定的下一张卡；拖拽会作废，松开后 2s 再重新随机 */
let plannedRoamTargetId: PetRoamAnchorId | null = null;
/** 最近两个停靠点：避免宠物在相邻两张卡之间机械往返 */
let recentRoamAnchorIds: PetRoamAnchorId[] = [];
/** 钻洞/近距换位代数：滚动/定时并发时只让最后一次落地 */
let roamPortalGen = 0;

let playbackFrame: number | null = null;
let transientTimer: ReturnType<typeof setTimeout> | null = null;
let idleTimer: ReturnType<typeof setTimeout> | null = null;
let readScrollTimer: ReturnType<typeof setTimeout> | null = null;
/** 当前瞬态动作优先级；结束后清 null */
let activeScenarioPriority: PetScenarioPriority | null = null;
/** Tab 后台：停表，回前台再恢复 */
let pageVisible = true;
let navigationPaused = false;
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
/** 抓取瞬间正在播「跳一下」，未结束前不切成跑步帧 */
let grabJumping = false;
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
		return null;
	}

	const next = quantizePetLookDirection(deltaX, deltaY, 0);
	if (current === undefined) return next;
	if (current === null) return next;
	if (next === current) return current;

	const angle = ((Math.atan2(deltaX, -deltaY) * 180) / Math.PI + 360) % 360;
	if (angularDistanceDeg(angle, current) < 11.25 + LOOK_STICKINESS_DEG) {
		return current;
	}
	return next;
}

function applyGazeFrame(direction: PetLookDirection | null) {
	if (!spriteEl || !effectiveLookFollow) return;
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

function atlasBackgroundPosition(frame: PetAtlasFrame): string {
	return `${-frame.columnIndex * effectiveSize}px ${-frame.rowIndex * height}px`;
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
	if (playbackFrame !== null) {
		cancelAnimationFrame(playbackFrame);
		playbackFrame = null;
	}
}

function startPlayback(state: PetAnimationState) {
	stopPlayback();
	if (!spriteEl || !pageVisible || navigationPaused) return;

	if (state === "idle" && stickyLook !== undefined && effectiveLookFollow) {
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
	// 仅 idle 环境动作变慢；点击/拖拽等瞬态仍原速
	const pace = state === "idle" ? effectiveIdlePace : 1;
	let lastFrameKey = "";
	const tick = () => {
		if (!pageVisible) {
			stopPlayback();
			return;
		}
		const next = getPetAnimationPlaybackTickAtElapsedMs(
			state,
			Math.max(0, (performance.now() - startedAt) / pace),
		);
		const frameKey = `${next.frame.rowIndex}:${next.frame.columnIndex}:${next.motionState}:${next.phase}`;
		if (frameKey !== lastFrameKey) {
			lastFrameKey = frameKey;
			applyFrame(next.frame, next.motionState, next.phase);
		}
		playbackFrame = requestAnimationFrame(tick);
	};
	playbackFrame = requestAnimationFrame(tick);
}

function playTransient(
	state: PetAnimationState,
	loops = 3,
	onDone?: () => void,
	priority: PetScenarioPriority = "ui",
) {
	if (!pageVisible) return;
	if (!effectiveMotion && state !== "idle") return;
	if (!canPlayByPriority(activeScenarioPriority, priority)) return;
	if (transientTimer) clearTimeout(transientTimer);
	gazeActive = false;
	stickyLook = undefined;
	lookDirection = undefined;
	activeScenarioPriority = priority;
	animationState = state;
	transientTimer = setTimeout(() => {
		animationState = "idle";
		transientTimer = null;
		activeScenarioPriority = null;
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

function is404Page() {
	return Boolean(document.querySelector('[data-page="404"]'));
}

function updateHidden() {
	const narrow = window.innerWidth <= mobileBreakpoint;
	if (isPostPath()) {
		hidden = hideOnMobilePost && narrow;
	} else {
		hidden = hideOnMobileBrowse && narrow;
	}
	// 从隐藏恢复时务必可见（{#if !hidden} 重建节点时沿用旧 skinOpacity）
	if (!hidden && skinOpacity < 1) {
		skinOpacity = 1;
	}
	if (hidden || !canRoamOnBrowse()) {
		stopRoamLoop();
	} else if (!userPinnedPosition || !roam.pauseWhenPinned) {
		startRoamLoop();
	}
}

function waitMs(ms: number) {
	return new Promise<void>((resolve) => {
		setTimeout(resolve, ms);
	});
}

/** 按皮去重的预取表：同一 spritesheet 只发起一次请求（失败也 resolve，不阻塞换皮） */
const petSheetLoaders = new Map<BuiltinPetId, Promise<void>>();

function ensurePetSheetLoaded(petId: BuiltinPetId): Promise<void> {
	if (shouldSkipPetRenderer()) return Promise.resolve();
	const cached = petSheetLoaders.get(petId);
	if (cached) return cached;
	const sheet = findBuiltinPet(petId);
	const loading = new Promise<void>((resolve) => {
		const img = new Image();
		img.decoding = "async";
		img.onload = () => resolve();
		img.onerror = () => resolve();
		img.src = url(sheet.spritesheetPath);
	});
	petSheetLoaders.set(petId, loading);
	return loading;
}

/** 仅预取当前路由/场景实际使用的那一套；postPetId 等其余皮在换皮时按需加载 */
function preloadActivePetSheet(): Promise<void> {
	return ensurePetSheetLoaded(activePetId);
}

function clearTransientAndGaze() {
	stopPlayback();
	gazeActive = false;
	stickyLook = undefined;
	lookDirection = undefined;
	activeScenarioPriority = null;
	if (transientTimer) {
		clearTimeout(transientTimer);
		transientTimer = null;
	}
}

/**
 * 按路由（或访客覆盖）换皮；交叉淡化后切换 spritesheet。
 * 进文 / 回浏览带换班前导动作（running / waving），避免「突然换人」感。
 * 返回是否发生了切换（Promise，供 Swup 钩子 await）。
 */
async function syncPetFromPath(
	pathname = window.location.pathname,
): Promise<boolean> {
	const prevPath = routePathname;
	routePathname = pathname;
	const next = resolveActivePetId(visitorSelection, pathname);
	const swappingToPost =
		next !== activePetId && isPostPath(pathname) && !isPostPath(prevPath);
	const swappingFromPost =
		next !== activePetId && !isPostPath(pathname) && isPostPath(prevPath);

	updateHidden();
	if (isPostViewportMode(pathname)) {
		applyPostViewportLock(pathname);
	} else if (!canRoamOnBrowse()) {
		stopRoamLoop();
	}
	// 同皮也强制可见，避免上次淡出被并发打断后卡在 opacity:0
	if (next === activePetId) {
		skinOpacity = 1;
		return false;
	}

	// 按需预取目标皮：换皮一开始就发起请求（去重），淡出期间等它就绪，避免淡入闪空帧
	const sheetReady = ensurePetSheetLoaded(next);

	const gen = ++skinSwapGen;
	clearTransientAndGaze();

	const useFade = effectiveMotion && !prefersReducedMotion;

	// 换班前导：进文跑步离开，回浏览挥手告别
	if (useFade && effectiveMotion) {
		if (swappingToPost) {
			animationState = "running";
			activeScenarioPriority = "route";
			await waitMs(220);
			if (gen !== skinSwapGen) return false;
		} else if (swappingFromPost) {
			animationState = "waving";
			activeScenarioPriority = "route";
			await waitMs(280);
			if (gen !== skinSwapGen) return false;
		}
	}

	if (useFade) {
		skinOpacity = 0;
		await waitMs(SKIN_CROSSFADE_MS);
		if (gen !== skinSwapGen) return false;
	}

	await sheetReady;
	if (gen !== skinSwapGen) return false;

	activePetId = next;
	// 等一帧让 background-image / background-size 落地再淡入
	await waitMs(useFade ? 32 : 0);
	if (gen !== skinSwapGen) return false;

	skinOpacity = 1;
	if (useFade) {
		await waitMs(SKIN_CROSSFADE_MS);
	}
	activeScenarioPriority = null;
	return gen === skinSwapGen;
}

/** 设置面板改选后：更新覆盖态并换皮 */
async function applyVisitorSelection(next: StoredPetSelection) {
	visitorSelection = next;
	const swapped = await syncPetFromPath(window.location.pathname);
	if (isPostViewportMode()) {
		applyPostViewportLock();
	} else if (!userPinnedPosition) {
		scheduleBrowseDefaultPlacement();
		// 换宠后尺寸/轮询可能变：先停再开，避免仍用旧 interval
		stopRoamLoop();
		startRoamLoop();
	}
	if (swapped && effectiveMotion) {
		playTransient(isOverrideMode ? "waving" : "review", 2, undefined, "route");
	}
}

function pulseForThemeChange() {
	if (!effectiveMotion || prefersReducedMotion || hidden) return;
	themePulse = true;
	window.setTimeout(() => {
		themePulse = false;
	}, THEME_PULSE_MS);
}

function reactToRoute() {
	if (!reactToSiteUi || !effectiveMotion || hidden) return;
	if (is404Page()) {
		if (canTriggerScenario("404", 20_000)) {
			playTransient("failed", 4, undefined, "hard");
		}
		return;
	}
	const persona = getPetPagePersonaDef(window.location.pathname, false);
	if (canTriggerScenario(`persona-${persona.id}`, 8_000)) {
		playTransient(persona.onEnterAction, 2, undefined, "route");
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
			playTransient("waiting", 3, undefined, "ambient");
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
	// 双击也改为轻挥手，避免「到处在跳」
	if (isDouble) return "waving";
	const zone = resolveHitZone(clientY);
	if (zone === "head") return pick(CLICK_POOL_HEAD);
	if (zone === "feet") return pick(CLICK_POOL_FEET);
	return pick(CLICK_POOL_BODY);
}

/** 用户是否拖过（本会话或 v3 存储）；有则不再自动贴「最新动态」 */
let userPinnedPosition = false;

/** 设置面板「桌宠奔跑」开关（默认关=钉日历右下角，文档绝对坐标不随滚） */
let roamSwitchOn: boolean = getPetRoamEnabled();

function loadStoredPosition(): boolean {
	try {
		// 清掉旧 key，避免继续停在视口右下
		localStorage.removeItem("firefly-sprite-pet-pos-v3");
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return false;
		const parsed = JSON.parse(raw) as { x?: number; y?: number };
		if (
			typeof parsed.x === "number" &&
			typeof parsed.y === "number" &&
			Number.isFinite(parsed.x) &&
			Number.isFinite(parsed.y)
		) {
			if (isViewportCornerPark(parsed.x, parsed.y, effectiveSize, height)) {
				localStorage.removeItem(STORAGE_KEY);
				return false;
			}
			posX = parsed.x;
			posY = parsed.y;
			userPinnedPosition = true;
			return true;
		}
	} catch {
		/* ignore */
	}
	return false;
}

function persistPosition(x: number, y: number) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ x, y }));
		userPinnedPosition = true;
	} catch {
		/* ignore */
	}
}

function resolveDockHost(el: HTMLElement): HTMLElement {
	const layout = el.closest("widget-layout");
	return layout instanceof HTMLElement ? layout : el;
}

function clearDockHost() {
	if (dockHost) {
		dockHost.classList.remove("has-sprite-pet-anchor");
		dockHost = null;
	}
}

/**
 * 按锚点卡片算 fixed 落点：大半身子在页边留白，不被卡片 overflow 裁进框内。
 * 左栏 → 卡左侧外；右栏 → 卡右侧外。
 * 不夹进视口：卡片滚出窗口时宠跟着离开视野（再由 onScrollRoamCheck 换到可见卡）。
 */
function syncCardDockFixedPos() {
	if (dockMode !== "card" || !dockHost?.isConnected) return;
	if (typeof window === "undefined") return;
	const r = dockHost.getBoundingClientRect();
	const hang = Math.round(effectiveSize * 0.72);
	const sink = Math.round(height * 0.08);
	let x: number;
	const y = r.bottom - height + sink;
	if (dockCorner === "bottom-left") {
		// 左栏：身子主要在卡片左边的页边
		x = r.left - hang;
	} else {
		// 右栏：身子主要在卡片右边的页边
		x = r.right - effectiveSize + hang;
	}
	dockFixedX = Math.round(x);
	dockFixedY = Math.round(y);
}

/** 从卡片锚定卸下，按当前屏幕坐标挂回 body（拖拽 / 自由停靠用） */
function undockToBodyAtCurrentScreenPos() {
	if (!rootEl || typeof document === "undefined") return;
	const r = rootEl.getBoundingClientRect();
	posX = r.left;
	posY = r.top;
	clearDockHost();
	dockMode = "free";
	mountPetToBody(rootEl);
}

/**
 * 文章页：钉死在视口角落（配置 position / offset），不跟滚动、不贴侧栏、不游走。
 * 主页的卡片锚定与文档坐标逻辑一律不进这里。
 */
function applyPostViewportLock(pathname = window.location.pathname) {
	if (typeof window === "undefined" || !isPostViewportMode(pathname)) return;
	// 奔跑开关关（默认）：文章页不锁视口角，改钉日历右下（文档绝对坐标）
	if (!roamSwitchOn) {
		pinToCalendarStill();
		return;
	}
	stopRoamLoop();
	clearResumeAfterDragTimer();
	clearScrollLeaveTimer();
	clearDockHost();
	dockMode = "free";
	currentAnchorId = null;
	plannedRoamTargetId = null;
	// null → positionedStyle 走 defaultStyle（fixed + bottom/right）
	posX = null;
	posY = null;
	if (rootEl) mountPetToBody(rootEl);
}

/**
 * 锚定侧栏卡片外侧留白：宠物始终挂在 body + position:fixed，
 * 只记录宿主用于滚动态同步坐标（不再 append 进卡片，避免 overflow 裁成「钻进卡里」）。
 */
function dockToCard(
	host: HTMLElement,
	corner: PetRoamCorner,
	anchorId: PetRoamAnchorId,
	facing: PetRoamFacing = facingForCorner(corner),
) {
	if (!rootEl || typeof document === "undefined") return;
	// 文章页禁止贴卡片：只认视口固定位
	if (isPostViewportMode()) return;
	const mountEl = resolveDockHost(host);
	clearDockHost();
	mountEl.classList.add("has-sprite-pet-anchor");
	dockHost = mountEl;
	dockCorner = corner;
	dockFacing = facing;
	dockMode = "card";
	posX = null;
	posY = null;
	currentAnchorId = anchorId;
	recentRoamAnchorIds = [
		anchorId,
		...recentRoamAnchorIds.filter((id) => id !== anchorId),
	].slice(0, 2);
	mountPetToBody(rootEl);
	syncCardDockFixedPos();
}

/**
 * 浏览态无侧栏锚点时的兜底：视口角（position/offset），保证可见。
 * 避免 about/相册等页长期停在「无坐标」中间态。
 */
function parkAtBrowseFallback(wave = true) {
	if (userPinnedPosition || isPostPath() || hidden) return;
	clearDockHost();
	dockMode = "free";
	currentAnchorId = null;
	plannedRoamTargetId = null;
	posX = null;
	posY = null;
	skinOpacity = 1;
	if (rootEl) mountPetToBody(rootEl);
	if (wave && effectiveMotion && canTriggerScenario("fallback-park", 12_000)) {
		playTransient("waving", 2, undefined, "ambient");
	}
}

/**
 * 贴在侧栏「最新动态」卡片角（须在视口内）。
 * 失败则尝试任意可见侧栏卡角；再失败走视口角兜底。
 */
function placeNearDynamicsWidget(): boolean {
	const dynamics = findVisibleAnchorById("dynamics", effectiveSize, height);
	if (!dynamics) return false;
	dockToCard(dynamics.el, dynamics.corner, dynamics.id, dynamics.facing);
	skinOpacity = 1;
	return true;
}

function placeOnAnyVisibleAnchor(): boolean {
	const visible = listVisibleRoamAnchors(effectiveSize, height);
	const pick =
		visible.find((a) => a.id === "dynamics") ??
		chooseNextRoamAnchor(visible, null);
	if (!pick) return false;
	dockToCard(pick.el, pick.corner, pick.id, pick.facing);
	skinOpacity = 1;
	return true;
}

function chooseNextRoamAnchor(
	visible: readonly PetRoamResolvedAnchor[],
	currentId: PetRoamAnchorId | null,
): PetRoamResolvedAnchor | null {
	const origin = {
		x: dockMode === "card" ? dockFixedX : (posX ?? dockFixedX),
		y: dockMode === "card" ? dockFixedY : (posY ?? dockFixedY),
	};
	return pickNextRoamAnchor(visible, currentId, recentRoamAnchorIds, origin);
}

/** 浏览态默认落点：侧栏卡片角；找不到锚点时钉视口角兜底 */
function applyBrowseDefaultPlacement() {
	if (userPinnedPosition || isPostPath()) return;
	if (placeNearDynamicsWidget()) return;
	if (placeOnAnyVisibleAnchor()) return;
	parkAtBrowseFallback(true);
}

function scheduleBrowseDefaultPlacement() {
	if (userPinnedPosition || isPostPath()) return;
	if (!roamSwitchOn) {
		pinToCalendarStill();
		return;
	}
	const tryPlace = (isFinal: boolean) => {
		if (!roamSwitchOn) {
			pinToCalendarStill();
			return;
		}
		if (userPinnedPosition || isPostPath()) return;
		if (placeNearDynamicsWidget()) return;
		if (placeOnAnyVisibleAnchor()) return;
		if (isFinal) parkAtBrowseFallback(true);
	};
	requestAnimationFrame(() => tryPlace(false));
	window.setTimeout(() => tryPlace(false), 120);
	window.setTimeout(() => tryPlace(false), 360);
	window.setTimeout(() => tryPlace(false), 800);
	window.setTimeout(() => tryPlace(true), 1600);
}

function canRoamNow(): boolean {
	if (!roamSwitchOn) return false;
	if (!pageVisible) return false;
	if (!roam.enable || hidden) return false;
	if (!canRoamOnBrowse()) return false;
	if (balanceParkActive) return false;
	// /ask 等聊天页停靠不游走（避免盖住按钮吃点击）
	if (
		roam.disableOnPathPrefixes?.some((p) =>
			window.location.pathname.startsWith(p),
		)
	)
		return false;
	if (roam.pauseWhenPinned && userPinnedPosition) return false;
	if (dragging || roamMoving) return false;
	return true;
}

/**
 * 「奔跑开关关闭」的驻留形态：钉在日历右下角，文档绝对坐标（is-page-anchored）。
 * 不跟滚动：窗口上滑宠物随文档离场，滚回来还在原地。无可见日历则视口角兜底。
 */
function pinToCalendarStill() {
	if (typeof window === "undefined") return;
	if (hidden || dragging) return;
	stopRoamLoop();
	exitBalancePark();
	clearDockHost();
	dockMode = "free";
	currentAnchorId = null;
	plannedRoamTargetId = null;
	// 不经 findVisibleAnchorById 的可见性过滤：日历滚出视口也要钉在它的文档位置
	const cal =
		document.getElementById("calendar-widget") ??
		document.querySelector("widget-layout.calendar-notebook-widget");
	const cr = cal ? cal.getBoundingClientRect() : null;
	// rect 无效（未渲染/折叠）→ 视口角兜底，勿钉 (0,0)
	if (cal && cr && cr.width > 0 && cr.height > 0) {
		// 几何同 syncCardDockFixedPos 右下分支：大半身子挂卡右外，脚与卡底齐
		const r = cr;
		const hang = Math.round(effectiveSize * 0.72);
		const sink = Math.round(height * 0.08);
		const vx = r.right - effectiveSize + hang;
		const vy = r.bottom - height + sink;
		const page = viewportToPage(vx, vy);
		const clamped = clampToDocument(page.x, page.y);
		posX = Math.round(clamped.x);
		posY = Math.round(clamped.y);
		dockCorner = "bottom-right";
		dockFacing = "left";
		skinOpacity = 1;
		if (rootEl) mountPetToBody(rootEl);
		return;
	}
	parkAtBrowseFallback(false);
}

/** 失衡：强制贴日历并停 roam；无可见日历则视口右下兜底 */
function enterBalancePark() {
	if (!roamSwitchOn) return;
	if (typeof window === "undefined" || isPostPath()) return;
	balanceParkActive = true;
	stopRoamLoop();
	clearScrollLeaveTimer();
	clearPlannedRoamTarget();
	if (userPinnedPosition || hidden || dragging) return;
	const calendar = findVisibleAnchorById("calendar", effectiveSize, height);
	if (calendar) {
		dockToCard(calendar.el, calendar.corner, calendar.id, calendar.facing);
		skinOpacity = 1;
		return;
	}
	parkAtBrowseFallback(false);
}

function exitBalancePark() {
	if (!balanceParkActive) return;
	balanceParkActive = false;
	if (typeof window === "undefined" || isPostPath()) return;
	if (userPinnedPosition || hidden || dragging) return;
	startRoamLoop();
}

function clearScrollLeaveTimer() {
	if (scrollLeaveTimer) {
		clearTimeout(scrollLeaveTimer);
		scrollLeaveTimer = null;
	}
}

function clearResumeAfterDragTimer() {
	if (resumeAfterDragTimer) {
		clearTimeout(resumeAfterDragTimer);
		resumeAfterDragTimer = null;
	}
}

function clearPlannedRoamTarget() {
	plannedRoamTargetId = null;
}

function stopRoamLoop() {
	roamLoopActive = false;
	if (roamTimer) {
		clearTimeout(roamTimer);
		roamTimer = null;
	}
	clearScrollLeaveTimer();
	clearResumeAfterDragTimer();
	clearPlannedRoamTarget();
	roamPortalGen += 1;
	roamMoving = false;
	if (skinOpacity < 1) {
		skinOpacity = 1;
	}
}

/**
 * 用户松开拖拽后：作废原计划目标 → 2s 倒计时 → 在当前视口卡里重新随机落点。
 * 拖拽期间不计时；只有松开才开表。
 */
function scheduleResumeRoamAfterDrag() {
	if (!roamSwitchOn) return;
	if (!roam.enable || !canRoamOnBrowse() || hidden) return;
	if (roam.pauseWhenPinned) return;
	clearResumeAfterDragTimer();
	clearScrollLeaveTimer();
	clearPlannedRoamTarget();
	if (roamTimer) {
		clearTimeout(roamTimer);
		roamTimer = null;
	}
	roamLoopActive = false;

	const delay = Math.max(0, roam.resumeAfterDragMs ?? 2_000);
	resumeAfterDragTimer = setTimeout(() => {
		resumeAfterDragTimer = null;
		if (hidden || isPostPath() || dragging) return;
		userPinnedPosition = false;
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch {
			/* ignore */
		}
		// 失衡钉宠优先于拖后回游走
		if (balanceParkActive) {
			enterBalancePark();
			return;
		}
		void (async () => {
			const visible = listVisibleRoamAnchors(effectiveSize, height);
			// 拖后目标与原计划无关：按当前落点重算一条可读路径
			const target = chooseNextRoamAnchor(visible, null) ?? visible[0] ?? null;
			if (target) {
				await roamToAnchor(target, true);
			} else {
				parkAtBrowseFallback(true);
			}
			startRoamLoop();
		})();
	}, delay);
}

/** 正常换卡：按宠 interval；仅 jitterMs>0 时才抖动（默认 0） */
function nextRoamDelayMs(): number {
	const interval = effectiveRoamIntervalMs;
	const minInterval = pet.roamIntervalMs ?? roam.minIntervalMs;
	const base = Math.max(minInterval, interval);
	if (roam.jitterMs <= 0) return base;
	const jitter = Math.floor(Math.random() * roam.jitterMs);
	return Math.max(minInterval, interval + jitter - roam.jitterMs / 2);
}

/**
 * 钻洞换位：原地淡出（像钻进小洞）→ 挪到目标卡角 → 淡入并跑两步爬出。
 * 不再整屏插值闪现。
 * 伊蕾娜：portalMotionState 女巫形态；点点：facing 跑 + portalArrivalSequence 停→睡。
 */
async function portalToAnchor(target: PetRoamResolvedAnchor) {
	const gen = ++roamPortalGen;
	const fadeMs = Math.max(120, pet.portalFadeMs ?? roam.fadeMs ?? 380);
	const holdMs = Math.max(0, pet.portalHoldMs ?? roam.portalHoldMs ?? 160);
	const leadMs = Math.max(80, pet.portalLeadMs ?? Math.min(220, fadeMs));
	const exitMs = Math.max(80, pet.portalExitMs ?? fadeMs);
	const useFade = effectiveMotion && !prefersReducedMotion;
	const portalState = pet.portalMotionState;
	// 左栏卡 facing=right → 朝右跑；右栏卡 facing=left → 朝左跑
	const dirRun: PetAnimationState =
		target.facing === "right" ? "running-right" : "running-left";
	// 有落地序列且无固定 portal 形态时，进/出洞也用方向跑（点点）
	const leadState =
		portalState ?? (pet.portalArrivalSequence?.length ? dirRun : "running");
	const exitState = portalState ?? dirRun;

	roamMoving = true;
	gazeActive = false;
	stickyLook = undefined;
	lookDirection = undefined;
	stopPlayback();

	try {
		// 进洞：先播一小段跑（或按宠指定形态），再压透明
		if (useFade) {
			animationState = leadState;
			await waitMs(leadMs);
			if (gen !== roamPortalGen) return;
			skinOpacity = 0;
			await waitMs(fadeMs);
			if (gen !== roamPortalGen) return;
		}

		// 换挂到目标卡片外侧留白（随卡片走，不用视口坐标追滚动）
		dockToCard(target.el, target.corner, target.id, target.facing);

		if (useFade) {
			await waitMs(holdMs);
			if (gen !== roamPortalGen) return;
			// 出洞：透明拉回；有按宠形态则保持该形态，否则朝内容方向小跑
			animationState = exitState;
			skinOpacity = 1;
			await waitMs(exitMs);
			if (gen !== roamPortalGen) return;
		} else {
			skinOpacity = 1;
		}

		if (effectiveMotion) {
			const seq = pet.portalArrivalSequence;
			if (seq && seq.length > 0) {
				// 点点等：再跑 → 停 → 睡；跳过卡 arrivalAction
				playSequence(
					seq.map((step) => ({
						state: step.state === "facing-run" ? dirRun : step.state,
						loops: step.loops ?? 2,
					})),
				);
			} else if (
				portalState &&
				pet.portalArrivalLoops &&
				pet.portalArrivalLoops > 0
			) {
				// 落地再亮一会儿特殊形态，再回 idle
				playTransient(
					portalState,
					pet.portalArrivalLoops,
					undefined,
					"ambient",
				);
			} else {
				playTransient(target.arrivalAction, 1, undefined, "ambient");
			}
		} else {
			animationState = "idle";
		}
	} finally {
		if (gen === roamPortalGen) {
			roamMoving = false;
			if (skinOpacity < 1) skinOpacity = 1;
		}
	}
}

async function roamToAnchor(
	target: PetRoamResolvedAnchor,
	forcePortal = false,
) {
	if (!canRoamNow() && !roamMoving) return;
	if (forcePortal || prefersReducedMotion || !effectiveMotion) {
		await portalToAnchor(target);
		return;
	}

	const fromX = dockMode === "card" ? dockFixedX : (posX ?? dockFixedX);
	const fromY = dockMode === "card" ? dockFixedY : (posY ?? dockFixedY);
	const dist = Math.hypot(target.x - fromX, target.y - fromY);
	const nearMax = roam.nearMoveMaxPx ?? 420;
	const sameColumn =
		(dockFacing === "right" && target.facing === "right") ||
		(dockFacing === "left" && target.facing === "left") ||
		currentAnchorId == null;

	// 近距且同侧朝向（同栏）：小跑；跨栏 / 过远：钻洞
	if (dist <= nearMax && sameColumn) {
		await runToAnchor(target);
	} else {
		await portalToAnchor(target);
	}
}

/**
 * 近距小跑：视口坐标插值 + running-left/right，到达后播 arrivalAction。
 */
async function runToAnchor(target: PetRoamResolvedAnchor) {
	const gen = ++roamPortalGen;
	const moveMs = Math.max(280, roam.nearMoveMs ?? 520);
	const dirRun: PetAnimationState =
		target.facing === "right" ? "running-right" : "running-left";

	roamMoving = true;
	gazeActive = false;
	stickyLook = undefined;
	lookDirection = undefined;
	stopPlayback();
	animationState = dirRun;

	const startX = dockMode === "card" ? dockFixedX : (posX ?? target.x);
	const startY = dockMode === "card" ? dockFixedY : (posY ?? target.y);

	// 先卸成 free fixed，再插值，避免贴卡同步打架
	clearDockHost();
	dockMode = "free";
	posX = startX;
	posY = startY;
	if (rootEl) mountPetToBody(rootEl);

	const startedAt = performance.now();
	await new Promise<void>((resolve) => {
		const step = () => {
			if (gen !== roamPortalGen) {
				resolve();
				return;
			}
			const t = Math.min(1, (performance.now() - startedAt) / moveMs);
			// ease-out quad
			const e = 1 - (1 - t) * (1 - t);
			posX = Math.round(startX + (target.x - startX) * e);
			posY = Math.round(startY + (target.y - startY) * e);
			if (t < 1) {
				requestAnimationFrame(step);
			} else {
				resolve();
			}
		};
		requestAnimationFrame(step);
	});

	if (gen !== roamPortalGen) {
		roamMoving = false;
		return;
	}

	dockToCard(target.el, target.corner, target.id, target.facing);
	skinOpacity = 1;

	if (effectiveMotion) {
		const seq = pet.portalArrivalSequence;
		if (seq && seq.length > 0) {
			playSequence(
				seq.map((step) => ({
					state: step.state === "facing-run" ? dirRun : step.state,
					loops: step.loops ?? 2,
				})),
			);
		} else {
			playTransient(target.arrivalAction, 1, undefined, "ambient");
		}
	} else {
		animationState = "idle";
	}

	if (gen === roamPortalGen) {
		roamMoving = false;
	}
}

async function performRoamStep() {
	if (!canRoamNow()) return;
	const visible = listVisibleRoamAnchors(effectiveSize, height);
	if (visible.length === 0) {
		clearPlannedRoamTarget();
		parkAtBrowseFallback(false);
		return;
	}

	// currentAnchorId 为 null(自由/兜底落点,如奔跑开关切入)也视为可换卡
	const currentStillVisible =
		currentAnchorId == null || visible.some((a) => a.id === currentAnchorId);

	// 定时换卡：只在当前卡仍可见时主动换；滚丢的交给 scroll 延迟逻辑
	if (!currentStillVisible) {
		clearPlannedRoamTarget();
		return;
	}

	// 优先用开表时锁定的目标；若已滚出视口则当场另抽一张（仍排除当前卡）
	let target =
		(plannedRoamTargetId
			? (visible.find((a) => a.id === plannedRoamTargetId) ?? null)
			: null) ?? chooseNextRoamAnchor(visible, currentAnchorId);
	clearPlannedRoamTarget();
	if (!target || target.id === currentAnchorId) return;
	await roamToAnchor(target);
}

function scheduleNextRoam() {
	if (!roamLoopActive) return;
	if (roamTimer) clearTimeout(roamTimer);

	// 开表时锁定下一张卡（距离感知且避开近期落点）；拖拽会作废
	const visible = listVisibleRoamAnchors(effectiveSize, height);
	const planned = chooseNextRoamAnchor(visible, currentAnchorId);
	plannedRoamTargetId = planned?.id ?? null;

	roamTimer = setTimeout(() => {
		roamTimer = null;
		void (async () => {
			await performRoamStep();
			scheduleNextRoam();
		})();
	}, nextRoamDelayMs());
}

function startRoamLoop() {
	if (!roamSwitchOn) return;
	if (!roam.enable) return;
	if (balanceParkActive) return;
	if (roam.pauseWhenPinned && userPinnedPosition) return;
	if (!canRoamOnBrowse() || hidden) return;
	if (roamLoopActive) return;
	roamLoopActive = true;
	scheduleNextRoam();
}

/**
 * 滚动后当前卡滚出：先等几秒（用户可能还在滑），再钻洞挪到仍可见的卡。
 * 若中途又滚回原卡，取消这次换位。
 */
function onScrollRoamCheck() {
	if (!roamSwitchOn) return;
	if (!roam.enable || hidden || !canRoamOnBrowse()) return;
	if (balanceParkActive) return;
	if (roam.pauseWhenPinned && userPinnedPosition) return;
	if (roamMoving) return;

	const visible = listVisibleRoamAnchors(effectiveSize, height);
	const ok =
		currentAnchorId != null && visible.some((a) => a.id === currentAnchorId);

	if (ok) {
		clearScrollLeaveTimer();
		return;
	}
	if (visible.length === 0) {
		clearScrollLeaveTimer();
		parkAtBrowseFallback(false);
		return;
	}

	if (scrollLeaveTimer) return;
	const delay = Math.max(800, roam.scrollLeaveDelayMs ?? 2_400);
	scrollLeaveTimer = setTimeout(() => {
		scrollLeaveTimer = null;
		if (!canRoamNow()) return;
		const still = listVisibleRoamAnchors(effectiveSize, height);
		if (still.length === 0) {
			parkAtBrowseFallback(false);
			return;
		}
		if (
			currentAnchorId != null &&
			still.some((a) => a.id === currentAnchorId)
		) {
			return;
		}
		const target = chooseNextRoamAnchor(still, null) ?? still[0];
		// 滚出换卡：目标不可预测，强制钻洞
		if (target) void roamToAnchor(target, true);
	}, delay);
}

function scrollOffset(): { x: number; y: number } {
	if (typeof window === "undefined") return { x: 0, y: 0 };
	return {
		x: window.scrollX || document.documentElement.scrollLeft || 0,
		y: window.scrollY || document.documentElement.scrollTop || 0,
	};
}

/** 视口坐标 → 文档坐标（拖放后钉在页面上，不跟窗口滚） */
function viewportToPage(x: number, y: number): { x: number; y: number } {
	const s = scrollOffset();
	return { x: x + s.x, y: y + s.y };
}

function clampToViewport(x: number, y: number): { x: number; y: number } {
	if (typeof window === "undefined") return { x, y };
	const maxX = Math.max(0, window.innerWidth - effectiveSize);
	const maxY = Math.max(0, window.innerHeight - height);
	return {
		x: Math.min(maxX, Math.max(0, x)),
		y: Math.min(maxY, Math.max(0, y)),
	};
}

function clampToDocument(x: number, y: number): { x: number; y: number } {
	if (typeof document === "undefined") return { x, y };
	const maxX = Math.max(
		0,
		document.documentElement.scrollWidth - effectiveSize,
	);
	const maxY = Math.max(0, document.documentElement.scrollHeight - height);
	return {
		x: Math.min(maxX, Math.max(0, x)),
		y: Math.min(maxY, Math.max(0, y)),
	};
}

function defaultStyle(): string {
	const onPost = typeof window !== "undefined" && isPostPath();
	const ox = onPost ? (postOffsetX ?? offsetX) : offsetX;
	const oy = onPost ? (postOffsetY ?? offsetY) : offsetY;
	const side =
		position === "bottom-right"
			? `right:${ox}px;left:auto;`
			: `left:${ox}px;right:auto;`;
	return `${side}bottom:${oy}px;top:auto;`;
}

function positionedStyle(): string {
	// 定位走 transform（translate3d 合成层）：CLS 免计分 + 漫游更顺。
	// 根元素基点固定 left:0/top:0，posX/posY 语义与原 left/top 完全一致
	if (dockMode === "card") {
		// fixed 视口坐标：由 syncCardDockFixedPos 跟卡片走
		return `left:0;top:0;right:auto;bottom:auto;transform:translate3d(${dockFixedX}px, ${dockFixedY}px, 0);`;
	}
	if (posX === null || posY === null) return defaultStyle();
	return `left:0;top:0;right:auto;bottom:auto;transform:translate3d(${posX}px, ${posY}px, 0);`;
}

function flushPendingLook() {
	lookRaf = 0;
	const pending = pendingLook;
	pendingLook = null;
	if (!pending || !rootEl) return;
	if (
		!effectiveLookFollow ||
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
		!effectiveLookFollow ||
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

	grabJumping = false;

	if (!wasDrag) {
		if (animationState === "idle") startPlayback("idle");
		return;
	}

	suppressClick = true;
	setTimeout(() => {
		suppressClick = false;
	}, 0);

	const dx = clientX - origin.startClientX;
	const dy = clientY - origin.startClientY;
	const screen = clampToViewport(origin.originLeft + dx, origin.originTop + dy);
	dockMode = "free";
	currentAnchorId = null;
	animationState = "idle";

	// 文章页：松手弹回配置定格位（不跟手停在浮动钮上）
	if (isPostViewportMode()) {
		userPinnedPosition = false;
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch {
			/* ignore */
		}
		applyPostViewportLock();
		return;
	}

	// 主页：松手换成文档坐标，滚动窗口时停在原落点
	const rawPage = viewportToPage(screen.x, screen.y);
	const page = clampToDocument(rawPage.x, rawPage.y);
	posX = page.x;
	posY = page.y;
	userPinnedPosition = false;
	// 拖拽只临时改坐标，不永久钉死；松开后开快速倒计时再回卡片游走
	if (roam.pauseWhenPinned) {
		persistPosition(posX, posY);
		userPinnedPosition = true;
	} else {
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch {
			/* ignore */
		}
		scheduleResumeRoamAfterDrag();
	}
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
		// 一开始拖就改成视口 fixed 跟手：卡片卸下 / 页面绝对坐标也切回屏幕坐标
		if (dockMode === "card") {
			undockToBodyAtCurrentScreenPos();
			dragStart.originLeft = posX ?? dragStart.originLeft;
			dragStart.originTop = posY ?? dragStart.originTop;
		} else if (dockMode === "free" && rootEl) {
			const r = rootEl.getBoundingClientRect();
			posX = r.left;
			posY = r.top;
			dragStart.originLeft = r.left;
			dragStart.originTop = r.top;
		}
		stopRoamLoop();
		gazeActive = false;
		stickyLook = undefined;
		lookDirection = undefined;
		// 抓起来：只跳一下（单轮），不循环
		grabJumping = true;
		playTransient("jumping", 1, () => {
			grabJumping = false;
			// 若仍在拖，接上跑步；避免 playTransient 收尾强制 idle 闪一下
			if (dragging && dragStart) {
				animationState =
					dragStart.facing === "right" ? "running-left" : "running-right";
			}
		});
	}

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
	// 抓取跳跃播完前保持跳帧；之后才跟拖拽方向小跑
	if (grabJumping) return;
	animationState =
		dragStart.facing === "right" ? "running-left" : "running-right";
}

function onWindowPointerUp(event: PointerEvent) {
	finishDrag(event.pointerId, event.clientX, event.clientY);
}

function onPointerDown(event: PointerEvent) {
	if (!draggable || event.button !== 0 || !rootEl) return;
	if (!(event.currentTarget instanceof HTMLElement)) return;

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
	// 连点两下：暗色萤火虫 / 亮色蝴蝶（E04/E05），不钉住常驻
	if (isDouble) {
		triggerPetYzhanByTheme();
	}
}

function onSitePointerDown(event: Event) {
	if (!reactToSiteUi || !effectiveMotion || hidden) return;
	const target = event.target;
	if (!(target instanceof Element)) return;
	if (rootEl?.contains(target)) return;
	// 留言卡竹蝉岛激活时不抢站点 UI 反应，避免与画圈手势打架
	if (
		document.documentElement.dataset.cicadaActive === "1" ||
		target.closest("[data-guestbook-cicada]")
	) {
		return;
	}
	resetIdleTimer();

	if (target.closest("#scheme-switch")) {
		pulseForThemeChange();
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
			if (canTriggerScenario(`ui-${rule.state}`, 4_000)) {
				playTransient(rule.state, 3, undefined, "ui");
			}
			return;
		}
	}
}

// 不读取 lookDirection，避免转头触发整段动画重启
$effect(() => {
	void animationState;
	void effectiveMotion;
	void effectiveSize;
	void height;
	void activePetId;
	void atlasUrl;
	if (
		animationState === "idle" &&
		gazeActive &&
		stickyLook !== undefined &&
		effectiveLookFollow
	) {
		applyGazeFrame(stickyLook);
		return;
	}
	startPlayback(animationState);
});

// hidden 切换后根节点会重建：始终挂 body（卡片模式只同步 fixed 坐标）
$effect(() => {
	if (!rootEl || typeof document === "undefined") return;
	mountPetToBody(rootEl);
	if (dockMode === "card") {
		syncCardDockFixedPos();
	}
});

/** 挂到 body（自由拖拽 / 文章页 / 回退） */
function mountPetToBody(el: HTMLElement | null) {
	if (!el || typeof document === "undefined") return;
	if (el.parentElement !== document.body) {
		document.body.appendChild(el);
	}
}

onMount(() => {
	updateHidden();

	const bootRenderer = () => {
		// skip 恢复时先把皮同步对齐当前路由（同步赋值、无换班动画）：模板一渲染
		// 就是正确的 spritesheet URL，避免先拉默认皮、换皮再拉文章皮的双重下载
		activePetId = resolveActivePetId(
			visitorSelection,
			window.location.pathname,
		);
		routePathname = window.location.pathname;
		void preloadActivePetSheet();
		void syncPetFromPath();
		const hadStored = loadStoredPosition();
		if (isPostViewportMode()) {
			applyPostViewportLock();
		} else if (!hadStored) {
			applyBrowseDefaultPlacement();
			scheduleBrowseDefaultPlacement();
		}
		mountPetToBody(rootEl);
		if (effectiveMotion) {
			playTransient(
				"waving",
				2,
				() => {
					setTimeout(() => reactToRoute(), 120);
				},
				"route",
			);
		} else {
			reactToRoute();
		}
		resetIdleTimer();
		if (canRoamOnBrowse() && !userPinnedPosition && !balanceParkActive) {
			startRoamLoop();
		}
		// 奔跑开关关闭（默认）：覆盖默认停靠，钉日历右下角（文档绝对坐标）。
		// 延到入场动画结束再取日历矩形，否则钉到动画中的偏移位上。
		if (!roamSwitchOn) {
			window.setTimeout(() => {
				if (!roamSwitchOn) pinToCalendarStill();
			}, 1100);
		}
	};

	const rendererGate = createPetRendererGate(bootRenderer);
	const applyRendererGate = () =>
		rendererGate.evaluate(livePetRendererContext());

	// 先读 reduced-motion 再放行首启，避免 waving 前导读到未初始化的默认值
	const media = window.matchMedia(REDUCED_MOTION_QUERY);
	prefersReducedMotion = media.matches;
	const onMotion = (e: MediaQueryListEvent) => {
		prefersReducedMotion = e.matches;
	};
	media.addEventListener("change", onMotion);
	applyRendererGate();

	// 亮暗色切换：监听 html.dark，滤镜由 CSS 过渡，再给一次轻脉冲
	let lastDark = document.documentElement.classList.contains("dark");
	const themeObserver = new MutationObserver(() => {
		const nextDark = document.documentElement.classList.contains("dark");
		if (nextDark === lastDark) return;
		lastDark = nextDark;
		pulseForThemeChange();
	});
	themeObserver.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["class"],
	});

	const systemScheme = window.matchMedia("(prefers-color-scheme: dark)");
	const onSystemScheme = () => {
		// system 主题模式下 localStorage 可能仍是 system，html.dark 会变
		const nowDark = document.documentElement.classList.contains("dark");
		if (nowDark !== lastDark) {
			lastDark = nowDark;
			pulseForThemeChange();
		}
	};
	systemScheme.addEventListener("change", onSystemScheme);

	const onResize = () => {
		updateHidden();
		applyRendererGate();
		if (dockMode === "free" && !dragging && posX !== null && posY !== null) {
			if (isPostViewportMode()) {
				// 文章页是视口坐标：按窗口夹紧
				const clamped = clampToViewport(posX, posY);
				posX = clamped.x;
				posY = clamped.y;
			} else {
				// 主页 free=文档坐标：只夹在页面范围内，勿按视口重算
				const clamped = clampToDocument(posX, posY);
				posX = clamped.x;
				posY = clamped.y;
			}
		}
		if (dockMode === "card") {
			syncCardDockFixedPos();
		}
		if (balanceParkActive && !isPostPath()) {
			enterBalancePark();
			return;
		}
		if (!roamSwitchOn) {
			// 奔跑开关关：resize 不改钉日历驻留
			if (!userPinnedPosition && !isPostPath() && dockMode === "free") {
				pinToCalendarStill();
			}
			return;
		}
		if (!userPinnedPosition && !isPostPath() && dockMode !== "card") {
			if (placeNearDynamicsWidget()) {
				startRoamLoop();
				return;
			}
			if (!placeOnAnyVisibleAnchor()) {
				parkAtBrowseFallback(false);
			}
		}
		if (!hidden && !isPostPath()) startRoamLoop();
		else stopRoamLoop();
	};
	window.addEventListener("resize", onResize);

	document.addEventListener("pointerdown", onSitePointerDown, true);

	const onUserActivity = () => resetIdleTimer();
	window.addEventListener("keydown", onUserActivity);
	window.addEventListener("pointermove", onUserActivity, { passive: true });

	const onScroll = () => {
		resetIdleTimer();
		if (dockMode === "card") {
			syncCardDockFixedPos();
		}
		onScrollRoamCheck();
		if (!reactToSiteUi || !effectiveMotion || !isPostPath() || hidden) {
			return;
		}
		if (readScrollTimer) return;
		readScrollTimer = setTimeout(() => {
			readScrollTimer = null;
			if (!isPostPath() || hidden || !pageVisible) return;
			const doc = document.documentElement;
			const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
			const progress = window.scrollY / maxScroll;
			const mood = resolvePostReadMood(progress);
			if (!mood) return;
			const key =
				mood === "waving"
					? "read-start"
					: mood === "waiting"
						? "read-end"
						: "read-mid";
			if (canTriggerScenario(key, 14_000)) {
				playTransient(mood, 2, undefined, "ambient");
			}
		}, READ_SCROLL_TRIGGER_MS);
	};
	window.addEventListener("scroll", onScroll, { passive: true });

	type SwupLike = {
		hooks?: {
			on: (event: string, cb: () => void) => void;
			off?: (event: string, cb: () => void) => void;
		};
	};
	const win = window as Window & { swup?: SwupLike };
	const onSwupArrive = () => {
		updateHidden();
		applyRendererGate();
		if (shouldSkipPetRenderer()) return;
		observeFooter();
		void (async () => {
			await waitMs(80);
			// 以钩子触发时的 pathname 为准，避免 await 期间又切页读到过期路径
			const pathAtStart = window.location.pathname;
			const swapped = await syncPetFromPath(pathAtStart);
			if (window.location.pathname !== pathAtStart) return;
			if (!roamSwitchOn) {
				// 奔跑开关关：换页后（含文章页）仍钉日历右下角
				pinToCalendarStill();
			} else if (isPostViewportMode()) {
				// syncPetFromPath 已钉视口；这里只保证游走关掉
				balanceParkActive = false;
				stopRoamLoop();
			} else if (balanceParkActive) {
				enterBalancePark();
			} else if (!userPinnedPosition) {
				scheduleBrowseDefaultPlacement();
				startRoamLoop();
			}
			// 换班完成后再播 persona，避免抢动画
			const persona = getPetPagePersonaDef(pathAtStart, is404Page());
			if (swapped) {
				if (canTriggerScenario(`shift-${persona.id}`, 10_000)) {
					playTransient(
						persona.onEnterAction,
						isPostPath(pathAtStart) ? 3 : 2,
						undefined,
						"route",
					);
				} else {
					animationState = "idle";
				}
			} else {
				// 同皮也可能刚从 opacity:0 拉回；补一次可见性
				skinOpacity = 1;
				reactToRoute();
			}
		})();
	};
	const bindSwup = () => {
		// 只绑 page:view：再绑 content:replace 会同一趟导航跑两次换皮，易把 opacity 卡死
		win.swup?.hooks?.on("page:view", onSwupArrive);
	};
	bindSwup();
	document.addEventListener("swup:enable", bindSwup);

	const onNavigationPriority = (event: Event) => {
		const active = Boolean(
			(event as CustomEvent<{ active?: boolean }>).detail?.active,
		);
		navigationPaused = active;
		if (active) {
			stopPlayback();
			stopRoamLoop();
			if (transientTimer) {
				clearTimeout(transientTimer);
				transientTimer = null;
			}
			return;
		}
		if (!pageVisible || hidden) return;
		animationState = "idle";
		startPlayback("idle");
		if (canRoamOnBrowse() && !userPinnedPosition && !balanceParkActive) {
			startRoamLoop();
		}
	};
	window.addEventListener("firefly:navigation-priority", onNavigationPriority);

	let footerObserver: IntersectionObserver | null = null;
	const observeFooter = () => {
		footerObserver?.disconnect();
		const footer = document.querySelector(".footer");
		if (!footer || typeof IntersectionObserver === "undefined") return;
		footerObserver = new IntersectionObserver(
			(entries) => {
				if (!entries.some((entry) => entry.isIntersecting)) return;
				if (canTriggerScenario("footer", 20_000)) {
					playTransient("waving", 3, undefined, "ambient");
				}
			},
			{ threshold: 0.35 },
		);
		footerObserver.observe(footer);
	};
	observeFooter();

	const onBgPlayer = (event: Event) => {
		const detail = (event as CustomEvent<{ playing?: boolean }>).detail;
		if (!detail?.playing) return;
		if (canTriggerScenario("bg-player", 10_000)) {
			playTransient("jumping", 3, undefined, "ambient");
		}
	};
	window.addEventListener("bg-player-state-change", onBgPlayer);

	const onPetScenario = (event: Event) => {
		const detail = (event as CustomEvent<{ scenario?: string }>).detail;
		if (!detail?.scenario || !reactToSiteUi || !effectiveMotion) return;
		switch (detail.scenario) {
			case "search-empty":
				if (canTriggerScenario("search-empty", 8_000)) {
					playTransient("failed", 3, undefined, "hard");
				}
				break;
			case "copy-fail":
			case "form-fail":
				if (canTriggerScenario("fail", 6_000)) {
					playTransient("failed", 3, undefined, "hard");
				}
				break;
			case "like":
			case "comment-ok":
				if (canTriggerScenario("celebrate", 6_000)) {
					playTransient("jumping", 3, undefined, "ui");
				}
				break;
			default:
				break;
		}
	};
	window.addEventListener("firefly:pet-scenario", onPetScenario);

	const onPetChange = (event: Event) => {
		const detail = (event as CustomEvent<{ petId?: string }>).detail;
		const raw = detail?.petId;
		if (!raw) return;
		const next: StoredPetSelection =
			raw === "default" ? "default" : isPickerPetId(raw) ? raw : "default";
		void applyVisitorSelection(next);
	};
	window.addEventListener("firefly:pet-change", onPetChange);

	const onInvalid = () => {
		if (canTriggerScenario("form-fail", 6_000)) {
			playTransient("failed", 3, undefined, "hard");
		}
	};
	document.addEventListener("invalid", onInvalid, true);

	const onVisibility = () => {
		pageVisible = document.visibilityState === "visible";
		if (!pageVisible) {
			stopPlayback();
			stopRoamLoop();
			if (idleTimer) {
				clearTimeout(idleTimer);
				idleTimer = null;
			}
			if (readScrollTimer) {
				clearTimeout(readScrollTimer);
				readScrollTimer = null;
			}
			return;
		}
		// 回前台：恢复 idle 与浏览态游走
		skinOpacity = 1;
		if (effectiveMotion) {
			startPlayback("idle");
		}
		resetIdleTimer();
		if (
			canRoamOnBrowse() &&
			!userPinnedPosition &&
			!hidden &&
			!balanceParkActive
		) {
			startRoamLoop();
		} else if (balanceParkActive && !isPostPath()) {
			enterBalancePark();
		}
	};
	document.addEventListener("visibilitychange", onVisibility);

	const onSidebarImbalance = () => {
		if (isPostPath()) return;
		enterBalancePark();
	};
	const onSidebarBalance = () => {
		if (isPostPath()) {
			balanceParkActive = false;
			return;
		}
		exitBalancePark();
	};
	document.addEventListener(SIDEBAR_IMBALANCE_EVENT, onSidebarImbalance);
	document.addEventListener(SIDEBAR_BALANCE_EVENT, onSidebarBalance);
	// 奔跑开关（设置面板实时切换）：关=钉日历右下角；开=回 roam 游走
	const onPetRoamToggle = (e: Event) => {
		const enabled =
			(e as CustomEvent<{ enabled?: boolean }>).detail?.enabled ?? false;
		roamSwitchOn = enabled;
		if (enabled) {
			if (isPostPath()) {
				applyPostViewportLock();
			} else if (balanceParkActive) {
				exitBalancePark();
			} else if (!userPinnedPosition && !hidden && canRoamOnBrowse()) {
				startRoamLoop();
			}
		} else {
			pinToCalendarStill();
		}
	};
	window.addEventListener("firefly:pet-roam-toggle", onPetRoamToggle);
	// 晚挂载：对齐当前失衡态（html class 由 boot 维护）
	if (
		!isPostPath() &&
		document.documentElement.classList.contains("sidebar-imbalanced")
	) {
		enterBalancePark();
	}

	return () => {
		stopRoamLoop();
		media.removeEventListener("change", onMotion);
		themeObserver.disconnect();
		systemScheme.removeEventListener("change", onSystemScheme);
		window.removeEventListener("resize", onResize);
		document.removeEventListener("pointerdown", onSitePointerDown, true);
		window.removeEventListener("keydown", onUserActivity);
		window.removeEventListener("pointermove", onUserActivity);
		window.removeEventListener("scroll", onScroll);
		document.removeEventListener("swup:enable", bindSwup);
		win.swup?.hooks?.off?.("page:view", onSwupArrive);
		window.removeEventListener(
			"firefly:navigation-priority",
			onNavigationPriority,
		);
		window.removeEventListener("bg-player-state-change", onBgPlayer);
		window.removeEventListener("firefly:pet-scenario", onPetScenario);
		window.removeEventListener("firefly:pet-change", onPetChange);
		document.removeEventListener("invalid", onInvalid, true);
		document.removeEventListener("visibilitychange", onVisibility);
		document.removeEventListener(SIDEBAR_IMBALANCE_EVENT, onSidebarImbalance);
		document.removeEventListener(SIDEBAR_BALANCE_EVENT, onSidebarBalance);
		window.removeEventListener("firefly:pet-roam-toggle", onPetRoamToggle);
		footerObserver?.disconnect();
		if (idleTimer) clearTimeout(idleTimer);
		if (readScrollTimer) clearTimeout(readScrollTimer);
	};
});

onDestroy(() => {
	stopRoamLoop();
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
		class:is-card-docked={dockMode === "card"}
		class:is-page-anchored={
			dockMode === "free" &&
			!dragging &&
			posX !== null &&
			posY !== null
		}
		class:is-post-viewport={isPostViewportMode() && dockMode !== "free"}
		class:is-face-left={dockMode === "card" && dockFacing === "left" && !animationState.startsWith("running")}
		class:is-dragging={dragging}
		class:is-theme-pulse={themePulse}
		style={`z-index:${zIndex};${positionedStyle()}`}
		data-swup-permanent
		data-pet-id={pet.id}
		data-pet-atlas={pet.atlasVariant}
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
				style={`width:${effectiveSize}px;height:${height}px;opacity:${skinOpacity};`}
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
						width:${effectiveSize}px;
						height:${height}px;
						background-image:url(${JSON.stringify(atlasUrl)});
						background-repeat:no-repeat;
						background-size:${effectiveSize * atlas.columns}px ${height * atlas.rows}px;
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
		/* 亮色：偏冷紫阴影，贴合壳层中性灰 + 紫点缀 */
		--pet-shadow: drop-shadow(0 8px 14px rgba(45, 36, 72, 0.16))
			drop-shadow(0 2px 4px rgba(45, 36, 72, 0.08));
		--pet-grade: brightness(1.02) contrast(1.03) saturate(1.02);
	}

	/* 卡片锚定：仍用 fixed（坐标由 JS 同步），勿改 absolute 挂进卡片（会被 overflow 裁进框内） */
	.sprite-pet-root.is-card-docked {
		position: fixed;
		z-index: 1100;
	}

	/* 文章页：强制贴视口，避免被 is-page-anchored 的 absolute 带走 */
	.sprite-pet-root.is-post-viewport {
		position: fixed;
	}

	/* 拖放到页面某处：文档绝对坐标，滚动窗口时留在原落点，不贴视口跟着跑 */
	.sprite-pet-root.is-page-anchored {
		position: absolute;
	}

	:global(widget-layout.has-sprite-pet-anchor),
	:global(.has-sprite-pet-anchor) {
		position: relative !important;
		/* 桌宠本身挂在 body + fixed，不需要强制 widget 溢出可见；
		   保留 overflow visible 会让卡片圆角内容外溢，视觉上「范围被撑大」。 */
	}

	:global(widget-layout.has-sprite-pet-anchor .collapse-wrapper) {
		overflow: visible !important;
	}

	:global(html.dark) .sprite-pet-root {
		/* 暗色：加深投影 + 略提亮，避免 Q 版角色发闷 */
		--pet-shadow: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.48))
			drop-shadow(0 0 10px rgba(94, 184, 255, 0.12));
		--pet-grade: brightness(1.08) contrast(1.05) saturate(1.06);
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
		/* 按 spritesheet 单元格 192×208 锁定宽高比，防止外部布局挤压变形 */
		aspect-ratio: 192 / 208;
		transform: scale(1.1);
		transform-origin: 50% 88%;
		/* 仅 opacity 过渡：换皮丝滑；勿过渡 background-position */
		transition: opacity 200ms ease;
	}

	/* 右留白停靠：镜像朝左看向内容（idle 默认偏右脸；跑左右有专用帧不翻） */
	.sprite-pet-root.is-face-left .pet-sprite-stage {
		transform: scale(-1.1, 1.1);
	}

	.pet-sprite {
		position: relative;
		z-index: 1;
		/* 与 stage 同比例，防止容器被压窄/拉宽时角色变形 */
		aspect-ratio: 192 / 208;
		transform-origin: 50% 88%;
		filter: var(--pet-shadow) var(--pet-grade);
		/* filter 可跟主题走；禁止 background-position 过渡防残影 */
		transition:
			filter 280ms ease,
			opacity 200ms ease;
		will-change: filter, opacity;
	}

	.sprite-pet-root.is-theme-pulse .pet-sprite-stage {
		animation: pet-theme-settle 420ms ease;
	}

	.sprite-pet-root.is-face-left.is-theme-pulse .pet-sprite-stage {
		animation: pet-theme-settle-face-left 420ms ease;
	}

	@keyframes pet-theme-settle {
		0% {
			opacity: 0.78;
			transform: scale(1.04);
		}
		55% {
			opacity: 1;
			transform: scale(1.12);
		}
		100% {
			opacity: 1;
			transform: scale(1.1);
		}
	}

	@keyframes pet-theme-settle-face-left {
		0% {
			opacity: 0.78;
			transform: scale(-1.04, 1.04);
		}
		55% {
			opacity: 1;
			transform: scale(-1.12, 1.12);
		}
		100% {
			opacity: 1;
			transform: scale(-1.1, 1.1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.pet-sprite-stage,
		.pet-sprite {
			transition: none;
		}

		.sprite-pet-root.is-theme-pulse .pet-sprite-stage {
			animation: none;
		}
	}
</style>
