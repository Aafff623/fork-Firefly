<script lang="ts">
/**
 * 百叶窗精选条 — 改编自 bilibili-goat `effects/百叶窗`
 * 水平展开交互，尺寸更小，贴合追番页。
 */
interface AnimeBlindItem {
	id: string | number;
	title: string;
	poster: string | null;
	rating?: number;
	overview?: string;
	/** 有真实番剧对象时，点击详情会回传 */
	source?: unknown;
}

interface Props {
	items: AnimeBlindItem[];
	viewLabel: string;
	onselect?: (item: AnimeBlindItem) => void;
}

const { items, viewLabel, onselect }: Props = $props();

let activeIndex = $state(0);
let listEl = $state<HTMLDivElement | null>(null);
let warmed = $state<Set<number>>(new Set([0, 1]));

let rafPending = 0;
let queuedIndex = 0;

function warmAround(index: number) {
	const next = new Set(warmed);
	for (let i = index - 1; i <= index + 1; i++) {
		if (i >= 0 && i < items.length) next.add(i);
	}
	warmed = next;
}

function applyIndex(index: number) {
	if (index === activeIndex || index < 0 || index >= items.length) return;
	activeIndex = index;
	warmAround(index);
}

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

function openDetail(item: AnimeBlindItem) {
	onselect?.(item);
}

function focusPanel(index: number) {
	(
		listEl?.querySelector(`[data-panel-index="${index}"]`) as HTMLElement | null
	)?.focus();
}

function onKeydown(event: KeyboardEvent) {
	if (event.key === "ArrowRight" || event.key === "ArrowDown") {
		event.preventDefault();
		const next = Math.min(items.length - 1, activeIndex + 1);
		applyIndex(next);
		focusPanel(next);
	} else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
		event.preventDefault();
		const next = Math.max(0, activeIndex - 1);
		applyIndex(next);
		focusPanel(next);
	}
}
</script>

