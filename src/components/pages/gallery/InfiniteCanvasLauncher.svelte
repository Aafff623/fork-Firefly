<script lang="ts">
/**
 * 无限画布入口：方块 App 图标 → 全屏挂载 InfiniteAlbumCanvas（按需加载/卸载）
 */
import { onDestroy } from "svelte";
import InfiniteAlbumCanvas from "./InfiniteAlbumCanvas.svelte";

interface Props {
	photos: string[];
	labels: {
		open: string;
		close: string;
		dragHint: string;
		demoHint: string;
		empty: string;
	};
}

const { photos, labels }: Props = $props();

let open = $state(false);
let prevOverflow = "";

function openCanvas() {
	if (open) return;
	prevOverflow = document.body.style.overflow;
	document.body.style.overflow = "hidden";
	open = true;
}

function closeCanvas() {
	if (!open) return;
	open = false;
	document.body.style.overflow = prevOverflow;
}

function onKeydown(e: KeyboardEvent) {
	if (e.key === "Escape" && open) {
		e.preventDefault();
		closeCanvas();
	}
}

$effect(() => {
	if (!open) return;
	window.addEventListener("keydown", onKeydown);
	return () => window.removeEventListener("keydown", onKeydown);
});

onDestroy(() => {
	if (open) document.body.style.overflow = prevOverflow;
});
</script>

<button
	type="button"
	class="infinite-canvas-app-btn"
	onclick={openCanvas}
	aria-label={labels.open}
	title={labels.open}
>
	<span class="infinite-canvas-app-btn__glyph" aria-hidden="true">
		<svg viewBox="0 0 24 24" width="22" height="22" fill="none">
			<rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.75" />
			<rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.75" />
			<rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.75" />
			<rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.75" />
		</svg>
	</span>
</button>

{#if open}
	<div
		class="infinite-canvas-fullscreen"
		role="dialog"
		aria-modal="true"
		aria-label={labels.open}
	>
		<button
			type="button"
			class="infinite-canvas-close"
			onclick={closeCanvas}
			aria-label={labels.close}
			title={labels.close}
		>
			<svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
				<path
					d="M6 6l12 12M18 6L6 18"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
				/>
			</svg>
		</button>
		{#if photos.length > 0}
			<InfiniteAlbumCanvas
				photos={photos}
				title="INFINITE CANVAS"
				hint={labels.dragHint}
				demoHint={labels.demoHint}
			/>
		{:else}
			<div class="infinite-canvas-fullscreen__empty">
				<p>{labels.empty}</p>
			</div>
		{/if}
	</div>
{/if}
