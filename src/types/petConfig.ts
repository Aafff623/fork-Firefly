import type { BuiltinPetId } from "@/lib/pets/builtinPets";

export type SpritePetConfig = {
	/** 是否启用站内桌宠（与 Spine / Live2D 互斥，三者最多开一个） */
	enable: boolean;
	/** 内置宠物 ID */
	petId: BuiltinPetId;
	/** 显示位置 */
	position: "bottom-left" | "bottom-right";
	/** 距离边缘偏移（px） */
	offset: { x: number; y: number };
	/** 宠物显示宽度（px），高度按 atlas 比例推算；建议 96–192 */
	size: number;
	/** 是否播放动画 */
	motionEnabled: boolean;
	/** 是否允许拖拽并记忆位置 */
	draggable: boolean;
	/** 点击宠物本体时播放交互动作（分部位：头/身/脚） */
	clickInteract: boolean;
	/** 悬停是否视线跟随指针 */
	lookFollow: boolean;
	/** 点击站点常用控件时，桌宠联动反应 */
	reactToSiteUi: boolean;
	responsive: {
		hideOnMobile: boolean;
		mobileBreakpoint: number;
	};
	zIndex: number;
};
