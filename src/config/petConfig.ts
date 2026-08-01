import type { SpritePetConfig } from "../types/petConfig";

/**
 * 站内桌宠（spritesheet）配置。
 * 动画与角色资源移植自 cc-haha（MIT）：https://github.com/NanmiCoder/cc-haha
 *
 * 与 Spine / Live2D 互斥：三者最多同时启用一个。
 * 若多个 enable=true，运行时优先桌宠 → Spine → Live2D。
 */
export const spritePetConfig: SpritePetConfig = {
	// 桌宠开关（默认关闭，打开后与看板娘互斥）
	enable: true,

	// 内置角色：dada-code | huhu-plan | bubu-fix | huihui-build
	petId: "dada-code",

	position: "bottom-left",
	offset: { x: 12, y: 12 },

	// 显示宽度（px），高度按 192:208 推算
	size: 128,

	motionEnabled: true,
	draggable: true,
	clickWave: true,
	lookFollow: true,

	responsive: {
		hideOnMobile: true,
		mobileBreakpoint: 768,
	},

	zIndex: 1000,
};
