/**
 * API 横切面（server-only）：统一 JSON 响应、请求体三态解析、限流与客户端地址。
 *
 * 只在 `src/pages/api/**` 与 `src/lib/supabase-auth.ts` 使用；不要 import 进客户端组件。
 * 业务分支（SSE 透传、multipart、上游白名单、对象 key 推导）留在各路由，
 * 这里只负责「跨端点必须一致」的那一层。
 */

const JSON_CONTENT_TYPE = "application/json; charset=utf-8";

export const NO_STORE_HEADERS: Readonly<Record<string, string>> = {
	"Cache-Control": "no-store",
};

/** 统一 JSON 响应：content-type 固定带 charset，附加头由调用方给。 */
export function json(
	status: number,
	body: unknown,
	headers?: HeadersInit,
): Response {
	const merged = new Headers(headers);
	merged.set("Content-Type", JSON_CONTENT_TYPE);
	return new Response(JSON.stringify(body), { status, headers: merged });
}

export type JsonReadResult<T> =
	| Readonly<{ kind: "ok"; data: T }>
	| Readonly<{ kind: "empty" }>
	| Readonly<{ kind: "invalid-json" }>
	| Readonly<{ kind: "too-large" }>;

export type ReadJsonOptions = Readonly<{
	/** 请求体字节上限；默认 64KB，大请求端点显式放宽 */
	maxBytes?: number;
}>;

const DEFAULT_MAX_JSON_BYTES = 64 * 1024;

/**
 * 请求体四态：合法 JSON / 空 body / 坏 JSON / 超限。
 * 流式累计字节，超过上限立即 cancel，不把整个 body 读进内存。
 */
export async function readJson<T = unknown>(
	request: Request,
	options: ReadJsonOptions = {},
): Promise<JsonReadResult<T>> {
	const maxBytes = options.maxBytes ?? DEFAULT_MAX_JSON_BYTES;
	const declared = Number(request.headers.get("content-length") ?? "");
	if (Number.isFinite(declared) && declared > maxBytes) {
		return { kind: "too-large" };
	}
	const body = request.body;
	if (!body) return { kind: "empty" };

	const reader = body.getReader();
	const decoder = new TextDecoder();
	let text = "";
	let received = 0;
	try {
		for (;;) {
			const { done, value } = await reader.read();
			if (done) break;
			if (!value) continue;
			received += value.byteLength;
			if (received > maxBytes) {
				await reader.cancel();
				return { kind: "too-large" };
			}
			text += decoder.decode(value, { stream: true });
		}
		text += decoder.decode();
	} catch {
		return { kind: "invalid-json" };
	}
	if (!text.trim()) return { kind: "empty" };
	try {
		return { kind: "ok", data: JSON.parse(text) as T };
	} catch {
		return { kind: "invalid-json" };
	}
}

export type RateLimitDecision = Readonly<{
	allowed: boolean;
	/** 被限流时距窗口腾出空位的秒数；放行时为 0 */
	retryAfterSeconds: number;
}>;

export type RateLimiterOptions = Readonly<{
	max: number;
	windowMs: number;
	/** 键前缀：同一进程里不同端点的桶不会互相撞名 */
	keyPrefix: string;
	/** 测试注入假时钟；默认 Date.now */
	now?: () => number;
}>;

export type RateLimiter = Readonly<{
	check: (key: string) => RateLimitDecision;
}>;

/**
 * 进程内滑动窗口限流。窗口数学、过期清理、封顶只写这一份。
 * Serverless 多实例下是尽力而为的软限制（与原实现一致，不承诺全局精确）。
 */
export function createRateLimiter(options: RateLimiterOptions): RateLimiter {
	const { max, windowMs, keyPrefix } = options;
	const now = options.now ?? Date.now;
	const prefix = keyPrefix ? `${keyPrefix}:` : "";
	const hits = new Map<string, number[]>();

	return {
		check(key: string): RateLimitDecision {
			const at = now();
			const bucket = `${prefix}${key}`;
			const recent = (hits.get(bucket) ?? []).filter(
				(timestamp) => at - timestamp < windowMs,
			);
			if (recent.length >= max) {
				hits.set(bucket, recent);
				const oldest = recent[0] ?? at;
				return {
					allowed: false,
					retryAfterSeconds: Math.max(
						1,
						Math.ceil((oldest + windowMs - at) / 1000),
					),
				};
			}
			recent.push(at);
			hits.set(bucket, recent);
			if (hits.size > 5_000) {
				for (const [id, timestamps] of hits) {
					if (!timestamps.some((timestamp) => at - timestamp < windowMs)) {
						hits.delete(id);
					}
				}
			}
			return { allowed: true, retryAfterSeconds: 0 };
		},
	};
}

/**
 * 统一 429：body 固定 `{ error, code, retryAfter }`，并带 `Retry-After` 头。
 * 端点不要自己拼这个响应。
 */
export function rateLimited(retryAfterSeconds: number): Response {
	const retryAfter = Math.max(1, Math.ceil(retryAfterSeconds));
	return json(
		429,
		{
			error: "rate_limited",
			code: "rate_limited",
			message: "请求过于频繁，请稍后再试",
			retryAfter,
		},
		{ "Retry-After": String(retryAfter) },
	);
}

/** owner/admin 鉴权失败映射：429 走统一限流，其余保留原状态与错误码。 */
export function authFailure(result: {
	status: number;
	error: string;
	retryAfterSeconds?: number;
}): Response {
	if (result.status === 429) {
		return rateLimited(result.retryAfterSeconds ?? 1);
	}
	return json(
		result.status,
		{ ok: false, error: result.error },
		NO_STORE_HEADERS,
	);
}

/**
 * 统一上游失败 502：上游状态码只进 `upstreamStatus` 字段，
 * 不再冒充本端点的 `code`（例如把上游 401 当成自己的 401）。
 */
export function upstreamError(
	upstreamStatus: number,
	message: string,
): Response {
	return json(502, { error: "upstream_error", upstreamStatus, message });
}

function headerValue(request: Request, name: string): string {
	return (request.headers.get(name) ?? "").trim();
}

function firstForwardedHop(value: string): string {
	return value.split(",")[0]?.trim() ?? "";
}

/** 客户端地址顺序固定：cf-connecting-ip → x-real-ip → x-forwarded-for 第一段 → unknown。 */
export function getClientAddress(request: Request): string {
	const candidates = [
		headerValue(request, "cf-connecting-ip"),
		headerValue(request, "x-real-ip"),
		firstForwardedHop(headerValue(request, "x-forwarded-for")),
	];
	return candidates.find((value) => value.length > 0) ?? "unknown";
}
