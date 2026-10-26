// 构建产物根目录解析。
//
// 本仓恒带 @astrojs/cloudflare adapter，astro build 的静态站点产物在 dist/client
// （dist 下同时有 client/ 和 server/）；本地偶尔只有 dist。所有吃产物根的构建后脚本
// （minify-inline-scripts / subset-fonts / strip-legacy-fonts / pagefind）统一从这里取，
// 不再各写一份路径常量。

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";

/**
 * 构建产物根目录：dist/client 存在则用之，否则退回 dist。
 */
export function resolveSiteRoot(): string {
	return existsSync("dist/client") ? "dist/client" : "dist";
}

/**
 * 真正的站点根上跑 Pagefind。
 *
 * 事故背景：以前 package.json 里直接写 `pagefind --site dist`，在 Cloudflare Pages
 * （产物在 dist/client）上会索引出 /client/... 的假路径，并且索引输出到 dist/pagefind，
 * 根本不会随站点部署 —— 线上搜索一直是 404。这里对准真正的站点根目录再跑，索引会输出到
 * <root>/pagefind，随站点一起上传。
 */
export function runPagefind(): never {
	const siteRoot = resolveSiteRoot();
	const result = spawnSync("pagefind", ["--site", siteRoot], {
		stdio: "inherit",
		// Windows 下 node_modules/.bin 里是 .cmd 包装，需要 shell 才能解析到
		shell: process.platform === "win32",
	});
	process.exit(result.status ?? 1);
}

// 作为 CLI 用：`tsx scripts/site-root.ts` 打印产物根；
// `tsx scripts/site-root.ts --pagefind` 在产物根上跑 Pagefind（取代写死的 `--site dist`）。
if (
	process.argv[1] &&
	import.meta.url === pathToFileURL(process.argv[1]).href
) {
	if (process.argv.includes("--pagefind")) {
		runPagefind();
	} else {
		console.log(resolveSiteRoot());
	}
}
