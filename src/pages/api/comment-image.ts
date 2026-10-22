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

/** 简易限流：同 IP 10 分钟内最多 20 次（冷启动会重置，够挡刷） */
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 20;
const rateHits = new Map<string, number[]>();

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

function clientIp(request: Request): string {
	return (
		request.headers.get("cf-connecting-ip") ||
		request.headers.get("x-real-ip") ||
		request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
		"unknown"
	);
}

function allowRate(ip: string): boolean {
	const now = Date.now();
	const prev = (rateHits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
	if (prev.length >= RATE_MAX) {
		rateHits.set(ip, prev);
		return false;
	}
	prev.push(now);
	rateHits.set(ip, prev);
	return true;
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
	return new Response(
		JSON.stringify({
			enabled: !!cfg,
			backend: cfg?.kind ?? null,
		}),
		{
			headers: { "Content-Type": "application/json; charset=utf-8" },
		},
	);
};

export const POST: APIRoute = async ({ request }) => {
	const cfg = getUploadConfig();
	if (!cfg) {
		return new Response(
			JSON.stringify({
				error: "R2/COS credentials not configured",
				code: "NO_KEY",
			}),
			{ status: 503, headers: { "Content-Type": "application/json" } },
		);
	}

	if (!allowRate(clientIp(request))) {
		return new Response(
			JSON.stringify({ error: "Too many uploads, try later" }),
			{ status: 429, headers: { "Content-Type": "application/json" } },
		);
	}

	let form: FormData;
	try {
		form = await request.formData();
	} catch {
		return new Response(JSON.stringify({ error: "Invalid form data" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const file = form.get("image");
	if (!(file instanceof File)) {
		return new Response(JSON.stringify({ error: "Missing image file" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	if (!ALLOWED.has(file.type)) {
		return new Response(
			JSON.stringify({
				error: "Unsupported type. Use jpeg/png/gif/webp.",
			}),
			{ status: 415, headers: { "Content-Type": "application/json" } },
		);
	}

	if (file.size <= 0 || file.size > MAX_BYTES) {
		return new Response(JSON.stringify({ error: "Image must be under 5MB" }), {
			status: 413,
			headers: { "Content-Type": "application/json" },
		});
	}

	const key = objectKeyFor(file);
	const body = await file.arrayBuffer();
	if (!hasImageSignature(new Uint8Array(body), file.type)) {
		return new Response(
			JSON.stringify({ error: "Image signature does not match type" }),
			{ status: 415, headers: { "Content-Type": "application/json" } },
		);
	}
	try {
		await putCommentImage(cfg, key, body, file.type);
	} catch (e) {
		return new Response(
			JSON.stringify({
				error: e instanceof Error ? e.message : "Upload failed",
			}),
			{ status: 502, headers: { "Content-Type": "application/json" } },
		);
	}

	const url = `${cfg.publicBaseUrl}/${encodeObjectKey(key)}`;
	const deleteToken = await createCommentImageDeleteToken(
		getDeleteSecret(cfg),
		key,
	);
	return new Response(JSON.stringify({ url, deleteToken }), {
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Cache-Control": "no-store",
		},
	});
};

export const DELETE: APIRoute = async ({ request }) => {
	const cfg = getUploadConfig();
	if (!cfg) {
		return new Response(
			JSON.stringify({
				error: "R2/COS credentials not configured",
				code: "NO_KEY",
			}),
			{ status: 503, headers: { "Content-Type": "application/json" } },
		);
	}

	if (!allowRate(clientIp(request))) {
		return new Response(
			JSON.stringify({ error: "Too many uploads, try later" }),
			{ status: 429, headers: { "Content-Type": "application/json" } },
		);
	}

	let rawUrl = "";
	let rawToken = "";
	try {
		const body = (await request.json()) as {
			url?: unknown;
			token?: unknown;
		};
		if (typeof body?.url === "string") rawUrl = body.url;
		if (typeof body?.token === "string") rawToken = body.token;
	} catch {
		/* 空 body / 非法 JSON 一律按缺参处理 */
	}
	rawUrl = rawUrl.trim();
	rawToken = rawToken.trim();
	if (!rawUrl) {
		return new Response(JSON.stringify({ error: "Missing url" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const key = objectKeyFromPublicUrl(cfg, rawUrl);
	if (!key) {
		return new Response(
			JSON.stringify({
				error: "URL not allowed (must be comment/ under public base)",
			}),
			{ status: 403, headers: { "Content-Type": "application/json" } },
		);
	}

	const deleteSecret = getDeleteSecret(cfg);
	if (!deleteSecret) {
		return new Response(
			JSON.stringify({
				error: "Delete is not configured",
				code: "NO_DELETE_KEY",
			}),
			{ status: 503, headers: { "Content-Type": "application/json" } },
		);
	}
	if (
		!rawToken ||
		!(await verifyCommentImageDeleteToken(deleteSecret, key, rawToken))
	) {
		return new Response(
			JSON.stringify({ error: "Invalid or missing delete token" }),
			{ status: 403, headers: { "Content-Type": "application/json" } },
		);
	}

	try {
		await deleteCommentImageObject(cfg, key);
	} catch (e) {
		return new Response(
			JSON.stringify({
				error: e instanceof Error ? e.message : "Delete failed",
			}),
			{ status: 502, headers: { "Content-Type": "application/json" } },
		);
	}

	return new Response(JSON.stringify({ ok: true, key }), {
		headers: { "Content-Type": "application/json; charset=utf-8" },
	});
};
