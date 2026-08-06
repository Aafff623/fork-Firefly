/** 单个合集元数据（人工策展，配置驱动；文章通过 frontmatter `collections` 引用 slug） */
export type CollectionMeta = {
	/** 合集唯一标识（kebab-case），posts frontmatter collections 里引用 */
	slug: string;
	/** 合集显示名 */
	name: string;
	/** 合集简介（总览卡片与详情页头部展示） */
	description: string;
	/** 可选 emoji 点缀（仅展示层，勿写入文章 frontmatter title） */
	emoji?: string;
	/**
	 * 合集卡片背景图（站点根路径，如 `/assets/collections/<slug>.jpg`）。
	 * 新增合集时用 MiniMax 出一张贴题 4:3 图落盘后再填此字段。
	 */
	cover?: string;
};

export type CollectionsConfig = {
	items: CollectionMeta[];
};
