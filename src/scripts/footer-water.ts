/**
 * Footer「上次浇灌」彩蛋：
 * 胶囊自反馈 + 旁侧舞台；Lottie 浇水壶；园苗四层：苗 → 冠 → 花 → 柿。
 * 第四浇结果后可摘果：萤火/蝴蝶 + 果笺。园时记 sessionStorage，五分钟过期。
 * 不写 cookie / localStorage / 服务器。首次点击才懒加载 @lottiefiles/dotlottie-web。
 */

import type { DotLottie } from "@lottiefiles/dotlottie-web";
import { triggerPetYzhanByTheme } from "@/utils/ambient-fx";

const LOTTIE_SRC = "/assets/effects/watering-can.json";
const FALLBACK_MS = 2200;
const GROWN_HOLD_MS = 1100;
const FRUIT_HOLD_MS = 8500;
const NOTE_HOLD_MS = 6200;
const FRUIT_DROP_MS = 680;
const CLOSE_MS = 280;
const STORAGE_KEY = "firefly-footer-water-v1";
const WINDOW_MS = 5 * 60 * 1000;
const MAX_STAGE = 4;

type Garden = { t: number; n: number; p: 0 | 1 };

type WaterEls = {
	btn: HTMLElement;
	stage: HTMLElement;
	canvas: HTMLCanvasElement;
	sprout: HTMLElement;
	pick: HTMLButtonElement;
	note: HTMLElement;
};

let playing = false;
let player: DotLottie | null = null;
let DotLottieCtor: typeof DotLottie | null = null;
let closeTimer = 0;

function prefersReducedMotion(): boolean {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function emptyGarden(): Garden {
	return { t: 0, n: 0, p: 0 };
}

function readGarden(): Garden {
	try {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		if (!raw) return emptyGarden();
		const parsed = JSON.parse(raw) as Partial<Garden>;
		const t =
			typeof parsed.t === "number" && Number.isFinite(parsed.t) ? parsed.t : 0;
		const nRaw =
			typeof parsed.n === "number" && Number.isFinite(parsed.n) ? parsed.n : 0;
		const n = Math.min(MAX_STAGE, Math.max(0, Math.floor(nRaw)));
		const p: 0 | 1 = parsed.p === 1 ? 1 : 0;
		if (!t || Date.now() - t > WINDOW_MS) return emptyGarden();
		return { t, n, p };
	} catch {
		return emptyGarden();
	}
}

function writeGarden(garden: Garden): void {
	try {
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify(garden));
	} catch {
		/* private mode */
	}
}

function applyGrowth(sprout: HTMLElement, btn: HTMLElement, n: number): void {
	const stage = Math.min(MAX_STAGE, Math.max(0, n));
	if (stage <= 0) {
		sprout.removeAttribute("data-growth");
		btn.removeAttribute("data-growth");
		return;
	}
	const value = String(stage);
	sprout.setAttribute("data-growth", value);
	btn.setAttribute("data-growth", value);
}

function isRipe(garden: Garden): boolean {
	return garden.n >= MAX_STAGE && garden.p === 0;
}

function applyGardenUi(els: WaterEls, garden: Garden): void {
	const { sprout, btn, pick, note } = els;
	applyGrowth(sprout, btn, garden.n);
	if (garden.p === 1) {
		sprout.dataset.picked = "1";
		sprout.classList.remove("is-picking");
		pick.hidden = true;
	} else {
		delete sprout.dataset.picked;
		sprout.classList.remove("is-picking");
		pick.hidden = garden.n < MAX_STAGE;
	}
	note.hidden = true;
	note.classList.remove("is-open");
}

function setStagePickable(stage: HTMLElement, ripe: boolean): void {
	stage.classList.toggle("is-pickable", ripe);
	stage.setAttribute("aria-hidden", ripe ? "false" : "true");
}

async function loadDotLottie(): Promise<typeof DotLottie> {
	if (DotLottieCtor) return DotLottieCtor;
	const mod = await import("@lottiefiles/dotlottie-web");
	DotLottieCtor = mod.DotLottie;
	DotLottieCtor.setWasmUrl("/assets/effects/dotlottie-player.wasm");
	return DotLottieCtor;
}

function destroyPlayer(): void {
	if (!player) return;
	try {
		player.destroy();
	} catch {
		/* ignore */
	}
	player = null;
}

function syncCanvasSize(canvas: HTMLCanvasElement): void {
	const rect = canvas.getBoundingClientRect();
	const dpr = Math.min(window.devicePixelRatio || 1, 2);
	const cssW = rect.width > 1 ? rect.width : 92;
	const cssH = rect.height > 1 ? rect.height : 92;
	const w = Math.max(160, Math.round(cssW * dpr));
	const h = Math.max(160, Math.round(cssH * dpr));
	if (canvas.width !== w) canvas.width = w;
	if (canvas.height !== h) canvas.height = h;
}

function closeStage(els: WaterEls): void {
	const { btn, stage, sprout, pick, note } = els;
	stage.classList.remove("is-open", "is-pickable");
	stage.setAttribute("aria-hidden", "true");
	sprout.classList.remove("is-thirsty", "is-grown");
	btn.classList.remove("is-watering");
	pick.hidden = true;
	note.hidden = true;
	note.classList.remove("is-open");
	window.setTimeout(() => {
		playing = false;
	}, CLOSE_MS);
}

