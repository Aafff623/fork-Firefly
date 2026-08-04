import type { MusicPlayerConfig } from "../types/musicConfig";

// 音乐播放器配置
// 生产默认 mode: "local"（自托管曲库，不依赖公共 Meting）。
// Meting 块保留作可选备源：把 mode 改回 "meting" 即可手工切回（API 可能失效，见 ADR-0002）。
export const musicPlayerConfig: MusicPlayerConfig = {
	// 是否在导航栏显示音乐播放器入口
	showInNavbar: true,

	// 是否在侧边栏显示音乐播放器组件（侧栏组件仍须 sidebarConfig 里 type:"music" enable）
	showInSidebar: true,

	// 使用方式："local" 本地清单（默认）| "meting" 第三方歌单 API（备选）
	mode: "local",

	// 默认音量 (0-1)
	volume: 0.7,

	// 播放模式：'list'=列表循环, 'one'=单曲循环, 'random'=随机播放
	playMode: "list",

	// 是否显启用歌词
	showLyrics: true,

	// Meting API 配置（仅 mode === "meting" 时生效；备选，非默认）
	meting: {
		// Meting API 地址
		// 默认使用官方 API，也可以使用自定义 API
		api: "https://api.i-meto.com/meting/api?server=:server&type=:type&id=:id&r=:r",
		// 音乐平台：netease=网易云音乐, tencent=QQ音乐, kugou=酷狗音乐, xiami=虾米音乐, baidu=百度音乐
		server: "netease",
		// 类型：song=单曲, playlist=歌单, album=专辑, search=搜索, artist=艺术家
		type: "playlist",
		// 歌单/专辑/单曲 ID 或搜索关键词
		id: "10046455237",
		// 认证 token（可选）
		auth: "",
		// 备用 API 配置（当主 API 失败时使用）
		fallbackApis: [
			"https://api.injahow.cn/meting/?server=:server&type=:type&id=:id",
			"https://api.moeyao.cn/meting/?server=:server&type=:type&id=:id",
		],
	},

	// 本地音乐配置（mode === "local" 时使用）
	// 加歌步骤：
	// 1. 把 mp3（及可选封面/歌词）放到 public/assets/music/（封面建议 cover/，歌词建议 lrc/）
	// 2. 在下方 playlist 追加一项：name / artist / url / cover? / lrc?
	// 3. url、cover 用站点根路径，如 "/assets/music/xxx.mp3"；也可填 https:// 远程地址
	// 4. lrc 可为文件路径 "/assets/music/lrc/xxx.lrc"、远程 URL，或内联 LRC 字符串；没有歌词就填 ""
	// 氛围曲来源：Pixabay Content License（可个人站使用）；默认列表以安静纯音乐为主
	local: {
		playlist: [
			{
				name: "Soft Night Pad",
				artist: "Pixabay · Ambient",
				url: "/assets/music/ambient-02-soft-night-pad.mp3",
				cover: "/assets/music/cover/ambient-02.webp",
				lrc: "",
			},
			{
				name: "Quiet Horizon",
				artist: "Pixabay · Ambient",
				url: "/assets/music/ambient-03-quiet-horizon.mp3",
				cover: "/assets/music/cover/ambient-03.webp",
				lrc: "",
			},
			{
				name: "Gentle Drift",
				artist: "Pixabay · Ambient",
				url: "/assets/music/ambient-04-gentle-drift.mp3",
				cover: "/assets/music/cover/ambient-04.webp",
				lrc: "",
			},
			{
				name: "Morning Haze",
				artist: "Pixabay · Ambient",
				url: "/assets/music/ambient-05-morning-haze.mp3",
				cover: "/assets/music/cover/ambient-05.webp",
				lrc: "",
			},
			{
				name: "Still Water",
				artist: "Pixabay · Ambient",
				url: "/assets/music/ambient-06-still-water.mp3",
				cover: "/assets/music/cover/ambient-06.webp",
				lrc: "",
			},
			{
				name: "Deep Calm",
				artist: "Pixabay · Ambient",
				url: "/assets/music/ambient-07-deep-calm.mp3",
				cover: "/assets/music/cover/ambient-07.webp",
				lrc: "",
			},
			{
				name: "使一颗心免于哀伤",
				artist: "知更鸟 / HOYO-MiX / Chevy",
				url: "/assets/music/使一颗心免于哀伤-哼唱.mp3",
				cover: "/assets/music/cover/109951169585655912.webp",
				lrc: "",
			},
		],
	},
};
