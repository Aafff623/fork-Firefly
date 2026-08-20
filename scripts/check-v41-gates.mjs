/**
 * V4.1 source gates: read shipped files, fail if a landed item regresses.
 * Run: node scripts/check-v41-gates.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

const failures = [];
const ok = [];

function assert(name, cond, detail) {
	if (cond) ok.push(name);
	else failures.push(`${name}: ${detail}`);
}

const mgl = read("src/layouts/MainGridLayout.astro");
assert(
	"A1 desktop carousel first slide eager",
	/loading="eager"\s*\n\s*fetchpriority="high"/.test(mgl) &&
		!/loading="lazy"\s*\n\s*fetchpriority="high"/.test(mgl),
	"desktop first slide still lazy+high",
);
assert(
	"A5 Live2D not top-level import",
	!/^import Live2DWidget /m.test(mgl) && mgl.includes("await import("),
	"Live2DWidget is still a static layout import",
);
assert(
	"B1 banner carousel extracted",
	mgl.includes("/scripts/banner-carousel.js") &&
		fs.existsSync(path.join(root, "public/scripts/banner-carousel.js")),
	"banner-carousel.js missing",
);

const postPage = read("src/components/layout/PostPage.astro");
assert(
	"A2 PostPinAdmin DEV-gated (dynamic import or template gate)",
	postPage.includes(
		'await import("@/components/controls/PostPinAdmin.svelte")',
	) || /import\.meta\.env\.DEV\s*&&/.test(postPage),
	"PostPinAdmin renders unconditionally",
);

const musicCfg = read("src/config/musicConfig.ts");
assert(
	"A7 music enable default on",
	/enable:\s*true/.test(musicCfg),
	"music enable is not true",
);

const musicMgr = read("src/components/features/MusicManager.astro");
const musicPl = read("src/components/features/MusicPlayer.astro");
assert(
	"A7 music scripts deferred",
	musicMgr.includes("defer") &&
		musicMgr.includes("/scripts/music-manager.js") &&
		musicPl.includes("defer") &&
		musicPl.includes("/scripts/music-player.js"),
	"music scripts not deferred",
);

const layout = read("src/layouts/Layout.astro");
assert(
	"A6/A7 music gated",
	layout.includes("musicPlayerConfig.enable !== false"),
	"layout missing music enable gate",
);
assert(
	"D4 TagCloud self-hosted (no jsdelivr runtime dep)",
	!read("public/scripts/tag-chalk-sphere.js").includes("cdn.jsdelivr.net") &&
		fs.existsSync(path.join(root, "public/scripts/vendor/tagcloud.min.js")),
	"TagCloud still loads from CDN",
);

const back = read("src/components/controls/BackToTop.astro");
assert(
	"A9 BackToTop no scroll hide listener",
	!back.includes("setupScrollListener") && !back.includes("scrollTop > 200"),
	"BackToTop still has 200px hide listener",
);

const waline = read("src/components/comment/Waline.astro");
assert(
	"A4 Waline dynamic import",
	waline.includes('import("@/lib/waline-boot")') &&
		!waline.includes('from "@/lib/waline-boot"'),
	"Waline still statically imports waline-boot",
);
assert(
	"A4 no static @waline/client/full in Waline.astro",
	!waline.includes("@waline/client/full"),
	"Waline.astro still imports full client",
);

const share = read("src/components/misc/SharePoster.svelte");
assert(
	"B3 qrcode dynamic import",
	share.includes('await import("qrcode")') &&
		!share.includes('import QRCode from "qrcode"'),
	"SharePoster still statically imports qrcode",
);

const launcher = read(
	"src/components/pages/gallery/InfiniteCanvasLauncher.svelte",
);
assert(
	"B3 canvas dynamic import",
	launcher.includes('import("./InfiniteAlbumCanvas.svelte")') &&
		!launcher.includes("import InfiniteAlbumCanvas from"),
	"InfiniteAlbumCanvas still static",
);

const gallery = read("src/pages/gallery/index.astro");
assert(
	"B3 gallery photos via fetch URL",
	gallery.includes("photosUrl") && gallery.includes("/gallery/explorer.json"),
	"gallery still serializes explorer photos into the island",
);

const anime = read("src/pages/anime.astro");
assert(
	"B3 AnimeGrid client:visible",
	anime.includes("client:visible") && !anime.includes("client:load items"),
	"AnimeGrid still client:load",
);

const pet = read("src/components/features/SpritePet.svelte");
assert(
	"B5 skip spritesheet on mobile post",
	pet.includes("shouldSkipPetSheet") &&
		pet.includes("createPetRendererGate") &&
		pet.includes("applyRendererGate") &&
		pet.includes("bindSwup") &&
		/if \(shouldSkipPetRenderer\(\)\) return Promise\.resolve\(\)/.test(pet) &&
		!/if \(shouldSkipPetRenderer\(\)\) \{\s*const onRotate/.test(pet),
	"SpritePet must skip sheet only and still bind swup",
);

const sakura = read("src/config/effectsConfig.ts");
assert(
	"sakura still default on",
	/enable:\s*true/.test(sakura),
	"sakura was turned off",
);

// ── V5 R 系列门（grok 执行 review 返工项）──

const scriptsDir = path.join(root, "public/scripts");
const widgetScripts = fs
	.readdirSync(scriptsDir)
	.filter((f) => f.endsWith(".js"));
const scriptBlob = widgetScripts
	.map((f) => fs.readFileSync(path.join(scriptsDir, f), "utf8"))
	.join("\n");
assert(
	"R3 no dead swup/astro event listeners in public/scripts",
	!scriptBlob.includes('addEventListener("swup:contentReplaced"') &&
		!scriptBlob.includes("addEventListener('swup:contentReplaced'") &&
		!scriptBlob.includes('addEventListener("astro:page-load"') &&
		!scriptBlob.includes("addEventListener('astro:page-load'"),
	"swup@4 never fires contentReplaced; no ClientRouter means astro:page-load never fires",
);
assert(
	"R9 recommend single swup channel",
	!read("public/scripts/recommend-widget.js").includes("hooks.on"),
	"recommend-widget still binds hooks in addition to DOM event",
);
assert(
	"R9 tags single swup channel",
	!read("public/scripts/tags-widget.js").includes("hooks.on"),
	"tags-widget still binds hooks in addition to DOM event",
);

const musicWidget = read("src/components/widget/Music.astro");
assert(
	"R4 music widget enable gate",
	musicWidget.includes("musicPlayerConfig.enable !== false"),
	"sidebar music widget ignores enable switch",
);

assert(
	"R5 Waline preconnect page-gated + jsdelivr no-crossorigin",
	layout.includes("usesWalineOnThisPage") &&
		layout.includes(
			'{usesWalineOnThisPage && <link rel="preconnect" href="https://unpkg.com" />}',
		) &&
		!layout.includes('href="https://cdn.jsdelivr.net" crossorigin'),
	"Waline preconnect must stay off unrelated pages; jsdelivr remains no-cors",
);

assert(
	"R6 pet bootRenderer syncs pet id before render",
	/bootRenderer = \(\) => \{[\s\S]*?activePetId = resolveActivePetId\(/.test(
		pet,
	),
	"bootRenderer must align activePetId to the route before first render (double-sheet race)",
);

assert(
	"R1 Waline module-scope swup fallback",
	waline.includes('document.addEventListener("swup:page:view", bootWhenNear)'),
	"Waline lazy boot has no swup fallback → comments die after navigating away pre-IO",
);

assert(
	"R2 surprise-clock re-observes after swup",
	/swup:page:view[\s\S]*observeClockRoot/.test(
		read("public/scripts/surprise-clock.js"),
	),
	"surprise-clock IO is not re-attached on soft navigation (permanent-death path)",
);

// ── dist 产物断言（A5 误报教训：源码检查 ≠ 产物干净；dist 存在才跑）──
const distClient = path.join(root, "dist/client");
if (fs.existsSync(distClient)) {
	const htmlFiles = [];
	(function walk(dir) {
		for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
			const p = path.join(dir, e.name);
			if (e.isDirectory()) walk(p);
			else if (e.name.endsWith(".html")) htmlFiles.push(p);
		}
	})(distClient);
	let htmlBlob = "";
	for (const h of htmlFiles) htmlBlob += fs.readFileSync(h, "utf8");

	const astroDir = path.join(distClient, "_astro");
	let jsBlob = "";
	const jsNames = fs.readdirSync(astroDir).filter((f) => f.endsWith(".js"));
	for (const f of jsNames) {
		const p = path.join(astroDir, f);
		if (fs.statSync(p).size < 3_000_000) jsBlob += fs.readFileSync(p, "utf8");
	}
	const orphans = jsNames.filter(
		(f) => !htmlBlob.includes(f) && !jsBlob.includes(f),
	);
	const orphanHeavy = orphans.filter(
		(f) => fs.statSync(path.join(astroDir, f)).size > 50 * 1024,
	);
	assert(
		"dist no orphan JS chunks >50KB",
		orphanHeavy.length === 0,
		`orphan chunks (unreferenced by any html/js): ${orphanHeavy.join(", ")}`,
	);

	const askOrphan = fs
		.readdirSync(astroDir)
		.find(
			(f) =>
				f.endsWith(".css") && f.startsWith("ask.") && !htmlBlob.includes(f),
		);
	assert(
		"dist no orphan ask.css",
		!askOrphan,
		`ask css emitted but referenced by no page: ${askOrphan}`,
	);

	const indexHtml = fs.readFileSync(
		path.join(distClient, "index.html"),
		"utf8",
	);
	assert(
		"dist music scripts deferred",
		/<script defer[^>]*music-manager\.js/.test(indexHtml) &&
			/<script defer[^>]*music-player\.js/.test(indexHtml),
		"music scripts still parse-blocking in built homepage",
	);
	assert(
		"dist homepage has no PostPinAdmin island",
		!/component-url="[^"]*PostPinAdmin/.test(indexHtml),
		"PostPinAdmin island hydrated for all visitors in prod build",
	);
} else {
	ok.push("dist checks skipped (no dist/)");
}

if (failures.length) {
	console.error(`FAIL\n${failures.map((f) => `- ${f}`).join("\n")}`);
	process.exit(1);
}
console.log(`PASS ${ok.length} gates`);
for (const name of ok) console.log(`  ok  ${name}`);
