export type DynamicConfig = {
	title?: string;
	description?: string;
	/** 动态头像和名称的跳转地址，支持站内路径或完整 URL */
	profileUrl?: string;
	showComment?: boolean;
	itemsPerPage?: number;
	/**
	 * 公屏默认定位文案（只展示地址，不展示 IP）。
	 * 故意不用浏览器/代理 IP 反查，避免 VPN 漂到国外。
	 * 单条 frontmatter `location` 非空时优先用单条；空则回落本字段。
	 */
	defaultLocation?: string;
	// 动态数据 json 地址，本地默认 "/api/dynamic.json"
	// 可改为第三方接口地址
	// 数据结构可打开上方链接地址参考
	// 当 memos.enable 为 true 时，此配置会被忽略
	apiUrl?: string;
	// Memos 配置
	memos?: DynamicMemocsConfig;
};

export type DynamicMemocsConfig = {
	/** 是否启用 Memos 数据源 */
	enable: boolean;
	/** Memos 实例地址，如 "https://memos.example.com" */
	apiUrl: string;
	/** Memos 用户标识，如 "users/your-username"，用于过滤指定用户的动态 */
	parent?: string;
};
