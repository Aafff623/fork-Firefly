import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

async function source(path) {
	return readFile(new URL(path, new URL("../", import.meta.url)), "utf8");
}

const [
	commentConfig,
	giscus,
	commentIndex,
	waline,
	dynamicComments,
	layout,
	nav,
	community,
] = await Promise.all([
	source("src/config/commentConfig.ts"),
	source("src/components/comment/Giscus.astro"),
	source("src/components/comment/index.astro"),
	source("src/components/comment/Waline.astro"),
	source("src/pages/dynamic/comments.astro"),
	source("src/layouts/Layout.astro"),
	source("src/config/navBarConfig.ts"),
	source("src/pages/community.astro"),
]);

const gates = [
	[
		"主评论使用 Giscus",
		commentConfig.includes('type: "giscus"') &&
			commentConfig.includes('repo: "Aafff623/fork-Firefly"') &&
			commentConfig.includes('repoId: "R_kgDOToSNAw"'),
	],
	[
		"Giscus 只加载官方 client.js",
		giscus.includes('script.src = "https://giscus.app/client.js"') &&
			!giscus.includes("esm.sh/giscus"),
	],
	[
		"Giscus 有延迟挂载与跨页清理",
		giscus.includes("IntersectionObserver") &&
			giscus.includes("requestIdleCallback") &&
			giscus.includes('document.addEventListener("astro:before-swap", dispose'),
	],
	[
		"评论组件支持页面级 service override",
		commentIndex.includes('service?: CommentConfig["type"]') &&
			commentIndex.includes("service ?? commentConfig?.type") &&
			commentIndex.includes('await import("./Giscus.astro")') &&
			commentIndex.includes('await import("./Waline.astro")') &&
			commentIndex.includes('showNotConfigured = commentService === "none"') &&
			commentIndex.includes("{showNotConfigured &&"),
	],
	[
		"动态回复固定使用 Waline",
		dynamicComments.includes(
			'<Comment customPath={customPath} service="waline" />',
		),
	],
	[
		"Waline 样式随评论懒启动加载",
		!waline.includes('import "@waline/client/waline.css";') &&
			waline.includes('from "@waline/client/waline.css?url"') &&
			waline.includes('link.dataset.walineStyles = "true"') &&
			(waline.match(/<style is:inline>/g)?.length ?? 0) === 2,
	],
	[
		"评论预连接按页面服务门控",
		layout.includes("usesWalineOnThisPage") &&
			layout.includes('Astro.url.pathname.startsWith("/dynamic/")'),
	],
	[
		"社区入口进入社交导航",
		nav.includes("LinkPresets.Community") && nav.includes('url: "/community/"'),
	],
	[
		"社区页暴露真实 Discussions 分区",
		community.includes("communityConfig.channels.map") &&
			community.includes("communityConfig.newDiscussionUrl") &&
			community.includes("未来保留独立论坛边界"),
	],
];

const failed = gates.filter(([, passed]) => !passed);
for (const [name, passed] of gates) {
	console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
}

if (failed.length > 0) {
	console.error(
		`FAIL ${failed.length}/${gates.length} community comment gates (${root})`,
	);
	process.exitCode = 1;
} else {
	console.log(`PASS ${gates.length} community comment gates`);
}
