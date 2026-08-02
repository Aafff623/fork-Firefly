/** 与 Giscus 导航栏 / 置顶管理共用的园主会话键 */

export const VIEWER_KEY = "firefly-giscus-viewer";
export const SESSION_KEY = "giscus-session";
/** 本地开发伪园主标记（不依赖真实 Giscus 登录） */
export const DEV_OWNER_KEY = "firefly-dev-owner";

export interface AdminViewer {
	login: string;
	avatarUrl: string;
	url: string;
}

export function isDevOwnerSession(): boolean {
	try {
		return localStorage.getItem(DEV_OWNER_KEY) === "1";
	} catch {
		return false;
	}
}

/** 本地开发：自动写入园主配置，便于调试置顶等能力 */
export function ensureDevOwnerSession(adminLogins: string[]): AdminViewer | null {
	if (!import.meta.env.DEV) return null;
	const login = adminLogins[0]?.trim();
	if (!login) return null;

	const viewer: AdminViewer = {
		login,
		avatarUrl: `https://github.com/${login}.png`,
		url: `https://github.com/${login}`,
	};

	try {
		localStorage.setItem(DEV_OWNER_KEY, "1");
		// 兼容现有「有 session 才显示头像」逻辑
		if (!localStorage.getItem(SESSION_KEY)) {
			localStorage.setItem(SESSION_KEY, "dev-owner");
		}
		localStorage.setItem(VIEWER_KEY, JSON.stringify(viewer));
	} catch {
		// ignore quota / private mode
	}

	return viewer;
}

export function readAdminViewer(adminLogins: string[]): {
	viewer: AdminViewer | null;
	isAdmin: boolean;
} {
	try {
		const raw = localStorage.getItem(VIEWER_KEY);
		if (!raw) return { viewer: null, isAdmin: false };
		const viewer = JSON.parse(raw) as AdminViewer;
		if (!viewer?.login) return { viewer: null, isAdmin: false };
		const isAdmin = adminLogins.some(
			(login) => login.toLowerCase() === viewer.login.toLowerCase(),
		);
		return { viewer, isAdmin };
	} catch {
		return { viewer: null, isAdmin: false };
	}
}
