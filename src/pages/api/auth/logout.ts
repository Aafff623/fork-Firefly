import type { APIRoute } from "astro";
import { createAuthClient, sameOriginRequest } from "@/lib/supabase-auth";

export const prerender = false;

const LEGACY_OWNER_COOKIE = "firefly_owner_session";

function json(body: object, status = 200): Response {
	return Response.json(body, {
		status,
		headers: { "Cache-Control": "no-store" },
	});
}

export const POST: APIRoute = async ({ request, cookies }) => {
	if (!sameOriginRequest(request)) {
		return json({ ok: false, error: "origin_mismatch" }, 403);
	}
	const client = createAuthClient(request, cookies);
	if (!client) return json({ ok: false, error: "supabase_unconfigured" }, 503);
	await client.auth.signOut().catch(() => undefined);
	const response = json({ ok: true });
	// 旧自研会话 cookie 的过期清理（旧链路删除后残留浏览器里的兜底）
	response.headers.append(
		"Set-Cookie",
		`${LEGACY_OWNER_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
	);
	return response;
};
