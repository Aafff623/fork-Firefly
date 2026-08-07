import {
	BANNER_HEIGHT_EXTEND,
	DARK_MODE,
	DEFAULT_THEME,
	DEFAULT_TIME_DARK_FROM_HOUR,
	DEFAULT_TIME_LIGHT_FROM_HOUR,
	LIGHT_MODE,
	SYSTEM_MODE,
	TIME_MODE,
	WALLPAPER_BANNER,
	WALLPAPER_FULLSCREEN,
	WALLPAPER_NONE,
	WALLPAPER_OVERLAY,
} from "@constants/constants";
import type { LIGHT_DARK_MODE, WALLPAPER_MODE } from "@/types/config";
import {
	backgroundWallpaper,
	displaySettingsConfig,
	expressiveCodeConfig,
	profileConfig,
	siteConfig,
} from "../config";
import type { AvatarFrameId } from "../types/profileConfig";
import { isPickerPetId } from "@/lib/pets/builtinPets";
import { isHomePage as checkIsHomePage } from "./layout-utils";

// Declare global functions
declare global {
	interface Window {
		initSemifullScrollDetection?: () => void;
		semifullScrollHandler?: () => void;
	}
}

export function getDefaultHue(): number {
	const fallback = "250";
	// 检查是否在浏览器环境中
	if (typeof document === "undefined") {
		return Number.parseInt(fallback, 10);
	}
	const configCarrier = document.getElementById("config-carrier");
	return Number.parseInt(configCarrier?.dataset.hue || fallback, 10);
}

export function getDefaultTheme(): LIGHT_DARK_MODE {
	// 如果配置文件中设置了 defaultMode，使用配置的值
	// 否则使用 DEFAULT_THEME（向后兼容）
	return siteConfig.themeColor.defaultMode ?? DEFAULT_THEME;
}

export function getTimeScheduleHours(): {
	lightFromHour: number;
	darkFromHour: number;
} {
	const schedule = siteConfig.themeColor.timeSchedule;
	const lightFromHour =
		typeof schedule?.lightFromHour === "number"
			? schedule.lightFromHour
			: DEFAULT_TIME_LIGHT_FROM_HOUR;
	const darkFromHour =
		typeof schedule?.darkFromHour === "number"
			? schedule.darkFromHour
			: DEFAULT_TIME_DARK_FROM_HOUR;
	return { lightFromHour, darkFromHour };
}

/** 主题时段所用时区：站点时区，现行 Asia/Shanghai（北京时间） */
export function getThemeTimeZone(): string {
	return siteConfig.timezone || "Asia/Shanghai";
}

/**
 * 站点时区下的小时 0–23。
 * Asia/Shanghai 无夏令时，等价北京时间。
 */
export function getZonedHour(
	date: Date = new Date(),
	timeZone: string = getThemeTimeZone(),
): number {
	const hourPart = new Intl.DateTimeFormat("en-US", {
		timeZone,
		hour: "numeric",
		hourCycle: "h23",
	})
		.formatToParts(date)
		.find((p) => p.type === "hour")?.value;
	const hour = Number(hourPart);
	return Number.isFinite(hour) ? hour : 0;
}

/** hour in [0,23]：dark when hour >= darkFrom || hour < lightFrom */
export function isDarkHour(
	hour: number,
	lightFromHour: number,
	darkFromHour: number,
): boolean {
	return hour >= darkFromHour || hour < lightFromHour;
}

// 获取系统主题
export function getSystemTheme(): LIGHT_DARK_MODE {
	if (typeof window === "undefined") {
		return LIGHT_MODE;
	}
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? DARK_MODE
		: LIGHT_MODE;
}

// 按站点时区（北京时间）时段解析亮/暗
export function getTimeTheme(): LIGHT_DARK_MODE {
	const { lightFromHour, darkFromHour } = getTimeScheduleHours();
	const hour = getZonedHour();
	return isDarkHour(hour, lightFromHour, darkFromHour) ? DARK_MODE : LIGHT_MODE;
}

// 解析主题（system → OS；time → 站点时区时段）
export function resolveTheme(theme: LIGHT_DARK_MODE): LIGHT_DARK_MODE {
	if (theme === SYSTEM_MODE) {
		return getSystemTheme();
	}
	if (theme === TIME_MODE) {
		return getTimeTheme();
	}
	return theme;
}

export function getHue(): number {
	// 先检查全局对象
	if (typeof window === "undefined" || !window.localStorage) {
		return getDefaultHue();
	}
	const stored = localStorage.getItem("hue");
	return stored ? Number.parseInt(stored, 10) : getDefaultHue();
}

export function setHue(hue: number): void {
	// 先检查是否在浏览器环境
	if (
		typeof window === "undefined" ||
		!window.localStorage ||
		typeof document === "undefined"
	) {
		return;
	}
	localStorage.setItem("hue", String(hue));
	const r = document.querySelector(":root") as HTMLElement;
	if (!r) {
		return;
	}
	r.style.setProperty("--hue", String(hue));
}

export function applyThemeToDocument(theme: LIGHT_DARK_MODE): void {
	// 检查是否在浏览器环境中
	if (typeof document === "undefined") {
		return;
	}

	// 解析主题
	const resolvedTheme = resolveTheme(theme);

	// 获取当前主题状态的完整信息
	const currentIsDark = document.documentElement.classList.contains("dark");
	const currentTheme = document.documentElement.getAttribute("data-theme");

	// 计算目标主题状态
	let targetIsDark = false; // 初始化默认值
	switch (resolvedTheme) {
		case LIGHT_MODE:
			targetIsDark = false;
			break;
		case DARK_MODE:
			targetIsDark = true;
			break;
		default:
			// 处理默认情况，使用当前主题状态
			targetIsDark = currentIsDark;
			break;
	}

	// 检测是否真的需要主题切换：
	// 1. dark类状态是否改变
	// 2. expressiveCode主题是否需要更新
	const needsThemeChange = currentIsDark !== targetIsDark;
	const expectedTheme = targetIsDark
		? expressiveCodeConfig.darkTheme
		: expressiveCodeConfig.lightTheme;
	const needsCodeThemeUpdate = currentTheme !== expectedTheme;

	// 如果既不需要主题切换也不需要代码主题更新，直接返回
	if (!needsThemeChange && !needsCodeThemeUpdate) {
		return;
	}

	// 批量 DOM 操作：短窗关掉全站 color/bg 过渡，避免 .dark 翻转时千节点同时插值卡顿
	const root = document.documentElement;
	if (needsThemeChange) {
		root.classList.add("is-theme-transitioning");
		if (targetIsDark) {
			root.classList.add("dark");
		} else {
			root.classList.remove("dark");
		}
	}

	// Set the theme for Expressive Code based on current mode
	if (needsCodeThemeUpdate) {
		root.setAttribute("data-theme", expectedTheme);
	}

	if (needsThemeChange) {
		// 双 rAF：先按「无过渡」提交一帧样式，再撤掉保护类
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				root.classList.remove("is-theme-transitioning");
			});
		});
	}
}

// 系统主题监听器引用
let systemThemeListener:
	| ((e: MediaQueryListEvent | MediaQueryList) => void)
	| null = null;

let timeThemeTimer: ReturnType<typeof setTimeout> | null = null;

