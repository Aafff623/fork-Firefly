import type { APIRoute } from "astro";
import {
	createRateLimiter,
	getClientAddress,
	json,
	rateLimited,
	readJson,
} from "@/lib/api/http";
import {
	createAuthClient,
	isOwnerUser,
	safeReturnTo,
	sameOriginRequest,
	viewerFromUser,
} from "@/lib/supabase-auth";

export const prerender = false;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_RATE_LIMIT = 10;
const NO_STORE = { "Cache-Control": "no-store" };

/** 同 IP 每分钟最多 10 次；窗口数学与 429 响应由 api/http 统一。 */
const passwordRateLimit = createRateLimiter({
	max: PASSWORD_RATE_LIMIT,
	windowMs: 60_000,
	keyPrefix: "password",
});

/** 邮箱密码登录/注册（服务端完成，浏览器不持有 token） */
export const POST: APIRoute = async ({ request, cookies }) => {
	if (!sameOriginRequest(request)) {
		return json(403, { ok: false, error: "origin_mismatch" }, NO_STORE);
	}
	const client = createAuthClient(request, cookies);
	if (!client) {
		return json(503, { ok: false, error: "supabase_unconfigured" }, NO_STORE);
	}

	const gate = passwordRateLimit.check(getClientAddress(request));
	if (!gate.allowed) return rateLimited(gate.retryAfterSeconds);

	const read = await readJson<{
		intent?: unknown;
		email?: unknown;
		password?: unknown;
		next?: unknown;
	}>(request);
	if (read.kind === "invalid-json") {
		return json(400, { ok: false, error: "invalid_json" }, NO_STORE);
	}
	const body = read.kind === "ok" ? read.data : null;

	const intent = body?.intent;
	const email =
		typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
	const password = typeof body?.password === "string" ? body.password : "";
	if (
		(intent !== "signin" && intent !== "signup") ||
		!EMAIL_PATTERN.test(email) ||
		password.length < PASSWORD_MIN_LENGTH
	) {
		return json(400, { ok: false, error: "invalid_payload" }, NO_STORE);
	}
	const next = safeReturnTo(typeof body?.next === "string" ? body.next : null);

	if (intent === "signup") {
		const redirectTo = new URL(
			"/api/auth/callback/",
			new URL(request.url).origin,
		);
		redirectTo.searchParams.set("next", next);
		const { data, error } = await client.auth.signUp({
			email,
			password,
			options: { emailRedirectTo: redirectTo.toString() },
		});
		if (error) {
			const emailTaken = /already registered|already exists/i.test(
				error.message,
			);
			return json(
				400,
				{ ok: false, error: emailTaken ? "email_taken" : "signup_failed" },
				NO_STORE,
			);
		}
		if (data.session && data.user) {
			return json(
				200,
				{
					ok: true,
					role: isOwnerUser(data.user) ? "owner" : "user",
					viewer: viewerFromUser(data.user),
				},
				NO_STORE,
			);
		}
		return json(200, { ok: true, confirmationRequired: true }, NO_STORE);
	}

	const { data, error } = await client.auth.signInWithPassword({
		email,
		password,
	});
	if (error || !data.user) {
		// 统一文案防账号枚举；未确认邮箱单独提示
		const notConfirmed =
			error?.code === "email_not_confirmed" ||
			/not confirmed/i.test(error?.message ?? "");
		if (notConfirmed) {
			return json(403, { ok: false, error: "email_not_confirmed" }, NO_STORE);
		}
		return json(401, { ok: false, error: "invalid_credentials" }, NO_STORE);
	}
	return json(
		200,
		{
			ok: true,
			role: isOwnerUser(data.user) ? "owner" : "user",
			viewer: viewerFromUser(data.user),
		},
		NO_STORE,
	);
};
