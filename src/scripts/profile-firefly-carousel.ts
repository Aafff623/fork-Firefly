/**
 * 侧栏头像 ↔ Firefly Bot 宏切 + 六桶巡演。
 * 引擎：public/vendor/firefly-bot（自研外壳，特效行为复刻原 grok replica）。
 */

import { FFLY_CAROUSEL_TIMING as TIMING } from "./profile-firefly-timing";

type FflyOverlay = { x: number };

type FflyBot = {
	destroy: () => void;
	setMode: (mode: string) => void;
	setPaused: (v: boolean) => void;
	setEmphasis: (v: boolean) => void;
	setFollowPointer: (v: boolean) => void;
	setState: (name: string, opts?: { resetEyes?: boolean }) => void;
	setShape: (name: string) => void;
	bounceOnce: () => void;
	spinOnce: (turns?: number) => void;
	burstOnce: () => void;
	snapshot: () => { state?: string; overlay?: string | null };
	shapeName: string;
	state: string;
	trick: { kind?: string } | null;
	trickAt: number;
	celebrateAt: number;
	hopAt: number;
	spinTurn: { t: number; x: number; v: number } | null;
	wildWide: boolean;
	overlay: FflyOverlay;
	particles?: { clear?: () => void };
	ctx: { wantPn: unknown };
};

type FflyCtor = new (
	svg: SVGSVGElement,
	opts: Record<string, unknown>,
) => FflyBot;

type Face = "avatar" | "bot";

type Variant = {
	state: string;
	emphasis?: boolean;
	trick?: string;
	noWild?: boolean;
};

type Bucket = {
	id: string;
	label: string;
	short?: boolean;
	variants: Variant[];
};

type Session = {
	stage: HTMLElement;
	shell: HTMLElement;
	svg: SVGSVGElement;
	faceAvatar: HTMLElement;
	faceBot: HTMLElement;
	face: Face;
	engineOk: boolean;
	hover: boolean;
	leaveTimer: number;
	bot: FflyBot | null;
	bucket: number;
	variant: number;
	trick: string;
	switches: number;
	clickI: number;
	bucketDue: number;
	variantDue: number;
	macroDue: number;
	greetUntil: number;
	busy: boolean;
	raf: number;
	dead: boolean;
	ac: AbortController;
	mottoLast: number;
	mottoMo: MutationObserver | null;
};

const ENGINE_SCRIPTS = [
	"/vendor/firefly-bot/geometry-data.js",
	"/vendor/firefly-bot/src/math.js",
	"/vendor/firefly-bot/src/tables.js",
	"/vendor/firefly-bot/src/pose.js",
	"/vendor/firefly-bot/src/tricks.js",
	"/vendor/firefly-bot/src/fx.js",
	"/vendor/firefly-bot/src/eyes.js",
	"/vendor/firefly-bot/src/character.js",
] as const;

// ADR-0005 圆润族巡演：正圆 blob 加权（重复占位），偶尔切鹅卵石/卵形/圆角六边形。
const SHAPES = ["blob", "blob", "pebble", "egg", "hex"];

const LEAVE_MS = TIMING.leaveMs;
const GREET_MS = TIMING.greetMs;
const MOTTO_GAP_MS = TIMING.mottoGapMs;
const FACE_MS: Record<Face, [number, number]> = {
	avatar: [...TIMING.face.avatar],
	bot: [...TIMING.face.bot],
};
const BUCKET_MS: [number, number] = [...TIMING.bucket];
const VARIANT_MS: [number, number] = [...TIMING.variant];
const JOLT_MS: [number, number] = [...TIMING.joltVariant];
const JOLT_BUCKET_MS: [number, number] = [...TIMING.joltBucket];

