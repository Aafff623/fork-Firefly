/**
 * 死事件门禁：Swup 4 只派发 swup:<hook>，不会派发 swup:contentReplaced。
 * 源码里再出现这个名字，说明有组件在等一个永远不会来的事件。
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEAD_EVENT = "swup:contentReplaced";
const SOURCE_EXT = new Set([
	".ts",
	".tsx",
	".mts",
	".astro",
	".svelte",
	".js",
	".mjs",
]);

export function findDeadEventLines(source) {
	return source
		.split(/\r?\n/)
		.map((line, index) => ({ line: index + 1, text: line }))
		.filter(({ text }) => text.includes(DEAD_EVENT));
}

function walk(dir, hits) {
	for (const entry of readdirSync(dir)) {
		const full = path.join(dir, entry);
		const stat = statSync(full);
		if (stat.isDirectory()) {
			walk(full, hits);
			continue;
		}
		if (!SOURCE_EXT.has(path.extname(entry))) continue;
		const found = findDeadEventLines(readFileSync(full, "utf8"));
		if (found.length > 0) hits.push({ file: full, lines: found });
	}
}

if (process.argv.includes("--self-test")) {
	const positive = findDeadEventLines(
		'document.addEventListener("swup:contentReplaced", fn);',
	);
	const negative = findDeadEventLines(
		'document.addEventListener("swup:content:replace", fn);',
	);
	if (positive.length !== 1 || negative.length !== 0) {
		console.error("lifecycle gate self-test failed");
		process.exitCode = 1;
	} else {
		console.log("PASS lifecycle gate self-test");
	}
} else {
	const hits = [];
	walk(path.join(root, "src"), hits);
	if (hits.length > 0) {
		console.error(`FAIL ${hits.length} file(s) still listen on ${DEAD_EVENT}`);
		for (const hit of hits) {
			for (const line of hit.lines) {
				console.error(`${path.relative(root, hit.file)}:${line.line}`);
			}
		}
		process.exitCode = 1;
	} else {
		console.log(`PASS no listeners on ${DEAD_EVENT}`);
	}
}
