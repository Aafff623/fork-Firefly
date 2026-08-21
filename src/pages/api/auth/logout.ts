import type { APIRoute } from "astro";
import {
	OWNER_SESSION_COOKIE,
	ownerCookie,
	resolveOwnerSessionSecret,
	validateSessionMutationRequest,
} from "@/lib/owner-auth";

export const prerender = false;

export const POST: APIRoute = async ({ request, clientAddress }) => {
	const secret = resolveOwnerSessionSecret(
		request,
		import.meta.env.DEV,
		clientAddress,
	);
	if (!secret)
		return Response.json(
			{ ok: false, error: "owner_auth_unconfigured" },
			{ status: 503 },
		);
	const validation = await validateSessionMutationRequest(request, secret);
	if (!validation.ok) {
		return Response.json(
			{ ok: false, error: validation.error },
			{ status: validation.status },
		);
	}
	const response = Response.json({ ok: true });
	response.headers.append(
		"Set-Cookie",
		ownerCookie(OWNER_SESSION_COOKIE, "", {
			secure: new URL(request.url).protocol === "https:",
			maxAgeSeconds: 0,
		}),
	);
	return response;
};
