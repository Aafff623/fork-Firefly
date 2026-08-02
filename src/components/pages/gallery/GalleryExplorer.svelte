<script lang="ts">
import type { GalleryWork } from "./gallery-types";
import InfiniteAlbumCanvas from "./InfiniteAlbumCanvas.svelte";
import PortfolioAccordion from "./PortfolioAccordion.svelte";

export type { GalleryWork };

type ViewMode = "portfolio" | "normal";

interface Props {
	works: GalleryWork[];
	photos: string[];
	defaultMode?: ViewMode;
	labels: {
		portfolio: string;
		normal: string;
		viewWork: string;
		dragHint: string;
		demoHint: string;
		empty: string;
	};
}

const {
	works,
	photos,
	defaultMode = "portfolio",
	labels,
}: Props = $props();

// 规范：每次进入相册都默认作品集；会话内可切无限滚动，不写 localStorage
let mode = $state<ViewMode>(defaultMode);

const canvasPhotos = $derived(
	photos.length > 0 ? photos : works.map((w) => w.image).filter(Boolean),
);

function setMode(next: ViewMode) {
	mode = next;
}
</script>

<div class="gallery-explorer">
	<div class="gallery-mode-switch" role="tablist" aria-label="album view mode">
		<button
			type="button"
			role="tab"
			aria-selected={mode === "portfolio"}
			class:active={mode === "portfolio"}
			onclick={() => setMode("portfolio")}
		>
			{labels.portfolio}
		</button>
		<button
			type="button"
			role="tab"
			aria-selected={mode === "normal"}
			class:active={mode === "normal"}
			onclick={() => setMode("normal")}
		>
			{labels.normal}
		</button>
	</div>

	{#if works.length === 0 && canvasPhotos.length === 0}
		<div class="gallery-stage-frame gallery-stage-empty">
			<p>{labels.empty}</p>
		</div>
	{:else}
		<div
			class="gallery-stage-frame"
			class:is-portfolio={mode === "portfolio"}
			class:is-normal={mode === "normal"}
		>
			{#if mode === "portfolio"}
				<PortfolioAccordion works={works} viewLabel={labels.viewWork} />
			{:else}
				<InfiniteAlbumCanvas
					photos={canvasPhotos}
					title="INFINITE CANVAS"
					hint={labels.dragHint}
					demoHint={labels.demoHint}
				/>
			{/if}
		</div>
	{/if}
</div>
