/**
 * MaxKB 问答代理：浏览器只打同源 /api/ask，避免直连 localhost:8080
 * 被 CORS / Private Network Access / IPv6 localhost 拦掉。
 * action=retrieve：本站文章库检索（思考链用）。
 * action=chat：SSE 透传 MaxKB stream:true。
 */
import type { APIRoute } from "astro";
import { siteConfig } from "@/config";
import {
	createRateLimiter,
	getClientAddress,
	json,
	rateLimited,
	readJson,
	upstreamError,
} from "@/lib/api/http";
import {
	type AskHit,
	type AskIntent,
	type AskPromptAttachment,
	buildAskPrompt,
	retrieveSiteHits,
} from "@/utils/ask-retrieve";

export const prerender = false;

/** 同 IP 10 分钟最多 20 次；窗口数学与 429 响应由 api/http 统一。 */
const askRateLimit = createRateLimiter({
	max: 20,
	windowMs: 10 * 60 * 1000,
	keyPrefix: "ask",
});

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

const STEPFUN_API_KEY =
	(import.meta.env.STEPFUN_API_KEY as string | undefined) ||
	process.env.STEPFUN_API_KEY ||
	"";
const STEPFUN_API_BASE = (
	(import.meta.env.STEPFUN_API_BASE as string | undefined) ||
	process.env.STEPFUN_API_BASE ||
	"https://api.stepfun.com/step_plan/v1"
).replace(/\/+$/, "");
const STEPFUN_MODEL =
	(import.meta.env.STEPFUN_MODEL as string | undefined) ||
	process.env.STEPFUN_MODEL ||
	"step-3.7-flash";

function askClosed(): Response {
	return json(404, { code: 404, message: "Not Found" });
}

function tokenMissing(): Response {
	return json(503, {
		code: 503,
		message:
			"未配置问答服务。请在服务端配置 STEPFUN_API_KEY，或继续配置 MAXKB_ACCESS_TOKEN。",
	});
}

function askWip(): Response {
	return json(503, { code: 503, message: "正在开发中" });
}

function guardAsk(): Response | null {
	if (import.meta.env.PROD) return askWip();
	if (!siteConfig.pages.ask) return askClosed();
	if (!STEPFUN_API_KEY && !ACCESS_TOKEN) return tokenMissing();
	return null;
}

