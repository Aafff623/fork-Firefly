import type { APIRoute, AstroCookies } from "astro";
import { authFailure, json, NO_STORE_HEADERS, readJson } from "@/lib/api/http";
import {
	archiveOwnerPost,
	atomicWriteOwnerPost,
	contentSha256,
	findOwnerPost,
	normalizeOwnerSlug,
	validateOwnerPostSource,
} from "@/lib/owner-content";
import { requireOwnerUser } from "@/lib/supabase-auth";

export const prerender = false;

function isDevelopment(): boolean {
	return import.meta.env.DEV;
}

/** 生产环境的 owner 写入依赖 Git provider；与 admin/pin 的「禁止写」区分 */
function productionWriteDisabled(): Response {
	return json(
		503,
		{ ok: false, error: "production_git_provider_unconfigured" },
		NO_STORE_HEADERS,
	);
}

async function ownerForRead(request: Request, cookies: AstroCookies) {
	const auth = await requireOwnerUser(request, cookies, {
		originCheck: false,
	});
	if (!auth.ok) return { ok: false as const, response: authFailure(auth) };
	return { ok: true as const };
}

async function ownerForMutation(request: Request, cookies: AstroCookies) {
	const auth = await requireOwnerUser(request, cookies, { originCheck: true });
	if (!auth.ok) return { ok: false as const, response: authFailure(auth) };
	return { ok: true as const };
}

export const GET: APIRoute = async ({ request, cookies }) => {
	const auth = await ownerForRead(request, cookies);
	if (!auth.ok) return auth.response;
	if (!isDevelopment()) return productionWriteDisabled();
	const slug = normalizeOwnerSlug(
		new URL(request.url).searchParams.get("slug") ?? "",
	);
	if (!slug) {
		return json(400, { ok: false, error: "invalid_slug" }, NO_STORE_HEADERS);
	}
	const post = await findOwnerPost(slug);
	if (!post) {
		return json(404, { ok: false, error: "post_not_found" }, NO_STORE_HEADERS);
	}
	return json(
		200,
		{
			ok: true,
			slug,
			path: post.relativePath,
			source: post.source,
			baseSha: post.baseSha,
			provider: "local-dev",
		},
		NO_STORE_HEADERS,
	);
};

export const PUT: APIRoute = async ({ request, cookies }) => {
	const auth = await ownerForMutation(request, cookies);
	if (!auth.ok) return auth.response;
	if (!isDevelopment()) return productionWriteDisabled();
	const read = await readJson<{
		slug?: string;
		source?: string;
		baseSha?: string;
	}>(request, { maxBytes: 1_700_000 });
	if (read.kind === "too-large") {
		return json(
			413,
			{ ok: false, error: "payload_too_large" },
			NO_STORE_HEADERS,
		);
	}
	if (read.kind === "invalid-json") {
		return json(400, { ok: false, error: "invalid_json" }, NO_STORE_HEADERS);
	}
	const body = read.kind === "ok" ? read.data : null;
	const slug = normalizeOwnerSlug(body?.slug ?? "");
	const source = body?.source;
	const baseSha = body?.baseSha;
	if (!slug || typeof source !== "string" || typeof baseSha !== "string") {
		return json(400, { ok: false, error: "invalid_payload" }, NO_STORE_HEADERS);
	}
	const validation = validateOwnerPostSource(source);
	if (!validation.ok) {
		return json(400, { ok: false, error: validation.error }, NO_STORE_HEADERS);
	}
	const post = await findOwnerPost(slug);
	if (!post) {
		return json(404, { ok: false, error: "post_not_found" }, NO_STORE_HEADERS);
	}
	const currentSha = await contentSha256(post.source);
	if (currentSha !== baseSha) {
		return json(
			409,
			{ ok: false, error: "base_sha_conflict", currentSha },
			NO_STORE_HEADERS,
		);
	}
	try {
		const nextSha = await atomicWriteOwnerPost(post, source);
		return json(
			200,
			{ ok: true, slug, baseSha: nextSha, provider: "local-dev" },
			NO_STORE_HEADERS,
		);
	} catch (error) {
		console.error("[owner/post] write failed", error);
		return json(500, { ok: false, error: "write_failed" }, NO_STORE_HEADERS);
	}
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
	const auth = await ownerForMutation(request, cookies);
	if (!auth.ok) return auth.response;
	if (!isDevelopment()) return productionWriteDisabled();
	const read = await readJson<{
		slug?: string;
		baseSha?: string;
		confirmation?: string;
	}>(request);
	if (read.kind === "too-large") {
		return json(
			413,
			{ ok: false, error: "payload_too_large" },
			NO_STORE_HEADERS,
		);
	}
	if (read.kind === "invalid-json") {
		return json(400, { ok: false, error: "invalid_json" }, NO_STORE_HEADERS);
	}
	const body = read.kind === "ok" ? read.data : null;
	const slug = normalizeOwnerSlug(body?.slug ?? "");
	const confirmation = body?.confirmation;
	const baseSha = body?.baseSha;
	if (!slug || confirmation !== `ARCHIVE ${slug}` || !baseSha) {
		return json(
			400,
			{ ok: false, error: "archive_confirmation_required" },
			NO_STORE_HEADERS,
		);
	}
	const post = await findOwnerPost(slug);
	if (!post) {
		return json(404, { ok: false, error: "post_not_found" }, NO_STORE_HEADERS);
	}
	if (post.baseSha !== baseSha) {
		return json(
			409,
			{ ok: false, error: "base_sha_conflict", currentSha: post.baseSha },
			NO_STORE_HEADERS,
		);
	}
	try {
		const archivedPath = await archiveOwnerPost(post);
		return json(
			200,
			{
				ok: true,
				archived: true,
				archivedPath,
				provider: "local-dev",
			},
			NO_STORE_HEADERS,
		);
	} catch (error) {
		console.error("[owner/post] archive failed", error);
		return json(500, { ok: false, error: "archive_failed" }, NO_STORE_HEADERS);
	}
};
