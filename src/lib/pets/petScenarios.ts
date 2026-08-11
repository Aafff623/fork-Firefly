/**
 * 桌宠页面 persona 与动作优先级。
 * 路由到达后查表播 onEnterAction；文章跟读分档见 resolvePostReadMood。
 */

import type { PetAnimationState } from "@/lib/pets/petAnimation";

export type PetPagePersona =
	| "home"
	| "post"
	| "gallery"
	| "friends"
	| "search"
	| "notFound"
	| "other";

export type PetScenarioPriority =
	| "hard" // 404 / fail
	| "route" // 换班 / 路由进入
	| "ui" // 站点控件点击
	| "ambient"; // 长闲置 / 跟读

export type PetPagePersonaDef = Readonly<{
	id: PetPagePersona;
	/** 进入该页后优先播的动作（换班完成后再播） */
	onEnterAction: PetAnimationState;
	/** 浏览态是否允许贴卡游走（文章强制 false） */
	roamAllowed: boolean;
}>;

export const PET_PAGE_PERSONAS: Readonly<
	Record<PetPagePersona, PetPagePersonaDef>
> = {
	home: {
		id: "home",
		onEnterAction: "waving",
		roamAllowed: true,
	},
	post: {
		id: "post",
		onEnterAction: "review",
		roamAllowed: false,
	},
	gallery: {
		id: "gallery",
		onEnterAction: "review",
		roamAllowed: true,
	},
	friends: {
		id: "friends",
		onEnterAction: "waving",
		roamAllowed: true,
	},
	search: {
		id: "search",
		onEnterAction: "waiting",
		roamAllowed: true,
	},
	notFound: {
		id: "notFound",
		onEnterAction: "failed",
		roamAllowed: false,
	},
	other: {
		id: "other",
		onEnterAction: "waving",
		roamAllowed: true,
	},
};

const PRIORITY_RANK: Record<PetScenarioPriority, number> = {
	hard: 4,
	route: 3,
	ui: 2,
	ambient: 1,
};

export function resolvePetPagePersona(
	pathname: string,
	is404 = false,
): PetPagePersona {
	if (is404) return "notFound";
	if (/\/posts\//.test(pathname)) return "post";
	if (/\/gallery(\/|$)/.test(pathname)) return "gallery";
	if (/\/friends(\/|$)/.test(pathname)) return "friends";
	if (/\/search(\/|$)/.test(pathname)) return "search";
	// 首页分页：/ 或 /page/...
	if (pathname === "/" || /^\/page(\/|$)/.test(pathname)) return "home";
	return "other";
}

export function getPetPagePersonaDef(
	pathname: string,
	is404 = false,
): PetPagePersonaDef {
	return PET_PAGE_PERSONAS[resolvePetPagePersona(pathname, is404)];
}

/**
 * 文章跟读进度 → 情绪动作。
 * progress ∈ [0, 1]（文档滚动比例）。
 */
export function resolvePostReadMood(
	progress: number,
): PetAnimationState | null {
	if (!Number.isFinite(progress)) return null;
	const p = Math.min(1, Math.max(0, progress));
	if (p < 0.15) return "waving";
	if (p >= 0.85) return "waiting";
	if (p >= 0.35 && p < 0.75) return "review";
	return null;
}

/** 同刻只允许更高或相等优先级打断；返回是否可播 */
export function canPlayByPriority(
	active: PetScenarioPriority | null,
	incoming: PetScenarioPriority,
): boolean {
	if (active == null) return true;
	return PRIORITY_RANK[incoming] >= PRIORITY_RANK[active];
}
