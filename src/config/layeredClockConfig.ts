import type { LayeredClockConfig } from "../types/layeredClockConfig";

const CLOCK_SKY_BASE = "/assets/images/widgets/clock";

// 分层时钟配置 - 天空层（昼夜）+ 天气场景 + GIF 资产
export const layeredClockConfig: LayeredClockConfig = {
	// 昼夜模式：auto 跟随站点主题（19:00 自动入夜时钟面同步入夜）
	skyMode: "auto",

	weather: {
		// TODO: 填入站长所在城市经纬度后置 true（如太原 37.87 / 112.55）
		enable: false,
		latitude: 0,
		longitude: 0,
		refreshMinutes: 30,
	},

	skyAssets: {
		enable: true,
		basePath: CLOCK_SKY_BASE,
		day: `${CLOCK_SKY_BASE}/day-clear.gif`,
		night: `${CLOCK_SKY_BASE}/night-clear.gif`,
		weather: {
			clear: "",
			cloudy: `${CLOCK_SKY_BASE}/weather-cloudy.gif`,
			rain: `${CLOCK_SKY_BASE}/weather-rain.gif`,
			snow: `${CLOCK_SKY_BASE}/weather-snow.gif`,
			fog: `${CLOCK_SKY_BASE}/weather-fog.gif`,
			thunder: `${CLOCK_SKY_BASE}/weather-thunder.gif`,
		},
	},
};
