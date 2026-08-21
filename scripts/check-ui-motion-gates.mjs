import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) =>
	fs.readFileSync(path.join(root, relativePath), "utf8");

const clock = read("src/components/widget/SurpriseClock.astro");
const profile = read("src/components/widget/Profile.astro");
const footer = read("src/styles/site-footer.css");
const tagSphere = read("public/scripts/tag-chalk-sphere.js");
const pet = read("src/components/features/SpritePet.svelte");
const roamAnchors = read("src/lib/pets/petRoamAnchors.ts");
const failures = [];

function assert(name, condition) {
	if (!condition) failures.push(name);
}

assert(
	"clock side digits stay visually subordinate",
	/\.surprise-clock__num\)\s*\{[\s\S]*?opacity:\s*0\.52;[\s\S]*?font-size:\s*0\.82rem;[\s\S]*?filter:\s*blur\(0\.25px\) saturate\(0\.75\)/.test(
		clock,
	),
);
assert(
	"clock main digits explicitly remain crisp",
	/\.surprise-clock__num\.is-bright\)\s*\{[\s\S]*?filter:\s*none;/.test(clock),
);
assert(
	"dark bot face has a contrasting layered background",
	/html\.dark\) \.profile-face--bot\.is-on\s*\{[\s\S]*?radial-gradient[\s\S]*?box-shadow:/.test(
		profile,
	),
);
assert(
	"dark bot receives a subtle silhouette highlight",
	/html\.dark\) \.profile-ffly-bot\s*\{[\s\S]*?drop-shadow/.test(profile),
);
assert(
	"footer links are quieter until interaction",
	/\.site-footer__list a\s*\{[\s\S]*?color:\s*color-mix\(in oklch, var\(--deep-text\) 72%, transparent\)/.test(
		footer,
	) &&
		/html\.dark \.site-footer__list a\s*\{[\s\S]*?color:\s*color-mix\(in oklch, var\(--sf-ink\) 68%, transparent\)/.test(
			footer,
		),
);
assert(
	"footer icons are quieter until interaction",
	/\.site-footer__link-icon\s*\{[\s\S]*?opacity:\s*0\.52;/.test(footer),
);
assert(
	"tag sphere idle motion is slightly faster",
	/var IDLE_MAX_SPEED = 0\.48;/.test(tagSphere),
);
assert(
	"pet frame playback is synchronized to animation frames",
	/requestAnimationFrame\(tick\)/.test(pet) &&
		/cancelAnimationFrame\(playbackFrame\)/.test(pet) &&
		!pet.includes("playbackTimer = setTimeout"),
);
assert(
	"pet and tag sphere pause for article navigation priority",
	pet.includes("firefly:navigation-priority") &&
		pet.includes("navigationPaused") &&
		tagSphere.includes("__fireflyNavigationPriority"),
);
assert(
	"pet roam selection is distance-aware and avoids immediate repeats",
	/scoreRoamAnchor/.test(roamAnchors) &&
		/recentIds/.test(roamAnchors) &&
		/Math\.hypot/.test(roamAnchors),
);

if (failures.length > 0) {
	console.error("UI and motion gates failed:");
	for (const failure of failures) console.error(`- ${failure}`);
	process.exit(1);
}

console.log("UI and motion gates passed (10/10).");
