import { init, type WalineInstance } from "@waline/client/full";

const MAX_BYTES = 5 * 1024 * 1024;
let swupHooksRegistered = false;

/** 本次会话评论区上传成功的图（仅这些允许 DELETE 同步删桶） */
const managedCommentImageUrls = new Set<string>();
/** 进行中的上传，取消占位时 abort */
let activeUploadAbort: AbortController | null = null;
/** 最近一次 boot 的 uploadApi，dispose 时清孤儿用 */
let lastUploadApi = "";

type WalineInitConfig = Record<string, unknown>;

/**
 * Waline 生命周期控制器：记录本次 boot 的实例 / observer / 外部事件。
 * Swup 离页时 disposeWaline() 统一销毁，避免 Vue 实例 + 监听器/observer 跨跳累积。
 */
interface WalineRuntime {
	/** document/window + 元素级监听统一挂在此 signal，dispose 时 abort 即全部移除 */
	abort: AbortController | null;
	/** 本次 boot 创建的所有 MutationObserver / ResizeObserver */
	observers: Set<MutationObserver | ResizeObserver>;
	/** init() 返回的 Waline 实例 */
	instance: WalineInstance | null;
	/** 宿主 shell / root，dispose 时重置状态用 */
	shellEl: HTMLElement | null;
	rootEl: HTMLElement | null;
	/** 已销毁标记：保证 disposeWaline 幂等 */
	disposed: boolean;
}

let walineRuntime: WalineRuntime | null = null;

/**
 * 任意 EventTarget（元素级 / document / window）上挂监听统一走此处：
 * 运行时活跃时绑定 runtime 的 AbortSignal，dispose 时随 abort 一次性移除。
 * 这样即使目标元素（如 #waline 容器）本身不被移除，其监听也能被彻底解除，
 * 避免旧评论 DOM 上的元素级 listener 随跨跳累积。
 */
function addSignalListener(
	target: EventTarget,
	type: string,
	handler: EventListener,
	options?: boolean | AddEventListenerOptions,
): void {
	const signal = walineRuntime?.abort?.signal;
	if (signal) {
		const merged =
			typeof options === "boolean" ? { capture: options } : options;
		target.addEventListener(type, handler, { ...merged, signal });
	} else {
		target.addEventListener(type, handler, options);
	}
}

/** 在 document/window 上挂监听；运行时活跃时走 AbortController，dispose 时随 abort 移除 */
function onPageTarget(
	target: Document | Window,
	type: string,
	handler: EventListener,
	options?: AddEventListenerOptions,
): void {
	addSignalListener(target, type, handler, options);
}

/** 把 observer 记入本次 runtime，dispose 时统一 disconnect */
function trackObserver(observer: MutationObserver | ResizeObserver): void {
	if (walineRuntime) walineRuntime.observers.add(observer);
}

/** 当前是否有活跃（未销毁）的 runtime */
function isRuntimeActive(): boolean {
	return walineRuntime !== null && !walineRuntime.disposed;
}

function createRuntime(shellEl: HTMLElement, rootEl: HTMLElement): WalineRuntime {
	// 防御：若上一个 runtime 未收尾（如异常/重 boot 路径），先统一销毁再重建
	disposeWaline();
	const rt: WalineRuntime = {
		abort: new AbortController(),
		observers: new Set(),
		instance: null,
		shellEl,
		rootEl,
		disposed: false,
	};
	walineRuntime = rt;
	return rt;
}

/**
 * 销毁当前 Waline runtime（幂等，连续调用不抛错、不重复销毁）：
 * 1. abort 移除 document/window 及元素级监听（本文件自加的监听全部带 signal）
 * 2. disconnect 所有 MutationObserver / ResizeObserver
 * 3. 派发 autosize:destroy，释放 Waline 内部 autosize 模块级 Map 对 textarea 的引用
 *    （Vue unmount 不会触发 autosize 销毁，旧 textarea 的元素级 input 监听与 window resize 监听会残存）
 * 4. 调用 Waline 实例真实的 destroy() 卸载 Vue
 * 5. 清空 #waline 容器、置空 runtime 全局引用，使旧评论 DOM 可 GC
 */
