/**
 * Built-in site pets (spritesheet atlas).
 * Default dual DeepSeek + visitor-selectable Codex v1 skins.
 * 可选字段为按宠覆盖；缺省跟全局 spritePetConfig。
 */

import type { PetAnimationState } from "@/lib/pets/petAnimation";

export type PetAtlasVariant = "v2" | "classic-8x9";

/** 路由默认双宠 */
export type DualRoutePetId = "maid-deepseek-whale" | "openpet-deepseek";

/** 设置面板可选的单皮（全覆盖时用） */
export type PickerPetId =
	| "diandian--lllucasxu"
	| "claude--xiangking"
	| "elaina--nyakku-shigure"
	| "gpt-muse--opask"
	| "gojo--lilokhalikfa";

export type BuiltinPetId = DualRoutePetId | PickerPetId;

/** localStorage：默认双宠路由，或具体单皮 ID */
export type StoredPetSelection = "default" | PickerPetId;

export type BuiltinPet = {
	id: BuiltinPetId;
	displayName: string;
	/** 设置面板短名（可中文） */
	shortName: string;
	description: string;
	spritesheetPath: string;
	accent: string;
	/** v2 = 8×11 with look rows; classic-8x9 = 8×9 no look */
	atlasVariant: PetAtlasVariant;
	/** 许可备注；Unknown 须在 UI 标黄线 */
	licenseNote: string;
	licenseKind: "mit" | "nc-authorized" | "unknown" | "fan-nc";
	/** 显示宽度覆盖（px）；缺省用 spritePetConfig.size */
	sizePx?: number;
	/** 浏览态卡间停留覆盖（ms）；缺省用 roam.intervalMs；拖后恢复仍用全局 resumeAfterDragMs */
	roamIntervalMs?: number;
	/** idle/ambient 播放变慢倍数（>1 更慢）；不影响点击/拖拽瞬态 */
	idlePaceMultiplier?: number;
	/**
	 * 换卡钻洞时播放的动作（缺省：进洞 running / 出洞按 facing 左右跑）。
	 * 伊蕾娜用 `running`（骑扫帚女巫形态）。
	 */
	portalMotionState?: PetAnimationState;
	/** 淡出前先亮出 portal 动作的时长（ms） */
	portalLeadMs?: number;
	/** 覆盖全局 roam.fadeMs */
	portalFadeMs?: number;
	/** 覆盖全局 roam.portalHoldMs */
	portalHoldMs?: number;
	/** 淡入后保持 portal 动作再收尾的时长（ms） */
	portalExitMs?: number;
	/** 到达后用 portal 动作再播几圈（替代卡的 arrivalAction）；缺省仍用卡配置 */
	portalArrivalLoops?: number;
	/**
	 * 落地多段动作（替代卡 arrivalAction）。
	 * `facing-run` 运行时解析为 running-right / running-left。
	 */
	portalArrivalSequence?: readonly {
		state: PetAnimationState | "facing-run";
		loops?: number;
	}[];
};

