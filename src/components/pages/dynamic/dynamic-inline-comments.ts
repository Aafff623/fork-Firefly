/**
 * 动态卡片内联协作者回复：
 * - 第 1 条默认展示
 * - 第 2 条及以后默认折叠
 * - 红点只计折叠条数（total - 1）
 * - 进入视口再拉；全站并发限流，避免首屏齐射 Waline
 */

import { agentPersonas } from "@/config/agentPersonas";
import { commentConfig } from "@/config/commentConfig";

type WalineComment = {
	nick: string;
	orig?: string;
	comment?: string;
	status?: string;
	insertedAt?: string;
};

const FETCH_CONCURRENCY = 2;
let activeFetches = 0;
const fetchWaiters: Array<() => void> = [];

function acquireFetchSlot(): Promise<void> {
	if (activeFetches < FETCH_CONCURRENCY) {
		activeFetches += 1;
		return Promise.resolve();
	}
	return new Promise((resolve) => {
		fetchWaiters.push(() => {
			activeFetches += 1;
			resolve();
		});
	});
}

function releaseFetchSlot() {
	activeFetches = Math.max(0, activeFetches - 1);
	const next = fetchWaiters.shift();
	if (next) next();
}

function resolvePersona(nick: string) {
	const n = nick.trim().toLowerCase();
	return Object.values(agentPersonas).find(
		(p) => n === p.key.toLowerCase() || n === p.name.toLowerCase(),
	);
}

function escapeHtml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function extractPathFromSrc(src: string | undefined): string {
	if (!src) return "/dynamic/";
	try {
		return (
			new URL(src, window.location.href).searchParams.get("path") || "/dynamic/"
		);
	} catch {
		return "/dynamic/";
	}
}

function plainCommentText(comment: WalineComment): string {
	return String(comment.orig || comment.comment || "")
		.replace(/<[^>]+>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function formatCommentTime(iso?: string): string {
	if (!iso) return "";
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return "";
	return date.toLocaleString("zh-CN", {
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function registerDynamicInlineComments(): void {
	if (customElements.get("dynamic-inline-comments")) return;

	class DynamicInlineComments extends HTMLElement {
		#observer: IntersectionObserver | null = null;

		connectedCallback() {
			if (this.dataset.ready) return;
			this.querySelector("[data-comment-toggle]")?.addEventListener(
				"click",
				() => this.toggleFolded(),
			);
			this.dataset.ready = "true";
			// 真正进入视口再拉；rootMargin 收紧，避免首屏 8 卡齐射
			this.#observer = new IntersectionObserver(
				(entries) => {
					if (!entries.some((entry) => entry.isIntersecting)) return;
					this.#observer?.disconnect();
					this.#observer = null;
					void this.ensureLoaded();
				},
				{ rootMargin: "48px 0px", threshold: 0.15 },
			);
			this.#observer.observe(this);
		}

		disconnectedCallback() {
			this.#observer?.disconnect();
			this.#observer = null;
		}

		/** 只折叠/展开「第 2 条及以后」；第 1 条始终露出 */
		private toggleFolded() {
			void this.ensureLoaded().then(() => {
				const rest = this.querySelector<HTMLElement>("[data-comment-rest]");
				if (!rest) return;
				const willOpen = rest.hasAttribute("hidden");
				if (willOpen) {
					rest.removeAttribute("hidden");
					this.dataset.expanded = "true";
				} else {
					rest.setAttribute("hidden", "");
					this.dataset.expanded = "false";
				}
			});
		}

		private async ensureLoaded(): Promise<void> {
			if (this.dataset.loaded === "1") return;
			this.dataset.loaded = "1";

			const panel = this.querySelector<HTMLElement>("[data-comment-panel]");
			if (!panel) return;

			const serverURL = commentConfig.waline?.serverURL;
			if (!serverURL) return;

			panel.removeAttribute("hidden");
			panel.innerHTML = `<div class="dynamic-agent-comments is-loading" aria-busy="true">加载回复…</div>`;

			const path = extractPathFromSrc(this.dataset.src);
			await acquireFetchSlot();
			try {
				const res = await fetch(
					`${serverURL}/comment?path=${encodeURIComponent(path)}&pageSize=50&page=1`,
				);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const data = await res.json();
				const comments = (data?.data || []).filter(
					(comment: WalineComment) =>
						comment.status !== "pending" && resolvePersona(comment.nick),
				) as WalineComment[];

				const foldedCount = Math.max(0, comments.length - 1);
				this.syncBadge(foldedCount);
				this.dataset.hasComments = String(comments.length > 0);
				this.dataset.foldedCount = String(foldedCount);

				if (!comments.length) {
					panel.innerHTML = "";
					panel.setAttribute("hidden", "");
					this.dataset.expanded = "false";
					return;
				}

				const [first, ...rest] = comments;
				const restHtml = rest.length
					? `<div class="dynamic-agent-comments-rest" data-comment-rest hidden role="list">${rest
							.map((comment) => this.renderReply(comment))
							.join("")}</div>`
					: "";

				panel.innerHTML = `<div class="dynamic-agent-comments" role="list">
					${this.renderReply(first)}
					${restHtml}
				</div>`;
				this.dataset.expanded = "false";
				panel.removeAttribute("hidden");
			} catch {
				this.dataset.loaded = "";
				panel.innerHTML = `<div class="dynamic-agent-comments is-empty">回复加载失败</div>`;
				this.syncBadge(0);
			} finally {
				releaseFetchSlot();
			}
		}

		/** 红点 = 折叠条数（不含默认展示的第 1 条） */
		private syncBadge(foldedCount: number) {
			const badge = this.querySelector<HTMLElement>("[data-comment-badge]");
			if (!badge) return;
			if (foldedCount > 0) {
				badge.textContent = String(foldedCount);
				badge.removeAttribute("hidden");
				badge.setAttribute("aria-label", `${foldedCount} 条折叠回复`);
			} else {
				badge.textContent = "";
				badge.setAttribute("hidden", "");
				badge.removeAttribute("aria-label");
			}
		}

		private renderReply(comment: WalineComment): string {
			const persona = resolvePersona(comment.nick)!;
			const text = plainCommentText(comment);
			const time = formatCommentTime(comment.insertedAt);
			return `<article class="dynamic-agent-comment" role="listitem">
				<img class="dynamic-agent-comment-avatar" src="${persona.avatar}" alt="" width="36" height="36" loading="lazy" />
				<div class="dynamic-agent-comment-body">
					<div class="dynamic-agent-comment-head">
						<span class="dynamic-agent-comment-name">${escapeHtml(persona.name)}</span>
						${time ? `<time class="dynamic-agent-comment-time">${escapeHtml(time)}</time>` : ""}
					</div>
					<p class="dynamic-agent-comment-text">${escapeHtml(text)}</p>
				</div>
			</article>`;
		}
	}

	customElements.define("dynamic-inline-comments", DynamicInlineComments);
}
