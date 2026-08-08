/**
 * DEV 专属：「作者阅过」盖章
 * - 仅 pnpm dev 出现小红花；生产构建无按钮、无章
 * - 园主点小红花 → confetti + 印章砸下动画 → localStorage 持久化
 */

const STORAGE_KEY = "firefly-dynamic-owner-seals";

function prefersReducedMotion(): boolean {
	return (
		typeof window !== "undefined" &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches
	);
}

export function readOwnerSeals(): Set<string> {
	if (typeof window === "undefined") return new Set();
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return new Set();
		const list = JSON.parse(raw) as unknown;
		if (!Array.isArray(list)) return new Set();
		return new Set(list.filter((id): id is string => typeof id === "string"));
	} catch {
		return new Set();
	}
}

export function persistOwnerSeal(entryId: string): void {
	if (typeof window === "undefined" || !entryId) return;
	try {
		const next = readOwnerSeals();
		next.add(entryId);
		localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
	} catch {
		// private mode / quota
	}
}

/** 撤销盖章 */
export function clearOwnerSeal(entryId: string): void {
	if (typeof window === "undefined" || !entryId) return;
	try {
		const next = readOwnerSeals();
		if (!next.delete(entryId)) return;
		localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
	} catch {
		// private mode / quota
	}
}

type RectNorm = { x: number; y: number; w: number; h: number };

/** 必须在卸载按钮前同步取样，否则 await 后 getBoundingClientRect 会变 0 → 炸到左上角 */
function captureCardNorm(cardEl: HTMLElement): RectNorm {
	const rect = cardEl.getBoundingClientRect();
	const vw = Math.max(1, window.innerWidth);
	const vh = Math.max(1, window.innerHeight);
	return {
		x: rect.left / vw,
		y: rect.top / vh,
		w: rect.width / vw,
		h: rect.height / vh,
	};
}

/** 在整张动态卡片范围内爆发（多点撒，覆盖卡片区域） */
export async function burstOwnerSealConfetti(
	cardEl: HTMLElement,
): Promise<void> {
	if (prefersReducedMotion()) return;
	const box = captureCardNorm(cardEl);
	const confetti = (await import("canvas-confetti")).default;
	const colors = ["#ffb7c5", "#ff6b6b", "#ffe4ec", "#fdfaf3", "#e0483d", "#ecd9ae"];

	const cx = box.x + box.w * 0.5;
	const cy = box.y + box.h * 0.42;
	const left = box.x + box.w * 0.22;
	const right = box.x + box.w * 0.78;
	const top = box.y + box.h * 0.22;
	const mid = box.y + box.h * 0.55;

	const burst = (origin: { x: number; y: number }, count: number, spread: number) => {
		confetti({
			particleCount: count,
			spread,
			startVelocity: 28,
			origin,
			colors,
			zIndex: 12000,
			disableForReducedMotion: true,
		});
	};

	burst({ x: cx, y: cy }, 56, 78);
	burst({ x: left, y: top }, 32, 58);
	burst({ x: right, y: top }, 32, 58);
	burst({ x: left, y: mid }, 24, 52);
	burst({ x: right, y: mid }, 24, 52);
	burst({ x: cx, y: box.y + box.h * 0.72 }, 28, 64);
}
