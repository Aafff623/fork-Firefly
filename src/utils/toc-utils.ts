/**
 * TOC (Table of Contents) 工具类
 * 用于 SidebarTOC 和 FloatingTOC 的共享逻辑
 */

import I18nKey from "@/i18n/i18nKey";
import { i18n } from "@/i18n/translation";
import {
	computeTocItems,
	renderTocItemHTML,
	type TocInput,
} from "@/utils/toc-shared";

export interface TOCConfig {
	contentId: string;
	indicatorId: string;
	maxLevel?: number;
	scrollOffset?: number;
}

export class TOCManager {
	private tocItems: HTMLElement[] = [];
	private observer: IntersectionObserver | null = null;
	private maxLevel: number;
	private scrollTimeout: number | null = null;
	private contentId: string;
	private indicatorId: string;
	private scrollOffset: number;

	constructor(config: TOCConfig) {
		this.contentId = config.contentId;
		this.indicatorId = config.indicatorId;
		this.maxLevel = config.maxLevel || 3;
		this.scrollOffset = config.scrollOffset || 80;
	}

	/**
	 * 查找文章内容容器
	 */
	private getContentContainer(): Element | null {
		return (
			document.querySelector(".custom-md") ||
			document.querySelector(".prose") ||
			document.querySelector(".markdown-content")
		);
	}

	/**
	 * 查找所有标题
	 */
	private getAllHeadings(): HTMLElement[] {
		const contentContainer = this.getContentContainer();
		if (!contentContainer) {
			return [];
		}
		return Array.from(
			contentContainer.querySelectorAll("h1, h2, h3, h4, h5, h6"),
		);
	}

	/**
	 * 获取标题的纯文本内容（排除 script/style 标签的文本）
	 */
	private getCleanTextContent(element: HTMLElement): string {
		const clone = element.cloneNode(true) as HTMLElement;
		for (const el of clone.querySelectorAll("script, style")) {
			el.remove();
		}
		return clone.textContent || "";
	}

	/**
	 * 空状态文案
	 */
	private getEmptyStateHTML(): string {
		return `<div class="text-center py-8 text-gray-500 dark:text-gray-400"><p>${i18n(I18nKey.tocEmpty)}</p></div>`;
	}

