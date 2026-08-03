export type AnnouncementConfig = {
	// enable属性已移除，现在通过sidebarLayoutConfig统一控制
	title?: string; // 公告栏标题
	content: string; // 公告栏内容
	icon?: string; // 公告栏图标
	type?: "info" | "warning" | "success" | "error"; // 公告类型
	closable?: boolean; // 是否可关闭
	link?: {
		enable: boolean; // 是否启用链接
		text: string; // 链接文字
		url: string; // 链接地址
		external?: boolean; // 是否外部链接
	};
	/** 公告 mast 下方：不定期惊喜礼盒 */
	loveLetter?: {
		enable?: boolean;
		/**
		 * 惊喜期号。换新礼盒时改这个（或改 heading/message），
		 * 访客侧「已开启」标记会按期号重置。
		 */
		version?: string;
		/** 合盖时的提示（如「点开惊喜」） */
		note?: string;
		/** 开盖后标题 */
		heading?: string;
		/** 开盖后正文 */
		message?: string;
	};
};
