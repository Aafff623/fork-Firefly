/**
 * Waline 自定义图片上传代理（服务端持腾讯云 COS 密钥）。
 * GET  → { enabled }
 * POST → multipart `image` → { url }
 *
 * 使用 COS XML PutObject + 官方签名算法（Web Crypto），
 * 兼容 Astro Node（本地 / Vercel）与 CF Workers，不引入 cos SDK。
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
	secretId: string;
	secretKey: string;
	bucket: string;
	region: string;
	publicBaseUrl: string;
};

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
	return { secretId, secretKey, bucket, region, publicBaseUrl };
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

async function hmacSha1Hex(
	key: string,
	message: string,
): Promise<string> {
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
	const httpHeaders = headerEntries.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");

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
	return new Response(JSON.stringify({ enabled: !!getCosConfig() }), {
		headers: { "Content-Type": "application/json; charset=utf-8" },
	});
};

export const POST: APIRoute = async ({ request }) => {
	const cfg = getCosConfig();
	if (!cfg) {
		return new Response(
			JSON.stringify({
				error: "COS credentials not configured",
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
	try {
		await putObjectToCos(cfg, key, await file.arrayBuffer(), file.type);
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