export function disposeWaline(): void {
	activeUploadAbort?.abort();
	activeUploadAbort = null;
	// 离页时草稿里未提交的会话上传图 → 同步删桶，避免孤儿占存储
	if (lastUploadApi && managedCommentImageUrls.size > 0) {
		for (const url of [...managedCommentImageUrls]) {
			deleteCommentImage(lastUploadApi, url);
		}
	}
	managedCommentImageUrls.clear();
	const rt = walineRuntime;
	if (!rt || rt.disposed) return;
	rt.disposed = true;

	rt.abort?.abort();
	rt.abort = null;

	for (const observer of rt.observers) {
		try {
			observer.disconnect();
		} catch {
			/* ignore */
		}
	}
	rt.observers.clear();

	// 在 Vue unmount 清空容器前先收集 textarea 引用，再派发 autosize:destroy：
	// Waline bundle 里的 autosize 把每个 textarea 存进模块级 Map，并绑 input/autosize 事件 + window resize。
	// 该销毁 handler 会移除这些监听、恢复样式并从 Map 删除，解除对旧评论 DOM 的唯一外部引用。
	const root = rt.rootEl;
	if (root instanceof HTMLElement) {
		for (const textarea of root.querySelectorAll("textarea")) {
			try {
				textarea.dispatchEvent(new Event("autosize:destroy"));
			} catch {
				/* ignore */
			}
		}
	}

	if (rt.instance) {
		try {
			rt.instance.destroy();
		} catch {
			/* ignore */
		}
		rt.instance = null;
	}

	const shell = rt.shellEl;
	if (shell instanceof HTMLElement) {
		shell.classList.remove("waline-ready");
		shell.dataset.walineBooted = "0";
		if (root instanceof HTMLElement) root.replaceChildren();
	}
	rt.shellEl = null;
	rt.rootEl = null;
	walineRuntime = null;
}

/** 清掉本地草稿里的巨型 Base64；并把历史 sticker Markdown 迁成短码 */
function scrubBase64Drafts() {
	try {
		const keys: string[] = [];
		for (let i = 0; i < localStorage.length; i++) {
			const k = localStorage.key(i);
			if (k) keys.push(k);
		}
		for (const k of keys) {
			const low = k.toLowerCase();
			if (!low.includes("waline") && !low.includes("wl_")) continue;
			const v = localStorage.getItem(k);
			if (!v) continue;
			if (v.includes("data:image")) {
				localStorage.removeItem(k);
				console.info("[Waline] cleared base64 draft:", k);
				continue;
			}
			if (v.includes("![sticker:")) {
				const migrated = v.replace(
					/!\[sticker:[^\]]*\]\((https?:\/\/[^)\s]+)\)/gi,
					(_full, url: string) => {
						const m = String(url).match(
							/\/([a-z0-9_]+)\.(?:png|gif|webp|jpe?g)(?:\?|#|$)/i,
						);
						return m ? `:${m[1]}:` : _full;
					},
				);
				if (migrated !== v) {
					localStorage.setItem(k, migrated);
					console.info("[Waline] migrated sticker draft:", k);
				}
			}
			if (/:[a-z0-9_+-]+:\s*:[a-z0-9_+-]+:/i.test(v)) {
				try {
					const parsed = JSON.parse(v) as { comment?: string };
					if (parsed && typeof parsed === "object" && "comment" in parsed) {
						parsed.comment = "";
						localStorage.setItem(k, JSON.stringify(parsed));
						console.info("[Waline] cleared clumped shortcode draft:", k);
					}
				} catch {
					localStorage.removeItem(k);
				}
			}
		}
	} catch {
		/* ignore */
	}
}

function markWalineReady(shell: HTMLElement, root: HTMLElement) {
	const reveal = () => {
		// dispose 后（如 8s 兜底定时器迟到）不再改动旧 shell 状态
		if (!isRuntimeActive()) return;
		shell.classList.add("waline-ready");
		const loading = shell.querySelector(".waline-loading");
		loading?.remove();
	};
	if (root.querySelector(".wl-panel, .wl-cards, .wl-empty")) {
		requestAnimationFrame(reveal);
		return;
	}
	const mo = new MutationObserver(() => {
		if (root.querySelector(".wl-panel, .wl-cards, .wl-empty")) {
			mo.disconnect();
			requestAnimationFrame(reveal);
		}
	});
	trackObserver(mo);
	mo.observe(root, { childList: true, subtree: true });
	setTimeout(() => {
		mo.disconnect();
		reveal();
	}, 8000);
}

