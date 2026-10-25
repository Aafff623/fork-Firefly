import type { APIRoute } from "astro";
import { json, NO_STORE_HEADERS } from "@/lib/api/http";
import {
	isOwnerUser,
	readAuthUser,
	readSupabaseEnv,
	viewerFromUser,
} from "@/lib/supabase-auth";

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies }) => {
	if (!readSupabaseEnv()) {
		return json(
			200,
			{ authenticated: false, status: "unconfigured" },
			NO_STORE_HEADERS,
		);
	}
	const user = await readAuthUser(request, cookies);
	if (!user) {
		return json(
			200,
			{ authenticated: false, status: "guest" },
			NO_STORE_HEADERS,
		);
	}
	return json(
		200,
		{
			authenticated: true,
			role: isOwnerUser(user) ? "owner" : "user",
			viewer: viewerFromUser(user),
		},
		NO_STORE_HEADERS,
	);
};
