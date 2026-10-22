import assert from "node:assert/strict";

const documentTarget = new EventTarget();
const windowShim = {
	setTimeout: (callback: () => void, delay?: number) =>
		globalThis.setTimeout(callback, delay),
	clearTimeout: (id: ReturnType<typeof globalThis.setTimeout>) =>
		globalThis.clearTimeout(id),
	requestAnimationFrame: (callback: FrameRequestCallback) =>
		globalThis.setTimeout(() => callback(Date.now()), 0),
	cancelAnimationFrame: (id: ReturnType<typeof globalThis.setTimeout>) =>
		globalThis.clearTimeout(id),
};

Object.assign(globalThis, { document: documentTarget, window: windowShim });

const { bootPageLifecycle, observePage, onPage, registerPageCleanup } =
	await import("../src/lib/page-lifecycle");

let hits = 0;
let cleaned = 0;
const handler = () => {
	hits += 1;
};

bootPageLifecycle();
bootPageLifecycle(); // 幂等，不应重复挂载
onPage(documentTarget, "lifecycle:test", handler);
registerPageCleanup(() => {
	cleaned += 1;
});

documentTarget.dispatchEvent(new Event("swup:page:view"));
assert.equal(cleaned, 0, "首个 page:view 不应销毁 boot 阶段的清理");

documentTarget.dispatchEvent(new Event("lifecycle:test"));
assert.equal(hits, 1, "page listener should fire in the first epoch");

documentTarget.dispatchEvent(new Event("astro:before-swap"));
assert.equal(cleaned, 1, "page cleanup should run on before-swap");

documentTarget.dispatchEvent(new Event("lifecycle:test"));
assert.equal(hits, 1, "page listener must be removed after before-swap");

documentTarget.dispatchEvent(new Event("swup:page:view"));
let secondCleaned = 0;
registerPageCleanup(() => {
	secondCleaned += 1;
});
documentTarget.dispatchEvent(new Event("astro:before-swap"));
assert.equal(secondCleaned, 1, "new epoch should register new page cleanups");

// 重复 page:view（中间没有 before-swap）不能把当前页刚登记的清理销毁掉
documentTarget.dispatchEvent(new Event("swup:page:view"));
let duplicateCleaned = 0;
registerPageCleanup(() => {
	duplicateCleaned += 1;
});
documentTarget.dispatchEvent(new Event("swup:page:view"));
assert.equal(duplicateCleaned, 0, "duplicate page:view keeps live cleanups");
documentTarget.dispatchEvent(new Event("astro:before-swap"));
assert.equal(duplicateCleaned, 1, "cleanup still runs on the next swap");

// before-swap 与 page:view 之间没有 controller，此时挂的监听也不能漏
documentTarget.dispatchEvent(new Event("astro:before-swap"));
let gapHits = 0;
const gapHandler = () => {
	gapHits += 1;
};
onPage(documentTarget, "lifecycle:gap", gapHandler);
documentTarget.dispatchEvent(new Event("lifecycle:gap"));
assert.equal(gapHits, 1, "gap listener is live");
documentTarget.dispatchEvent(new Event("swup:page:view"));
documentTarget.dispatchEvent(new Event("lifecycle:gap"));
assert.equal(gapHits, 2, "gap listener survives into the adopted epoch");
documentTarget.dispatchEvent(new Event("astro:before-swap"));
documentTarget.dispatchEvent(new Event("lifecycle:gap"));
assert.equal(gapHits, 2, "gap listener removed by the next swap");

documentTarget.dispatchEvent(new Event("swup:page:view"));
let disconnected = 0;
observePage({
	disconnect: () => {
		disconnected += 1;
	},
} as unknown as MutationObserver);
documentTarget.dispatchEvent(new Event("astro:before-swap"));
assert.equal(disconnected, 1, "observePage cleanup should disconnect observer");

console.log("PASS page lifecycle boot / epoch / cleanup / abort");
