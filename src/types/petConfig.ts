import type {
	DualRoutePetId,
	PickerPetId,
} from "@/lib/pets/builtinPets";

export type SpritePetRoamConfig = {
	/** 浏览态是否在视口内侧栏卡之间游走 */
	enable: boolean;
	/** 卡片间正常停留时长（ms）；默认固定 7500，不随随机缩短 */
	intervalMs: number;
	/** 停留下限（ms）；与 intervalMs 对齐可关掉随机缩短 */
	minIntervalMs: number;
	/** 停留随机抖动（ms）；0 = 不抖动，严格用 intervalMs */
	jitterMs: number;
	/** 钻洞淡出/淡入单段时长（ms） */
	fadeMs: number;
	/** 淡出后、淡入前在「洞里」停顿（ms） */
	portalHoldMs: number;
	/** 当前卡滚出视口后，再等多久才换锚（ms）；避免狂滑闪跳 */
	scrollLeaveDelayMs: number;
	/** 用户松开拖拽后，多久再恢复卡片游走（ms）；快速倒计时，约 2s */
	resumeAfterDragMs: number;
	/**
	 * 近距小跑阈值（px，视口距离）。
	 * 同栏且距离 ≤ 此值时插值小跑；否则 / 跨栏 / reduced-motion 走钻洞。
	 */
	nearMoveMaxPx: number;
	/** 近距小跑插值时长（ms） */
	nearMoveMs: number;
	/**
	 * 侧栏失衡：日历底到视口底空隙 ≥ 此值（px）时钉宠停游走。
	 * 默认 160。
	 */
	balanceParkMinGapPx: number;
	/** @deprecated 已改为钻洞换位，保留字段兼容旧配置 */
	moveDurationMs?: number;
	/**
	 * 拖拽放下后是否永久停游走。
	 * 现默认 false：松开后走 resumeAfterDragMs 快速倒计时再继续换卡。
	 */
	pauseWhenPinned: boolean;
	/** 这些路径前缀下停用游走（只停靠），如 /ask 聊天页避免盖住按钮吃点击 */
	disableOnPathPrefixes?: string[];
};

export type SpritePetConfig = {
	/** 是否启用站内桌宠（与 Spine / Live2D 互斥，三者最多开一个） */
	enable: boolean;
	/** 浏览态（非文章页）桌宠 — 仅 default 模式 */
	defaultPetId: DualRoutePetId;
	/** 文章页 `/posts/*` 桌宠 — 仅 default 模式 */
	postPetId: DualRoutePetId;
	/**
	 * 是否在显示设置中提供访客换皮。
	 * 可选列表见 builtinPets.PICKER_PET_IDS。
	 */
	pickerEnabled: boolean;
	/** 设置面板展示的可选皮（须为 PickerPetId） */
	pickerPetIds: readonly PickerPetId[];
	/** 显示位置 */
	position: "bottom-left" | "bottom-right";
	/** 浏览态回退锚点 / 非文章页默认偏移（px） */
	offset: { x: number; y: number };
	/**
	 * 文章页视口定格偏移（px）。
	 * 缺省跟 `offset`；宜加大 x，避开右侧浮动控件（评论 / 回首页 / 回顶）。
	 */
	postOffset?: { x: number; y: number };
	/** 宠物显示宽度（px），高度按 atlas 比例推算；建议 96–192 */
	size: number;
	/** 是否播放动画 */
	motionEnabled: boolean;
	/** 是否允许拖拽并记忆位置 */
	draggable: boolean;
	/** 点击宠物本体时播放交互动作（分部位：头/身/脚） */
	clickInteract: boolean;
	/**
	 * 悬停是否视线跟随指针。
	 * 仅对 atlas v2（含 look 行）的当前宠生效；classic-8x9 运行时强制关闭。
	 */
	lookFollow: boolean;
	/** 点击站点常用控件时，桌宠联动反应 */
	reactToSiteUi: boolean;
	responsive: {
		/** 浏览态（非文章）是否在窄屏隐藏 */
		hideOnMobileBrowse: boolean;
		/** 文章页是否在窄屏隐藏 */
		hideOnMobilePost: boolean;
		mobileBreakpoint: number;
	};
	/** 浏览态视口内卡片游走（Maid 或访客覆盖皮） */
	roam: SpritePetRoamConfig;
	zIndex: number;
};
