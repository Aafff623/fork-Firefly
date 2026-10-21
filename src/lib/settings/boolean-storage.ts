/** 简单布尔外观设置的 localStorage 读写；apply/DOM 副作用仍由调用方负责。 */

export function readBooleanSetting(key: string, fallback: boolean): boolean {
	if (
		typeof localStorage === "undefined" ||
		typeof localStorage.getItem !== "function"
	) {
		return fallback;
	}
	const stored = localStorage.getItem(key);
	return stored === null ? fallback : stored === "true";
}

/** 返回 false 表示当前环境不可写；调用方据此保留原有「不可写就不 apply」的语义。 */
export function writeBooleanSetting(key: string, value: boolean): boolean {
	if (
		typeof localStorage === "undefined" ||
		typeof localStorage.setItem !== "function"
	) {
		return false;
	}
	localStorage.setItem(key, String(value));
	return true;
}
