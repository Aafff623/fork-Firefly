/**
 * 页脚品牌字：滚到附近再打字，每字由浅入浓。
 * 页脚在 Swup 容器外，只打一次。
 */

const STEP_MS = 92;
const ROOT_MARGIN = "0px 0px -12% 0px";

function prefersReducedMotion(): boolean {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function segmentText(text: string): string[] {
	if (typeof Intl.Segmenter !== "function") return Array.from(text);
	const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
	return Array.from(segmenter.segment(text), (part) => part.segment);
}

function typeWordmark(el: HTMLElement, ink: HTMLElement, text: string) {
	if (el.dataset.typed === "1") return;
	el.dataset.typed = "1";
	ink.replaceChildren();

	const chars = segmentText(text);
	let i = 0;
	const tick = () => {
		if (!ink.isConnected || i >= chars.length) return;
		const ch = document.createElement("span");
		ch.className = "site-footer__wordmark-ch";
		ch.textContent = chars[i];
		ink.appendChild(ch);
		i += 1;
		if (i < chars.length) window.setTimeout(tick, STEP_MS);
	};
	tick();
}

export function initFooterWordmark(): void {
	const el = document.querySelector<HTMLElement>(".site-footer__wordmark");
	if (!el || el.dataset.typed === "1" || el.dataset.wordmarkWatch === "1") {
		return;
	}

	const text = (el.dataset.wordmark || "").trim();
	const ink = el.querySelector<HTMLElement>(".site-footer__wordmark-ink");
	if (!text || !ink) return;

	if (prefersReducedMotion()) {
		ink.textContent = text;
		el.dataset.typed = "1";
		return;
	}

	el.dataset.wordmarkWatch = "1";
	const io = new IntersectionObserver(
		(entries) => {
			if (!entries.some((entry) => entry.isIntersecting)) return;
			io.disconnect();
			typeWordmark(el, ink, text);
		},
		{ threshold: 0.28, rootMargin: ROOT_MARGIN },
	);
	io.observe(el);
}

initFooterWordmark();

if (!window.__footerWordmarkBound) {
	window.__footerWordmarkBound = true;
	document.addEventListener("swup:page:view", initFooterWordmark);
}
