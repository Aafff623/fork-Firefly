/**
 * 评论图删除令牌：HMAC-SHA256(secret, "comment-image-delete-v1|objectKey|exp")。
 * 上传时下发 `exp.signature`，删除时校验签名与有效期；密钥没配独立 secret 时
 * 由调用方传入存储私钥，消息前缀保证不与其他用途共用同一签名空间。
 */

const encoder = new TextEncoder();
const TOKEN_PREFIX = "comment-image-delete-v1";

/** 令牌有效期：够一次会话内的撤销 / 离页清理，过期后要删图只能重新上传。 */
export const COMMENT_IMAGE_DELETE_TTL_MS = 24 * 60 * 60 * 1000;

function toHex(buffer: ArrayBuffer): string {
	return [...new Uint8Array(buffer)]
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
}

async function sign(
	secret: string,
	objectKey: string,
	expiresAt: number,
): Promise<string> {
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const message = `${TOKEN_PREFIX}|${objectKey}|${expiresAt}`;
	return toHex(await crypto.subtle.sign("HMAC", key, encoder.encode(message)));
}

export async function createCommentImageDeleteToken(
	secret: string,
	objectKey: string,
	ttlMs: number = COMMENT_IMAGE_DELETE_TTL_MS,
	now: number = Date.now(),
): Promise<string> {
	const expiresAt = now + ttlMs;
	return `${expiresAt}.${await sign(secret, objectKey, expiresAt)}`;
}

export async function verifyCommentImageDeleteToken(
	secret: string,
	objectKey: string,
	token: string,
	now: number = Date.now(),
): Promise<boolean> {
	const dot = token.indexOf(".");
	if (dot <= 0) return false;
	const expiresAt = Number(token.slice(0, dot));
	const signature = token.slice(dot + 1);
	if (!Number.isFinite(expiresAt) || expiresAt <= now) return false;
	const expected = await sign(secret, objectKey, expiresAt);
	if (signature.length !== expected.length) return false;
	let diff = 0;
	for (let i = 0; i < expected.length; i += 1) {
		diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
	}
	return diff === 0;
}
