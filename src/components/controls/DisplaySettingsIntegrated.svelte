<script lang="ts">
import {
	WALLPAPER_BANNER,
	WALLPAPER_FULLSCREEN,
	WALLPAPER_NONE,
	WALLPAPER_OVERLAY,
} from "@constants/constants";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import {
	getDefaultBannerCarouselEnabled,
	getDefaultBannerTitleEnabled,
	getDefaultCardBorderEnabled,
	getDefaultCardFollowThemeEnabled,
	getDefaultGradientEnabled,
	getDefaultHue,
	getDefaultOverlayBlur,
	getDefaultOverlayCardOpacity,
	getDefaultOverlayOpacity,
	getDefaultPetSelection,
	getDefaultSakuraEnabled,
	getDefaultWavesEnabled,
	getHue,
	getStoredBannerCarouselEnabled,
	getStoredBannerTitleEnabled,
	getStoredCardBorderEnabled,
	getStoredCardFollowThemeEnabled,
	getStoredGradientEnabled,
	getStoredOverlayBlur,
	getStoredOverlayCardOpacity,
	getStoredOverlayOpacity,
	getStoredPetSelection,
	getStoredSakuraEnabled,
	getStoredWallpaperMode,
	getStoredWavesEnabled,
	setBannerCarouselEnabled,
	setBannerTitleEnabled,
	setCardBorderEnabled,
	setCardFollowThemeEnabled,
	setGradientEnabled,
	getDefaultNoteCardEnabled,
	getStoredNoteCardEnabled,
	setNoteCardEnabled,
	setHue,
	setOverlayBlur,
	setOverlayCardOpacity,
	setOverlayOpacity,
	setPetSelection,
	setSakuraEnabled,
	setWallpaperMode,
	setWavesEnabled,
} from "@utils/setting-utils";
import { onMount } from "svelte";
import Icon from "@/components/common/Icon.svelte";
import {
	backgroundWallpaper,
	displaySettingsConfig,
	siteConfig,
	spritePetConfig,
} from "@/config";
import { findBuiltinPet } from "@/lib/pets/builtinPets";
import type { WALLPAPER_MODE } from "@/types/config";

type OverlaySliderItem = {
	key: "opacity" | "blur" | "cardOpacity";
	enabled: boolean;
	label: string;
	displayValue: string;
	ariaLabel: string;
	min: number;
	max: number;
	step: number;
	value: number;
	onValueChange: (value: number) => void;
};

type TabKey = "appearance" | "wallpaper" | "effects" | "pets";

let hue = $state(getHue());
const defaultHue = getDefaultHue();
let wallpaperMode: WALLPAPER_MODE = $state(backgroundWallpaper.mode);
const defaultWallpaperMode = backgroundWallpaper.mode;
type PostListLayoutMode = "list" | "grid" | "waterfall";
let currentLayout: PostListLayoutMode = $state("list");
const defaultLayout = siteConfig.postListLayout.defaultMode;
const mobileDefaultLayout =
	siteConfig.postListLayout.mobileDefaultMode || defaultLayout;
let mounted = $state(false);
let isSmallScreen = $state(
	typeof window !== "undefined" ? window.innerWidth < 1200 : false,
);
let isMobileWidth = $state(
	typeof window !== "undefined" ? window.innerWidth < 780 : false,
);
let isSwitching = $state(false);
let wavesEnabled = $state(true);
const defaultWavesEnabled = getDefaultWavesEnabled();
let gradientEnabled = $state(true);
const defaultGradientEnabled = getDefaultGradientEnabled();
let bannerTitleEnabled = $state(true);
const defaultBannerTitleEnabled = getDefaultBannerTitleEnabled();
let bannerCarouselEnabled = $state(true);
const defaultBannerCarouselEnabled = getDefaultBannerCarouselEnabled();
let sakuraEnabled = $state(false);
const defaultSakuraEnabled = getDefaultSakuraEnabled();
let overlayOpacity = $state(getDefaultOverlayOpacity());
const defaultOverlayOpacity = getDefaultOverlayOpacity();
let overlayBlur = $state(getDefaultOverlayBlur());
const defaultOverlayBlur = getDefaultOverlayBlur();
let overlayCardOpacity = $state(getDefaultOverlayCardOpacity());
const defaultOverlayCardOpacity = getDefaultOverlayCardOpacity();
let cardBorderEnabled = $state(false);
const defaultCardBorderEnabled = getDefaultCardBorderEnabled();
let cardFollowThemeEnabled = $state(false);
const defaultCardFollowThemeEnabled = getDefaultCardFollowThemeEnabled();
let noteCardEnabled = $state(true);
const defaultNoteCardEnabled = getDefaultNoteCardEnabled();

const isWallpaperSwitchable = displaySettingsConfig.wallpaperModeSwitchable;
const allowLayoutSwitch = displaySettingsConfig.layoutSwitchable;
let effectiveDefaultLayout = $derived(
	isMobileWidth ? mobileDefaultLayout : defaultLayout,
);
const showThemeColor = displaySettingsConfig.themeColorSwitchable;
const isWavesSwitchable = displaySettingsConfig.wavesSwitchable;
const isGradientSwitchable = displaySettingsConfig.gradientSwitchable;
// 检查是否启用横幅标题配置（功能开关，非用户切换开关）
const isBannerTitleEnabled =
	backgroundWallpaper.common?.homeText?.enable ?? false;
const isBannerTitleSwitchable =
	isBannerTitleEnabled && displaySettingsConfig.bannerTitleSwitchable;
const isBannerCarouselSwitchable =
	displaySettingsConfig.bannerCarouselSwitchable;
const isSakuraSwitchable = displaySettingsConfig.sakuraSwitchable;
const isCardBorderSwitchable = displaySettingsConfig.cardBorderSwitchable;
const isCardFollowThemeSwitchable =
	displaySettingsConfig.cardFollowThemeSwitchable;
const isNoteCardSwitchable = displaySettingsConfig.noteCardSwitchable;
const isPetPickerSwitchable =
	displaySettingsConfig.petPickerSwitchable &&
	spritePetConfig.enable &&
	spritePetConfig.pickerEnabled;
