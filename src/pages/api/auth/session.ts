import type { APIRoute } from "astro";
import {
	OWNER_SESSION_COOKIE,
	ownerCookie,
	readSessionFromRequest,
	resolveOwnerSessionSecret,
} from "@/lib/owner-auth";

export const prerender = false;

const noStoreJson = (body: unknown, init?: ResponseInit) => {
	const response = Response.json(body, init);
	response.headers.set("Cache-Control", "no-store");
	return response;
};

export const GET: APIRoute = async ({ request, clientAddress }) => {
	const isDev = import.meta.env.DEV;
	const secret = resolveOwnerSessionSecret(request, isDev, clientAddress);
	if (!secret) {
		return noStoreJson({ authenticated: false, status: "unconfigured" });
	}
	const session = await readSessionFromRequest(request, secret);
	if (!session) {
		const response = noStoreJson({ authenticated: false, status: "guest" });
		if (request.headers.get("cookie")?.includes(`${OWNER_SESSION_COOKIE}=`)) {
			response.headers.append(
				"Set-Cookie",
				ownerCookie(OWNER_SESSION_COOKIE, "", {
					secure: new URL(request.url).protocol === "https:",
					maxAgeSeconds: 0,
				}),
			);
		}
		return response;
	}
	return noStoreJson({
		authenticated: true,
		role: session.role,
		viewer: {
			id: session.githubId,
			login: session.login,
			avatarUrl: session.avatarUrl,
		},
		csrf: session.csrf,
		expiresAt: session.expiresAt,
		dev:
			isDev &&
			process.env.OWNER_DEV_BYPASS === "1" &&
			!process.env.GITHUB_OAUTH_CLIENT_ID,
	});
};
