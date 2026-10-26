/**
 * 设置登记表（architecture-deepening-2 / 票 10）。
 *
 * 每个设置项一行：id、存储键、默认值、门控、DOM 应用、广播事件。
 * 对外只有 read / apply / applyAll / set / subscribe（外加面板重置要用的 defaultOf
 * 与首屏序列化 serializeBootState）。storage / root / now / emit 全部注入，
 * node 里用假对象即可测试，不需要真实浏览器。
 *
 * 键名、门控、应用顺序、事件名只在这里写；默认值与 DOM 应用细节复用 setting-utils
 * 的 getter / apply*ToDocument 作为适配器（老函数名保留，迁移期间调用方不用全改）。
 */

import {
	DARK_MODE,
	LIGHT_MODE,
	SYSTEM_MODE,
	TIME_MODE,
	WALLPAPER_BANNER,
	WALLPAPER_FULLSCREEN,
	WALLPAPER_NONE,
	WALLPAPER_OVERLAY,
} from "@constants/constants";
import {
	backgroundWallpaper,
	displaySettingsConfig,
	expressiveCodeConfig,
	profileConfig,
} from "@/config";
import { isPickerPetId } from "@/lib/pets/builtinPets";
import type { LIGHT_DARK_MODE, WALLPAPER_MODE } from "@/types/config";
import type { AvatarFrameId } from "@/types/profileConfig";
import {
	applyBannerCarouselEnabledToDocument,
	applyBannerTitleEnabledToDocument,
	applyGradientEnabledToDocument,
	applyOverlayCardOpacityToDocument,
	applyThemeToDocument,
	applyWallpaperModeToDocument,
	applyWavesEnabledToDocument,
	getDefaultAvatarFrameId,
	getDefaultBannerCarouselEnabled,
	getDefaultBannerTitleEnabled,
	getDefaultCardBorderEnabled,
	getDefaultCardFollowThemeEnabled,
	getDefaultGradientEnabled,
	getDefaultNoteCardEnabled,
	getDefaultOverlayCardOpacity,
	getDefaultPetSelection,
	getDefaultSakuraEnabled,
	getDefaultTheme,
	getDefaultWavesEnabled,
	getThemeTimeZone,
	getTimeScheduleHours,
	getZonedHour,
	isDarkHour,
} from "@/utils/setting-utils";

export type SettingValue = string | number | boolean;

