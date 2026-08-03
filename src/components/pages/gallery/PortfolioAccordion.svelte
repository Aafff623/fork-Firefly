<script lang="ts">
/**
 * 作品集手风琴 —— 迁移自 website-ui-share「水平手风琴作品集」
 * - CSS Grid 列宽 10fr / 1fr 切换
 * - 单图 + scrim（无立绘弹出层）
 * - rAF 合并 pointermove，避免悬停连发布局
 * - 图片全量 eager（面板 ≤7，解码成本可接受）
 */
import type { GalleryWork } from "./gallery-types";

interface Props {
	works: GalleryWork[];
	viewLabel: string;
}

const { works, viewLabel }: Props = $props();

let activeIndex = $state(0);
let listEl = $state<HTMLDivElement | null>(null);
let articleWidth = $state(0);

let rafPending = 0;
let queuedIndex = 0;
let resyncTimer = 0;

const panelCount = $derived(Math.max(works.length, 1));

/** 与源码一致：激活栏 10fr，其余 1fr */
const gridColumns = $derived(
	works.length === 0
		? "1fr"
		: works.map((_, i) => (i === activeIndex ? "10fr" : "1fr")).join(" "),
);

function applyIndex(index: number) {
	if (index < 0 || index >= works.length) return;
	if (index === activeIndex) return;
	activeIndex = index;
	scheduleResync();
}

function requestIndex(index: number) {
	queuedIndex = index;
	if (rafPending) return;
	rafPending = requestAnimationFrame(() => {
		rafPending = 0;
		applyIndex(queuedIndex);
	});
}

function onPointerMove(event: PointerEvent) {
	if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
	const target = (event.target as HTMLElement | null)?.closest(
		"[data-panel-index]",
	) as HTMLElement | null;
	if (!target) return;
	const index = Number(target.dataset.panelIndex);
	if (Number.isFinite(index)) requestIndex(index);
}

function onPanelActivate(index: number) {
	applyIndex(index);
}

function focusPanel(index: number) {
	(
		listEl?.querySelector(`[data-panel-index="${index}"]`) as HTMLElement | null
	)?.focus();
}

function onKeydown(event: KeyboardEvent) {
	if (event.key === "ArrowRight" || event.key === "ArrowDown") {
		event.preventDefault();
		const next = Math.min(works.length - 1, activeIndex + 1);
		applyIndex(next);
		focusPanel(next);
	} else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
		event.preventDefault();
		const next = Math.max(0, activeIndex - 1);
		applyIndex(next);
		focusPanel(next);
	} else if (event.key === "Home") {
		event.preventDefault();
		applyIndex(0);
		focusPanel(0);
	} else if (event.key === "End") {
		event.preventDefault();
		const last = works.length - 1;
		applyIndex(last);
		focusPanel(last);
	}
}

/** 文案区宽度取最宽一栏，避免展开时挤扁（对照源码 --article-width） */
function resyncArticleWidth() {
	if (!listEl) return;
	const panels = listEl.querySelectorAll<HTMLElement>(".portfolio-panel");
	if (!panels.length) return;
	let max = 0;
	for (const panel of panels) {
		max = Math.max(max, panel.offsetWidth);
	}
	if (max > 0) articleWidth = max;
}

function scheduleResync() {
	// 等列宽过渡落定后再量宽
	window.clearTimeout(resyncTimer);
	resyncTimer = window.setTimeout(resyncArticleWidth, 420);
}

function onResize() {
	resyncArticleWidth();
}

$effect(() => {
	// works / 首屏：量一次宽
	void works.length;
	const id = requestAnimationFrame(() => {
		resyncArticleWidth();
		// 布局稳定后再量一次
		scheduleResync();
	});
	window.addEventListener("resize", onResize);
	return () => {
		cancelAnimationFrame(id);
		window.clearTimeout(resyncTimer);
		window.removeEventListener("resize", onResize);
		if (rafPending) cancelAnimationFrame(rafPending);
	};
});

/** 后台预解码封面，悬停切栏时少等 decode */
$effect(() => {
	const urls = works.map((w) => w.image).filter(Boolean);
	for (const src of urls) {
		const img = new Image();
		img.decoding = "async";
		img.src = src;
	}
});
</script>

<div
	class="portfolio-accordion"
	style={`--panel-count: ${panelCount}; --article-width: ${articleWidth}; grid-template-columns: ${gridColumns};`}
	bind:this={listEl}
	role="listbox"
	aria-label="portfolio accordion"
	aria-activedescendant={`portfolio-panel-${activeIndex}`}
	tabindex="0"
	onkeydown={onKeydown}
	onpointermove={onPointerMove}
>
	{#each works as work, index (work.id)}
		{@const active = index === activeIndex}
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div
			id={`portfolio-panel-${index}`}
			class="portfolio-panel"
			class:is-active={active}
			data-active={active ? "true" : "false"}
			role="option"
			aria-selected={active}
			data-panel-index={index}
			tabindex={active ? 0 : -1}
			onclick={() => onPanelActivate(index)}
			onfocus={() => onPanelActivate(index)}
			onkeydown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onPanelActivate(index);
				}
			}}
		>
			<article class="portfolio-panel-body">
				<h3 class="portfolio-panel-title">{work.title}</h3>

				{#if work.description}
					<p class="portfolio-panel-desc">{work.description}</p>
				{/if}

				{#if work.href}
					<a
						class="portfolio-panel-cta"
						href={work.href}
						tabindex={active ? 0 : -1}
						onclick={(e) => e.stopPropagation()}
					>
						<span>{viewLabel}</span>
					</a>
				{/if}

				<div class="portfolio-panel-media" aria-hidden="true">
					<img
						src={work.image}
						alt=""
						draggable="false"
						decoding="async"
						loading={index <= 2 ? "eager" : "lazy"}
						fetchpriority={active || index === 0 ? "high" : "low"}
						sizes="(max-width: 640px) 78vw, 55vw"
					/>
					<div class="portfolio-panel-scrim"></div>
				</div>
			</article>
		</div>
	{/each}
</div>
