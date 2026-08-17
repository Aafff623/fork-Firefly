<script lang="ts">
/**
 * 无限画布入口：方块 App 图标 → 全屏挂载 InfiniteAlbumCanvas（按需加载/卸载）
 */
import { onDestroy, type Component } from "svelte";

interface Props {
	photos?: string[];
	photosUrl?: string;
	labels: {
		open: string;
		close: string;
		dragHint: string;
		demoHint: string;
		empty: string;
		loadError?: string;
		retry?: string;
	};
}

const { photos = [], photosUrl, labels }: Props = $props();

let open = $state(false);
let prevOverflow = "";
let resolvedPhotos = $state<string[]>(photos);
let Canvas = $state<Component<{
	photos: string[];
	title?: string;
	hint?: string;
	demoHint?: string;
}> | null>(null);
let loading = $state(false);
let loadError = $state(false);

/** 悬停预热：并行拉照片清单与画布 chunk（点击意图已明确，符合 hover-intent 预取纪律） */
function warmup() {
	if (open || loading) return;
	if (photosUrl && resolvedPhotos.length === 0) {
		void fetch(photosUrl)
			.then(async (r) => (r.ok ? ((await r.json()) as { photos?: string[] }) : null))
			.then((d) => {
				if (d && Array.isArray(d.photos) && resolvedPhotos.length === 0) {
					resolvedPhotos = d.photos;
				}
			})
			.catch(() => {});
	}
	if (!Canvas) {
		void import("./InfiniteAlbumCanvas.svelte")
			.then((m) => {
				Canvas = m.default;
			})
			.catch(() => {});
	}
}

async function openCanvas() {
	if (open || loading) return;
	loading = true;
	loadError = false;
	try {
		// 照片清单与画布 chunk 并行取，省一个串行 RTT
		const [jsonPhotos, canvasMod] = await Promise.all([
			photosUrl && resolvedPhotos.length === 0
				? fetch(photosUrl).then(async (r) => {
						if (!r.ok) throw new Error(`explorer.json ${r.status}`);
						const d = (await r.json()) as { photos?: string[] };
						return Array.isArray(d.photos) ? d.photos : [];
					})
				: null,
			!Canvas ? import("./InfiniteAlbumCanvas.svelte") : null,
		]);
		if (jsonPhotos) resolvedPhotos = jsonPhotos;
		if (canvasMod) Canvas = canvasMod.default;
		prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		open = true;
	} catch {
		// 网络失败与「暂无相册」区分开：给出可重试的错误态
		loadError = true;
	} finally {
		loading = false;
	}
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
	onpointerover={warmup}
	aria-label={labels.open}
	title={labels.open}
	aria-busy={loading}
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

{#if loadError}
	<div class="infinite-canvas-load-error" role="alert">
		<span>{labels.loadError ?? "画布加载失败"}</span>
		<button type="button" onclick={() => openCanvas()}>
			{labels.retry ?? "重试"}
		</button>
	</div>
{/if}

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
		{#if Canvas && resolvedPhotos.length > 0}
			<Canvas
				photos={resolvedPhotos}
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
