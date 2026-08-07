// 分层时钟配置类型定义

/** 天空昼夜模式：auto=跟随站点主题；day/night=强制；off=关闭天空层 */
export type LayeredClockSkyMode = "auto" | "day" | "night" | "off";

/** 天气场景（WMO weather_code 映射后的枚举） */
export type LayeredClockWeatherScene =
	| "clear"
	| "cloudy"
	| "rain"
	| "snow"
	| "fog"
	| "thunder";

export interface LayeredClockWeatherConfig {
	// 是否启用天气场景（需要下方经纬度）
	enable: boolean;
	// 站长所在城市纬度（Open-Meteo 查询用）
	latitude: number;
	// 站长所在城市经度
	longitude: number;
	// 天气缓存/刷新间隔（分钟）
	refreshMinutes: number;
}

/** 天空 GIF 资产（MiniMax 视频→GIF；未就绪时 CSS 兜底） */
export interface LayeredClockSkyAssetsConfig {
	// 是否启用 GIF 天空层
	enable: boolean;
	// 资产根路径（public 下）
	basePath: string;
	// 晴空白天天空
	day: string;
	// 晴朗夜晚天空
	night: string;
	// 各天气 overlay（clear 无 overlay）
	weather: Record<LayeredClockWeatherScene, string>;
}

export interface LayeredClockConfig {
	skyMode: LayeredClockSkyMode;
	weather: LayeredClockWeatherConfig;
	skyAssets: LayeredClockSkyAssetsConfig;
}