function hidePreviewAction(root: HTMLElement) {
	const isPreviewBtn = (btn: HTMLButtonElement) => {
		const t = (btn.getAttribute("title") || "").trim().toLowerCase();
		const label = (btn.getAttribute("aria-label") || "").trim().toLowerCase();
		return (
			t === "preview" ||
			t === "预览" ||
			t.includes("preview") ||
			label.includes("preview") ||
			label.includes("预览")
		);
	};
	const apply = () => {
		for (const btn of root.querySelectorAll("button.wl-action")) {
			if (btn instanceof HTMLButtonElement && isPreviewBtn(btn)) {
				btn.classList.remove("active");
				btn.setAttribute("hidden", "");
				btn.style.display = "none";
			}
		}
		for (const preview of root.querySelectorAll(".wl-preview")) {
			if (preview instanceof HTMLElement) {
				preview.setAttribute("hidden", "");
				preview.style.display = "none";
			}
		}
	};
	apply();
	const mo = new MutationObserver(() => apply());
	trackObserver(mo);
	mo.observe(root, { childList: true, subtree: true });
	setTimeout(() => mo.disconnect(), 8000);
}

function clearDraftAfterSubmit(root: HTMLElement) {
	let pendingSubmit = false;
	let knownCardCount = root.querySelectorAll(".wl-card").length;

	const clearField = (selector: string) => {
		const field = root.querySelector(selector);
		if (
			!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)
		)
			return;
		field.value = "";
		field.dispatchEvent(new Event("input", { bubbles: true }));
		field.dispatchEvent(new Event("change", { bubbles: true }));
	};

	const clearForm = () => {
		// 已进评论正文的图不再删桶；先摘掉托管集合，避免清空编辑器时误 DELETE
		managedCommentImageUrls.clear();
		clearField(".wl-nick");
		clearField(".wl-mail");
		clearField(".wl-link");
		clearField(".wl-editor");
		pendingSubmit = false;
		root.dispatchEvent(new CustomEvent("waline-editor-reset"));
	};

	const markSubmitPending = () => {
		pendingSubmit = true;
		knownCardCount = root.querySelectorAll(".wl-card").length;
	};

	const form = root.querySelector("form");
	if (form) addSignalListener(form, "submit", markSubmitPending, true);
	addSignalListener(
		root,
		"click",
		(event) => {
			const target = event.target;
			if (!(target instanceof Element)) return;
			const button = target.closest("button");
			if (button?.textContent?.trim() === "提交") markSubmitPending();
		},
		true,
	);

	const mo = new MutationObserver(() => {
		const cardCount = root.querySelectorAll(".wl-card").length;
		if (cardCount > knownCardCount) {
			knownCardCount = cardCount;
			if (pendingSubmit) clearForm();
			return;
		}
		knownCardCount = cardCount;
	});
	trackObserver(mo);
	mo.observe(root, { childList: true, subtree: true });
}

function attachCollapsibleEditor(root: HTMLElement, editor: HTMLTextAreaElement) {
	const panel = editor.closest(".wl-panel");
	if (!(panel instanceof HTMLElement)) return;
	if (panel.dataset.collapsibleBound === "true") return;

	panel.dataset.collapsibleBound = "true";
	panel.classList.add("waline-editor-collapsible");

	const isInside = (target: EventTarget | null) =>
		target instanceof Node && panel.contains(target);
	const editorEmpty = () => !editor.value.trim();
	const setExpanded = (expanded: boolean) => {
		panel.classList.toggle("waline-editor-expanded", expanded);
	};
	/** 嵌入动态时间线时：失焦且无正文 → 通知父页收起整块写作框 */
	const notifyParentCollapseIfEmpty = () => {
		if (!editorEmpty()) return;
		if (window.parent === window) return;
		window.parent.postMessage(
			{ type: "dynamic-comment-blur-empty" },
			window.location.origin,
		);
	};

	onPageTarget(document, "focusin", (event) => {
		if (isInside(event.target)) {
			setExpanded(true);
			return;
		}
		// 有字就保持展开，别一点外面昵称区就缩回去
		if (editorEmpty()) setExpanded(false);
	});
	onPageTarget(document, "pointerdown", (event) => {
		const target = event.target;
		if (isInside(target)) {
			setExpanded(true);
			return;
		}
		// 表情/GIF 面板常挂在 panel 外，别误判成失焦
		if (
			target instanceof Element &&
			target.closest(
				".wl-emoji, .wl-gif, .wl-gif-popup, .wl-panel, [data-waline]",
			)
		) {
			return;
		}
		if (editorEmpty()) setExpanded(false);
	});
	// 焦点落到父页面（点评论框外）且无正文 → 折叠并收起 iframe
	onPageTarget(window, "blur", () => {
		window.setTimeout(() => {
			if (document.hasFocus()) return;
			if (!editorEmpty()) return;
			setExpanded(false);
			notifyParentCollapseIfEmpty();
		}, 40);
	});
	addSignalListener(root, "waline-editor-reset", () => setExpanded(false));

	setExpanded(isInside(document.activeElement));
}

