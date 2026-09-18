import type { EmailOtpType } from "@supabase/supabase-js";
import type { APIRoute } from "astro";
import { createAuthClient, safeReturnTo } from "@/lib/supabase-auth";

export const prerender = false;

/** 统一处理 Supabase 回跳：OAuth code 换会话 / 邮箱确认 token_hash 验证 */
export const GET: APIRoute = async ({ request, cookies, redirect }) => {
	const requestUrl = new URL(request.url);
	const next = safeReturnTo(requestUrl.searchParams.get("next"));
	const code = requestUrl.searchParams.get("code");
	const tokenHash = requestUrl.searchParams.get("token_hash");
	const type = requestUrl.searchParams.get("type") as EmailOtpType | null;

	const client = createAuthClient(request, cookies);
	if (!client) return redirect("/login/?error=unconfigured", 302);

	if (code) {
		const { error } = await client.auth.exchangeCodeForSession(code);
		if (!error) return redirect(next, 302);
		return redirect(
			`/login/?error=auth_failed&reason=${encodeURIComponent(error.message)}`,
			302,
		);
	}
	if (tokenHash && type) {
		const { error } = await client.auth.verifyOtp({
			token_hash: tokenHash,
			type,
		});
		if (!error) return redirect(next, 302);
		return redirect(
			`/login/?error=otp_failed&reason=${encodeURIComponent(error.message)}`,
			302,
		);
	}
	return redirect("/login/?error=missing_parameters", 302);
};
