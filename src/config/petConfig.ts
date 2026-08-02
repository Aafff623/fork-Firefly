import type { SpritePetConfig } from "../types/petConfig";

/**
 * 站内桌宠（spritesheet）配置。
 * 动画与角色资源移植自 cc-haha（MIT）：https://github.com/NanmiCoder/cc-haha
 *
 * 与 Spine / Live2D 互斥：三者最多同时启用一个。
 * 若多个 enable=true，运行时优先桌宠 → Spine → Live2D。
 */
export const spritePetConfig: SpritePetConfig = {
	// 桌宠开关
	enable: true,

	// 搭搭：帧偏移微调更完整，动作观感更稳
	petId: "dada-code",

	position: "bottom-left",
	offset: { x: 12, y: 12 },

	// 显示宽度（px），高度按 192:208 推算
	size: 128,

	motionEnabled: true,
	draggable: true,
	clickInteract: true,
	lookFollow: true,
	// 点主题切换 / 搜索 / 回顶等控件时，桌宠跟着做对应动作
	reactToSiteUi: true,

	responsive: {
		hideOnMobile: true,
		mobileBreakpoint: 768,
	},

	// 须高于主内容层(z-30)与 sticky 侧栏；与 FloatingControls 同级
	zIndex: 1100,
};