function extractMarkdownImageUrls(text: string): Set<string> {
	const urls = new Set<string>();
	const re = /!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
	for (const match of text.matchAll(re)) {
		const url = match[1]?.trim();
		if (url && /^https?:\/\//i.test(url)) urls.add(url);
	}
	return urls;
}

/** best-effort：编辑区撤销本会话上传图时，同步 DELETE 对象存储 */
function deleteCommentImage(uploadApi: string, url: string): void {
	if (!uploadApi || !url) return;
	const endpoint = `${uploadApi.replace(/\/?$/, "/")}?url=${encodeURIComponent(url)}`;
	void fetch(endpoint, {
		method: "DELETE",
		headers: { Origin: window.location.origin },
	}).catch(() => {
		/* ignore network errors */
	});
}

function pruneRemovedManagedImages(
	uploadApi: string,
	editorValue: string,
): void {
	if (!uploadApi || managedCommentImageUrls.size === 0) return;
	const stillPresent = extractMarkdownImageUrls(editorValue);
	for (const url of [...managedCommentImageUrls]) {
		if (stillPresent.has(url)) continue;
		managedCommentImageUrls.delete(url);
		deleteCommentImage(uploadApi, url);
	}
}

function cancelActiveUploadIfPlaceholderGone(editorValue: string): void {
	if (!activeUploadAbort) return;
	if (/!\[正在上传/.test(editorValue)) return;
	activeUploadAbort.abort();
	activeUploadAbort = null;
}

function attachPostInitHooks(
	root: HTMLElement,
	effectiveConfig: WalineInitConfig,
	uploadApi: string,
) {
	hidePreviewAction(root);
	clearDraftAfterSubmit(root);

	const emojiMap = new Map<string, string>();
	const visualImageCache = new Map<string, HTMLImageElement>();

	const loadEmojiMap = async () => {
		const packs = Array.isArray(effectiveConfig.emoji)
			? effectiveConfig.emoji
			: [];
		await Promise.all(
			packs.map(async (pack) => {
				const folder = typeof pack === "string" ? pack : pack?.folder;
				if (!folder) return;

				let info: { prefix?: string; items?: string[]; type?: string } | null =
					typeof pack === "object" && Array.isArray(pack.items) ? pack : null;
				if (!info) {
					try {
						const response = await fetch(
							`${folder.replace(/\/$/, "")}/info.json`,
						);
						if (!response.ok) return;
						info = await response.json();
					} catch {
						return;
					}
				}

				if (!info?.prefix || !Array.isArray(info.items)) return;
				const extension =
					info.type && info.type !== "url"
						? `.${String(info.type).replace(/^\./, "")}`
						: "";
				for (const item of info.items) {
					const file = `${info.prefix}${item}`;
					const filename =
						extension &&
						!file.toLowerCase().endsWith(extension.toLowerCase())
							? `${file}${extension}`
							: file;
					emojiMap.set(
						`${info.prefix}${item}`,
						`${folder.replace(/\/$/, "")}/${filename}`,
					);
				}
			}),
		);
	};

	const copyEditorTextStyles = (
		editor: HTMLTextAreaElement,
		mirror: HTMLElement,
	) => {
		const styles = getComputedStyle(editor);
		for (const property of [
			"font",
			"font-family",
			"font-size",
			"font-weight",
			"font-style",
			"line-height",
			"letter-spacing",
			"text-align",
			"text-indent",
			"padding",
			"tab-size",
		]) {
			mirror.style.setProperty(property, styles.getPropertyValue(property));
		}
	};

	const imagePattern = /^https?:\/\/|^\//i;

	const ensureUploadAnimation = () => {
		if (document.getElementById("waline-upload-animation-style")) return;
		const style = document.createElement("style");
		style.id = "waline-upload-animation-style";
		style.textContent =
			"@keyframes waline-upload-spin { to { transform: rotate(360deg); } }";
		document.head.append(style);
	};

	ensureUploadAnimation();

	const attachEditorVisual = (): boolean => {
		// 异步（loadEmojiMap）可能晚于离页 dispose 才执行：此时不再旁挂，避免重建 listener/observer
		if (!isRuntimeActive()) return false;
		const editor = root.querySelector("textarea.wl-editor");
		if (!(editor instanceof HTMLTextAreaElement)) return false;
		const host = editor.parentElement;
		if (!host) return false;

		attachCollapsibleEditor(root, editor);
		host.classList.add("waline-editor-visual-host");
		const existingMirrors = [...host.querySelectorAll(".waline-editor-visual")];
		existingMirrors.slice(1).forEach((node) => node.remove());
		const mirror: HTMLElement = (() => {
			const existing = host.querySelector(".waline-editor-visual");
			if (existing instanceof HTMLElement) return existing;
			const el = document.createElement("div");
			el.className = "waline-editor-visual";
			el.setAttribute("aria-hidden", "true");
			host.append(el);
			return el;
		})();

		if (!editor.dataset.visualBaseHeight) {
			editor.dataset.visualBaseHeight = String(editor.offsetHeight);
			editor.dataset.visualOriginalHeight = editor.style.height;
		}

		const syncPosition = () => {
			const styles = getComputedStyle(editor);
			mirror.style.top = `${editor.offsetTop}px`;
			mirror.style.left = `${editor.offsetLeft}px`;
			mirror.style.width = `${editor.offsetWidth}px`;
			mirror.style.height = `${editor.offsetHeight}px`;
			mirror.style.borderRadius = styles.borderRadius;
			mirror.style.overflow = "hidden";
			copyEditorTextStyles(editor, mirror);
			mirror.scrollTop = editor.scrollTop;
			mirror.scrollLeft = editor.scrollLeft;
		};

		const fitEditorHeight = (hasVisualContent: boolean) => {
			if (!hasVisualContent) {
				editor.style.height = editor.dataset.visualOriginalHeight || "";
				return;
			}

			const baseHeight = Number.parseFloat(
				editor.dataset.visualBaseHeight || "0",
			);
			const currentMirrorHeight = mirror.style.height;
			mirror.style.height = "auto";
			const contentHeight = mirror.scrollHeight;
			mirror.style.height = currentMirrorHeight;
			const targetHeight = Math.max(baseHeight, contentHeight + 4);
			if (targetHeight > 0 && Math.abs(editor.offsetHeight - targetHeight) > 1) {
				editor.style.height = `${targetHeight}px`;
			}
		};

		const syncContent = () => {
			const value = editor.value || "";
			cancelActiveUploadIfPlaceholderGone(value);
			pruneRemovedManagedImages(uploadApi, value);
			const tokenPattern = /!\[([^\]]*)\]\(([^)\s]*)\)|:([a-z0-9_+-]+):/gi;
			const matches = [...value.matchAll(tokenPattern)];
			const visualMatches = matches.filter((match) => {
				if (match[3]) return true;
				const alt = match[1] || "";
				const source = match[2] || "";
				return imagePattern.test(source) || /^正在上传(?:\s|$)/.test(alt);
			});

			mirror.replaceChildren();
			if (!visualMatches.length) {
				host.classList.remove("waline-editor-visual-active");
				mirror.hidden = true;
				mirror.replaceChildren();
				fitEditorHeight(false);
				return;
			}

			host.classList.add("waline-editor-visual-active");
			mirror.hidden = false;
			const caretPosition = editor.selectionEnd ?? value.length;
			const selectionStart = editor.selectionStart ?? caretPosition;
			const selectionEnd = editor.selectionEnd ?? caretPosition;
			const hasSelection =
				document.activeElement === editor && selectionEnd > selectionStart;
			const showCaret = document.activeElement === editor && !hasSelection;
			let caretInserted = false;

			const appendCaretAt = (position: number) => {
				if (!showCaret || caretInserted || caretPosition !== position) return;
				const caret = document.createElement("span");
				caret.className = "waline-editor-visual-caret";
				caret.setAttribute("aria-hidden", "true");
				mirror.append(caret);
				caretInserted = true;
			};

			const appendSelectionText = (text: string, start: number) => {
				if (!text) return;
				if (
					!hasSelection ||
					selectionEnd <= start ||
					selectionStart >= start + text.length
				) {
					mirror.append(document.createTextNode(text));
					return;
				}

				let offset = 0;
				while (offset < text.length) {
					const absolute = start + offset;
					const selected =
						absolute < selectionEnd && absolute + 1 > selectionStart;
					let boundary = offset + 1;
					while (boundary < text.length) {
						const nextAbsolute = start + boundary;
						const nextSelected =
							nextAbsolute < selectionEnd && nextAbsolute + 1 > selectionStart;
						if (nextSelected !== selected) break;
						boundary += 1;
					}
					const chunk = text.slice(offset, boundary);
					if (selected) {
						const selectedText = document.createElement("span");
						selectedText.className = "waline-editor-visual-selection";
						selectedText.textContent = chunk;
						mirror.append(selectedText);
					} else {
						mirror.append(document.createTextNode(chunk));
					}
					offset = boundary;
				}
			};

			const appendText = (text: string, start: number) => {
				if (!text) return;
				const end = start + text.length;
				if (showCaret && caretPosition > start && caretPosition < end) {
					const offset = caretPosition - start;
					appendSelectionText(text.slice(0, offset), start);
					appendCaretAt(caretPosition);
					appendSelectionText(text.slice(offset), caretPosition);
					return;
				}
				appendSelectionText(text, start);
			};

			const appendVisualNode = (
				node: Node,
				start: number,
				end: number,
			) => {
				if (hasSelection && selectionStart < end && selectionEnd > start) {
					const selectedNode = document.createElement("span");
					selectedNode.className = "waline-editor-visual-selection";
					selectedNode.append(node);
					mirror.append(selectedNode);
				} else {
					mirror.append(node);
				}
			};

			const removeMarkdownToken = (token: string, tokenStart: number) => {
				const current = editor.value || "";
				let next = current;
				if (current.slice(tokenStart, tokenStart + token.length) === token) {
					next =
						current.slice(0, tokenStart) +
						current.slice(tokenStart + token.length);
				} else {
					const idx = current.indexOf(token);
					if (idx < 0) return;
					next = current.slice(0, idx) + current.slice(idx + token.length);
				}
				editor.value = next.replace(/\n{3,}/g, "\n\n");
				editor.dispatchEvent(new Event("input", { bubbles: true }));
				editor.focus();
			};

			const makeRemoveButton = (token: string, tokenStart: number) => {
				const btn = document.createElement("button");
				btn.type = "button";
				btn.className = "waline-editor-visual-image-remove";
				btn.setAttribute("aria-label", "移除图片");
				btn.title = "移除图片";
				btn.textContent = "×";
				btn.addEventListener("click", (event) => {
					event.preventDefault();
					event.stopPropagation();
					removeMarkdownToken(token, tokenStart);
				});
				return btn;
			};

			let cursor = 0;
			for (const match of matches) {
				const start = match.index ?? 0;
				appendCaretAt(cursor);
				if (start > cursor) appendText(value.slice(cursor, start), cursor);
				appendCaretAt(start);
				const tokenEnd = start + match[0].length;
				const source = match[3] ? emojiMap.get(match[3]) : match[2];
				if (source) {
					const imageKey = `${match[3] ? "emoji" : "image"}:${source}`;
					let template = visualImageCache.get(imageKey);
					let imageNeedsSource = false;
					const altText = match[1] || "";
					const inlineSticker =
						!match[3] &&
						(/^sticker:/i.test(altText) ||
							/@waline\/emojis/i.test(source) ||
							/unpkg\.com\/@waline\/emojis/i.test(source));
					if (!template) {
						template = document.createElement("img");
						template.className =
							match[3] || inlineSticker
								? "waline-editor-visual-emoji"
								: "waline-editor-visual-image";
						template.alt = altText.replace(/^sticker:/i, "") || match[0];
						template.draggable = false;
						template.decoding = "async";
						imageNeedsSource = true;
						if (match[3] || inlineSticker) {
							template.style.display = "inline-block";
							template.style.width = "1.45em";
							template.style.height = "1.45em";
							template.style.margin = "-0.15em 0.08em";
							template.style.verticalAlign = "middle";
							template.style.objectFit = "contain";
						} else {
							template.style.display = "block";
							template.style.maxWidth = "min(100%, 20rem)";
							template.style.maxHeight = "12rem";
							template.style.width = "auto";
							template.style.height = "auto";
							template.style.margin = "0";
							template.style.objectFit = "contain";
						}
						template.addEventListener("load", () => {
							fitEditorHeight(true);
							syncPosition();
						});
						visualImageCache.set(imageKey, template);
					}
					const image = template.cloneNode(true) as HTMLImageElement;
					if (imageNeedsSource || !image.getAttribute("src")) {
						image.src = source;
					}
					if (match[3] || inlineSticker) {
						appendVisualNode(image, start, tokenEnd);
					} else {
						const wrap = document.createElement("span");
						wrap.className = "waline-editor-visual-image-wrap";
						wrap.append(image);
						if (/^https?:\/\//i.test(source)) {
							wrap.append(makeRemoveButton(match[0], start));
						}
						appendVisualNode(wrap, start, tokenEnd);
					}
				} else if (!match[3] && /^正在上传(?:\s|$)/.test(match[1] || "")) {
					const wrap = document.createElement("span");
					wrap.className = "waline-editor-visual-uploading-wrap";
					const uploading = document.createElement("span");
					uploading.className = "waline-editor-visual-uploading";
					const spinner = document.createElement("span");
					spinner.className = "waline-editor-visual-uploading-spinner";
					spinner.setAttribute("aria-hidden", "true");
					uploading.append(spinner, document.createTextNode(match[1]));
					wrap.append(uploading, makeRemoveButton(match[0], start));
					appendVisualNode(wrap, start, tokenEnd);
				} else if (match[3]) {
					const ph = document.createElement("span");
					ph.className = "waline-editor-visual-emoji";
					ph.setAttribute("aria-hidden", "true");
					ph.style.display = "inline-block";
					ph.style.width = "1.45em";
					ph.style.height = "1.45em";
					ph.style.margin = "-0.15em 0.08em";
					ph.style.verticalAlign = "middle";
					appendVisualNode(ph, start, tokenEnd);
				} else {
					appendText(match[0], start);
				}
				cursor = tokenEnd;
				appendCaretAt(cursor);
			}
			appendCaretAt(cursor);
			if (cursor < value.length) appendText(value.slice(cursor), cursor);
			appendCaretAt(value.length);
			if (showCaret && !caretInserted) appendCaretAt(caretPosition);
			fitEditorHeight(true);
			syncPosition();
		};

		if (editor.dataset.emojiVisualBound !== "true") {
			editor.dataset.emojiVisualBound = "true";
			addSignalListener(editor, "input", syncContent);
			addSignalListener(editor, "keyup", syncContent);
			addSignalListener(editor, "click", syncContent);
			addSignalListener(editor, "select", syncContent);
			addSignalListener(editor, "focus", syncContent);
			addSignalListener(editor, "blur", syncContent);
			addSignalListener(editor, "scroll", syncPosition, { passive: true });
			addSignalListener(editor, "waline-sticker-suggest-layout", () => {
				syncPosition();
			});
			editor.setAttribute("spellcheck", "false");
			onPageTarget(document, "selectionchange", () => {
				if (document.activeElement === editor) syncContent();
			});
			const ro = new ResizeObserver(syncPosition);
			trackObserver(ro);
			ro.observe(editor);
			addSignalListener(
				root,
				"click",
				(event) => {
					const target = event.target;
					if (!(target instanceof Element) || !target.closest(".wl-emoji-popup"))
						return;
					requestAnimationFrame(() => {
						syncContent();
						requestAnimationFrame(syncContent);
					});
				},
				true,
			);
		}

		syncContent();
		return true;
	};

	const editorObserver = new MutationObserver(() => {
		if (attachEditorVisual()) editorObserver.disconnect();
	});
	trackObserver(editorObserver);
	if (!attachEditorVisual()) {
		editorObserver.observe(root, { childList: true, subtree: true });
		setTimeout(() => editorObserver.disconnect(), 8000);
	}
	loadEmojiMap().then(attachEditorVisual);
}

