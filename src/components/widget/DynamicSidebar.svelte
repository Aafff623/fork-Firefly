<script lang="ts">
/**
 * 侧边栏动态组件 - 从 API 获取数据
 * 支持自定义 API 地址，方便接入第三方后端
 */
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { onMount } from "svelte";
import Icon from "@/components/common/Icon.svelte";
import { formatDynamicDate } from "@/utils/date-utils";
import { fetchWithDedup } from "@/utils/fetch-dedup";
import { fetchMemos } from "@/utils/memos-adapter";
import { url } from "@/utils/url-utils";

interface DynamicEntry {
	id: string;
	published: number;
	html: string;
	images?: Array<{ alt: string; src: string; title?: string }>;
	searchText?: string;
	pinned?: boolean;
}

interface MemosConfig {
	enable: boolean;
	apiUrl: string;
	parent?: string;
}

interface Props {
	apiUrl: string;
	limit: number;
	memos?: MemosConfig;
}

let { apiUrl, limit, memos }: Props = $props();

let entries: DynamicEntry[] = $state([]);
let totalCount = $state(0);
let loading = $state(true);
let error = $state(false);

onMount(async () => {
	try {
		let data: DynamicEntry[];
		if (memos?.enable) {
			data = await fetchMemos(memos.apiUrl, { parent: memos.parent });
		} else {
			data = await fetchWithDedup(apiUrl);
		}

		totalCount = data.length;
		entries = data.slice(0, limit);
		updateCountBadge();
	} catch {
		error = true;
	} finally {
		loading = false;
	}
});

function updateCountBadge() {
	const badge = document.querySelector("[data-dynamic-count]");
	if (badge && totalCount > 0) {
		badge.textContent = `(${totalCount})`;
	}
}

// 从 HTML 中提取纯文本摘要
function getPlainText(html: string): string {
	const div = document.createElement("div");
	div.innerHTML = html;
	return div.textContent?.trim() || "";
}

// 格式化日期
// 本地 API 使用 formatDynamicDate（带时区转换）
// 第三方 API 和 Memos 使用浏览器本地时区，不做额外转换
function formatDate(timestamp: number): string {
	if (apiUrl.startsWith("http") || memos?.enable) {
		return new Date(timestamp).toLocaleDateString("zh-CN", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		});
	}
	return formatDynamicDate(new Date(timestamp));
}
</script>

<div class="flex flex-col gap-1">
	{#if loading}
		<div class="flex justify-center p-2">
			<Icon icon="lucide:loader-circle" class="size-5 animate-spin text-(--primary)" />
		</div>
	{:else if error || entries.length === 0}
		<p class="m-0 p-2 text-center text-sm text-neutral-500">
			{i18n(I18nKey.dynamicEmpty)}
		</p>
	{:else}
		{#each entries as entry, index (entry.id)}
			{@const text = getPlainText(entry.html)}
			{@const image = entry.images?.[0]}
			<a
				href={url(`/dynamic/#dynamic-${entry.id}`)}
				class={`dynamics-sidebar__entry dynamics-sidebar__entry--${index % 2 === 0 ? "ink" : "ash"} ${index < 2 ? "dynamics-sidebar__entry--blink" : ""} group flex min-w-0 items-center gap-2 rounded-lg p-1.5
					text-neutral-700/75 dark:text-neutral-300/75
					hover:bg-(--btn-plain-bg-hover)
					active:bg-(--btn-plain-bg-active) transition-colors duration-150`}
				aria-label={`${i18n(I18nKey.dynamic)}: ${text}`}
			>
				<div class="min-w-0 flex-1">
					<div class="dynamics-sidebar__time mb-0.5 flex items-center gap-1 text-[0.7rem] leading-3.5">
						<Icon icon="lucide:clock" class="size-3.5 shrink-0" />
						<time datetime={new Date(entry.published).toISOString()}>
							{formatDate(entry.published)}
						</time>
						{#if entry.pinned}
							<span class="ml-auto inline-flex items-center gap-0.5 text-[10px] px-1 py-0.5 rounded bg-(--primary)/10 text-(--primary) font-medium">
								<Icon icon="lucide:pin" class="size-3" />
								{i18n(I18nKey.pinned)}
							</span>
						{/if}
					</div>
					<p class="dynamics-sidebar__body m-0 line-clamp-2 text-[0.8rem] leading-5 italic">
						{text}
					</p>
				</div>
				{#if image}
					<img
						src={image.src}
						alt={image.alt}
						class="size-11 shrink-0 rounded-lg bg-(--btn-plain-bg-hover) object-cover"
						loading="lazy"
						decoding="async"
					/>
				{/if}
			</a>
		{/each}
	{/if}
</div>

<style>
	.dynamics-sidebar__entry--ink {
		--dynamic-accent: oklch(0.16 0.008 265);
		--dynamic-body: oklch(0.2 0.008 265);
	}

	.dynamics-sidebar__entry--ash {
		--dynamic-accent: oklch(0.5 0.012 265);
		--dynamic-body: oklch(0.54 0.01 265);
	}

	.dynamics-sidebar__time,
	.dynamics-sidebar__entry:hover .dynamics-sidebar__body {
		color: var(--dynamic-accent);
	}

	.dynamics-sidebar__body {
		color: var(--dynamic-body);
	}

	:global(.dark) .dynamics-sidebar__entry--ink {
		--dynamic-accent: oklch(0.9 0.01 265);
		--dynamic-body: oklch(0.82 0.01 265);
	}

	:global(.dark) .dynamics-sidebar__entry--ash {
		--dynamic-accent: oklch(0.74 0.01 265);
		--dynamic-body: oklch(0.68 0.01 265);
	}

	/* 最新两条：仅颜色/透明度变淡闪烁，无位移缩放 */
	@keyframes dynamics-sidebar-fade-soft {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.42;
		}
	}

	.dynamics-sidebar__entry--blink .dynamics-sidebar__time,
	.dynamics-sidebar__entry--blink .dynamics-sidebar__body {
		animation: dynamics-sidebar-fade-soft 2.4s ease-in-out infinite;
	}

	@media (prefers-reduced-motion: reduce) {
		.dynamics-sidebar__entry--blink .dynamics-sidebar__time,
		.dynamics-sidebar__entry--blink .dynamics-sidebar__body {
			animation: none;
		}
	}
</style>