export function setTheme(theme: LIGHT_DARK_MODE): void {
	// 检查是否在浏览器环境中
	if (
		typeof localStorage === "undefined" ||
		typeof localStorage.setItem !== "function"
	) {
		return;
	}

	// 先应用主题
	applyThemeToDocument(theme);

	// 保存到localStorage
	localStorage.setItem("theme", theme);

	if (theme === SYSTEM_MODE) {
		cleanupTimeThemeListener();
		setupSystemThemeListener();
	} else if (theme === TIME_MODE) {
		cleanupSystemThemeListener();
		setupTimeThemeListener();
	} else {
		cleanupSystemThemeListener();
		cleanupTimeThemeListener();
	}
}

// 设置系统主题监听器
export function setupSystemThemeListener(): void {
	// 先清理之前的监听器
	cleanupSystemThemeListener();

	if (typeof window === "undefined") {
		return;
	}

	const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

	// 处理系统主题变化的回调
	const handleSystemThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
		const isDark = e.matches;
		const currentIsDark = document.documentElement.classList.contains("dark");

		// 如果主题状态没有变化，直接返回
		if (currentIsDark === isDark) {
			return;
		}

		// 直接应用系统主题，不使用过渡保护类以避免大量重绘
		if (isDark) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}

		// Set the theme for Expressive Code
		const expressiveTheme = isDark
			? expressiveCodeConfig.darkTheme
			: expressiveCodeConfig.lightTheme;
		document.documentElement.setAttribute("data-theme", expressiveTheme);

		// 触发自定义事件通知其他组件（仅在真正切换时触发）
		window.dispatchEvent(new CustomEvent("theme-change"));
	};

	// 立即调用一次以设置初始状态
	handleSystemThemeChange(mediaQuery);

	// 监听系统主题变化（现代浏览器）
	if (mediaQuery.addEventListener) {
		mediaQuery.addEventListener("change", handleSystemThemeChange);
	} else {
		// 兼容旧浏览器
		mediaQuery.addListener(handleSystemThemeChange);
	}

	systemThemeListener = handleSystemThemeChange;
}

// 清理系统主题监听器
function cleanupSystemThemeListener() {
	if (typeof window === "undefined" || !systemThemeListener) {
		return;
	}

	const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

	if (mediaQuery.removeEventListener) {
		mediaQuery.removeEventListener("change", systemThemeListener);
	} else {
		// 兼容旧浏览器
		mediaQuery.removeListener(systemThemeListener);
	}

	systemThemeListener = null;
}

/**
 * 距站点时区下一整点边界的毫秒数。
 * Asia/Shanghai 固定 UTC+8（无 DST），用偏移推算；其它 IANA 走 Intl 迭代。
 */
function msUntilNextZonedHour(
	hour: number,
	timeZone: string,
	nowMs: number = Date.now(),
): number {
	if (timeZone === "Asia/Shanghai") {
		const offsetMs = 8 * 60 * 60 * 1000;
		const bj = new Date(nowMs + offsetMs);
		const y = bj.getUTCFullYear();
		const m = bj.getUTCMonth();
		const d = bj.getUTCDate();
		let target = Date.UTC(y, m, d, hour, 0, 0, 0) - offsetMs;
		if (target <= nowMs) {
			target = Date.UTC(y, m, d + 1, hour, 0, 0, 0) - offsetMs;
		}
		return target - nowMs;
	}

	// 通用：在「今天 / 明天」的目标钟点上，把 UTC 猜测收敛到该时区挂钟
	const dayKey = new Intl.DateTimeFormat("en-CA", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date(nowMs));
	const [y, mo, d] = dayKey.split("-").map(Number);

	const zonedWallToUtc = (
		year: number,
		month: number,
		day: number,
		h: number,
	): number => {
		let guess = Date.UTC(year, month - 1, day, h, 0, 0);
		for (let i = 0; i < 4; i++) {
			const parts = Object.fromEntries(
				new Intl.DateTimeFormat("en-US", {
					timeZone,
					year: "numeric",
					month: "2-digit",
					day: "2-digit",
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
					hourCycle: "h23",
				})
					.formatToParts(new Date(guess))
					.filter((p) => p.type !== "literal")
					.map((p) => [p.type, p.value]),
			) as Record<string, string>;
			const asUtc = Date.UTC(
				Number(parts.year),
				Number(parts.month) - 1,
				Number(parts.day),
				Number(parts.hour),
				Number(parts.minute),
				Number(parts.second),
			);
			const want = Date.UTC(year, month - 1, day, h, 0, 0);
			guess += want - asUtc;
		}
		return guess;
	};

	let target = zonedWallToUtc(y, mo, d, hour);
	if (target <= nowMs) {
		const next = new Date(Date.UTC(y, mo - 1, d + 1));
		target = zonedWallToUtc(
			next.getUTCFullYear(),
			next.getUTCMonth() + 1,
			next.getUTCDate(),
			hour,
		);
	}
	return target - nowMs;
}

/** 距下一切换边界（lightFrom / darkFrom 整点，站点时区）的毫秒数 */
function msUntilNextTimeBoundary(
	lightFromHour: number,
	darkFromHour: number,
): number {
	const timeZone = getThemeTimeZone();
	const nowMs = Date.now();
	return Math.min(
		msUntilNextZonedHour(lightFromHour, timeZone, nowMs),
		msUntilNextZonedHour(darkFromHour, timeZone, nowMs),
	);
}

export function setupTimeThemeListener(): void {
	cleanupTimeThemeListener();

	if (typeof window === "undefined") {
		return;
	}

	const tick = () => {
		const beforeDark = document.documentElement.classList.contains("dark");
		applyThemeToDocument(TIME_MODE);
		const afterDark = document.documentElement.classList.contains("dark");
		if (beforeDark !== afterDark) {
			window.dispatchEvent(new CustomEvent("theme-change"));
		}

		const { lightFromHour, darkFromHour } = getTimeScheduleHours();
		const delay = Math.max(
			1000,
			msUntilNextTimeBoundary(lightFromHour, darkFromHour) + 50,
		);
		timeThemeTimer = setTimeout(tick, delay);
	};

	// 先对齐当前时段，再挂下一次边界
	applyThemeToDocument(TIME_MODE);
	const { lightFromHour, darkFromHour } = getTimeScheduleHours();
	const delay = Math.max(
		1000,
		msUntilNextTimeBoundary(lightFromHour, darkFromHour) + 50,
	);
	timeThemeTimer = setTimeout(tick, delay);
}

function cleanupTimeThemeListener() {
	if (timeThemeTimer !== null) {
		clearTimeout(timeThemeTimer);
		timeThemeTimer = null;
	}
}

/** 一次性把曾锁死的 light/dark 拉回 time（北京时段感知） */
const THEME_TIME_RESTORE_KEY = "theme-time-beijing-v1";

export function ensureTimeThemeDefault(): void {
	if (
		typeof localStorage === "undefined" ||
		typeof localStorage.getItem !== "function"
	) {
		return;
	}
	if (getDefaultTheme() !== TIME_MODE) return;
	if (localStorage.getItem(THEME_TIME_RESTORE_KEY) === "1") return;
	localStorage.setItem("theme", TIME_MODE);
	localStorage.setItem(THEME_TIME_RESTORE_KEY, "1");
}

