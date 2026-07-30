<script lang="ts">
import { onMount } from "svelte";
import Icon from "@/components/common/Icon.svelte";
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
    <button
        type="button"
        aria-label="Light/Dark Mode"
        class="relative btn-plain scale-animation rounded-lg h-9 w-9 md:h-11 md:w-11 active:scale-90"
        id="scheme-switch"
        onclick={toggleScheme}
    >
        <div class="absolute inset-0 flex items-center justify-center" class:opacity-0={displayedMode !== LIGHT_MODE}>
            <Icon icon="material-symbols:wb-sunny-outline-rounded" class="text-[1.25rem]"></Icon>
        </div>
        <div class="absolute inset-0 flex items-center justify-center" class:opacity-0={displayedMode !== DARK_MODE}>
            <Icon icon="material-symbols:dark-mode-outline-rounded" class="text-[1.25rem]"></Icon>
        </div>
    </button>
</div>
