/**
 * Waline 自定义图片上传代理（服务端持密钥）。
 * GET    → { enabled, backend?: "r2"|"cos" }
 * POST   → multipart `image` → { url, deleteToken }
 * DELETE → JSON `{ url, token }` → 删除本会话图床对象（仅 `comment/` 前缀）
 *
 * 优先 Cloudflare R2（S3 兼容 SigV4）；未配 R2 时回退腾讯云 COS。
 * 兼容 Astro Node（本地 / Vercel），不引入云厂商 SDK。
 */
import fs from "node:fs";
import path from "node:path";
import type { APIRoute } from "astro";
import {
	createRateLimiter,
	getClientAddress,
	json,
	rateLimited,
	readJson,
} from "@/lib/api/http";
import {
	type CosConfig,
	deleteCommentImageObject,
	encodeObjectKey,
	putCommentImage,
	type R2Config,
	type UploadConfig,
} from "@/lib/comment-image-store";
import {
	createCommentImageDeleteToken,
	verifyCommentImageDeleteToken,
} from "@/lib/comment-image-token";
import { hasImageSignature } from "@/lib/image-signature";

export const prerender = false;

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);
const EXT: Record<string, string> = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/gif": "gif",
	"image/webp": "webp",
};

/** 同 IP 10 分钟最多 20 次（冷启动会重置，够挡刷）；窗口数学在 api/http。 */
const commentImageRateLimit = createRateLimiter({
	max: 20,
	windowMs: 10 * 60 * 1000,
	keyPrefix: "comment-image",
});