export function getStoredTheme(): LIGHT_DARK_MODE {
	// 检查是否在浏览器环境中
	if (
		typeof localStorage === "undefined" ||
		typeof localStorage.getItem !== "function"
	) {
		return getDefaultTheme();
	}
	ensureTimeThemeDefault();
	return (
		(localStorage.getItem("theme") as LIGHT_DARK_MODE) || getDefaultTheme()
	);
}

// 初始化主题监听器（用于页面加载后）
export function initThemeListener(): void {
	if (
		typeof localStorage === "undefined" ||
		typeof localStorage.getItem !== "function"
	) {
		return;
	}

	const theme = getStoredTheme();

	if (theme === SYSTEM_MODE) {
		setupSystemThemeListener();
	} else if (theme === TIME_MODE) {
		setupTimeThemeListener();
	}
}

// Wallpaper mode functions
export function applyWallpaperModeToDocument(
	mode: WALLPAPER_MODE,
	animate = true,
): void {
	// 获取当前的壁纸模式
	const currentMode =
		(document.documentElement.getAttribute(
			"data-wallpaper-mode",
		) as WALLPAPER_MODE) || backgroundWallpaper.mode;

	// 检查是否允许切换壁纸模式
	const isSwitchable = displaySettingsConfig.wallpaperModeSwitchable;
	if (!isSwitchable) {
		// 不允许切换时，仍需初始化当前模式的UI状态（添加 wallpaper-initialized 等）
		if (currentMode === mode) {
			adjustMainContentPosition(mode, false);
			ensureWallpaperState(mode);
		}
		return;
	}

	// 如果模式没有变化，直接返回
	if (currentMode === mode) {
		// 即使是相同模式，也要确保UI状态正确
		ensureWallpaperState(mode);
		return;
	}

	// 添加过渡保护类
	document.documentElement.classList.add("is-wallpaper-transitioning");

	// 更新数据属性
	document.documentElement.setAttribute("data-wallpaper-mode", mode);

	// 使用 requestAnimationFrame 确保在下一帧执行，避免闪屏
	requestAnimationFrame(() => {
		const body = document.body;

		// 移除所有壁纸相关的CSS类
		body.classList.remove(
			"enable-banner",
			"wallpaper-transparent",
			"no-banner-layout",
		);

		// 根据模式添加相应的CSS类
		switch (mode) {
			case WALLPAPER_BANNER:
			body.classList.add("enable-banner");
			body.classList.add("wallpaper-transparent");
			showBannerMode(true);
			break;
			case WALLPAPER_FULLSCREEN:
				body.classList.add("no-banner-layout");
				showFullscreenMode(animate);
				break;
			case WALLPAPER_OVERLAY:
				body.classList.add("wallpaper-transparent");
				body.classList.add("no-banner-layout");
				showOverlayMode();
				break;
			case WALLPAPER_NONE:
				body.classList.add("no-banner-layout");
				hideAllWallpapers();
				break;
			default:
				body.classList.add("no-banner-layout");
				hideAllWallpapers();
				break;
		}

		// 更新导航栏透明模式
		updateNavbarTransparency(mode);

		// 在下一帧移除过渡保护类
		requestAnimationFrame(() => {
			document.documentElement.classList.remove("is-wallpaper-transitioning");
		});
	});
}

// 确保壁纸状态正确
function ensureWallpaperState(mode: WALLPAPER_MODE) {
	const body = document.body;

	// 移除所有壁纸相关的CSS类
	body.classList.remove(
		"enable-banner",
		"wallpaper-transparent",
		"no-banner-layout",
	);

	// 根据模式添加相应的CSS类
	switch (mode) {
		case WALLPAPER_BANNER:
			body.classList.add("enable-banner");
			body.classList.add("wallpaper-transparent");
			showBannerMode();
			break;
		case WALLPAPER_FULLSCREEN:
			body.classList.add("no-banner-layout");
			showFullscreenMode();
			break;
		case WALLPAPER_OVERLAY:
			body.classList.add("wallpaper-transparent");
			body.classList.add("no-banner-layout");
			showOverlayMode();
			break;
		case WALLPAPER_NONE:
			body.classList.add("no-banner-layout");
			hideAllWallpapers();
			break;
	}

	// 更新导航栏透明模式
	updateNavbarTransparency(mode);
}

function showBannerMode(animate = false) {
	// 显示 wallpaper-wrapper 并切换为 banner 模式
	const wallpaperWrapper = document.getElementById("wallpaper-wrapper");
	if (wallpaperWrapper) {
		// 移除 overlay 和全屏壁纸模式类
		wallpaperWrapper.classList.remove("wallpaper-overlay");
		wallpaperWrapper.classList.remove("wallpaper-fullscreen");

		// 恢复 banner 模式的 top 定位
		wallpaperWrapper.style.top = `-${BANNER_HEIGHT_EXTEND}vh`;

		// 检查当前是否为首页
		const isHomePage = checkIsHomePage(window.location.pathname);
		const isMobile = window.innerWidth < 1024;

		// 移动端非首页时，不显示banner；桌面端始终显示
		if (isMobile && !isHomePage) {
			wallpaperWrapper.style.display = "none";
			wallpaperWrapper.classList.add("mobile-hide-banner");
		} else {
			// 首页或桌面端：先设置display，然后使用requestAnimationFrame确保渲染
			wallpaperWrapper.style.display = "block";
			wallpaperWrapper.style.setProperty("display", "block", "important");
			requestAnimationFrame(() => {
				wallpaperWrapper.classList.remove("hidden");
				wallpaperWrapper.classList.remove("opacity-0");
				wallpaperWrapper.classList.add("opacity-100");
				wallpaperWrapper.classList.remove("mobile-hide-banner");
			});
		}
	}

	// 显示横幅首页文本（如果启用且是首页）
	const bannerTextOverlay = document.querySelector(
		".banner-home-text-overlay",
	) as HTMLElement | null;
	if (bannerTextOverlay) {
		// 检查是否启用 homeText
		const homeTextEnabled = backgroundWallpaper.common?.homeText?.enable;

		// 检查当前是否为首页
		const isHomePage = checkIsHomePage(window.location.pathname);

		// 只有在启用且在首页时才显示
		if (homeTextEnabled && isHomePage) {
			bannerTextOverlay.classList.remove("hidden");
		} else {
			bannerTextOverlay.classList.add("hidden");
		}
		// 重置全屏模式的下移transform
		bannerTextOverlay.style.transition = "";
		bannerTextOverlay.style.transform = "";
	}

	// 调整主内容位置
	adjustMainContentPosition("banner", animate);

	// 处理移动端非首页主内容区域位置
	const mainContentWrapper = document.querySelector(
		".w-full.z-30.pointer-events-none",
	);
	if (mainContentWrapper) {
		const isHomePage = checkIsHomePage(window.location.pathname);
		const isMobile = window.innerWidth < 1024;
		// 只在移动端非首页时调整主内容位置
		if (isMobile && !isHomePage) {
			mainContentWrapper.classList.add("mobile-main-no-banner");
		} else {
			mainContentWrapper.classList.remove("mobile-main-no-banner");
		}
	}

	// 横幅为主，同时保留卡片玻璃透明
	adjustMainContentTransparency(true);

	// 调整导航栏透明度
	const navbar = document.getElementById("navbar");
	if (navbar) {
		// 获取导航栏透明模式配置（banner模式）
		const transparentMode =
			backgroundWallpaper.common?.navbar?.transparentMode || "semi";
		navbar.setAttribute("data-transparent-mode", transparentMode);

		// 重新初始化半透明模式滚动检测（如果需要）
		if (
			transparentMode === "semifull" &&
			typeof window.initSemifullScrollDetection === "function"
		) {
			window.initSemifullScrollDetection();
		}
	}
}

