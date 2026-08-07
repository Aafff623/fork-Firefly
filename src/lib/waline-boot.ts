import { init } from "@waline/client/full";

const MAX_BYTES = 5 * 1024 * 1024;
let swupHooksRegistered = false;

type WalineInitConfig = Record<string, unknown>;

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
	form?.addEventListener("submit", markSubmitPending, true);
	root.addEventListener(
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
	const setExpanded = (expanded: boolean) => {
		panel.classList.toggle("waline-editor-expanded", expanded);
	};

	document.addEventListener("focusin", (event) => {
		setExpanded(isInside(event.target));
	});
	document.addEventListener("pointerdown", (event) => {
		setExpanded(isInside(event.target));
	});
	root.addEventListener("waline-editor-reset", () => setExpanded(false));

	setExpanded(isInside(document.activeElement));
}

function attachPostInitHooks(
	root: HTMLElement,
	effectiveConfig: WalineInitConfig,
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
							template.style.margin = "0.75em 0 0.9em";
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
					appendVisualNode(image, start, tokenEnd);
				} else if (!match[3] && /^正在上传(?:\s|$)/.test(match[1] || "")) {
					const uploading = document.createElement("span");
					uploading.className = "waline-editor-visual-uploading";
					const spinner = document.createElement("span");
					spinner.className = "waline-editor-visual-uploading-spinner";
					spinner.setAttribute("aria-hidden", "true");
					uploading.append(spinner, document.createTextNode(match[1]));
					appendVisualNode(uploading, start, tokenEnd);
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
			editor.addEventListener("input", syncContent);
			editor.addEventListener("keyup", syncContent);
			editor.addEventListener("click", syncContent);
			editor.addEventListener("select", syncContent);
			editor.addEventListener("focus", syncContent);
			editor.addEventListener("blur", syncContent);
			editor.addEventListener("scroll", syncPosition, { passive: true });
			editor.addEventListener("waline-sticker-suggest-layout", () => {
				syncPosition();
			});
			editor.setAttribute("spellcheck", "false");
			document.addEventListener("selectionchange", () => {
				if (document.activeElement === editor) syncContent();
			});
			new ResizeObserver(syncPosition).observe(editor);
			root.addEventListener(
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
	const res = await fetch(uploadApi, {
		method: "POST",
		body: form,
		headers: { Origin: window.location.origin },
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
				? "未配置腾讯云 COS（COS_SECRET_ID 等），无法上传大图"
				: "图片上传失败");
		throw new Error(msg);
	}
	return data.url;
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
		init(effectiveConfig as unknown as Parameters<typeof init>[0]);
		shellEl.dataset.walineBooted = "1";
		markWalineReady(shellEl, root);
		attachPostInitHooks(root, effectiveConfig);
	} catch (error) {
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
