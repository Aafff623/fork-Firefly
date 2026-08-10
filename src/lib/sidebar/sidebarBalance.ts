/**
 * 浏览页侧栏失衡检测：左 sticky 栈被视口裁切 + 右日历下留白。
 * 派发 firefly:sidebar-imbalance / firefly:sidebar-balance，供分类折叠与桌宠钉日历。
 * 文章页 /posts/* 永不判定为失衡。
 */

export const SIDEBAR_IMBALANCE_EVENT = "firefly:sidebar-imbalance";
export const SIDEBAR_BALANCE_EVENT = "firefly:sidebar-balance";

/** 与 SpritePet / 配置默认对齐 */
export const DEFAULT_BALANCE_PARK_MIN_GAP_PX = 160;

const BOOT_KEY = "__fireflySidebarBalanceBooted";

export function isBrowsePostPath(
	pathname = typeof window !== "undefined" ? window.location.pathname : "",
): boolean {
	return /\/posts\//.test(pathname);
}

/** 动态页（含 /dynamic/comments）：左溢出即失衡，不依赖日历下空隙 */
export function isDynamicPath(
	pathname = typeof window !== "undefined" ? window.location.pathname : "",
): boolean {
	return /\/dynamic(\/|$)/.test(pathname);
}

function resolveCalendarEl(): HTMLElement | null {
	const byId = document.getElementById("calendar-widget");
	if (byId instanceof HTMLElement) return byId;
	const layout = document.querySelector(
		"widget-layout.calendar-notebook-widget",
	);
	return layout instanceof HTMLElement ? layout : null;
}

/**
 * 左 sticky 底边（视口坐标）。若分类墙已手风琴收起，按展开后的内容高度回补，
 * 避免「收起→不再溢出→再展开」振荡。
 */
function estimateLeftStickyBottom(left: HTMLElement): number {
	const leftRect = left.getBoundingClientRect();
	let bottom = leftRect.bottom;
	left
		.querySelectorAll<HTMLElement>(
			"widget-layout.categories-widget.categories-widget--folded",
		)
		.forEach((widget) => {
			const wrap = widget.querySelector<HTMLElement>(".collapse-wrapper");
			if (!wrap) return;
			// height:0 时 scrollHeight 仍是内容自然高度
			bottom += Math.max(0, wrap.scrollHeight);
		});
	return bottom;
}

/**
 * 失衡：非文章页 && 左 sticky 底超出视口 &&
 * （无日历 → true；有日历 → 日历在视口内且底边到视口底空隙 ≥ minGapPx）
 */
export function isSidebarImbalanced(
	minGapPx = DEFAULT_BALANCE_PARK_MIN_GAP_PX,
): boolean {
	if (typeof window === "undefined" || isBrowsePostPath()) return false;

	const left = document.getElementById("left-sidebar-sticky");
	if (!(left instanceof HTMLElement) || left.getClientRects().length === 0) {
		return false;
	}
	const leftRect = left.getBoundingClientRect();
	if (leftRect.height < 40 && !left.querySelector(".categories-widget--folded")) {
		return false;
	}
	const leftOverflows =
		estimateLeftStickyBottom(left) > window.innerHeight + 4;
	if (!leftOverflows) return false;

	// 动态页右侧有「动态目录」抬高日历，底边空隙常不足 minGap；
	// 左栏裁切时仍应折叠分类，不依赖日历下留白。
	if (isDynamicPath()) return true;

	const calendar = resolveCalendarEl();
	if (!calendar || calendar.getClientRects().length === 0) {
		// 无日历：仍折叠分类；宠走视口右下兜底
		return true;
	}

	const calRect = calendar.getBoundingClientRect();
	const calendarInView =
		calRect.height > 20 &&
		calRect.top < window.innerHeight - 8 &&
		calRect.bottom > 8;
	if (!calendarInView) return false;

	const gap = window.innerHeight - calRect.bottom;
	return gap >= minGapPx;
}

export type SidebarBalanceListener = (imbalanced: boolean) => void;

/**
 * 幂等 boot：scroll / resize / sidebar-layout / swup 后重算并派发事件。
 * 返回 stop 函数。
 */
export function bootSidebarBalance(options?: {
	minGapPx?: number;
}): () => void {
	if (typeof window === "undefined") return () => {};

	const g = window as Window & { [BOOT_KEY]?: boolean };
	if (g[BOOT_KEY]) {
		// 已 boot：仍立刻跑一轮，方便晚挂载的订阅者对齐
		queueMicrotask(() => {
			const imbalanced = isSidebarImbalanced(
				options?.minGapPx ?? DEFAULT_BALANCE_PARK_MIN_GAP_PX,
			);
			document.documentElement.classList.toggle(
				"sidebar-imbalanced",
				imbalanced,
			);
			document.dispatchEvent(
				new CustomEvent(
					imbalanced ? SIDEBAR_IMBALANCE_EVENT : SIDEBAR_BALANCE_EVENT,
				),
			);
		});
		return () => {};
	}
	g[BOOT_KEY] = true;

	const minGapPx = options?.minGapPx ?? DEFAULT_BALANCE_PARK_MIN_GAP_PX;
	let last: boolean | null = null;
	let raf = 0;

	const publish = (imbalanced: boolean) => {
		document.documentElement.classList.toggle(
			"sidebar-imbalanced",
			imbalanced,
		);
		document.dispatchEvent(
			new CustomEvent(
				imbalanced ? SIDEBAR_IMBALANCE_EVENT : SIDEBAR_BALANCE_EVENT,
			),
		);
	};

	const tick = () => {
		raf = 0;
		const next = isSidebarImbalanced(minGapPx);
		if (next === last) return;
		last = next;
		publish(next);
	};

	const schedule = () => {
		if (raf) return;
		raf = requestAnimationFrame(tick);
	};

	window.addEventListener("scroll", schedule, { passive: true });
	window.addEventListener("resize", schedule);
	document.addEventListener("firefly:sidebar-layout", schedule);
	document.addEventListener("swup:contentReplaced", () => {
		last = null;
		schedule();
	});
	document.addEventListener("astro:page-load", () => {
		last = null;
		schedule();
	});

	schedule();
	// sticky 贴顶有时晚一帧
	window.setTimeout(schedule, 120);
	window.setTimeout(schedule, 400);

	return () => {
		window.removeEventListener("scroll", schedule);
		window.removeEventListener("resize", schedule);
		if (raf) cancelAnimationFrame(raf);
		g[BOOT_KEY] = false;
	};
}
