import type { APIRoute } from "astro";
import {
	checkOwnerMutationRate,
	readSessionFromRequest,
	resolveOwnerSessionSecret,
	validateMutationRequest,
} from "@/lib/owner-auth";
import {
	archiveOwnerPost,
	atomicWriteOwnerPost,
	contentSha256,
	findOwnerPost,
	normalizeOwnerSlug,
	validateOwnerPostSource,
} from "@/lib/owner-content";

export const prerender = false;

function isDevelopment(): boolean {
	return import.meta.env.DEV;
}

function json(body: object, status = 200): Response {
	return Response.json(body, {
		status,
		headers: { "Cache-Control": "no-store" },
	});
}

async function ownerForRead(request: Request, clientAddress: string) {
	const secret = resolveOwnerSessionSecret(
		request,
		isDevelopment(),
		clientAddress,
	);
	if (!secret)
		return {
			ok: false as const,
			response: json({ ok: false, error: "owner_auth_unconfigured" }, 503),
		};
	const session = await readSessionFromRequest(request, secret);
	if (session?.role !== "owner") {
		return {
			ok: false as const,
			response: json({ ok: false, error: "owner_required" }, 401),
		};
	}
	return { ok: true as const, secret, session };
}

async function ownerForMutation(request: Request, clientAddress: string) {
	const secret = resolveOwnerSessionSecret(
		request,
		isDevelopment(),
		clientAddress,
	);
	if (!secret)
		return {
			ok: false as const,
			response: json({ ok: false, error: "owner_auth_unconfigured" }, 503),
		};
	const validation = await validateMutationRequest(request, secret);
	if (!validation.ok) {
		return {
			ok: false as const,
			response: json({ ok: false, error: validation.error }, validation.status),
		};
	}
	if (!checkOwnerMutationRate(validation.session)) {
		return {
			ok: false as const,
			response: json({ ok: false, error: "rate_limited" }, 429),
		};
	}
	return { ok: true as const, session: validation.session };
}

export const GET: APIRoute = async ({ request, clientAddress }) => {
	const auth = await ownerForRead(request, clientAddress);
	if (!auth.ok) return auth.response;
	if (!isDevelopment()) {
		return json(
			{ ok: false, error: "production_git_provider_unconfigured" },
			503,
		);
	}
	const slug = normalizeOwnerSlug(
		new URL(request.url).searchParams.get("slug") ?? "",
	);
	if (!slug) return json({ ok: false, error: "invalid_slug" }, 400);
	const post = await findOwnerPost(slug);
	if (!post) return json({ ok: false, error: "post_not_found" }, 404);
	return json({
		ok: true,
		slug,
		path: post.relativePath,
		source: post.source,
		baseSha: post.baseSha,
		provider: "local-dev",
	});
};

export const PUT: APIRoute = async ({ request, clientAddress }) => {
	const auth = await ownerForMutation(request, clientAddress);
	if (!auth.ok) return auth.response;
	if (!isDevelopment()) {
		return json(
			{ ok: false, error: "production_git_provider_unconfigured" },
			503,
		);
	}
	const contentLength = Number(request.headers.get("content-length") ?? "0");
	if (contentLength > 1_700_000)
		return json({ ok: false, error: "payload_too_large" }, 413);
	let body: { slug?: string; source?: string; baseSha?: string };
	try {
		body = (await request.json()) as typeof body;
	} catch {
		return json({ ok: false, error: "invalid_json" }, 400);
	}
	const slug = normalizeOwnerSlug(body.slug ?? "");
	if (
		!slug ||
		typeof body.source !== "string" ||
		typeof body.baseSha !== "string"
	) {
		return json({ ok: false, error: "invalid_payload" }, 400);
	}
	const validation = validateOwnerPostSource(body.source);
	if (!validation.ok) return json({ ok: false, error: validation.error }, 400);
	const post = await findOwnerPost(slug);
	if (!post) return json({ ok: false, error: "post_not_found" }, 404);
	const currentSha = await contentSha256(post.source);
	if (currentSha !== body.baseSha) {
		return json({ ok: false, error: "base_sha_conflict", currentSha }, 409);
	}
	try {
		const nextSha = await atomicWriteOwnerPost(post, body.source);
		return json({ ok: true, slug, baseSha: nextSha, provider: "local-dev" });
	} catch {
		return json({ ok: false, error: "write_failed" }, 500);
	}
};

export const DELETE: APIRoute = async ({ request, clientAddress }) => {
	const auth = await ownerForMutation(request, clientAddress);
	if (!auth.ok) return auth.response;
	if (!isDevelopment()) {
		return json(
			{ ok: false, error: "production_git_provider_unconfigured" },
			503,
		);
	}
	let body: { slug?: string; baseSha?: string; confirmation?: string };
	try {
		body = (await request.json()) as typeof body;
	} catch {
		return json({ ok: false, error: "invalid_json" }, 400);
	}
	const slug = normalizeOwnerSlug(body.slug ?? "");
	if (!slug || body.confirmation !== `ARCHIVE ${slug}` || !body.baseSha) {
		return json({ ok: false, error: "archive_confirmation_required" }, 400);
	}
	const post = await findOwnerPost(slug);
	if (!post) return json({ ok: false, error: "post_not_found" }, 404);
	if (post.baseSha !== body.baseSha) {
		return json(
			{ ok: false, error: "base_sha_conflict", currentSha: post.baseSha },
			409,
		);
	}
	try {
		const archivedPath = await archiveOwnerPost(post);
		return json({
			ok: true,
			archived: true,
			archivedPath,
			provider: "local-dev",
		});
	} catch {
		return json({ ok: false, error: "archive_failed" }, 500);
	}
};