const pickerPets = isPetPickerSwitchable
	? spritePetConfig.pickerPetIds.map((id) => findBuiltinPet(id))
	: [];
let selectedPetId = $state(getStoredPetSelection());
const defaultPetSelection = getDefaultPetSelection();
// 是否有任何横幅设置可显示（后续添加新设置时在此处添加条件）
const hasBannerSettings =
	isWavesSwitchable ||
	isGradientSwitchable ||
	isBannerTitleSwitchable ||
	isBannerCarouselSwitchable;
const overlaySwitchableConfig = displaySettingsConfig.overlaySwitchable;
const isOverlaySettingsSwitchable =
	typeof overlaySwitchableConfig === "boolean" ? overlaySwitchableConfig : true;
const isOverlayOpacitySwitchable =
	typeof overlaySwitchableConfig === "boolean"
		? overlaySwitchableConfig
		: (overlaySwitchableConfig.opacity ?? false);
const isOverlayBlurSwitchable =
	typeof overlaySwitchableConfig === "boolean"
		? overlaySwitchableConfig
		: (overlaySwitchableConfig.blur ?? false);
const isOverlayCardOpacitySwitchable =
	typeof overlaySwitchableConfig === "boolean"
		? overlaySwitchableConfig
		: (overlaySwitchableConfig.cardOpacity ?? false);
const hasOverlaySettings =
	isOverlaySettingsSwitchable &&
	(isOverlayOpacitySwitchable ||
		isOverlayBlurSwitchable ||
		isOverlayCardOpacitySwitchable);
let overlaySettingsIsDefault = $derived(
	(!isOverlayOpacitySwitchable || overlayOpacity === defaultOverlayOpacity) &&
		(!isOverlayBlurSwitchable || overlayBlur === defaultOverlayBlur) &&
		(!isOverlayCardOpacitySwitchable ||
			overlayCardOpacity === defaultOverlayCardOpacity),
);
// 横幅设置是否全部为默认值（用于控制恢复默认按钮的显隐）
let bannerSettingsIsDefault = $derived(
	(!isBannerTitleSwitchable ||
		bannerTitleEnabled === defaultBannerTitleEnabled) &&
		(!isWavesSwitchable || wavesEnabled === defaultWavesEnabled) &&
		(!isGradientSwitchable || gradientEnabled === defaultGradientEnabled) &&
		(!isBannerCarouselSwitchable ||
			bannerCarouselEnabled === defaultBannerCarouselEnabled),
);
let cardSettingsIsDefault = $derived(
	(!isCardBorderSwitchable || cardBorderEnabled === defaultCardBorderEnabled) &&
		(!isCardFollowThemeSwitchable ||
			cardFollowThemeEnabled === defaultCardFollowThemeEnabled) &&
		(!isNoteCardSwitchable || noteCardEnabled === defaultNoteCardEnabled),
);
const hasAnyContent =
	showThemeColor ||
	isWallpaperSwitchable ||
	allowLayoutSwitch ||
	hasBannerSettings ||
	hasOverlaySettings ||
	isSakuraSwitchable ||
	isPetPickerSwitchable ||
	isNoteCardSwitchable;

// --- Tab visibility ---
const hasAppearanceTab = $derived(
	showThemeColor ||
		allowLayoutSwitch ||
		isCardBorderSwitchable ||
		isCardFollowThemeSwitchable ||
		isNoteCardSwitchable,
);
const hasWallpaperTab = $derived(
	isWallpaperSwitchable ||
		hasOverlaySettings ||
		((wallpaperMode === WALLPAPER_BANNER ||
			wallpaperMode === WALLPAPER_FULLSCREEN) &&
			hasBannerSettings),
);
const hasEffectsTab = $derived(isSakuraSwitchable);
const hasPetsTab = $derived(isPetPickerSwitchable);

let visibleTabs = $derived.by(() => {
	const tabs: { key: TabKey; icon: string; label: string }[] = [];
	if (hasAppearanceTab)
		tabs.push({
			key: "appearance",
			icon: "lucide:palette",
			label: i18n(I18nKey.settingsTabAppearance),
		});
	if (hasWallpaperTab)
		tabs.push({
			key: "wallpaper",
			icon: "lucide:image",
			label: i18n(I18nKey.settingsTabWallpaper),
		});
	if (hasEffectsTab)
		tabs.push({
			key: "effects",
			icon: "lucide:flower-2",
			label: i18n(I18nKey.settingsTabEffects),
		});
	if (hasPetsTab)
		tabs.push({
			key: "pets",
			icon: "lucide:cat",
			label: i18n(I18nKey.settingsTabPets),
		});
	return tabs;
});

let showTabBar = $derived(visibleTabs.length > 1);
// 外观关闭后默认打开壁纸页（导航栏入口已改为壁纸按钮）
let activeTab = $state<TabKey>(
	showThemeColor || allowLayoutSwitch || isCardBorderSwitchable || isCardFollowThemeSwitchable || isNoteCardSwitchable
		? "appearance"
		: "wallpaper",
);

// Auto-switch active tab if it becomes invisible
$effect(() => {
	if (!visibleTabs.find((t) => t.key === activeTab) && visibleTabs.length > 0) {
		activeTab = visibleTabs[0].key;
	}
});

// Auto-switch to wallpaper tab when entering overlay mode
$effect(() => {
	if (wallpaperMode === WALLPAPER_OVERLAY && hasOverlaySettings) {
		activeTab = "wallpaper";
	}
});

