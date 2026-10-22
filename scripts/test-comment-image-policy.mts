import assert from "node:assert/strict";
import {
	createCommentImageDeleteToken,
	verifyCommentImageDeleteToken,
} from "../src/lib/comment-image-token";
import { hasImageSignature } from "../src/lib/image-signature";

const png = new Uint8Array([
	0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d, 0x49, 0x48,
	0x44, 0x52,
]);
/** 魔数对、但第一块不是 IHDR 的多态文件 */
const pngWithoutIhdr = new Uint8Array([
	0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d, 0x3c, 0x68,
	0x74, 0x6d,
]);
const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0]);
const gif = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
const webp = new Uint8Array([
	0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
]);
const avif = new Uint8Array([
	0, 0, 0, 0x1c, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66,
]);

assert.equal(hasImageSignature(png, "image/png"), true);
assert.equal(
	hasImageSignature(pngWithoutIhdr, "image/png"),
	false,
	"PNG magic alone is not enough — first chunk must be IHDR",
);
assert.equal(hasImageSignature(jpeg, "image/jpeg"), true);
assert.equal(hasImageSignature(gif, "image/gif"), true);
assert.equal(
	hasImageSignature(
		new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x30, 0x61]),
		"image/gif",
	),
	false,
	"GIF version must be 87a/89a",
);
assert.equal(hasImageSignature(webp, "image/webp"), true);
assert.equal(hasImageSignature(avif, "image/avif"), true);
assert.equal(
	hasImageSignature(
		new TextEncoder().encode("<html>not an image</html>"),
		"image/png",
	),
	false,
	"HTML disguised as PNG must be rejected",
);

const secret = "test-delete-secret";
const objectKey = "comment/2026/10/example.png";
const token = await createCommentImageDeleteToken(secret, objectKey);
assert.equal(
	await verifyCommentImageDeleteToken(secret, objectKey, token),
	true,
);
assert.equal(
	await verifyCommentImageDeleteToken(
		secret,
		"comment/2026/10/other.png",
		token,
	),
	false,
	"token must be bound to object key",
);
assert.equal(
	await verifyCommentImageDeleteToken("other-secret", objectKey, token),
	false,
	"token must be bound to secret",
);
assert.equal(
	await verifyCommentImageDeleteToken(
		secret,
		objectKey,
		`${token.slice(0, -1)}${token.endsWith("0") ? "1" : "0"}`,
	),
	false,
	"tampered token must be rejected",
);

const expired = await createCommentImageDeleteToken(secret, objectKey, -1000);
assert.equal(
	await verifyCommentImageDeleteToken(secret, objectKey, expired),
	false,
	"expired token must be rejected",
);
const stillValid = await createCommentImageDeleteToken(
	secret,
	objectKey,
	60_000,
);
assert.equal(
	await verifyCommentImageDeleteToken(secret, objectKey, stillValid),
	true,
	"token inside its ttl verifies",
);
assert.equal(
	await verifyCommentImageDeleteToken(secret, objectKey, "no-dot"),
	false,
	"malformed token must be rejected",
);

console.log("PASS comment image signature + delete token");
