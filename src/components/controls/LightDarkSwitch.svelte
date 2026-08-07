<script lang="ts">
/**
 * 亮暗切换：移植自 kappi/kapi-css `daySlide.vue`（Apache-2.0）
 * 按原设计 590×235 等比例适配导航栏高度，不用 transform scale（避免挤压/阴影糊掉）。
 */
import { onMount } from "svelte";
import {
	DARK_MODE,
	LIGHT_MODE,
	SYSTEM_MODE,
	TIME_MODE,
} from "@/constants/constants";
import type { LIGHT_DARK_MODE } from "@/types/config.ts";
import {
	applyThemeToDocument,
	getStoredTheme,
	getTimeTheme,
	resolveTheme,
	setTheme,
} from "@/utils/setting-utils";

interface SwupHooks {
	on(event: string, callback: () => void): void;
}

interface SwupInstance {
	hooks?: SwupHooks;
}

type WindowWithSwup = Window & { swup?: SwupInstance };

let mode: LIGHT_DARK_MODE = $state(LIGHT_MODE);
let displayedMode: LIGHT_DARK_MODE = $state(LIGHT_MODE);

const isDark = $derived(displayedMode === DARK_MODE);

function updateDisplayedMode() {
	if (mode === SYSTEM_MODE) {
		const isSystemDark = window.matchMedia(
			"(prefers-color-scheme: dark)",
		).matches;
		displayedMode = isSystemDark ? DARK_MODE : LIGHT_MODE;
	} else if (mode === TIME_MODE) {
		displayedMode = getTimeTheme();
	} else {
		displayedMode = mode;
	}
}

/**
 * 循环：time（北京时段自动）→ light → dark → time
 * 若下一档解析后外观与当前相同（白天 time≈light、夜里 time≈dark），跳过，保证每点一次必变色。
 */
function toggleScheme() {
	const order: LIGHT_DARK_MODE[] = [TIME_MODE, LIGHT_MODE, DARK_MODE];
	const from = mode === SYSTEM_MODE ? TIME_MODE : mode;
	const start = Math.max(0, order.indexOf(from));
	const currentVisual = resolveTheme(from);
	let next = order[(start + 1) % order.length];
	for (let i = 1; i <= order.length; i++) {
		const candidate = order[(start + i) % order.length];
		if (resolveTheme(candidate) !== currentVisual) {
			next = candidate;
			break;
		}
	}
	mode = next;
	setTheme(next);
	updateDisplayedMode();
}

onMount(() => {
	const storedTheme = getStoredTheme();
	mode = storedTheme;
	updateDisplayedMode();

	if (storedTheme !== SYSTEM_MODE && storedTheme !== TIME_MODE) {
		const currentTheme = document.documentElement.classList.contains("dark")
			? DARK_MODE
			: LIGHT_MODE;
		if (storedTheme !== currentTheme) {
			applyThemeToDocument(storedTheme);
		}
	}

	let mediaQuery: MediaQueryList | null = null;
	const handleSystemChange = () => {
		updateDisplayedMode();
	};
	if (storedTheme === SYSTEM_MODE) {
		mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		mediaQuery.addEventListener("change", handleSystemChange);
	}

	const handleContentReplace = () => {
		mode = getStoredTheme();
		updateDisplayedMode();
	};

	const win = window as WindowWithSwup;
	if (win.swup?.hooks) {
		win.swup.hooks.on("content:replace", handleContentReplace);
	} else {
		document.addEventListener("swup:enable", () => {
			const w = window as WindowWithSwup;
			if (w.swup?.hooks) {
				w.swup.hooks.on("content:replace", handleContentReplace);
			}
		});
	}

	const handleThemeChange = () => {
		if (mode !== SYSTEM_MODE && mode !== TIME_MODE) {
			mode = getStoredTheme();
		}
		updateDisplayedMode();
	};

	window.addEventListener("theme-change", handleThemeChange);

	return () => {
		window.removeEventListener("theme-change", handleThemeChange);
		mediaQuery?.removeEventListener("change", handleSystemChange);
	};
});
</script>

<button
	type="button"
	id="scheme-switch"
	aria-label="主题：时间感知 / 亮色 / 暗色"
	aria-pressed={isDark}
	class="day-slide"
	class:is-night={isDark}
	class:is-day={!isDark}
	onclick={toggleScheme}
>
	<span class="scene" aria-hidden="true">
		<!-- 天空色带 -->
		<span class="sky">
			<span class="sky-band b1"></span>
			<span class="sky-band b2"></span>
			<span class="sky-band b3"></span>
		</span>

		<!-- 远景云 -->
		<span class="clouds far">
			<span class="blob c1"></span>
			<span class="blob c2"></span>
			<span class="blob c3"></span>
			<span class="blob c4"></span>
			<span class="blob c5"></span>
			<span class="blob c6"></span>
		</span>

		<!-- 近景云 -->
		<span class="clouds near">
			<span class="blob n1"></span>
			<span class="blob n2"></span>
			<span class="blob n3"></span>
			<span class="blob n4"></span>
			<span class="blob n5"></span>
			<span class="blob n6"></span>
		</span>

		<!-- 星星（纯 CSS，避免文字泄漏） -->
		<span class="stars">
			<span class="s s1"></span>
			<span class="s s2"></span>
			<span class="s s3"></span>
			<span class="s s4"></span>
			<span class="s s5"></span>
			<span class="s s6"></span>
		</span>

		<!-- 太阳 / 月亮滑块 -->
		<span class="orb">
			<span class="crater cr1"></span>
			<span class="crater cr2"></span>
			<span class="crater cr3"></span>
		</span>
	</span>
