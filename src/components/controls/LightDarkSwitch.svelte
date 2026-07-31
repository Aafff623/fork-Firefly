<script lang="ts">
import { onMount } from "svelte";
import { DARK_MODE, LIGHT_MODE, SYSTEM_MODE } from "@/constants/constants";
import type { LIGHT_DARK_MODE } from "@/types/config.ts";
import {
	applyThemeToDocument,
	getStoredTheme,
	setTheme,
} from "@/utils/setting-utils";

// Define Swup type for window object
interface SwupHooks {
	on(event: string, callback: () => void): void;
}

interface SwupInstance {
	hooks?: SwupHooks;
}

type WindowWithSwup = Window & { swup?: SwupInstance };

let mode: LIGHT_DARK_MODE = $state(LIGHT_MODE);
let displayedMode: LIGHT_DARK_MODE = $state(LIGHT_MODE);

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
	const next =
		displayedMode === DARK_MODE ? LIGHT_MODE : DARK_MODE;
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
		const newTheme = getStoredTheme();
		mode = newTheme;
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
			const newTheme = getStoredTheme();
			mode = newTheme;
			updateDisplayedMode();
		} else {
			updateDisplayedMode();
		}
	};

	window.addEventListener("theme-change", handleThemeChange);

	return () => {
		window.removeEventListener("theme-change", handleThemeChange);
		mediaQuery?.removeEventListener("change", handleSystemChange);
	};
});
</script>

<div class="relative z-50">
    <!-- Spotlight 风格：胶囊底座 + 手绘太阳/月亮 SVG -->
    <button
        type="button"
        aria-label="Light/Dark Mode"
        class="group relative h-10 w-10 rounded-full bg-(--card-bg) shadow-lg ring-1 ring-black/5 backdrop-blur-sm transition active:scale-95 dark:ring-white/10 dark:hover:ring-white/20"
        id="scheme-switch"
        onclick={toggleScheme}
    >
        <div class="absolute inset-0 flex items-center justify-center transition-opacity" class:opacity-0={displayedMode !== LIGHT_MODE}>
            <svg viewBox="0 0 24 24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-6 w-6 fill-zinc-100 stroke-zinc-500 transition group-hover:fill-zinc-200 group-hover:stroke-zinc-700">
                <path d="M8 12.25A4.25 4.25 0 0 1 12.25 8v0a4.25 4.25 0 0 1 4.25 4.25v0a4.25 4.25 0 0 1-4.25 4.25v0A4.25 4.25 0 0 1 8 12.25v0Z" />
                <path d="M12.25 3v1.5M21.5 12.25H20M18.791 18.791l-1.06-1.06M18.791 5.709l-1.06 1.06M12.25 20v1.5M4.5 12.25H3M6.77 6.77 5.709 5.709M6.77 17.73l-1.061 1.061" fill="none" />
            </svg>
        </div>
        <div class="absolute inset-0 flex items-center justify-center transition-opacity" class:opacity-0={displayedMode !== DARK_MODE}>
            <svg viewBox="0 0 24 24" aria-hidden="true" class="h-6 w-6 fill-zinc-700 stroke-zinc-500 transition group-hover:stroke-zinc-400">
                <path d="M17.25 16.22a6.937 6.937 0 0 1-9.47-9.47 7.451 7.451 0 1 0 9.47 9.47ZM12.75 7C17 7 17 2.75 17 2.75S17 7 21.25 7C17 7 17 11.25 17 11.25S17 7 12.75 7Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </div>
    </button>
</div>