/** 设置面板里的 9 个简单布尔开关（simple-toggles 的视图 id 不变）。 */
export const BOOLEAN_SETTING_IDS = [
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

export type BooleanSettingId = (typeof BOOLEAN_SETTING_IDS)[number];

export type SettingId =
	| "theme"
	| "wallpaper"
	| "overlayCardOpacity"
	| "avatarFrame"
	| "petId"
	| BooleanSettingId;

/** 全部登记项：主题 / 壁纸 / overlay 卡透明度 / 头像框 / 选宠 + 9 个布尔。 */
export const SETTING_IDS: readonly SettingId[] = [
	"theme",
	"wallpaper",
	"overlayCardOpacity",
	"avatarFrame",
	"petId",
	...BOOLEAN_SETTING_IDS,
];

/** 只用到 get / set / remove 三种能力；没有 localStorage 时整体不可写。 */
export type SettingsStorage = Readonly<{
	getItem: (key: string) => string | null;
	setItem: (key: string, value: string) => void;
	removeItem?: (key: string) => void;
}>;

export type SettingsRootElement = Readonly<{
	classList: {
		add: (...names: string[]) => void;
		remove: (...names: string[]) => void;
	};
	setAttribute: (name: string, value: string) => void;
	style: {
		setProperty: (name: string, value: string) => void;
	};
}>;

/** document 的最小投影：真浏览器传 document，测试传假对象。 */
export type SettingsRoot = Readonly<{
	documentElement: SettingsRootElement;
	body?: SettingsRootElement | null;
	getElementById?: (id: string) => SettingsRootElement | null;
	querySelector?: (selector: string) => SettingsRootElement | null;
	matchMedia?: (query: string) => { matches: boolean };
}>;

export type SettingsRegistryDeps = Readonly<{
	/** 缺省读取全局 localStorage；显式 null 表示测试里「没有存储」。 */
	storage?: SettingsStorage | null;
	/** 缺省取真实 document；显式 null 表示不碰 DOM。 */
	root?: SettingsRoot | null;
	now?: () => Date;
	/** 写入成功后对外广播；缺省派发 window CustomEvent。 */
	emit?: (type: string, detail: Record<string, unknown>) => void;
}>;

export type SettingsRegistry = Readonly<{
	read: (id: SettingId) => SettingValue;
	/** 只做 DOM 应用，不落盘；value 缺省取当前读取值。 */
	apply: (id: SettingId, value?: SettingValue) => void;
	/** 按登记表顺序把当前值全部应用一遍（首屏后的补课 / 软导航后同步）。 */
	applyAll: () => void;
	/** 落盘 + 应用 + 广播；返回 false 表示当前环境写不进去（无存储 / 配额异常）。 */
	set: (id: SettingId, value: SettingValue) => boolean;
	subscribe: (
		id: SettingId,
		listener: (value: SettingValue) => void,
	) => () => void;
	/** 站点默认值（面板「恢复默认」用），不受存储影响。 */
	defaultOf: (id: SettingId) => SettingValue;
}>;

type SettingsRow = Readonly<{
	id: SettingId;
	storageKey: string;
	defaultValue: () => SettingValue;
	/** 存储值是否生效；false 时 read 直接回落到 gatedValue / 默认值。 */
	gate?: () => boolean;
	/** 门控关闭时的回落值，缺省用 defaultValue。 */
	gatedValue?: () => SettingValue;
	/** 存储串 → 值；返回 null 表示无效，回落默认值。 */
	parse?: (raw: string) => SettingValue | null;
	/** 自定义读取（如樱花「钉住优先」），优先于 storageKey + parse。 */
	read?: (storage: SettingsStorage | null) => SettingValue;
	/** 自定义写入（如樱花要同时维护 pinned 键）。 */
	write?: (storage: SettingsStorage, value: SettingValue) => void;
	apply: (root: SettingsRoot, value: SettingValue, now: () => Date) => void;
	event?: string;
	eventDetail?: (value: SettingValue) => Record<string, unknown>;
}>;

// ── 站点配置派生 ───────────────────────────────────────────

const THEME_MODES: readonly string[] = [
	LIGHT_MODE,
	DARK_MODE,
	SYSTEM_MODE,
	TIME_MODE,
];
const WALLPAPER_MODES: readonly string[] = [
	WALLPAPER_BANNER,
	WALLPAPER_FULLSCREEN,
	WALLPAPER_OVERLAY,
	WALLPAPER_NONE,
];

function avatarFrameIds(): AvatarFrameId[] {
	const frames = (profileConfig.avatarFrame?.frames ?? []).map(
		(frame) => frame.id,
	);
	return ["none", ...frames];
}

function isAvatarFrameValue(value: string): value is AvatarFrameId {
	return (avatarFrameIds() as string[]).includes(value);
}

function isWallpaperMode(value: string): value is WALLPAPER_MODE {
	return WALLPAPER_MODES.includes(value);
}

function isThemeMode(value: string): value is LIGHT_DARK_MODE {
	return THEME_MODES.includes(value);
}

function clamp01(value: number): number {
	return Math.min(1, Math.max(0, value));
}

function defaultOverlayCardOpacity(): number {
	// 与运行期一致：面板关闭时 setting-utils 也回落到 overlay.cardOpacity。
	// 首屏此前用 atmosphere.cardOpacity（0.84），init 后又被换成 overlay 值，
	// 会闪一下；登记表只保留一个默认值。
	return getDefaultOverlayCardOpacity();
}

function isOverlayCardOpacitySwitchable(): boolean {
	const cfg = displaySettingsConfig.overlaySwitchable;
	if (cfg === false) return false;
	if (cfg === true) return true;
	return cfg.cardOpacity === true;
}

// ── 根 / 存储 / 广播的默认实现 ─────────────────────────────

function browserStorage(): SettingsStorage | null {
	const candidate = (
		globalThis as { localStorage?: Partial<SettingsStorage> | null }
	).localStorage;
	if (
		!candidate ||
		typeof candidate.getItem !== "function" ||
		typeof candidate.setItem !== "function"
	) {
		return null;
	}
	return candidate as SettingsStorage;
}

function liveRoot(): SettingsRoot | null {
	if (typeof document === "undefined") return null;
	return {
		documentElement: document.documentElement,
		body: document.body ?? null,
		getElementById: (id: string) =>
			document.getElementById(id) as SettingsRootElement | null,
		querySelector: (selector: string) =>
			document.querySelector(selector) as SettingsRootElement | null,
		matchMedia: (query: string) =>
			typeof window !== "undefined" && typeof window.matchMedia === "function"
				? window.matchMedia(query)
				: { matches: false },
	};
}

/** 只有「注入的 root 就是真 document」时才交给 setting-utils 的复杂 DOM 适配器。 */
function isLiveRoot(root: SettingsRoot | null): boolean {
	return (
		!!root &&
		typeof document !== "undefined" &&
		root.documentElement === document.documentElement
	);
}

function emitOnWindow(type: string, detail: Record<string, unknown>): void {
	if (typeof window === "undefined" || typeof CustomEvent === "undefined") {
		return;
	}
	window.dispatchEvent(new CustomEvent(type, { detail }));
}

function resolveThemeForRoot(
	theme: string,
	root: SettingsRoot,
	now: () => Date,
): LIGHT_DARK_MODE {
	if (theme === SYSTEM_MODE) {
		return root.matchMedia?.("(prefers-color-scheme: dark)").matches
			? DARK_MODE
			: LIGHT_MODE;
	}
	if (theme === TIME_MODE) {
		const { lightFromHour, darkFromHour } = getTimeScheduleHours();
		return isDarkHour(getZonedHour(now()), lightFromHour, darkFromHour)
			? DARK_MODE
			: LIGHT_MODE;
	}
	return theme === DARK_MODE ? DARK_MODE : LIGHT_MODE;
}

// ── 登记表 ─────────────────────────────────────────────────

const ROWS: readonly SettingsRow[] = [
	{
		id: "theme",
		storageKey: "theme",
		defaultValue: getDefaultTheme,
		parse: (raw) => (isThemeMode(raw) ? raw : null),
		apply: (root, value, now) => {
			const theme: LIGHT_DARK_MODE =
				typeof value === "string" && isThemeMode(value)
					? value
					: getDefaultTheme();
			if (isLiveRoot(root)) {
				applyThemeToDocument(theme);
				return;
			}
			const isDark = resolveThemeForRoot(theme, root, now) === DARK_MODE;
			if (isDark) {
				root.documentElement.classList.add("dark");
			} else {
				root.documentElement.classList.remove("dark");
			}
			root.documentElement.setAttribute(
				"data-theme",
				isDark
					? expressiveCodeConfig.darkTheme
					: expressiveCodeConfig.lightTheme,
			);
		},
		event: "theme-change",
		eventDetail: (value) => ({ theme: value }),
	},
	{
		id: "wallpaper",
		storageKey: "wallpaperMode",
		defaultValue: () => backgroundWallpaper.mode,
		gate: () => displaySettingsConfig.wallpaperModeSwitchable,
		parse: (raw) => (isWallpaperMode(raw) ? raw : null),
		apply: (root, value) => {
			const mode =
				typeof value === "string" && isWallpaperMode(value)
					? value
					: backgroundWallpaper.mode;
			if (isLiveRoot(root)) {
				applyWallpaperModeToDocument(mode);
				return;
			}
			root.documentElement.setAttribute("data-wallpaper-mode", mode);
		},
		event: "wallpaperModeChange",
		eventDetail: (value) => ({ mode: value }),
	},
	{
		id: "overlayCardOpacity",
		storageKey: "overlayCardOpacity",
		defaultValue: defaultOverlayCardOpacity,
		gate: isOverlayCardOpacitySwitchable,
		parse: (raw) => {
			const parsed = Number.parseFloat(raw);
			return Number.isFinite(parsed) ? clamp01(parsed) : null;
		},
		apply: (root, value) => {
			const safe =
				typeof value === "number" && Number.isFinite(value)
					? clamp01(value)
					: defaultOverlayCardOpacity();
			if (isLiveRoot(root)) {
				applyOverlayCardOpacityToDocument(safe);
				return;
			}
			root.documentElement.style.setProperty(
				"--card-transparent-opacity",
				String(safe),
			);
		},
	},
	{
		id: "avatarFrame",
		storageKey: "avatarFrameId",
		defaultValue: getDefaultAvatarFrameId,
		gate: () => profileConfig.avatarFrame?.enabled !== false,
		gatedValue: () => "none",
		parse: (raw) => (isAvatarFrameValue(raw) ? raw : null),
		apply: (root, value) => {
			const id =
				typeof value === "string" && isAvatarFrameValue(value) ? value : "none";
			root.documentElement.setAttribute("data-avatar-frame", id);
		},
		event: "firefly:avatar-frame-change",
		eventDetail: (value) => ({ id: value }),
	},
	{
		id: "petId",
		storageKey: "firefly-sprite-pet-id-v1",
		defaultValue: getDefaultPetSelection,
		parse: (raw) => (raw === "default" || isPickerPetId(raw) ? raw : null),
		// 桌宠换皮由 SpritePet 监听事件完成，没有 DOM 应用。
		apply: () => {},
		event: "firefly:pet-change",
		eventDetail: (value) => ({ petId: value }),
	},
	{
		id: "petRoam",
		storageKey: "petRoamEnabled",
		defaultValue: () => true,
		parse: (raw) => raw !== "false",
		// 奔跑开关同样只广播，动画由 SpritePet 接管。
		apply: () => {},
		event: "firefly:pet-roam-toggle",
		eventDetail: (value) => ({ enabled: value }),
	},
	{
		id: "waves",
		storageKey: "wavesEnabled",
		defaultValue: getDefaultWavesEnabled,
		parse: (raw) => raw === "true",
		apply: (root, value) => {
			const enabled = value === true;
			if (isLiveRoot(root)) {
				applyWavesEnabledToDocument(enabled);
				return;
			}
			root.documentElement.setAttribute("data-waves-enabled", String(enabled));
		},
	},
	{
		id: "gradient",
		storageKey: "gradientEnabled",
		defaultValue: getDefaultGradientEnabled,
		parse: (raw) => raw === "true",
		apply: (root, value) => {
			const enabled = value === true;
			if (isLiveRoot(root)) {
				applyGradientEnabledToDocument(enabled);
				return;
			}
			root.documentElement.setAttribute(
				"data-gradient-enabled",
				String(enabled),
			);
		},
	},
	{
		id: "bannerTitle",
		storageKey: "bannerTitleEnabled",
		defaultValue: getDefaultBannerTitleEnabled,
		parse: (raw) => raw === "true",
		apply: (root, value) => {
			const enabled = value === true;
			if (isLiveRoot(root)) {
				applyBannerTitleEnabledToDocument(enabled);
				return;
			}
			root.documentElement.setAttribute(
				"data-banner-title-enabled",
				String(enabled),
			);
		},
	},
	{
		id: "bannerCarousel",
		storageKey: "bannerCarouselEnabled",
		defaultValue: getDefaultBannerCarouselEnabled,
		gate: () => displaySettingsConfig.bannerCarouselSwitchable,
		parse: (raw) => raw === "true",
		apply: (root, value) => {
			const enabled = value === true;
			if (isLiveRoot(root)) {
				applyBannerCarouselEnabledToDocument(enabled);
				return;
			}
			root.documentElement.setAttribute(
				"data-banner-carousel-enabled",
				String(enabled),
			);
		},
		event: "bannerCarouselChange",
		eventDetail: (value) => ({ enabled: value }),
	},
	{
		id: "sakura",
		storageKey: "sakuraEnabled",
		defaultValue: getDefaultSakuraEnabled,
		read: (storage) => {
			if (storage?.getItem("sakuraPinned") === "true") return true;
			const raw = storage?.getItem("sakuraEnabled") ?? null;
			return raw === null ? getDefaultSakuraEnabled() : raw === "true";
		},
		write: (storage, value) => {
			if (value === true) {
				storage.setItem("sakuraPinned", "true");
				storage.setItem("sakuraEnabled", "true");
				return;
			}
			storage.removeItem?.("sakuraPinned");
			storage.setItem("sakuraEnabled", "false");
		},
		parse: (raw) => raw === "true",
		apply: (root, value) => {
			root.documentElement.setAttribute(
				"data-sakura-enabled",
				String(value === true),
			);
		},
		event: "sakuraToggle",
		eventDetail: (value) => ({ enabled: value }),
	},
	{
		id: "cardBorder",
		storageKey: "cardBorderEnabled",
		defaultValue: getDefaultCardBorderEnabled,
		gate: () => displaySettingsConfig.cardBorderSwitchable,
		parse: (raw) => raw === "true",
		apply: (root, value) => {
			if (value === true) {
				root.documentElement.classList.add("enable-card-border");
			} else {
				root.documentElement.classList.remove("enable-card-border");
			}
		},
	},
	{
		id: "cardFollowTheme",
		storageKey: "cardFollowThemeEnabled",
		defaultValue: getDefaultCardFollowThemeEnabled,
		gate: () => displaySettingsConfig.cardFollowThemeSwitchable,
		// 面板关掉时保持关闭，而不是回落到站点默认（与 setting-utils 一致）。
		gatedValue: () => false,
		parse: (raw) => raw === "true",
		apply: (root, value) => {
			const target = root.body ?? root.documentElement;
			if (value === true) {
				target.classList.add("card-follow-theme-hue");
			} else {
				target.classList.remove("card-follow-theme-hue");
			}
		},
	},
	{
		id: "noteCard",
		storageKey: "noteCardEnabled",
		defaultValue: getDefaultNoteCardEnabled,
		gate: () => displaySettingsConfig.noteCardSwitchable,
		parse: (raw) => raw === "true",
		apply: (root, value) => {
			if (value === false) {
				root.documentElement.classList.add("note-cards-off");
			} else {
				root.documentElement.classList.remove("note-cards-off");
			}
		},
	},
];

const ROW_BY_ID: ReadonlyMap<string, SettingsRow> = new Map(
	ROWS.map((row) => [row.id, row]),
);

function rowFor(id: SettingId): SettingsRow {
	const row = ROW_BY_ID.get(id);
	if (!row) throw new Error(`unknown setting id: ${id}`);
	return row;
}

function normalize(row: SettingsRow, value: SettingValue): SettingValue {
	const parsed = row.parse?.(String(value)) ?? null;
	if (parsed !== null) return parsed;
	if (row.gate && !row.gate()) {
		return row.gatedValue?.() ?? row.defaultValue();
	}
	return row.defaultValue();
}

function readRow(
	row: SettingsRow,
	storage: SettingsStorage | null,
): SettingValue {
	if (row.gate && !row.gate()) {
		return row.gatedValue?.() ?? row.defaultValue();
	}
	if (row.read) return row.read(storage);
	let raw: string | null = null;
	try {
		raw = storage?.getItem(row.storageKey) ?? null;
	} catch {
		return row.defaultValue();
	}
	if (raw === null) return row.defaultValue();
	const parsed = row.parse ? row.parse(raw) : raw;
	return parsed === null ? row.defaultValue() : parsed;
}

// ── 对外接口 ───────────────────────────────────────────────

export function createSettingsRegistry(
	deps: SettingsRegistryDeps = {},
): SettingsRegistry {
	const listeners = new Map<SettingId, Set<(value: SettingValue) => void>>();
	const now = deps.now ?? (() => new Date());
	const emit = deps.emit ?? emitOnWindow;
	const activeStorage = (): SettingsStorage | null =>
		deps.storage === undefined ? browserStorage() : deps.storage;
	const activeRoot = (): SettingsRoot | null =>
		deps.root === undefined ? liveRoot() : deps.root;

	const read = (id: SettingId): SettingValue =>
		readRow(rowFor(id), activeStorage());

	const apply = (id: SettingId, value?: SettingValue): void => {
		const row = rowFor(id);
		const root = activeRoot();
		if (!root) return;
		row.apply(root, value === undefined ? read(id) : value, now);
	};

	const applyAll = (): void => {
		for (const row of ROWS) apply(row.id);
	};

	const set = (id: SettingId, value: SettingValue): boolean => {
		const row = rowFor(id);
		const storage = activeStorage();
		if (!storage) return false;
		const normalized = normalize(row, value);
		try {
			if (row.write) {
				row.write(storage, normalized);
			} else {
				storage.setItem(row.storageKey, String(normalized));
			}
		} catch {
			return false;
		}
		const root = activeRoot();
		if (root) row.apply(root, normalized, now);
		if (row.event) {
			emit(row.event, row.eventDetail ? row.eventDetail(normalized) : {});
		}
		listeners.get(id)?.forEach((listener) => {
			listener(normalized);
		});
		return true;
	};

	const subscribe = (
		id: SettingId,
		listener: (value: SettingValue) => void,
	): (() => void) => {
		const set_ = listeners.get(id) ?? new Set();
		set_.add(listener);
		listeners.set(id, set_);
		return () => {
			set_.delete(listener);
		};
	};

	const defaultOf = (id: SettingId): SettingValue => rowFor(id).defaultValue();

	return { read, apply, applyAll, set, subscribe, defaultOf };
}

/** 浏览器里的单例：simple-toggles 与设置面板共用。 */
export const settings: SettingsRegistry = createSettingsRegistry();

// ── 首屏初始态 ─────────────────────────────────────────────

export type SettingsBootToggle = Readonly<{
	key: string;
	gate: boolean;
	defaultValue: boolean;
	gatedValue: boolean;
}>;

/**
 * 首屏可序列化初始态：只有「键名 / 默认值 / 门控 / 常量」，
 * 不含访客的 localStorage 值（服务端拿不到）。内联脚本用它拼默认值与键名，
 * 仍然同步读 localStorage，保持防闪烁。
 */
export type SettingsBootState = Readonly<{
	keys: Readonly<{
		theme: string;
		wallpaperMode: string;
		overlayCardOpacity: string;
		avatarFrame: string;
	}>;
	defaults: Readonly<{
		theme: LIGHT_DARK_MODE;
		wallpaperMode: WALLPAPER_MODE;
		overlayCardOpacity: number;
		avatarFrame: AvatarFrameId;
	}>;
	gates: Readonly<{
		wallpaperMode: boolean;
		overlayCardOpacity: boolean;
		avatarFrame: boolean;
	}>;
	/** 合法壁纸模式（内联脚本校验残留值用）。 */
	wallpaperModes: readonly WALLPAPER_MODE[];
	avatarFrames: readonly AvatarFrameId[];
	theme: Readonly<{
		modes: readonly LIGHT_DARK_MODE[];
		timeZone: string;
		lightFromHour: number;
		darkFromHour: number;
		darkTheme: string;
		lightTheme: string;
	}>;
	toggles: Readonly<Record<BooleanSettingId, SettingsBootToggle>>;
}>;

export function serializeBootState(): SettingsBootState {
	const themeRow = rowFor("theme");
	const wallpaperRow = rowFor("wallpaper");
	const opacityRow = rowFor("overlayCardOpacity");
	const avatarRow = rowFor("avatarFrame");
	const { lightFromHour, darkFromHour } = getTimeScheduleHours();

	const toggles = Object.fromEntries(
		BOOLEAN_SETTING_IDS.map((id) => {
			const row = rowFor(id);
			return [
				id,
				{
					key: row.storageKey,
					gate: row.gate ? row.gate() : true,
					defaultValue: row.defaultValue() === true,
					gatedValue: (row.gatedValue?.() ?? row.defaultValue()) === true,
				},
			];
		}),
	) as Record<BooleanSettingId, SettingsBootToggle>;

	return {
		keys: {
			theme: themeRow.storageKey,
			wallpaperMode: wallpaperRow.storageKey,
			overlayCardOpacity: opacityRow.storageKey,
			avatarFrame: avatarRow.storageKey,
		},
		defaults: {
			theme: getDefaultTheme(),
			wallpaperMode: backgroundWallpaper.mode,
			overlayCardOpacity: defaultOverlayCardOpacity(),
			avatarFrame: getDefaultAvatarFrameId(),
		},
		gates: {
			wallpaperMode: wallpaperRow.gate ? wallpaperRow.gate() : true,
			overlayCardOpacity: opacityRow.gate ? opacityRow.gate() : true,
			avatarFrame: avatarRow.gate ? avatarRow.gate() : true,
		},
		wallpaperModes: [
			WALLPAPER_BANNER,
			WALLPAPER_FULLSCREEN,
			WALLPAPER_OVERLAY,
			WALLPAPER_NONE,
		],
		avatarFrames: avatarFrameIds(),
		theme: {
			modes: [LIGHT_MODE, DARK_MODE, SYSTEM_MODE, TIME_MODE],
			timeZone: getThemeTimeZone(),
			lightFromHour,
			darkFromHour,
			darkTheme: expressiveCodeConfig.darkTheme,
			lightTheme: expressiveCodeConfig.lightTheme,
		},
		toggles,
	};
}
