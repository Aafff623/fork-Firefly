/** 查询归一化：去空白、小写拉丁、全角标点收敛 */ // 中文注释：匹配前统一形态

export function normalizeQuery(raw: string): string {
	return raw
		.normalize("NFKC")
		.trim()
		.toLowerCase()
		.replace(/\s+/g, "")
		.replace(/[!！?？。.，,、…~～]+$/g, "");
}
