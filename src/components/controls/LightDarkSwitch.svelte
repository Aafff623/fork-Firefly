<script lang="ts">
/**
 * 亮暗切换：移植自 kappi/kapi-css `daySlide.vue`（Apache-2.0）
 * 按原设计 590×235 等比例适配导航栏高度，不用 transform scale（避免挤压/阴影糊掉）。
 */
import { onMount } from "svelte";
import { DARK_MODE, LIGHT_MODE, SYSTEM_MODE } from "@/constants/constants";
import type { LIGHT_DARK_MODE } from "@/types/config.ts";
import {
	applyThemeToDocument,
	getStoredTheme,
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
	} else {
		displayedMode = mode;
	}
}

function toggleScheme() {
	const next = displayedMode === DARK_MODE ? LIGHT_MODE : DARK_MODE;
	mode = next;
	setTheme(next);
	updateDisplayedMode();
}

onMount(() => {
	const storedTheme = getStoredTheme();
	mode = storedTheme;
	updateDisplayedMode();

	if (storedTheme !== SYSTEM_MODE) {
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
		if (mode !== SYSTEM_MODE) {
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
	aria-label="Light/Dark Mode"
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
	 * 原设计 590×235 ≈ 2.51:1
	 * 导航栏控件高 h-11 = 2.75rem，宽度按比例算出
	 * 1em = 控件高度，阴影/圆角全部相对高度，保证缩小后仍有立体感
	 */
	.day-slide {
		--h: 2.75rem;
		--ratio: 2.510638; /* 590 / 235 */
		/* 加快昼夜切换：原 ~1.15s/1.6s 体感偏拖，收束到更利落的时长 */
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
		font-size: var(--h); /* 子元素用 em 相对高度 */
		isolation: isolate;
	}

	.scene {
		position: absolute;
		inset: 0;
		overflow: hidden;
		border-radius: inherit;
		/* 轻微液态玻璃：半透明 + 轻模糊，贴合导航胶囊 */
		-webkit-backdrop-filter: blur(12px) saturate(150%);
		backdrop-filter: blur(12px) saturate(150%);
		border: 1px solid color-mix(in oklch, white 32%, transparent);
		background: color-mix(in oklch, white 8%, transparent);
		box-shadow:
			inset 0 0.08em 0.12em rgba(0, 0, 0, 0.22),
			inset 0 0.04em 0.06em rgba(0, 0, 0, 0.16),
			inset 0 1px 0 rgba(255, 255, 255, 0.28),
			0 0.06em 0.12em rgba(0, 0, 0, 0.16);
	}

	/* ---------- 天空 ---------- */
	.sky {
		position: absolute;
		inset: 0;
		z-index: 1;
		transition: background-color var(--dur) var(--ease);
	}

	.is-day .sky {
		background: rgb(45 109 162 / 0.82);
	}

	.is-night .sky {
		background: rgb(28 31 44 / 0.78);
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
		background: rgb(76 134 189 / 0.84);
		border-radius: 0.51em 0.4em 0.4em 0.51em;
	}

	.is-day .sky-band.b2 {
		left: 0;
		background: rgb(89 146 194 / 0.82);
		border-radius: 0.51em 0.4em 0.4em 0.51em;
	}

	.is-day .sky-band.b3 {
		left: 0;
		background: rgb(104 157 202 / 0.8);
		border-radius: 0.25em 0.51em 0.51em 0.25em;
	}

	.is-night .sky-band.b1 {
		left: 15%;
		background: rgb(45 51 61 / 0.82);
		border-radius: 0.4em 0.51em 0.51em 0.4em;
	}

	.is-night .sky-band.b2 {
		left: 30%;
		background: rgb(64 67 80 / 0.8);
		border-radius: 0.4em 0.51em 0.51em 0.4em;
	}

	.is-night .sky-band.b3 {
		left: 45%;
		background: rgb(80 84 94 / 0.78);
		border-radius: 0.51em 0.25em 0.25em 0.51em;
	}

	/* ---------- 云 ---------- */
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
		box-shadow:
			inset 0 0.03em 0.06em rgba(255, 255, 255, 0.35),
			inset -0.02em 0.04em 0.05em rgba(255, 255, 255, 0.2),
			inset -0.05em -0.05em 0.08em rgba(0, 0, 0, 0.35),
			0.06em 0.06em 0.08em rgba(0, 0, 0, 0.28);
	}

	.is-day .far .blob {
		background: rgb(163 197 224 / 0.86);
	}

	.is-night .far .blob {
		background: rgb(108 131 149 / 0.84);
	}

	.is-day .near .blob {
		background: rgb(241 250 252 / 0.88);
	}

	.is-night .near .blob {
		background: rgb(198 198 198 / 0.86);
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
		opacity: 1;
		transform: translateY(0);
	}

	.s {
		position: absolute;
		width: 0.14em;
		height: 0.14em;
		background: #fff;
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
		filter: drop-shadow(0 0 0.04em rgba(255, 255, 255, 0.85));
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

	/* ---------- 太阳 / 月亮 ---------- */
	.orb {
		position: absolute;
		top: 10%;
		left: 5%;
		z-index: 10;
		width: 33%;
		height: 80%;
		border-radius: 50%;
		background: #fec428;
		transition:
			left var(--dur) var(--ease),
			background-color var(--dur) var(--ease);
		box-shadow:
			inset 0 0.04em 0.08em rgba(255, 255, 255, 0.45),
			inset -0.04em -0.05em 0.1em rgba(0, 0, 0, 0.35),
			0.08em 0.08em 0.12em rgba(0, 0, 0, 0.35);
	}

	.is-night .orb {
		left: 62%;
		background: #c3c9d1;
	}

	.crater {
		position: absolute;
		border-radius: 50%;
		background: #949eb2;
		opacity: 0;
		transition: opacity var(--dur) var(--ease);
		box-shadow: inset -0.03em -0.03em 0.06em rgba(0, 0, 0, 0.45);
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

	.day-slide:active .orb {
		transform: scale(0.96);
	}

	@media (prefers-reduced-motion: reduce) {
		.day-slide {
			--dur: 0.01ms;
		}

		.far .blob,
		.near .blob {
			transition-duration: 0.01ms;
		}
	}
</style>
