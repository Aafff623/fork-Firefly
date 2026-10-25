import fs from "node:fs/promises";
import path from "node:path";
import type { APIRoute } from "astro";
import { authFailure, json, NO_STORE_HEADERS } from "@/lib/api/http";
import { hasImageSignature } from "@/lib/image-signature";
import {
	contentSha256,
	findOwnerPost,
	normalizeOwnerSlug,
	ownerPostImageTarget,
} from "@/lib/owner-content";
import { requireOwnerUser } from "@/lib/supabase-auth";

export const prerender = false;

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MIME_EXTENSIONS: Readonly<Record<string, string>> = {
	"image/avif": "avif",
	"image/gif": "gif",
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
};

export const POST: APIRoute = async ({ request, cookies }) => {
	const isDev = import.meta.env.DEV;
	const auth = await requireOwnerUser(request, cookies, { originCheck: true });
	if (!auth.ok) return authFailure(auth);
	if (!isDev) {
		return json(
			503,
			{ ok: false, error: "production_git_provider_unconfigured" },
			NO_STORE_HEADERS,
		);
	}

	const form = await request.formData().catch(() => null);
	const slug = normalizeOwnerSlug(String(form?.get("slug") ?? ""));
	const file = form?.get("image");
	if (!slug || !(file instanceof File)) {
		return json(400, { ok: false, error: "invalid_payload" }, NO_STORE_HEADERS);
	}
	const extension = MIME_EXTENSIONS[file.type];
	if (!extension || file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
		return json(
			415,
			{ ok: false, error: "unsupported_or_oversized_image" },
			NO_STORE_HEADERS,
		);
	}
	const bytes = new Uint8Array(await file.arrayBuffer());
	if (!hasImageSignature(bytes, file.type)) {
		return json(
			415,
			{ ok: false, error: "image_signature_mismatch" },
			NO_STORE_HEADERS,
		);
	}
	const post = await findOwnerPost(slug);
	if (!post) {
		return json(404, { ok: false, error: "post_not_found" }, NO_STORE_HEADERS);
	}
	const hash = await contentSha256(bytes);
	const imageTarget = ownerPostImageTarget(post);
	const imageDirectory = imageTarget.directory;
	const imagePath = path.join(imageDirectory, `${hash}.${extension}`);
	await fs.mkdir(imageDirectory, { recursive: true });
	let deduplicated = false;
	try {
		await fs.writeFile(imagePath, bytes, { flag: "wx" });
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
			return json(
				500,
				{ ok: false, error: "image_write_failed" },
				NO_STORE_HEADERS,
			);
		}
		deduplicated = true;
	}
	return json(
		200,
		{
			ok: true,
			hash,
			deduplicated,
			markdownPath: `${imageTarget.markdownPrefix}/${hash}.${extension}`,
		},
		NO_STORE_HEADERS,
	);
};
