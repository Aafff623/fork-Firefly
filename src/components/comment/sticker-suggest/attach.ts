/** 旁挂 type-ahead：等 wl-editor 出现后绑定 */ // 中文注释：与视觉镜像同构，失败静默

import { normalizeQuery } from "@/lib/sticker-suggest/normalize";
import type { SuggestItem, SuggestResponse } from "@/lib/sticker-suggest/types";
import { getCachedSuggest, setCachedSuggest } from "./client-cache";
import { extractQueryToken } from "./extract-query";
import { insertSuggestMarkdown, migrateStickerMarkdownInText } from "./insert";
import { createOverlay, isWalinePopupOpen } from "./overlay";

/** HMR/硬刷新后识别绑定版本；升版本会卸掉旧监听并重绑 */ // 中文注释
const BIND_VERSION = "shortcode-v5-layout";

const editorListenerAbort = new WeakMap<HTMLTextAreaElement, AbortController>();

export type StickerSuggestBootOptions = {
	endpoint: string;
	debounceMs: number;
	minChars: number;
	maxResults: number;
};

function resolveEndpoint(path: string): string {
	if (/^https?:\/\//i.test(path)) return path;
	const base = `${window.location.origin}${path.startsWith("/") ? "" : "/"}`;
	return new URL(path, base).href;
}

/** 客户端总超时：略长于服务端 Agent 2.8s */ // 中文注释
const FETCH_TIMEOUT_MS = 4500;
/** 超过此长度的整句不打 Agent */ // 中文注释
const AGENT_MAX_CHARS = 8;

async function fetchSuggest(
	endpoint: string,
	q: string,
	signal?: AbortSignal,
	l1Only = false,
): Promise<SuggestResponse> {
	const url = new URL(endpoint);
	url.searchParams.set("q", q);
	if (l1Only) url.searchParams.set("l1Only", "1");
	const res = await fetch(url.href, {
		method: "GET",
		headers: { Accept: "application/json" },
		signal,
	});
	if (res.status === 429) {
		return { source: "none", items: [] };
	}
	if (!res.ok) {
		return { source: "none", items: [] };
	}
	return (await res.json()) as SuggestResponse;
}

function attachToEditor(
	walineRoot: HTMLElement,
	editor: HTMLTextAreaElement,
	opts: StickerSuggestBootOptions,
): void {
	if (editor.dataset.stickerSuggestBound === BIND_VERSION) return;

	// 卸掉旧版监听，避免第二次 Tab 仍走过期的 lastTokenRange 逻辑 // 中文注释
	editorListenerAbort.get(editor)?.abort();
	const listenerAc = new AbortController();
	editorListenerAbort.set(editor, listenerAc);
	const { signal } = listenerAc;

	editor.dataset.stickerSuggestBound = BIND_VERSION;

	const host = editor.parentElement;
	if (!host) return;
	host.classList.add("waline-sticker-suggest-host");
	// host 需作定位上下文，供浮层 offset 相对 textarea // 中文注释
	if (getComputedStyle(host).position === "static") {
		host.style.position = "relative";
	}
	// 去掉旧浮层，防止重复挂载 // 中文注释
	for (const old of host.querySelectorAll(".waline-sticker-suggest")) {
		old.remove();
	}
	// 只保留一个视觉镜像，删掉多余叠层 // 中文注释
	const mirrors = [...host.querySelectorAll(".waline-editor-visual")];
	mirrors.slice(1).forEach((node) => node.remove());

	/** 最近一次可应用的触发词区间（供 Tab 插在词后） */ // 中文注释
	let lastTokenRange: { start: number; end: number } | null = null;
	/** 当前浮层对应的查询 key；与光标词不一致时禁止 Tab，防插回旧位置 */ // 中文注释
	let activeSuggestKey: string | null = null;

	const pickItem = (item: SuggestItem) => {
		// 应用当下重新截词，绝不回退到可能过期的 lastTokenRange // 中文注释
		const live = extractQueryToken(
			editor.value,
			editor.selectionStart,
			opts.minChars,
		);
		const liveKey = live ? normalizeQuery(live.text) : null;
		if (
			!live ||
			!liveKey ||
			(activeSuggestKey && liveKey !== activeSuggestKey)
		) {
			// 光标词与当前候选不一致时丢弃，避免插到旧位置 // 中文注释
			activeSuggestKey = null;
			lastTokenRange = null;
			overlay.hide();
			return;
		}
		const range = { start: live.start, end: live.end };
		insertSuggestMarkdown(editor, item, range);
		lastTokenRange = null;
		activeSuggestKey = null;
		overlay.hide();
	};

	/** Waline 常无 input 事件地恢复 localStorage 草稿；把旧 sticker Markdown 迁成短码 */ // 中文注释
	const migrateDraftIfNeeded = () => {
		const before = editor.value;
		if (!/!\[sticker:/i.test(before)) return;
		const after = migrateStickerMarkdownInText(before);
		if (after === before) return;
		const start = editor.selectionStart;
		const end = editor.selectionEnd;
		editor.value = after;
		const delta = after.length - before.length;
		editor.setSelectionRange(
			Math.max(0, start + delta),
			Math.max(0, end + delta),
		);
		editor.dispatchEvent(new Event("input", { bubbles: true }));
		// 同步写回 Waline localStorage，避免下次又灌回旧 Markdown // 中文注释
		try {
			for (let i = 0; i < localStorage.length; i++) {
				const k = localStorage.key(i);
				if (!k) continue;
				const low = k.toLowerCase();
				if (!low.includes("waline") && !low.includes("wl_")) continue;
				const raw = localStorage.getItem(k);
				if (!raw || !raw.includes("![sticker:")) continue;
				try {
					const parsed = JSON.parse(raw) as { comment?: unknown };
					if (typeof parsed.comment === "string") {
						parsed.comment = migrateStickerMarkdownInText(parsed.comment);
						localStorage.setItem(k, JSON.stringify(parsed));
						continue;
					}
				} catch {
					/* 非 JSON 草稿 */
				}
				localStorage.setItem(k, migrateStickerMarkdownInText(raw));
			}
		} catch {
			/* ignore */
		}
	};

	migrateDraftIfNeeded();
	// 若编辑器里已有「短码紧挨短码」的坏草稿，直接清空，避免一进来就叠在开头 // 中文注释
	if (/:[a-z0-9_+-]+:\s*:[a-z0-9_+-]+:/i.test(editor.value)) {
		editor.value = "";
		editor.dispatchEvent(new Event("input", { bubbles: true }));
	}
	// 草稿常在 init 后异步写回，多拍几次兜住无 input 的赋值 // 中文注释
	const migrateTimers: number[] = [];
	for (const ms of [0, 50, 200, 600, 1200]) {
		migrateTimers.push(window.setTimeout(() => migrateDraftIfNeeded(), ms));
	}

	const overlay = createOverlay(editor, {
		onPick(item) {
			pickItem(item);
		},
	});

	signal.addEventListener("abort", () => {
		for (const id of migrateTimers) window.clearTimeout(id);
		overlay.destroy();
	});

	const endpoint = resolveEndpoint(opts.endpoint);
	let timer: ReturnType<typeof setTimeout> | undefined;
	let seq = 0;
	let abort: AbortController | undefined;

	/** 无候选时完全不展示，避免打断打字 */ // 中文注释
	const hideQuiet = () => {
		lastTokenRange = null;
		activeSuggestKey = null;
		overlay.hide();
	};

	const showHits = (items: SuggestItem[], suggestKey: string) => {
		if (!items.length) {
			hideQuiet();
			return;
		}
		activeSuggestKey = suggestKey;
		overlay.showItems(items.slice(0, opts.maxResults));
	};

	const run = async () => {
		if (isWalinePopupOpen(walineRoot)) {
			hideQuiet();
			return;
		}
		const panel = editor.closest(".waline-editor-collapsible");
		if (
			panel instanceof HTMLElement &&
			panel.classList.contains("waline-editor-collapsible") &&
			!panel.classList.contains("waline-editor-expanded")
		) {
			hideQuiet();
			return;
		}

		const token = extractQueryToken(
			editor.value,
			editor.selectionStart,
			opts.minChars,
		);
		if (!token) {
			hideQuiet();
			return;
		}
		lastTokenRange = { start: token.start, end: token.end };

		const key = normalizeQuery(token.text);
		const cached = getCachedSuggest(key);
		if (cached) {
			showHits(cached.items, key);
			return;
		}

		const my = ++seq;
		abort?.abort();
		abort = new AbortController();
		const timeout = setTimeout(() => abort?.abort(), FETCH_TIMEOUT_MS);
		// 换词请求中：先收起旧候选，全程不显示加载/空态文案 // 中文注释
		overlay.hide();
		activeSuggestKey = null;
		try {
			const data = await fetchSuggest(
				endpoint,
				token.text,
				abort.signal,
				token.text.length > AGENT_MAX_CHARS,
			);
			if (my !== seq) return;
			setCachedSuggest(key, data);
			showHits(data.items, key);
		} catch {
			if (my === seq) overlay.hide();
		} finally {
			clearTimeout(timeout);
		}
	};

	const schedule = () => {
		if (timer) clearTimeout(timer);
		// 一打字先收起旧候选，防止盯着旧浮层按 Tab 插到旧词后面 // 中文注释
		if (overlay.hasSelectable()) {
			overlay.hide();
			lastTokenRange = null;
		}
		timer = setTimeout(() => {
			void run();
		}, opts.debounceMs);
	};

	editor.addEventListener("input", schedule, { signal });
	editor.addEventListener("keyup", schedule, { signal });
	editor.addEventListener("click", schedule, { signal });
	editor.addEventListener(
		"blur",
		() => {
			setTimeout(hideQuiet, 180);
		},
		{ signal },
	);

	// Tab：有候选时在当前词后插入首选（保留原文），光标跟在表情后 // 中文注释
	editor.addEventListener(
		"keydown",
		(event) => {
			if (
				event.key !== "Tab" ||
				event.shiftKey ||
				event.altKey ||
				event.ctrlKey ||
				event.metaKey
			) {
				return;
			}
			if (!overlay.hasSelectable()) return;
			const item = overlay.getActiveItem();
			if (!item) return;
			event.preventDefault();
			event.stopPropagation();
			pickItem(item);
		},
		{ signal },
	);

	walineRoot.addEventListener("waline-editor-reset", hideQuiet, { signal });

	walineRoot.addEventListener(
		"click",
		() => {
			if (isWalinePopupOpen(walineRoot)) hideQuiet();
		},
		{ capture: true, signal },
	);
}

export function attachStickerSuggest(
	walineRoot: HTMLElement,
	opts: StickerSuggestBootOptions,
): void {
	const tryAttach = (): boolean => {
		const editor = walineRoot.querySelector("textarea.wl-editor");
		if (!(editor instanceof HTMLTextAreaElement)) return false;
		attachToEditor(walineRoot, editor, opts);
		return true;
	};

	tryAttach();
	// Waline 会重建 textarea：持续观察，避免监听挂在已卸载节点上 // 中文注释
	if (walineRoot.dataset.stickerSuggestMo === "1") return;
	walineRoot.dataset.stickerSuggestMo = "1";
	const mo = new MutationObserver(() => {
		tryAttach();
	});
	mo.observe(walineRoot, { childList: true, subtree: true });
}

/** 从 shell data 属性启动（供 Astro 打包脚本调用） */ // 中文注释：避免 inline define:vars 无法 import
export function attachStickerSuggestFromShell(): void {
	const shell = document.querySelector(".waline-shell[data-sticker-suggest]");
	if (!(shell instanceof HTMLElement)) return;
	const raw = shell.getAttribute("data-sticker-suggest");
	if (!raw) return;
	let opts: StickerSuggestBootOptions;
	try {
		opts = JSON.parse(raw) as StickerSuggestBootOptions;
	} catch {
		return;
	}
	const root = document.querySelector("#waline");
	if (!(root instanceof HTMLElement)) {
		const mo = new MutationObserver(() => {
			const el = document.querySelector("#waline");
			if (el instanceof HTMLElement) {
				mo.disconnect();
				attachStickerSuggest(el, opts);
			}
		});
		mo.observe(document.body, { childList: true, subtree: true });
		setTimeout(() => mo.disconnect(), 10000);
		return;
	}
	attachStickerSuggest(root, opts);
}
