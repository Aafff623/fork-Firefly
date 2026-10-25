import assert from "node:assert/strict";

const documentTarget = new EventTarget();
Object.assign(globalThis, {
	document: documentTarget,
	window: {
		setTimeout: globalThis.setTimeout,
		clearTimeout: globalThis.clearTimeout,
	},
});

const { bootPageLifecycle, currentEpoch, isCurrentEpoch, onPageView } =
	await import("../src/lib/page-lifecycle");

const viewEpochs: number[] = [];
const offView = onPageView((epoch) => viewEpochs.push(epoch));

bootPageLifecycle();
bootPageLifecycle();
documentTarget.dispatchEvent(new Event("swup:page:view"));
assert.deepEqual(viewEpochs, [0], "onPageView fires on first page:view");
assert.equal(currentEpoch(), 0);
assert.equal(isCurrentEpoch(0), true);

documentTarget.dispatchEvent(new Event("astro:before-swap"));
assert.equal(currentEpoch(), 1);
assert.equal(isCurrentEpoch(0), false, "epoch advances on before-swap");

documentTarget.dispatchEvent(new Event("swup:page:view"));
assert.deepEqual(viewEpochs, [0, 1], "onPageView fires for the new epoch");

const beforeDuplicate = viewEpochs.length;
documentTarget.dispatchEvent(new Event("swup:page:view"));
assert.equal(
	viewEpochs.length,
	beforeDuplicate,
	"duplicate page:view does not notify onPageView",
);

offView();
documentTarget.dispatchEvent(new Event("astro:before-swap"));
documentTarget.dispatchEvent(new Event("swup:page:view"));
assert.equal(viewEpochs.length, beforeDuplicate, "offView removes listener");

console.log("PASS page lifecycle onPageView / epoch");
