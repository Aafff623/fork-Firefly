<script lang="ts">
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { navigateToPage } from "@utils/navigation-utils";
import { onMount, tick } from "svelte";
import Icon from "@/components/common/Icon.svelte";
import type { SearchResult } from "@/global";
import {
	isPostSearchError,
	SEARCH_MODE_OPTIONS,
	type SearchMode,
	searchPosts,
} from "@/utils/post-search";
import { getSearchUrl } from "@/utils/url-utils";

// --- State ---
let keywordDesktop = "";
let keywordMobile = "";
let result: SearchResult[] = [];
let isSearching = false;
let initialized = false;
let searchError = "";
let searchMode: SearchMode = "tag";
let debounceTimer: ReturnType<typeof setTimeout> | undefined;
let searchRequestId = 0;
/** 桌面实用搜索框：收起 / 展开（对照 bilibili-goat 实用搜索框） */
let desktopExpanded = false;

const searchLabel = i18n(I18nKey.search);
/** 展开时上浮的逐字提示（Search...... 形态） */
const floatChars = [...`${searchLabel}......`];

// --- UI Logic ---
const togglePanel = () => {
	document
		.getElementById("search-panel")
		?.classList.toggle("float-panel-closed");
};

const setPanelVisibility = (show: boolean, isDesktop: boolean): void => {
	const panel = document.getElementById("search-panel");
	if (!panel) return;
	if ((isDesktop && !keywordDesktop) || (!isDesktop && !keywordMobile)) {
		panel.classList.add("float-panel-closed");
		return;
	}
	show
		? panel.classList.remove("float-panel-closed")
		: panel.classList.add("float-panel-closed");
};

const closeSearchPanel = (): void => {
	document.getElementById("search-panel")?.classList.add("float-panel-closed");
	keywordDesktop = "";
	keywordMobile = "";
	result = [];
	searchError = "";
	searchRequestId += 1;
};

const collapseDesktopSearch = (): void => {
	desktopExpanded = false;
	closeSearchPanel();
};

const onDesktopToggle = async (): Promise<void> => {
	if (desktopExpanded) {
		await tick();
		(
			document.getElementById("search-desktop-input") as HTMLInputElement | null
		)?.focus();
		document
			.getElementById("search-panel")
			?.classList.remove("float-panel-closed");
	} else {
		closeSearchPanel();
	}
};

const handleResultClick = (event: Event, url: string): void => {
	event.preventDefault();
	collapseDesktopSearch();
	navigateToPage(url);
};

// --- Core Search Logic ---
const search = async (keyword: string, isDesktop: boolean): Promise<void> => {
	const trimmedKeyword = keyword.trim();
	if (!trimmedKeyword) {
		searchRequestId += 1;
		setPanelVisibility(false, isDesktop);
		result = [];
		searchError = "";
		return;
	}
	if (!initialized) return;

	isSearching = true;
	searchError = "";
	const requestId = ++searchRequestId;

	if (debounceTimer) clearTimeout(debounceTimer);
	debounceTimer = setTimeout(async () => {
		try {
			const searchResults = await searchPosts(searchMode, trimmedKeyword);
			if (requestId !== searchRequestId) return;
			result = searchResults;
			setPanelVisibility(true, isDesktop);
			if (trimmedKeyword && searchResults.length === 0) {
				window.dispatchEvent(
					new CustomEvent("firefly:pet-scenario", {
						detail: { scenario: "search-empty" },
					}),
				);
			}
		} catch (error) {
			if (requestId !== searchRequestId) return;
			if (!isPostSearchError(error)) console.error("Search error:", error);
			searchError = isPostSearchError(error)
				? error.message
				: "搜索暂时不可用，请稍后再试";
			result = [];
			setPanelVisibility(true, isDesktop);
		} finally {
			if (requestId === searchRequestId) isSearching = false;
		}
	}, 300); // 300ms debounce
};