const BUCKETS: Bucket[] = [
	{
		id: "rest",
		label: "歇着",
		variants: [
			{ state: "idle" },
			{ state: "idle", trick: "bounce" },
			{ state: "humming" },
			{ state: "bored", trick: "hop" },
			{ state: "idle", trick: "burst" },
			{ state: "proud", trick: "bounce" },
		],
	},
	{
		id: "notice",
		label: "注意",
		variants: [
			{ state: "curious", emphasis: true },
			{ state: "listening" },
			{ state: "happy", trick: "bounce" },
			{ state: "curious" },
		],
	},
	{
		id: "work",
		label: "干活",
		variants: [
			{ state: "thinking" },
			{ state: "writing" },
			{ state: "dictating" },
			{ state: "searching" },
			{ state: "working" },
			{ state: "thinking" },
		],
	},
	{
		id: "play",
		label: "玩",
		variants: [
			{ state: "playful", trick: "bounce" },
			{ state: "excited", trick: "spin" },
			{ state: "laughing", trick: "hop" },
			{ state: "bouncing" },
			{ state: "playful", trick: "spin" },
		],
	},
	{
		id: "ring",
		label: "环",
		variants: [
			{ state: "orbit" },
			{ state: "radar" },
			{ state: "progress" },
			{ state: "humming" },
			{ state: "loading" },
			{ state: "spawning" },
		],
	},
	{
		id: "jolt",
		label: "惊一下",
		short: true,
		variants: [
			{ state: "surprised", trick: "hop" },
			{ state: "alerting" },
			{ state: "celebrate", trick: "hop", noWild: true },
			{ state: "surprised" },
		],
	},
];

const CLICKS = [
	{ id: "bounce", trick: "bounce" },
	{ id: "spin", trick: "spin" },
	{ id: "mood", states: ["surprised", "playful", "excited", "laughing"] },
	{ id: "overlay", states: ["thinking", "orbit"] },
	{ id: "hop", trick: "hop" },
	{ id: "burst", trick: "burst" },
] as const;

const reduceMq =
	typeof window !== "undefined"
		? window.matchMedia("(prefers-reduced-motion: reduce)")
		: null;

let enginePromise: Promise<boolean> | null = null;
let live: Session | null = null;
let swupBound = false;

function fflyCtor(): FflyCtor | undefined {
	return (window as unknown as { FireflyCharacter?: FflyCtor }).FireflyCharacter;
}

function overlayMap(): Record<string, string> {
	const fx = (window as unknown as { FFLY_FX?: { MAP?: Record<string, string> } })
		.FFLY_FX;
	return fx?.MAP ?? {};
}

function rand(a: number, b: number): number {
	return a + Math.random() * (b - a);
}

function span(pair: [number, number]): number {
	return rand(pair[0], pair[1]);
}

function reduced(): boolean {
	return !!reduceMq?.matches;
}

function bucketOf(i: number): Bucket {
	return BUCKETS[(i + BUCKETS.length) % BUCKETS.length];
}

function overlayOf(state: string): string | null {
	return overlayMap()[state] || null;
}

function injectScript(src: string): Promise<void> {
	const existing = document.querySelector<HTMLScriptElement>(
		`script[data-ffly-engine][src="${src}"]`,
	);
	if (existing) {
		if (existing.dataset.fflyReady === "1" || fflyCtor()) {
			return Promise.resolve();
		}
		return new Promise((resolve, reject) => {
			existing.addEventListener("load", () => resolve(), { once: true });
			existing.addEventListener("error", () => reject(new Error(src)), {
				once: true,
			});
		});
	}
	return new Promise((resolve, reject) => {
		const el = document.createElement("script");
		el.src = src;
		el.async = false;
		el.dataset.fflyEngine = "1";
		el.onload = () => {
			el.dataset.fflyReady = "1";
			resolve();
		};
		el.onerror = () => reject(new Error(src));
		document.head.appendChild(el);
	});
}

function vendorForcedOff(): boolean {
	return (
		import.meta.env.DEV &&
		new URLSearchParams(location.search).has("ff-no-bot")
	);
}

function jsType(res: Response): boolean {
	if (!res.ok) return false;
	const type = (res.headers.get("content-type") || "").toLowerCase();
	if (!type || type.includes("html") || type.includes("markdown")) return false;
	return type.includes("javascript") || type.includes("ecmascript");
}

