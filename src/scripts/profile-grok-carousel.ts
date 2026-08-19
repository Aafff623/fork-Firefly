/**
 * 侧栏头像 ↔ Grok Bot 宏切 + 六桶巡演。
 * 编舞对齐 `.scratch/preview-grok-avatar/choreography.js`，不改 replica。
 */

import { GROK_CAROUSEL_TIMING as TIMING } from "./profile-grok-timing";

type GrokOverlay = { x: number };

type GrokBot = {
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
	overlay: GrokOverlay;
	particles?: { clear?: () => void };
	ctx: { wantPn: unknown };
};

type GrokCtor = new (
	svg: SVGSVGElement,
	opts: Record<string, unknown>,
) => GrokBot;

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
	hover: boolean;
	leaveTimer: number;
	bot: GrokBot | null;
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
	"/vendor/grok-bot/geometry-data.js",
	"/vendor/grok-bot/src/math.js",
	"/vendor/grok-bot/src/tables.js",
	"/vendor/grok-bot/src/pose.js",
	"/vendor/grok-bot/src/tricks.js",
	"/vendor/grok-bot/src/fx.js",
	"/vendor/grok-bot/src/eyes.js",
	"/vendor/grok-bot/src/character.js",
] as const;

const SHAPES = [
	"blob",
	"pebble",
	"squircle",
	"hex",
	"egg",
	"gem",
	"shield",
	"leaf",
];

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
			{ state: "bored" },
			{ state: "proud" },
			{ state: "shy" },
		],
	},
	{
		id: "notice",
		label: "注意",
		variants: [
			{ state: "curious", emphasis: true },
			{ state: "listening" },
			{ state: "happy" },
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

function grokCtor(): GrokCtor | undefined {
	return (window as unknown as { GrokCharacter?: GrokCtor }).GrokCharacter;
}

function overlayMap(): Record<string, string> {
	const fx = (window as unknown as { GROK_FX?: { MAP?: Record<string, string> } })
		.GROK_FX;
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
		`script[data-grok-engine][src="${src}"]`,
	);
	if (existing) {
		if (existing.dataset.grokReady === "1" || grokCtor()) {
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
		el.dataset.grokEngine = "1";
		el.onload = () => {
			el.dataset.grokReady = "1";
			resolve();
		};
		el.onerror = () => reject(new Error(src));
		document.head.appendChild(el);
	});
}

function loadEngine(): Promise<boolean> {
	if (grokCtor()) return Promise.resolve(true);
	if (enginePromise) return enginePromise;
	enginePromise = (async () => {
		try {
			for (const src of ENGINE_SCRIPTS) {
				await injectScript(src);
			}
			return typeof grokCtor() === "function";
		} catch {
			console.warn("[profile-grok] vendor missing; stay on avatar");
			return false;
		}
	})();
	return enginePromise;
}

function hold(bot: GrokBot | null): void {
	if (bot) bot.setMode("hold");
}

function muteEngineWild(bot: GrokBot | null): void {
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

function setShapeSafe(bot: GrokBot, name: string): void {
	if (!name || name === bot.shapeName) return;
	bot.setShape(name);
	hold(bot);
	bot.trick = null;
	bot.spinTurn = null;
	bot.wildWide = false;
	bot.hopAt = -1;
	bot.particles?.clear?.();
}

function maybeShape(S: Session, bot: GrokBot): void {
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

function trickPlaying(bot: GrokBot | null): boolean {
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

function fireTrick(S: Session, bot: GrokBot, kind: string | null): void {
	if (!kind) {
		S.trick = "—";
		return;
	}
	S.trick = kind;
	if (kind === "bounce" || kind === "hop") bot.bounceOnce();
	else if (kind === "spin") bot.spinOnce(1);
	else if (kind === "burst") bot.burstOnce();
}

function waitOverlayOut(S: Session, bot: GrokBot | null): Promise<void> {
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

function ensureBot(S: Session): GrokBot | null {
	if (S.bot || reduced() || S.dead) return S.bot;
	const Ctor = grokCtor();
	if (!Ctor) return null;
	S.bot = new Ctor(S.svg, {
		mode: "hold",
		state: "thinking",
		shape: "blob",
		color: "black",
		scheme: schemeOf(),
		loginWrap: true,
		sizePx: sizePxOf(S.stage),
		followPointer: false,
	});
	hold(S.bot);
	S.bot.setPaused(false);
	muteEngineWild(S.bot);
	S.trick = "—";
	(S.svg as SVGSVGElement & { __grok?: GrokBot }).__grok = S.bot;
	return S.bot;
}

function destroyBot(S: Session): void {
	if (!S.bot) return;
	S.bot.destroy();
	S.bot = null;
	delete (S.svg as SVGSVGElement & { __grok?: GrokBot }).__grok;
	S.svg.innerHTML = "";
}

function paintFace(S: Session): void {
	const botOn = S.face === "bot";
	S.faceAvatar.classList.toggle("is-on", !botOn);
	S.faceBot.classList.toggle("is-on", botOn);
	S.stage.classList.toggle("is-bot", botOn);
	S.stage.classList.toggle("is-avatar", !botOn);
	S.stage.dataset.grokFace = S.face;
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
}

function showFace(S: Session, face: Face): void {
	S.face = face;
	paintFace(S);
	if (face === "bot") {
		const bot = ensureBot(S);
		if (bot) {
			bot.setPaused(false);
			hold(bot);
		}
		scheduleBucket(S);
		scheduleVariant(S, bucketOf(S.bucket), bucketOf(S.bucket).variants[S.variant]?.trick);
	} else if (S.bot) {
		S.bot.setFollowPointer(false);
		S.bot.setPaused(true);
		S.bot.setEmphasis(false);
	}
	scheduleMacro(S);
}

function onEnter(S: Session): void {
	if (reduced() || S.dead) return;
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
		S.bot.setFollowPointer(false);
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
					showFace(S, "bot");
					void playIndex(S, 2, 0);
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
	const svg = stage.querySelector<SVGSVGElement>("[data-profile-grok-svg]");
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
		face: "bot",
		hover: false,
		leaveTimer: 0,
		bot: null,
		bucket: 2,
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

	if (reduced()) {
		showFace(S, "avatar");
		return S;
	}

	void (async () => {
		if (!(await loadEngine())) {
			showFace(S, "avatar");
			return;
		}
		if (S.dead) return;
		showFace(S, "bot");
		void playIndex(S, 2, 0);
		startLoop(S);
	})();

	return S;
}

async function start(): Promise<void> {
	const stage = document.querySelector<HTMLElement>("[data-profile-grok]");
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

export function bootProfileGrokCarousel(): void {
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
