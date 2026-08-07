import type { SpritePetConfig } from "../types/petConfig";

/**
 * 站内桌宠（spritesheet）配置。
 * 默认双 DeepSeek：浏览态 Maid · 文章页 OpenPet。
 * 访客换皮只影响浏览态；文章页始终 postPetId，不随设置覆盖。
 * 素材许可见 `public/pets/README.md` / `docs/knowledge/codex-pet-picker.md`。
 *
 * 与 Spine / Live2D 互斥：三者最多同时启用一个。
 * 若多个 enable=true，运行时优先桌宠 → Spine → Live2D。
 */
export const spritePetConfig: SpritePetConfig = {
	enable: true,

	defaultPetId: "maid-deepseek-whale",
	postPetId: "openpet-deepseek",

	pickerEnabled: true,
	pickerPetIds: [
		"diandian--lllucasxu",
		"claude--xiangking",
		"elaina--nyakku-shigure",
		"gpt-muse--opask",
		"gojo--lilokhalikfa",
	],

	// 回退锚点：侧栏「最新动态」不可见时用右下；首页优先贴动态卡（见 SpritePet）
	position: "bottom-right",
	offset: { x: 28, y: 96 },
	// 文章页：加大 right，躲开右侧评论 / 回首页 / 回顶三钮
	postOffset: { x: 100, y: 96 },

	// 显示宽度（px），高度按 192:208 推算
	size: 128,

	motionEnabled: true,
	draggable: true,
	clickInteract: true,
	// 仅 Maid（v2）生效；classic-8x9 运行时强制关
	lookFollow: true,
	// 点主题切换 / 搜索 / 回顶等控件时，桌宠跟着做对应动作
	reactToSiteUi: true,

	responsive: {
		// 手机正常浏览可见默认宠
		hideOnMobileBrowse: false,
		// 文章页窄屏隐藏，避免挡正文 / 回顶
		hideOnMobilePost: true,
		mobileBreakpoint: 768,
	},

	// 浏览态：侧栏卡片外侧留白游走（左留白朝右 / 右留白朝左；固定 7.5s）
	// 仅拖拽改坐标后：作废原目标 → 松开后 2s → 在当前视口卡里重新随机
	roam: {
		enable: true,
		intervalMs: 7_500,
		minIntervalMs: 7_500,
		jitterMs: 0,
		fadeMs: 380,
		portalHoldMs: 160,
		scrollLeaveDelayMs: 2_400,
		resumeAfterDragMs: 2_000,
		pauseWhenPinned: false,
	},

	// 须高于主内容层(z-30)与 sticky 侧栏；与 FloatingControls 同级
	zIndex: 1100,
};
