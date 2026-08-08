/**
 * 动态卡片评论：
 * - 列表：agent 协作者 + 园主/访客（非摆设）
 * - 第 1 条默认展示，其余折叠；点「评论」展开并挂 Waline 写作框
 * - 写作：懒挂 /dynamic/comments/?path=… iframe（全站同时只留一个）
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

type Waiter = {
	top: number;
	resolve: () => void;
};

type DisplayIdentity = {
	name: string;
	avatar: string;
	kind: "agent" | "owner" | "guest";
};

/** 首屏并发略放宽；滚动补拉仍受队列约束 */
const FETCH_CONCURRENCY = 3;
let activeFetches = 0;
const fetchWaiters: Waiter[] = [];

const GUEST_AVATAR =
	"data:image/svg+xml," +
	encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="18" fill="%2394a3b8"/><circle cx="18" cy="14" r="6" fill="%23fff"/><path d="M6 30c2.5-6 9-8 12-8s9.5 2 12 8" fill="%23fff"/></svg>`,
	);

function acquireFetchSlot(el: HTMLElement): Promise<void> {
	if (activeFetches < FETCH_CONCURRENCY) {
		activeFetches += 1;
		return Promise.resolve();
	}
	const top = el.getBoundingClientRect().top + window.scrollY;
	return new Promise((resolve) => {
		fetchWaiters.push({ top, resolve });
		fetchWaiters.sort((a, b) => a.top - b.top);
	});
}

function releaseFetchSlot() {
	activeFetches = Math.max(0, activeFetches - 1);
	const next = fetchWaiters.shift();
	if (next) {
		activeFetches += 1;
		next.resolve();
	}
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

function isInOrNearViewport(el: HTMLElement, marginPx = 240): boolean {
	const rect = el.getBoundingClientRect();
	const vh = window.innerHeight || document.documentElement.clientHeight;
	return rect.top < vh + marginPx && rect.bottom > -marginPx;
}

function detachOtherComposers(keep: HTMLElement) {
	document
		.querySelectorAll<HTMLElement>("dynamic-inline-comments[data-composer-open='true']")
		.forEach((el) => {
			if (el === keep) return;
			(
				el as HTMLElement & { closeComposer?: () => void }
			).closeComposer?.();
		});
}

export function registerDynamicInlineComments(): void {
	if (customElements.get("dynamic-inline-comments")) return;

	class DynamicInlineComments extends HTMLElement {
		#observer: IntersectionObserver | null = null;
		#messageListener: ((event: MessageEvent) => void) | null = null;
		#outsidePointerListener: ((event: PointerEvent) => void) | null = null;

		connectedCallback() {
			if (this.dataset.ready) return;
			this.querySelector("[data-comment-toggle]")?.addEventListener(
				"click",
				() => void this.togglePanel(),
			);
			this.dataset.ready = "true";

			// 暴露给全局「只留一个写作框」
			(
				this as HTMLElement & { closeComposer?: () => void }
			).closeComposer = () => this.setComposerOpen(false);

			if (isInOrNearViewport(this, 280)) {
				void this.ensureLoaded();
				return;
			}

			this.#observer = new IntersectionObserver(
				(entries) => {
					if (!entries.some((entry) => entry.isIntersecting)) return;
					this.#observer?.disconnect();
					this.#observer = null;
					void this.ensureLoaded();
				},
				{ rootMargin: "240px 0px", threshold: 0.01 },
			);
			this.#observer.observe(this);
		}

		disconnectedCallback() {
			this.#observer?.disconnect();
			this.#observer = null;
			this.teardownMessageListeners();
			this.teardownOutsidePointer();
		}

		/** 点「评论」：展开/收起列表其余条 + 园主写作框 */
		private async togglePanel() {
			await this.ensureLoaded();
			const open = this.dataset.composerOpen === "true";
			this.setComposerOpen(!open);
		}

		private setComposerOpen(open: boolean) {
			const panel = this.querySelector<HTMLElement>("[data-comment-panel]");
			const rest = this.querySelector<HTMLElement>("[data-comment-rest]");
			if (!panel) return;

			if (open) {
				detachOtherComposers(this);
				panel.removeAttribute("hidden");
				rest?.removeAttribute("hidden");
				this.dataset.expanded = "true";
				this.dataset.composerOpen = "true";
				this.mountComposer(panel);
				this.bindOutsidePointer();
			} else {
				this.dataset.composerOpen = "false";
				this.dataset.expanded = "false";
				rest?.setAttribute("hidden", "");
				this.unmountComposer();
				this.teardownOutsidePointer();
				// 关掉时再拉一次，捡上刚发出去的园主评论
				void this.ensureLoaded(true);
			}
		}

		private async ensureLoaded(force = false): Promise<void> {
			if (!force && this.dataset.loaded === "1") return;
			this.dataset.loaded = "1";

			const panel = this.querySelector<HTMLElement>("[data-comment-panel]");
			if (!panel) return;

			const serverURL = commentConfig.waline?.serverURL;
			if (!serverURL) return;

			const keepComposer = this.dataset.composerOpen === "true";
			const composerHtml = keepComposer
				? panel.querySelector("[data-comment-composer]")?.outerHTML || ""
				: "";

			if (!keepComposer) {
				panel.removeAttribute("hidden");
			}
			const listHost =
				panel.querySelector<HTMLElement>("[data-comment-list-host]") ||
				panel;
			if (listHost === panel) {
				panel.innerHTML = `<div class="dynamic-agent-comments is-loading" data-comment-list-host aria-busy="true">加载回复…</div>${composerHtml}`;
			} else {
				listHost.className = "dynamic-agent-comments is-loading";
				listHost.setAttribute("aria-busy", "true");
				listHost.innerHTML = "加载回复…";
			}

			const path = extractPathFromSrc(this.dataset.src);
			await acquireFetchSlot(this);
			try {
				const res = await fetch(
					`${serverURL}/comment?path=${encodeURIComponent(path)}&pageSize=50&page=1`,
					{ credentials: "omit" },
				);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const data = await res.json();
				const authorKey = (this.dataset.author || "").trim();
				const visible = (data?.data || []).filter(
					(comment: WalineComment) => comment.status !== "pending",
				) as WalineComment[];

				// agent：禁自评、同工具只留最早一条；园主/访客：原样展示
				const seenAgents = new Set<string>();
				const comments = visible.filter((comment) => {
					const persona = resolvePersona(comment.nick);
					if (!persona) return true;
					if (persona.key === authorKey) return false;
					if (seenAgents.has(persona.key)) return false;
					seenAgents.add(persona.key);
					return true;
				});

				const foldedCount = Math.max(0, comments.length - 1);
				this.syncBadge(foldedCount);
				this.dataset.hasComments = String(comments.length > 0);
				this.dataset.foldedCount = String(foldedCount);

				const composerStill =
					panel.querySelector("[data-comment-composer]")?.outerHTML ||
					composerHtml;

				if (!comments.length) {
					panel.innerHTML = `<div class="dynamic-agent-comments is-empty" data-comment-list-host>还没有回复，来说两句吧</div>${
						this.dataset.composerOpen === "true" ? composerStill : ""
					}`;
					// 未打开写作框时仍隐藏空面板（避免每张卡都占一行空文案）
					if (this.dataset.composerOpen === "true") {
						panel.removeAttribute("hidden");
						this.mountComposer(panel);
					} else {
						panel.setAttribute("hidden", "");
					}
					this.dataset.expanded = "false";
					return;
				}

				const [first, ...rest] = comments;
				const restHidden =
					this.dataset.composerOpen === "true" ? "" : " hidden";
				const restHtml = rest.length
					? `<div class="dynamic-agent-comments-rest" data-comment-rest${restHidden} role="list">${rest
							.map((comment) => this.renderReply(comment))
							.join("")}</div>`
					: "";

				panel.innerHTML = `<div class="dynamic-agent-comments" data-comment-list-host role="list">
					${this.renderReply(first)}
					${restHtml}
				</div>${this.dataset.composerOpen === "true" ? composerStill : ""}`;
				panel.removeAttribute("hidden");
				if (this.dataset.composerOpen === "true") {
					this.mountComposer(panel);
				}
			} catch {
				this.dataset.loaded = "";
				panel.innerHTML = `<div class="dynamic-agent-comments is-empty" data-comment-list-host>回复加载失败</div>`;
				this.syncBadge(0);
			} finally {
				releaseFetchSlot();
			}
		}

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

		private resolveDisplay(comment: WalineComment): DisplayIdentity {
			const persona = resolvePersona(comment.nick);
			if (persona) {
				return {
					name: persona.name,
					avatar: persona.avatar,
					kind: "agent",
				};
			}
			const ownerName = (this.dataset.ownerName || "").trim();
			const nick = comment.nick.trim();
			if (
				ownerName &&
				nick.toLowerCase() === ownerName.toLowerCase()
			) {
				return {
					name: ownerName,
					avatar: this.dataset.ownerAvatar || GUEST_AVATAR,
					kind: "owner",
				};
			}
			return {
				name: nick || "访客",
				avatar: GUEST_AVATAR,
				kind: "guest",
			};
		}

		private renderReply(comment: WalineComment): string {
			const display = this.resolveDisplay(comment);
			const text = plainCommentText(comment);
			const time = formatCommentTime(comment.insertedAt);
			const kindClass =
				display.kind === "owner"
					? " is-owner"
					: display.kind === "guest"
						? " is-guest"
						: "";
			return `<article class="dynamic-agent-comment${kindClass}" role="listitem" data-comment-kind="${display.kind}">
				<img class="dynamic-agent-comment-avatar" src="${escapeHtml(display.avatar)}" alt="" width="36" height="36" loading="lazy" />
				<div class="dynamic-agent-comment-body">
					<div class="dynamic-agent-comment-head">
						<span class="dynamic-agent-comment-name">${escapeHtml(display.name)}</span>
						${
							display.kind === "owner"
								? `<span class="dynamic-agent-comment-role">园主</span>`
								: ""
						}
						${time ? `<time class="dynamic-agent-comment-time">${escapeHtml(time)}</time>` : ""}
					</div>
					<p class="dynamic-agent-comment-text">${escapeHtml(text)}</p>
				</div>
			</article>`;
		}

		private mountComposer(panel: HTMLElement) {
			const src = this.dataset.src;
			if (!src) return;

			let wrap = panel.querySelector<HTMLElement>("[data-comment-composer]");
			if (!wrap) {
				wrap = document.createElement("div");
				wrap.className = "dynamic-comment-composer";
				wrap.dataset.commentComposer = "";
				panel.appendChild(wrap);
			}

			let iframe = wrap.querySelector<HTMLIFrameElement>("iframe");
			if (!iframe) {
				iframe = document.createElement("iframe");
				iframe.className = "dynamic-comment-composer-frame";
				iframe.title = "写评论";
				iframe.loading = "lazy";
				iframe.setAttribute("data-dynamic-comment-composer", "");
				iframe.src = src;
				wrap.appendChild(iframe);
			} else if (!iframe.src) {
				iframe.src = src;
			}

			this.bindMessageListeners(iframe);
			this.syncComposerTheme(iframe);
		}

		private unmountComposer() {
			this.teardownMessageListeners();
			this.querySelector("[data-comment-composer]")?.remove();
		}

		private bindMessageListeners(iframe: HTMLIFrameElement) {
			this.teardownMessageListeners();
			this.#messageListener = (event: MessageEvent) => {
				if (event.origin !== window.location.origin) return;
				if (event.source !== iframe.contentWindow) return;
				const type = event.data?.type;
				if (type === "dynamic-comment-height") {
					const height = Number(event.data.height);
					if (Number.isFinite(height) && height > 0) {
						iframe.style.height = `${Math.min(Math.max(height, 220), 720)}px`;
					}
					return;
				}
				if (type === "dynamic-comment-posted") {
					void this.ensureLoaded(true);
					return;
				}
				// 失焦且正文为空 → 收起写作框，回到只露「评论」的样子
				if (
					type === "dynamic-comment-blur-empty" &&
					this.dataset.composerOpen === "true"
				) {
					this.setComposerOpen(false);
				}
			};
			window.addEventListener("message", this.#messageListener);
		}

		private teardownMessageListeners() {
			if (this.#messageListener) {
				window.removeEventListener("message", this.#messageListener);
				this.#messageListener = null;
			}
		}

		/** 点卡片外：请 iframe 自检是否空文，空则它会回 blur-empty */
		private bindOutsidePointer() {
			this.teardownOutsidePointer();
			this.#outsidePointerListener = (event: PointerEvent) => {
				if (this.dataset.composerOpen !== "true") return;
				const target = event.target;
				if (target instanceof Node && this.contains(target)) return;
				const iframe = this.querySelector<HTMLIFrameElement>(
					"iframe[data-dynamic-comment-composer]",
				);
				iframe?.contentWindow?.postMessage(
					{ type: "dynamic-comment-probe-empty" },
					window.location.origin,
				);
			};
			document.addEventListener("pointerdown", this.#outsidePointerListener, true);
		}

		private teardownOutsidePointer() {
			if (this.#outsidePointerListener) {
				document.removeEventListener(
					"pointerdown",
					this.#outsidePointerListener,
					true,
				);
				this.#outsidePointerListener = null;
			}
		}

		private syncComposerTheme(iframe: HTMLIFrameElement) {
			const dark = document.documentElement.classList.contains("dark");
			const post = () => {
				iframe.contentWindow?.postMessage(
					{ type: "dynamic-comment-theme", dark },
					window.location.origin,
				);
			};
			iframe.addEventListener("load", post, { once: true });
			post();
		}
	}

	customElements.define("dynamic-inline-comments", DynamicInlineComments);
}
