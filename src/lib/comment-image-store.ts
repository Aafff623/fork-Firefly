/** 评论图对象存储 seam：R2（S3 SigV4）优先，COS 回退。 */

export type CosConfig = {
	kind: "cos";
	secretId: string;
	secretKey: string;
	bucket: string;
	region: string;
	publicBaseUrl: string;
};

export type R2Config = {
	kind: "r2";
	accountId: string;
	accessKeyId: string;
	secretAccessKey: string;
	bucket: string;
	publicBaseUrl: string;
};

export type UploadConfig = R2Config | CosConfig;

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
	const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
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
	const cryptoBytes = new Uint8Array(bytes.byteLength);
	cryptoBytes.set(bytes);
	const dig = await crypto.subtle.digest("SHA-256", cryptoBytes.buffer);
	return toHex(dig);
}

async function hmacSha256(
	key: ArrayBuffer | Uint8Array,
	message: string,
): Promise<ArrayBuffer> {
	const keyBytes = new Uint8Array(key.byteLength);
	keyBytes.set(key instanceof Uint8Array ? key : new Uint8Array(key));
	const cryptoKey = await crypto.subtle.importKey(
		"raw",
		keyBytes.buffer,
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
export function encodeObjectKey(key: string): string {
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

export async function putCommentImage(
	cfg: UploadConfig,
	key: string,
	body: ArrayBuffer,
	contentType: string,
): Promise<void> {
	if (cfg.kind === "r2") {
		await putObjectToR2(cfg, key, body, contentType);
		return;
	}
	await putObjectToCos(cfg, key, body, contentType);
}

export async function deleteCommentImageObject(
	cfg: UploadConfig,
	key: string,
): Promise<void> {
	// 纵深防御：API 层已校验，store 也不接受 comment/ 之外的 key
	if (!key.startsWith("comment/") || key.includes("..") || key.includes("//")) {
		throw new Error("Refusing to delete outside comment/");
	}
	if (cfg.kind === "r2") {
		await deleteObjectFromR2(cfg, key);
		return;
	}
	await deleteObjectFromCos(cfg, key);
}