let overlaySliderItems = $derived<OverlaySliderItem[]>([
	{
		key: "opacity",
		enabled: isOverlayOpacitySwitchable,
		label: i18n(I18nKey.overlayOpacity),
		displayValue: `${Math.round(overlayOpacity * 100)}%`,
		ariaLabel: i18n(I18nKey.overlayOpacity),
		min: 20,
		max: 100,
		step: 1,
		value: Math.round(overlayOpacity * 100),
		onValueChange: (value) => {
			overlayOpacity = value / 100;
		},
	},
	{
		key: "blur",
		enabled: isOverlayBlurSwitchable,
		label: i18n(I18nKey.overlayBlur),
		displayValue: `${overlayBlur.toFixed(1)}px`,
		ariaLabel: i18n(I18nKey.overlayBlur),
		min: 0,
		max: 20,
		step: 0.5,
		value: overlayBlur,
		onValueChange: (value) => {
			overlayBlur = value;
		},
	},
	{
		key: "cardOpacity",
		enabled: isOverlayCardOpacitySwitchable,
		label: i18n(I18nKey.overlayCardOpacity),
		displayValue: `${Math.round(overlayCardOpacity * 100)}%`,
		ariaLabel: i18n(I18nKey.overlayCardOpacity),
		min: 20,
		max: 100,
		step: 1,
		value: Math.round(overlayCardOpacity * 100),
		onValueChange: (value) => {
			overlayCardOpacity = value / 100;
		},
	},
]);

function resetHue() {
	hue = getDefaultHue();
	requestAnimationFrame(refreshAllRangeProgress);
}

function resetWallpaperMode() {
	wallpaperMode = defaultWallpaperMode;
	setWallpaperMode(defaultWallpaperMode);
}

function resetLayout() {
	currentLayout = effectiveDefaultLayout;
	localStorage.removeItem("postListLayout");

	// 触发自定义事件，通知页面布局已改变
	const event = new CustomEvent("layoutChange", {
		detail: { layout: effectiveDefaultLayout },
	});
	window.dispatchEvent(event);
}

function selectPet(petId: string) {
	if (!mounted || selectedPetId === petId) return;
	selectedPetId = petId;
	setPetSelection(petId);
}

function resetPetSelection() {
	selectPet(defaultPetSelection);
}

function resetWavesEnabled() {
	wavesEnabled = defaultWavesEnabled;
	setWavesEnabled(defaultWavesEnabled);
}

function resetGradientEnabled() {
	gradientEnabled = defaultGradientEnabled;
	setGradientEnabled(defaultGradientEnabled);
}

function resetBannerSettings() {
	if (
		isBannerTitleSwitchable &&
		bannerTitleEnabled !== defaultBannerTitleEnabled
	) {
		bannerTitleEnabled = defaultBannerTitleEnabled;
		setBannerTitleEnabled(defaultBannerTitleEnabled);
	}
	if (isWavesSwitchable && wavesEnabled !== defaultWavesEnabled) {
		wavesEnabled = defaultWavesEnabled;
		setWavesEnabled(defaultWavesEnabled);
	}
	if (isGradientSwitchable && gradientEnabled !== defaultGradientEnabled) {
		gradientEnabled = defaultGradientEnabled;
		setGradientEnabled(defaultGradientEnabled);
	}
	if (
		isBannerCarouselSwitchable &&
		bannerCarouselEnabled !== defaultBannerCarouselEnabled
	) {
		bannerCarouselEnabled = defaultBannerCarouselEnabled;
		setBannerCarouselEnabled(defaultBannerCarouselEnabled);
	}
}

function resetOverlaySettings() {
	if (isOverlayOpacitySwitchable && overlayOpacity !== defaultOverlayOpacity) {
		overlayOpacity = defaultOverlayOpacity;
		setOverlayOpacity(defaultOverlayOpacity);
	}
	if (isOverlayBlurSwitchable && overlayBlur !== defaultOverlayBlur) {
		overlayBlur = defaultOverlayBlur;
		setOverlayBlur(defaultOverlayBlur);
	}
	if (
		isOverlayCardOpacitySwitchable &&
		overlayCardOpacity !== defaultOverlayCardOpacity
	) {
		overlayCardOpacity = defaultOverlayCardOpacity;
		setOverlayCardOpacity(defaultOverlayCardOpacity);
	}

	requestAnimationFrame(refreshAllRangeProgress);
}

function toggleWavesEnabled() {
	wavesEnabled = !wavesEnabled;
	setWavesEnabled(wavesEnabled);
}

function toggleGradientEnabled() {
	gradientEnabled = !gradientEnabled;
	setGradientEnabled(gradientEnabled);
}

function toggleBannerTitleEnabled() {
	bannerTitleEnabled = !bannerTitleEnabled;
	setBannerTitleEnabled(bannerTitleEnabled);
}

function toggleBannerCarouselEnabled() {
	bannerCarouselEnabled = !bannerCarouselEnabled;
	setBannerCarouselEnabled(bannerCarouselEnabled);
}

function toggleSakuraEnabled() {
	sakuraEnabled = !sakuraEnabled;
	setSakuraEnabled(sakuraEnabled);
}

function toggleCardBorderEnabled() {
	cardBorderEnabled = !cardBorderEnabled;
	setCardBorderEnabled(cardBorderEnabled);
}

function toggleCardFollowThemeEnabled() {
	cardFollowThemeEnabled = !cardFollowThemeEnabled;
	setCardFollowThemeEnabled(cardFollowThemeEnabled);
}

function toggleNoteCardEnabled() {
	noteCardEnabled = !noteCardEnabled;
	setNoteCardEnabled(noteCardEnabled);
}

function resetCardSettings() {
	if (
		isCardBorderSwitchable &&
		cardBorderEnabled !== defaultCardBorderEnabled
	) {
		cardBorderEnabled = defaultCardBorderEnabled;
		setCardBorderEnabled(defaultCardBorderEnabled);
	}
	if (
		isCardFollowThemeSwitchable &&
		cardFollowThemeEnabled !== defaultCardFollowThemeEnabled
	) {
		cardFollowThemeEnabled = defaultCardFollowThemeEnabled;
		setCardFollowThemeEnabled(defaultCardFollowThemeEnabled);
	}
	if (isNoteCardSwitchable && noteCardEnabled !== defaultNoteCardEnabled) {
		noteCardEnabled = defaultNoteCardEnabled;
		setNoteCardEnabled(defaultNoteCardEnabled);
	}
}