async function imageUploader(
	uploadApi: string,
	file: File,
): Promise<string> {
	if (!(file instanceof File)) {
		throw new Error("无效的图片文件");
	}
	if (file.size > MAX_BYTES) {
		throw new Error("图片不能超过 5MB");
	}
	const form = new FormData();
	form.append("image", file, file.name || "image.png");
	activeUploadAbort?.abort();
	const ac = new AbortController();
	activeUploadAbort = ac;
	try {
		const res = await fetch(uploadApi, {
			method: "POST",
			body: form,
			headers: { Origin: window.location.origin },
			signal: ac.signal,
		});
		let data: { url?: string; error?: string } = {};
		try {
			data = await res.json();
		} catch {
			/* ignore */
		}
		if (!res.ok || !data.url) {
			const msg =
				data.error ||
				(res.status === 503
					? "未配置图床（R2_* 或 COS_*），无法上传大图"
					: "图片上传失败");
			throw new Error(msg);
		}
		managedCommentImageUrls.add(data.url);
		return data.url;
	} catch (error) {
		if (
			(error instanceof DOMException || error instanceof Error) &&
			error.name === "AbortError"
		) {
			throw new Error("已取消上传");
		}
		throw error;
	} finally {
		if (activeUploadAbort === ac) activeUploadAbort = null;
	}
}

