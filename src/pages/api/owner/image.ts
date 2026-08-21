import fs from "node:fs/promises";
import path from "node:path";
import type { APIRoute } from "astro";
import {
	checkOwnerMutationRate,
	resolveOwnerSessionSecret,
	validateMutationRequest,
} from "@/lib/owner-auth";
import {
	contentSha256,
	findOwnerPost,
	normalizeOwnerSlug,
	ownerPostImageTarget,
} from "@/lib/owner-content";

export const prerender = false;

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MIME_EXTENSIONS: Readonly<Record<string, string>> = {
	"image/avif": "avif",
	"image/gif": "gif",
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
};

function json(body: object, status = 200): Response {
	return Response.json(body, {
		status,
		headers: { "Cache-Control": "no-store" },
	});
}

function signatureMatches(bytes: Uint8Array, mime: string): boolean {
	if (mime === "image/png")
		return bytes.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10";
	if (mime === "image/jpeg")
		return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
	if (mime === "image/gif")
		return new TextDecoder().decode(bytes.slice(0, 6)).startsWith("GIF8");
	if (mime === "image/webp") {
		return (
			new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
			new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP"
		);
	}
	if (mime === "image/avif")
		return new TextDecoder().decode(bytes.slice(4, 12)).includes("ftypavif");
	return false;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
	const isDev = import.meta.env.DEV;
	const secret = resolveOwnerSessionSecret(request, isDev, clientAddress);
	if (!secret)
		return json({ ok: false, error: "owner_auth_unconfigured" }, 503);
	const auth = await validateMutationRequest(request, secret);
	if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
	if (!checkOwnerMutationRate(auth.session)) {
		return json({ ok: false, error: "rate_limited" }, 429);
	}
	if (!isDev) {
		return json(
			{ ok: false, error: "production_git_provider_unconfigured" },
			503,
		);
	}

	const form = await request.formData().catch(() => null);
	const slug = normalizeOwnerSlug(String(form?.get("slug") ?? ""));
	const file = form?.get("image");
	if (!slug || !(file instanceof File)) {
		return json({ ok: false, error: "invalid_payload" }, 400);
	}
	const extension = MIME_EXTENSIONS[file.type];
	if (!extension || file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
		return json({ ok: false, error: "unsupported_or_oversized_image" }, 415);
	}
	const bytes = new Uint8Array(await file.arrayBuffer());
	if (!signatureMatches(bytes, file.type)) {
		return json({ ok: false, error: "image_signature_mismatch" }, 415);
	}
	const post = await findOwnerPost(slug);
	if (!post) return json({ ok: false, error: "post_not_found" }, 404);
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
			return json({ ok: false, error: "image_write_failed" }, 500);
		}
		deduplicated = true;
	}
	return json({
		ok: true,
		hash,
		deduplicated,
		markdownPath: `${imageTarget.markdownPrefix}/${hash}.${extension}`,
	});
};
