/** 评论图删除令牌：HMAC-SHA256(secret, objectKey)，上传时下发、删除时校验。 */

const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer): string {
	return [...new Uint8Array(buffer)]
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
}

async function sign(secret: string, objectKey: string): Promise<string> {
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	return toHex(
		await crypto.subtle.sign("HMAC", key, encoder.encode(objectKey)),
	);
}

export async function createCommentImageDeleteToken(
	secret: string,
	objectKey: string,
): Promise<string> {
	return sign(secret, objectKey);
}

export async function verifyCommentImageDeleteToken(
	secret: string,
	objectKey: string,
	token: string,
): Promise<boolean> {
	const expected = await sign(secret, objectKey);
	if (token.length !== expected.length) return false;
	let diff = 0;
	for (let i = 0; i < expected.length; i += 1) {
		diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
	}
	return diff === 0;
}
