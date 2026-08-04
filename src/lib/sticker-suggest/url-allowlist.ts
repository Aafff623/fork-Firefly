/** 梗图 URL 白名单 */ // 中文注释：只允许可信 CDN / 本站 COS

const ALLOWED_HOST_SUFFIXES = [
	"unpkg.com",
	"cdn.jsdelivr.net",
	"myqcloud.com",
];

export function isAllowedStickerUrl(url: string): boolean {
	try {
		const u = new URL(url);
		if (u.protocol !== "https:") return false;
		const host = u.hostname.toLowerCase();
		return ALLOWED_HOST_SUFFIXES.some(
			(suffix) => host === suffix || host.endsWith(`.${suffix}`),
		);
	} catch {
		return false;
	}
}

export function filterAllowedItems<T extends { src: string; preview?: string }>(
	items: T[],
): T[] {
	return items.filter((item) => {
		if (!isAllowedStickerUrl(item.src)) return false;
		if (item.preview && !isAllowedStickerUrl(item.preview)) return false;
		return true;
	});
}
