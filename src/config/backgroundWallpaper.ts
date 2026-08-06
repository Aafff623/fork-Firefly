import type { BackgroundWallpaperConfig } from "@/types/backgroundWallpaper";

export const backgroundWallpaper: BackgroundWallpaperConfig = {
	// 壁纸模式："banner" 横幅壁纸，"fullscreen" 全屏壁纸，"overlay" 全屏透明，"none" 纯色背景无壁纸
	mode: "banner",
	// 是否启用背景视频播放，配置后将在导航栏显示视频播放按钮
	playerEnable: true,
	/**
	 * 背景图片配置
	 * 图片路径支持三种格式：
	 * 1. public 目录（以 "/" 开头，不优化）："/assets/images/banner.avif"
	 * 2. src 目录（不以 "/" 开头，自动优化但会增加构建时间，推荐）："assets/images/banner.avif"
	 * 3. 远程 URL："https://example.com/banner.jpg"
	 * 注意：远程URL和public目录的图片不会被优化，请确保图片体积足够小以免影响加载速度
	 *
	 * 建议不要替换d1-d6，m1-m6这些默认示例图片，但你可以删除掉节省空间
	 * 因为以后可能会更换示例图片，导致你自定义的图片被覆盖
	 * 所以建议使用自己的图片的时候命名为其他名称，不要使用d1-d6，m1-m6这些名称
	 *
	 * 如果只使用一张图片或者使用随机图API，推荐直接使用字符串格式：
	 * desktop: "https://t.alcy.cc/pc",   // 随机图API
	 * desktop: "assets/images/DesktopWallpaper/d1.avif", // 单张图片
	 *
	 * mobile: "https://t.alcy.cc/mp", // 随机图API
	 * mobile: "assets/images/MobileWallpaper/m1.avif", // 单张图片
	 *
	 * 支持配置多张图片（数组），每次刷新页面随机显示一张：
	 * desktop: [
	 * "assets/images/DesktopWallpaper/d1.avif",
	 * "assets/images/DesktopWallpaper/d2.avif",
	 * ],
	 *
	 * mobile:[
	 *   "assets/images/MobileWallpaper/m1.avif",
	 *   "assets/images/MobileWallpaper/m2.avif",
	 * ],
	 */
	src: {
		// 桌面背景图片（支持单张或多张随机）
		// desktop: "assets/images/DesktopWallpaper/d1.avif",
		// 自选 Banner 轮播（Saber/Fate + 其他横版，见 temp/wallpaper-candidates/selected.json）
		desktop: [
			"assets/images/DesktopWallpaper/banner-01.avif",
			"assets/images/DesktopWallpaper/banner-02.avif",
			"assets/images/DesktopWallpaper/banner-03.avif",
			"assets/images/DesktopWallpaper/banner-04.avif",
			"assets/images/DesktopWallpaper/banner-05.avif",
			"assets/images/DesktopWallpaper/banner-06.avif",
			"assets/images/DesktopWallpaper/banner-07.avif",
			"assets/images/DesktopWallpaper/banner-08.avif",
			"assets/images/DesktopWallpaper/banner-09.avif",
			"assets/images/DesktopWallpaper/banner-10.avif",
			"assets/images/DesktopWallpaper/banner-11.avif",
		],
		// 移动背景图片（支持单张或多张随机）
		// mobile: "assets/images/MobileWallpaper/m1.avif",
		mobile: [
			"assets/images/MobileWallpaper/m1.avif",
			"assets/images/MobileWallpaper/m2.avif",
			"assets/images/MobileWallpaper/m3.avif",
			"assets/images/MobileWallpaper/m4.avif",
			"assets/images/MobileWallpaper/m5.avif",
			"assets/images/MobileWallpaper/m6.avif",
		],
		// 背景视频播放地址（数组 = 播完切下一首；导航栏可上一首/下一首）
		// 本地自备片 · 720p 无声 faststart（源文件在 D:\cache\chrome-cache）
		playerUrl: [
			"/assets/videos/bg-benben.mp4", // 九十九弁弁 · 东方
			"/assets/videos/bg-plana.mp4", // Plana · 碧蓝档案
			"/assets/videos/bg-hina.mp4", // 空崎日奈 · 碧蓝档案
			"/assets/videos/bg-fangyi.mp4", // 庄方宜 · 明日方舟终末地
		],
	},
	// 横幅壁纸和全屏壁纸共享配置
	common: {
		// 壁纸遮罩暗度，让横幅文字显示更清晰，0-1之间，值越大越暗
		dimOpacity: 0.2,
		// 多视频播放模式："order" 顺序循环，"random" 随机切换（仅当 playerUrl 为数组时生效）
		playerMode: "order",
		// 主页横幅文字
		homeText: {
			// 是否启用主页横幅文字
			enable: true,
			// 主页横幅主标题
			title: "Welcome to My Digital Garden",
			// 主页横幅主标题字体大小
			titleSize: "4.5rem",
			// 主页横幅副标题（多套轮播；打字机打完后停留 pauseTime）
			subtitle: [
				"🌲 🌿 ୧( ˵ ° ~ ° ˵ )୨ 🌿 🌳",
				"🪴 ✨ (￣▽￣)ノ grow slow ✨ 🌱",
				"🍃 ☕ (´∀｀)∩ tea & code ☕ 🍃",
				"🌳 📖 (๑>◡<๑) read under trees 📖 🌳",
				"🌸 🎐 ♪(´ε｀ ) soft breeze 🎐 🌸",
				"🌿 🏡 (◕‿◕)✿ come sit awhile 🏡 🌿",
			],
			// 主页横幅副标题字体大小
			subtitleSize: "1.5rem",
			typewriter: {
				// 是否启用打字机效果
				// 打字机开启 → 循环显示所有副标题
				// 打字机关闭 → 每次刷新随机显示一条副标题
				enable: true,
				// 打字速度（毫秒）
				speed: 100,
				// 删除速度（毫秒）
				deleteSpeed: 50,
				// 完全显示后的暂停时间（毫秒）≈ 5 秒再切下一套
				pauseTime: 5000,
			},
		},
		// 文章横幅信息："description" 显示描述，"meta" 显示日期、字数和阅读时长
		postInfo: {
			mode: "description",
		},
		// 导航栏配置
		navbar: {
			// 导航栏透明模式："semi" 半透明，"full" 完全透明，"semifull" 动态透明
			// full：去掉白色圆条底层，logo / 胶囊菜单 / 按钮直接浮在壁纸上
			transparentMode: "full",
			// 是否开启毛玻璃模糊效果，开启可能会影响页面性能，如果不开启则是半透明，请根据自己的喜好开启
			enableBlur: true,
			// 毛玻璃模糊度
			blur: 5,
		},
		// 水波纹动画效果配置，开启会影响页面性能，请根据自己的喜好开启
		waves: {
			enable: {
				// 桌面端是否启用水波纹动画效果
				desktop: true,
				// 移动端是否启用水波纹动画效果
				mobile: true,
			},
		},
		// 渐变过渡效果配置，当水波纹关闭时自动启用，提供壁纸底部到背景色的平滑过渡
		gradient: {
			enable: {
				// 桌面端是否启用渐变过渡
				desktop: true,
				// 移动端是否启用渐变过渡
				mobile: true,
			},
			// 渐变高度：多色 fade 收短，避免抢内容
			height: "22%",
		},
		// 壁纸轮播配置，横幅壁纸和全屏壁纸共享，仅在配置多张图片时生效
		carousel: {
			// 是否启用壁纸轮播；关闭时保持每次刷新随机显示一张
			enable: true,
			// 轮播切换间隔（毫秒）· 30 秒一换，给访客看清上下同色
			interval: 30000,
			// 过渡效果: 'fade' 渐变 | 'zoom' 缩放 | 'slide' 滑动 | 'kenburns' 旋转木马
			transitionEffect: "zoom",
		},
	},
	// Banner模式特有配置
	banner: {
		// 图片位置
		// 支持所有CSS object-position值，如: 'top', 'center', 'bottom', 'left top', 'right bottom', '25% 75%', '10px 20px'..
		// 如果不知道怎么配置百分百之类的配置，推荐直接使用：'center'居中，'top'顶部居中，'bottom' 底部居中，'left'左侧居中，'right'右侧居中
		position: "0% 20%",
	},
	// 全屏透明覆盖模式特有配置
	overlay: {
		// 层级，确保壁纸在背景层
		zIndex: -1,
		// 壁纸透明度
		opacity: 0.5,
		// 背景模糊度
		blur: 1,
		// 卡片透明度，0-1之间，值越小越透明
		cardOpacity: 0.75,
	},
	// 全屏壁纸模式特有配置
	fullscreen: {
		// 图片位置
		position: "center",
	},
	/**
	 * Banner + 正文氛围层 · 与横幅同色同频（BA-01～11 配对 banner-01～11）
	 * 旧 PC 文件保留不删；色调可对上的已复制为 ba-*-paired.jpg
	 */
	atmosphere: {
		enable: true,
		previewBadge: false, // 选型调试结束：关掉右下角 BA 编号浮标
		opacity: 0.52,
		veil: 0.72,
		cardOpacity: 0.84,
		slides: [
			{
				id: "BA-01",
				label: "蓝调夜城（跟 banner-01）",
				src: "/assets/atmosphere/ba-01-paired.jpg",
				pairBannerIndex: 0,
			},
			{
				id: "BA-02",
				label: "暖褐夜景（跟 banner-02）",
				src: "/assets/atmosphere/ba-02-paired.jpg",
				pairBannerIndex: 1,
			},
			{
				id: "BA-03",
				label: "灰青远山（跟 banner-03）",
				src: "/assets/atmosphere/ba-03-paired.jpg",
				pairBannerIndex: 2,
			},
			{
				id: "BA-04",
				label: "雾绿草原（跟 banner-04）",
				src: "/assets/atmosphere/ba-04-minimax-sage.jpg",
				pairBannerIndex: 3,
			},
			{
				id: "BA-05",
				label: "暖橙晨曦（跟 banner-05）",
				src: "/assets/atmosphere/ba-05-paired.jpg",
				pairBannerIndex: 4,
			},
			{
				id: "BA-06",
				label: "玫紫花田（跟 banner-06）",
				src: "/assets/atmosphere/ba-06-paired.jpg",
				pairBannerIndex: 5,
			},
			{
				id: "BA-07",
				label: "暖灰暮色（跟 banner-07）",
				src: "/assets/atmosphere/ba-07-minimax-dusk.jpg",
				pairBannerIndex: 6,
			},
			{
				id: "BA-08",
				label: "粉灰暮空（跟 banner-08）",
				src: "/assets/atmosphere/ba-08-paired.jpg",
				pairBannerIndex: 7,
			},
			{
				id: "BA-09",
				label: "琥珀街景（跟 banner-09）",
				src: "/assets/atmosphere/ba-09-paired.jpg",
				pairBannerIndex: 8,
			},
			{
				id: "BA-10",
				label: "浅暖雾空（跟 banner-10）",
				src: "/assets/atmosphere/ba-10-paired.jpg",
				pairBannerIndex: 9,
			},
			{
				id: "BA-11",
				label: "紫调花野（跟 banner-11）",
				src: "/assets/atmosphere/ba-11-paired.jpg",
				pairBannerIndex: 10,
			},
		],
		carousel: {
			enable: true,
			interval: 30000, // 备用；syncWithBanner 时跟横幅事件，实际由 common.carousel 驱动
			transitionEffect: "fade",
			syncWithBanner: true,
		},
	},
};
