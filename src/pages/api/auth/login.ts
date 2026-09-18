import type { APIContext, APIRoute } from "astro";
import type { Provider } from "@supabase/supabase-js";
import { createAuthClient, safeReturnTo } from "@/lib/supabase-auth";

export const prerender = false;

const OAUTH_PROVIDERS = new Set<Provider>(["github", "google"]);

function json(body: object, status = 200): Response {
	return Response.json(body, {
		status,
		headers: { "Cache-Control": "no-store" },
	});
}

function isOauthProvider(value: string): value is Provider {
	return OAUTH_PROVIDERS.has(value as Provider);
}

function wantsHtml(request: Request): boolean {
	const accept = request.headers.get("accept") ?? "";
	return accept.includes("text/html") || !accept.includes("application/json");
}

function fail(
	request: Request,
	redirect: APIContext["redirect"],
	error: string,
	status: number,
): Response {
	if (wantsHtml(request)) {
		const next = safeReturnTo(new URL(request.url).searchParams.get("next"));
		return redirect(
			`/login/?error=${encodeURIComponent(error)}&next=${encodeURIComponent(next)}`,
			302,
		);
	}
	return json({ ok: false, error }, status);
}

function isProviderDisabled(message: string): boolean {
	return /not enabled|unsupported provider/i.test(message);
}

async function probeAuthorizeUrl(url: string): Promise<"disabled" | "ok"> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), 4000);
	try {
		const probe = await fetch(url, {
			method: "GET",
			redirect: "manual",
			headers: { Accept: "application/json" },
			signal: controller.signal,
		});
		if (probe.status >= 400) {
			const body = await probe.text();
			if (isProviderDisabled(body)) return "disabled";
		}
		return "ok";
	} catch {
		return "ok";
	} finally {
		clearTimeout(timer);
	}
}

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
	const requestUrl = new URL(request.url);
	const provider = requestUrl.searchParams.get("provider") ?? "";
	if (!isOauthProvider(provider)) {
		return fail(request, redirect, "invalid_provider", 403);
	}
	const client = createAuthClient(request, cookies);
	if (!client) return fail(request, redirect, "supabase_unconfigured", 503);

	// PKCE verifier 会在 signInWithOAuth 时经 setAll 写入 cookie，回调换 code 时读取
	const redirectTo = new URL("/api/auth/callback/", requestUrl.origin);
	redirectTo.searchParams.set(
		"next",
		safeReturnTo(requestUrl.searchParams.get("next")),
	);
	const { data, error } = await client.auth.signInWithOAuth({
		provider,
		options: {
			redirectTo: redirectTo.toString(),
			skipBrowserRedirect: true,
		},
	});
	if (error || !data.url) {
		const code = isProviderDisabled(error?.message ?? "")
			? "provider_disabled"
			: "oauth_start_failed";
		return fail(request, redirect, code, 502);
	}
	if ((await probeAuthorizeUrl(data.url)) === "disabled") {
		return fail(request, redirect, "provider_disabled", 400);
	}
	return redirect(data.url, 302);
};
