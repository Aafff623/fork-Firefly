/**
 * Waline 自定义图片上传代理（服务端持密钥）。
 * GET    → { enabled, backend?: "r2"|"cos" }
 * POST   → multipart `image` → { url }
 * DELETE → JSON `{ url }` 或 `?url=` → 删除本会话图床对象（仅 `comment/` 前缀）
 *
 * 优先 Cloudflare R2（S3 兼容 SigV4）；未配 R2 时回退腾讯云 COS。
 * 兼容 Astro Node（本地 / Vercel），不引入云厂商 SDK。
 */
import fs from "node:fs";
import path from "node:path";
import type { APIRoute } from "astro";

export const prerender = false;

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set([
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
]);
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

type CosConfig = {
	kind: "cos";
	secretId: string;
	secretKey: string;
	bucket: string;
	region: string;
	publicBaseUrl: string;
};

type R2Config = {
	kind: "r2";
	accountId: string;
	accessKeyId: string;
	secretAccessKey: string;
	bucket: string;
	publicBaseUrl: string;
};

type UploadConfig = R2Config | CosConfig;

function readEnvFile(): Record<string, string> {
	try {
		const text = fs.readFileSync(path.join(process.cwd(), ".env"), "utf8");
		const out: Record<string, string> = {};
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
		return out;
	} catch {
		return {};
	}
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
	if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicBaseUrl) {
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

function toHex(buf: ArrayBuffer): string {
	return [...new Uint8Array(buf)]
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

async function sha1Hex(message: string): Promise<string> {
	const dig = await crypto.subtle.digest(
		"SHA-1",
		new TextEncoder().encode(message),
	);
	return toHex(dig);
}

async function hmacSha1Hex(key: string, message: string): Promise<string> {
	const enc = new TextEncoder();
	const cryptoKey = await crypto.subtle.importKey(
		"raw",
		enc.encode(key),
		{ name: "HMAC", hash: "SHA-1" },
		false,
		["sign"],
	);
	const sig = await crypto.subtle.sign(
		"HMAC",
		cryptoKey,
		enc.encode(message),
	);
	return toHex(sig);
}

async function sha256Hex(
	data: string | ArrayBuffer | Uint8Array,
): Promise<string> {
	const bytes =
		typeof data === "string"
			? new TextEncoder().encode(data)
			: data instanceof ArrayBuffer
				? new Uint8Array(data)
				: data;
	const dig = await crypto.subtle.digest("SHA-256", bytes);
	return toHex(dig);
}

async function hmacSha256(
	key: ArrayBuffer | Uint8Array,
	message: string,
): Promise<ArrayBuffer> {
	const cryptoKey = await crypto.subtle.importKey(
		"raw",
		key instanceof Uint8Array ? key : new Uint8Array(key),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	return crypto.subtle.sign(
		"HMAC",
		cryptoKey,
		new TextEncoder().encode(message),
	);
}

/** 对 object key 做路径编码（保留 /） */
function encodeObjectKey(key: string): string {
	return key
		.split("/")
		.map((seg) => encodeURIComponent(seg))
		.join("/");
}

/**
 * COS XML 请求签名（q-sign-algorithm=sha1）
 * @see https://cloud.tencent.com/document/product/436/7778
 */
async function cosAuthorization(opts: {
	secretId: string;
	secretKey: string;
	method: string;
	pathname: string;
	headers: Record<string, string>;
	expireSec?: number;
}): Promise<string> {
	const now = Math.floor(Date.now() / 1000);
	const keyTime = `${now};${now + (opts.expireSec ?? 600)}`;
	const signKey = await hmacSha1Hex(opts.secretKey, keyTime);

	const headerEntries = Object.entries(opts.headers)
		.map(([k, v]) => [k.toLowerCase(), v.trim()] as const)
		.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
	const headerList = headerEntries.map(([k]) => k).join(";");
	const httpHeaders = headerEntries
		.map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
		.join("&");

	const httpString = [
		opts.method.toLowerCase(),
		opts.pathname,
		"",
		httpHeaders,
		"",
	].join("\n");

	const stringToSign = ["sha1", keyTime, await sha1Hex(httpString), ""].join(
		"\n",
	);
	const signature = await hmacSha1Hex(signKey, stringToSign);

	return [
		"q-sign-algorithm=sha1",
		`q-ak=${opts.secretId}`,
		`q-sign-time=${keyTime}`,
		`q-key-time=${keyTime}`,
		`q-header-list=${headerList}`,
		"q-url-param-list=",
		`q-signature=${signature}`,
	].join("&");
}

async function putObjectToCos(
	cfg: CosConfig,
	objectKey: string,
	body: ArrayBuffer,
	contentType: string,
): Promise<void> {
	const host = `${cfg.bucket}.cos.${cfg.region}.myqcloud.com`;
	const pathname = `/${encodeObjectKey(objectKey)}`;
	const headers: Record<string, string> = {
		host,
		"content-type": contentType,
	};
	const authorization = await cosAuthorization({
		secretId: cfg.secretId,
		secretKey: cfg.secretKey,
		method: "PUT",
		pathname,
		headers,
	});

	const res = await fetch(`https://${host}${pathname}`, {
		method: "PUT",
		headers: {
			Host: host,
			"Content-Type": contentType,
			Authorization: authorization,
		},
		body,
	});

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(
			`COS HTTP ${res.status}${text ? `: ${text.slice(0, 200)}` : ""}`,
		);
	}
}

/**
 * R2 PutObject（AWS SigV4 · S3 兼容）
 * @see https://developers.cloudflare.com/r2/api/s3/api/
 */
async function putObjectToR2(
	cfg: R2Config,
	objectKey: string,
	body: ArrayBuffer,
	contentType: string,
): Promise<void> {
	const method = "PUT";
	const host = `${cfg.accountId}.r2.cloudflarestorage.com`;
	const pathname = `/${cfg.bucket}/${encodeObjectKey(objectKey)}`;
	const region = "auto";
	const service = "s3";
	const now = new Date();
	const amzDate = now
		.toISOString()
		.replace(/[-:]/g, "")
		.replace(/\.\d{3}Z$/, "Z");
	const dateStamp = amzDate.slice(0, 8);
	const payloadHash = await sha256Hex(body);

	const canonicalHeaders = [
		`content-type:${contentType}`,
		`host:${host}`,
		`x-amz-content-sha256:${payloadHash}`,
		`x-amz-date:${amzDate}`,
		"",
	].join("\n");
	const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
	const canonicalRequest = [
		method,
		pathname,
		"",
		canonicalHeaders,
		signedHeaders,
		payloadHash,
	].join("\n");

	const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
	const stringToSign = [
		"AWS4-HMAC-SHA256",
		amzDate,
		credentialScope,
		await sha256Hex(canonicalRequest),
	].join("\n");

	const enc = new TextEncoder();
	const kDate = await hmacSha256(
		enc.encode(`AWS4${cfg.secretAccessKey}`),
		dateStamp,
	);
	const kRegion = await hmacSha256(kDate, region);
	const kService = await hmacSha256(kRegion, service);
	const kSigning = await hmacSha256(kService, "aws4_request");
	const signature = toHex(await hmacSha256(kSigning, stringToSign));

	const authorization = [
		`AWS4-HMAC-SHA256 Credential=${cfg.accessKeyId}/${credentialScope}`,
		`SignedHeaders=${signedHeaders}`,
		`Signature=${signature}`,
	].join(", ");

	const res = await fetch(`https://${host}${pathname}`, {
		method,
		headers: {
			Host: host,
			"Content-Type": contentType,
			"x-amz-content-sha256": payloadHash,
			"x-amz-date": amzDate,
			Authorization: authorization,
		},
		body,
	});

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(
			`R2 HTTP ${res.status}${text ? `: ${text.slice(0, 200)}` : ""}`,
		);
	}
}

async function deleteObjectFromCos(
	cfg: CosConfig,
	objectKey: string,
): Promise<void> {
	const host = `${cfg.bucket}.cos.${cfg.region}.myqcloud.com`;
	const pathname = `/${encodeObjectKey(objectKey)}`;
	const headers: Record<string, string> = { host };
	const authorization = await cosAuthorization({
		secretId: cfg.secretId,
		secretKey: cfg.secretKey,
		method: "DELETE",
		pathname,
		headers,
	});

	const res = await fetch(`https://${host}${pathname}`, {
		method: "DELETE",
		headers: {
			Host: host,
			Authorization: authorization,
		},
	});

	// 404：对象已不在，视为删除成功（幂等）
	if (!res.ok && res.status !== 404) {
		const text = await res.text().catch(() => "");
		throw new Error(
			`COS DELETE HTTP ${res.status}${text ? `: ${text.slice(0, 200)}` : ""}`,
		);
	}
}

async function deleteObjectFromR2(
	cfg: R2Config,
	objectKey: string,
): Promise<void> {
	const method = "DELETE";
	const host = `${cfg.accountId}.r2.cloudflarestorage.com`;
	const pathname = `/${cfg.bucket}/${encodeObjectKey(objectKey)}`;
	const region = "auto";
	const service = "s3";
	const now = new Date();
	const amzDate = now
		.toISOString()
		.replace(/[-:]/g, "")
		.replace(/\.\d{3}Z$/, "Z");
	const dateStamp = amzDate.slice(0, 8);
	const payloadHash = await sha256Hex("");

	const canonicalHeaders = [
		`host:${host}`,
		`x-amz-content-sha256:${payloadHash}`,
		`x-amz-date:${amzDate}`,
		"",
	].join("\n");
	const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
	const canonicalRequest = [
		method,
		pathname,
		"",
		canonicalHeaders,
		signedHeaders,
		payloadHash,
	].join("\n");

	const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
	const stringToSign = [
		"AWS4-HMAC-SHA256",
		amzDate,
		credentialScope,
		await sha256Hex(canonicalRequest),
	].join("\n");

	const enc = new TextEncoder();
	const kDate = await hmacSha256(
		enc.encode(`AWS4${cfg.secretAccessKey}`),
		dateStamp,
	);
	const kRegion = await hmacSha256(kDate, region);
	const kService = await hmacSha256(kRegion, service);
	const kSigning = await hmacSha256(kService, "aws4_request");
	const signature = toHex(await hmacSha256(kSigning, stringToSign));

	const authorization = [
		`AWS4-HMAC-SHA256 Credential=${cfg.accessKeyId}/${credentialScope}`,
		`SignedHeaders=${signedHeaders}`,
		`Signature=${signature}`,
	].join(", ");

	const res = await fetch(`https://${host}${pathname}`, {
		method,
		headers: {
			Host: host,
			"x-amz-content-sha256": payloadHash,
			"x-amz-date": amzDate,
			Authorization: authorization,
		},
	});

	if (!res.ok && res.status !== 404) {
		const text = await res.text().catch(() => "");
		throw new Error(
			`R2 DELETE HTTP ${res.status}${text ? `: ${text.slice(0, 200)}` : ""}`,
		);
	}
}

/** 仅允许删除本站图床下 comment/ 前缀对象，防任意路径删除 */
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
	let path = decodeURIComponent(parsed.pathname);
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
		return new Response(
			JSON.stringify({ error: "Image must be under 5MB" }),
			{ status: 413, headers: { "Content-Type": "application/json" } },
		);
	}

	const key = objectKeyFor(file);
	const body = await file.arrayBuffer();
	try {
		if (cfg.kind === "r2") {
			await putObjectToR2(cfg, key, body, file.type);
		} else {
			await putObjectToCos(cfg, key, body, file.type);
		}
	} catch (e) {
		return new Response(
			JSON.stringify({
				error: e instanceof Error ? e.message : "Upload failed",
			}),
			{ status: 502, headers: { "Content-Type": "application/json" } },
		);
	}

	const url = `${cfg.publicBaseUrl}/${encodeObjectKey(key)}`;
	return new Response(JSON.stringify({ url }), {
		headers: { "Content-Type": "application/json; charset=utf-8" },
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
	try {
		const q = new URL(request.url).searchParams.get("url");
		if (q) rawUrl = q;
	} catch {
		/* ignore */
	}
	if (!rawUrl) {
		try {
			const body = (await request.json()) as { url?: unknown };
			if (typeof body?.url === "string") rawUrl = body.url;
		} catch {
			/* ignore */
		}
	}
	rawUrl = rawUrl.trim();
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

	try {
		if (cfg.kind === "r2") {
			await deleteObjectFromR2(cfg, key);
		} else {
			await deleteObjectFromCos(cfg, key);
		}
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
