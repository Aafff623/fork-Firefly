<script lang="ts">
/**
 * 客户端分页 · Lucide 导航图标 + 中性灰黑（去粉紫 AI 壳）
 */
import Icon from "./Icon.svelte";

interface Props {
	totalItems: number;
	itemsPerPage: number;
	currentPage: number;
	onPageChange: (page: number) => void;
}

const { totalItems, itemsPerPage, currentPage, onPageChange }: Props = $props();

const totalPages = $derived(Math.ceil(totalItems / itemsPerPage));

function generatePageNumbers(
	current: number,
	total: number,
): (number | string)[] {
	if (total <= 7) {
		return Array.from({ length: total }, (_, i) => i + 1);
	}

	const delta = 2;
	const left = Math.max(2, current - delta);
	const right = Math.min(total - 1, current + delta);
	const pages: (number | string)[] = [1];

	if (left > 2) pages.push("...");
	for (let i = left; i <= right; i++) pages.push(i);
	if (right < total - 1) pages.push("...");
	if (total > 1) pages.push(total);

	return pages;
}

const pageNumbers = $derived(generatePageNumbers(currentPage, totalPages));

function goToPage(page: number) {
	if (page >= 1 && page <= totalPages && page !== currentPage) {
		onPageChange(page);
	}
}
</script>

{#if totalPages > 1}
  <div class="responsive-pagination flex justify-center items-center mt-8">
    <div class="mobile-pagination items-center gap-3">
      <button
        type="button"
        class="pagination-button pagination-button--nav w-11 h-11 disabled:opacity-50 disabled:cursor-not-allowed"
        onclick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="上一页"
      >
        <Icon icon="lucide:chevron-left" class="pagination-icon" aria-hidden="true" />
      </button>

      <div class="pagination-summary flex items-center px-3.5 h-11 gap-2">
        <Icon icon="lucide:book-open" class="pagination-icon pagination-icon--muted" aria-hidden="true" />
        <span class="pagination-summary__cur">{currentPage}</span>
        <span class="pagination-summary__sep">/</span>
        <span class="pagination-summary__total">{totalPages}</span>
      </div>

      <button
        type="button"
        class="pagination-button pagination-button--nav w-11 h-11 disabled:opacity-50 disabled:cursor-not-allowed"
        onclick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="下一页"
      >
        <Icon icon="lucide:chevron-right" class="pagination-icon" aria-hidden="true" />
      </button>
    </div>

    <div class="desktop-pagination items-center gap-2.5">
      <button
        type="button"
        class="pagination-button pagination-button--nav w-11 h-11 disabled:opacity-50 disabled:cursor-not-allowed"
        onclick={() => goToPage(1)}
        disabled={currentPage === 1}
        aria-label="首页"
        title="首页"
      >
        <Icon icon="lucide:chevrons-left" class="pagination-icon" aria-hidden="true" />
      </button>

      <button
        type="button"
        class="pagination-button pagination-button--nav w-11 h-11 disabled:opacity-50 disabled:cursor-not-allowed"
        onclick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="上一页"
        title="上一页"
      >
        <Icon icon="lucide:chevron-left" class="pagination-icon" aria-hidden="true" />
      </button>

      {#each pageNumbers as pageItem}
        {#if pageItem === "..."}
          <span class="pagination-ellipsis" aria-hidden="true">
            <Icon icon="lucide:ellipsis" class="pagination-icon pagination-icon--muted" />
          </span>
        {:else}
          <button
            type="button"
            class="pagination-button w-11 h-11 font-medium {pageItem === currentPage
              ? 'pagination-button--active font-semibold'
              : ''}"
            onclick={() => goToPage(pageItem as number)}
            aria-label={String(pageItem)}
            aria-current={pageItem === currentPage ? "page" : undefined}
          >
            {pageItem}
          </button>
        {/if}
      {/each}

      <button
        type="button"
        class="pagination-button pagination-button--nav w-11 h-11 disabled:opacity-50 disabled:cursor-not-allowed"
        onclick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="下一页"
        title="下一页"
      >
        <Icon icon="lucide:chevron-right" class="pagination-icon" aria-hidden="true" />
      </button>

      <button
        type="button"
        class="pagination-button pagination-button--nav w-11 h-11 disabled:opacity-50 disabled:cursor-not-allowed"
        onclick={() => goToPage(totalPages)}
        disabled={currentPage === totalPages}
        aria-label="末页"
        title="末页"
      >
        <Icon icon="lucide:chevrons-right" class="pagination-icon" aria-hidden="true" />
      </button>
    </div>
  </div>
{/if}

<style>
  .responsive-pagination {
    max-width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding: 0;
    border: none;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
  }

  .mobile-pagination {
    display: flex;
    padding: 0 1rem;
  }

  .desktop-pagination {
    display: none;
  }

  @media (min-width: 1024px) {
    .mobile-pagination {
      display: none;
    }
    .desktop-pagination {
      display: flex;
    }
  }

  @media (max-width: 640px) {
    .mobile-pagination {
      padding: 0 0.5rem;
    }
  }

  @media (max-width: 480px) {
    .mobile-pagination {
      padding: 0 0.25rem;
    }
  }

  .pagination-button,
  .pagination-summary {
    border: 1px solid oklch(0.82 0.01 70 / 0.7);
    border-radius: 0.55rem;
    background: oklch(100% 0 0 / 0.35);
    color: oklch(0.32 0.015 70);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition:
      border-color 0.18s ease,
      background 0.18s ease,
      color 0.18s ease;
  }

  :global(html.dark) .pagination-button,
  :global(html.dark) .pagination-summary {
    border-color: oklch(0.45 0.015 70 / 0.55);
    background: oklch(100% 0 0 / 0.04);
    color: oklch(0.88 0.01 70);
  }

  .pagination-button:not(:disabled):hover {
    border-color: oklch(0.55 0.02 70 / 0.75);
    background: oklch(0.96 0.01 70 / 0.85);
    color: oklch(0.18 0.015 70);
  }

  :global(html.dark) .pagination-button:not(:disabled):hover {
    border-color: oklch(0.62 0.015 70 / 0.65);
    background: oklch(100% 0 0 / 0.08);
    color: oklch(0.96 0.005 70);
  }

  .pagination-button--active {
    border-color: oklch(0.28 0.02 70) !important;
    background: oklch(0.28 0.02 70) !important;
    color: oklch(0.98 0.005 70) !important;
    box-shadow: none !important;
  }

  :global(html.dark) .pagination-button--active {
    border-color: oklch(0.9 0.01 70) !important;
    background: oklch(0.9 0.01 70) !important;
    color: oklch(0.2 0.015 70) !important;
  }

  .pagination-summary__cur {
    font-weight: 700;
    color: oklch(0.28 0.02 70);
  }

  :global(html.dark) .pagination-summary__cur {
    color: oklch(0.92 0.01 70);
  }

  .pagination-summary__sep {
    font-size: 0.85rem;
    opacity: 0.45;
  }

  .pagination-summary__total {
    font-weight: 600;
    opacity: 0.75;
  }

  .pagination-icon {
    width: 1.2rem;
    height: 1.2rem;
    flex-shrink: 0;
  }

  .pagination-icon--muted {
    opacity: 0.45;
  }

  .pagination-ellipsis {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2.75rem;
    color: oklch(0.55 0.01 70);
  }

  @media (prefers-reduced-motion: reduce) {
    .pagination-button {
      transition: none;
    }
  }

  @media (hover: none) and (pointer: coarse) {
    .responsive-pagination button {
      min-height: 44px;
      min-width: 44px;
    }
  }
</style>
