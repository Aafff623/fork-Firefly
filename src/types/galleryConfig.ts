// 相册元信息（用户在配置文件中填写）
export type GalleryAlbum = {
	id: string; // URL slug + 目录名，如 "japan-2025"
	name: string; // 相册名称
	description?: string; // 相册描述
	date?: string; // 日期
	location?: string; // 拍摄地点
	/** 相册一级分类（首页分类栏筛选） */
	category?: string;
	tags?: string[]; // 标签（卡片展示与辅助搜索）
	cover?: string; // 手动指定封面（可选，省略则自动取 cover.* 或第一张）
	password?: string; // 加密密码（非空时启用加密）
	passwordHint?: string; // 密码提示
};

/** 相册首页浏览模式：作品集手风琴 / 普通无限画布 */
export type GalleryViewMode = "portfolio" | "normal";

/** 首页 Explorer 下方的照片瀑布墙 */
export type GalleryHomeMasonry = {
	/** 是否显示；默认 true */
	enabled?: boolean;
	/** 最多渲染张数，防单页过重；默认 48 */
	maxItems?: number;
};

// 相册配置
export type GalleryConfig = {
	albums: GalleryAlbum[];
	columnWidth?: number; // 瀑布流最小列宽(px)，默认 240，浏览器根据容器宽度自动计算列数
	/** 首页默认模式（每次进入固定用此值，不持久化用户切换） */
	defaultViewMode?: GalleryViewMode;
	/** 首页作品集/无限滚动下方的 CSS columns 照片墙 */
	homeMasonry?: GalleryHomeMasonry;
	/**
	 * 分类栏展示顺序（可选）。
	 * 不填则按相册里出现的 category 去重排序；
	 * 填写时可控制顺序，未出现在相册中的项不显示。
	 */
	categories?: string[];
};