function readEnvFile(): Record<string, string> {
	const out: Record<string, string> = {};
	// `.env.local` is the local override; `.env` remains a compatible fallback.
	for (const filename of [".env", ".env.local"]) {
		try {
			const text = fs.readFileSync(path.join(process.cwd(), filename), "utf8");
			for (const raw of text.split(/\r?\n/)) {
				const line = raw.trim();
				if (!line || line.startsWith("#")) continue;
				const i = line.indexOf("=");
				if (i <= 0) continue;
				const k = line.slice(0, i).trim();
				const v = line
					.slice(i + 1)
					.trim()
					.replace(/^["']|["']$/g, "");
				out[k] = v;
			}
		} catch {
			// Missing local env files are expected in CI and fresh checkouts.
		}
	}
	return out;
}

function env(name: string, file: Record<string, string>): string {
	return (
		process.env[name] ||
		(import.meta.env[name] as string | undefined) ||
		file[name] ||
		""
	).trim();
}

function getR2Config(): R2Config | null {
	const file = readEnvFile();
	const accountId = env("R2_ACCOUNT_ID", file);
	const accessKeyId = env("R2_ACCESS_KEY_ID", file);
	const secretAccessKey = env("R2_SECRET_ACCESS_KEY", file);
	const bucket = env("R2_BUCKET", file);
	const publicBaseUrl = env("R2_PUBLIC_BASE_URL", file).replace(/\/$/, "");
	if (
		!accountId ||
		!accessKeyId ||
		!secretAccessKey ||
		!bucket ||
		!publicBaseUrl
	) {
		return null;
	}
	return {
		kind: "r2",
		accountId,
		accessKeyId,
		secretAccessKey,
		bucket,
		publicBaseUrl,
	};
}

function getCosConfig(): CosConfig | null {
	const file = readEnvFile();
	const secretId = env("COS_SECRET_ID", file);
	const secretKey = env("COS_SECRET_KEY", file);
	const bucket = env("COS_BUCKET", file);
	const region = env("COS_REGION", file) || "ap-guangzhou";
	if (!secretId || !secretKey || !bucket) return null;
	const custom = env("COS_PUBLIC_BASE_URL", file).replace(/\/$/, "");
	const publicBaseUrl =
		custom || `https://${bucket}.cos.${region}.myqcloud.com`;
	return {
		kind: "cos",
		secretId,
		secretKey,
		bucket,
		region,
		publicBaseUrl,
	};
}

/** R2 优先，否则 COS */
function getUploadConfig(): UploadConfig | null {
	return getR2Config() || getCosConfig();
}

function getDeleteSecret(cfg: UploadConfig): string {
	const file = readEnvFile();
	return (
		env("COMMENT_IMAGE_DELETE_SECRET", file) ||
		(cfg.kind === "r2" ? cfg.secretAccessKey : cfg.secretKey)
	).trim();
}

function objectKeyFromPublicUrl(
	cfg: UploadConfig,
	rawUrl: string,
): string | null {
	let parsed: URL;
	try {
		parsed = new URL(rawUrl);
	} catch {
		return null;
	}
	let base: URL;
	try {
		base = new URL(cfg.publicBaseUrl);
	} catch {
		return null;
	}
	if (parsed.origin !== base.origin) return null;

	const basePath = base.pathname.replace(/\/+$/, "");
	let path: string;
	try {
		path = decodeURIComponent(parsed.pathname);
	} catch {
		// 坏百分号编码（`/comment/%`）不能变成 500
		return null;
	}
	if (basePath && basePath !== "/" && path.startsWith(basePath)) {
		path = path.slice(basePath.length);
	}
	path = path.replace(/^\/+/, "");
	if (!path.startsWith("comment/")) return null;
	if (path.includes("..") || path.includes("//")) return null;
	return path;
}

function objectKeyFor(file: File): string {
	const ext = EXT[file.type] || "bin";
	const d = new Date();
	const y = d.getUTCFullYear();
	const m = String(d.getUTCMonth() + 1).padStart(2, "0");
	const id =
		typeof crypto.randomUUID === "function"
			? crypto.randomUUID()
			: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
	return `comment/${y}/${m}/${id}.${ext}`;
}

export const GET: APIRoute = async () => {
	const cfg = getUploadConfig();
	return json(200, {
		enabled: !!cfg,
		backend: cfg?.kind ?? null,
	});
};

export const POST: APIRoute = async ({ request }) => {
	const cfg = getUploadConfig();
	if (!cfg) {
		return json(503, {
			error: "R2/COS credentials not configured",
			code: "NO_KEY",
		});
	}

	const gate = commentImageRateLimit.check(getClientAddress(request));
	if (!gate.allowed) return rateLimited(gate.retryAfterSeconds);

	let form: FormData;
	try {
		form = await request.formData();
	} catch {
		return json(400, { error: "Invalid form data" });
	}

	const file = form.get("image");
	if (!(file instanceof File)) {
		return json(400, { error: "Missing image file" });
	}

	if (!ALLOWED.has(file.type)) {
		return json(415, {
			error: "Unsupported type. Use jpeg/png/gif/webp.",
		});
	}

	if (file.size <= 0 || file.size > MAX_BYTES) {
		return json(413, { error: "Image must be under 5MB" });
	}

	const key = objectKeyFor(file);
	const body = await file.arrayBuffer();
	if (!hasImageSignature(new Uint8Array(body), file.type)) {
		return json(415, { error: "Image signature does not match type" });
	}
	try {
		await putCommentImage(cfg, key, body, file.type);
	} catch (e) {
		return json(502, {
			error: e instanceof Error ? e.message : "Upload failed",
		});
	}

	const url = `${cfg.publicBaseUrl}/${encodeObjectKey(key)}`;
	const deleteToken = await createCommentImageDeleteToken(
		getDeleteSecret(cfg),
		key,
	);
	return json(200, { url, deleteToken }, { "Cache-Control": "no-store" });
};

export const DELETE: APIRoute = async ({ request }) => {
	const cfg = getUploadConfig();
	if (!cfg) {
		return json(503, {
			error: "R2/COS credentials not configured",
			code: "NO_KEY",
		});
	}

	const gate = commentImageRateLimit.check(getClientAddress(request));
	if (!gate.allowed) return rateLimited(gate.retryAfterSeconds);

	const read = await readJson<{ url?: unknown; token?: unknown }>(request);
	if (read.kind === "invalid-json") {
		return json(400, { error: "invalid_json", code: "invalid_json" });
	}
	const body = read.kind === "ok" ? read.data : null;
	const rawUrl = typeof body?.url === "string" ? body.url.trim() : "";
	const rawToken = typeof body?.token === "string" ? body.token.trim() : "";
	if (!rawUrl) {
		return json(400, { error: "missing_url", code: "missing_url" });
	}

	const key = objectKeyFromPublicUrl(cfg, rawUrl);
	if (!key) {
		return json(403, {
			error: "URL not allowed (must be comment/ under public base)",
		});
	}

	const deleteSecret = getDeleteSecret(cfg);
	if (!deleteSecret) {
		return json(503, {
			error: "Delete is not configured",
			code: "NO_DELETE_KEY",
		});
	}
	if (
		!rawToken ||
		!(await verifyCommentImageDeleteToken(deleteSecret, key, rawToken))
	) {
		return json(403, { error: "Invalid or missing delete token" });
	}

	try {
		await deleteCommentImageObject(cfg, key);
	} catch (e) {
		return json(502, {
			error: e instanceof Error ? e.message : "Delete failed",
		});
	}

	return json(200, { ok: true, key });
};
