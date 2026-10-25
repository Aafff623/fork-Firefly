import type { APIRoute } from "astro";
import { json } from "@/lib/api/http";
import { createAuthClient, sameOriginRequest } from "@/lib/supabase-auth";

export const prerender = false;

const LEGACY_OWNER_COOKIE = "firefly_owner_session";
const NO_STORE = { "Cache-Control": "no-store" };

export const POST: APIRoute = async ({ request, cookies }) => {
	if (!sameOriginRequest(request)) {
		return json(403, { ok: false, error: "origin_mismatch" }, NO_STORE);
	}
	const client = createAuthClient(request, cookies);
	if (!client) {
		return json(503, { ok: false, error: "supabase_unconfigured" }, NO_STORE);
	}
	await client.auth.signOut().catch(() => undefined);
	const response = json(200, { ok: true }, NO_STORE);
	// 旧自研会话 cookie 的过期清理（旧链路删除后残留浏览器里的兜底）
	response.headers.append(
		"Set-Cookie",
		`${LEGACY_OWNER_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
	);
	return response;
};