async function vendorPresent(): Promise<boolean> {
	if (vendorForcedOff()) return false;
	const src = ENGINE_SCRIPTS[0];
	const signal = AbortSignal.timeout(2500);
	try {
		let res = await fetch(src, { method: "HEAD", cache: "no-store", signal });
		if (res.status === 405 || res.status === 501) {
			res = await fetch(src, { method: "GET", cache: "no-store", signal });
		}
		return jsType(res);
	} catch {
		return false;
	}
}

function geoReady(): boolean {
	return !!(window as unknown as { FFLY_GEO?: unknown }).FFLY_GEO;
}

function loadEngine(): Promise<boolean> {
	if (fflyCtor() && geoReady()) return Promise.resolve(true);
	if (enginePromise) return enginePromise;
	enginePromise = (async () => {
		try {
			if (!(await vendorPresent())) {
				console.warn("[profile-firefly] vendor missing; stay on avatar");
				return false;
			}
			await injectScript(ENGINE_SCRIPTS[0]);
			if (!geoReady()) {
				console.warn("[profile-firefly] vendor missing; stay on avatar");
				return false;
			}
			for (const src of ENGINE_SCRIPTS.slice(1)) {
				await injectScript(src);
			}
			return typeof fflyCtor() === "function";
		} catch {
			console.warn("[profile-firefly] vendor missing; stay on avatar");
			return false;
		}
	})();
	return enginePromise;
}

function hold(bot: FflyBot | null): void {
	if (bot) bot.setMode("hold");
}

function muteEngineWild(bot: FflyBot | null): void {
	if (!bot) return;
	bot.trickAt = performance.now() + 1e8;
	bot.celebrateAt = -1;
	if (
		bot.trick &&
		(bot.trick.kind === "spinWild" || bot.trick.kind === "spinDizzy")
	) {
		bot.trick = null;
	}
	if (
		bot.state === "searching" ||
		bot.state === "working" ||
		bot.state === "excited"
	) {
		bot.ctx.wantPn = null;
	}
}

function setShapeSafe(bot: FflyBot, name: string): void {
	if (!name || name === bot.shapeName) return;
	bot.setShape(name);
	hold(bot);
	bot.trick = null;
	bot.spinTurn = null;
	bot.wildWide = false;
	bot.hopAt = -1;
	bot.particles?.clear?.();
}

function maybeShape(S: Session, bot: FflyBot): void {
	S.switches += 1;
	if (S.switches % TIMING.shapeEvery !== 0) return;
	const pool = SHAPES.filter((n) => n !== bot.shapeName);
	setShapeSafe(bot, pool[(Math.random() * pool.length) | 0]);
}

function trickPadMs(kind: string | null | undefined): number {
	if (!kind) return 0;
	const map = TIMING.trick;
	if (kind === "bounce") return map.bounce;
	if (kind === "hop") return map.hop;
	if (kind === "spin") return map.spin;
	if (kind === "burst") return map.burst;
	return 0;
}

function trickPlaying(bot: FflyBot | null): boolean {
	if (!bot) return false;
	if (bot.hopAt >= 0 && performance.now() - bot.hopAt < TIMING.trick.hop) {
		return true;
	}
	const spin = bot.spinTurn;
	if (spin) {
		if (Math.abs(spin.t - spin.x) > 0.004 || Math.abs(spin.v) > 0.015) {
			return true;
		}
	}
	return false;
}

function fireTrick(S: Session, bot: FflyBot, kind: string | null): void {
	if (!kind) {
		S.trick = "—";
		return;
	}
	S.trick = kind;
	if (kind === "bounce" || kind === "hop") bot.bounceOnce();
	else if (kind === "spin") bot.spinOnce(1);
	else if (kind === "burst") bot.burstOnce();
}

function waitOverlayOut(S: Session, bot: FflyBot | null): Promise<void> {
	return new Promise((resolve) => {
		if (!bot || S.dead) {
			resolve();
			return;
		}
		const t0 = performance.now();
		const tick = () => {
			if (S.dead || bot.overlay.x < 0.05 || performance.now() - t0 > 520) {
				resolve();
				return;
			}
			requestAnimationFrame(tick);
		};
		tick();
	});
}

function sizePxOf(stage: HTMLElement): number {
	const slot = stage.getBoundingClientRect().width || 112;
	return Math.max(64, Math.min(90, Math.round(slot * 0.7)));
}

