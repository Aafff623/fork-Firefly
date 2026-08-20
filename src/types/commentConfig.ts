export type CommentConfig = {
	/**
	 * 当前启用的评论系统类型
	 * "none" | "twikoo" | "waline" | "giscus" | "disqus" | 'artalk'
	 */
	type: "none" | "twikoo" | "waline" | "giscus" | "disqus" | "artalk";
	twikoo?: {
		envId: string;
		region?: string;
		lang?: string;
		visitorCount?: boolean;
		/**
		 * Twikoo JS 文件地址，支持 CDN 链接
		 * 国内推荐: https://registry.npmmirror.com/twikoo/1.7.9/files/dist/twikoo.min.js
		 * 国际推荐: https://cdn.jsdelivr.net/npm/twikoo@1.7.9/dist/twikoo.min.js
		 */
		jsUrl?: string;
		/**
		 * Twikoo 自定义 CSS 文件地址，为空则不加载
		 */
		cssUrl?: string;
	};
	waline?: {
		serverURL: string;
		lang?: string;
		emoji: string[];
		login?: "enable" | "force" | "disable";
		visitorCount?: boolean; // 是否统计访问量，true 启用访问量，false 关闭
		/** 边打字边推梗图（旁挂 type-ahead）；见 docs/outputs/prd/comment-sticker-suggest */
		stickerSuggest?: {
			/** 总开关；默认 false */
			enabled: boolean;
			/** 防抖 ms，建议 280～400 */
			debounceMs?: number;
			/** 最少触发字数，建议 2 */
			minChars?: number;
			/** 最多展示条数，建议 6 */
			maxResults?: number;
			/** 未命中是否走 Agent；P0 必须 false */
			agentEnabled?: boolean;
			/** API 路径，默认 /api/comment-sticker-suggest/ */
			endpoint?: string;
		};
	};
	artalk?: {
		// 后端程序 API 地址
		server: string;
		/**
		 * 语言，支持语言如下：
		 * - "en" (English)
		 * - "zh-CN" (简体中文)
		 * - "zh-TW" (繁体中文)
		 * - "ja" (日本語)
		 * - "ko" (한국어)
		 * - "fr" (Français)
		 * - "ru" (Русский)
		 * */
		locale: string | "auto";
		// 是否统计访问量，true 启用访问量，false 关闭
		visitorCount?: boolean;
	};
	/** GitHub Discussions 评论配置；动态时间线仍可通过组件 override 使用 Waline。 */
	giscus?: {
		repo: string;
		repoId: string;
		category: string;
		categoryId: string;
		mapping: string;
		strict: string;
		reactionsEnabled: string;
		emitMetadata: string;
		inputPosition: string;
		lang: string;
		loading: string;
	};
	disqus?: {
		shortname: string;
	};
};
