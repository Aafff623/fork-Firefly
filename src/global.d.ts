import type { SakuraManagerLike } from "./types/sakura-worker";

declare global {
	interface HTMLElementTagNameMap {
		"table-of-contents": HTMLElement & {
			init?: () => void;
		};
	}

	interface Window {
		// biome-ignore lint/suspicious/noExplicitAny: External library
		swup: any;
		spineModelInitialized?: boolean;
		floatingTOCListenersInitialized?: boolean;
		// biome-ignore lint/suspicious/noExplicitAny: External library
		spinePlayerInstance?: any;
		pagefind: {
			search: (query: string) => Promise<{
				results: Array<{
					data: () => Promise<SearchResult>;
				}>;
			}>;
		};
		__fireflyMusic?: {
			init: () => Promise<void>;
			getState: () => {
				playlist: Array<{
					name: string;
					artist: string;
					url: string;
					pic: string;
					lrc?: string;
				}>;
				currentIndex: number;
				track: {
					name: string;
					artist: string;
					url: string;
					pic: string;
					lrc?: string;
				} | null;
				isPlaying: boolean;
				playMode: number;
				volume: number;
				isMuted: boolean;
				currentTime: number;
				duration: number;
				progress: number;
				currentTimeStr: string;
				durationStr: string;
				lyrics: Array<{ time: number; text: string }>;
				currentLrcIndex: number;
				initialized: boolean;
				error: string | null;
				config: Record<string, unknown>;
			};
			togglePlay: () => void;
			pause: () => void;
			playNext: () => void;
			playPrev: () => void;
			cyclePlayMode: () => void;
			setVolume: (val: number) => void;
			toggleMute: () => void;
			seek: (percent: number) => void;
			seekToTime: (time: number) => void;
			playTrackByIndex: (index: number) => void;
			loadTrack: (index: number, autoPlay: boolean) => void;
		};
		/** 樱花特效管理器,Worker 模式与主线程回退模式均实现该接口 */
		sakuraManager?: SakuraManagerLike;
		/** 樱花特效初始化守卫,确保只初始化一次(Swup 切页重跑脚本时复用) */
		sakuraInitialized?: boolean;
		/** 悬浮 TOC 自动关闭 wiring 幂等 guard：防跨跳重复注册 document/window 监听器 */
		__floatingTOCAutoCloseBound?: boolean;
		/** 封面图 astro:page-load 监听幂等 guard */
		__coverImageBound?: boolean;
		/** 代码组 document click/keydown 监听幂等 guard */
		__rcgGlobalBound?: boolean;
		/** Navbar 品牌标题 swup:page:view 监听幂等 guard */
		__navbarBrandDrawBound?: boolean;
		/** 文章列表布局页面级监听幂等 guard */
		__postPageLayoutBound?: boolean;
		/** 紧凑分类卡 swup 监听幂等 guard */
		__catCompactBound?: boolean;
		/** 侧栏 Profile widget swup 监听幂等 guard */
		__profileWidgetBound?: boolean;
		/** Twikoo swup hook / 自定义事件监听幂等 guard */
		__twikooBound?: boolean;
	}

	interface MediaQueryList {
		addListener(listener: (e: MediaQueryListEvent) => void): void;
		removeListener(listener: (e: MediaQueryListEvent) => void): void;
	}
}

interface SearchResult {
	url: string;
	meta: {
		title: string;
	};
	excerpt: string;
	content?: string;
	word_count?: number;
	filters?: Record<string, unknown>;
	anchors?: Array<{
		element: string;
		id: string;
		text: string;
		location: number;
	}>;
	weighted_locations?: Array<{
		weight: number;
		balanced_score: number;
		location: number;
	}>;
	locations?: number[];
	raw_content?: string;
	raw_url?: string;
	sub_results?: SearchResult[];
}

export type { SearchResult };
