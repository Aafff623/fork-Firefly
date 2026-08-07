import type { GalleryConfig } from "@/types/galleryConfig";

// 相册配置（/gallery 专属；与全站文章 categories 无关）
export const galleryConfig: GalleryConfig = {
	// 相册列表（需要时再按下方注释格式添加）
	albums: [
		// 支持jpg/png/webp/avif/gif格式
		// id: 相册唯一标识符（用于目录命名和URL路径），比如设置：id: "firefly-2026", 对应 public/gallery/firefly-2026/目录
		// category: /gallery 专属视觉题材（首页分类栏筛选；非全站文章分类）
		// cover: 手动指定封面图（可选，不填会把cover.*文件作为封面图，如果没有cover.*文件，则使用第一张图片作为封面图）
		// name: 相册名称
		// description: 相册描述
		// location: 相册拍摄地点
		// date: 相册日期，格式为 YYYY-MM-DD，用于排序和显示
		// tags: 相册标签，用于卡片展示与搜索辅助（首页不再单独排标签胶囊）
		// password: 访问密码，设置后需要输入密码才能查看相册内容（可选）
		// passwordHint: 密码提示，设置后在输入密码错误时显示（可选，需配合password使用）
		// 每添加一个数组项就相当于添加了一个相册，记得在 public/gallery/ 目录下创建对应的子目录并放入图片
		{
			id: "firefly-2026",
			name: "Firefly 2026",
			description: "生活碎片与灵感记录",
			date: "2026-05-13",
			category: "角色",
			tags: ["角色", "灵感"],
		},
		{
			id: "scenery",
			name: "风景速写",
			description: "竖横方混排的风景填充，用来演示瀑布与分类",
			date: "2026-08-05",
			category: "风景",
			tags: ["风景", "旅行"],
		},
	],

	/**
	 * /gallery 专属题材分类栏顺序（非全站文章分类）。
	 * 未出现在任一相册 category 中的项不显示。
	 */
	categories: ["角色", "风景", "日常"],

	// 瀑布流最小列宽(px)，浏览器根据容器宽度自动计算列数，默认 240
	// 值越小列数越多，值越大列数越少
	columnWidth: 240,

	// 首页照片瀑布墙（CSS columns；不含 demo 画库）；无限画布由 App 图标全屏打开
	homeMasonry: {
		enabled: true,
		maxItems: 48,
	},
};