export function bootWalineFromShell(shell?: Element | null): void {
	const shellEl = (shell ?? document.querySelector(".waline-shell")) as
		| HTMLElement
		| null;
	if (!shellEl) return;

	const root = shellEl.querySelector("#waline");
	if (!(root instanceof HTMLElement)) return;

	if (shellEl.dataset.walineBooted === "1") {
		if (root.querySelector(".wl-panel, .wl-cards, .wl-empty")) {
			shellEl.classList.add("waline-ready");
			return;
		}
		shellEl.dataset.walineBooted = "0";
		root.replaceChildren();
	}

	const configJson = shellEl.dataset.walineConfig;
	const uploadApi = shellEl.dataset.uploadApi ?? "";
	lastUploadApi = uploadApi;
	if (!configJson) return;

	let config: WalineInitConfig;
	try {
		config = JSON.parse(configJson) as WalineInitConfig;
	} catch {
		console.error("[Waline] Invalid config JSON");
		return;
	}

	scrubBase64Drafts();

	const requestedPath = new URLSearchParams(window.location.search).get("path");
	const effectiveConfig: WalineInitConfig = {
		...config,
		...(requestedPath ? { path: requestedPath } : {}),
		imageUploader: (file: File) => imageUploader(uploadApi, file),
	};

	try {
		const rt = createRuntime(shellEl, root);
		rt.instance = init(effectiveConfig as unknown as Parameters<typeof init>[0]);
		shellEl.dataset.walineBooted = "1";
		markWalineReady(shellEl, root);
		attachPostInitHooks(root, effectiveConfig, uploadApi);
	} catch (error) {
		disposeWaline();
		console.error("[Waline] Failed to initialize:", error);
		shellEl.classList.add("waline-ready");
	}
}

