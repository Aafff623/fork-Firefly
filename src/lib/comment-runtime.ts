/**
 * 评论运行时：同一页面只保留一个评论通道实例，挂载与卸载统一走页面生命周期 seam。
 *
 * 通道实现（adapter）只关心自己的 DOM 与网络；软导航后的重建、换通道时的销毁、
 * 重复挂载的幂等都由这里负责。页面脚本只需 `mount(channel, root)`，
 * 生命周期清理由 `registerPageCleanup` 登记，切页重建由 `onPageView` 触发。
 */

import {
	bootPageLifecycle,
	onPageView,
	registerPageCleanup,
} from "./page-lifecycle";

/** 单个评论通道的挂载/销毁实现：Giscus 与 Waline 各一个，接口一致。 */
export interface CommentAdapter {
	/** 在给定根节点上建立评论实例。重复调用由 runtime 拦截。 */
	mount(root: HTMLElement): void;
	/** 释放实例、observer、定时器与注入节点；必须可重复调用。 */
	dispose(): void;
}

/** 通道登记项：选择器用于软导航后在同一文档里找回该通道的新根。 */
export interface CommentAdapterSlot {
	selector: string;
	createAdapter: () => CommentAdapter;
}

/** 评论运行时的公开接口：挂载、销毁、查询，以及通道登记（由组件脚本完成）。 */
export interface CommentRuntime {
	register(channel: string, slot: CommentAdapterSlot): void;
	mount(channel: string, root: HTMLElement): void;
	dispose(): void;
	isMounted(): boolean;
}

export interface CommentRuntimeOptions {
	/** 测试注入用；生产走 registerCommentAdapter 逐步登记。 */
	adapters?: Record<string, CommentAdapterSlot>;
}

interface ActiveComment {
	channel: string;
	root: HTMLElement;
	adapter: CommentAdapter;
	/** 摘除登记到页面生命周期的清理函数 */
	release: (() => void) | null;
}

interface RuntimeState {
	slots: Map<string, CommentAdapterSlot>;
	/** 最近使用/登记的通道优先，切页时按它找根 */
	priority: string[];
	active: ActiveComment | null;
	started: boolean;
}

/**
 * 创建一个独立的运行时。生产环境用模块级单例（registerCommentAdapter / mountComment），
 * 测试用这个构造函数注入假 adapter，避免碰全局状态。
 */
export function createCommentRuntime(
	options: CommentRuntimeOptions = {},
): CommentRuntime {
	const state: RuntimeState = {
		slots: new Map(),
		priority: [],
		active: null,
		started: false,
	};

	const promote = (channel: string): void => {
		state.priority = [
			channel,
			...state.priority.filter((id) => id !== channel),
		];
	};

	const disposeActive = (): void => {
		const active = state.active;
		if (!active) return;
		state.active = null;
		active.release?.();
		active.release = null;
		try {
			active.adapter.dispose();
		} catch (error) {
			console.error("[comment-runtime] adapter dispose failed", error);
		}
	};

	const mount = (channel: string, root: HTMLElement): void => {
		const slot = state.slots.get(channel);
		if (!slot || !root || root.isConnected === false) return;
		const active = state.active;
		if (active && active.channel === channel && active.root === root) return;

		disposeActive();
		let adapter: CommentAdapter;
		try {
			adapter = slot.createAdapter();
		} catch (error) {
			console.error("[comment-runtime] adapter factory failed", error);
			return;
		}
		const entry: ActiveComment = { channel, root, adapter, release: null };
		state.active = entry;
		promote(channel);
		entry.release = registerPageCleanup(() => {
			// 旧实例的清理可能晚于新实例挂载：只销毁自己那一份
			if (state.active === entry) disposeActive();
		});
		try {
			adapter.mount(root);
		} catch (error) {
			console.error("[comment-runtime] adapter mount failed", error);
			disposeActive();
		}
	};

	const handlePageView = (): void => {
		const active = state.active;
		if (active) {
			// 重复 page:view 或节点被保留时，不重建当前实例
			if (active.root.isConnected) return;
			disposeActive();
		}
		for (const channel of state.priority) {
			const slot = state.slots.get(channel);
			if (!slot) continue;
			const root = document.querySelector(slot.selector) as HTMLElement | null;
			if (!root) continue;
			mount(channel, root);
			return;
		}
	};

	const start = (): void => {
		if (state.started) return;
		state.started = true;
		bootPageLifecycle();
		onPageView(handlePageView);
	};

	const register = (channel: string, slot: CommentAdapterSlot): void => {
		state.slots.set(channel, slot);
		promote(channel);
		start();
	};

	for (const [channel, slot] of Object.entries(options.adapters ?? {})) {
		state.slots.set(channel, slot);
		promote(channel);
	}
	if (state.slots.size > 0) start();

	return {
		register,
		mount,
		dispose: disposeActive,
		isMounted: () => state.active !== null,
	};
}

const RUNTIME_KEY = Symbol.for("__fireflyCommentRuntime");

/**
 * 模块级单例（Symbol.for 挂 globalThis）：即使打包器把本模块拆进多个 chunk，
 * 两个组件的脚本也共享同一个实例、同一个 page:view 订阅。
 */
function getCommentRuntime(): CommentRuntime {
	const scope = globalThis as Record<symbol, CommentRuntime | undefined>;
	const existing = scope[RUNTIME_KEY];
	if (existing) return existing;
	const runtime = createCommentRuntime();
	scope[RUNTIME_KEY] = runtime;
	return runtime;
}

/** 组件脚本登记自己的通道实现；可重复调用，后登记的覆盖先登记。 */
export function registerCommentAdapter(
	channel: string,
	slot: CommentAdapterSlot,
): void {
	getCommentRuntime().register(channel, slot);
}

/** 在当前页面挂载通道；重复挂载同一根节点是幂等的。 */
export function mountComment(channel: string, root: HTMLElement): void {
	getCommentRuntime().mount(channel, root);
}
