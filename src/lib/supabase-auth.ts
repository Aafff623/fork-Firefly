import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import type { AstroCookies } from "astro";
import { createRateLimiter } from "@/lib/api/http";

/** 园主 GitHub 数字 id：与 Supabase identities 里 github provider 的 provider_id 比对 */
export const OWNER_GITHUB_ID = 182515127;

const MUTATION_RATE_LIMIT = 20;
const MUTATION_WINDOW_MS = 60_000;

/** 园主写操作限流：窗口数学与 429 契约由 api/http 统一。 */
const ownerMutationLimiter = createRateLimiter({
	max: MUTATION_RATE_LIMIT,
	windowMs: MUTATION_WINDOW_MS,
	keyPrefix: "owner-mutation",
});

export type Viewer = Readonly<{
	id: string;
	login: string;
	avatarUrl: string;
}>;

export type OwnerAuthResult =
	| Readonly<{ ok: true; user: User }>
	| Readonly<{
			ok: false;
			status: number;
			error: string;
			/** 仅 429 携带：路由用它写 Retry-After */
			retryAfterSeconds?: number;
	  }>;

export function readSupabaseEnv(): Readonly<{
	url: string;
	publishableKey: string;
}> | null {
	// 双通道读取（仓库惯例，见 api/ask.ts）：.env.local 的变量 dev 下在 import.meta.env
	const url =
		process.env.PUBLIC_SUPABASE_URL?.trim() ||
		import.meta.env.PUBLIC_SUPABASE_URL?.trim();
	const publishableKey =
		process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
		import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
	if (!url || !publishableKey) return null;
	return { url, publishableKey };
}

export function createAuthClient(
	request: Request,
	cookies: AstroCookies,
): ReturnType<typeof createServerClient> | null {
	const env = readSupabaseEnv();
	if (!env) return null;
	return createServerClient(env.url, env.publishableKey, {
		cookies: {
			getAll() {
				return parseCookieHeader(request.headers.get("cookie") ?? "");
			},
			setAll(cookiesToSet) {
				const secure = new URL(request.url).protocol === "https:";
				for (const { name, value, options } of cookiesToSet) {
					cookies.set(name, value, {
						path: options.path ?? "/",
						domain: options.domain,
						maxAge: options.maxAge,
						httpOnly: true,
						sameSite: "lax",
						secure,
					});
				}
			},
		},
	});
}

export async function readAuthUser(
	request: Request,
	cookies: AstroCookies,
): Promise<User | null> {
	const client = createAuthClient(request, cookies);
	if (!client) return null;
	try {
		const { data } = await client.auth.getUser();
		return data.user ?? null;
	} catch {
		return null;
	}
}

export function isOwnerUser(user: User): boolean {
	const ownerIdentityId = String(OWNER_GITHUB_ID);
	return (user.identities ?? []).some(
		(identity) =>
			identity.provider === "github" && identity.id === ownerIdentityId,
	);
}

function readIdentityString(
	record: Record<string, unknown>,
	keys: readonly string[],
): string {
	for (const key of keys) {
		const value = record[key];
		if (typeof value === "string" && value.trim()) return value.trim();
	}
	return "";
}

export function viewerFromUser(user: User): Viewer {
	const identities = user.identities ?? [];
	const githubIdentity = identities.find(
		(identity) => identity.provider === "github",
	);
	const googleIdentity = identities.find(
		(identity) => identity.provider === "google",
	);
	const identityData = {
		...((googleIdentity?.identity_data ?? {}) as Record<string, unknown>),
		...((user.user_metadata ?? {}) as Record<string, unknown>),
		...((githubIdentity?.identity_data ?? {}) as Record<string, unknown>),
	};
	const login =
		readIdentityString(identityData, [
			"user_name",
			"preferred_username",
			"full_name",
			"name",
		]) ||
		user.email?.split("@")[0] ||
		"user";
	const avatarUrl = readIdentityString(identityData, ["avatar_url", "picture"]);
	return { id: user.id, login, avatarUrl };
}

/** 只接受站内相对路径，防开放重定向 */
export function safeReturnTo(value: string | null | undefined): string {
	if (!value?.startsWith("/") || value.startsWith("//")) return "/";
	try {
		const parsed = new URL(value, "https://firefly.invalid");
		if (parsed.origin !== "https://firefly.invalid") return "/";
		return `${parsed.pathname}${parsed.search}${parsed.hash}`;
	} catch {
		return "/";
	}
}

export function sameOriginRequest(request: Request): boolean {
	const origin = request.headers.get("origin");
	if (!origin) return false;
	try {
		return new URL(origin).origin === new URL(request.url).origin;
	} catch {
		return false;
	}
}

/**
 * 园主鉴权：originCheck=true 用于写请求（Origin 校验 + 限流），
 * originCheck=false 用于只读请求（GET 幂等，不消耗限流额度）。
 */
export async function requireOwnerUser(
	request: Request,
	cookies: AstroCookies,
	options: Readonly<{ originCheck: boolean }> = { originCheck: true },
): Promise<OwnerAuthResult> {
	if (!readSupabaseEnv()) {
		return { ok: false, status: 503, error: "supabase_unconfigured" };
	}
	if (options.originCheck && !sameOriginRequest(request)) {
		return { ok: false, status: 403, error: "origin_mismatch" };
	}
	const user = await readAuthUser(request, cookies);
	if (!user) return { ok: false, status: 401, error: "session_required" };
	if (!isOwnerUser(user)) {
		return { ok: false, status: 403, error: "owner_required" };
	}
	if (options.originCheck) {
		const gate = ownerMutationLimiter.check(user.id);
		if (!gate.allowed) {
			return {
				ok: false,
				status: 429,
				error: "rate_limited",
				retryAfterSeconds: gate.retryAfterSeconds,
			};
		}
	}
	return { ok: true, user };
}
