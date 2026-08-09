/**
 * 页面生命周期管理：Swup 每跳创建新 page epoch，旧 epoch 统一清理。
 * 一次性 runtime（Symbol.for guard），per-page 监听 / 定时器 / observer 走 onPage / registerPageCleanup。
 * 目标：消除 Swup 多跳累积的匿名监听器、observer、timer 泄漏。
 */

type Cleanup = () => void;

const GLOBAL_KEY = Symbol.for("__fireflyPageLifecycle");
const BEFORE_SWAP = "astro:before-swap";
const PAGE_READY = "swup:page:view";

interface Lifecycle {
	epoch: number;
	controller: AbortController | null;
	cleanups: Set<Cleanup>;
	booted: boolean;
}

function getLifecycle(): Lifecycle {
	const g = globalThis as Record<symbol, Lifecycle | undefined>;
	if (!g[GLOBAL_KEY]) {
		g[GLOBAL_KEY] = { epoch: 0, controller: null, cleanups: new Set(), booted: false };
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

function startPage(): void {
	const lc = getLifecycle();
	disposeCurrent();
	lc.controller = new AbortController();
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
	target.addEventListener(type, handler, { ...options, signal: lc.controller?.signal });
	return () => target.removeEventListener(type, handler);
}

function observePage(observer: MutationObserver | ResizeObserver): Cleanup {
	return registerPageCleanup(() => {
		observer.disconnect();
	});
}

function setPageTimeout(callback: () => void, delay: number): Cleanup {
	const id = window.setTimeout(callback, delay);
	return registerPageCleanup(() => window.clearTimeout(id));
}

function requestPageFrame(callback: FrameRequestCallback): Cleanup {
	const id = window.requestAnimationFrame(callback);
	return registerPageCleanup(() => window.cancelAnimationFrame(id));
}

function mountOnPageView(mount: () => Cleanup): void {
	registerPageCleanup(mount());
}

function boot(): void {
	if (typeof window === "undefined") return;
	const lc = getLifecycle();
	if (lc.booted) return;
	lc.booted = true;
	document.addEventListener(BEFORE_SWAP, () => disposeCurrent());
	document.addEventListener(PAGE_READY, () => startPage());
}

export {
	startPage,
	disposeCurrent as disposePage,
	registerPageCleanup,
	onPage,
	observePage,
	setPageTimeout,
	requestPageFrame,
	mountOnPageView,
	boot as bootPageLifecycle,
};
