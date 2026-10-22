/** 图片字节签名校验：客户端声明的 MIME 不可信，服务端必须看文件头。 */
export function hasImageSignature(bytes: Uint8Array, mime: string): boolean {
	if (mime === "image/png") {
		return (
			bytes.length >= 16 &&
			bytes[0] === 0x89 &&
			bytes[1] === 0x50 &&
			bytes[2] === 0x4e &&
			bytes[3] === 0x47 &&
			bytes[4] === 0x0d &&
			bytes[5] === 0x0a &&
			bytes[6] === 0x1a &&
			bytes[7] === 0x0a &&
			// 第一块必须是 IHDR；只有魔数的多态文件过不了
			bytes[12] === 0x49 &&
			bytes[13] === 0x48 &&
			bytes[14] === 0x44 &&
			bytes[15] === 0x52
		);
	}
	if (mime === "image/jpeg") {
		return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
	}
	if (mime === "image/gif") {
		return (
			bytes.length >= 6 &&
			bytes[0] === 0x47 &&
			bytes[1] === 0x49 &&
			bytes[2] === 0x46 &&
			bytes[3] === 0x38 &&
			// "GIF87a" / "GIF89a"
			(bytes[4] === 0x37 || bytes[4] === 0x39) &&
			bytes[5] === 0x61
		);
	}
	if (mime === "image/webp") {
		return (
			bytes[0] === 0x52 &&
			bytes[1] === 0x49 &&
			bytes[2] === 0x46 &&
			bytes[3] === 0x46 &&
			bytes[8] === 0x57 &&
			bytes[9] === 0x45 &&
			bytes[10] === 0x42 &&
			bytes[11] === 0x50
		);
	}
	if (mime === "image/avif") {
		return new TextDecoder().decode(bytes.slice(4, 12)).includes("ftypavif");
	}
	return false;
}
