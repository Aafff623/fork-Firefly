import type { DisplaySettingsConfig } from "../types/displaySettingsConfig";

// 显示设置面板开关配置
// 集中管理设置面板中所有可切换项的开关
// 方便统一控制哪些设置项对用户可见
// 也方便进行调试预览效果

export const displaySettingsConfig: DisplaySettingsConfig = {
	// ── 外观 (Appearance) ──────────────────────────────────

	// 主题色选择器开关（站点固定主题色，不开放调色）
	themeColorSwitchable: false,

	// 文章列表布局切换开关（列表 / 卡片网格 / 瀑布流）
	layoutSwitchable: true,

	// 卡片边框和阴影开关（默认常开，不在面板暴露）
	cardBorderSwitchable: false,

	// 卡片风格跟随主题色开关（不需要此能力）
	cardFollowThemeSwitchable: false,

	// 笔记引用框（附件下载卡片）样式开关
	noteCardSwitchable: true,

	// ── 壁纸 (Wallpaper) ──────────────────────────────────

	// 壁纸模式切换开关（导航栏入口改为壁纸面板）
	wallpaperModeSwitchable: true,

	// 水波纹动画开关
	wavesSwitchable: true,

	// 渐变过渡效果开关
	gradientSwitchable: true,

	// 横幅标题显示开关
	bannerTitleSwitchable: true,

	// 壁纸轮播开关
	bannerCarouselSwitchable: true,

	// 全屏透明模式参数调节开关（固定配置值，面板不暴露滑块）
	// 设为 false 关闭所有滑块，或用对象形式单独控制每个滑块
	overlaySwitchable: false,

	// ── 特效 (Effects) ────────────────────────────────────

	// 樱花特效开关（设置面板 Effects 页）
	sakuraSwitchable: true,

	// ── 桌宠 (Pets) ──────────────────────────────────────

	// 桌宠换皮 Tab（内容列表以 spritePetConfig.pickerPetIds 为准）
	petPickerSwitchable: true,

	// 头像边框选择（外观 Tab；目录见 profileConfig.avatarFrame）
	avatarFrameSwitchable: true,
};
