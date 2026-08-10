<script lang="ts">
/**
 * Hallmark · component: modal+chip · genre: editorial · theme: firefly-tokens
 * states: default · hover · focus · active · disabled · loading · error · success
 *
 * 园主置顶入口：挂在卡片内容区，确认框 portal 到 body，兼容 list / card。
 */
import { onMount } from "svelte";
import {
	DEV_OWNER_KEY,
	LEGACY_SESSION_KEY,
	LEGACY_VIEWER_KEY,
	SESSION_KEY,
	VIEWER_KEY,
	ensureDevOwnerSession,
	readAdminViewer,
} from "@/utils/admin-auth";

interface Props {
	adminLogins?: string[];
	isDev?: boolean;
	labels: {
		menu: string;
		setSticky: string;
		unsetSticky: string;
		confirmSet: string;
		confirmUnset: string;
		confirmSetDesc: string;
		confirmUnsetDesc: string;
		confirmOk: string;
		confirmCancel: string;
		devHint: string;
		prodHint: string;
	};
}

interface PinTarget {
	postId: string;
	filePath: string;
}

const {
	adminLogins = [],
	isDev = false,
	labels,
}: Props = $props();

let isAdmin = $state(false);
let busy = $state(false);
let status = $state<"idle" | "error" | "success">("idle");
let hint = $state("");
let pending = $state<boolean | null>(null);
let target = $state<PinTarget | null>(null);

function portal(node: HTMLElement) {
	const parent = document.body;
	parent.appendChild(node);
	return {
		destroy() {
			if (node.parentNode === parent) parent.removeChild(node);
		},
	};
}

function syncAdmin() {
	if (isDev) {
		ensureDevOwnerSession(adminLogins);
	}
	const hasSession =
		!!localStorage.getItem(SESSION_KEY) ||
		!!localStorage.getItem(LEGACY_SESSION_KEY) ||
		isDevOwnerFlag();
	isAdmin = hasSession || isDev ? readAdminViewer(adminLogins).isAdmin : false;
	document.querySelectorAll<HTMLElement>("[data-post-pin-admin]").forEach((node) => {
		node.hidden = !isAdmin;
	});
}

function isDevOwnerFlag(): boolean {
	try {
		return localStorage.getItem(DEV_OWNER_KEY) === "1";
	} catch {
		return false;
	}
}

function openConfirm(next: boolean, nextTarget: PinTarget, e: MouseEvent) {
	e.preventDefault();
	e.stopPropagation();
	if (busy) return;
	status = "idle";
	hint = "";
	target = nextTarget;
	pending = next;
}

function onDocumentClick(e: MouseEvent) {
	const origin = e.target as Element | null;
	const trigger = origin?.closest<HTMLElement>("[data-post-pin-trigger]");
	if (!trigger || !isAdmin) return;
	openConfirm(
		trigger.dataset.sticky !== "true",
		{
			postId: trigger.dataset.postId || "",
			filePath: trigger.dataset.filePath || "",
		},
		e,
	);
}

function closeConfirm(e?: MouseEvent) {
	e?.preventDefault();
	e?.stopPropagation();
	if (busy) return;
	pending = null;
	target = null;
	status = "idle";
}

async function confirmPending(e: MouseEvent) {
	e.preventDefault();
	e.stopPropagation();
	if (pending === null || !target || busy) return;
	await setSticky(pending);
}

async function setSticky(next: boolean) {
	if (busy || !target) return;
	busy = true;
	status = "idle";
	hint = "";
	try {
		const res = await fetch("/api/admin/pin/", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				postId: target.postId,
				pinned: next,
				filePath: target.filePath,
			}),
		});
		const data = (await res.json().catch(() => ({}))) as {
			ok?: boolean;
			error?: string;
		};

		if (res.ok && data.ok) {
			status = "success";
			hint = labels.devHint;
			setTimeout(() => window.location.reload(), 420);
			return;
		}

		status = "error";
		hint =
			isDev || import.meta.env.DEV
				? data.error || "本地写入失败，请看终端日志"
				: labels.prodHint;
	} catch (error) {
		status = "error";
		hint =
			isDev || import.meta.env.DEV
				? error instanceof Error
					? error.message
					: "本地请求失败"
				: labels.prodHint;
	} finally {
		busy = false;
	}
}

function onKeydown(e: KeyboardEvent) {
	if (pending === null) return;
	if (e.key === "Escape") {
		e.preventDefault();
		closeConfirm();
	}
}

