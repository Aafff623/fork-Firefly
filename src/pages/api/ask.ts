/**
 * MaxKB 问答代理：浏览器只打同源 /api/ask，避免直连 localhost:8080
 * 被 CORS / Private Network Access / IPv6 localhost 拦掉。
 * action=retrieve：本站文章库检索（思考链用）。
 * action=chat：SSE 透传 MaxKB stream:true。
 */
import type { APIRoute } from "astro";
import { siteConfig } from "@/config";
import {
	buildAskPrompt,
	retrieveSiteHits,
	type AskHit,
	type AskIntent,
} from "@/utils/ask-retrieve";

export const prerender = false;

/**
 * 上游基址在模块加载期一次性校验：协议仅 http(s)、禁 userinfo、
 * 主机白名单（回环/内网默认放行；公网上游需在 MAXKB_ALLOWED_UPSTREAM_HOSTS
 * 显式登记），杜绝环境变量被改成任意外联的 SSRF 面。
 */
const MAXKB_BASE = (() => {
	const raw = (
		import.meta.env.MAXKB_API_BASE ||
		process.env.MAXKB_API_BASE ||
		"http://127.0.0.1:8080/chat/api"
	).replace(/\/+$/, "");
	const parsed = new URL(raw);
	if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
		throw new Error(`[ask] MAXKB_API_BASE 协议非法: ${parsed.protocol}`);
	}
	if (parsed.username || parsed.password) {
		throw new Error("[ask] MAXKB_API_BASE 不允许携带 userinfo");
	}
	const host = parsed.hostname.toLowerCase();
	const privateOrLoopback =
		host === "localhost" ||
		host === "::1" ||
		/^127\./.test(host) ||
		/^10\./.test(host) ||
		/^192\.168\./.test(host) ||
		/^172\.(1[6-9]|2\d|3[01])\./.test(host);
	const extraAllowed = (process.env.MAXKB_ALLOWED_UPSTREAM_HOSTS || "")
		.split(",")
		.map((s) => s.trim().toLowerCase())
		.filter(Boolean);
	if (!privateOrLoopback && !extraAllowed.includes(host)) {
		throw new Error(
			`[ask] 上游主机不在白名单: ${host}（回环/内网默认放行；公网请在 MAXKB_ALLOWED_UPSTREAM_HOSTS 登记）`,
		);
	}
	return raw;
})();

/** 上游路径只接受站内字面量形态，拒绝协议头/双斜杠等注入 */
function upstreamUrl(path: string): string {
	if (!/^\/[A-Za-z0-9\-_/.]*$/.test(path)) {
		throw new Error(`[ask] 非法上游路径: ${path.slice(0, 32)}`);
	}
	return `${MAXKB_BASE}${path}`;
}

const ACCESS_TOKEN =
	(import.meta.env.MAXKB_ACCESS_TOKEN as string | undefined) ||
	process.env.MAXKB_ACCESS_TOKEN ||
	"";

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

function askClosed(): Response {
	return json({ code: 404, message: "Not Found" }, 404);
}

function tokenMissing(): Response {
	return json(
		{
			code: 503,
			message:
				"未配置 MAXKB_ACCESS_TOKEN。本地请写入 .env（勿入库）；生产问答关闭时本接口应 404。",
		},
		503,
	);
}

function guardAsk(): Response | null {
	if (!siteConfig.pages.ask) return askClosed();
	if (!ACCESS_TOKEN) return tokenMissing();
	return null;
}

export const GET: APIRoute = async () => {
	if (!siteConfig.pages.ask) return askClosed();
	return new Response(null, { status: 405 });
};

/**
 * 上游 JSON 响应解析（fetch 由调用方以 upstreamUrl(字面量) 直连发起，
 * 不做参数间接层——URL 构造留在调用点，可静态审计）。
 */
async function readUpstreamJson(
	res: Response,
): Promise<{ ok: boolean; status: number; data: unknown }> {
	const text = await res.text();
	let data: unknown = null;
	try {
		data = text ? JSON.parse(text) : null;
	} catch {
		data = { code: 500, message: text.slice(0, 200) || "非 JSON 响应" };
	}
	return { ok: res.ok, status: res.status, data };
}

function upstreamUnreachable(err: unknown): {
	ok: boolean;
	status: number;
	data: { code: number; message: string };
} {
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

/** POST /api/ask/?action=… */
export const POST: APIRoute = async ({ request, url }) => {
	const closed = guardAsk();
	if (closed) return closed;

	const action = url.searchParams.get("action") || "session";

	if (action === "session") {
		// URL = 已校验基址 + 字面量路径（与 chat 分支同构，可静态审计）
		const authUrl = `${MAXKB_BASE}/auth/anonymous`;
		let auth: { ok: boolean; status: number; data: unknown };
		try {
			const authRes = await fetch(authUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify({ access_token: ACCESS_TOKEN }),
			});
			auth = await readUpstreamJson(authRes);
		} catch (err) {
			auth = upstreamUnreachable(err);
		}
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

		const openUrl = `${MAXKB_BASE}/open`;
		let open: { ok: boolean; status: number; data: unknown };
		try {
			const openRes = await fetch(openUrl, {
				method: "GET",
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${authBody.data}`,
				},
			});
			open = await readUpstreamJson(openRes);
		} catch (err) {
			open = upstreamUnreachable(err);
		}
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
		// chatId 会拼进上游 URL 路径：严格字符白名单 + 长度上限，杜绝路径形态注入
		if (!/^[A-Za-z0-9\-_]{1,64}$/.test(chatId)) {
			return json({ code: 400, message: "chatId 格式非法" }, 400);
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
		// chatId 已过严格字符白名单 + upstreamUrl 路径校验双重防线
		const upstreamUrlStr = upstreamUrl(`/chat_message/${encodeURIComponent(chatId)}`);

		let upstream: Response;
		try {
			upstream = await fetch(upstreamUrlStr, {
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