// --- Initialization onMount ---
onMount(() => {
	const initializePagefind = () => {
		if (initialized) return;
		initialized = true;
		if (keywordDesktop) search(keywordDesktop, true);
		if (keywordMobile) search(keywordMobile, false);
	};

	// 搜索元数据独立于 Pagefind，因此即使静态索引加载稍晚也能立即工作。
	initializePagefind();
	if (!window.pagefind) {
		document.addEventListener("pagefindready", initializePagefind, {
			once: true,
		});
		document.addEventListener("pagefindloaderror", initializePagefind, {
			once: true,
		});
		const pagefindPromise = window.__loadPagefind?.();
		if (pagefindPromise) void pagefindPromise.catch(() => undefined);
	}

	/** 点搜索框外：焦点已离开 → 自动合拢 */
	const onPointerDownOutside = (event: PointerEvent) => {
		if (!desktopExpanded) return;
		const target = event.target as Node | null;
		if (!target) return;
		const bar = document.getElementById("search-bar");
		const panel = document.getElementById("search-panel");
		if (bar?.contains(target) || panel?.contains(target)) return;
		collapseDesktopSearch();
	};
	document.addEventListener("pointerdown", onPointerDownOutside, true);

	return () => {
		if (debounceTimer) clearTimeout(debounceTimer);
		document.removeEventListener("pointerdown", onPointerDownOutside, true);
	};
});

const handleModeChange = () => {
	const activeKeyword = keywordDesktop || keywordMobile;
	if (activeKeyword) search(activeKeyword, Boolean(keywordDesktop));
};
</script>

<!-- 桌面搜索：展开交互保留「实用搜索框」思路，外壳对齐 GitHub/音乐 btn-plain -->
<div
	id="search-bar"
	class="practical-search relative hidden lg:flex items-center"
	class:is-open={desktopExpanded}
	class:has-query={keywordDesktop.length > 0}
	on:focusout={(e) => {
		if (!desktopExpanded) return;
		const next = e.relatedTarget as Node | null;
		// 点到不可聚焦区域时 relatedTarget 为空，交给 document pointerdown
		if (!next) return;
		const bar = document.getElementById("search-bar");
		const panel = document.getElementById("search-panel");
		if (bar?.contains(next) || panel?.contains(next)) return;
		collapseDesktopSearch();
	}}
