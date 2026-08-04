/** 联想浮层 DOM */ // 中文注释：挂在编辑器宿主上方，低于 Waline popup

import type { SuggestItem } from "@/lib/sticker-suggest/types";

export type OverlayHandlers = {
	onPick: (item: SuggestItem) => void;
};

export type StickerOverlay = {
	root: HTMLDivElement;
	showLoading: () => void;
	showEmpty: (message?: string) => void;
	showItems: (items: SuggestItem[]) => void;
	/** 当前可 Tab 选中的候选（无则 null） */ // 中文注释
	getActiveItem: () => SuggestItem | null;
	hasSelectable: () => boolean;
	hide: () => void;
	isOpen: () => boolean;
	destroy: () => void;
};

/** 浮层与 textarea 之间的间距（px） */ // 中文注释
const OVERLAY_GAP_PX = 6;

/** 通知视觉镜像重新对齐（浮层显隐会改变 host 布局感知） */ // 中文注释
function notifyVisualRelayout(editor: HTMLElement) {
	editor.dispatchEvent(
		new CustomEvent("waline-sticker-suggest-layout", { bubbles: true }),
	);
}

/** 相对 textarea 用 offset 定位到正上方，避免 bottom:100% 相对整卡错位 */ // 中文注释
function positionAboveEditor(editor: HTMLElement, root: HTMLElement) {
	const host = editor.parentElement;
	if (host) {
		// 保证 offsetTop/Left 相对 host // 中文注释
		const hostCs = getComputedStyle(host);
		if (hostCs.position === "static") {
			host.style.position = "relative";
		}
	}
	root.style.position = "absolute";
	root.style.bottom = "auto";
	root.style.right = "auto";
	root.style.left = `${editor.offsetLeft}px`;
	root.style.width = `${editor.offsetWidth}px`;
	// 先按估算高度落位，再按实测高度精修 // 中文注释
	const roughH = root.offsetHeight || 48;
	root.style.top = `${editor.offsetTop - roughH - OVERLAY_GAP_PX}px`;
	const measuredH = root.offsetHeight || roughH;
	root.style.top = `${editor.offsetTop - measuredH - OVERLAY_GAP_PX}px`;
}

export function createOverlay(
	anchor: HTMLElement,
	handlers: OverlayHandlers,
): StickerOverlay {
	const root = document.createElement("div");
	root.className = "waline-sticker-suggest";
	root.setAttribute("role", "listbox");
	root.hidden = true;
	// 紧贴 textarea 上方插入，避免 prepend 到整卡顶部盖住昵称/邮箱 // 中文注释
	anchor.parentElement?.insertBefore(root, anchor);
	if (!root.parentElement) {
		anchor.before(root);
	}

	/** Tab 默认选中第一条 */ // 中文注释
	let activeItems: SuggestItem[] = [];

	/** 显示后相对 textarea 定位，并通知视觉层同步 */ // 中文注释
	const afterShow = () => {
		positionAboveEditor(anchor, root);
		notifyVisualRelayout(anchor);
		// rAF 再量一次，等图片/flex 定高 // 中文注释
		requestAnimationFrame(() => {
			if (!root.hidden) {
				positionAboveEditor(anchor, root);
				notifyVisualRelayout(anchor);
			}
		});
	};

	const render = (nodes: Node[]) => {
		root.replaceChildren(...nodes);
		root.hidden = nodes.length === 0;
	};

	return {
		root,
		showLoading() {
			activeItems = [];
			const tip = document.createElement("span");
			tip.className = "waline-sticker-suggest__hint";
			tip.textContent = "匹配中…";
			render([tip]);
			afterShow();
		},
		showEmpty(message = "暂无匹配") {
			activeItems = [];
			const tip = document.createElement("span");
			tip.className = "waline-sticker-suggest__hint";
			tip.textContent = message;
			render([tip]);
			afterShow();
		},
		showItems(items) {
			if (!items.length) {
				activeItems = [];
				root.hidden = true;
				root.replaceChildren();
				root.style.top = "";
				root.style.left = "";
				root.style.width = "";
				notifyVisualRelayout(anchor);
				return;
			}
			activeItems = items.slice();
			const frag = document.createDocumentFragment();
			items.forEach((item, index) => {
				const btn = document.createElement("button");
				btn.type = "button";
				btn.className = "waline-sticker-suggest__item";
				if (index === 0) {
					btn.classList.add("waline-sticker-suggest__item--active");
				}
				btn.setAttribute("role", "option");
				btn.setAttribute("aria-selected", index === 0 ? "true" : "false");
				btn.title = item.title;
				const img = document.createElement("img");
				img.src = item.preview || item.src;
				img.alt = item.title;
				img.decoding = "async";
				img.draggable = false;
				// 图片加载后高度可能变，再对齐一次 // 中文注释
				img.addEventListener(
					"load",
					() => {
						if (!root.hidden) {
							positionAboveEditor(anchor, root);
							notifyVisualRelayout(anchor);
						}
					},
					{ once: true },
				);
				btn.append(img);
				btn.addEventListener("click", (event) => {
					event.preventDefault();
					event.stopPropagation();
					handlers.onPick(item);
				});
				frag.append(btn);
			});
			// 小括号快捷键提示 // 中文注释
			const kbd = document.createElement("span");
			kbd.className = "waline-sticker-suggest__kbd";
			kbd.textContent = "(按 Tab 快速应用)";
			kbd.title = "按 Tab：在当前词后插入首选表情，原文保留";
			frag.append(kbd);
			render([...frag.childNodes]);
			afterShow();
		},
		getActiveItem() {
			return activeItems[0] ?? null;
		},
		hasSelectable() {
			return activeItems.length > 0 && !root.hidden;
		},
		hide() {
			activeItems = [];
			root.hidden = true;
			root.replaceChildren();
			root.style.top = "";
			root.style.left = "";
			root.style.width = "";
			notifyVisualRelayout(anchor);
		},
		isOpen() {
			return !root.hidden;
		},
		destroy() {
			activeItems = [];
			root.remove();
		},
	};
}

/** Waline 官方表情/GIF 面板是否打开 */ // 中文注释：打开时隐藏联想，避免挡操作
export function isWalinePopupOpen(root: ParentNode): boolean {
	const emoji = root.querySelector(".wl-emoji-popup");
	const gif = root.querySelector(".wl-gif-popup");
	const visible = (el: Element | null) => {
		if (!(el instanceof HTMLElement)) return false;
		if (el.hasAttribute("hidden")) return false;
		const style = getComputedStyle(el);
		return style.display !== "none" && style.visibility !== "hidden";
	};
	return visible(emoji) || visible(gif);
}