function switchWallpaperMode(newMode: WALLPAPER_MODE) {
	wallpaperMode = newMode;
	setWallpaperMode(newMode);
	window.scrollTo({ top: 0 });

	if (newMode === WALLPAPER_OVERLAY) {
		requestAnimationFrame(refreshAllRangeProgress);
	}
}

function checkScreenSize() {
	isSmallScreen = window.innerWidth < 1200;
	isMobileWidth = window.innerWidth < 780;
	// 低于380px强制卡片网格（列表过窄）
	if (window.innerWidth < 380 && currentLayout === "list") {
		setLayout("grid");
	}
}

function updateRangeProgress(input: HTMLInputElement) {
	const min = Number(input.min || 0);
	const max = Number(input.max || 100);
	const value = Number(input.value || 0);
	const progress = ((value - min) * 100) / (max - min || 1);
	input.style.setProperty(
		"--range-progress",
		`${Math.min(100, Math.max(0, progress))}%`,
	);
}

function refreshAllRangeProgress() {
	const panel = document.getElementById("display-setting");
	if (!panel) return;

	const rangeInputs = Array.from(
		panel.querySelectorAll('input[type="range"]'),
	) as HTMLInputElement[];

	rangeInputs.forEach((input) => {
		updateRangeProgress(input);
	});
}

function setLayout(layout: PostListLayoutMode) {
	if (!mounted || isSwitching || currentLayout === layout) return;

	isSwitching = true;
	currentLayout = layout;
	localStorage.setItem("postListLayout", currentLayout);

	window.dispatchEvent(
		new CustomEvent("layoutChange", {
			detail: { layout: currentLayout },
		}),
	);

	setTimeout(() => {
		isSwitching = false;
	}, 500);
}

onMount(() => {
	mounted = true;

	// 先恢复布局偏好，再跑视口校正（避免 <380 强制网格冲掉已存选择）
	const savedLayout = localStorage.getItem("postListLayout");
	if (
		savedLayout === "list" ||
		savedLayout === "grid" ||
		savedLayout === "waterfall"
	) {
		currentLayout = savedLayout;
	} else if (savedLayout === "brick") {
		// 砖石布局已下线，旧偏好回退到瀑布
		currentLayout = "waterfall";
		localStorage.setItem("postListLayout", "waterfall");
	} else {
		currentLayout =
			window.innerWidth < 780 ? mobileDefaultLayout : defaultLayout;
	}

	checkScreenSize();

	// 从localStorage读取保存的壁纸模式
	wallpaperMode = getStoredWallpaperMode();

	// 从localStorage读取水波纹动画状态
	wavesEnabled = getStoredWavesEnabled();

	// 从localStorage读取渐变过渡状态
	gradientEnabled = getStoredGradientEnabled();

	// 从localStorage读取横幅标题状态
	bannerTitleEnabled = getStoredBannerTitleEnabled();

	// 从localStorage读取横幅轮播状态
	bannerCarouselEnabled = getStoredBannerCarouselEnabled();

	// 从localStorage读取樱花特效状态（钉住或 Intro 进行中）
	sakuraEnabled =
		getStoredSakuraEnabled() ||
		document.documentElement.getAttribute("data-sakura-enabled") === "true";

	// 桌宠选中项
	selectedPetId = getStoredPetSelection();

	const handleSakuraIntroEnded = () => {
		sakuraEnabled = false;
	};
	window.addEventListener("sakuraIntroEnded", handleSakuraIntroEnded);

	// 从localStorage读取卡片样式状态
	cardBorderEnabled = getStoredCardBorderEnabled();
	cardFollowThemeEnabled = getStoredCardFollowThemeEnabled();
	noteCardEnabled = getStoredNoteCardEnabled();

	// 从localStorage读取全屏透明设置状态
	overlayOpacity = getStoredOverlayOpacity();
	overlayBlur = getStoredOverlayBlur();
	overlayCardOpacity = getStoredOverlayCardOpacity();

	// 监听窗口大小变化
	window.addEventListener("resize", checkScreenSize);

	return () => {
		window.removeEventListener("resize", checkScreenSize);
		window.removeEventListener("sakuraIntroEnded", handleSakuraIntroEnded);
	};
});

// 监听布局变化事件
onMount(() => {
	const handleCustomEvent = (event: Event) => {
		const customEvent = event as CustomEvent<{ layout: PostListLayoutMode }>;
		currentLayout = customEvent.detail.layout;
	};

	window.addEventListener("layoutChange", handleCustomEvent);

	return () => {
		window.removeEventListener("layoutChange", handleCustomEvent);
	};
});

onMount(() => {
	const panel = document.getElementById("display-setting");
	if (!panel) return;

	const handleRangeInput = (event: Event) => {
		const target = event.target;
		if (target instanceof HTMLInputElement && target.type === "range") {
			updateRangeProgress(target);
		}
	};

	refreshAllRangeProgress();
	panel.addEventListener("input", handleRangeInput);

	return () => {
		panel.removeEventListener("input", handleRangeInput);
	};
});

onMount(() => {
	const handleWallpaperModeChange = (event: Event) => {
		const customEvent = event as CustomEvent<{ mode: WALLPAPER_MODE }>;
		wallpaperMode = customEvent.detail.mode;
	};

	window.addEventListener("wallpaperModeChange", handleWallpaperModeChange);

	return () => {
		window.removeEventListener(
			"wallpaperModeChange",
			handleWallpaperModeChange,
		);
	};
});

$effect(() => {
	if (hue || hue === 0) {
		setHue(hue);
	}
});

$effect(() => {
	if (wallpaperMode === WALLPAPER_OVERLAY) {
		if (isOverlayOpacitySwitchable) {
			setOverlayOpacity(overlayOpacity);
		}
		if (isOverlayBlurSwitchable) {
			setOverlayBlur(overlayBlur);
		}
		if (isOverlayCardOpacitySwitchable) {
			setOverlayCardOpacity(overlayCardOpacity);
		}
	}
});

// Tab 切换后刷新滑块进度（overlay 滑块在 DOM 中才生效）
$effect(() => {
	// eslint-disable-next-line @typescript-eslint/no-unused-expressions
	activeTab;
	requestAnimationFrame(refreshAllRangeProgress);
});
</script>

