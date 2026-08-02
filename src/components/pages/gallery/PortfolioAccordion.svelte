<script lang="ts">
import type { GalleryWork } from "./gallery-types";

interface Props {
	works: GalleryWork[];
	viewLabel: string;
}

const { works, viewLabel }: Props = $props();

let activeIndex = $state(0);
let listEl = $state<HTMLDivElement | null>(null);

/** 已预热图片：当前 + 邻格，避免多张大图同时解码 */
let warmed = $state<Set<number>>(new Set([0, 1]));

let rafPending = 0;
let queuedIndex = 0;

function warmAround(index: number) {
	const next = new Set(warmed);
	for (let i = index - 1; i <= index + 1; i++) {
		if (i >= 0 && i < works.length) next.add(i);
	}
	warmed = next;
}

function applyIndex(index: number) {
	if (index === activeIndex || index < 0 || index >= works.length) return;
	activeIndex = index;
	warmAround(index);
}

/** 合并到每帧最多一次，避免快速扫过时连续触发布局 */
function requestIndex(index: number) {
	queuedIndex = index;
	if (rafPending) return;
	rafPending = requestAnimationFrame(() => {
		rafPending = 0;
		applyIndex(queuedIndex);
	});
}

function onPanelEnter(index: number) {
	if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
		requestIndex(index);
	}
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
</script>

<div
	class="portfolio-accordion"
	style={`--panel-count: ${Math.max(works.length, 1)};`}
	bind:this={listEl}
	role="listbox"
	aria-label="portfolio accordion"
	aria-activedescendant={`portfolio-panel-${activeIndex}`}
	tabindex="0"
	onkeydown={onKeydown}
>
	{#each works as work, index (work.id)}
		{@const active = index === activeIndex}
		{@const ready = warmed.has(index)}
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div
			id={`portfolio-panel-${index}`}
			class="portfolio-panel"
			class:is-active={active}
			role="option"
			aria-selected={active}
			data-panel-index={index}
			tabindex={active ? 0 : -1}
			onpointerenter={() => onPanelEnter(index)}
			onclick={() => onPanelActivate(index)}
			onfocus={() => onPanelActivate(index)}
			onkeydown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onPanelActivate(index);
				}
			}}
		>
			<div class="portfolio-panel-media" aria-hidden="true">
				{#if ready}
					<img
						src={work.image}
						alt=""
						draggable="false"
						decoding="async"
						loading={index <= 1 ? "eager" : "lazy"}
						fetchpriority={active ? "high" : "low"}
						sizes="(max-width: 640px) 78vw, 55vw"
					/>
				{:else}
					<div class="portfolio-panel-skeleton"></div>
				{/if}
				<div class="portfolio-panel-scrim"></div>
			</div>

			<span class="portfolio-panel-title">{work.title}</span>

			<div class="portfolio-panel-meta">
				{#if work.description}
					<p>{work.description}</p>
				{/if}
				{#if work.href}
					<a
						class="portfolio-panel-cta"
						href={work.href}
						tabindex={active ? 0 : -1}
						onclick={(e) => e.stopPropagation()}
					>
						{viewLabel}
					</a>
				{/if}
			</div>
		</div>
	{/each}
</div>
