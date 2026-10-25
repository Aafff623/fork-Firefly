/**
 * 评论运行时行为测试：单实例、重复 mount、dispose、切页重挂。
 * 用假 adapter 穿过 runtime 的公开接口；页面生命周期用真实 seam + 假 document 事件驱动。
 */
import assert from "node:assert/strict";
import type { CommentAdapter } from "../src/lib/comment-runtime";

interface FakeRoot {
	isConnected: boolean;
}

interface AdapterLog {
	created: number;
	mounts: FakeRoot[];
	disposes: number;
	active: number;
}

const roots = new Map<string, FakeRoot>();

const documentTarget = Object.assign(new EventTarget(), {
	querySelector: (selector: string): FakeRoot | null =>
		roots.get(selector) ?? null,
});

Object.assign(globalThis, {
	document: documentTarget,
	window: {
		setTimeout: globalThis.setTimeout,
		clearTimeout: globalThis.clearTimeout,
	},
});

const { createCommentRuntime } = await import("../src/lib/comment-runtime");

function createLog(): AdapterLog {
	return { created: 0, mounts: [], disposes: 0, active: 0 };
}

function createFactory(log: AdapterLog): () => CommentAdapter {
	return () => {
		log.created += 1;
		return {
			mount(root: HTMLElement) {
				log.mounts.push(root as unknown as FakeRoot);
				log.active += 1;
			},
			dispose() {
				log.disposes += 1;
				log.active -= 1;
			},
		};
	};
}

function fakeRoot(isConnected = true): FakeRoot & { isConnected: boolean } {
	return { isConnected };
}

function pageView(): void {
	documentTarget.dispatchEvent(new Event("swup:page:view"));
}

function swap(): void {
	documentTarget.dispatchEvent(new Event("astro:before-swap"));
}

const giscusLog = createLog();
const walineLog = createLog();
const brokenLog = createLog();

const runtime = createCommentRuntime({
	adapters: {
		giscus: {
			selector: "[data-giscus-host]",
			createAdapter: createFactory(giscusLog),
		},
		waline: {
			selector: ".waline-shell",
			createAdapter: createFactory(walineLog),
		},
		broken: {
			selector: "[data-broken-host]",
			createAdapter: () => {
				brokenLog.created += 1;
				return {
					mount() {
						brokenLog.mounts.push({ isConnected: true });
						throw new Error("adapter mount failed");
					},
					dispose() {
						brokenLog.disposes += 1;
					},
				};
			},
		},
		"broken-factory": {
			selector: "[data-broken-factory]",
			createAdapter: () => {
				throw new Error("adapter factory failed");
			},
		},
	},
});

// 1. 首次 mount 建实例
const first = fakeRoot();
assert.equal(runtime.isMounted(), false, "fresh runtime is idle");
runtime.mount("giscus", first as unknown as HTMLElement);
assert.equal(runtime.isMounted(), true, "mount marks runtime active");
assert.equal(giscusLog.created, 1, "adapter factory runs once");
assert.deepEqual(giscusLog.mounts, [first], "adapter mounts on the given root");
assert.equal(giscusLog.active, 1, "only one live adapter");

// 2. 重复 mount 幂等
runtime.mount("giscus", first as unknown as HTMLElement);
assert.equal(giscusLog.created, 1, "duplicate mount does not recreate adapter");
assert.equal(giscusLog.mounts.length, 1, "duplicate mount does not remount");
assert.equal(giscusLog.active, 1, "duplicate mount keeps one live adapter");

// 3. dispose 幂等，dispose 后可再次 mount
runtime.dispose();
assert.equal(runtime.isMounted(), false, "dispose marks runtime idle");
assert.equal(giscusLog.disposes, 1, "dispose tears the adapter down");
assert.equal(giscusLog.active, 0, "no live adapter after dispose");
runtime.dispose();
assert.equal(giscusLog.disposes, 1, "dispose is idempotent");
runtime.mount("giscus", first as unknown as HTMLElement);
assert.equal(giscusLog.created, 2, "mount after dispose creates a new adapter");
assert.equal(giscusLog.active, 1, "remounted adapter is live");