function showFullscreenMode(animate = false) {
	// 显示 wallpaper-wrapper 并切换为全屏壁纸模式
	const wallpaperWrapper = document.getElementById("wallpaper-wrapper");
	const isMobile = window.innerWidth < 1024;
	const isHomePage = checkIsHomePage(window.location.pathname);
	if (wallpaperWrapper) {
		// 移除 overlay 模式类
		wallpaperWrapper.classList.remove("wallpaper-overlay");
		// 添加全屏壁纸模式类
		wallpaperWrapper.classList.add("wallpaper-fullscreen");

		if (isMobile && !isHomePage) {
			// 移动端非首页时隐藏壁纸
			wallpaperWrapper.style.display = "none";
			wallpaperWrapper.classList.add("mobile-hide-banner");
		} else {
			// 显示壁纸
			wallpaperWrapper.style.display = "block";
			wallpaperWrapper.style.setProperty("display", "block", "important");
			wallpaperWrapper.style.top = "";
			requestAnimationFrame(() => {
				wallpaperWrapper.classList.remove("hidden");
				wallpaperWrapper.classList.remove("opacity-0");
				wallpaperWrapper.classList.add("opacity-100");
				wallpaperWrapper.classList.remove("mobile-hide-banner");
			});
		}
	}

	// 显示横幅首页文本（如果启用且是首页）
	const bannerTextOverlay = document.querySelector(
		".banner-home-text-overlay",
	) as HTMLElement | null;
	if (bannerTextOverlay) {
		const homeTextEnabled = backgroundWallpaper.common?.homeText?.enable;
		if (homeTextEnabled && isHomePage) {
			bannerTextOverlay.classList.remove("hidden");
			if (animate) {
				// 横幅文字跟随下移：wrapper已瞬间变为100vh，文字flex居中在50vh
				// 先用-17.5vh补偿到横幅位置(32.5vh)，再过渡到0(全屏居中50vh)
				bannerTextOverlay.style.transition = "none";
				bannerTextOverlay.style.transform = "translateY(-17.5vh)";
				requestAnimationFrame(() => {
					bannerTextOverlay.style.transition =
						"transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
					bannerTextOverlay.style.transform = "translateY(0)";
				});
			}
		} else {
			bannerTextOverlay.classList.add("hidden");
		}
	}

	// 调整主内容位置
	adjustMainContentPosition("fullscreen", animate);

	// 移除透明效果（全屏壁纸模式不使用半透明）
	adjustMainContentTransparency(false);

	// 调整导航栏透明度
	const navbar = document.getElementById("navbar");
	if (navbar) {
		const transparentMode =
			backgroundWallpaper.common?.navbar?.transparentMode || "semi";
		navbar.setAttribute("data-transparent-mode", transparentMode);

		if (
			transparentMode === "semifull" &&
			typeof window.initSemifullScrollDetection === "function"
		) {
			window.initSemifullScrollDetection();
		}
	}
}

function showOverlayMode() {
	// 切换 wallpaper-wrapper 为 overlay 模式
	const wallpaperWrapper = document.getElementById("wallpaper-wrapper");
	if (wallpaperWrapper) {
		// 添加 overlay 模式类，移除全屏壁纸模式类
		wallpaperWrapper.classList.remove("wallpaper-fullscreen");
		wallpaperWrapper.classList.add("wallpaper-overlay");
		// 显示壁纸
		wallpaperWrapper.style.display = "block";
		wallpaperWrapper.style.setProperty("display", "block", "important");
		wallpaperWrapper.style.top = "";
		requestAnimationFrame(() => {
			wallpaperWrapper.classList.remove("hidden");
			wallpaperWrapper.classList.remove("opacity-0");
			wallpaperWrapper.classList.add("opacity-100");
			wallpaperWrapper.classList.remove("mobile-hide-banner");
		});
	}

	// 隐藏横幅首页文本
	const bannerTextOverlay = document.querySelector(".banner-home-text-overlay");
	if (bannerTextOverlay) {
		bannerTextOverlay.classList.add("hidden");
	}

	// 调整主内容透明度
	adjustMainContentTransparency(true);

	// 调整布局为紧凑模式
	adjustMainContentPosition("overlay");
}

function hideAllWallpapers() {
	// 隐藏壁纸
	const wallpaperWrapper = document.getElementById("wallpaper-wrapper");

	if (wallpaperWrapper) {
		wallpaperWrapper.style.display = "none";
		wallpaperWrapper.classList.add("hidden");
		wallpaperWrapper.classList.add("opacity-0");
		wallpaperWrapper.classList.remove("wallpaper-overlay");
		wallpaperWrapper.classList.remove("wallpaper-fullscreen");
	}

	// 隐藏横幅首页文本
	const bannerTextOverlay = document.querySelector(".banner-home-text-overlay");
	if (bannerTextOverlay) {
		bannerTextOverlay.classList.add("hidden");
	}

	// 调整主内容位置和透明度
	adjustMainContentPosition("none");
	adjustMainContentTransparency(false);
}

function updateNavbarTransparency(mode: WALLPAPER_MODE) {
	const navbar = document.getElementById("navbar");
	if (!navbar) return;

	let transparentMode: string;
	let enableBlur: boolean;
	let blurAmount: number;

	// 根据当前壁纸模式设置导航栏透明模式和模糊效果
	if (mode === WALLPAPER_OVERLAY) {
		// 全屏透明模式
		transparentMode = "none";
		enableBlur = false;
		blurAmount = 0;
	} else if (mode === WALLPAPER_NONE) {
		// 纯色背景模式
		transparentMode = "none";
		enableBlur = false;
		blurAmount = 0;
	} else if (mode === WALLPAPER_FULLSCREEN) {
		// 全屏壁纸模式：使用 fullscreen 配置的透明模式和模糊效果
		transparentMode =
			backgroundWallpaper.common?.navbar?.transparentMode || "semi";
		enableBlur = backgroundWallpaper.common?.navbar?.enableBlur ?? true;
		blurAmount = backgroundWallpaper.common?.navbar?.blur ?? 20;
	} else {
		// Banner模式：使用配置的透明模式和模糊效果
		transparentMode =
			backgroundWallpaper.common?.navbar?.transparentMode || "semi";
		enableBlur = backgroundWallpaper.common?.navbar?.enableBlur ?? true;
		blurAmount = backgroundWallpaper.common?.navbar?.blur ?? 20;
	}

	// 更新导航栏的透明模式属性
	navbar.setAttribute("data-transparent-mode", transparentMode);
	navbar.setAttribute("data-enable-blur", String(enableBlur));
	navbar.style.setProperty("--navbar-glass-blur", `${blurAmount}px`);

	// 移除现有的透明模式类
	navbar.classList.remove(
		"navbar-transparent-semi",
		"navbar-transparent-full",
		"navbar-transparent-semifull",
	);

	// 移除scrolled类
	navbar.classList.remove("scrolled");

	// 滚动检测功能
	if (
		transparentMode === "semifull" &&
		(mode === WALLPAPER_BANNER || mode === WALLPAPER_FULLSCREEN) &&
		typeof window.initSemifullScrollDetection === "function"
	) {
		// 在Banner和全屏壁纸模式的semifull下启用滚动检测
		window.initSemifullScrollDetection();
	} else if (window.semifullScrollHandler) {
		// 移除滚动监听器
		window.removeEventListener("scroll", window.semifullScrollHandler);
		delete window.semifullScrollHandler;
	}
}

