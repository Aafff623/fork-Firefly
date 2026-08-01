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
	/** 点击时是否播放挥手 */
	clickWave: boolean;
	/** 悬停是否视线跟随指针 */
	lookFollow: boolean;
	responsive: {
		hideOnMobile: boolean;
		mobileBreakpoint: number;
	};
	zIndex: number;
};
