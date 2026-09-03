<script lang="ts">
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { onMount } from "svelte";
import Icon from "@/components/common/Icon.svelte";
import type { SearchResult } from "@/global";
import {
	isPostSearchError,
	SEARCH_MODE_OPTIONS,
	type SearchMode,
	searchPosts,
} from "@/utils/post-search";

// --- Props ---
export let title = i18n(I18nKey.search);
export let description = "";

// --- State ---
let keyword = "";
let results: SearchResult[] = [];
let isSearching = false;
let initialized = false;
let searchError = "";
let searchMode: SearchMode = "tag";
let debounceTimer: ReturnType<typeof setTimeout> | undefined;
let searchRequestId = 0;

// 在客户端获取 URL 参数
const getInitialKeyword = (): string => {
	if (typeof window !== "undefined") {
		const searchParams = new URLSearchParams(window.location.search);
		return searchParams.get("q") || "";
	}
	return "";
};

// --- Core Search Logic ---
const search = async () => {
	const trimmedKeyword = keyword.trim();
	if (!initialized || !trimmedKeyword) {
		results = [];
		searchError = "";
		return;
	}
	isSearching = true;
	searchError = "";
	const requestId = ++searchRequestId;

	try {
		const nextResults = await searchPosts(searchMode, trimmedKeyword);
		if (requestId !== searchRequestId) return;
		results = nextResults;
	} catch (error) {
		if (requestId !== searchRequestId) return;
		if (!isPostSearchError(error)) console.error("Search error:", error);
		searchError = isPostSearchError(error)
			? error.message
			: "搜索暂时不可用，请稍后再试";
		results = [];
	} finally {
		if (requestId === searchRequestId) isSearching = false;
	}
};

// --- Initialization onMount ---
onMount(() => {
	const initialize = async () => {
		if (initialized) return;
		initialized = true;

		// 从 URL 获取初始关键词
		const initialKeyword = getInitialKeyword();
		if (initialKeyword) {
			keyword = initialKeyword;
		}

		// 如果有关键词，自动执行搜索
		if (keyword.trim()) {
			await search();
		}
	};

	// 搜索元数据独立于 Pagefind；Pagefind 只在后台继续预热。
	void initialize();
	if (!window.pagefind) {
		document.addEventListener("pagefindready", initialize, { once: true });
		document.addEventListener("pagefindloaderror", initialize, { once: true });
		const pagefindPromise = window.__loadPagefind?.();
		if (pagefindPromise) void pagefindPromise.catch(() => undefined);
	}
});

const handleInput = () => {
	if (debounceTimer) clearTimeout(debounceTimer);
	debounceTimer = setTimeout(() => {
		search();
	}, 300);
};

const handleModeChange = () => {
	if (keyword.trim()) search();
};
</script>

<div class="card-base px-6 py-6 md:px-9 md:py-6 mb-4 rounded-(--radius-large)">
    <!-- Title Section -->
    <div class="mb-4">
        <div class="flex items-center gap-3 mb-3">
            <div class="h-8 w-8 rounded-lg bg-(--primary) flex items-center justify-center text-white dark:text-black/70">
                <Icon icon="lucide:search" class="text-[1.5rem]"></Icon>
            </div>
            <div class="text-3xl font-bold text-90">
                {title}
            </div>
        </div>
        {#if description}
            <p class="text-base text-50 leading-relaxed">
                {description}
            </p>
        {/if}
    </div>

    <!-- Search Bar -->
    <div class="relative flex">
        <div class="relative flex-1">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Icon icon="lucide:search" class="text-2xl text-50" />
            </div>
            <input
                type="text"
                class="block w-full p-4 pl-10 text-sm bg-transparent border border-black/10 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-(--primary) focus:border-(--primary) hover:border-black/20 dark:hover:border-white/20 text-75 placeholder:opacity-50 transition-colors outline-hidden"
                placeholder={i18n(I18nKey.search)}
                bind:value={keyword}
                on:input={handleInput}
            >
        </div>
        <div class="search-mode-control">
            <label for="advanced-search-mode" class="text-xs text-50">搜索维度</label>
            <select id="advanced-search-mode" bind:value={searchMode} on:change={handleModeChange}>
                {#each SEARCH_MODE_OPTIONS as option}
                    <option value={option.value}>{option.label}</option>
                {/each}
            </select>
        </div>
    </div>
</div>

<div class="grid grid-cols-1 gap-4">
    <!-- Results Area -->
    <div>
        {#if isSearching}
            <div class="flex justify-center py-10">
                <Icon icon="svg-spinners:ring-resize" class="text-4xl text-(--primary)" />
            </div>
        {:else if searchError}
            <div class="card-base p-10 text-center text-50 rounded-(--radius-large)">
                {searchError}
            </div>
        {:else if results.length > 0}
            <div class="space-y-4">
                {#each results as result}
                    <div class="card-base p-6 block rounded-(--radius-large)">
                        <a href={result.url} class="block group">
                            <h5 class="mb-2 text-2xl font-bold tracking-tight text-90 group-hover:text-(--primary) transition-colors">
                                {@html result.meta.title}
                            </h5>
                            <p class="font-normal text-75">
                                {@html result.excerpt}
                            </p>
                        </a>
                    </div>
                {/each}
            </div>
        {:else if keyword.trim()}
            <div class="card-base p-10 text-center text-50 rounded-(--radius-large)">
                {i18n(I18nKey.searchNoResults)}
            </div>
        {:else}
             <div class="card-base p-10 text-center text-50 rounded-(--radius-large)">
                {i18n(I18nKey.searchTypeSomething)}
            </div>
        {/if}
    </div>
</div>

<style>
    /* 关键字高亮效果 - 主题色 */
    :global(mark) {
        background: transparent;
        color: var(--primary);
        font-weight: 600;
        padding: 0 0.1em;
    }

    .search-mode-control {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding-left: 0.75rem;
    }

    .search-mode-control select {
        min-height: 3.25rem;
        border: 1px solid rgb(0 0 0 / 0.1);
        border-radius: 0.5rem;
        background: transparent;
        color: inherit;
        padding: 0 2rem 0 0.75rem;
        font-size: 0.75rem;
        outline: none;
    }

    :global(.dark) .search-mode-control select {
        border-color: rgb(255 255 255 / 0.12);
    }

    @media (max-width: 640px) {
        .relative.flex {
            flex-direction: column;
            gap: 0.75rem;
        }

        .search-mode-control {
            justify-content: flex-end;
            padding-left: 0;
        }

        .search-mode-control select {
            min-height: 2.5rem;
        }
    }
</style>