// 4. 同通道换根：旧实例先销毁，旧 cleanup 不得误杀新实例
const second = fakeRoot();
first.isConnected = false;
roots.set("[data-giscus-host]", second);
runtime.mount("giscus", second as unknown as HTMLElement);
assert.equal(giscusLog.created, 3, "different root creates a new adapter");
assert.equal(giscusLog.disposes, 2, "old adapter disposed on root change");
assert.equal(giscusLog.active, 1, "new adapter is the only live one");
swap();
assert.equal(
	giscusLog.disposes,
	3,
	"swap disposes the live adapter exactly once",
);
assert.equal(runtime.isMounted(), false, "swap leaves the runtime idle");

// 5. 切页：page:view 用选择器找回新根并重挂
const third = fakeRoot();
second.isConnected = false;
roots.set("[data-giscus-host]", third);
pageView();
assert.equal(runtime.isMounted(), true, "page view mounts the channel again");
assert.equal(giscusLog.created, 4, "page view creates a fresh adapter");
assert.deepEqual(
	giscusLog.mounts.at(-1),
	third,
	"page view mounts the new root from the selector",
);

// 6. 重复 page:view 不重复挂载（根仍连着）
pageView();
assert.equal(giscusLog.created, 4, "duplicate page view does not remount");
assert.equal(giscusLog.active, 1, "duplicate page view keeps one instance");

// 7. 无评论页：清理后不重挂
third.isConnected = false;
roots.delete("[data-giscus-host]");
swap();
assert.equal(
	giscusLog.disposes,
	4,
	"swap disposes the adapter on a comment-less page",
);
pageView();
assert.equal(runtime.isMounted(), false, "comment-less page stays idle");
assert.equal(giscusLog.created, 4, "comment-less page creates no adapter");

// 8. 再回到有评论的页面：脚本只跑过一次也能重挂
const fourth = fakeRoot();
roots.set("[data-giscus-host]", fourth);
swap();
pageView();
assert.equal(
	runtime.isMounted(),
	true,
	"returning page remounts from the selector",
);
assert.equal(giscusLog.created, 5, "returning page creates an adapter");
assert.deepEqual(giscusLog.mounts.at(-1), fourth);

// 9. 换通道：单实例，旧通道先销毁
const walineRoot = fakeRoot();
roots.set(".waline-shell", walineRoot);
runtime.mount("waline", walineRoot as unknown as HTMLElement);
assert.equal(
	giscusLog.active,
	0,
	"switching channel disposes the previous adapter",
);
assert.equal(walineLog.active, 1, "new channel adapter is live");
assert.equal(walineLog.mounts.length, 1);

// 10. 切页后按最近使用的通道重挂
const nextWalineRoot = fakeRoot();
walineRoot.isConnected = false;
roots.set(".waline-shell", nextWalineRoot);
swap();
pageView();
assert.equal(walineLog.created, 2, "page view remounts the Waline adapter");
assert.deepEqual(walineLog.mounts.at(-1), nextWalineRoot);

// 11. adapter 抛错不留下“已挂载”假状态
roots.set("[data-broken-host]", fakeRoot());
const originalError = console.error;
console.error = () => {};
try {
	runtime.mount(
		"broken",
		roots.get("[data-broken-host]") as unknown as HTMLElement,
	);
} finally {
	console.error = originalError;
}
assert.equal(
	runtime.isMounted(),
	false,
	"failed adapter mount leaves runtime idle",
);
assert.equal(brokenLog.mounts.length, 1, "broken adapter was attempted once");

// 12. adapter 工厂抛错同样不留下假状态
roots.set("[data-broken-factory]", fakeRoot());
console.error = () => {};
try {
	runtime.mount(
		"broken-factory",
		roots.get("[data-broken-factory]") as unknown as HTMLElement,
	);
} finally {
	console.error = originalError;
}
assert.equal(
	runtime.isMounted(),
	false,
	"failed adapter factory leaves runtime idle",
);

// 13. 未注册通道 / 空根 安全跳过
runtime.mount("unknown", fakeRoot() as unknown as HTMLElement);
assert.equal(runtime.isMounted(), false, "unregistered channel is a no-op");
assert.equal(giscusLog.active, 0, "giscus stays disposed");

console.log("PASS comment runtime mount / dispose / remount / page swap");
