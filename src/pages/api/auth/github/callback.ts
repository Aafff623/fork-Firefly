import type { APIRoute } from "astro";
import {
	createOwnerSession,
	OAUTH_TRANSACTION_COOKIE,
	OWNER_SESSION_COOKIE,
	ownerCookie,
	readCookie,
	resolveOwnerSessionSecret,
	verifyOAuthTransaction,
} from "@/lib/owner-auth";

export const prerender = false;

type GitHubTokenResponse = Readonly<{ access_token?: string; error?: string }>;
type GitHubUser = Readonly<{
	id?: number;
	login?: string;
	avatar_url?: string;
}>;

export const GET: APIRoute = async ({ request, redirect, clientAddress }) => {
	const requestUrl = new URL(request.url);
	const secure = requestUrl.protocol === "https:";
	const secret = resolveOwnerSessionSecret(
		request,
		import.meta.env.DEV,
		clientAddress,
	);
	const clientId = process.env.GITHUB_OAUTH_CLIENT_ID?.trim();
	const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET?.trim();
	if (!secret || !clientId || !clientSecret) {
		return Response.json(
			{ ok: false, error: "github_oauth_unconfigured" },
			{ status: 503 },
		);
	}

	const transactionCookie = readCookie(request, OAUTH_TRANSACTION_COOKIE);
	const transaction = transactionCookie
		? await verifyOAuthTransaction(transactionCookie, secret)
		: null;
	const state = requestUrl.searchParams.get("state");
	const code = requestUrl.searchParams.get("code");
	if (!transaction || !state || state !== transaction.state || !code) {
		return Response.json(
			{ ok: false, error: "invalid_oauth_state" },
			{ status: 400 },
		);
	}

	const tokenResponse = await fetch(
		"https://github.com/login/oauth/access_token",
		{
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				client_id: clientId,
				client_secret: clientSecret,
				code,
				redirect_uri: `${requestUrl.origin}/api/auth/github/callback/`,
				code_verifier: transaction.verifier,
			}),
		},
	);
	const tokenData = (await tokenResponse.json()) as GitHubTokenResponse;
	if (!tokenResponse.ok || !tokenData.access_token) {
		return Response.json(
			{ ok: false, error: "github_token_exchange_failed" },
			{ status: 502 },
		);
	}

	const userResponse = await fetch("https://api.github.com/user", {
		headers: {
			Accept: "application/vnd.github+json",
			Authorization: `Bearer ${tokenData.access_token}`,
			"X-GitHub-Api-Version": "2022-11-28",
		},
	});
	const user = (await userResponse.json()) as GitHubUser;
	if (!userResponse.ok || !Number.isSafeInteger(user.id) || !user.login) {
		return Response.json(
			{ ok: false, error: "github_user_lookup_failed" },
			{ status: 502 },
		);
	}

	const session = await createOwnerSession(
		{
			id: user.id as number,
			login: user.login,
			avatarUrl: user.avatar_url ?? "",
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
	response.headers.append(
		"Set-Cookie",
		ownerCookie(OAUTH_TRANSACTION_COOKIE, "", { secure, maxAgeSeconds: 0 }),
	);
	return response;
};