{#if items.length > 0}
	<div
		class="anime-blinds"
		style={`--panel-count: ${Math.max(items.length, 1)};`}
		bind:this={listEl}
		role="listbox"
		aria-label="anime blinds"
		aria-activedescendant={`anime-blinds-panel-${activeIndex}`}
		tabindex="0"
		onkeydown={onKeydown}
	>
				{#each items as item, index (item.id)}
			{@const active = index === activeIndex}
			{@const ready = warmed.has(index)}
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div
				id={`anime-blinds-panel-${index}`}
				class="anime-blinds__panel"
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
						if (active && item.source) openDetail(item);
					}
				}}
			>
				<div class="anime-blinds__media" aria-hidden="true">
					{#if ready && item.poster}
						<img
							src={item.poster}
							alt=""
							draggable="false"
							decoding="async"
							loading={index <= 1 ? "eager" : "lazy"}
							referrerpolicy="no-referrer"
							crossorigin="anonymous"
							fetchpriority={active ? "high" : "low"}
						/>
					{:else}
						<div class="anime-blinds__skeleton"></div>
					{/if}
					<div class="anime-blinds__scrim"></div>
				</div>

				<span class="anime-blinds__title">{item.title}</span>

				<div class="anime-blinds__meta">
					{#if item.rating && item.rating > 0}
						<p class="anime-blinds__rating">{item.rating.toFixed(1)}</p>
					{/if}
					{#if item.overview}
						<p class="anime-blinds__desc">{item.overview}</p>
					{/if}
					{#if item.source}
						<button
							type="button"
							class="anime-blinds__cta"
							tabindex={active ? 0 : -1}
							onclick={(e) => {
								e.stopPropagation();
								openDetail(item);
							}}
						>
							{viewLabel}
						</button>
					{/if}
				</div>
			</div>
		{/each}
	</div>
{/if}

<style>
  .anime-blinds {
    --gap: 0.4rem;
    --collapsed: clamp(1.85rem, 5.5cqi, 2.55rem);
    --speed: 0.42s;
    --ease: cubic-bezier(0.22, 1, 0.36, 1);
    container-type: size;
    display: flex;
    align-items: stretch;
    gap: var(--gap);
    width: 100%;
    height: clamp(9.5rem, 22vw, 12.5rem);
    max-height: 12.5rem;
    margin: 0 0 1.25rem;
    padding: 0.45rem;
    box-sizing: border-box;
    outline: none;
    border-radius: 0.85rem;
    border: 1px solid color-mix(in oklab, var(--line-divider) 85%, transparent);
    background:
      radial-gradient(
        circle at 28% 18%,
        color-mix(in oklab, var(--primary) 10%, transparent),
        transparent 48%
      ),
      color-mix(in oklab, var(--card-bg) 96%, transparent);
    overflow: hidden;
  }

  :global(:root.dark) .anime-blinds {
    background:
      radial-gradient(
        circle at 28% 18%,
        color-mix(in oklab, var(--primary) 16%, transparent),
        transparent 50%
      ),
      color-mix(in oklab, var(--card-bg) 92%, #111827);
  }

  .anime-blinds__panel {
    --grow: 1;
    position: relative;
    flex: var(--grow) 1 0;
    min-width: var(--collapsed);
    height: 100%;
    margin: 0;
    padding: 0;
    border: 1px solid color-mix(in oklab, var(--line-divider) 80%, transparent);
    border-radius: 0.65rem;
    overflow: hidden;
    cursor: pointer;
    background: color-mix(in oklab, var(--card-bg) 96%, white);
    box-shadow: 0 3px 12px rgb(120 140 170 / 0.07);
    color: inherit;
    text-align: left;
    transition: flex-grow var(--speed) var(--ease);
    contain: layout paint style;
  }

  .anime-blinds__panel.is-active {
    --grow: 10;
    z-index: 1;
  }

  .anime-blinds__media {
    position: absolute;
    inset: 0;
    overflow: hidden;
    background: color-mix(in oklab, var(--btn-regular-bg) 80%, transparent);
  }

  .anime-blinds__media img,
  .anime-blinds__skeleton {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .anime-blinds__media img {
    object-fit: cover;
    object-position: center top;
    transform: scale(1);
    transform-origin: center center;
    opacity: 0.72;
    transition: opacity var(--speed) var(--ease);
  }

  .anime-blinds__panel.is-active .anime-blinds__media img {
    opacity: 1;
    animation: anime-blinds-approach 0.75s var(--ease) both;
  }

  @keyframes anime-blinds-approach {
    from {
      transform: scale(1);
    }
    to {
      transform: scale(1.08);
    }
  }

  .anime-blinds__skeleton {
    background: linear-gradient(
      120deg,
      color-mix(in oklab, var(--btn-regular-bg) 90%, transparent) 20%,
      color-mix(in oklab, var(--primary) 12%, transparent) 45%,
      color-mix(in oklab, var(--btn-regular-bg) 90%, transparent) 70%
    );
    background-size: 200% 100%;
    animation: anime-blinds-skel 1.2s linear infinite;
  }

  @keyframes anime-blinds-skel {
    to {
      background-position: -200% 0;
    }
  }

  .anime-blinds__scrim {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(90deg, rgb(255 255 255 / 0.5), transparent 42%),
      linear-gradient(0deg, rgb(15 23 42 / 0.58), transparent 50%);
    opacity: 0.55;
    transition: opacity var(--speed) var(--ease);
  }

  :global(:root.dark) .anime-blinds__scrim {
    background:
      linear-gradient(90deg, rgb(15 23 42 / 0.55), transparent 42%),
      linear-gradient(0deg, rgb(0 0 0 / 0.62), transparent 50%);
  }

  .anime-blinds__panel.is-active .anime-blinds__scrim {
    opacity: 1;
  }

  .anime-blinds__title {
    position: absolute;
    top: 0.75rem;
    left: calc(var(--collapsed) * 0.38);
    z-index: 2;
    transform-origin: 0 50%;
    rotate: 90deg;
    font-size: clamp(0.62rem, 2cqi, 0.78rem);
    font-weight: 700;
    letter-spacing: 0.02em;
    white-space: nowrap;
    max-width: 9.5rem;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--deep-text);
    opacity: 0.55;
    transition: opacity var(--speed) var(--ease);
    text-shadow: 0 1px 10px rgb(255 255 255 / 0.35);
  }

  :global(:root.dark) .anime-blinds__title {
    color: rgb(255 255 255 / 0.92);
    text-shadow: 0 1px 12px rgb(0 0 0 / 0.45);
  }

  .anime-blinds__panel.is-active .anime-blinds__title {
    opacity: 1;
  }

  .anime-blinds__meta {
    position: absolute;
    left: calc(var(--collapsed) * 0.85);
    right: 0.7rem;
    bottom: 0.65rem;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 0.28rem;
    opacity: 0;
    transform: translate3d(0, 0.3rem, 0);
    transition:
      opacity calc(var(--speed) * 0.85) var(--ease),
      transform calc(var(--speed) * 0.85) var(--ease);
    pointer-events: none;
  }

  .anime-blinds__panel.is-active .anime-blinds__meta {
    opacity: 1;
    transform: translate3d(0, 0, 0);
    pointer-events: auto;
    transition-delay: 0.06s;
  }

  .anime-blinds__rating {
    margin: 0;
    font-size: 0.78rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: #fbbf24;
    text-shadow: 0 1px 6px rgb(0 0 0 / 0.35);
  }

  .anime-blinds__desc {
    margin: 0;
    max-width: 14rem;
    font-size: clamp(0.62rem, 1.8cqi, 0.72rem);
    line-height: 1.4;
    color: rgb(255 255 255 / 0.9);
    text-shadow: 0 1px 8px rgb(0 0 0 / 0.35);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .anime-blinds__cta {
    appearance: none;
    border: 0;
    background: transparent;
    width: fit-content;
    padding: 0;
    margin: 0;
    cursor: pointer;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: color-mix(in oklab, white 88%, var(--primary));
  }

  .anime-blinds__cta:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  @container (max-width: 420px) {
    .anime-blinds {
      height: 10.5rem;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      overscroll-behavior-x: contain;
      -webkit-overflow-scrolling: touch;
    }

    .anime-blinds__panel {
      flex: 0 0 min(72%, 210px);
      min-width: min(72%, 210px);
      scroll-snap-align: start;
      transition: none;
    }

    .anime-blinds__title {
      position: static;
      display: block;
      margin: 0.65rem 0.7rem 0.25rem;
      rotate: none;
      max-width: none;
      opacity: 1;
      color: rgb(255 255 255 / 0.95);
    }

    .anime-blinds__meta {
      position: static;
      opacity: 1;
      transform: none;
      pointer-events: auto;
      padding: 0 0.7rem 0.7rem;
    }

    .anime-blinds__media img {
      opacity: 0.88;
      animation: none;
    }

    .anime-blinds__panel.is-active .anime-blinds__media img {
      animation: none;
      transform: scale(1.04);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .anime-blinds__panel,
    .anime-blinds__media img,
    .anime-blinds__scrim,
    .anime-blinds__title,
    .anime-blinds__meta {
      transition-duration: 0.01ms !important;
    }

    .anime-blinds__panel.is-active .anime-blinds__media img {
      animation: none;
      transform: scale(1.04);
    }

    .anime-blinds__skeleton {
      animation: none;
    }
  }
</style>
