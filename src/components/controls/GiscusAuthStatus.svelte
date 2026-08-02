<script lang="ts">
/**
 * 同步 Giscus GitHub 登录态到导航栏：头像 +「园主」身份标记。
 * 依赖 commentConfig.giscus.emitMetadata = "1" 与已有 Discussion 的 metadata 推送；
 * 跨页用 localStorage 缓存 viewer；无 session 时清空。
 * 本地 DEV：自动注入 adminLogins[0] 为园主，方便调试。
 */
import { onMount } from "svelte";
import {
	DEV_OWNER_KEY,
	SESSION_KEY,
	VIEWER_KEY,
	ensureDevOwnerSession,
	type AdminViewer,
} from "@/utils/admin-auth";

type GiscusViewer = AdminViewer;

interface Props {
	adminLogins?: string[];
}

const { adminLogins = [] }: Props = $props();

const GISCUS_ORIGINS = new Set([
	"https://giscus.app",
	"https://giscus.vercel.app",
]);

let viewer = $state<GiscusViewer | null>(null);
let hasSession = $state(false);
let ready = $state(false);

const isAdmin = $derived(
	!!viewer &&
		adminLogins.some(
			(login) => login.toLowerCase() === viewer!.login.toLowerCase(),
		),
);

function readCachedViewer(): GiscusViewer | null {
	try {
		const raw = localStorage.getItem(VIEWER_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as GiscusViewer;
		if (!parsed?.login || !parsed?.avatarUrl) return null;
		return parsed;
	} catch {
		return null;
	}
}

function writeCachedViewer(next: GiscusViewer | null) {
	if (!next) {
		localStorage.removeItem(VIEWER_KEY);
		return;
	}
	localStorage.setItem(VIEWER_KEY, JSON.stringify(next));
}

function clearViewer() {
	viewer = null;
	writeCachedViewer(null);
}

function applyViewer(next: GiscusViewer) {
	viewer = next;
	writeCachedViewer(next);
}

function syncFromStorage() {
	if (import.meta.env.DEV) {
		const devViewer = ensureDevOwnerSession(adminLogins);
		if (devViewer) {
			hasSession = true;
			viewer = devViewer;
			return;
		}
	}

	hasSession =
		!!localStorage.getItem(SESSION_KEY) ||
		localStorage.getItem(DEV_OWNER_KEY) === "1";
	if (!hasSession) {
		clearViewer();
		return;
	}
	if (!viewer) {
		viewer = readCachedViewer();
	}
}

function handleMessage(event: MessageEvent) {
	if (!GISCUS_ORIGINS.has(event.origin)) return;
	const data = event.data;
	if (!data || typeof data !== "object" || !("giscus" in data)) return;

	const giscusData = (data as { giscus: unknown }).giscus;
	if (!giscusData || typeof giscusData !== "object") return;

	if ("error" in giscusData) {
		syncFromStorage();
		return;
	}

	if ("discussion" in giscusData && "viewer" in giscusData) {
		const v = (giscusData as { viewer: GiscusViewer }).viewer;
		if (v?.login && v?.avatarUrl) {
			hasSession = true;
			applyViewer({
				login: v.login,
				avatarUrl: v.avatarUrl,
				url: v.url || `https://github.com/${v.login}`,
			});
		}
	}
}

onMount(() => {
	syncFromStorage();
	ready = true;
	window.addEventListener("message", handleMessage);
	window.addEventListener("focus", syncFromStorage);
	const timer = window.setInterval(syncFromStorage, 2500);

	return () => {
		window.removeEventListener("message", handleMessage);
		window.removeEventListener("focus", syncFromStorage);
		window.clearInterval(timer);
	};
});
</script>

{#if ready && viewer}
	<a
		href={viewer.url}
		target="_blank"
		rel="noopener noreferrer"
		class="giscus-auth-status btn-plain scale-animation relative inline-flex h-9 w-9 items-center justify-center rounded-full md:h-11 md:w-11 active:scale-90"
		title={isAdmin ? `园主 · @${viewer.login}` : `已登录 · @${viewer.login}`}
		aria-label={isAdmin ? `园主 ${viewer.login}` : `已登录 ${viewer.login}`}
	>
		<span
			class={[
				"relative inline-flex h-7 w-7 items-center justify-center rounded-full",
				isAdmin
					? "bg-linear-to-br from-emerald-600/90 to-teal-700/90 p-[2px] shadow-[0_0_0_3px_rgba(61,122,74,0.18)] dark:from-emerald-400/80 dark:to-teal-400/70 dark:shadow-[0_0_0_3px_rgba(166,227,161,0.2)]"
					: "",
			].join(" ")}
		>
			<img
				src={viewer.avatarUrl}
				alt={`@${viewer.login}`}
				width="28"
				height="28"
				class={[
					"h-full w-full rounded-full object-cover",
					isAdmin
						? "ring-2 ring-white/90 dark:ring-[#1e1e2e]/90"
						: "ring-2 ring-(--primary)/35",
				].join(" ")}
				loading="lazy"
				referrerpolicy="no-referrer"
			/>
		</span>
		{#if isAdmin}
			<span
				class="pointer-events-none absolute -right-1.5 -bottom-1.5 rounded-full border border-emerald-700/30 bg-[linear-gradient(135deg,#e8f5e9,#dcedc8)] px-1 py-px text-[9px] font-semibold tracking-wider text-emerald-900 shadow-sm dark:border-emerald-300/35 dark:bg-[linear-gradient(135deg,rgba(166,227,161,0.25),rgba(148,226,213,0.18))] dark:text-emerald-200"
			>
				❀园主
			</span>
		{:else}
			<span
				class="absolute right-0.5 bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-(--card-bg) bg-emerald-500"
				aria-hidden="true"
			></span>
		{/if}
	</a>
{:else if ready && hasSession}
	<a
		href="https://github.com"
		target="_blank"
		rel="noopener noreferrer"
		class="giscus-auth-status btn-plain scale-animation relative inline-flex h-9 w-9 items-center justify-center rounded-full md:h-11 md:w-11 active:scale-90"
		title="GitHub 评论已登录（打开含评论的文章后可同步头像）"
		aria-label="GitHub 评论已登录"
	>
		<span
			class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-(--btn-regular-bg) text-(--primary) ring-2 ring-(--primary)/30"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="currentColor"
				class="h-4 w-4"
				aria-hidden="true"
			>
				<path
					d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.09.682-.22.682-.48 0-.24-.01-.87-.01-1.71-2.782.6-3.369-1.34-3.369-1.34-.454-1.16-1.11-1.47-1.11-1.47-.908-.62.07-.61.07-.61 1.003.07 1.531 1.03 1.531 1.03.892 1.53 2.341 1.09 2.91.83.09-.65.35-1.09.636-1.34-2.22-.25-4.555-1.11-4.555-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0112 6.8c.85.004 1.71.115 2.51.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48A10.01 10.01 0 0022 12c0-5.523-4.477-10-10-10z"
				/>
			</svg>
		</span>
		<span
			class="absolute right-0.5 bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-(--card-bg) bg-emerald-500"
			aria-hidden="true"
		></span>
	</a>
{/if}
