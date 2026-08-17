/**
 * 剥离构建产物中的旧格式字体：KaTeX 的 ttf/woff（katex.min.css 的 @font-face
 * src 列表 woff2 在前，现代浏览器只取 woff2；ttf/woff 是死重量，删文件不影响运行）。
 * 只删 KaTeX_* 前缀（每款都有 woff2 兄弟），其他字体不动。
 * Run: npx tsx scripts/strip-legacy-fonts.ts  （build 链在 subset-fonts 之后自动调用）
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dirs = ["dist/client/_astro"];

let removed = 0;
let bytes = 0;

for (const dir of dirs) {
	const abs = path.join(root, dir);
	if (!fs.existsSync(abs)) continue;
	for (const f of fs.readdirSync(abs)) {
		if (!/^KaTeX_/.test(f)) continue;
		if (!/\.(ttf|woff)$/.test(f)) continue;
		const p = path.join(abs, f);
		const stat = fs.statSync(p);
		fs.rmSync(p);
		removed += 1;
		bytes += stat.size;
	}
}

console.log(
	`[strip-legacy-fonts] removed ${removed} KaTeX ttf/woff files (${(bytes / 1024 / 1024).toFixed(2)}MB)`,
);