	/**
	 * 将 DOM 标题转换为与服务端一致的 TocInput
	 */
	private domHeadingsToInputs(headings: HTMLElement[]): TocInput[] {
		return headings.map((heading) => {
			const depth = Number.parseInt(heading.tagName.charAt(1), 10);
			let text = this.getCleanTextContent(heading)
				.replace(/#+\s*$/, "")
				.trim();

			// 空文本回退（例如动态副标题）
			if (!text) {
				const dataSubtitles = heading.getAttribute("data-subtitles");
				if (dataSubtitles) {
					try {
						const subtitles = JSON.parse(dataSubtitles);
						text = Array.isArray(subtitles) ? subtitles[0] : subtitles;
					} catch {
						// ignore
					}
				}
			}

			return { depth, slug: heading.id, text };
		});
	}

	/**
	 * 生成TOC HTML（客户端 fallback 路径，与服务端 SSR 输出保持一致）
	 */
	public generateTOCHTML(): string {
		const headings = this.getAllHeadings();

		if (headings.length === 0) {
			return this.getEmptyStateHTML();
		}

		const items = computeTocItems(this.domHeadingsToInputs(headings), {
			maxLevel: this.maxLevel,
		});

		if (items.length === 0) {
			return this.getEmptyStateHTML();
		}

		let tocHTML = "";
		for (const item of items) {
			tocHTML += renderTocItemHTML(item);
		}

		tocHTML += `<div id="${this.indicatorId}" style="opacity: 0;" class="toc-active-indicator"></div>`;

		return tocHTML;
	}

	/**
	 * 更新TOC内容（重建，DOM 遍历路径）
	 */
	public updateTOCContent(): void {
		const tocContent = document.getElementById(this.contentId);
		if (!tocContent) return;

		tocContent.innerHTML = this.generateTOCHTML();
		this.tocItems = Array.from(
			document.querySelectorAll(`#${this.contentId} a`),
		);
	}

	/**
	 * 按「离视口焦点带距离」给目录项打分。
	 * 越靠近屏幕中部（略偏上的阅读焦点）focus 越高 → 目录高亮越深；往上下两侧衰减。
	 */
	private scoreTocFocus(): { item: HTMLElement; focus: number }[] {
		const headings = this.getAllHeadings().filter((h) => h.id);
		if (headings.length === 0) return [];

		const vh = window.innerHeight || 1;
		// 阅读焦点：略高于几何中心
		const focusY = vh * 0.42;
		// 中间高原：约 ±0.22 屏高内保持满高亮（跨度大）
		const plateau = vh * 0.22;
		// 高原之外陡降：再约 0.18 屏高基本熄灭
		const falloff = vh * 0.18;
		const margin = vh * 0.15;

		const byId = new Map<string, HTMLElement>();
		for (const item of this.tocItems) {
			const id = item.dataset.headingId;
			if (id) byId.set(id, item);
		}

		const scored: { item: HTMLElement; focus: number; dist: number }[] = [];

		for (const heading of headings) {
			const tocItem = byId.get(heading.id);
			if (!tocItem) continue;

			const rect = heading.getBoundingClientRect();
			// 允许略超出视口仍参与衰减，避免边界闪断
			if (rect.bottom < -margin || rect.top > vh + margin) continue;

			const mid = (rect.top + rect.bottom) / 2;
			const dist = Math.abs(mid - focusY);
			// 高原内 = 1；之外用立方陡降，两侧很快变淡
			let focus: number;
			if (dist <= plateau) {
				focus = 1;
			} else {
				const t = Math.min(1, (dist - plateau) / falloff);
				focus = (1 - t) ** 3;
			}
			scored.push({ item: tocItem, focus, dist });
		}

		// 全部在屏外时：取离焦点带最近的一个标题
		if (scored.length === 0) {
			let best: { item: HTMLElement; dist: number } | null = null;
			for (const heading of headings) {
				const tocItem = byId.get(heading.id);
				if (!tocItem) continue;
				const rect = heading.getBoundingClientRect();
				const mid = (rect.top + rect.bottom) / 2;
				const dist = Math.abs(mid - focusY);
				if (!best || dist < best.dist) best = { item: tocItem, dist };
			}
			if (best) {
				return [{ item: best.item, focus: 1 }];
			}
			return [];
		}

		return scored.map(({ item, focus }) => ({ item, focus }));
	}

	/** 清掉正文标题上一次的焦点高亮 */
	private clearHeadingFocus(): void {
		const container = this.getContentContainer();
		if (!container) return;
		for (const el of container.querySelectorAll<HTMLElement>(
			":is(h1,h2,h3,h4,h5,h6).heading-focus",
		)) {
			el.classList.remove("heading-focus", "heading-focus-primary");
			el.style.removeProperty("--heading-focus");
		}
	}

	/** 运行时剥离标题旁残留的锚点井号节点（防缓存/旧 HTML） */
	private stripHeadingAnchors(): void {
		const container = this.getContentContainer();
		if (!container) return;
		for (const a of container.querySelectorAll(
			":is(h1,h2,h3,h4,h5,h6) a.anchor, :is(h1,h2,h3,h4,h5,h6) .anchor",
		)) {
			a.remove();
		}
	}

	/**
	 * 更新活动状态（中心深、两侧淡）+ 同步正文标题暖黄高亮
	 */
	public updateActiveState(): void {
		if (!this.tocItems || this.tocItems.length === 0) return;

		this.stripHeadingAnchors();

		for (const item of this.tocItems) {
			item.classList.remove("visible", "toc-focus-primary", "toc-focus-band");
			item.style.removeProperty("--toc-focus");
		}
		this.clearHeadingFocus();

		const scored = this.scoreTocFocus();
		if (scored.length === 0) {
			this.updateActiveIndicator([]);
			return;
		}

		const FOCUS_SHOW = 0.08;
		const PRIMARY_BAND = 0.85;
		const activeItems: HTMLElement[] = [];
		let primary: HTMLElement | null = null;
		let primaryFocus = -1;

		for (const { item, focus } of scored) {
			if (focus < FOCUS_SHOW) continue;
			const clamped = Math.min(1, Math.max(0, focus));
			item.classList.add("visible");
			item.style.setProperty("--toc-focus", clamped.toFixed(3));
			activeItems.push(item);

			const headingId = item.dataset.headingId;
			if (headingId) {
				const heading = document.getElementById(headingId);
				if (heading) {
					heading.classList.add("heading-focus");
					heading.style.setProperty("--heading-focus", clamped.toFixed(3));
				}
			}

			if (clamped > primaryFocus) {
				primaryFocus = clamped;
				primary = item;
			}
		}

		// 高原内都可带 primary 气质；取最高分者为 toc-focus-primary
		if (primary && primaryFocus >= PRIMARY_BAND) {
			primary.classList.add("toc-focus-primary");
			const primaryId = primary.dataset.headingId;
			if (primaryId) {
				document
					.getElementById(primaryId)
					?.classList.add("heading-focus-primary");
			}
			// 同带内其它高分项也拉满，强化「中间一大块」
			for (const { item, focus } of scored) {
				if (item === primary) continue;
				if (focus >= PRIMARY_BAND) {
					item.classList.add("toc-focus-band");
					item.style.setProperty("--toc-focus", "1");
					const id = item.dataset.headingId;
					if (id) {
						const h = document.getElementById(id);
						if (h) {
							h.classList.add("heading-focus", "heading-focus-primary");
							h.style.setProperty("--heading-focus", "1");
						}
					}
				}
			}
		}

		this.updateActiveIndicator(primary ? [primary] : activeItems);
	}

	/**
	 * 更新活动指示器
	 */
	private updateActiveIndicator(activeItems: HTMLElement[]): void {
		const indicator = document.getElementById(this.indicatorId);
		if (!indicator || !this.tocItems.length) return;

		if (activeItems.length === 0) {
			indicator.style.opacity = "0";
			return;
		}

		const tocContent = document.getElementById(this.contentId);
		if (!tocContent) return;

		const contentRect = tocContent.getBoundingClientRect();
		const firstActive = activeItems[0];
		const lastActive = activeItems[activeItems.length - 1];

		const firstRect = firstActive.getBoundingClientRect();
		const lastRect = lastActive.getBoundingClientRect();

		const top = firstRect.top - contentRect.top;
		const height = lastRect.bottom - firstRect.top;

		indicator.style.top = `${top}px`;
		indicator.style.height = `${height}px`;
		indicator.style.opacity = "1";

		// 自动滚动到活动项
		if (firstActive) {
			this.scrollToActiveItem(firstActive);
		}
	}

	/**
	 * 滚动到活动项
	 */
	private scrollToActiveItem(activeItem: HTMLElement): void {
		if (!activeItem) return;

		const tocContainer = document
			.querySelector(`#${this.contentId}`)
			?.closest(".toc-scroll-container");
		if (!tocContainer) return;

		// 清除之前的定时器
		if (this.scrollTimeout) {
			clearTimeout(this.scrollTimeout);
		}

		// 使用节流机制
		this.scrollTimeout = window.setTimeout(() => {
			const containerRect = tocContainer.getBoundingClientRect();
			const itemRect = activeItem.getBoundingClientRect();

			// 只在元素不在可视区域时才滚动
			const isVisible =
				itemRect.top >= containerRect.top &&
				itemRect.bottom <= containerRect.bottom;

			if (!isVisible) {
				const itemOffsetTop = (activeItem as HTMLElement).offsetTop;
				const containerHeight = tocContainer.clientHeight;
				const itemHeight = activeItem.clientHeight;

				// 计算目标滚动位置，将元素居中显示
				const targetScroll =
					itemOffsetTop - containerHeight / 2 + itemHeight / 2;

				tocContainer.scrollTo({
					top: targetScroll,
					behavior: "smooth",
				});
			}
		}, 100);
	}

	/**
	 * 处理点击事件
	 */
	public handleClick(event: Event): void {
		event.preventDefault();
		const target = event.currentTarget as HTMLAnchorElement;
		const id = decodeURIComponent(
			target.getAttribute("href")?.substring(1) || "",
		);
		const targetElement = document.getElementById(id);

		if (targetElement) {
			const targetTop =
				targetElement.getBoundingClientRect().top +
				window.pageYOffset -
				this.scrollOffset;

			window.scrollTo({
				top: targetTop,
				behavior: "smooth",
			});
		}
	}

	/**
	 * 设置IntersectionObserver
	 */
	public setupObserver(): void {
		const headings = this.getAllHeadings();

		if (this.observer) {
			this.observer.disconnect();
		}

		this.observer = new IntersectionObserver(
			() => {
				this.updateActiveState();
			},
			{
				rootMargin: "0px 0px 0px 0px",
				threshold: 0,
			},
		);

		headings.forEach((heading) => {
			if (heading.id) {
				this.observer?.observe(heading);
			}
		});
	}

	/**
	 * 绑定点击事件
	 */
	public bindClickEvents(): void {
		this.tocItems.forEach((item) => {
			item.addEventListener("click", this.handleClick.bind(this));
		});
	}

	/**
	 * 清理
	 */
	public cleanup(): void {
		if (this.observer) {
			this.observer.disconnect();
			this.observer = null;
		}
		if (this.scrollTimeout) {
			clearTimeout(this.scrollTimeout);
			this.scrollTimeout = null;
		}
	}

	/**
	 * 重建目录（DOM 遍历生成列表）+ 绑定交互。
	 * 用于 fallback：加密文章解密后、空 SSR、或站内导航后侧栏 DOM 变旧时。
	 */
	public render(): void {
		this.updateTOCContent();
		this.bindClickEvents();
		this.setupObserver();
		this.updateActiveState();
	}

	/**
	 * 判断现有锚点是否与当前正文的目录完全一致（避免站内导航后侧栏 DOM 未被
	 * swup 替换、仍显示上一篇目录的情况）。用与 SSR 相同的算法从当前正文算出
	 * 期望 id 序列并逐一比对——不同文章即使共用个别标题名也不会误判。
	 */
	private anchorsMatchCurrentContent(anchors: HTMLElement[]): boolean {
		const expected = computeTocItems(
			this.domHeadingsToInputs(this.getAllHeadings()),
			{ maxLevel: this.maxLevel },
		);
		if (expected.length !== anchors.length) return false;
		return expected.every(
			(item, i) => anchors[i].dataset.headingId === item.headingId,
		);
	}

	/**
	 * 附着到已有的服务端渲染锚点上（不重新生成列表），只绑定滚动高亮/点击。
	 * 若没有 SSR 锚点、或锚点属于上一篇文章（侧栏未被 swup 替换），回退到 render()。
	 */
	public attach(): void {
		const tocContent = document.getElementById(this.contentId);
		if (!tocContent) return;

		const anchors = Array.from(tocContent.querySelectorAll<HTMLElement>("a"));

		// 没有锚点（加密未解密/空）或锚点是上一篇的 → 重建
		if (anchors.length === 0 || !this.anchorsMatchCurrentContent(anchors)) {
			this.render();
			return;
		}

		this.tocItems = anchors;
		this.bindClickEvents();
		this.setupObserver();
		this.updateActiveState();
	}

	/**
	 * 初始化（向后兼容别名，等价于 render()）
	 */
	public init(): void {
		this.render();
	}
}

/**
 * 检查是否为文章页面
 */
export function isPostPage(): boolean {
	return window.location.pathname.includes("/posts/");
}
