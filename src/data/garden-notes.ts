/**
 * 园径便签：每日标语 + 预生成 MiniMax 氛围底图 / 动底
 * tip 含引猫语气与颜文字；按站点时区（北京）日切轮换。
 * 换标语时请 bump id / 补跑生图或视频；线上只读本地资源。
 */

export type GardenNoteItem = {
	id: string;
	tip: string;
	/** public 下路径，如 /assets/garden-note/gn-01.jpg */
	bg: string;
	/** 可选循环动底 mp4；无则只用静图 */
	bgMotion?: string;
};

export const gardenNotes: GardenNoteItem[] = [
	{
		id: "gn-01",
		tip: "(=^･ω･^=) 今日林间微风，亦宜浇水——也宜摸摸路过的猫。",
		bg: "/assets/garden-note/gn-01.jpg",
		bgMotion: "/assets/garden-note/gn-01.mp4",
	},
	{
		id: "gn-02",
		tip: "ฅ^•ﻌ•^ฅ 少写一行代码，多种一棵念头；引猫者先留一寸阳光。",
		bg: "/assets/garden-note/gn-02.jpg",
		bgMotion: "/assets/garden-note/gn-02.mp4",
	},
	{
		id: "gn-03",
		tip: "(=；ェ；=) 客来不妨坐下，落叶声里续一壶茶；猫会自己找你。",
		bg: "/assets/garden-note/gn-03.jpg",
		bgMotion: "/assets/garden-note/gn-03.mp4",
	},
	{
		id: "gn-04",
		tip: "(=｀ω´=) 枝叶未整齐，心意已先到——碗里的小鱼干也是。",
		bg: "/assets/garden-note/gn-04.jpg",
	},
	{
		id: "gn-05",
		tip: "ʕ ᵔᴥᵔ ʔ 园门半开着，欢迎你慢慢逛；引猫者在门边打哈欠。",
		bg: "/assets/garden-note/gn-05.jpg",
	},
];
