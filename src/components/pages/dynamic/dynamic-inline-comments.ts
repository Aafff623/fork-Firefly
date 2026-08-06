/** 动态评论区：点开只拉 Waline 里 agent 协作者评论，渲染成紧凑短条（不加载完整 Waline 框） */

import { agentPersonas } from "@/config/agentPersonas";
import { commentConfig } from "@/config/commentConfig";

type WalineComment = {
	nick: string;
	orig?: string;
	comment?: string;
	status?: string;
};

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

export function registerDynamicInlineComments(): void {
	if (customElements.get("dynamic-inline-comments")) return;

	class DynamicInlineComments extends HTMLElement {
		connectedCallback() {
			if (this.dataset.ready) return;
			this.querySelector("[data-comment-toggle]")?.addEventListener(
				"click",
				() => this.toggle(),
			);
			this.dataset.ready = "true";
		}

		private toggle() {
			const panel = this.querySelector<HTMLElement>("[data-comment-panel]");
			if (!panel) return;
			const willOpen = panel.hidden;
			panel.hidden = !willOpen;
			this.dataset.expanded = String(willOpen);
			if (willOpen && !this.dataset.loaded) this.load(panel);
		}

		private async load(panel: HTMLElement) {
			this.dataset.loaded = "1";
			panel.innerHTML = "";
			const serverURL = commentConfig.waline?.serverURL;
			if (!serverURL) return;
			const path = extractPathFromSrc(this.dataset.src);
			try {
				const res = await fetch(
					`${serverURL}/comment?path=${encodeURIComponent(path)}`,
				);
				if (!res.ok) return;
				const data = await res.json();
				const comments = (data?.data || []).filter(
					(comment: WalineComment) =>
						comment.status !== "pending" && resolvePersona(comment.nick),
				);
				if (!comments.length) {
					panel.innerHTML = `<div class="dynamic-agent-comments is-empty">暂无协作者评论</div>`;
					return;
				}
				const html = comments
					.map((comment: WalineComment) => {
						const persona = resolvePersona(comment.nick)!;
						const text = String(comment.orig || comment.comment || "")
							.replace(/<[^>]+>/g, " ")
							.replace(/\s+/g, " ")
							.trim();
						return `<div class="dynamic-agent-comment">
							<img class="dynamic-agent-comment-avatar" src="${persona.avatar}" alt="" loading="lazy" />
							<span class="dynamic-agent-comment-name">${escapeHtml(persona.name)}</span>
							<span class="dynamic-agent-comment-text" title="${escapeHtml(text)}">${escapeHtml(text)}</span>
						</div>`;
					})
					.join("");
				panel.innerHTML = `<div class="dynamic-agent-comments">${html}</div>`;
			} catch {
				/* 网络失败静默 */
			}
		}
	}

	customElements.define("dynamic-inline-comments", DynamicInlineComments);
}
