/**
 * 短时环境特效（对比台 E04/E05/E08/E09）
 * - E04/E05：yzhanWeather firefly / butterfly（桌宠双击）
 * - E08：canvas-confetti（礼盒开盖）
 * - E09：tsParticles（礼盒「我已阅读」）
 * 全部懒加载；尊重 prefers-reduced-motion。
 */
import { ambientFxConfig } from "@/config";

export type YzhanMode = "firefly" | "butterfly";

type YzhanWeatherLike = {
	run: (mode: string, opts?: { maxDuration?: number }) => void;
	clear: () => void;
	destory?: () => void;
};

declare global {
	interface Window {
		YZhanWeather?: new () => YzhanWeatherLike;
		__fireflyYzhan?: YzhanWeatherLike;
	}
}

const YZHAN_SRC = "/assets/effects/yzhanweather.min.js";
const TSP_HOST_ID = "firefly-ambient-tsp";

let yzhanScriptPromise: Promise<void> | null = null;
let yzhanTimer: ReturnType<typeof setTimeout> | null = null;
let tspTimer: ReturnType<typeof setTimeout> | null = null;
let tspLoaded = false;
let tspContainerRef: { destroy: (remove?: boolean) => void } | null = null;

function prefersReducedMotion(): boolean {
	return (
		typeof window !== "undefined" &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches
	);
}

function isAmbientEnabled(): boolean {
	return ambientFxConfig.enable;
}

/** 与站点 LightDarkSwitch 一致：html.dark */
export function isSiteDarkTheme(): boolean {
	return document.documentElement.classList.contains("dark");
}

function loadYzhanScript(): Promise<void> {
	if (typeof window.YZhanWeather === "function") {
		return Promise.resolve();
	}
	if (yzhanScriptPromise) return yzhanScriptPromise;

	yzhanScriptPromise = new Promise((resolve, reject) => {
		const existing = document.querySelector<HTMLScriptElement>(
			`script[data-firefly-yzhan]`,
		);
		if (existing) {
			existing.addEventListener("load", () => resolve(), { once: true });
			existing.addEventListener(
				"error",
				() => reject(new Error("yzhanweather load failed")),
				{ once: true },
			);
			return;
		}
		const script = document.createElement("script");
		script.src = YZHAN_SRC;
		script.async = true;
		script.dataset.fireflyYzhan = "1";
		script.onload = () => resolve();
		script.onerror = () => {
			yzhanScriptPromise = null;
			reject(new Error("yzhanweather load failed"));
		};
		document.head.appendChild(script);
	});

	return yzhanScriptPromise;
}

function getYzhanInstance(): YzhanWeatherLike | null {
	if (window.__fireflyYzhan) return window.__fireflyYzhan;
	if (typeof window.YZhanWeather !== "function") return null;
	window.__fireflyYzhan = new window.YZhanWeather();
	return window.__fireflyYzhan;
}

/**
 * E04/E05：yzhan 短时 burst
 * @param mode firefly | butterfly
 */
export async function triggerYzhanBurst(
	mode: YzhanMode,
	durationMs?: number,
): Promise<void> {
	const burstMs = durationMs ?? ambientFxConfig.petBurstMs;
	if (!isAmbientEnabled() || !ambientFxConfig.petYzhanEnable) return;
	if (prefersReducedMotion()) return;
	if (typeof document === "undefined") return;

	try {
		await loadYzhanScript();
	} catch {
		return;
	}

	const yzhan = getYzhanInstance();
	if (!yzhan) return;

	if (yzhanTimer !== null) {
		clearTimeout(yzhanTimer);
		yzhanTimer = null;
	}

	try {
		yzhan.clear();
	} catch {
		/* ignore */
	}
	yzhan.run(mode, { maxDuration: Math.max(3, Math.round(burstMs / 1000)) });

	yzhanTimer = setTimeout(() => {
		yzhanTimer = null;
		try {
			yzhan.clear();
		} catch {
			/* ignore */
		}
	}, burstMs);
}

/** 桌宠双击：暗色萤火虫 / 亮色蝴蝶 */
export function triggerPetYzhanByTheme(): void {
	const mode: YzhanMode = isSiteDarkTheme() ? "firefly" : "butterfly";
	void triggerYzhanBurst(mode);
}

type ConfettiFn = typeof import("canvas-confetti");

let confettiModulePromise: Promise<ConfettiFn> | null = null;

async function loadConfetti(): Promise<ConfettiFn | null> {
	if (!confettiModulePromise) {
		confettiModulePromise = import("canvas-confetti")
			.then((mod) => {
				const maybeDefault = (mod as unknown as { default?: unknown }).default;
				const fn =
					typeof maybeDefault === "function"
						? (maybeDefault as ConfettiFn)
						: typeof (mod as unknown as ConfettiFn) === "function"
							? (mod as unknown as ConfettiFn)
							: null;
				if (!fn) throw new Error("canvas-confetti export missing");
				return fn;
			})
			.catch((err) => {
				confettiModulePromise = null;
				throw err;
			});
	}
	try {
		return await confettiModulePromise;
	} catch (err) {
		console.warn("[ambient-fx] canvas-confetti load failed", err);
		return null;
	}
}

