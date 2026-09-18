import type { APIRoute } from "astro";
import {
	isOwnerUser,
	readAuthUser,
	readSupabaseEnv,
	viewerFromUser,
} from "@/lib/supabase-auth";

export const prerender = false;

const noStoreJson = (body: unknown, init?: ResponseInit) => {
	const response = Response.json(body, init);
	response.headers.set("Cache-Control", "no-store");
	return response;
};

export const GET: APIRoute = async ({ request, cookies }) => {
	if (!readSupabaseEnv()) {
		return noStoreJson({ authenticated: false, status: "unconfigured" });
	}
	const user = await readAuthUser(request, cookies);
	if (!user) {
		return noStoreJson({ authenticated: false, status: "guest" });
	}
	return noStoreJson({
		authenticated: true,
		role: isOwnerUser(user) ? "owner" : "user",
		viewer: viewerFromUser(user),
	});
};