function schemeOf(): "light" | "dark" {
	return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function ensureBot(S: Session): FflyBot | null {
	if (S.bot || reduced() || S.dead) return S.bot;
	const Ctor = fflyCtor();
	if (!Ctor) return null;
	try {
		S.bot = new Ctor(S.svg, {
			mode: "hold",
			state: "idle",
			shape: "blob",
			color: "black",
			scheme: schemeOf(),
			loginWrap: true,
			sizePx: sizePxOf(S.stage),
			followPointer: true, // 眼神跟随鼠标（ADR-0005：pointer 优先于随机注视）
		});
	} catch {
		S.bot = null;
		return null;
	}
	hold(S.bot);
	S.bot.setPaused(false);
	muteEngineWild(S.bot);
	S.trick = "—";
	(S.svg as SVGSVGElement & { __ffly?: FflyBot }).__ffly = S.bot;
	return S.bot;
}

function destroyBot(S: Session): void {
	if (!S.bot) return;
	S.bot.destroy();
	S.bot = null;
	delete (S.svg as SVGSVGElement & { __ffly?: FflyBot }).__ffly;
	S.svg.innerHTML = "";
}

function paintFace(S: Session): void {
	const botOn = S.face === "bot";
	S.faceAvatar.classList.toggle("is-on", !botOn);
	S.faceBot.classList.toggle("is-on", botOn);
	S.stage.classList.toggle("is-bot", botOn);
	S.stage.classList.toggle("is-avatar", !botOn);
	S.stage.dataset.fflyFace = S.face;
}

function mottoClose(S: Session, now: number): boolean {
	return S.mottoLast > 0 && Math.abs(now - S.mottoLast) < MOTTO_GAP_MS;
}

function watchMotto(S: Session): void {
	const shell = S.stage
		.closest(".profile-widget")
		?.querySelector<HTMLElement>(".text-voice-shell--rotate");
	if (!shell) return;
	S.mottoMo = new MutationObserver(() => {
		S.mottoLast = performance.now();
	});
	S.mottoMo.observe(shell, { attributes: true, attributeFilter: ["data-mode"] });
}

function scheduleVariant(
	S: Session,
	b: Bucket,
	trickKind?: string | null,
): void {
	S.variantDue =
		performance.now() + trickPadMs(trickKind) + span(b.short ? JOLT_MS : VARIANT_MS);
}

function scheduleBucket(S: Session): void {
	const b = bucketOf(S.bucket);
	S.bucketDue =
		performance.now() + span(b.short ? JOLT_BUCKET_MS : BUCKET_MS);
}

function scheduleMacro(S: Session): void {
	S.macroDue = performance.now() + span(FACE_MS[S.face]);
}

async function applyVariant(S: Session, v: Variant): Promise<void> {
	const bot = ensureBot(S);
	if (!bot || !v || S.dead) return;
	const prevOv = overlayOf(bot.state);
	const nextOv = overlayOf(v.state);
	bot.setEmphasis(!!v.emphasis);
	if (prevOv && nextOv && prevOv !== nextOv) {
		bot.setState("idle", { resetEyes: false });
		hold(bot);
		await waitOverlayOut(S, bot);
		if (S.dead) return;
	}
	bot.setState(v.state, { resetEyes: false });
	hold(bot);
	if (v.noWild) {
		bot.celebrateAt = -1;
		bot.trick = null;
	}
	muteEngineWild(bot);
	maybeShape(S, bot);
	fireTrick(S, bot, v.trick || null);
}

async function playIndex(S: Session, bi: number, vi: number): Promise<void> {
	S.bucket = bi;
	const b = bucketOf(bi);
	S.variant = ((vi % b.variants.length) + b.variants.length) % b.variants.length;
	S.busy = true;
	try {
		await applyVariant(S, b.variants[S.variant]);
		scheduleVariant(S, b, b.variants[S.variant]?.trick);
	} finally {
		S.busy = false;
	}
}

async function nextVariant(S: Session): Promise<void> {
	if (S.face !== "bot" || S.busy || S.dead) return;
	await playIndex(S, S.bucket, S.variant + 1);
}

function nextBucket(S: Session): void {
	if (S.hover || S.dead) return;
	const b = bucketOf(S.bucket);
	if (b.short) {
		S.bucket = Math.random() < 0.5 ? 0 : 1;
	} else {
		S.bucket = (S.bucket + 1) % BUCKETS.length;
	}
	S.variant = 0;
	scheduleBucket(S);
	void playIndex(S, S.bucket, 0);
	// 彩带常态化：桶切换时偶尔自发庆祝，不强制依赖点击（ADR-0005）
	if (Math.random() < 0.25 && S.bot?.burstOnce) S.bot.burstOnce();
}

function showFace(S: Session, face: Face): void {
	if (face === "bot") {
		if (!S.engineOk || reduced() || S.dead || !ensureBot(S)) {
			face = "avatar";
		}
	}
	S.face = face;
	paintFace(S);
	if (face === "bot" && S.bot) {
		S.bot.setPaused(false);
		S.bot.setFollowPointer(true);
		hold(S.bot);
		scheduleBucket(S);
		scheduleVariant(S, bucketOf(S.bucket), bucketOf(S.bucket).variants[S.variant]?.trick);
	} else if (S.bot) {
		// 宏切隐藏不清 pointerRaw：setFollowPointer(false) 会把鼠标参照清掉，
		// Bot 面回来且鼠标静止时眼神失跟。paused 已停渲染，跟随保持开着继续采点。
		S.bot.setPaused(true);
		S.bot.setEmphasis(false);
	}
	scheduleMacro(S);
}

function onEnter(S: Session): void {
	if (reduced() || S.dead || !S.engineOk) return;
	window.clearTimeout(S.leaveTimer);
	S.hover = true;
	if (S.face !== "bot") showFace(S, "bot");
	const bot = ensureBot(S);
	if (!bot) return;
	bot.setPaused(false);
	bot.setFollowPointer(true);
	S.bucket = 1;
	S.variant = 0;
	S.trick = "follow";
	bot.setState("curious", { resetEyes: false });
	hold(bot);
	bot.setEmphasis(true);
	muteEngineWild(bot);
}

function onLeave(S: Session): void {
	if (reduced() || S.dead) return;
	window.clearTimeout(S.leaveTimer);
	S.leaveTimer = window.setTimeout(() => {
		if (S.dead) return;
		S.hover = false;
		if (!S.bot) return;
		S.bot.setEmphasis(false);
		muteEngineWild(S.bot);
		S.bucket = 1;
		void playIndex(S, 1, 1);
		scheduleBucket(S);
	}, LEAVE_MS);
}

function holdForGreet(S: Session): void {
	const until = performance.now() + GREET_MS;
	S.greetUntil = until;
	S.variantDue = Math.max(S.variantDue, until);
	if (S.macroDue < until) S.macroDue = until;
	if (S.bot) S.bot.setMode("hold");
}

function onClick(S: Session): void {
	holdForGreet(S);
	if (reduced() || S.face === "avatar") return;
	const bot = S.bot;
	if (!bot) return;
	const act = CLICKS[S.clickI % CLICKS.length];
	S.clickI += 1;
	if ("states" in act && act.states) {
		const st = act.states[(Math.random() * act.states.length) | 0];
		bot.setState(st, { resetEyes: true });
		hold(bot);
		muteEngineWild(bot);
		S.trick = act.id;
		S.bucket = st === "surprised" ? 5 : 3;
	} else if ("trick" in act) {
		fireTrick(S, bot, act.trick);
	}
}

function tick(S: Session, now: number): void {
	if (S.dead) return;
	muteEngineWild(S.bot);
	const auto =
		!S.hover &&
		!S.busy &&
		!reduced() &&
		now >= S.greetUntil &&
		!trickPlaying(S.bot);
	if (auto) {
		if (now >= S.macroDue) {
			if (mottoClose(S, now)) {
				S.macroDue = now + MOTTO_GAP_MS;
			} else if (S.face === "bot") {
				showFace(S, "avatar");
			} else {
				showFace(S, "bot");
				void playIndex(S, S.bucket, S.variant);
			}
		} else if (S.face === "bot") {
			if (now >= S.bucketDue) nextBucket(S);
			else if (now >= S.variantDue) void nextVariant(S);
		}
	}
	S.raf = requestAnimationFrame((t) => tick(S, t));
}

function startLoop(S: Session): void {
	if (S.raf || S.dead) return;
	S.raf = requestAnimationFrame((t) => tick(S, t));
}

function bind(S: Session): void {
	const { shell, ac } = S;
	const sig = { signal: ac.signal };
	shell.addEventListener("pointerenter", () => onEnter(S), sig);
	shell.addEventListener("pointerleave", () => onLeave(S), sig);
	shell.addEventListener("click", () => onClick(S), sig);
	reduceMq?.addEventListener(
		"change",
		() => {
			if (S.dead) return;
			if (reduced()) {
				if (S.raf) cancelAnimationFrame(S.raf);
				S.raf = 0;
				destroyBot(S);
				showFace(S, "avatar");
			} else {
				void (async () => {
					if (!(await loadEngine())) return;
					if (S.dead) return;
					S.engineOk = true;
					if (!ensureBot(S)) {
						S.engineOk = false;
						showFace(S, "avatar");
						return;
					}
					showFace(S, "bot");
					void playIndex(S, 0, 0);
					startLoop(S);
				})();
			}
		},
		sig,
	);
}

function teardown(S: Session): void {
	S.dead = true;
	if (S.raf) cancelAnimationFrame(S.raf);
	S.raf = 0;
	window.clearTimeout(S.leaveTimer);
	S.mottoMo?.disconnect();
	S.mottoMo = null;
	S.ac.abort();
	destroyBot(S);
}

function mount(stage: HTMLElement): Session | null {
	const shell = stage.querySelector<HTMLElement>("[data-avatar-greet]");
	const svg = stage.querySelector<SVGSVGElement>("[data-profile-ffly-svg]");
	const faceAvatar = stage.querySelector<HTMLElement>(
		'[data-profile-face="avatar"]',
	);
	const faceBot = stage.querySelector<HTMLElement>('[data-profile-face="bot"]');
	if (!shell || !svg || !faceAvatar || !faceBot) return null;

	const S: Session = {
		stage,
		shell,
		svg,
		faceAvatar,
		faceBot,
		face: "avatar",
		engineOk: false,
		hover: false,
		leaveTimer: 0,
		bot: null,
		bucket: 0,
		variant: 0,
		trick: "—",
		switches: 0,
		clickI: 0,
		bucketDue: 0,
		variantDue: 0,
		macroDue: 0,
		greetUntil: 0,
		busy: false,
		raf: 0,
		dead: false,
		ac: new AbortController(),
		mottoLast: 0,
		mottoMo: null,
	};

	watchMotto(S);
	bind(S);
	showFace(S, "avatar");

	if (reduced()) {
		return S;
	}

	void (async () => {
		if (!(await loadEngine())) {
			return;
		}
		if (S.dead) return;
		S.engineOk = true;
		const bot = ensureBot(S);
		if (!bot) {
			S.engineOk = false;
			showFace(S, "avatar");
			return;
		}
		// 预热引擎，首屏停在头像（进场招手）；跟随保持开着，Bot 面出现时眼神已有鼠标参照
		if (S.face !== "bot") {
			bot.setPaused(true);
		}
		bot.setFollowPointer(true);
		startLoop(S);
	})();

	return S;
}

async function start(): Promise<void> {
	const stage = document.querySelector<HTMLElement>("[data-profile-ffly]");
	if (live && live.stage === stage && stage?.isConnected && !live.dead) {
		return;
	}
	if (live) {
		teardown(live);
		live = null;
	}
	if (!stage) return;
	live = mount(stage);
}

export function bootProfileFireflyCarousel(): void {
	void start();
	if (swupBound) return;
	swupBound = true;
	const rebound = () => {
		void start();
	};
	document.addEventListener("swup:contentReplaced", rebound);
	document.addEventListener("swup:content:replace", rebound);
	document.addEventListener("swup:page:view", rebound);
}
