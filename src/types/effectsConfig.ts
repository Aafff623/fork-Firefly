export type SakuraConfig = {
	enable: boolean; // 是否启用樱花特效
	sakuraNum: number; // 樱花数量，默认21
	limitTimes: number; // 樱花越界限制次数，-1为无限循环
	size: {
		min: number; // 樱花最小尺寸倍数
		max: number; // 樱花最大尺寸倍数
	};
	opacity: {
		min: number; // 樱花最小不透明度
		max: number; // 樱花最大不透明度
	};
	speed: {
		horizontal: {
			min: number; // 水平移动速度最小值
			max: number; // 水平移动速度最大值
		};
		vertical: {
			min: number; // 垂直移动速度最小值
			max: number; // 垂直移动速度最大值
		};
		rotation: number; // 旋转速度
		fadeSpeed: number; // 消失速度，不应大于最小不透明度
	};
	zIndex: number; // 层级，确保樱花在合适的层级显示
};

/** 桌宠 / 礼盒等短时环境特效（E04/E05/E08/E09） */
export type AmbientFxConfig = {
	enable: boolean;
	/** 桌宠双击：yzhan firefly / butterfly */
	petYzhanEnable: boolean;
	petBurstMs: number;
	/** 礼盒开盖：canvas-confetti */
	giftConfettiEnable: boolean;
	/** 礼盒「我已阅读」：tsParticles */
	giftTsParticlesEnable: boolean;
	giftTsParticlesMs: number;
};