export const GET: APIRoute = async () => {
	if (import.meta.env.PROD) return askWip();
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

function unreachableMessage(err: unknown): string {
	const detail =
		err instanceof Error ? err.message : "无法连接 MaxKB（127.0.0.1:8080）";
	return `MaxKB 不可达：${detail}。请确认 Docker Desktop 已开且 maxkb 容器在跑。`;
}

/** POST /api/ask/?action=… */
export const POST: APIRoute = async ({ request, url }) => {
	const closed = guardAsk();
	if (closed) return closed;

	const action = url.searchParams.get("action") || "session";
	const addr = getClientAddress(request);
	if (action === "session" || action === "retrieve" || action === "chat") {
		const gate = askRateLimit.check(addr);
		if (!gate.allowed) return rateLimited(gate.retryAfterSeconds);
	}

	if (action === "session") {
		if (STEPFUN_API_KEY) {
			return json(200, {
				code: 200,
				message: "成功",
				data: { token: "stepfun", chatId: "stepfun" },
			});
		}
		// 与 chat 分支同构：上游 URL 一律经 upstreamUrl 字面量校验
		const authUrl = upstreamUrl("/auth/anonymous");
		let auth: { ok: boolean; status: number; data: unknown };
		try {
			const authRes = await fetch(
				new Request(authUrl, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
					},
					body: JSON.stringify({ access_token: ACCESS_TOKEN }),
				}),
			);
			auth = await readUpstreamJson(authRes);
		} catch (err) {
			return upstreamError(0, unreachableMessage(err));
		}
		const authBody = auth.data as {
			code?: number;
			message?: string;
			data?: string;
		};
		if (!auth.ok || authBody?.code !== 200 || !authBody.data) {
			return upstreamError(auth.status, authBody?.message || "匿名鉴权失败");
		}

		const openUrl = upstreamUrl("/open");
		let open: { ok: boolean; status: number; data: unknown };
		try {
			const openRes = await fetch(
				new Request(openUrl, {
					method: "GET",
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${authBody.data}`,
					},
				}),
			);
			open = await readUpstreamJson(openRes);
		} catch (err) {
			return upstreamError(0, unreachableMessage(err));
		}
		const openBody = open.data as {
			code?: number;
			message?: string;
			data?: string;
		};
		if (!open.ok || openBody?.code !== 200 || !openBody.data) {
			return upstreamError(open.status, openBody?.message || "打开会话失败");
		}

		return json(200, {
			code: 200,
			message: "成功",
			data: { token: authBody.data, chatId: openBody.data },
		});
	}

	if (action === "retrieve") {
		const read = await readJson<{ message?: string; limit?: number }>(request);
		if (read.kind === "invalid-json") {
			return json(400, { code: 400, message: "请求体不是合法 JSON" });
		}
		const body = read.kind === "ok" ? read.data : null;
		const message = body?.message?.trim();
		if (!message) {
			return json(400, { code: 400, message: "缺少 message" });
		}
		const limit = Math.min(Math.max(Number(body?.limit) || 5, 1), 10);
		// 每次现算；禁止中间层把检索结果当答案缓存
		let data: Awaited<ReturnType<typeof retrieveSiteHits>>;
		try {
			data = await retrieveSiteHits(message, limit, url.origin);
		} catch {
			return upstreamError(0, "站内索引暂时不可用，请稍后再试");
		}
		return json(
			200,
			{ code: 200, message: "成功", data },
			{
				"Cache-Control": "no-store, no-cache, must-revalidate",
			},
		);
	}

	if (action === "chat") {
		const read = await readJson<{
			token?: string;
			chatId?: string;
			message?: string;
			hits?: AskHit[];
			intent?: AskIntent;
			/** 人设：guide | scholar | builder | muse */
			persona?: string;
			attachments?: Array<{
				name?: unknown;
				kind?: unknown;
				text?: unknown;
			}>;
		}>(request);
		if (read.kind === "invalid-json") {
			return json(400, { code: 400, message: "请求体不是合法 JSON" });
		}
		const body = read.kind === "ok" ? read.data : null;
		const token = body?.token?.trim();
		const chatId = body?.chatId?.trim();
		const message = body?.message?.trim();
		if (!token || !chatId || !message) {
			return json(400, { code: 400, message: "缺少 token / chatId / message" });
		}
		if (message.length > 4000) {
			return json(400, {
				code: 400,
				message: "单次消息请控制在 4000 字符以内",
			});
		}
		// chatId 会拼进上游 URL 路径：严格字符白名单 + 长度上限，杜绝路径形态注入
		if (!/^[A-Za-z0-9\-_]{1,64}$/.test(chatId)) {
			return json(400, { code: 400, message: "chatId 格式非法" });
		}

		// 附件：最多 4 个；名字截 120；单段文本截 6000；总文本 12000（顺序保留先到的）
		const ASK_ATTACH_MAX = 4;
		const rawAttachments = Array.isArray(body?.attachments)
			? body.attachments
			: [];
		const attachments: AskPromptAttachment[] = [];
		let attachTextBudget = 12000;
		for (const raw of rawAttachments.slice(0, ASK_ATTACH_MAX)) {
			const name = String(raw?.name ?? "")
				.slice(0, 120)
				.trim();
			if (!name) continue;
			const kind = raw?.kind === "image" ? "image" : "text";
			let text = "";
			if (
				kind === "text" &&
				typeof raw?.text === "string" &&
				attachTextBudget > 0
			) {
				text = raw.text.slice(0, Math.min(6000, attachTextBudget));
				attachTextBudget -= text.length;
			}
			attachments.push({ name, kind, text: text || undefined });
		}

		const intent: AskIntent =
			body?.intent === "recent"
				? "recent"
				: body?.intent === "site-meta"
					? "site-meta"
					: "keyword";
		const hits = Array.isArray(body?.hits) ? body.hits.slice(0, 10) : [];
		const persona = body?.persona || "guide";
		const prompt = buildAskPrompt(message, hits, intent, persona, attachments);

		if (STEPFUN_API_KEY && token === "stepfun") {
			let stepfun: Response;
			try {
				stepfun = await fetch(`${STEPFUN_API_BASE}/chat/completions`, {
					method: "POST",
					headers: {
						Authorization: `Bearer ${STEPFUN_API_KEY}`,
						"Content-Type": "application/json",
						Accept: "text/event-stream, application/json",
					},
					body: JSON.stringify({
						model: STEPFUN_MODEL,
						stream: true,
						messages: [
							{
								role: "system",
								content:
									"你是本站的问答助手。优先基于提供的站内文章检索结果回答；不确定时明确说不确定，不要编造本站不存在的事实。",
							},
							{ role: "user", content: prompt },
						],
					}),
				});
			} catch {
				return upstreamError(0, "阶跃星辰问答服务暂时无法连接");
			}
			if (!stepfun.ok || !stepfun.body) {
				return upstreamError(stepfun.status, "阶跃星辰问答服务暂时不可用");
			}
			return new Response(stepfun.body, {
				status: 200,
				headers: {
					"Content-Type": "text/event-stream; charset=utf-8",
					"Cache-Control": "no-cache, no-transform",
					Connection: "keep-alive",
					"X-Accel-Buffering": "no",
				},
			});
		}

		// chatId 已过严格字符白名单 + upstreamUrl 路径校验双重防线
		const upstreamUrlStr = upstreamUrl(
			`/chat_message/${encodeURIComponent(chatId)}`,
		);

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
			return upstreamError(0, unreachableMessage(err));
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
			return upstreamError(upstream.status || 0, messageText);
		}

		// 少数错误仍以 JSON 返回
		if (ctype.includes("application/json") && !ctype.includes("event-stream")) {
			const text = await upstream.text();
			try {
				const parsed = JSON.parse(text) as {
					code?: number;
					message?: string;
				};
				return upstreamError(
					upstream.status,
					parsed?.message || "MaxKB 无响应",
				);
			} catch {
				return upstreamError(
					upstream.status,
					text.slice(0, 200) || "非 JSON 响应",
				);
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

	return json(400, { code: 400, message: `未知 action: ${action}` });
};
