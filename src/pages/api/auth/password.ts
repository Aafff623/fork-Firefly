import type { APIRoute } from "astro";
import {
	checkMutationRate,
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

function json(body: object, status = 200): Response {
	return Response.json(body, {
		status,
		headers: { "Cache-Control": "no-store" },
	});
}

/** 邮箱密码登录/注册（服务端完成，浏览器不持有 token） */
export const POST: APIRoute = async ({ request, cookies, clientAddress }) => {
	if (!sameOriginRequest(request)) {
		return json({ ok: false, error: "origin_mismatch" }, 403);
	}
	const client = createAuthClient(request, cookies);
	if (!client) return json({ ok: false, error: "supabase_unconfigured" }, 503);

	const rateKey = `password:${clientAddress ?? "unknown"}`;
	if (!checkMutationRate(rateKey, Date.now(), PASSWORD_RATE_LIMIT, 60_000)) {
		return json({ ok: false, error: "rate_limited" }, 429);
	}

	let body: {
		intent?: unknown;
		email?: unknown;
		password?: unknown;
		next?: unknown;
	};
	try {
		body = (await request.json()) as typeof body;
	} catch {
		return json({ ok: false, error: "invalid_json" }, 400);
	}

	const intent = body.intent;
	const email =
		typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
	const password = typeof body.password === "string" ? body.password : "";
	if (
		(intent !== "signin" && intent !== "signup") ||
		!EMAIL_PATTERN.test(email) ||
		password.length < PASSWORD_MIN_LENGTH
	) {
		return json({ ok: false, error: "invalid_payload" }, 400);
	}
	const next = safeReturnTo(typeof body.next === "string" ? body.next : null);

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
				{ ok: false, error: emailTaken ? "email_taken" : "signup_failed" },
				400,
			);
		}
		if (data.session && data.user) {
			return json({
				ok: true,
				role: isOwnerUser(data.user) ? "owner" : "user",
				viewer: viewerFromUser(data.user),
			});
		}
		return json({ ok: true, confirmationRequired: true });
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
			return json({ ok: false, error: "email_not_confirmed" }, 403);
		}
		return json({ ok: false, error: "invalid_credentials" }, 401);
	}
	return json({
		ok: true,
		role: isOwnerUser(data.user) ? "owner" : "user",
		viewer: viewerFromUser(data.user),
	});
};