onMount(() => {
	syncAdmin();
	const onStorage = (event: StorageEvent) => {
		if (
			event.key === VIEWER_KEY ||
			event.key === SESSION_KEY ||
			event.key === LEGACY_VIEWER_KEY ||
			event.key === LEGACY_SESSION_KEY ||
			event.key === DEV_OWNER_KEY
		) {
			syncAdmin();
		}
	};
	window.addEventListener("storage", onStorage);
	window.addEventListener("focus", syncAdmin);
	window.addEventListener("keydown", onKeydown);
	document.addEventListener("click", onDocumentClick);
	const onPageView = () => syncAdmin();
	document.addEventListener("swup:page:view", onPageView);
	const timer = window.setInterval(syncAdmin, 2000);
	return () => {
		window.removeEventListener("storage", onStorage);
		window.removeEventListener("focus", syncAdmin);
		window.removeEventListener("keydown", onKeydown);
		document.removeEventListener("click", onDocumentClick);
		document.removeEventListener("swup:page:view", onPageView);
		window.clearInterval(timer);
	};
});
</script>

{#if isAdmin && pending !== null && target}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		use:portal
		class="pin-sheet"
		role="presentation"
		onclick={closeConfirm}
		onkeydown={(e) => e.key === "Escape" && closeConfirm()}
	>
		<div
			class="pin-sheet__panel"
			class:pin-sheet__panel--error={status === "error"}
			class:pin-sheet__panel--success={status === "success"}
			class:pin-sheet__panel--unset={pending === false}
			role="alertdialog"
			aria-modal="true"
			aria-labelledby="pin-sheet-title"
			aria-describedby="pin-sheet-desc"
			data-state={busy ? "loading" : status}
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<header class="pin-sheet__head">
				<p class="pin-sheet__kicker">园主</p>
				<h2 id="pin-sheet-title" class="pin-sheet__title">
					{pending ? labels.confirmSet : labels.confirmUnset}
				</h2>
			</header>

			<p id="pin-sheet-desc" class="pin-sheet__desc">
				{pending ? labels.confirmSetDesc : labels.confirmUnsetDesc}
			</p>

			{#if hint}
				<p
					class="pin-sheet__status"
					class:pin-sheet__status--error={status === "error"}
					class:pin-sheet__status--success={status === "success"}
					role="status"
				>
					{hint}
				</p>
			{/if}

			<footer class="pin-sheet__foot">
				<button
					type="button"
					class="pin-btn pin-btn--ghost"
					disabled={busy}
					onclick={closeConfirm}
				>
					{labels.confirmCancel}
				</button>
				<button
					type="button"
					class="pin-btn pin-btn--solid"
					class:pin-btn--loading={busy}
					disabled={busy}
					onclick={confirmPending}
				>
					{#if busy}
						<span class="pin-btn__spinner" aria-hidden="true"></span>
						<span>处理中</span>
					{:else if status === "success"}
						<span>已完成</span>
					{:else}
						<span>{labels.confirmOk}</span>
					{/if}
				</button>
			</footer>
		</div>
	</div>
{/if}

<style>
	:global(.pin-admin) {
		position: static;
		flex-shrink: 0;
		z-index: 2;
	}

	:global(.pin-chip) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		padding: 0;
		border: 0;
		border-radius: 999px;
		background: transparent;
		color: color-mix(in srgb, var(--deep-text) 42%, transparent);
		cursor: pointer;
		transition:
			background 0.16s ease,
			color 0.16s ease,
			box-shadow 0.16s ease,
			transform 0.16s ease;
	}

	:global(.pin-chip__icon) {
		display: block;
		flex-shrink: 0;
	}

	:global(.pin-chip--sticky) {
		color: var(--primary);
		background: color-mix(in srgb, var(--primary) 14%, transparent);
		box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--primary) 35%, transparent);
	}

	@media (hover: hover) {
		:global(.pin-chip:hover:not(:disabled)) {
			color: var(--primary);
			background: color-mix(in srgb, var(--primary) 10%, transparent);
		}

		:global(.pin-chip--sticky:hover:not(:disabled)) {
			background: color-mix(in srgb, var(--primary) 20%, transparent);
		}
	}

	:global(.pin-chip:focus) {
		outline: none;
	}

	:global(.pin-chip:focus-visible) {
		outline: 2px solid var(--primary);
		outline-offset: 2px;
	}

	:global(.pin-chip:active:not(:disabled)) {
		transform: scale(0.94);
	}

	:global(.pin-chip:disabled) {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.pin-sheet {
		position: fixed;
		inset: 0;
		z-index: 200;
		display: grid;
		place-items: center;
		padding: 1.25rem;
		background: color-mix(in srgb, var(--deep-text) 36%, transparent);
		animation: pin-fade 0.18s ease;
	}

	.pin-sheet__panel {
		position: relative;
		width: min(22.5rem, 100%);
		padding: 1.35rem 1.35rem 1.15rem;
		border-radius: var(--radius-large);
		border: 1px solid var(--line-divider);
		background: var(--card-bg);
		box-shadow: 0 18px 48px color-mix(in srgb, var(--deep-text) 18%, transparent);
		animation: pin-rise 0.24s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.pin-sheet__panel::before {
		content: "";
		position: absolute;
		left: 0;
		top: 1.1rem;
		bottom: 1.1rem;
		width: 3px;
		border-radius: 999px;
		background: var(--primary);
	}

	.pin-sheet__panel--unset::before {
		background: color-mix(in srgb, var(--deep-text) 45%, var(--primary));
	}

	.pin-sheet__panel--error {
		border-color: color-mix(in srgb, #b42318 35%, var(--line-divider));
	}

	.pin-sheet__panel--success {
		border-color: color-mix(in srgb, #1f7a4c 35%, var(--line-divider));
	}

	.pin-sheet__head {
		padding-left: 0.85rem;
	}

	.pin-sheet__kicker {
		margin: 0 0 0.4rem;
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		color: var(--primary);
	}

	.pin-sheet__title {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 800;
		font-style: normal;
		letter-spacing: -0.02em;
		line-height: 1.3;
		color: var(--deep-text);
	}

	.pin-sheet__desc {
		margin: 0.65rem 0 0;
		padding-left: 0.85rem;
		font-size: 0.875rem;
		line-height: 1.65;
		color: var(--content-meta);
	}

	.pin-sheet__status {
		margin: 0.85rem 0 0;
		padding: 0.55rem 0.7rem 0.55rem 0.85rem;
		border-radius: 0.55rem;
		font-size: 0.78rem;
		line-height: 1.45;
		background: var(--btn-regular-bg);
		color: var(--deep-text);
	}

	.pin-sheet__status--error {
		background: color-mix(in srgb, #b42318 10%, var(--card-bg));
		color: #8a1c14;
	}

	.pin-sheet__status--success {
		background: color-mix(in srgb, #1f7a4c 10%, var(--card-bg));
		color: #14603a;
	}

	.pin-sheet__foot {
		display: flex;
		justify-content: flex-end;
		gap: 0.55rem;
		margin-top: 1.2rem;
		padding-left: 0.85rem;
	}

	.pin-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		min-height: 2.5rem;
		min-width: 5.25rem;
		padding: 0.45rem 1rem;
		border-radius: 0.65rem;
		border: 1px solid transparent;
		font-size: 0.84rem;
		font-weight: 700;
		cursor: pointer;
		transition:
			background 0.15s ease,
			border-color 0.15s ease,
			transform 0.15s ease,
			box-shadow 0.15s ease;
	}

	.pin-btn:focus {
		outline: none;
	}

	.pin-btn:focus-visible {
		outline: 2px solid var(--primary);
		outline-offset: 2px;
	}

	.pin-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.pin-btn--ghost {
		background: transparent;
		border-color: var(--line-color);
		color: var(--deep-text);
	}

	@media (hover: hover) {
		.pin-btn--ghost:hover:not(:disabled) {
			background: var(--btn-plain-bg-hover);
		}
	}

	.pin-btn--ghost:active:not(:disabled) {
		transform: translateY(1px);
	}

	.pin-btn--solid {
		background: var(--primary);
		color: #fff;
		border-color: var(--primary);
		box-shadow: 0 8px 18px color-mix(in srgb, var(--primary) 28%, transparent);
	}

	@media (hover: hover) {
		.pin-btn--solid:hover:not(:disabled) {
			background: var(--primary-hover);
			border-color: var(--primary-hover);
		}
	}

	.pin-btn--solid:active:not(:disabled) {
		transform: translateY(1px);
		box-shadow: none;
	}

	.pin-btn__spinner {
		width: 0.85rem;
		height: 0.85rem;
		border-radius: 50%;
		border: 2px solid rgb(255 255 255 / 0.35);
		border-top-color: #fff;
		animation: pin-spin 0.7s linear infinite;
	}

	@keyframes pin-fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes pin-rise {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes pin-spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 414px) {
		.pin-sheet__foot {
			flex-direction: column-reverse;
		}

		.pin-btn {
			width: 100%;
		}
	}
</style>
