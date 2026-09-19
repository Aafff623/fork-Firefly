/**
 * 首页标题逐字母钢琴音效引擎。
 *
 * 15 个字符对应 15 段单音，离线烘焙为单个 MP3 sprite（public/audio/title/title-notes.v1.mp3），
 * 运行时用原生 Web Audio 播切片。开关状态存 localStorage（title-sfx），默认开；
 * 浏览器自动播放策略要求首次手势（点击/按键）后 AudioContext 才能出声。
 * 设置面板通过 setTitleSoundEnabled() 写状态并广播 titleSoundToggle 事件同步本引擎。
 */
import {
	getStoredTitleSoundEnabled,
	setTitleSoundEnabled,
} from "@utils/setting-utils";

type Slice = { offset: number; duration: number };

const SPRITE_URL = "/audio/title/title-notes.v1.mp3";

/* offsets 由烘焙脚本（temp/research/glyph-piano-sfx/assemble_sprite.py）实测标定 */
const SLICES: Record<string, Slice> = {
	W: { offset: 0.303, duration: 1.1 },
	e: { offset: 1.483, duration: 0.95 },
	l: { offset: 2.513, duration: 1.05 },
	c: { offset: 3.643, duration: 0.85 },
	o: { offset: 4.573, duration: 0.9 },
	m: { offset: 5.553, duration: 0.65 },
	t: { offset: 6.283, duration: 0.95 },
	h: { offset: 7.313, duration: 0.85 },
	r: { offset: 8.243, duration: 0.9 },
	w: { offset: 9.223, duration: 1.2 },
	a: { offset: 10.503, duration: 0.8 },
	"'": { offset: 11.383, duration: 1.35 },
	s: { offset: 12.813, duration: 0.95 },
	b: { offset: 13.843, duration: 0.65 },
	g: { offset: 14.573, duration: 0.8 },
};

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let buffer: AudioBuffer | null = null;
let loading: Promise<void> | null = null;
let enabled: boolean | null = null;
let inited = false;
let lastGlobal = 0;
const lastByChar = new Map<string, number>();
const active: AudioBufferSourceNode[] = [];

function isEnabled(): boolean {
	enabled ??= getStoredTitleSoundEnabled();
	return enabled;
}

async function ensureReady(): Promise<boolean> {
	try {
		if (!ctx) {
			const Ctor =
				window.AudioContext ??
				(window as unknown as { webkitAudioContext?: typeof AudioContext })
					.webkitAudioContext;
			if (!Ctor) return false;
			ctx = new Ctor();
			master = ctx.createGain();
			master.gain.value = 0.1;
			master.connect(ctx.destination);
		}
		if (ctx.state === "suspended") {
			try {
				await ctx.resume();
			} catch {
				/* 等下一次手势 */
			}
		}
		if (!buffer) {
			loading ??= fetch(SPRITE_URL)
				.then((response) => {
					if (!response.ok) throw new Error(String(response.status));
					return response.arrayBuffer();
				})
				.then((data) => ctx!.decodeAudioData(data))
				.then((decoded) => {
					buffer = decoded;
				})
				.catch(() => {
					loading = null;
				});
			await loading;
		}
		return Boolean(buffer) && ctx.state === "running";
	} catch {
		return false;
	}
}

function arm() {
	if (typeof document === "undefined") return;
	/* 持续监听直到真正就绪（首次手势可能因瞬时失败没加载完，就绪后自摘） */
	const unlock = () => {
		void ensureReady().then((ok) => {
			if (ok && ctx?.state === "running" && buffer) {
				document.removeEventListener("pointerdown", unlock, true);
				document.removeEventListener("keydown", unlock, true);
			}
		});
	};
	document.addEventListener("pointerdown", unlock, { capture: true });
	document.addEventListener("keydown", unlock, { capture: true });
}

function play(char: string, pan: number) {
	if (!isEnabled()) return;
	if (!ctx || !buffer || !master || ctx.state !== "running") {
		/* 未就绪（首次手势尚未完成/曾瞬时失败）：悬停时补一次加载 */
		void ensureReady();
		return;
	}
	const slice = SLICES[char];
	if (!slice) return;
	const now = performance.now();
	if (now - lastGlobal < 60) return;
	if (now - (lastByChar.get(char) ?? 0) < 120) return;
	lastGlobal = now;
	lastByChar.set(char, now);
	if (active.length >= 4) {
		try {
			active.shift()?.stop();
		} catch {
			/* 已结束 */
		}
	}
	const source = ctx.createBufferSource();
	source.buffer = buffer;
	if (typeof ctx.createStereoPanner === "function") {
		const panner = ctx.createStereoPanner();
		panner.pan.value = Math.max(-0.2, Math.min(0.2, pan));
		source.connect(panner);
		panner.connect(master);
	} else {
		source.connect(master);
	}
	source.onended = () => {
		const index = active.indexOf(source);
		if (index >= 0) active.splice(index, 1);
	};
	source.start(0, slice.offset, slice.duration);
	active.push(source);
}

export const titleSfx = {
	/** 幂等初始化：读取开关状态、挂首次手势解锁监听、跟随设置面板切换 */
	init() {
		if (typeof window === "undefined" || inited) return;
		inited = true;
		enabled = getStoredTitleSoundEnabled();
		if (enabled) arm();
		window.addEventListener("titleSoundToggle", (event) => {
			const detail = (event as CustomEvent<{ enabled?: boolean }>).detail;
			enabled = detail?.enabled ?? getStoredTitleSoundEnabled();
			if (enabled) {
				/* 面板点击本身即手势，可直接准备音频 */
				void ensureReady();
			}
		});
	},
	play,
	setEnabled(value: boolean) {
		setTitleSoundEnabled(value);
	},
	isEnabled,
	/** 供调试/验收：音频是否已解码且处于可播状态 */
	get ready() {
		return Boolean(buffer) && ctx?.state === "running";
	},
};
