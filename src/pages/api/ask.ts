/**
 * MaxKB 问答代理：浏览器只打同源 /api/ask，避免直连 localhost:8080
 * 被 CORS / Private Network Access / IPv6 localhost 拦掉。
 * action=retrieve：本站文章库检索（思考链用）。
 * action=chat：SSE 透传 MaxKB stream:true。
 */
import type { APIRoute } from "astro";
import {
	buildAskPrompt,
	retrieveSiteHits,
	type AskHit,
	type AskIntent,
} from "@/utils/ask-retrieve";

export const prerender = false;

const MAXKB_BASE = (
	import.meta.env.MAXKB_API_BASE ||
	process.env.MAXKB_API_BASE ||
	"http://127.0.0.1:8080/chat/api"
).replace(/\/$/, "");

const ACCESS_TOKEN =
	import.meta.env.MAXKB_ACCESS_TOKEN ||
	process.env.MAXKB_ACCESS_TOKEN ||
	"2777601d60679239";

function json(
	data: unknown,
	status = 200,
	extraHeaders?: Record<string, string>,
): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			...extraHeaders,
		},
	});
}

async function maxkbFetch(
	path: string,
	init: RequestInit = {},
): Promise<{ ok: boolean; status: number; data: unknown }> {
	const url = `${MAXKB_BASE}${path.startsWith("/") ? path : `/${path}`}`;
	try {
		const res = await fetch(url, {
			...init,
			headers: {
				Accept: "application/json",
				...(init.headers || {}),
			},
		});
		const text = await res.text();
		let data: unknown = null;
		try {
			data = text ? JSON.parse(text) : null;
		} catch {
			data = { code: 500, message: text.slice(0, 200) || "非 JSON 响应" };
		}
		return { ok: res.ok, status: res.status, data };
	} catch (err) {
		const message =
			err instanceof Error ? err.message : "无法连接 MaxKB（127.0.0.1:8080）";
		return {
			ok: false,
			status: 502,
			data: {
				code: 502,
				message: `MaxKB 不可达：${message}。请确认 Docker Desktop 已开且 maxkb 容器在跑。`,
			},
		};
	}
}

/** POST /api/ask/?action=… */
export const POST: APIRoute = async ({ request, url }) => {
	const action = url.searchParams.get("action") || "session";

	if (action === "session") {
		const auth = await maxkbFetch("/auth/anonymous", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ access_token: ACCESS_TOKEN }),
		});
		const authBody = auth.data as { code?: number; message?: string; data?: string };
		if (!auth.ok || authBody?.code !== 200 || !authBody.data) {
			return json(
				{
					code: authBody?.code ?? 502,
					message: authBody?.message || "匿名鉴权失败",
				},
				auth.status >= 400 ? auth.status : 502,
			);
		}

		const open = await maxkbFetch("/open", {
			method: "GET",
			headers: { Authorization: `Bearer ${authBody.data}` },
		});
		const openBody = open.data as { code?: number; message?: string; data?: string };
		if (!open.ok || openBody?.code !== 200 || !openBody.data) {
			return json(
				{
					code: openBody?.code ?? 502,
					message: openBody?.message || "打开会话失败",
				},
				open.status >= 400 ? open.status : 502,
			);
		}

		return json({
			code: 200,
			message: "成功",
			data: { token: authBody.data, chatId: openBody.data },
		});
	}

	if (action === "retrieve") {
		let body: { message?: string; limit?: number };
		try {
			body = (await request.json()) as typeof body;
		} catch {
			return json({ code: 400, message: "请求体不是合法 JSON" }, 400);
		}
		const message = body.message?.trim();
		if (!message) {
			return json({ code: 400, message: "缺少 message" }, 400);
		}
		const limit = Math.min(Math.max(Number(body.limit) || 5, 1), 10);
		// 每次现算；禁止中间层把检索结果当答案缓存
		const data = await retrieveSiteHits(message, limit);
		return json(
			{ code: 200, message: "成功", data },
			200,
			{ "Cache-Control": "no-store, no-cache, must-revalidate" },
		);
	}

	if (action === "chat") {
		let body: {
			token?: string;
			chatId?: string;
			message?: string;
			hits?: AskHit[];
			intent?: AskIntent;
			/** 人设：guide | scholar | builder | muse（兼容旧 mode） */
			persona?: string;
			mode?: "garden" | "deep";
		};
		try {
			body = (await request.json()) as typeof body;
		} catch {
			return json({ code: 400, message: "请求体不是合法 JSON" }, 400);
		}
		const token = body.token?.trim();
		const chatId = body.chatId?.trim();
		const message = body.message?.trim();
		if (!token || !chatId || !message) {
			return json({ code: 400, message: "缺少 token / chatId / message" }, 400);
		}

		const intent: AskIntent =
			body.intent === "recent"
				? "recent"
				: body.intent === "site-meta"
					? "site-meta"
					: "keyword";
		const hits = Array.isArray(body.hits) ? body.hits.slice(0, 10) : [];
		/** 旧 mode=deep → 书虫；否则走人设 */
		const persona =
			body.persona ||
			(body.mode === "deep" ? "scholar" : "guide");
		const prompt = buildAskPrompt(message, hits, intent, persona);
		const upstreamUrl = `${MAXKB_BASE}/chat_message/${encodeURIComponent(chatId)}`;

		let upstream: Response;
		try {
			upstream = await fetch(upstreamUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "text/event-stream, application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					message: prompt,
					stream: true,
					re_chat: false,
				}),
			});
		} catch (err) {
			const detail =
				err instanceof Error ? err.message : "无法连接 MaxKB（127.0.0.1:8080）";
			return json(
				{
					code: 502,
					message: `MaxKB 不可达：${detail}。请确认 Docker Desktop 已开且 maxkb 容器在跑。`,
				},
				502,
			);
		}

		const ctype = upstream.headers.get("content-type") || "";
		if (!upstream.ok || !upstream.body) {
			const text = await upstream.text().catch(() => "");
			let messageText = text.slice(0, 300) || `MaxKB HTTP ${upstream.status}`;
			try {
				const parsed = JSON.parse(text) as { message?: string };
				if (parsed?.message) messageText = parsed.message;
			} catch {
				/* keep text */
			}
			return json({ code: upstream.status || 502, message: messageText }, 502);
		}

		// 少数错误仍以 JSON 返回
		if (ctype.includes("application/json") && !ctype.includes("event-stream")) {
			const text = await upstream.text();
			try {
				const parsed = JSON.parse(text) as {
					code?: number;
					message?: string;
				};
				return json(
					parsed ?? { code: 502, message: "MaxKB 无响应" },
					upstream.status >= 400 ? upstream.status : 200,
				);
			} catch {
				return json({ code: 502, message: text.slice(0, 200) || "非 JSON 响应" }, 502);
			}
		}

		return new Response(upstream.body, {
			status: 200,
			headers: {
				"Content-Type": "text/event-stream; charset=utf-8",
				"Cache-Control": "no-cache, no-transform",
				Connection: "keep-alive",
				"X-Accel-Buffering": "no",
			},
		});
	}

	return json({ code: 400, message: `未知 action: ${action}` }, 400);
};