{#if hasAnyContent}
<div id="display-setting" class="float-panel float-panel-closed absolute transition-all w-80 right-4 px-3 pt-0 pb-3 max-h-[80vh] overflow-y-auto">
	<!-- Tab Bar -->
	{#if showTabBar}
	<div class="flex border-b border-black/5 dark:border-white/10 -mx-1 mb-2">
		{#each visibleTabs as tab (tab.key)}
			<button
				class="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium transition-colors relative min-w-0
					{activeTab === tab.key ? 'text-(--primary)' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}"
				onclick={() => activeTab = tab.key}
			>
				<Icon icon={tab.icon} class="text-[0.875rem] shrink-0"></Icon>
				<span class="truncate">{tab.label}</span>
				{#if activeTab === tab.key}
					<div class="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-(--primary)"></div>
				{/if}
			</button>
		{/each}
	</div>
	{/if}

	<!-- Appearance Tab: Theme Color + Layout -->
	{#if activeTab === "appearance"}
		<!-- Theme Color Section -->
		{#if showThemeColor}
		<div class="">
			<div class="section-title">
				{i18n(I18nKey.themeColor)}
				<button aria-label="Reset to Default" class="btn-regular rounded-md active:scale-90"
						class:opacity-0={hue === defaultHue} class:pointer-events-none={hue === defaultHue} onclick={resetHue}>
					<div class="text-(--btn-content)">
						<Icon icon="lucide:rotate-ccw" class="text-[0.75rem]"></Icon>
					</div>
				</button>
				<div id="hueValue" class="transition bg-(--btn-regular-bg) rounded-md flex justify-center
				font-bold items-center text-(--btn-content)">
					{hue}
				</div>
			</div>
			<div class="w-full h-6 px-1 bg-[oklch(0.80_0.10_0)] dark:bg-[oklch(0.70_0.10_0)] rounded-sm select-none">
				<input aria-label={i18n(I18nKey.themeColor)} type="range" min="0" max="360" bind:value={hue}
					   class="slider" id="colorSlider" step="5" style="width: 100%">
			</div>
		</div>
		{/if}

		<!-- Layout Switch Section -->
		{#if allowLayoutSwitch}
		<div class="">
			<div class="section-title">
				{i18n(I18nKey.postListLayout)}
				<button aria-label="Reset to Default" class="btn-regular rounded-md active:scale-90"
						class:opacity-0={currentLayout === effectiveDefaultLayout} class:pointer-events-none={currentLayout === effectiveDefaultLayout} onclick={resetLayout}>
					<div class="text-(--btn-content)">
						<Icon icon="lucide:rotate-ccw" class="text-[0.75rem]"></Icon>
					</div>
				</button>
			</div>
			<div class="grid grid-cols-2 gap-1.5">
				<button
					aria-label={i18n(I18nKey.postListLayoutList)}
					class="btn-regular rounded-md py-2 px-2 flex items-center justify-center gap-1.5 active:scale-95 transition-all relative overflow-hidden"
					class:opacity-60={currentLayout !== 'list'}
					class:bg-(--btn-regular-bg-hover)={currentLayout === 'list'}
					disabled={isSwitching}
					onclick={() => setLayout('list')}
					title={i18n(I18nKey.postListLayoutList)}
				>
					<Icon icon="lucide:list" class="w-4 h-4 shrink-0"></Icon>
					<span class="text-xs font-medium">{i18n(I18nKey.postListLayoutList)}</span>
				</button>
				<button
					aria-label={i18n(I18nKey.postListLayoutGrid)}
					class="btn-regular rounded-md py-2 px-2 flex items-center justify-center gap-1.5 active:scale-95 transition-all relative overflow-hidden"
					class:opacity-60={currentLayout !== 'grid'}
					class:bg-(--btn-regular-bg-hover)={currentLayout === 'grid'}
					disabled={isSwitching}
					onclick={() => setLayout('grid')}
					title={i18n(I18nKey.postListLayoutGrid)}
				>
					<Icon icon="lucide:layout-grid" class="w-4 h-4 shrink-0"></Icon>
					<span class="text-xs font-medium">{i18n(I18nKey.postListLayoutGrid)}</span>
				</button>
				<button
					aria-label={i18n(I18nKey.postListLayoutWaterfall)}
					class="btn-regular rounded-md py-2 px-2 flex items-center justify-center gap-1.5 active:scale-95 transition-all relative overflow-hidden"
					class:opacity-60={currentLayout !== 'waterfall'}
					class:bg-(--btn-regular-bg-hover)={currentLayout === 'waterfall'}
					disabled={isSwitching}
					onclick={() => setLayout('waterfall')}
					title={i18n(I18nKey.postListLayoutWaterfall)}
				>
					<Icon icon="lucide:columns-3" class="w-4 h-4 shrink-0"></Icon>
					<span class="text-xs font-medium">{i18n(I18nKey.postListLayoutWaterfall)}</span>
				</button>
			</div>
		</div>
		{/if}

		<!-- Card Settings Section -->
		{#if isCardBorderSwitchable || isCardFollowThemeSwitchable}
		<div>
			<div class="section-title">
				{i18n(I18nKey.cardSettings)}
				<button aria-label="Reset to Default" class="btn-regular rounded-md active:scale-90"
						class:opacity-0={cardSettingsIsDefault} class:pointer-events-none={cardSettingsIsDefault} onclick={resetCardSettings}>
					<div class="text-(--btn-content)">
						<Icon icon="lucide:rotate-ccw" class="text-[0.75rem]"></Icon>
					</div>
				</button>
			</div>
			<div class="space-y-1">
				{#if isCardBorderSwitchable}
				<button
					class="w-full btn-regular rounded-md py-2 px-3 flex items-center gap-3 text-left active:scale-95 transition-all relative overflow-hidden"
					class:bg-(--btn-regular-bg-hover)={cardBorderEnabled}
					onclick={toggleCardBorderEnabled}
				>
					<Icon icon="lucide:square" class="text-[1.25rem] shrink-0"></Icon>
					<span class="text-sm flex-1">{i18n(I18nKey.cardBorder)}</span>
					<div class="w-10 h-5 rounded-full transition-all duration-200 relative"
						 class:bg-(--primary)={cardBorderEnabled}
						 class:bg-(--btn-regular-bg-active)={!cardBorderEnabled}>
						<div class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200"
							 class:left-0.5={!cardBorderEnabled}
							 class:left-5={cardBorderEnabled}></div>
					</div>
				</button>
				{/if}
				{#if isCardFollowThemeSwitchable}
				<button
					class="w-full btn-regular rounded-md py-2 px-3 flex items-center gap-3 text-left active:scale-95 transition-all relative overflow-hidden"
					class:bg-(--btn-regular-bg-hover)={cardFollowThemeEnabled}
					onclick={toggleCardFollowThemeEnabled}
				>
					<Icon icon="lucide:palette" class="text-[1.25rem] shrink-0"></Icon>
					<span class="text-sm flex-1">{i18n(I18nKey.cardFollowTheme)}</span>
					<div class="w-10 h-5 rounded-full transition-all duration-200 relative"
						 class:bg-(--primary)={cardFollowThemeEnabled}
						 class:bg-(--btn-regular-bg-active)={!cardFollowThemeEnabled}>
						<div class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200"
							 class:left-0.5={!cardFollowThemeEnabled}
							 class:left-5={cardFollowThemeEnabled}></div>
					</div>
				</button>
				{/if}
			</div>
		</div>
		{/if}

		<!-- Note Card Settings Section -->
		{#if isNoteCardSwitchable}
		<div>
			<div class="section-title">
				{i18n(I18nKey.noteCardSettings)}
				<button aria-label="Reset to Default" class="btn-regular rounded-md active:scale-90"
						class:opacity-0={noteCardEnabled === defaultNoteCardEnabled} class:pointer-events-none={noteCardEnabled === defaultNoteCardEnabled} onclick={() => { noteCardEnabled = defaultNoteCardEnabled; setNoteCardEnabled(defaultNoteCardEnabled); }}>
					<div class="text-(--btn-content)">
						<Icon icon="lucide:rotate-ccw" class="text-[0.75rem]"></Icon>
					</div>
				</button>
			</div>
			<div class="space-y-1">
				<button
					class="w-full btn-regular rounded-md py-2 px-3 flex items-center gap-3 text-left active:scale-95 transition-all relative overflow-hidden"
					class:bg-(--btn-regular-bg-hover)={noteCardEnabled}
					onclick={toggleNoteCardEnabled}
				>
					<Icon icon="lucide:file-text" class="text-[1.25rem] shrink-0"></Icon>
					<span class="text-sm flex-1">{i18n(I18nKey.noteCardEnabled)}</span>
					<div class="w-10 h-5 rounded-full transition-all duration-200 relative"
						 class:bg-(--primary)={noteCardEnabled}
						 class:bg-(--btn-regular-bg-active)={!noteCardEnabled}>
						<div class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200"
							 class:left-0.5={!noteCardEnabled}
							 class:left-5={noteCardEnabled}></div>
					</div>
				</button>
			</div>
		</div>
		{/if}
	{/if}

	<!-- Wallpaper Tab: Mode + Overlay + Banner Settings -->
	{#if activeTab === "wallpaper"}
		<!-- Wallpaper Mode Section -->
		{#if isWallpaperSwitchable}
		<div class="wallpaper-dense">
			<div class="section-title section-title--dense">
				{i18n(I18nKey.wallpaperMode)}
				<button aria-label="Reset to Default" class="btn-regular rounded-md active:scale-90"
						class:opacity-0={wallpaperMode === defaultWallpaperMode} class:pointer-events-none={wallpaperMode === defaultWallpaperMode} onclick={resetWallpaperMode}>
					<div class="text-(--btn-content)">
						<Icon icon="lucide:rotate-ccw" class="text-[0.75rem]"></Icon>
					</div>
				</button>
			</div>
			<div class="grid grid-cols-2 gap-1">
				<button
					class="btn-regular rounded-md py-1.5 px-2 flex items-center justify-center gap-1.5 active:scale-95 transition-all relative overflow-hidden"
					class:opacity-60={wallpaperMode !== WALLPAPER_BANNER}
					class:bg-(--btn-regular-bg-hover)={wallpaperMode === WALLPAPER_BANNER}
					onclick={() => switchWallpaperMode(WALLPAPER_BANNER)}
				>
					<Icon icon="lucide:image" class="text-[1rem] shrink-0"></Icon>
					<span class="text-[0.7rem] font-medium leading-tight">{i18n(I18nKey.wallpaperBannerMode)}</span>
				</button>
				<button
					class="btn-regular rounded-md py-1.5 px-2 flex items-center justify-center gap-1.5 active:scale-95 transition-all relative overflow-hidden"
					class:opacity-60={wallpaperMode !== WALLPAPER_FULLSCREEN}
					class:bg-(--btn-regular-bg-hover)={wallpaperMode === WALLPAPER_FULLSCREEN}
					onclick={() => switchWallpaperMode(WALLPAPER_FULLSCREEN)}
				>
					<Icon icon="lucide:image" class="text-[1rem] shrink-0"></Icon>
					<span class="text-[0.7rem] font-medium leading-tight">{i18n(I18nKey.wallpaperFullscreenMode)}</span>
				</button>
				<button
					class="btn-regular rounded-md py-1.5 px-2 flex items-center justify-center gap-1.5 active:scale-95 transition-all relative overflow-hidden"
					class:opacity-60={wallpaperMode !== WALLPAPER_OVERLAY}
					class:bg-(--btn-regular-bg-hover)={wallpaperMode === WALLPAPER_OVERLAY}
					onclick={() => switchWallpaperMode(WALLPAPER_OVERLAY)}
				>
					<Icon icon="lucide:maximize" class="text-[1rem] shrink-0"></Icon>
					<span class="text-[0.7rem] font-medium leading-tight">{i18n(I18nKey.wallpaperOverlayMode)}</span>
				</button>
				<button
					class="btn-regular rounded-md py-1.5 px-2 flex items-center justify-center gap-1.5 active:scale-95 transition-all relative overflow-hidden"
					class:opacity-60={wallpaperMode !== WALLPAPER_NONE}
					class:bg-(--btn-regular-bg-hover)={wallpaperMode === WALLPAPER_NONE}
					onclick={() => switchWallpaperMode(WALLPAPER_NONE)}
				>
					<Icon icon="lucide:image-off" class="text-[1rem] shrink-0"></Icon>
					<span class="text-[0.7rem] font-medium leading-tight">{i18n(I18nKey.wallpaperNoneMode)}</span>
				</button>
			</div>
		</div>
		{/if}

		<!-- Overlay Settings Section（横幅默认也保留透明参数调节） -->
		{#if (wallpaperMode === WALLPAPER_OVERLAY || wallpaperMode === WALLPAPER_BANNER) && hasOverlaySettings}
		<div class="">
			<div class="section-title">
				{i18n(I18nKey.overlaySettings)}
				<button aria-label="Reset to Default" class="btn-regular rounded-md active:scale-90"
						class:opacity-0={overlaySettingsIsDefault} class:pointer-events-none={overlaySettingsIsDefault} onclick={resetOverlaySettings}>
					<div class="text-(--btn-content)">
						<Icon icon="lucide:rotate-ccw" class="text-[0.75rem]"></Icon>
					</div>
				</button>
			</div>
			<div class="space-y-2">
				{#each overlaySliderItems as item (item.key)}
					{#if item.enabled}
						<div class="rounded-md bg-(--btn-regular-bg) p-2">
							<div class="flex items-center justify-between mb-1">
								<span class="text-xs font-medium text-(--btn-content) opacity-80">{item.label}</span>
								<span class="text-xs text-(--btn-content)">{item.displayValue}</span>
							</div>
							<input
								aria-label={item.ariaLabel}
								type="range"
								min={item.min}
								max={item.max}
								step={item.step}
								value={item.value}
								oninput={(e) => item.onValueChange(Number((e.currentTarget as HTMLInputElement).value))}
								class="slider w-full overlay-slider"
							/>
						</div>
					{/if}
				{/each}
			</div>
		</div>
		{/if}

		<!-- Banner Settings Section -->
		{#if (wallpaperMode === WALLPAPER_BANNER || wallpaperMode === WALLPAPER_FULLSCREEN) && hasBannerSettings}
		<div class="wallpaper-dense">
			<div class="section-title section-title--dense">
				{i18n(I18nKey.wallpaperSettings)}
				<button aria-label="Reset to Default" class="btn-regular rounded-md active:scale-90"
						class:opacity-0={bannerSettingsIsDefault} class:pointer-events-none={bannerSettingsIsDefault} onclick={resetBannerSettings}>
					<div class="text-(--btn-content)">
						<Icon icon="lucide:rotate-ccw" class="text-[0.75rem]"></Icon>
					</div>
				</button>
			</div>
			<!-- 2×2 紧凑开关，压低弹层高度 -->
			<div class="grid grid-cols-2 gap-1">
				{#if isBannerTitleSwitchable}
				<button
					class="btn-regular rounded-md py-1.5 px-2 flex items-center gap-1.5 text-left active:scale-95 transition-all relative overflow-hidden"
					class:bg-(--btn-regular-bg-hover)={bannerTitleEnabled}
					onclick={toggleBannerTitleEnabled}
				>
					<Icon icon="lucide:type" class="text-[1rem] shrink-0"></Icon>
					<span class="text-[0.7rem] flex-1 leading-tight">{i18n(I18nKey.wallpaperTitle)}</span>
					<div class="w-8 h-4 rounded-full transition-all duration-200 relative shrink-0"
						 class:bg-(--primary)={bannerTitleEnabled}
						 class:bg-(--btn-regular-bg-active)={!bannerTitleEnabled}>
						<div class="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all duration-200"
							 class:left-0.5={!bannerTitleEnabled}
							 class:left-4={bannerTitleEnabled}></div>
					</div>
				</button>
				{/if}
				{#if isBannerCarouselSwitchable}
				<button
					class="btn-regular rounded-md py-1.5 px-2 flex items-center gap-1.5 text-left active:scale-95 transition-all relative overflow-hidden"
					class:bg-(--btn-regular-bg-hover)={bannerCarouselEnabled}
					onclick={toggleBannerCarouselEnabled}
				>
					<Icon icon="lucide:gallery-horizontal" class="text-[1rem] shrink-0"></Icon>
					<span class="text-[0.7rem] flex-1 leading-tight">{i18n(I18nKey.wallpaperCarousel)}</span>
					<div class="w-8 h-4 rounded-full transition-all duration-200 relative shrink-0"
						 class:bg-(--primary)={bannerCarouselEnabled}
						 class:bg-(--btn-regular-bg-active)={!bannerCarouselEnabled}>
						<div class="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all duration-200"
							 class:left-0.5={!bannerCarouselEnabled}
							 class:left-4={bannerCarouselEnabled}></div>
					</div>
				</button>
				{/if}
				{#if isWavesSwitchable}
				<button
					class="btn-regular rounded-md py-1.5 px-2 flex items-center gap-1.5 text-left active:scale-95 transition-all relative overflow-hidden"
					class:bg-(--btn-regular-bg-hover)={wavesEnabled}
					onclick={toggleWavesEnabled}
				>
					<Icon icon="lucide:waves" class="text-[1rem] shrink-0"></Icon>
					<span class="text-[0.7rem] flex-1 leading-tight">{i18n(I18nKey.wavesAnimation)}</span>
					<div class="w-8 h-4 rounded-full transition-all duration-200 relative shrink-0"
						 class:bg-(--primary)={wavesEnabled}
						 class:bg-(--btn-regular-bg-active)={!wavesEnabled}>
						<div class="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all duration-200"
							 class:left-0.5={!wavesEnabled}
							 class:left-4={wavesEnabled}></div>
					</div>
				</button>
				{/if}
				{#if isGradientSwitchable}
				<button
					class="btn-regular rounded-md py-1.5 px-2 flex items-center gap-1.5 text-left active:scale-95 transition-all relative overflow-hidden"
					class:bg-(--btn-regular-bg-hover)={gradientEnabled}
					onclick={toggleGradientEnabled}
				>
					<Icon icon="lucide:blend" class="text-[1rem] shrink-0"></Icon>
					<span class="text-[0.7rem] flex-1 leading-tight">{i18n(I18nKey.gradientTransition)}</span>
					<div class="w-8 h-4 rounded-full transition-all duration-200 relative shrink-0"
						 class:bg-(--primary)={gradientEnabled}
						 class:bg-(--btn-regular-bg-active)={!gradientEnabled}>
						<div class="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all duration-200"
							 class:left-0.5={!gradientEnabled}
							 class:left-4={gradientEnabled}></div>
					</div>
				</button>
				{/if}
			</div>
		</div>
		{/if}
	{/if}

	<!-- Effects Tab: Sakura -->
	{#if activeTab === "effects"}
		{#if isSakuraSwitchable}
		<div class="">
			<div class="section-title">
				{i18n(I18nKey.effectsSettings)}
				<button aria-label="Reset to Default" class="btn-regular rounded-md active:scale-90"
						class:opacity-0={sakuraEnabled === defaultSakuraEnabled} class:pointer-events-none={sakuraEnabled === defaultSakuraEnabled} onclick={() => { sakuraEnabled = defaultSakuraEnabled; setSakuraEnabled(defaultSakuraEnabled); }}>
					<div class="text-(--btn-content)">
						<Icon icon="lucide:rotate-ccw" class="text-[0.75rem]"></Icon>
					</div>
				</button>
			</div>
			<button
				class="w-full btn-regular rounded-md py-2 px-3 flex items-center gap-3 text-left active:scale-95 transition-all relative overflow-hidden"
				class:bg-(--btn-regular-bg-hover)={sakuraEnabled}
				onclick={toggleSakuraEnabled}
			>
				<Icon icon="lucide:flower-2" class="text-[1.25rem] shrink-0"></Icon>
				<span class="text-sm flex-1">{i18n(I18nKey.sakuraEffect)}</span>
				<div class="w-10 h-5 rounded-full transition-all duration-200 relative"
					 class:bg-(--primary)={sakuraEnabled}
					 class:bg-(--btn-regular-bg-active)={!sakuraEnabled}>
					<div class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200"
						 class:left-0.5={!sakuraEnabled}
						 class:left-5={sakuraEnabled}></div>
				</div>
			</button>
		</div>
		{/if}
	{/if}

	<!-- Pets Tab: visitor skin picker -->
	{#if activeTab === "pets" && isPetPickerSwitchable}
		<div class="">
			<div class="section-title">
				{i18n(I18nKey.petPickerTitle)}
				<button
					aria-label="Reset to Default"
					class="btn-regular rounded-md active:scale-90"
					class:opacity-0={selectedPetId === defaultPetSelection}
					class:pointer-events-none={selectedPetId === defaultPetSelection}
					onclick={resetPetSelection}
				>
					<div class="text-(--btn-content)">
						<Icon icon="lucide:rotate-ccw" class="text-[0.75rem]"></Icon>
					</div>
				</button>
			</div>
			<div class="flex flex-col gap-1.5">
				<button
					type="button"
					class="pet-picker-item btn-regular rounded-md py-2 px-2.5 flex items-start gap-2.5 text-left active:scale-95 transition-all"
					class:pet-picker-item--active={selectedPetId === 'default'}
					onclick={() => selectPet('default')}
				>
					<span
						class="mt-0.5 w-3 h-3 rounded-full shrink-0 ring-1 ring-black/10 dark:ring-white/15"
						style="background:#5eb8ff"
					></span>
					<span class="min-w-0 flex-1">
						<span class="pet-picker-item__head flex items-center gap-1.5 min-w-0">
							<span class="pet-picker-item__title text-xs truncate">{i18n(I18nKey.petPickerDefault)}</span>
							{#if selectedPetId === 'default'}
								<span class="pet-picker-item__badge shrink-0">{i18n(I18nKey.petPickerCurrent)}</span>
							{/if}
						</span>
						<span class="pet-picker-item__sub block text-[0.65rem] leading-snug mt-0.5">
							{i18n(I18nKey.petPickerDefaultHint)}
						</span>
					</span>
				</button>
				{#each pickerPets as pet (pet.id)}
					<button
						type="button"
						class="pet-picker-item btn-regular rounded-md py-2 px-2.5 flex items-start gap-2.5 text-left active:scale-95 transition-all"
						class:pet-picker-item--active={selectedPetId === pet.id}
						onclick={() => selectPet(pet.id)}
						title={pet.description}
					>
						<span
							class="mt-0.5 w-3 h-3 rounded-full shrink-0 ring-1 ring-black/10 dark:ring-white/15"
							style={`background:${pet.accent}`}
						></span>
						<span class="min-w-0 flex-1">
							<span class="pet-picker-item__head flex items-center gap-1.5 min-w-0">
								<span class="pet-picker-item__title text-xs truncate">{pet.shortName}</span>
								{#if selectedPetId === pet.id}
									<span class="pet-picker-item__badge shrink-0">{i18n(I18nKey.petPickerCurrent)}</span>
								{/if}
							</span>
							<span class="pet-picker-item__sub block text-[0.65rem] leading-snug mt-0.5">
								{pet.displayName}
								{#if pet.licenseKind === "unknown"}
									· <span class="text-amber-600 dark:text-amber-400">{i18n(I18nKey.petPickerLicenseUnknown)}</span>
								{/if}
							</span>
						</span>
					</button>
				{/each}
			</div>
			<p class="pet-picker-footnote mt-2 text-[0.65rem] leading-snug">
				{i18n(I18nKey.petPickerAttribution)}
			</p>
		</div>
	{/if}
</div>
{/if}