>
	<input
		type="checkbox"
		id="search-desktop-toggle"
		class="practical-search-check"
		bind:checked={desktopExpanded}
		on:change={onDesktopToggle}
	/>
	<label
		for="search-desktop-toggle"
		class="practical-search-toggle btn-plain scale-animation rounded-full active:scale-90"
		aria-label={desktopExpanded ? `${searchLabel} close` : searchLabel}
		title={searchLabel}
	>
		<Icon
			icon={desktopExpanded ? "lucide:x" : "lucide:search"}
			class="practical-search-toggle-icon"
		/>
	</label>
	<input
		id="search-desktop-input"
		type="search"
		class="practical-search-input"
		autocomplete="off"
		spellcheck="false"
		placeholder={searchLabel}
		aria-label={searchLabel}
		bind:value={keywordDesktop}
		readonly={!desktopExpanded}
		tabindex={desktopExpanded ? 0 : -1}
		on:input={() => search(keywordDesktop, true)}
		on:focus={() => {
			if (desktopExpanded) search(keywordDesktop, true);
		}}
		on:keydown={(e) => {
			if (e.key === "Escape") {
				e.preventDefault();
				collapseDesktopSearch();
			}
		}}
	/>
	{#if desktopExpanded && !keywordDesktop}
		<div class="practical-search-fonts" aria-hidden="true">
			{#each floatChars as ch, i (i)}
				<span style={`--i:${i + 1}`}>{ch === " " ? "\u00a0" : ch}</span>
			{/each}
		</div>
	{/if}
</div>

<!-- toggle btn for phone/tablet view -->
<button on:click={togglePanel} aria-label="Search Panel" id="search-switch"
        class="btn-plain scale-animation lg:hidden! rounded-full w-9 h-9 md:w-11 md:h-11 active:scale-90">
    <Icon icon="lucide:search" class="text-[1.25rem]"></Icon>
</button>

<!-- search panel -->
<div id="search-panel" class="float-panel float-panel-closed search-panel absolute md:w-120
top-20 left-4 md:left-[unset] right-4 shadow-2xl rounded-2xl p-2">

    <!-- search bar inside panel for phone/tablet -->
    <div id="search-bar-inside" class="flex relative lg:hidden transition-all items-center h-11 rounded-xl
      bg-black/4 hover:bg-black/6 focus-within:bg-black/6
      dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10
  ">
        <Icon icon="lucide:search"
              class="absolute text-[1.25rem] pointer-events-none ml-3 transition my-auto text-black/30 dark:text-white/30"></Icon>
        <input placeholder={i18n(I18nKey.search)} bind:value={keywordMobile}
               class="pl-10 absolute inset-0 text-sm bg-transparent outline-0
               focus:w-60 text-black/50 dark:text-white/50"
               on:input={() => search(keywordMobile, false)}
        >
    </div>

    <div class="search-mode-row">
        <label for="search-mode" class="text-xs text-50">搜索维度</label>
        <select id="search-mode" bind:value={searchMode} on:change={handleModeChange}>
            {#each SEARCH_MODE_OPTIONS as option}
                <option value={option.value}>{option.label}</option>
            {/each}
        </select>
    </div>

    <!-- search results -->
    {#if isSearching}
        <div class="transition first-of-type:mt-2 lg:first-of-type:mt-0 block rounded-xl text-lg px-3 py-2 text-50">
            {i18n(I18nKey.searchLoading)}
        </div>
    {:else if result.length > 0}
        {#each result.slice(0, 5) as item}
            <a href={item.url}
               on:click={(e) => handleResultClick(e, item.url)}
               class="transition first-of-type:mt-2 lg:first-of-type:mt-0 group block
           rounded-xl text-lg px-3 py-2 hover:bg-(--btn-plain-bg-hover) active:bg-(--btn-plain-bg-active)">
                <div class="transition text-90 inline-flex font-bold group-hover:text-(--primary)">
                    {@html item.meta.title}
                    <Icon icon="lucide:chevron-right"
                          class="transition text-[0.75rem] translate-x-1 my-auto text-(--primary)"></Icon>
                </div>
                {#if item.excerpt.includes('<mark>')}
                    <div class="transition text-sm text-50" style="display: flex; align-items: flex-start; margin-top: 0.1rem">
                        <div>
                            {@html item.excerpt}
                        </div>
                    </div>
                {/if}

                {#if item.content && item.content.includes('<mark>')}
                    <div class="transition text-sm text-30" style="display: flex; align-items: flex-start; margin-top: 0.1rem">
                        <span style="display: inline-block; background-color: var(--btn-plain-bg-active); color: var(--primary); padding: 0.1em 0.4em; border-radius: 5px; font-size: 0.75em; font-weight: 600; margin-right: 0.5em; shrink: 0;">
                            {i18n(I18nKey.searchContent)}
                        </span>
                        <div>
                            {@html item.content}
                        </div>
                    </div>
                {/if}
            </a>
        {/each}
        {#if result.length > 5}
            <a href={getSearchUrl(keywordDesktop || keywordMobile)}
               on:click={(e) => handleResultClick(e, getSearchUrl(keywordDesktop || keywordMobile))}
               class="transition first-of-type:mt-2 lg:first-of-type:mt-0 group block rounded-xl text-lg px-3 py-2 hover:bg-(--btn-plain-bg-hover) active:bg-(--btn-plain-bg-active) text-(--primary) font-bold text-center">
                <span class="inline-flex items-center">
                    {i18n(I18nKey.searchViewMore).replace('{count}', (result.length - 5).toString())}
                    <Icon icon="lucide:arrow-right" class="transition text-[0.75rem] ml-1"></Icon>
                </span>
            </a>
        {/if}
    {:else if searchError}
        <div class="transition first-of-type:mt-2 lg:first-of-type:mt-0 block rounded-xl text-sm px-3 py-2 text-50">
            {searchError}
        </div>
    {:else if (keywordDesktop || keywordMobile) && result.length === 0}
        <div class="transition first-of-type:mt-2 lg:first-of-type:mt-0 block rounded-xl text-lg px-3 py-2 text-50">
            {i18n(I18nKey.searchNoResults)}
        </div>
    {:else if !(keywordDesktop || keywordMobile)}
        <div class="transition first-of-type:mt-2 lg:first-of-type:mt-0 block rounded-xl text-lg px-3 py-2 text-50">
            {i18n(I18nKey.searchTypeSomething)}
        </div>
    {/if}
</div>

<style>
    /* 交互：可展开；外观：对齐导航 GitHub / 音乐 btn-plain 圆钮 */
    .practical-search {
        --ps-size: 2.75rem;
        --ps-open-w: min(14.5rem, 32vw);
        --ps-ease: 0.38s cubic-bezier(0.22, 1, 0.36, 1);
        position: relative;
        height: var(--ps-size);
        min-width: var(--ps-size);
    }

    .practical-search-check {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
        pointer-events: none;
    }

    .practical-search-toggle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 0;
        right: 0;
        z-index: 3;
        width: var(--ps-size);
        height: var(--ps-size);
        margin: 0;
        cursor: pointer;
        /* 覆盖方框描边：完全吃 btn-plain 圆钮 */
        border: 0 !important;
        box-shadow: none !important;
    }

    :global(.practical-search-toggle-icon) {
        width: 1.25rem;
        height: 1.25rem;
        font-size: 1.25rem;
    }

    .practical-search-input {
        box-sizing: border-box;
        width: 0;
        height: var(--ps-size);
        padding: 0;
        margin: 0;
        opacity: 0;
        border: 0;
        outline: 0;
        border-radius: 999px;
        background: transparent;
        color: inherit;
        font-size: 0.875rem;
        pointer-events: none;
        transition:
            width var(--ps-ease),
            opacity 0.22s ease,
            padding var(--ps-ease),
            background-color var(--ps-ease);
        caret-color: var(--primary);
    }

    .practical-search-input::-webkit-search-cancel-button {
        display: none;
    }

    .practical-search-fonts {
        position: absolute;
        top: 0;
        left: 0.95rem;
        height: var(--ps-size);
        display: flex;
        align-items: center;
        color: rgb(0 0 0 / 0.35);
        letter-spacing: 0.1em;
        font: 600 0.8rem/1 inherit;
        pointer-events: none;
        z-index: 2;
    }

    :global(.dark) .practical-search-fonts {
        color: rgb(255 255 255 / 0.4);
    }

    .practical-search-fonts span {
        display: inline-block;
        opacity: 0;
        transform: translateY(0.2rem);
        animation: ps-float-in 0.35s ease forwards;
        animation-delay: calc(var(--i) * 0.04s);
    }

    @keyframes ps-float-in {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* 展开：胶囊输入条 + 右侧仍是同一套圆钮 */
    .practical-search.is-open .practical-search-input {
        width: var(--ps-open-w);
        opacity: 1;
        pointer-events: auto;
        padding: 0 calc(var(--ps-size) + 0.35rem) 0 1rem;
        background: var(--btn-plain-bg, rgb(0 0 0 / 0.04));
        color: rgb(0 0 0 / 0.72);
    }

    :global(.dark) .practical-search.is-open .practical-search-input {
        background: var(--btn-plain-bg, rgb(255 255 255 / 0.06));
        color: rgb(255 255 255 / 0.82);
    }

    .practical-search.is-open .practical-search-input:hover,
    .practical-search.is-open .practical-search-input:focus {
        background: var(--btn-plain-bg-hover, rgb(0 0 0 / 0.06));
    }

    :global(.dark) .practical-search.is-open .practical-search-input:hover,
    :global(.dark) .practical-search.is-open .practical-search-input:focus {
        background: var(--btn-plain-bg-hover, rgb(255 255 255 / 0.1));
    }

    .search-panel {
        max-height: calc(100vh - 100px);
        overflow-y: auto;
    }

    .search-mode-row {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem 0.25rem;
    }

    .search-mode-row select {
        max-width: 100%;
        border: 1px solid rgb(0 0 0 / 0.1);
        border-radius: 0.6rem;
        background: transparent;
        color: inherit;
        padding: 0.35rem 1.8rem 0.35rem 0.6rem;
        font-size: 0.75rem;
        outline: none;
    }

    :global(.dark) .search-mode-row select {
        border-color: rgb(255 255 255 / 0.12);
    }

    @media (prefers-reduced-motion: reduce) {
        .practical-search-input,
        .practical-search-fonts span {
            transition-duration: 0.01ms !important;
            animation: none !important;
            opacity: 1;
        }
    }
</style>
