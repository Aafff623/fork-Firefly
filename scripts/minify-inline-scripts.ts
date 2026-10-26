// 内联脚本压缩构建后脚本
//
// Astro 只压缩打包后的 script，is:inline 一律原样输出（连注释和缩进都在）。
// 首页光内联 JS 就有 50 多 KB，这里在 astro build 之后扫一遍产物 HTML，把内联 JS 过一遍 esbuild。

import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { glob } from "glob";
import { resolveSiteRoot } from "./site-root";

// 产物在 dist/client，统一对准真实根目录
const DIST_DIR = resolveSiteRoot();

// <script ...>...</script>，惰性匹配内容，属性里不允许出现 >
const SCRIPT_RE = /<script([^>]*)>([\s\S]*?)<\/script>/gi;

// 只碰这几种 type（空 type 就是普通 JS）
const JS_TYPES = new Set([
	"",
	"text/javascript",
	"application/javascript",
	"module",
]);

type EsbuildTransformOptions = {
	loader: "js";
	target: string;
	minifyWhitespace: boolean;
	minifySyntax: boolean;
	minifyIdentifiers: boolean;
};

type EsbuildModule = {
	transformSync: (
		code: string,
		options: EsbuildTransformOptions,
	) => { code: string };
};

/**
 * 取 esbuild。它不是本仓的直接依赖（依赖树里只有 astro 用），pnpm 只在根 node_modules
 * 链接直接依赖，所以先试直接 import，失败再从 astro 的依赖树里解析同一份 esbuild，
 * 免得为了压一段脚本新增依赖、动 lockfile。
 */
async function loadEsbuild(): Promise<EsbuildModule> {
	try {
		return (await import("esbuild")) as EsbuildModule;
	} catch {
		const require = createRequire(import.meta.url);
		const resolved = createRequire(
			require.resolve("astro/package.json"),
		).resolve("esbuild");
		console.log(`   (using esbuild resolved from astro: ${resolved})`);
		return (await import(pathToFileURL(resolved).href)) as EsbuildModule;
	}
}

/**
 * 判断某段 <script> 是否该压缩：
 * 外链的没有内容可压；type 不是 JS 的（application/ld+json、text/template、
 * Pagefind 的数据块之类）一律不碰。
 */
function shouldMinify(attrs: string): boolean {
	if (/\ssrc\s*=/i.test(attrs)) return false;
	const typeMatch = attrs.match(/\stype\s*=\s*["']?([^"'\s>]*)/i);
	const type = (typeMatch?.[1] ?? "").toLowerCase();
	return JS_TYPES.has(type);
}

function minifyInline(
	esbuild: EsbuildModule,
	code: string,
	file: string,
): string {
	if (!code.trim()) return code;
	// 正文里出现未转义的 <script>（代码块原样输出）时，正则会把标签配对配错，
	// 这段「脚本」其实是文章正文，一律不碰。
	if (/<script/i.test(code)) return code;
	try {
		const result = esbuild.transformSync(code, {
			loader: "js",
			target: "es2018",
			minifyWhitespace: true,
			minifySyntax: true,
			// 标识符不能改名：这些脚本处在全局作用域、彼此靠全局函数名互相调用
			// （如 MainGridLayout 的 setRandomSubtitle），改名会静默炸掉。
			minifyIdentifiers: false,
		});
		// 压完不能出现 </script，否则会提前闭合标签
		if (/<\/script/i.test(result.code)) return code;
		return result.code;
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		console.warn(`   ⚠ Skipped a script in ${file}: ${message}`);
		return code;
	}
}

async function main() {
	console.log(`🗜 Minifying inline scripts in ${DIST_DIR}/...`);

	const esbuild = await loadEsbuild();
	const htmlFiles = await glob(`${DIST_DIR}/**/*.html`);
	let savedBytes = 0;
	let touchedFiles = 0;
	let scriptCount = 0;

	for (const file of htmlFiles) {
		const html = await fs.readFile(file, "utf-8");
		let fileSaved = 0;

		const output = html.replace(
			SCRIPT_RE,
			(whole, attrs: string, code: string) => {
				if (!shouldMinify(attrs)) return whole;
				const minified = minifyInline(esbuild, code, file);
				if (minified === code) return whole;
				scriptCount++;
				fileSaved +=
					Buffer.byteLength(code, "utf-8") -
					Buffer.byteLength(minified, "utf-8");
				return `<script${attrs}>${minified}</script>`;
			},
		);

		if (fileSaved !== 0 || output !== html) {
			await fs.writeFile(file, output);
			savedBytes += fileSaved;
			touchedFiles++;
		}
	}

	const savedKiB = (savedBytes / 1024).toFixed(1);
	console.log(
		`✨ Minified ${scriptCount} inline scripts in ${touchedFiles}/${htmlFiles.length} HTML files, saved ${savedKiB} KiB`,
	);
}

main().catch((err) => {
	console.error("❌ Inline script minification failed:", err);
	process.exit(1);
});
