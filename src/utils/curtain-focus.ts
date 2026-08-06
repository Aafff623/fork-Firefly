/**
 * 动态 / 相册「幕布」焦点：两侧栏滑出，中间内容推近放大。
 */

function normalizePathname(pathname: string, baseUrl: string): string {
	const base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
	let path = pathname || "/";
	if (base && path.startsWith(base)) {
		path = path.slice(base.length) || "/";
	}
	if (!path.startsWith("/")) path = `/${path}`;
	return path;
}

export function isCurtainFocusPath(
	pathnameOrUrl: string,
	baseUrl: string = import.meta.env.BASE_URL || "/",
): boolean {
	let pathname = pathnameOrUrl;
	try {
		pathname = new URL(pathnameOrUrl, "http://local.invalid").pathname;
	} catch {
		/* keep raw */
	}
	const path = normalizePathname(pathname, baseUrl);
	// 仅 gallery 收侧栏沉浸式；dynamic 需要右侧时间轴索引，不收
	return /^\/gallery(\/|$)/.test(path);
}

export function setCurtainFocus(enabled: boolean): boolean {
	const root = document.documentElement;
	const wasEnabled = root.classList.contains("curtain-focus");
	root.classList.toggle("curtain-focus", enabled);
	document.body.classList.toggle("curtain-focus", enabled);
	return wasEnabled !== enabled;
}

/** 按目标 URL 同步幕布状态；返回是否发生变化 */
export function syncCurtainFocusFromUrl(pathnameOrUrl: string): boolean {
	return setCurtainFocus(isCurtainFocusPath(pathnameOrUrl));
}
