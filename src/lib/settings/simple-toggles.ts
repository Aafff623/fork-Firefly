/** 设置面板的简单布尔开关 facade：组件只认 id，不再逐个导入 getter/setter。 */
import {
	getDefaultBannerCarouselEnabled,
	getDefaultBannerTitleEnabled,
	getDefaultCardBorderEnabled,
	getDefaultCardFollowThemeEnabled,
	getDefaultGradientEnabled,
	getDefaultNoteCardEnabled,
	getDefaultSakuraEnabled,
	getDefaultWavesEnabled,
	getPetRoamEnabled,
	getStoredBannerCarouselEnabled,
	getStoredBannerTitleEnabled,
	getStoredCardBorderEnabled,
	getStoredCardFollowThemeEnabled,
	getStoredGradientEnabled,
	getStoredNoteCardEnabled,
	getStoredSakuraEnabled,
	getStoredWavesEnabled,
	setBannerCarouselEnabled,
	setBannerTitleEnabled,
	setCardBorderEnabled,
	setCardFollowThemeEnabled,
	setGradientEnabled,
	setNoteCardEnabled,
	setPetRoamEnabled,
	setSakuraEnabled,
	setWavesEnabled,
} from "@/utils/setting-utils";

export const SIMPLE_TOGGLE_IDS = [
	"waves",
	"gradient",
	"bannerTitle",
	"bannerCarousel",
	"sakura",
	"petRoam",
	"cardBorder",
	"cardFollowTheme",
	"noteCard",
] as const;

export type SimpleToggleId = (typeof SIMPLE_TOGGLE_IDS)[number];

type Entry = {
	defaultValue: () => boolean;
	storedValue: () => boolean;
	apply: (value: boolean) => void;
};

const ENTRIES: Record<SimpleToggleId, Entry> = {
	waves: {
		defaultValue: getDefaultWavesEnabled,
		storedValue: getStoredWavesEnabled,
		apply: setWavesEnabled,
	},
	gradient: {
		defaultValue: getDefaultGradientEnabled,
		storedValue: getStoredGradientEnabled,
		apply: setGradientEnabled,
	},
	bannerTitle: {
		defaultValue: getDefaultBannerTitleEnabled,
		storedValue: getStoredBannerTitleEnabled,
		apply: setBannerTitleEnabled,
	},
	bannerCarousel: {
		defaultValue: getDefaultBannerCarouselEnabled,
		storedValue: getStoredBannerCarouselEnabled,
		apply: setBannerCarouselEnabled,
	},
	sakura: {
		defaultValue: getDefaultSakuraEnabled,
		storedValue: getStoredSakuraEnabled,
		apply: setSakuraEnabled,
	},
	petRoam: {
		defaultValue: () => true,
		storedValue: getPetRoamEnabled,
		apply: setPetRoamEnabled,
	},
	cardBorder: {
		defaultValue: getDefaultCardBorderEnabled,
		storedValue: getStoredCardBorderEnabled,
		apply: setCardBorderEnabled,
	},
	cardFollowTheme: {
		defaultValue: getDefaultCardFollowThemeEnabled,
		storedValue: getStoredCardFollowThemeEnabled,
		apply: setCardFollowThemeEnabled,
	},
	noteCard: {
		defaultValue: getDefaultNoteCardEnabled,
		storedValue: getStoredNoteCardEnabled,
		apply: setNoteCardEnabled,
	},
};

export function getSimpleToggleDefaults(): Record<SimpleToggleId, boolean> {
	return Object.fromEntries(
		SIMPLE_TOGGLE_IDS.map((id) => [id, ENTRIES[id].defaultValue()]),
	) as Record<SimpleToggleId, boolean>;
}

export function readSimpleToggle(id: SimpleToggleId): boolean {
	return ENTRIES[id].storedValue();
}

/** 返回 false 表示当前环境写不进去（无 localStorage / 存储异常），调用方据此回滚 UI。 */
export function writeSimpleToggle(id: SimpleToggleId, value: boolean): boolean {
	if (
		typeof localStorage === "undefined" ||
		typeof localStorage.setItem !== "function"
	) {
		return false;
	}
	try {
		ENTRIES[id].apply(value);
		return true;
	} catch {
		return false;
	}
}
