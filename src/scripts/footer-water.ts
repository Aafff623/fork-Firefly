/**
 * Footer「上次浇灌」A+B 融合特效：
 * 胶囊自反馈 + 旁侧舞台；Lottie 浇水壶；自写 SVG 小草承水/轻长。
 * 首次点击才懒加载 @lottiefiles/dotlottie-web。
 */

import type { DotLottie } from "@lottiefiles/dotlottie-web";

const LOTTIE_SRC = "/assets/effects/watering-can.json";
const FALLBACK_MS = 2200;
const GROWN_HOLD_MS = 420;
const CLOSE_MS = 280;

let playing = false;
let player: DotLottie | null = null;
let DotLottieCtor: typeof DotLottie | null = null;

function prefersReducedMotion(): boolean {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

async function loadDotLottie(): Promise<typeof DotLottie> {
	if (DotLottieCtor) return DotLottieCtor;
	const mod = await import("@lottiefiles/dotlottie-web");
	DotLottieCtor = mod.DotLottie;
	// 自托管 WASM，避免 Vite 预构建/CDN 拉失败
	DotLottieCtor.setWasmUrl("/assets/effects/dotlottie-player.wasm");
	return DotLottieCtor;
}

function closeStage(
	btn: HTMLElement,
	stage: HTMLElement,
	sprout: HTMLElement,
): void {
	stage.classList.remove("is-open");
	sprout.classList.remove("is-thirsty", "is-grown");
	btn.classList.remove("is-watering");
	window.setTimeout(() => {
		playing = false;
	}, CLOSE_MS);
}

async function runWatering(
	btn: HTMLElement,
	stage: HTMLElement,
	canvas: HTMLCanvasElement,
	sprout: HTMLElement,
): Promise<void> {
	if (playing) return;
	playing = true;

	btn.classList.add("is-watering");

	if (prefersReducedMotion()) {
		window.setTimeout(() => {
			btn.classList.remove("is-watering");
			playing = false;
		}, 360);
		return;
	}

	stage.classList.add("is-open");
	sprout.classList.add("is-thirsty");
	sprout.classList.remove("is-grown");

	let finished = false;
	const finish = () => {
		if (finished) return;
		finished = true;
		sprout.classList.remove("is-thirsty");
		sprout.classList.add("is-grown");
		window.setTimeout(() => {
			closeStage(btn, stage, sprout);
		}, GROWN_HOLD_MS);
	};

	const fallback = window.setTimeout(finish, FALLBACK_MS);

	try {
		const Ctor = await loadDotLottie();
		if (player) {
			try {
				player.destroy();
			} catch {
				/* ignore */
			}
			player = null;
		}

		player = new Ctor({
			canvas,
			src: LOTTIE_SRC,
			autoplay: true,
			loop: false,
		});

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

export function initFooterWater(): void {
	const btn = document.getElementById("footer-water-btn");
	const stage = document.getElementById("footer-water-stage");
	const canvas = document.getElementById(
		"footer-water-canvas",
	) as HTMLCanvasElement | null;
	const sprout = document.getElementById("footer-water-sprout");

	if (!btn || !stage || !canvas || !sprout) return;
	if (btn.dataset.waterBound === "1") return;
	btn.dataset.waterBound = "1";

	btn.addEventListener("click", () => {
		void runWatering(btn, stage, canvas, sprout);
	});
}

initFooterWater();
