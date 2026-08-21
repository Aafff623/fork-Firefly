import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) =>
	fs.readFileSync(path.join(root, relativePath), "utf8");

const layout = read("src/layouts/Layout.astro");
const astroConfig = read("astro.config.mjs");
const mainCss = read("src/styles/main.css");
const postPage = read("src/components/layout/PostPage.astro");
const postCard = read("src/components/layout/PostCard.astro");
const failures = [];

function assert(name, condition) {
	if (!condition) failures.push(name);
}

const visitStart = layout.match(
	/window\.swup\.hooks\.on\("visit:start",[\s\S]*?\n\s*}\);/,
)?.[0];

assert("visit:start hook exists", Boolean(visitStart));
assert(
	"old page is not scrolled before incoming HTML is ready",
	Boolean(visitStart) && !visitStart.includes("window.scrollTo"),
);
assert(
	"article visits opt into atomic no-animation replacement",
	Boolean(visitStart) &&
		visitStart.includes("isArticleVisit") &&
		visitStart.includes("!visit.history.popstate") &&
		visitStart.includes("!visit.to.hash") &&
		visitStart.includes("visit.animation.animate = false") &&
		visitStart.includes("visit.scroll.reset = false"),
);
assert(
	"incoming layout is committed after content replacement",
	/hooks\.replace\([\s\S]*?"content:replace"[\s\S]*?commitIncomingLayout\(visit\)/.test(
		layout,
	),
);
assert(
	"article URL history is deferred until the prepared DOM replacement",
	layout.includes("fireflyDeferredArticleHistory") &&
		layout.includes("visit.history.popstate = true") &&
		layout.includes("commitDeferredArticleHistory(visit)"),
);
assert(
	"Swup redirect reconciliation cannot publish the article URL early",
	/hooks\.replace\([\s\S]*?"page:load"[\s\S]*?fireflySourceArticleUrl/.test(
		layout,
	),
);
assert(
	"history DOM layout and scroll commit in one content replacement handler",
	/defaultHandler\?\.\(visit, args\)[\s\S]*commitDeferredArticleHistory\(visit\)[\s\S]*commitIncomingLayout\(visit\)/.test(
		layout,
	),
);
assert(
	"Swup starts immediately so the first click is intercepted",
	/loadOnIdle:\s*false/.test(astroConfig),
);
assert(
	"default five-wide preload plugin is disabled",
	/preload:\s*false/.test(astroConfig),
);
assert(
	"only the first two article cards are marked for immediate preload",
	/priorityPreload=\{index < 2\}/.test(postPage) &&
		/data-swup-preload=\{priorityPreload \? "true" : undefined\}/.test(
			postCard,
		),
);
assert(
	"only the featured cover image is loaded eagerly",
	/loading=\{index === 0 \? "eager" : "lazy"\}/.test(postPage),
);
assert(
	"article navigation skips the progress-bar layout reflow",
	Boolean(visitStart) &&
		/if \(!isArticleVisit\) \{\s*void progressBar\.offsetWidth;\s*\}/.test(
			visitStart,
		),
);
assert(
	"article navigation replaces only critical and active dynamic containers",
	Boolean(visitStart) &&
		visitStart.includes('"#swup-container"') &&
		visitStart.includes('"#floating-toc-wrapper"') &&
		visitStart.includes("visit.containers = articleContainers"),
);
assert(
	"page transitions override global smooth scrolling",
	/html\.is-page-transitioning\s*\{[\s\S]*?scroll-behavior:\s*auto/.test(
		mainCss,
	),
);
assert(
	"article intent prefetch is capped at two requests",
	layout.includes("ARTICLE_PREFETCH_CONCURRENCY = 2") &&
		layout.includes("articlePrefetchActive < ARTICLE_PREFETCH_CONCURRENCY"),
);
assert(
	"cold clicks wait for a prepared cache entry before navigation",
	layout.includes(
		"prepareArticle(link.href, { priority: true, force: true })",
	) && layout.includes("window.swup.navigate(link.href"),
);
assert(
	"cold fetch failure preserves the current page and shows feedback",
	layout.includes("showArticleNavigationError()") &&
		layout.includes('classList.remove("is-page-transitioning")'),
);
assert(
	"navigation priority has success abort error and timeout recovery",
	layout.includes('hooks.on("visit:end"') &&
		layout.includes('hooks.on("visit:abort", endNavigationPriority)') &&
		layout.includes('hooks.on("fetch:error", endNavigationPriority)') &&
		layout.includes("15_000"),
);

if (failures.length > 0) {
	console.error("Article navigation gates failed:");
	for (const failure of failures) console.error(`- ${failure}`);
	process.exit(1);
}

console.log("Article navigation gates passed (18/18).");