// 跟踪全屏模式动画的 setTimeout，快速切换时需要取消
let fullscreenAnimationTimeout: ReturnType<typeof setTimeout> | null = null;

function adjustMainContentPosition(
	mode: WALLPAPER_MODE | "banner" | "none" | "overlay" | "fullscreen",
	animate = false,
) {
	const mainContent = document.querySelector(
		".w-full.z-30.pointer-events-none",
	) as HTMLElement;
	if (!mainContent) return;

	// 取消上一次全屏模式动画的 setTimeout，防止快速切换时竞态覆盖
	if (fullscreenAnimationTimeout) {
		clearTimeout(fullscreenAnimationTimeout);
		fullscreenAnimationTimeout = null;
	}

	// 移除现有的位置类
	mainContent.classList.remove("mobile-main-no-banner", "no-banner-layout");

	switch (mode) {
		case "banner": {
			// Banner模式：主内容在banner下方
			const isHome = checkIsHomePage(window.location.pathname);
			const bannerTargetTop = "calc(var(--banner-height) - 3.5rem)";

			// 禁用 CSS transition，防止整个定位过程中的值变化触发过渡动画
			mainContent.style.setProperty("transition", "none", "important");
			// 清除 fullscreen 模式特有的 inline 样式（position: relative, top: 0 等）
			mainContent.style.position = "";
			mainContent.style.zIndex = "";
			mainContent.style.top = "";
			mainContent.style.setProperty("margin-top", "");

			if (!isHome) {
				mainContent.classList.add("mobile-main-no-banner");
				if (window.innerWidth < 1024) {
					mainContent.style.setProperty("top", "5.5rem", "important");
				} else {
					mainContent.style.setProperty("top", bannerTargetTop, "important");
				}
			} else {
				mainContent.style.setProperty("top", bannerTargetTop, "important");
			}
			const bannerGrid = document.getElementById("main-grid");
			if (bannerGrid) {
				bannerGrid.style.transform = "";
				bannerGrid.style.transition = "";
			}
			// 所有定位操作完成后，强制回流并恢复 CSS transition
			void mainContent.offsetWidth;
			mainContent.style.removeProperty("transition");
			break;
		}
		case "fullscreen": {
			// 全屏壁纸模式：壁纸已在文档流中占100vh，主内容紧跟其后
			const isFullscreenMobile = window.innerWidth < 1024;
			const isFullscreenHome = checkIsHomePage(window.location.pathname);
			if (isFullscreenMobile && !isFullscreenHome) {
				// 移动端非首页：壁纸已隐藏，主内容从导航栏下方开始
				mainContent.classList.add("mobile-main-no-banner");
				mainContent.classList.add("no-banner-layout");
				mainContent.style.setProperty("top", "5.5rem", "important");
				mainContent.style.setProperty("margin-top", "0", "important");
				mainContent.style.position = "";
				mainContent.style.minHeight = "";
				mainContent.style.transition = "";
				break;
			}

			if (animate) {
				// 运行时切换：从当前位置动画滑到壁纸下方，完成后切换为 relative
				const computedTop = mainContent.getBoundingClientRect().top;
				mainContent.style.transition = "none";
				mainContent.style.position = "absolute";
				mainContent.style.zIndex = "30";
				mainContent.style.setProperty("top", `${computedTop}px`, "important");
				// absolute 定位下 margin-top 不影响布局，提前设好最终值避免切换 relative 时跳变
				mainContent.style.setProperty("margin-top", "1rem", "important");
				mainContent.classList.add("no-banner-layout");
				void mainContent.offsetWidth;
				mainContent.style.setProperty(
					"transition",
					"top 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
					"important",
				);
				mainContent.style.setProperty("top", "100vh", "important");
				fullscreenAnimationTimeout = setTimeout(() => {
					mainContent.style.transition = "none";
					mainContent.style.position = "relative";
					mainContent.style.setProperty("top", "0", "important");
					void mainContent.offsetWidth;
					mainContent.style.transition = "";
				}, 450);
			} else {
				// 初始化：直接设置位置，无需动画
				mainContent.classList.add("no-banner-layout");
				mainContent.style.position = "relative";
				mainContent.style.zIndex = "30";
				mainContent.style.setProperty("top", "0", "important");
				mainContent.style.setProperty("margin-top", "1rem", "important");
				mainContent.style.transition = "";
			}
			break;
		}
		case "overlay":
			// Overlay模式：使用紧凑布局，主内容从导航栏下方开始
			mainContent.classList.add("no-banner-layout");
			mainContent.style.setProperty("top", "5.5rem", "important");
			mainContent.style.setProperty("margin-top", "0", "important");
			mainContent.style.position = "";
			mainContent.style.minHeight = "";
			mainContent.style.transition = "";
			break;
		case "none":
			// 无壁纸模式：主内容从导航栏下方开始
			mainContent.classList.add("no-banner-layout");
			mainContent.style.setProperty("top", "5.5rem", "important");
			mainContent.style.setProperty("margin-top", "0", "important");
			mainContent.style.position = "";
			mainContent.style.minHeight = "";
			mainContent.style.transition = "";
			break;
		default:
			mainContent.style.setProperty("top", "5.5rem", "important");
			mainContent.style.position = "";
			mainContent.style.minHeight = "";
			mainContent.style.transition = "";
			break;
	}

	// 定位完成后显示主内容，防止初始加载时壁纸初始化前的内容闪烁
	mainContent.style.visibility = "visible";
	document.body.classList.add("wallpaper-initialized");
}

function adjustMainContentTransparency(enable: boolean) {
	const mainContent = document.querySelector(
		".w-full.z-30.pointer-events-none",
	);
	const body = document.body;

	if (enable) {
		if (mainContent) {
			mainContent.classList.add("wallpaper-transparent");
		}
		if (body) {
			body.classList.add("wallpaper-transparent");
		}
	} else {
		if (mainContent) {
			mainContent.classList.remove("wallpaper-transparent");
		}
		if (body) {
			body.classList.remove("wallpaper-transparent");
		}
	}
}

export function setWallpaperMode(mode: WALLPAPER_MODE): void {
	// 检查是否在浏览器环境中
	if (
		typeof localStorage === "undefined" ||
		typeof localStorage.setItem !== "function"
	) {
		return;
	}
	localStorage.setItem("wallpaperMode", mode);
	applyWallpaperModeToDocument(mode);
	if (typeof window !== "undefined") {
		window.dispatchEvent(
			new CustomEvent("wallpaperModeChange", {
				detail: { mode },
			}),
		);
	}
}

export function initWallpaperMode(): void {
	// 初始化透明模式参数（透明度/模糊度/卡片透明度）
	applyStoredOverlaySettingsToDocument();
	const storedMode = getStoredWallpaperMode();
	applyWallpaperModeToDocument(storedMode, false);
}