export const BUILTIN_PETS: readonly BuiltinPet[] = [
	{
		id: "maid-deepseek-whale",
		displayName: "Maid DeepSeek Whale",
		shortName: "Maid",
		description: "蓝发鲸女仆 chibi，浏览态默认桌宠（Atlas v2）。",
		spritesheetPath: "/pets/maid-deepseek-whale/spritesheet.webp",
		accent: "#5eb8ff",
		atlasVariant: "v2",
		licenseNote: "unknown（DeaDumB / codex-pets）",
		licenseKind: "unknown",
	},
	{
		id: "openpet-deepseek",
		displayName: "OpenPet DeepSeek",
		shortName: "OpenPet",
		description: "蓝发蓝白裙 DeepSeek 娘，文章页桌宠（classic 8×9）。",
		spritesheetPath: "/pets/openpet-deepseek/spritesheet.webp",
		accent: "#7dd3c0",
		atlasVariant: "classic-8x9",
		licenseNote: "openpet-ai-girls 无 LICENSE",
		licenseKind: "unknown",
	},
	{
		id: "diandian--lllucasxu",
		displayName: "Diandian",
		shortName: "点点",
		description: "安静蜷缩的三花猫（Codex v1）。",
		spritesheetPath: "/pets/diandian--lllucasxu/spritesheet.webp",
		accent: "#c4a484",
		atlasVariant: "classic-8x9",
		licenseNote: "MIT · LLLucasXU",
		licenseKind: "mit",
		// 换卡：先跑 → 到 B → 再跑 → 停 → 蜷睡；朝向跟卡左右
		portalLeadMs: 520,
		portalExitMs: 520,
		portalArrivalSequence: [
			{ state: "facing-run", loops: 2 },
			{ state: "waiting", loops: 1 },
			{ state: "idle", loops: 2 },
		],
	},
	{
		id: "claude--xiangking",
		displayName: "Claude",
		shortName: "Claude",
		description: "橘色方块 Claude 吉祥物（Codex v1）。",
		spritesheetPath: "/pets/claude--xiangking/spritesheet.webp",
		accent: "#d97757",
		atlasVariant: "classic-8x9",
		licenseNote: "MIT · xiangking",
		licenseKind: "mit",
		// 吉祥物略小，约 DeepSeek 的 75%
		sizePx: 96,
	},
	{
		id: "elaina--nyakku-shigure",
		displayName: "Elaina",
		shortName: "伊蕾娜",
		description: "旅行魔女伊蕾娜灵感（Codex v1）。",
		spritesheetPath: "/pets/elaina--nyakku-shigure/spritesheet.webp",
		accent: "#a78bfa",
		atlasVariant: "classic-8x9",
		licenseNote: "非商业再分发已授权 · Nyakku Shigure",
		licenseKind: "nc-authorized",
		// 待机动作变慢，减少「换动作太勤」感
		idlePaceMultiplier: 1.8,
		// 换卡时切骑扫帚女巫形态，并略加长钻洞段
		portalMotionState: "running",
		portalLeadMs: 720,
		portalFadeMs: 520,
		portalHoldMs: 280,
		portalExitMs: 720,
		portalArrivalLoops: 2,
	},
	{
		id: "gpt-muse--opask",
		displayName: "GPT-muse",
		shortName: "GPT-muse",
		description: "银白发蓝绿装饰 Codex 拟人同伴（Codex v1）。",
		spritesheetPath: "/pets/gpt-muse--opask/spritesheet.webp",
		accent: "#5eead4",
		atlasVariant: "classic-8x9",
		licenseNote: "awesome-codex-pet 素材默认 CC BY-NC 4.0",
		licenseKind: "nc-authorized",
	},
	{
		id: "gojo--lilokhalikfa",
		displayName: "Gojo",
		shortName: "Gojo",
		description: "黑眼罩白发 Q 版（Codex v1）。",
		spritesheetPath: "/pets/gojo--lilokhalikfa/spritesheet.webp",
		accent: "#818cf8",
		atlasVariant: "classic-8x9",
		licenseNote: "非商业再分发已授权 · lilokhalikfa",
		licenseKind: "nc-authorized",
	},
] as const;

/** 设置面板可选单皮（不含默认双宠路由里的 Maid/OpenPet） */
export const PICKER_PET_IDS: readonly PickerPetId[] = [
	"diandian--lllucasxu",
	"claude--xiangking",
	"elaina--nyakku-shigure",
	"gpt-muse--opask",
	"gojo--lilokhalikfa",
] as const;

export function findBuiltinPet(id: string): BuiltinPet {
	return BUILTIN_PETS.find((pet) => pet.id === id) ?? BUILTIN_PETS[0];
}

export function isPickerPetId(id: string): id is PickerPetId {
	return (PICKER_PET_IDS as readonly string[]).includes(id);
}

export function listPickerPets(): BuiltinPet[] {
	return PICKER_PET_IDS.map((id) => findBuiltinPet(id));
}

/** Browse = Maid; article `/posts/` = OpenPet（仅 default 模式） */
export function resolvePetIdForPath(
	pathname: string,
	defaultPetId: DualRoutePetId,
	postPetId: DualRoutePetId,
): DualRoutePetId {
	return /\/posts\//.test(pathname) ? postPetId : defaultPetId;
}
