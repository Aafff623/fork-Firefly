<script lang="ts">
import Icon from "@/components/common/Icon.svelte";
import I18nKey from "@/i18n/i18nKey";
import { i18n } from "@/i18n/translation";
import type { StandardizedAnime } from "@/types/anime";

interface Props {
	anime: StandardizedAnime | null;
	onclose: () => void;
}

let { anime, onclose }: Props = $props();

/** 将元素挂载到 body，脱离 overflow:hidden 容器 */
function portal(node: HTMLElement) {
	document.body.appendChild(node);
	return {
		destroy() {
			node.remove();
		},
	};
}

function handleBackdropClick(e: MouseEvent) {
	if (e.target === e.currentTarget) {
		onclose();
	}
}

function handleKeydown(e: KeyboardEvent) {
	if (e.key === "Escape") {
		onclose();
	}
}

const SEASON_TYPE_I18N: Record<number, I18nKey> = {
	1: I18nKey.animeTypeAnime,
	2: I18nKey.animeTypeMovie,
	3: I18nKey.animeTypeDocumentary,
	4: I18nKey.animeTypeChinese,
	5: I18nKey.animeTypeDrama,
	7: I18nKey.animeTypeConcert,
};

const SEASON_TYPE_COLORS: Record<number, string> = {
	1: "bg-blue-500",
	2: "bg-purple-500",
	3: "bg-emerald-500",
	4: "bg-orange-500",
	5: "bg-pink-500",
	7: "bg-yellow-500",
};

function getTypeLabel(seasonType: number): string {
	return i18n(SEASON_TYPE_I18N[seasonType] || I18nKey.animeTypeAnime);
}

function getTypeColor(seasonType: number): string {
	return SEASON_TYPE_COLORS[seasonType] || "bg-gray-500";
}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if anime}
	<div
		use:portal
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<div class="relative w-full max-w-lg max-h-[90vh] overflow-hidden rounded-xl sm:rounded-2xl bg-(--card-bg) border border-(--line-divider) shadow-2xl animate-in scale-90 sm:scale-100">
			<!-- 关闭按钮 -->
			<button
				class="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
				onclick={onclose}
				aria-label={i18n(I18nKey.animeClose)}
			>
				<Icon icon="lucide:x" class="h-4 w-4" />
			</button>

			<!-- 内容区域 -->
			<div class="flex flex-col md:flex-row">
				<!-- 海报 -->
				<div class="relative w-full md:w-64 lg:w-72 shrink-0 h-48 sm:h-64 md:aspect-auto md:h-auto bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
					{#if anime.poster}
						<div class="lqip-placeholder absolute inset-0 pointer-events-none" style="background: var(--muted)" aria-hidden="true"></div>
						<img
							src={anime.poster}
							alt={anime.title}
							class="h-full w-full object-cover opacity-0 transition-opacity duration-500"
							referrerpolicy="no-referrer"
							crossorigin="anonymous"
							onload={(e) => {
								const img = e.currentTarget as HTMLElement;
								img.style.opacity = '1';
								const ph = img.parentElement?.querySelector('.lqip-placeholder');
								if (ph) ph.classList.add('loaded');
							}}
						/>
					{:else}
						<div class="flex h-full min-h-[300px] items-center justify-center">
							<Icon icon="lucide:image" class="h-16 w-16 text-neutral-300 dark:text-neutral-600" />
						</div>
					{/if}
				</div>

				<!-- 详情 -->
				<div class="flex-1 p-4 sm:p-6 overflow-y-auto max-h-[60vh] md:max-h-none">
					<!-- 标题 -->
					<h2 class="mb-1 text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">
						{anime.title}
					</h2>
					{#if anime.originalTitle && anime.originalTitle !== anime.title}
						<p class="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
							{anime.originalTitle}
						</p>
					{/if}

					<!-- 徽章 -->
					<div class="mb-4 flex flex-wrap gap-2">
						<span class="inline-flex items-center gap-1 rounded-lg {getTypeColor(anime.season_type)} px-3 py-1 text-xs font-bold text-white">
							{getTypeLabel(anime.season_type)}
						</span>
						{#if anime.rating > 0}
							<span class="inline-flex items-center gap-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 text-xs font-bold text-yellow-600 dark:text-yellow-400">
								<Icon icon="lucide:star" class="h-3 w-3" />
								{anime.rating.toFixed(1)}
							</span>
						{/if}
						{#if anime.epStatus}
							<span class="inline-flex items-center rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
								{anime.epStatus}
							</span>
						{/if}
						<span class="inline-flex items-center rounded-lg {anime.source === 'bilibili' ? 'bg-pink-500/10 border-pink-500/20 text-pink-600 dark:text-pink-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'} border px-3 py-1 text-xs font-bold">
							{anime.source === 'bilibili' ? 'Bilibili' : 'TMDB'}
						</span>
					</div>

					<!-- 简介 -->
					{#if anime.overview}
						<div class="mb-6">
							<h3 class="mb-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">{i18n(I18nKey.animeSynopsis)}</h3>
							<p class="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-h-40 overflow-y-auto">
								{anime.overview}
							</p>
						</div>
					{/if}

					<!-- 跳转按钮 -->
					<a
						href={anime.link}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-(--primary) px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-(--primary)/90 hover:shadow-lg"
					>
						{#if anime.source === 'bilibili'}
							<Icon icon="lucide:circle-play" class="h-4 w-4" />
							{i18n(I18nKey.animeWatchNow)}
						{:else}
							<Icon icon="lucide:external-link" class="h-4 w-4" />
							{i18n(I18nKey.animeViewTmdb)}
						{/if}
					</a>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes animate-in {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.animate-in {
		animation: animate-in 0.2s ease-out;
	}
</style>
