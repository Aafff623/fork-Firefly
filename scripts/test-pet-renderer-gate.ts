/**
 * Drives shipped petRendererGate + findBuiltinPet on the skeptic path:
 * narrow /posts/* (no sheet) → Swup-equivalent evaluate on / (start + real sheet path).
 */
import { findBuiltinPet } from "../src/lib/pets/builtinPets";
import {
	createPetRendererGate,
	shouldSkipPetSheet,
} from "../src/lib/pets/petRendererGate";

const mobilePost = {
	hideOnMobilePost: true,
	pathname: "/posts/claude-code-handbook/",
	viewportWidth: 390,
	mobileBreakpoint: 768,
};

const mobileBrowse = {
	...mobilePost,
	pathname: "/",
};

const loads: string[] = [];
const gate = createPetRendererGate(() => {
	loads.push(findBuiltinPet("maid-deepseek-whale").spritesheetPath);
});

if (!shouldSkipPetSheet(mobilePost)) {
	console.error("FAIL expected skip on narrow post");
	process.exit(1);
}
if (shouldSkipPetSheet(mobileBrowse)) {
	console.error("FAIL browse must not skip");
	process.exit(1);
}

const first = gate.evaluate(mobilePost);
if (first !== "skip" || loads.length !== 0 || gate.started) {
	console.error("FAIL first evaluate", { first, loads, started: gate.started });
	process.exit(1);
}

const second = gate.evaluate(mobileBrowse);
if (second !== "start" || loads.length !== 1) {
	console.error("FAIL browse did not start renderer", { second, loads });
	process.exit(1);
}

const sheet = loads[0];
if (sheet !== "/pets/maid-deepseek-whale/spritesheet.webp") {
	console.error("FAIL startRenderer must load shipped maid sheet, got", sheet);
	process.exit(1);
}

const third = gate.evaluate(mobileBrowse);
if (third !== "keep-running" || loads.length !== 1) {
	console.error("FAIL second browse re-started", { third, loads });
	process.exit(1);
}

console.log(`PASS petRendererGate skip→start sheet=${sheet}`);