</button>

<style>
	/*
	 * 对齐导航液态玻璃：外壳吃 navbar-liquid-glass，场景降为点缀。
	 * 高 h-11；宽高比略收，避免比邻钮抢眼。
	 */
	.day-slide {
		--h: 2.75rem;
		--ratio: 2.2; /* 原 2.51，略收以贴邻钮节奏 */
		--dur: 0.42s;
		--dur-color: 0.5s;
		--ease: cubic-bezier(0.33, 0.1, 0.2, 1);

		position: relative;
		z-index: 50;
		box-sizing: border-box;
		display: inline-block;
		flex-shrink: 0;
		height: var(--h);
		width: calc(var(--h) * var(--ratio));
		padding: 0;
		border: 0;
		border-radius: calc(var(--h) * 0.5);
		background: transparent;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		font-size: var(--h);
		isolation: isolate;
		transition: transform 0.15s ease;
	}

	.day-slide:active {
		transform: scale(0.9);
	}

	.scene {
		position: absolute;
		inset: 0;
		overflow: hidden;
		border-radius: inherit;
		/* 对齐 .navbar-liquid-glass */
		-webkit-backdrop-filter: blur(28px) saturate(180%);
		backdrop-filter: blur(28px) saturate(180%);
		border: 1px solid color-mix(in oklch, white 58%, transparent);
		background: color-mix(in oklch, white 48%, transparent);
		box-shadow:
			0 8px 28px rgba(0, 0, 0, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.72),
			inset 0 -1px 0 rgba(255, 255, 255, 0.14);
	}

	:global(.dark) .scene {
		background: color-mix(in oklch, white 14%, transparent);
		border: 1px solid color-mix(in oklch, white 20%, transparent);
		box-shadow:
			0 8px 32px rgba(0, 0, 0, 0.38),
			inset 0 1px 0 rgba(255, 255, 255, 0.24),
			inset 0 -1px 0 rgba(0, 0, 0, 0.28);
	}

	/* ---------- 天空（玻璃壳上略回补色度，勿回到原实蓝塑料感） ---------- */
	.sky {
		position: absolute;
		inset: 0;
		z-index: 1;
		transition: background-color var(--dur) var(--ease);
	}

	.is-day .sky {
		background: rgb(56 122 178 / 0.52);
	}

	.is-night .sky {
		background: rgb(28 31 44 / 0.58);
	}

	.sky-band {
		position: absolute;
		top: 0;
		height: 100%;
		border-radius: 50%;
		transition:
			left var(--dur) var(--ease),
			background-color var(--dur) var(--ease),
			border-radius var(--dur) var(--ease);
	}

	.sky-band.b1 {
		width: 85%;
		z-index: 2;
	}

	.sky-band.b2 {
		width: 70%;
		z-index: 3;
	}

	.sky-band.b3 {
		width: 55%;
		z-index: 4;
	}

	.is-day .sky-band.b1 {
		left: 0;
		background: rgb(76 134 189 / 0.5);
		border-radius: 0.51em 0.4em 0.4em 0.51em;
	}

	.is-day .sky-band.b2 {
		left: 0;
		background: rgb(89 146 194 / 0.46);
		border-radius: 0.51em 0.4em 0.4em 0.51em;
	}

	.is-day .sky-band.b3 {
		left: 0;
		background: rgb(104 157 202 / 0.42);
		border-radius: 0.25em 0.51em 0.51em 0.25em;
	}

	.is-night .sky-band.b1 {
		left: 15%;
		background: rgb(45 51 61 / 0.5);
		border-radius: 0.4em 0.51em 0.51em 0.4em;
	}

	.is-night .sky-band.b2 {
		left: 30%;
		background: rgb(64 67 80 / 0.42);
		border-radius: 0.4em 0.51em 0.51em 0.4em;
	}

	.is-night .sky-band.b3 {
		left: 45%;
		background: rgb(80 84 94 / 0.36);
		border-radius: 0.51em 0.25em 0.25em 0.51em;
	}

	/* ---------- 云（近平面，色度略回补） ---------- */
	.clouds {
		position: absolute;
		inset: 0;
		z-index: 6;
		pointer-events: none;
	}

	.clouds.near {
		z-index: 7;
	}

	.blob {
		position: absolute;
		display: block;
		border-radius: 50%;
		transition: background-color var(--dur-color) var(--ease);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
	}

	.is-day .far .blob {
		background: rgb(163 197 224 / 0.68);
	}

	.is-night .far .blob {
		background: rgb(108 131 149 / 0.52);
	}

	.is-day .near .blob {
		background: rgb(241 250 252 / 0.72);
	}

	.is-night .near .blob {
		background: rgb(198 198 198 / 0.48);
	}

	/* 远景云位置（对齐原 back-cloud） */
	.far .c1 {
		width: 50%;
		height: 100%;
		top: -9%;
		right: -35%;
		transform: rotate(30deg);
	}

	.far .c2 {
		width: 30%;
		height: 60%;
		top: 30%;
		right: -5%;
		transform: rotate(40deg);
	}

	.far .c3 {
		width: 50%;
		height: 90%;
		top: 50%;
		right: -5%;
		transform: rotate(60deg);
	}

	.far .c4 {
		width: 20%;
		height: 50%;
		top: 60%;
		right: 30%;
		transform: rotate(60deg);
	}

	.far .c5 {
		width: 60%;
		height: 80%;
		top: 90%;
		right: 15%;
		transform: rotate(60deg);
	}

	.far .c6 {
		width: 60%;
		height: 100%;
		top: 85%;
		left: -10%;
		transform: rotate(90deg);
	}

	/* 近景云位置（对齐原 white-background） */
	.near .n1 {
		width: 70%;
		height: 100%;
		top: 30%;
		right: -55%;
		transform: rotate(30deg);
	}

	.near .n2 {
		width: 60%;
		height: 100%;
		top: 60%;
		right: -35%;
		transform: rotate(30deg);
	}

	.near .n3 {
		width: 25%;
		height: 100%;
		top: 75%;
		right: 15%;
	}

	.near .n4 {
		width: 15%;
		height: 100%;
		top: 80%;
		right: 35%;
	}

	.near .n5 {
		width: 30%;
		height: 100%;
		top: 78%;
		right: 42%;
	}

	.near .n6 {
		width: 50%;
		height: 90%;
		top: 95%;
		right: 58%;
		transform: rotate(90deg);
	}

	/* ---------- 星星 ---------- */
	.stars {
		position: absolute;
		inset: 0;
		z-index: 8;
		transition:
			opacity var(--dur) var(--ease),
			transform var(--dur) var(--ease);
	}

	.is-day .stars {
		opacity: 0;
		transform: translateY(55%);
	}

	.is-night .stars {
		opacity: 0.85;
		transform: translateY(0);
	}

	.s {
		position: absolute;
		width: 0.14em;
		height: 0.14em;
		background: rgb(255 255 255 / 0.88);
		clip-path: polygon(
			50% 0%,
			61% 35%,
			100% 50%,
			61% 65%,
			50% 100%,
			39% 65%,
			0% 50%,
			39% 35%
		);
		filter: drop-shadow(0 0 0.03em rgba(255, 255, 255, 0.5));
	}

	.s1 {
		top: 20%;
		left: 3%;
		width: 0.22em;
		height: 0.22em;
	}

	.s2 {
		top: 12%;
		left: 10%;
		width: 0.1em;
		height: 0.1em;
	}

	.s3 {
		top: 38%;
		left: 12%;
		width: 0.18em;
		height: 0.18em;
	}

	.s4 {
		top: 16%;
		left: 22%;
		width: 0.2em;
		height: 0.2em;
	}

	.s5 {
		top: 52%;
		left: 28%;
		width: 0.14em;
		height: 0.14em;
	}

	.s6 {
		top: 28%;
		left: 38%;
		width: 0.26em;
		height: 0.26em;
	}

	/* ---------- 太阳 / 月亮（扁平壳 + 原色系黄） ---------- */
	.orb {
		position: absolute;
		top: 12%;
		left: 5%;
		z-index: 10;
		width: 33%;
		height: 76%;
		border-radius: 50%;
		background: #fec428;
		transition:
			left var(--dur) var(--ease),
			background-color var(--dur) var(--ease),
			box-shadow var(--dur) var(--ease);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.5),
			0 1px 4px rgba(0, 0, 0, 0.14);
	}

	.is-night .orb {
		left: 62%;
		background: #c3c9d1;
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.4),
			0 1px 4px rgba(0, 0, 0, 0.22);
	}

	.crater {
		position: absolute;
		border-radius: 50%;
		background: rgb(148 158 178 / 0.7);
		opacity: 0;
		transition: opacity var(--dur) var(--ease);
		box-shadow: none;
	}

	.is-night .crater {
		opacity: 1;
	}

	.cr1 {
		width: 35%;
		height: 35%;
		top: 43%;
		left: 10%;
	}

	.cr2 {
		width: 22%;
		height: 22%;
		top: 17%;
		left: 40%;
	}

	.cr3 {
		width: 23%;
		height: 23%;
		top: 53%;
		left: 60%;
	}

	@media (prefers-reduced-motion: reduce) {
		.day-slide {
			--dur: 0.01ms;
			transition: none;
		}

		.day-slide:active {
			transform: none;
		}

		.far .blob,
		.near .blob {
			transition-duration: 0.01ms;
		}
	}
</style>