function scheduleWalineBoot(delay = 0) {
	window.setTimeout(() => {
		for (const shell of document.querySelectorAll(".waline-shell")) {
			const root = shell.querySelector("#waline");
			if (!root) continue;
			if (root.querySelector(".wl-panel, .wl-cards, .wl-empty")) {
				shell.classList.add("waline-ready");
				continue;
			}
			if (shell instanceof HTMLElement && shell.dataset.walineBooted === "1")
				continue;
			bootWalineFromShell(shell);
		}
	}, delay);
}

export function registerWalineSwupHooks(): void {
	if (swupHooksRegistered) return;
	swupHooksRegistered = true;

	document.addEventListener("swup:page:view", () => scheduleWalineBoot(50));
	// Swup 换页前销毁旧 Waline：Vue 实例 + observer + document/window 事件全部释放
	document.addEventListener("astro:before-swap", disposeWaline);

	const bindSwupHooks = () => {
		const swup = (
			window as Window & {
				swup?: { hooks?: { on: (event: string, cb: () => void) => void } };
			}
		).swup;
		swup?.hooks?.on("content:replace", () => scheduleWalineBoot(200));
	};

	if (
		(
			window as Window & {
				swup?: { hooks?: { on: (event: string, cb: () => void) => void } };
			}
		).swup?.hooks
	) {
		bindSwupHooks();
	} else {
		document.addEventListener("swup:enable", bindSwupHooks, { once: true });
	}
}
