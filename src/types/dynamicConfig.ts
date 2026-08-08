export type DynamicLocationConfig = {
	/**
	 * 常驻地 / IP 失败时的回落文案（只展示地址，不展示 IP）。
	 * 例：`山西 · 中北大学`
	 */
	home: string;
	/**
	 * 发布时是否尝试直连 IP 粗定位（默认 true）。
	 * 必须绕开 HTTP(S)_PROXY，避免 VPN 漂城。
	 */
	ipGeo?: boolean;
};

export type DynamicConfig = {
	title?: string;
	description?: string;
	/** 动态头像和名称的跳转地址，支持站内路径或完整 URL */
	profileUrl?: string;
	showComment?: boolean;
	/** 滚动懒加载每批条数（首屏 SSR 同批） */
	itemsPerPage?: number;
	/**
	 * @deprecated 用 `location.home`；保留作旧配置兼容，load 时仍可读。
	 */
	defaultLocation?: string;
	/** 发布时定位（方案 A）：写入 frontmatter，展示只读文案 */
	location?: DynamicLocationConfig;
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