/** 提前拉 confetti chunk，避免开盖瞬间还在等网络（生产首点常见） */
export function preloadConfetti(): void {
	if (!isAmbientEnabled() || !ambientFxConfig.giftConfettiEnable) return;
	if (prefersReducedMotion()) return;
	void loadConfetti();
}

function originFromElement(el: Element | null | undefined): { x: number; y: number } {
	if (!(el instanceof Element) || typeof window === "undefined") {
		return { x: 0.5, y: 0.42 };
	}
	const r = el.getBoundingClientRect();
	const vw = Math.max(window.innerWidth, 1);
	const vh = Math.max(window.innerHeight, 1);
	return {
		x: Math.min(0.92, Math.max(0.08, (r.left + r.width / 2) / vw)),
		y: Math.min(0.85, Math.max(0.12, (r.top + r.height / 2) / vh)),
	};
}

/** E08：礼盒开盖短促 confetti（默认视口正中，跟随全屏信封；也可传入元素作原点） */
export async function triggerConfettiBurst(
	originEl?: Element | null,
): Promise<void> {
	if (!isAmbientEnabled() || !ambientFxConfig.giftConfettiEnable) return;
	if (prefersReducedMotion()) return;

	const confetti = await loadConfetti();
	if (!confetti) return;

	const colors = ["#ffb7c5", "#ff9ec4", "#ffe4ec", "#fdfaf3", "#a63d52", "#ecd9ae"];
	// 无锚点 → 正中（信封落地）；有锚点则跟元素中心
	const o = originEl
		? originFromElement(originEl)
		: { x: 0.5, y: 0.42 };

	try {
		confetti({
			particleCount: 80,
			spread: 72,
			startVelocity: 42,
			origin: o,
			colors,
			zIndex: 12000,
			disableForReducedMotion: true,
		});
		confetti({
			particleCount: 36,
			angle: 60,
			spread: 55,
			origin: { x: Math.max(0.06, o.x - 0.12), y: o.y + 0.06 },
			colors,
			zIndex: 12000,
			disableForReducedMotion: true,
		});
		confetti({
			particleCount: 36,
			angle: 120,
			spread: 55,
			origin: { x: Math.min(0.94, o.x + 0.12), y: o.y + 0.06 },
			colors,
			zIndex: 12000,
			disableForReducedMotion: true,
		});
	} catch (err) {
		console.warn("[ambient-fx] confetti burst failed", err);
	}
}

function ensureTspHost(): HTMLElement {
	let host = document.getElementById(TSP_HOST_ID);
	if (host) return host;
	host = document.createElement("div");
	host.id = TSP_HOST_ID;
	host.setAttribute("aria-hidden", "true");
	host.style.cssText =
		"position:fixed;inset:0;z-index:11990;pointer-events:none;overflow:hidden;";
	document.body.appendChild(host);
	return host;
}

function destroyTspHost(): void {
	const host = document.getElementById(TSP_HOST_ID);
	if (host) host.remove();
}

/** E09：礼盒「我已阅读」tsParticles 短暂庆祝 */
export async function triggerTsParticlesCelebrate(
	durationMs?: number,
): Promise<void> {
	const celebrateMs = durationMs ?? ambientFxConfig.giftTsParticlesMs;
	if (!isAmbientEnabled() || !ambientFxConfig.giftTsParticlesEnable) return;
	if (prefersReducedMotion()) return;
	if (typeof document === "undefined") return;

	if (tspTimer !== null) {
		clearTimeout(tspTimer);
		tspTimer = null;
	}

	const [{ tsParticles }, { loadFull }] = await Promise.all([
		import("@tsparticles/engine"),
		import("tsparticles"),
	]);

	if (!tspLoaded) {
		await loadFull(tsParticles);
		tspLoaded = true;
	}

	if (tspContainerRef) {
		tspContainerRef.destroy();
		tspContainerRef = null;
	}
	destroyTspHost();
	ensureTspHost();

	const container = await tsParticles.load({
		id: TSP_HOST_ID,
		options: {
			fullScreen: { enable: false },
			background: { color: { value: "transparent" } },
			fpsLimit: 60,
			particles: {
				number: { value: 55, density: { enable: true } },
				color: { value: ["#ffb7c5", "#ff8fab", "#ffffff", "#ecd9ae"] },
				shape: { type: "circle" },
				opacity: { value: { min: 0.35, max: 0.9 } },
				size: { value: { min: 2, max: 8 } },
				move: {
					enable: true,
					speed: { min: 0.8, max: 2.4 },
					direction: "bottom",
					drift: { min: -0.7, max: 0.3 },
					outModes: { default: "out" },
				},
				wobble: { enable: true, distance: 10, speed: 10 },
			},
			detectRetina: true,
		},
	});
	tspContainerRef = container ?? null;

	tspTimer = setTimeout(() => {
		tspTimer = null;
		if (tspContainerRef) {
			tspContainerRef.destroy();
			tspContainerRef = null;
		}
		destroyTspHost();
	}, celebrateMs);
}