function scheduleClose(els: WaterEls, ms: number): void {
	window.clearTimeout(closeTimer);
	closeTimer = window.setTimeout(() => closeStage(els), ms);
}

function completeWatering(els: WaterEls, prev: Garden): Garden {
	const next = prev.n >= MAX_STAGE ? MAX_STAGE : prev.n + 1;
	const garden: Garden = {
		t: prev.t || Date.now(),
		n: next,
		p: prev.p === 1 ? 1 : 0,
	};
	writeGarden(garden);
	applyGardenUi(els, garden);
	return garden;
}

function revealGrown(els: WaterEls, garden: Garden): void {
	const { sprout, stage } = els;
	sprout.classList.remove("is-thirsty");
	sprout.classList.add("is-grown");
	els.btn.classList.remove("is-watering");
	const ripe = isRipe(garden);
	setStagePickable(stage, ripe);
	if (ripe) els.pick.hidden = false;
	const hold = ripe ? FRUIT_HOLD_MS : GROWN_HOLD_MS;
	scheduleClose(els, hold);
}

function pickFruit(els: WaterEls): void {
	const garden = readGarden();
	if (!isRipe(garden)) return;

	const next: Garden = { ...garden, p: 1 };
	writeGarden(next);
	els.pick.hidden = true;
	setStagePickable(els.stage, false);
	els.note.hidden = false;
	els.note.classList.add("is-open");

	if (prefersReducedMotion()) {
		els.sprout.dataset.picked = "1";
		els.sprout.classList.remove("is-picking");
	} else {
		els.sprout.classList.add("is-picking");
		triggerPetYzhanByTheme();
		window.setTimeout(() => {
			els.sprout.dataset.picked = "1";
			els.sprout.classList.remove("is-picking");
		}, FRUIT_DROP_MS);
	}

	scheduleClose(els, NOTE_HOLD_MS);
}

async function runWatering(els: WaterEls): Promise<void> {
	if (playing) return;
	playing = true;
	window.clearTimeout(closeTimer);

	const garden = readGarden();
	applyGardenUi(els, garden);
	els.btn.classList.add("is-watering");

	if (prefersReducedMotion()) {
		const next = completeWatering(els, garden);
		els.stage.classList.add("is-open");
		revealGrown(els, next);
		return;
	}

	els.stage.classList.add("is-open");
	setStagePickable(els.stage, false);
	els.pick.hidden = true;
	await new Promise<void>((resolve) => {
		requestAnimationFrame(() => resolve());
	});
	syncCanvasSize(els.canvas);
	if (garden.n === 0) {
		els.sprout.classList.add("is-thirsty");
		els.sprout.classList.remove("is-grown");
	} else {
		els.sprout.classList.remove("is-thirsty");
		els.sprout.classList.add("is-grown");
	}

	let finished = false;
	const finish = () => {
		if (finished) return;
		finished = true;
		const next = completeWatering(els, garden);
		revealGrown(els, next);
	};

	const fallback = window.setTimeout(finish, FALLBACK_MS);

	try {
		const Ctor = await loadDotLottie();
		destroyPlayer();

		player = new Ctor({
			canvas: els.canvas,
			src: LOTTIE_SRC,
			autoplay: true,
			loop: false,
		});
		try {
			player.resize();
		} catch {
			/* ignore */
		}

		const onComplete = () => {
			window.clearTimeout(fallback);
			player?.removeEventListener("complete", onComplete);
			finish();
		};
		const onLoadError = () => {
			window.clearTimeout(fallback);
			player?.removeEventListener("loadError", onLoadError);
			finish();
		};

		player.addEventListener("complete", onComplete);
		player.addEventListener("loadError", onLoadError);
	} catch {
		window.clearTimeout(fallback);
		finish();
	}
}

function bindFooterWater(): void {
	const btn = document.getElementById("footer-water-btn");
	const stage = document.getElementById("footer-water-stage");
	const canvas = document.getElementById(
		"footer-water-canvas",
	) as HTMLCanvasElement | null;
	const sprout = document.getElementById("footer-water-sprout");
	const pick = document.getElementById(
		"footer-water-pick",
	) as HTMLButtonElement | null;
	const note = document.getElementById("footer-water-note");

	if (!btn || !stage || !canvas || !sprout || !pick || !note) return;

	const els: WaterEls = { btn, stage, canvas, sprout, pick, note };
	applyGardenUi(els, readGarden());

	if (btn.dataset.waterBound === "1") return;

	destroyPlayer();
	btn.dataset.waterBound = "1";
	btn.addEventListener("click", () => {
		void runWatering(els);
	});
	pick.addEventListener("click", (event) => {
		event.stopPropagation();
		pickFruit(els);
	});
	note.addEventListener("click", () => {
		note.hidden = true;
		note.classList.remove("is-open");
	});
}

export function initFooterWater(): void {
	bindFooterWater();
}

initFooterWater();

if (!window.__footerWaterSwupBound) {
	window.__footerWaterSwupBound = true;
	document.addEventListener("swup:page:view", () => {
		const canvas = document.getElementById("footer-water-canvas");
		if (player && !canvas) destroyPlayer();
		bindFooterWater();
	});
}
