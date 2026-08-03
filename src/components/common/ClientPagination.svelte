<script lang="ts">
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
    <!-- 移动端简化版分页 -->
    <div class="mobile-pagination items-center gap-3">
      <button
        type="button"
        class="pagination-button pagination-button--nav btn-card overflow-hidden rounded-(--radius-large) text-(--primary) w-11 h-11 disabled:opacity-50 disabled:cursor-not-allowed"
        onclick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="上一页"
      >
        <Icon icon="lucide:chevron-left" class="w-5 h-5" aria-hidden="true" />
      </button>

      <div class="pagination-summary btn-card flex items-center rounded-(--radius-large) px-4 h-11 gap-1.5">
        <span class="text-base font-bold text-(--primary)">{currentPage}</span>
        <span class="text-sm text-neutral-500 dark:text-neutral-500">/</span>
        <span class="text-base font-bold text-neutral-700 dark:text-neutral-300">{totalPages}</span>
      </div>

      <button
        type="button"
        class="pagination-button pagination-button--nav btn-card overflow-hidden rounded-(--radius-large) text-(--primary) w-11 h-11 disabled:opacity-50 disabled:cursor-not-allowed"
        onclick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="下一页"
      >
        <Icon icon="lucide:chevron-right" class="w-5 h-5" aria-hidden="true" />
      </button>
    </div>

    <!-- 桌面端完整版分页 -->
    <div class="desktop-pagination items-center gap-3">
      <button
        type="button"
        class="pagination-button pagination-button--nav btn-card overflow-hidden rounded-(--radius-large) text-(--primary) w-11 h-11 disabled:opacity-50 disabled:cursor-not-allowed"
        onclick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="上一页"
      >
        <Icon icon="lucide:chevron-left" class="w-5 h-5" aria-hidden="true" />
      </button>

      {#each pageNumbers as pageItem}
        {#if pageItem === "..."}
          <Icon icon="lucide:ellipsis" class="w-11 h-11 text-neutral-700 dark:text-neutral-300" aria-hidden="true" />
        {:else}
          <button
            type="button"
            class="pagination-button rounded-(--radius-large) overflow-hidden w-11 h-11 flex items-center justify-center font-bold {pageItem === currentPage
              ? 'bg-(--primary) text-white dark:text-black/70'
              : 'btn-card active:scale-[0.85] text-neutral-700 dark:text-neutral-300'}"
            onclick={() => goToPage(pageItem as number)}
            aria-label="{String(pageItem)}"
            aria-current={pageItem === currentPage ? 'page' : undefined}
          >
            {pageItem}
          </button>
        {/if}
      {/each}

      <button
        type="button"
        class="pagination-button pagination-button--nav btn-card overflow-hidden rounded-(--radius-large) text-(--primary) w-11 h-11 disabled:opacity-50 disabled:cursor-not-allowed"
        onclick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="下一页"
      >
        <Icon icon="lucide:chevron-right" class="w-5 h-5" aria-hidden="true" />
      </button>
    </div>
  </div>
{/if}

<style>
  .responsive-pagination {
    max-width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding: 0.35rem;
    border: 1px solid color-mix(in oklch, var(--line-divider) 80%, transparent);
    border-radius: calc(var(--radius-large) + 0.35rem);
    background: color-mix(in oklch, var(--card-bg) 92%, var(--primary));
    box-shadow: 0 0.45rem 1.2rem rgb(44 38 31 / 0.07), inset 0 1px 0 rgb(255 255 255 / 0.3);
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

  .responsive-pagination button {
    border: 1px solid color-mix(in oklch, var(--line-divider) 76%, transparent);
    transition: all 0.2s ease-in-out;
  }

  .responsive-pagination button:not(:disabled):hover {
    border-color: color-mix(in oklch, var(--primary) 42%, var(--line-divider));
    transform: translateY(-1px);
  }

  @media (prefers-contrast: high) {
    .responsive-pagination button {
      border: 1px solid currentColor;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .responsive-pagination button {
      transition: none;
    }
  }

  @media (hover: none) and (pointer: coarse) {
    .responsive-pagination button {
      min-height: 44px;
      min-width: 44px;
    }
    .mobile-pagination button {
      min-height: 40px;
      min-width: 40px;
    }
  }

  @media (max-width: 1024px) and (orientation: landscape) {
    .mobile-pagination {
      padding: 0 0.5rem;
    }
  }
</style>
