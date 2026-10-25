/**
 * 页面生命周期管理：Swup 每跳创建新 page epoch，旧 epoch 统一清理。
 * 一次性 runtime（Symbol.for guard），per-page 监听 / 定时器 / observer 走 onPage / registerPageCleanup。
 * 目标：消除 Swup 多跳累积的匿名监听器、observer、timer 泄漏。
 */

type Cleanup = () => void;

const GLOBAL_KEY = Symbol.for("__fireflyPageLifecycle");
const BEFORE_SWAP = "astro:before-swap";
const PAGE_READY = "swup:page:view";

type ViewListener = (epoch: number) => void;

interface Lifecycle {
	epoch: number;
	controller: AbortController | null;
	cleanups: Set<Cleanup>;
	viewListeners: Set<ViewListener>;
	booted: boolean;
	/** 首屏 page:view 只认领 epoch，不销毁 boot 阶段已登记的清理。 */
	viewed: boolean;
}

function getLifecycle(): Lifecycle {
	const g = globalThis as Record<symbol, Lifecycle | undefined>;
	if (!g[GLOBAL_KEY]) {
		g[GLOBAL_KEY] = {
			epoch: 0,
			controller: null,
			cleanups: new Set(),
			viewListeners: new Set(),
			booted: false,
			viewed: false,
		};
	}
	return g[GLOBAL_KEY] as Lifecycle;
}

function disposeCurrent(): void {
	const lc = getLifecycle();
	lc.controller?.abort();
	lc.controller = null;
	for (const fn of lc.cleanups) {
		try {
			fn();
		} catch {
			/* 清理失败静默 */
		}
	}
	lc.cleanups.clear();
	lc.epoch += 1;
}

function registerPageCleanup(fn: Cleanup): Cleanup {
	const lc = getLifecycle();
	lc.cleanups.add(fn);
	return () => {
		lc.cleanups.delete(fn);
	};
}

function onPage(
	target: EventTarget,
	type: string,
	handler: EventListenerOrEventListenerObject,
	options?: AddEventListenerOptions,
): Cleanup {
	const lc = getLifecycle();
	const capture = typeof options === "boolean" ? options : options?.capture;
	const remove = () => target.removeEventListener(type, handler, capture);
	// before-swap 到 page:view 之间没有 controller；此时挂的监听只能用 cleanup 摘，
	// 否则 signal 为空，永远不会被 abort。
	if (!lc.controller) {
		target.addEventListener(type, handler, options);
		registerPageCleanup(remove);
		return remove;
	}
	target.addEventListener(type, handler, {
		...options,
		signal: lc.controller.signal,
	});
	return remove;
}

function observePage(observer: MutationObserver | ResizeObserver): Cleanup {
	return registerPageCleanup(() => {
		observer.disconnect();
	});
}

/** 订阅每次进入新页面的 page:view；订阅本身跨页存活，返回的 cleanup 才会摘除。 */
function onPageView(listener: ViewListener): Cleanup {
	const lc = getLifecycle();
	lc.viewListeners.add(listener);
	return () => {
		lc.viewListeners.delete(listener);
	};
}

function currentEpoch(): number {
	return getLifecycle().epoch;
}

function isCurrentEpoch(epoch: number): boolean {
	return getLifecycle().epoch === epoch;
}

function boot(): void {
	if (typeof window === "undefined") return;
	const lc = getLifecycle();
	if (lc.booted) return;
	lc.booted = true;
	document.addEventListener(BEFORE_SWAP, () => {
		disposeCurrent();
		lc.viewed = false;
	});
	document.addEventListener(PAGE_READY, () => {
		if (lc.viewed) {
			// 重复 page:view（中间没有 before-swap）只补 controller；
			// 此时清理仍属于当前页，销毁它们会把刚挂好的消费者打掉。
			if (!lc.controller) lc.controller = new AbortController();
			return;
		}
		lc.viewed = true;
		// 首屏：保留 boot 阶段已登记的清理；缺 controller 时补一个给 onPage。
		if (!lc.controller) lc.controller = new AbortController();
		for (const listener of lc.viewListeners) {
			try {
				listener(lc.epoch);
			} catch (error) {
				console.error("[page-lifecycle] onPageView listener failed", error);
			}
		}
	});
	lc.controller = new AbortController();
}

export {
	boot as bootPageLifecycle,
	currentEpoch,
	isCurrentEpoch,
	observePage,
	onPage,
	onPageView,
	registerPageCleanup,
};