export function getStoredWallpaperMode(): WALLPAPER_MODE {
	// 检查是否在浏览器环境中
	if (
		typeof localStorage === "undefined" ||
		typeof localStorage.getItem !== "function"
	) {
		return backgroundWallpaper.mode;
	}

	const isSwitchable = displaySettingsConfig.wallpaperModeSwitchable;
	if (!isSwitchable) {
		localStorage.removeItem("wallpaperMode");
		return backgroundWallpaper.mode;
	}

	return (
		(localStorage.getItem("wallpaperMode") as WALLPAPER_MODE) ||
		backgroundWallpaper.mode
	);
}

// Overlay settings functions
function clampNumber(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

export function getDefaultOverlayOpacity(): number {
	return backgroundWallpaper.overlay?.opacity ?? 0.8;
}

export function getDefaultOverlayBlur(): number {
	return backgroundWallpaper.overlay?.blur ?? 0;
}

export function getDefaultOverlayCardOpacity(): number {
	return backgroundWallpaper.overlay?.cardOpacity ?? 0.6;
}

/** 面板关闭透明调节时，始终用站点配置，忽略历史 localStorage */
function isOverlayPanelSwitchable(): boolean {
	const cfg = displaySettingsConfig.overlaySwitchable;
	if (cfg === false) return false;
	if (cfg === true) return true;
	return !!(cfg.opacity || cfg.blur || cfg.cardOpacity);
}

export function getStoredOverlayOpacity(): number {
	// 面板未开放时强制配置默认，避免访客残留值
	if (!isOverlayPanelSwitchable()) {
		return getDefaultOverlayOpacity();
	}
	if (
		typeof localStorage === "undefined" ||
		typeof localStorage.getItem !== "function"
	) {
		return getDefaultOverlayOpacity();
	}
	const stored = localStorage.getItem("overlayOpacity");
	if (stored === null) {
		return getDefaultOverlayOpacity();
	}
	const parsed = Number.parseFloat(stored);
	if (Number.isNaN(parsed)) {
		return getDefaultOverlayOpacity();
	}
	return clampNumber(parsed, 0, 1);
}

export function getStoredOverlayBlur(): number {
	if (!isOverlayPanelSwitchable()) {
		return getDefaultOverlayBlur();
	}
	if (
		typeof localStorage === "undefined" ||
		typeof localStorage.getItem !== "function"
	) {
		return getDefaultOverlayBlur();
	}
	const stored = localStorage.getItem("overlayBlur");
	if (stored === null) {
		return getDefaultOverlayBlur();
	}
	const parsed = Number.parseFloat(stored);
	if (Number.isNaN(parsed)) {
		return getDefaultOverlayBlur();
	}
	return clampNumber(parsed, 0, 20);
}

export function getStoredOverlayCardOpacity(): number {
	if (!isOverlayPanelSwitchable()) {
		return getDefaultOverlayCardOpacity();
	}
	if (
		typeof localStorage === "undefined" ||
		typeof localStorage.getItem !== "function"
	) {
		return getDefaultOverlayCardOpacity();
	}
	const stored = localStorage.getItem("overlayCardOpacity");
	if (stored === null) {
		return getDefaultOverlayCardOpacity();
	}
	const parsed = Number.parseFloat(stored);
	if (Number.isNaN(parsed)) {
		return getDefaultOverlayCardOpacity();
	}
	return clampNumber(parsed, 0, 1);
}

export function applyOverlayOpacityToDocument(opacity: number): void {
	if (typeof document === "undefined") {
		return;
	}
	const safeOpacity = clampNumber(opacity, 0, 1);
	const wallpaperWrapper = document.getElementById("wallpaper-wrapper");
	if (wallpaperWrapper) {
		wallpaperWrapper.style.setProperty(
			"--overlay-opacity",
			String(safeOpacity),
		);
	}
}

export function applyOverlayBlurToDocument(blur: number): void {
	if (typeof document === "undefined") {
		return;
	}
	const safeBlur = clampNumber(blur, 0, 20);
	const wallpaperWrapper = document.getElementById("wallpaper-wrapper");
	if (wallpaperWrapper) {
		wallpaperWrapper.style.setProperty("--overlay-blur", `${safeBlur}px`);
	}
}

export function applyOverlayCardOpacityToDocument(cardOpacity: number): void {
	if (typeof document === "undefined") {
		return;
	}
	const safeCardOpacity = clampNumber(cardOpacity, 0, 1);
	document.documentElement.style.setProperty(
		"--card-transparent-opacity",
		String(safeCardOpacity),
	);
}

export function setOverlayOpacity(opacity: number): void {
	const safeOpacity = clampNumber(opacity, 0, 1);
	if (
		typeof localStorage !== "undefined" &&
		typeof localStorage.setItem === "function"
	) {
		localStorage.setItem("overlayOpacity", String(safeOpacity));
	}
	applyOverlayOpacityToDocument(safeOpacity);
}

export function setOverlayBlur(blur: number): void {
	const safeBlur = clampNumber(blur, 0, 20);
	if (
		typeof localStorage !== "undefined" &&
		typeof localStorage.setItem === "function"
	) {
		localStorage.setItem("overlayBlur", String(safeBlur));
	}
	applyOverlayBlurToDocument(safeBlur);
}

export function setOverlayCardOpacity(cardOpacity: number): void {
	const safeCardOpacity = clampNumber(cardOpacity, 0, 1);
	if (
		typeof localStorage !== "undefined" &&
		typeof localStorage.setItem === "function"
	) {
		localStorage.setItem("overlayCardOpacity", String(safeCardOpacity));
	}
	applyOverlayCardOpacityToDocument(safeCardOpacity);
}

export function applyStoredOverlaySettingsToDocument(): void {
	applyOverlayOpacityToDocument(getStoredOverlayOpacity());
	applyOverlayBlurToDocument(getStoredOverlayBlur());
	applyOverlayCardOpacityToDocument(getStoredOverlayCardOpacity());
}

// Waves animation functions
export function getDefaultWavesEnabled(): boolean {
	const wavesConfig = backgroundWallpaper.common?.waves?.enable;
	if (typeof wavesConfig === "object") {
		// 如果是分设备配置，检查当前设备
		const isMobile =
			typeof window !== "undefined" ? window.innerWidth < 768 : false;
		return isMobile
			? (wavesConfig.mobile ?? false)
			: (wavesConfig.desktop ?? false);
	}
	return wavesConfig ?? false;
}

export function getStoredWavesEnabled(): boolean {
	if (
		typeof localStorage === "undefined" ||
		typeof localStorage.getItem !== "function"
	) {
		return getDefaultWavesEnabled();
	}
	const stored = localStorage.getItem("wavesEnabled");
	if (stored === null) {
		return getDefaultWavesEnabled();
	}
	return stored === "true";
}

export function setWavesEnabled(enabled: boolean): void {
	if (
		typeof localStorage === "undefined" ||
		typeof localStorage.setItem !== "function"
	) {
		return;
	}
	localStorage.setItem("wavesEnabled", String(enabled));
	applyWavesEnabledToDocument(enabled);
}

export function applyWavesEnabledToDocument(enabled: boolean): void {
	if (typeof document === "undefined") {
		return;
	}
	// 更新 html 属性，CSS 会立即生效
	document.documentElement.setAttribute("data-waves-enabled", String(enabled));
	// 同时更新元素样式（兼容性）
	const wavesElement = document.getElementById("header-waves");
	if (wavesElement) {
		if (enabled) {
			wavesElement.style.display = "";
			wavesElement.classList.remove("waves-disabled");
		} else {
			wavesElement.style.display = "none";
			wavesElement.classList.add("waves-disabled");
		}
	}
}

// Gradient transition functions
export function getDefaultGradientEnabled(): boolean {
	const gradientConfig = backgroundWallpaper.common?.gradient?.enable;
	if (typeof gradientConfig === "object") {
		const isMobile =
			typeof window !== "undefined" ? window.innerWidth < 768 : false;
		return isMobile
			? (gradientConfig.mobile ?? true)
			: (gradientConfig.desktop ?? true);
	}
	return gradientConfig ?? true;
}

export function getStoredGradientEnabled(): boolean {
	if (
		typeof localStorage === "undefined" ||
		typeof localStorage.getItem !== "function"
	) {
		return getDefaultGradientEnabled();
	}
	const stored = localStorage.getItem("gradientEnabled");
	if (stored === null) {
		return getDefaultGradientEnabled();
	}
	return stored === "true";
}

export function setGradientEnabled(enabled: boolean): void {
	if (
		typeof localStorage === "undefined" ||
		typeof localStorage.setItem !== "function"
	) {
		return;
	}
	localStorage.setItem("gradientEnabled", String(enabled));
	applyGradientEnabledToDocument(enabled);
}

export function applyGradientEnabledToDocument(enabled: boolean): void {
	if (typeof document === "undefined") {
		return;
	}
	document.documentElement.setAttribute(
		"data-gradient-enabled",
		String(enabled),
	);
	const gradientElement = document.getElementById("wallpaper-gradient");
	if (gradientElement) {
		if (enabled) {
			gradientElement.style.display = "";
			gradientElement.classList.remove("gradient-disabled");
		} else {
			gradientElement.style.display = "none";
			gradientElement.classList.add("gradient-disabled");
		}
	}
}

// Sakura effect functions
const SAKURA_PINNED_KEY = "sakuraPinned";
const SAKURA_ENABLED_KEY = "sakuraEnabled";
const SAKURA_INTRO_MS = 5000;

export function getDefaultSakuraEnabled(): boolean {
	// 默认不是「常驻开启」；未钉住时走整页 Intro（播数秒后关）
	return false;
}

export function getSakuraPinned(): boolean {
	if (typeof localStorage === "undefined") {
		return false;
	}
	return localStorage.getItem(SAKURA_PINNED_KEY) === "true";
}

export function getStoredSakuraEnabled(): boolean {
	if (typeof localStorage === "undefined") {
		return getDefaultSakuraEnabled();
	}
	if (getSakuraPinned()) {
		return true;
	}
	const stored = localStorage.getItem(SAKURA_ENABLED_KEY);
	if (stored === null) {
		return getDefaultSakuraEnabled();
	}
	return stored === "true";
}

export function setSakuraEnabled(
	enabled: boolean,
	options?: { persist?: boolean },
): void {
	if (
		typeof localStorage === "undefined" ||
		typeof localStorage.setItem !== "function"
	) {
		return;
	}
	const persist = options?.persist !== false;
	if (persist) {
		if (enabled) {
			localStorage.setItem(SAKURA_PINNED_KEY, "true");
			localStorage.setItem(SAKURA_ENABLED_KEY, "true");
		} else {
			localStorage.removeItem(SAKURA_PINNED_KEY);
			localStorage.setItem(SAKURA_ENABLED_KEY, "false");
		}
	}
	document.documentElement.setAttribute("data-sakura-enabled", String(enabled));
	window.dispatchEvent(
		new CustomEvent("sakuraToggle", { detail: { enabled } }),
	);
}

export function getSakuraIntroDurationMs(): number {
	return SAKURA_INTRO_MS;
}

/** 桌宠双击等：短暂飘樱，不写入常驻/钉住；已钉住则不动 */
let sakuraBurstTimer: ReturnType<typeof setTimeout> | null = null;

export function triggerSakuraBurst(durationMs = SAKURA_INTRO_MS): void {
	if (typeof window === "undefined") return;
	if (getSakuraPinned()) return;

	if (sakuraBurstTimer !== null) {
		clearTimeout(sakuraBurstTimer);
		sakuraBurstTimer = null;
	}

	setSakuraEnabled(true, { persist: false });
	sakuraBurstTimer = setTimeout(() => {
		sakuraBurstTimer = null;
		if (getSakuraPinned()) return;
		setSakuraEnabled(false, { persist: false });
		window.dispatchEvent(
			new CustomEvent("sakuraIntroEnded", {
				detail: { enabled: false },
			}),
		);
	}, durationMs);
}

// Banner title functions
export function getDefaultBannerTitleEnabled(): boolean {
	return backgroundWallpaper.common?.homeText?.enable ?? true;
}

export function getDefaultBannerCarouselEnabled(): boolean {
	return backgroundWallpaper.common?.carousel?.enable ?? false;
}

export function getStoredBannerTitleEnabled(): boolean {
	if (
		typeof localStorage === "undefined" ||
		typeof localStorage.getItem !== "function"
	) {
		return getDefaultBannerTitleEnabled();
	}
	const stored = localStorage.getItem("bannerTitleEnabled");
	if (stored === null) {
		return getDefaultBannerTitleEnabled();
	}
	return stored === "true";
}

export function getStoredBannerCarouselEnabled(): boolean {
	const isSwitchable = displaySettingsConfig.bannerCarouselSwitchable;
	if (!isSwitchable) {
		return getDefaultBannerCarouselEnabled();
	}
	if (
		typeof localStorage === "undefined" ||
		typeof localStorage.getItem !== "function"
	) {
		return getDefaultBannerCarouselEnabled();
	}
	const stored = localStorage.getItem("bannerCarouselEnabled");
	if (stored === null) {
		return getDefaultBannerCarouselEnabled();
	}
	return stored === "true";
}

export function setBannerTitleEnabled(enabled: boolean): void {
	if (
		typeof localStorage === "undefined" ||
		typeof localStorage.setItem !== "function"
	) {
		return;
	}
	localStorage.setItem("bannerTitleEnabled", String(enabled));
	applyBannerTitleEnabledToDocument(enabled);
}

export function setBannerCarouselEnabled(enabled: boolean): void {
	const safeEnabled = !!enabled;
	const isSwitchable = displaySettingsConfig.bannerCarouselSwitchable;
	if (
		isSwitchable &&
		typeof localStorage !== "undefined" &&
		typeof localStorage.setItem === "function"
	) {
		localStorage.setItem("bannerCarouselEnabled", String(safeEnabled));
	}
	applyBannerCarouselEnabledToDocument(safeEnabled);
	if (typeof window !== "undefined") {
		window.dispatchEvent(
			new CustomEvent("bannerCarouselChange", {
				detail: { enabled: safeEnabled },
			}),
		);
	}
}

export function applyBannerTitleEnabledToDocument(enabled: boolean): void {
	if (typeof document === "undefined") {
		return;
	}
	// 更新 html 属性，CSS 会立即生效
	document.documentElement.setAttribute(
		"data-banner-title-enabled",
		String(enabled),
	);
	// 同时更新元素样式（兼容性）
	const bannerTextOverlay = document.querySelector(
		".banner-home-text-overlay",
	) as HTMLElement;
	if (bannerTextOverlay) {
		if (enabled) {
			bannerTextOverlay.classList.remove("user-hidden");
		} else {
			bannerTextOverlay.classList.add("user-hidden");
		}
	}
}

export function applyBannerCarouselEnabledToDocument(enabled: boolean): void {
	if (typeof document === "undefined") {
		return;
	}
	document.documentElement.setAttribute(
		"data-banner-carousel-enabled",
		String(enabled),
	);
}

// Card border functions
export function getDefaultCardBorderEnabled(): boolean {
	return siteConfig.card?.border ?? false;
}

export function getStoredCardBorderEnabled(): boolean {
	// 面板未开放时始终走站点默认，忽略历史 localStorage
	if (!displaySettingsConfig.cardBorderSwitchable) {
		return getDefaultCardBorderEnabled();
	}
	if (typeof localStorage === "undefined") {
		return getDefaultCardBorderEnabled();
	}
	const stored = localStorage.getItem("cardBorderEnabled");
	if (stored === null) {
		return getDefaultCardBorderEnabled();
	}
	return stored === "true";
}

export function setCardBorderEnabled(enabled: boolean): void {
	if (
		typeof localStorage === "undefined" ||
		typeof localStorage.setItem !== "function"
	) {
		return;
	}
	localStorage.setItem("cardBorderEnabled", String(enabled));
	if (enabled) {
		document.documentElement.classList.add("enable-card-border");
	} else {
		document.documentElement.classList.remove("enable-card-border");
	}
}

// Note card (attachment reference box) functions
export function getDefaultNoteCardEnabled(): boolean {
	return false;
}

export function getStoredNoteCardEnabled(): boolean {
	// 面板未开放时始终走站点默认，忽略历史 localStorage
	if (!displaySettingsConfig.noteCardSwitchable) {
		return getDefaultNoteCardEnabled();
	}
	if (typeof localStorage === "undefined") {
		return getDefaultNoteCardEnabled();
	}
	const stored = localStorage.getItem("noteCardEnabled");
	if (stored === null) {
		return getDefaultNoteCardEnabled();
	}
	return stored === "true";
}

export function setNoteCardEnabled(enabled: boolean): void {
	if (
		typeof localStorage === "undefined" ||
		typeof localStorage.setItem !== "function"
	) {
		return;
	}
	localStorage.setItem("noteCardEnabled", String(enabled));
	if (enabled) {
		document.documentElement.classList.remove("note-cards-off");
	} else {
		document.documentElement.classList.add("note-cards-off");
	}
}

// Card follow theme functions
export function getDefaultCardFollowThemeEnabled(): boolean {
	return siteConfig.card?.followTheme ?? false;
}

export function getStoredCardFollowThemeEnabled(): boolean {
	// 面板未开放时始终关闭跟随主题色
	if (!displaySettingsConfig.cardFollowThemeSwitchable) {
		return false;
	}
	if (typeof localStorage === "undefined") {
		return getDefaultCardFollowThemeEnabled();
	}
	const stored = localStorage.getItem("cardFollowThemeEnabled");
	if (stored === null) {
		return getDefaultCardFollowThemeEnabled();
	}
	return stored === "true";
}

export function setCardFollowThemeEnabled(enabled: boolean): void {
	if (
		typeof localStorage === "undefined" ||
		typeof localStorage.setItem !== "function"
	) {
		return;
	}
	localStorage.setItem("cardFollowThemeEnabled", String(enabled));
	if (enabled) {
		document.body.classList.add("card-follow-theme-hue");
	} else {
		document.body.classList.remove("card-follow-theme-hue");
	}
}

// ── 站内桌宠换皮（访客偏好）────────────────────────────────

const PET_SELECTION_STORAGE_KEY = "firefly-sprite-pet-id-v1";

export function getDefaultPetSelection(): "default" {
	return "default";
}

export function getStoredPetSelection(): string {
	if (
		typeof localStorage === "undefined" ||
		typeof localStorage.getItem !== "function"
	) {
		return getDefaultPetSelection();
	}
	try {
		const raw = localStorage.getItem(PET_SELECTION_STORAGE_KEY);
		if (!raw || raw === "default") return "default";
		if (isPickerPetId(raw)) return raw;
		return getDefaultPetSelection();
	} catch {
		return getDefaultPetSelection();
	}
}

/** 写入选宠并广播，供 SpritePet 即时换皮 */
export function setPetSelection(petId: string): void {
	const value =
		petId === "default" || isPickerPetId(petId) ? petId : "default";
	if (
		typeof localStorage !== "undefined" &&
		typeof localStorage.setItem === "function"
	) {
		try {
			localStorage.setItem(PET_SELECTION_STORAGE_KEY, value);
		} catch {
			/* ignore */
		}
	}
	if (typeof window !== "undefined") {
		window.dispatchEvent(
			new CustomEvent("firefly:pet-change", {
				detail: { petId: value },
			}),
		);
	}
}

const AVATAR_FRAME_STORAGE_KEY = "avatarFrameId";

const AVATAR_FRAME_IDS: AvatarFrameId[] = [
	"none",
	"C3-conic-spin",
	"C2-dual-soft",
	"C6-metallic",
	"C5-stars-css",
	"S3-metallic",
	"S6-laurel",
];

function isAvatarFrameId(id: string): id is AvatarFrameId {
	return (AVATAR_FRAME_IDS as string[]).includes(id);
}

export function getDefaultAvatarFrameId(): AvatarFrameId {
	const cfg = profileConfig.avatarFrame;
	if (!cfg || cfg.enabled === false) return "none";
	const raw = cfg.defaultId || "S3-metallic";
	return isAvatarFrameId(raw) ? raw : "S3-metallic";
}

export function getStoredAvatarFrameId(): AvatarFrameId {
	if (
		typeof localStorage === "undefined" ||
		typeof localStorage.getItem !== "function"
	) {
		return getDefaultAvatarFrameId();
	}
	try {
		const raw = localStorage.getItem(AVATAR_FRAME_STORAGE_KEY);
		if (!raw) return getDefaultAvatarFrameId();
		if (isAvatarFrameId(raw)) return raw;
		return getDefaultAvatarFrameId();
	} catch {
		return getDefaultAvatarFrameId();
	}
}

/** 写入 html[data-avatar-frame] 并广播，供 Profile / 设置面板同步 */
export function applyAvatarFrameToDocument(id: AvatarFrameId): void {
	if (typeof document === "undefined") return;
	document.documentElement.setAttribute("data-avatar-frame", id);
	if (typeof window !== "undefined") {
		window.dispatchEvent(
			new CustomEvent("firefly:avatar-frame-change", {
				detail: { id },
			}),
		);
	}
}

export function setAvatarFrameId(id: string): void {
	const value: AvatarFrameId = isAvatarFrameId(id)
		? id
		: getDefaultAvatarFrameId();
	if (
		typeof localStorage !== "undefined" &&
		typeof localStorage.setItem === "function"
	) {
		try {
			localStorage.setItem(AVATAR_FRAME_STORAGE_KEY, value);
		} catch {
			/* ignore */
		}
	}
	applyAvatarFrameToDocument(value);
}

export function initAvatarFrame(): void {
	if (profileConfig.avatarFrame?.enabled === false) {
		applyAvatarFrameToDocument("none");
		return;
	}
	applyAvatarFrameToDocument(getStoredAvatarFrameId());
}

