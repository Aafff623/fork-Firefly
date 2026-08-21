import type { APIRoute } from "astro";
import {
	canUseOwnerDevBypass,
	createOAuthTransaction,
	createOwnerSession,
	isLoopbackHostname,
	OAUTH_TRANSACTION_COOKIE,
	OWNER_GITHUB_ID,
	OWNER_SESSION_COOKIE,
	ownerCookie,
	resolveOwnerSessionSecret,
} from "@/lib/owner-auth";

export const prerender = false;

function developmentMode(): boolean {
	return import.meta.env.DEV;
}

export const GET: APIRoute = async ({ request, redirect, clientAddress }) => {
	const requestUrl = new URL(request.url);
	const isDev = developmentMode();
	const secret = resolveOwnerSessionSecret(request, isDev, clientAddress);
	if (!secret) {
		return Response.json(
			{ ok: false, error: "owner_auth_unconfigured" },
			{ status: 503 },
		);
	}

	const transaction = await createOAuthTransaction(
		{ returnTo: requestUrl.searchParams.get("returnTo") ?? "/" },
		secret,
	);
	const secure = requestUrl.protocol === "https:";
	const clientId = process.env.GITHUB_OAUTH_CLIENT_ID?.trim();

	if (
		!clientId &&
		isLoopbackHostname(requestUrl.hostname) &&
		canUseOwnerDevBypass(request, isDev, clientAddress)
	) {
		const session = await createOwnerSession(
			{
				id: OWNER_GITHUB_ID,
				login: "Aafff623",
				avatarUrl: `https://avatars.githubusercontent.com/u/${OWNER_GITHUB_ID}?v=4`,
			},
			secret,
		);
		const response = redirect(transaction.returnTo, 302);
		response.headers.append(
			"Set-Cookie",
			ownerCookie(OWNER_SESSION_COOKIE, session, {
				secure,
				maxAgeSeconds: 6 * 60 * 60,
			}),
		);
		return response;
	}

	if (!clientId) {
		return Response.json(
			{ ok: false, error: "github_oauth_unconfigured" },
			{ status: 503 },
		);
	}

	const authorize = new URL("https://github.com/login/oauth/authorize");
	authorize.searchParams.set("client_id", clientId);
	authorize.searchParams.set(
		"redirect_uri",
		`${requestUrl.origin}/api/auth/github/callback/`,
	);
	authorize.searchParams.set("scope", "read:user");
	authorize.searchParams.set("state", transaction.state);
	authorize.searchParams.set("code_challenge", transaction.challenge);
	authorize.searchParams.set("code_challenge_method", "S256");

	const response = redirect(authorize.toString(), 302);
	response.headers.append(
		"Set-Cookie",
		ownerCookie(OAUTH_TRANSACTION_COOKIE, transaction.cookieValue, {
			secure,
			maxAgeSeconds: 10 * 60,
		}),
	);
	return response;
};
