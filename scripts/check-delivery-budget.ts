/**
 * 产物级交付预算门禁。
 *
 * 与既有 check-*.mjs 的差别：那四个查**源码**（「某组件是不是用了动态 import」），
 * 本脚本查**产物**（「这个页面实际声明要拉多少字节、几个请求」）。两者互补：
 * 源码断言防「写法退化」，产物断言防「体积悄悄涨」。
 *
 * 阈值与白名单唯一定义在 `src/lib/delivery-budget.ts`。
 *
 * 用法：
 *   pnpm check:budget            # 全量报告 + 违规即退出码 1
 *   pnpm check:budget -- --top 8 # 每个页面额外列出最重的 8 个资产
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import {
	type AssetKind,
	classifyAsset,
	classifyDecorative,
	classifyPage,
	DELIVERY_BUDGETS,
	extractAssetRefs,
	HOME_DECORATIVE_BUDGETS,
	MAX_ASSET_BYTES,
	matchAllowlist,
	type PageClass,
} from "../src/lib/delivery-budget.ts";

const DIST_ROOT = path.join(process.cwd(), "dist", "client");

const topArgIndex = process.argv.indexOf("--top");
const TOP_N =
	topArgIndex === -1 ? 0 : Number(process.argv[topArgIndex + 1]) || 0;

type Violation = { page: string; kind: string; detail: string };

function walkHtml(dir: string, out: string[] = []): string[] {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			if (entry.name === "pagefind") continue; // 搜索索引不进交付预算
			walkHtml(full, out);
		} else if (entry.name.endsWith(".html")) {
			out.push(full);
		}
	}
	return out;
}

function walkAllFiles(dir: string, out: string[] = []): string[] {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) walkAllFiles(full, out);
		else out.push(full);
	}
	return out;
}

function toDistRelative(absolute: string): string {
	return path.relative(DIST_ROOT, absolute).replace(/\\/g, "/");
}

function toPageUrl(absolute: string): string {
	const rel = toDistRelative(absolute);
	if (rel === "index.html") return "/";
	return `/${rel.replace(/(?:^|\/)index\.html$/, "").replace(/\.html$/, "")}/`;
}

/** 站内引用 → dist 里的实际文件；不存在返回 null（外链/接口/生成物不算违规） */
function resolveRef(ref: string): string | null {
	const candidate = path.join(DIST_ROOT, ref.replace(/^\/+/, ""));
	try {
		if (statSync(candidate).isFile()) return candidate;
	} catch {
		/* 不存在：可能是接口、重定向目标或按需生成的资源 */
	}
	return null;
}

function formatBytes(bytes: number): string {
	if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
	return `${Math.round(bytes / 1024)} KB`;
}

function main(): void {
	try {
		statSync(DIST_ROOT);
	} catch {
		console.error(
			`✗ 找不到 ${DIST_ROOT} —— 先跑一次 build（pnpm build 或 astro build）。`,
		);
		process.exit(1);
	}

	const violations: Violation[] = [];
	const pages = walkHtml(DIST_ROOT);
	const rows: Array<{
		url: string;
		pageClass: PageClass;
		requests: number;
		totalBytes: number;
		inlineBytes: number;
		byKind: Record<string, number>;
		heaviest: Array<{ ref: string; bytes: number }>;
	}> = [];

	for (const file of pages) {
		const html = readFileSync(file, "utf8");
		const url = toPageUrl(file);
		const pageClass = classifyPage(url);
		const budget = DELIVERY_BUDGETS[pageClass];
		const { refs, inlineBytes } = extractAssetRefs(html);

		const byKind: Record<string, number> = {};
		const heaviest: Array<{ ref: string; bytes: number }> = [];
		let totalBytes = 0;
		let counted = 0;

		for (const ref of refs) {
			const absolute = resolveRef(ref);
			if (!absolute) continue;
			const bytes = statSync(absolute).size;
			const kind: AssetKind = classifyAsset(ref);
			totalBytes += bytes;
			byKind[kind] = (byKind[kind] ?? 0) + bytes;
			counted += 1;
			heaviest.push({ ref, bytes });
		}

		// 首页装饰资产分类预算（04 票）：防回归——运行时按需加载的装饰资产
		// 一旦被改成首屏静态引用，这里抓住。阈值见 HOME_DECORATIVE_BUDGETS。
		if (pageClass === "home") {
			const byDecorative: Record<string, number> = {};
			for (const ref of refs) {
				const decorative = classifyDecorative(ref);
				if (!decorative) continue;
				const absolute = resolveRef(ref);
				if (!absolute) continue;
				byDecorative[decorative] =
					(byDecorative[decorative] ?? 0) + statSync(absolute).size;
			}
			for (const [cat, limit] of Object.entries(HOME_DECORATIVE_BUDGETS)) {
				const actual = byDecorative[cat] ?? 0;
				if (actual > limit) {
					violations.push({
						page: url,
						kind: `装饰资产 ${cat}`,
						detail: `${formatBytes(actual)} > ${formatBytes(limit)}（运行时按需加载的资产不应进首屏静态引用）`,
					});
				}
			}
		}

		const inlineTotal = inlineBytes.script + inlineBytes.style;
		heaviest.sort((a, b) => b.bytes - a.bytes);

		if (counted > budget.maxRequests) {
			violations.push({
				page: url,
				kind: "请求数",
				detail: `${counted} > ${budget.maxRequests}`,
			});
		}
		if (totalBytes > budget.maxTotalBytes) {
			violations.push({
				page: url,
				kind: "总字节",
				detail: `${formatBytes(totalBytes)} > ${formatBytes(budget.maxTotalBytes)}`,
			});
		}
		if (inlineTotal > budget.maxInlineBytes) {
			violations.push({
				page: url,
				kind: "内联字节",
				detail: `${formatBytes(inlineTotal)} > ${formatBytes(budget.maxInlineBytes)}`,
			});
		}
		for (const [kind, limit] of Object.entries(budget.maxBytesByKind ?? {})) {
			const actual = byKind[kind] ?? 0;
			if (limit !== undefined && actual > limit) {
				violations.push({
					page: url,
					kind: `${kind} 字节`,
					detail: `${formatBytes(actual)} > ${formatBytes(limit)}`,
				});
			}
		}

		rows.push({
			url,
			pageClass,
			requests: counted,
			totalBytes,
			inlineBytes: inlineTotal,
			byKind,
			heaviest,
		});
	}

	rows.sort((a, b) => b.totalBytes - a.totalBytes);

	console.log("\n交付预算 · 产物级检查（口径：dist 磁盘原始字节）");
	console.log(
		`扫描 ${rows.length} 个页面 · 单文件上限 ${formatBytes(MAX_ASSET_BYTES)}\n`,
	);
	console.log(
		[
			"页面".padEnd(40),
			"类别".padEnd(6),
			"请求".padStart(6),
			"被引用".padStart(10),
			"内联".padStart(8),
		].join(" "),
	);
	console.log("-".repeat(74));
	for (const row of rows.slice(0, 25)) {
		console.log(
			[
				row.url.length > 39 ? `${row.url.slice(0, 36)}...` : row.url.padEnd(40),
				row.pageClass.padEnd(6),
				String(row.requests).padStart(6),
				formatBytes(row.totalBytes).padStart(10),
				formatBytes(row.inlineBytes).padStart(8),
			].join(" "),
		);
	}
	if (rows.length > 25)
		console.log(`… 其余 ${rows.length - 25} 个页面省略（按体积倒序）`);

	// 按页面类别的极值：校准阈值时看这一块，比看单个页面有用
	const byClass = new Map<
		PageClass,
		{ n: number; maxBytes: number; maxRequests: number; at: string }
	>();
	for (const row of rows) {
		const cur = byClass.get(row.pageClass);
		if (!cur) {
			byClass.set(row.pageClass, {
				n: 1,
				maxBytes: row.totalBytes,
				maxRequests: row.requests,
				at: row.url,
			});
			continue;
		}
		cur.n += 1;
		if (row.totalBytes > cur.maxBytes) {
			cur.maxBytes = row.totalBytes;
			cur.at = row.url;
		}
		cur.maxRequests = Math.max(cur.maxRequests, row.requests);
	}
	console.log("\n按类别极值：");
	for (const [pageClass, v] of byClass) {
		const budget = DELIVERY_BUDGETS[pageClass];
		const totalCap =
			budget.maxTotalBytes === undefined
				? "不设"
				: formatBytes(budget.maxTotalBytes);
		console.log(
			`  ${pageClass.padEnd(5)} ${String(v.n).padStart(4)} 页 | 最重 ${formatBytes(v.maxBytes).padStart(9)} (上限 ${totalCap}) | 最多请求 ${String(v.maxRequests).padStart(4)} (上限 ${budget.maxRequests}) | ${v.at}`,
		);
	}

	if (TOP_N > 0 && rows[0]) {
		console.log(`\n最重页面 ${rows[0].url} 的前 ${TOP_N} 个资产：`);
		for (const item of rows[0].heaviest.slice(0, TOP_N)) {
			console.log(`  ${formatBytes(item.bytes).padStart(10)}  ${item.ref}`);
		}
	}

	// 全局资产审计：与页面无关，凡超过上限的都要登记
	const oversized: Array<{ rel: string; bytes: number; allowed: boolean }> = [];
	for (const file of walkAllFiles(DIST_ROOT)) {
		const size = statSync(file).size;
		if (size <= MAX_ASSET_BYTES) continue;
		if (/\.html?$/.test(file)) continue; // 页面本身由上面的预算管
		const rel = toDistRelative(file);
		oversized.push({ rel, bytes: size, allowed: matchAllowlist(rel) !== null });
	}
	oversized.sort((a, b) => b.bytes - a.bytes);

	const unregistered = oversized.filter((item) => !item.allowed);
	console.log(
		`\n单文件 > ${formatBytes(MAX_ASSET_BYTES)}：${oversized.length} 个（已登记 ${oversized.length - unregistered.length}）`,
	);
	for (const item of oversized.slice(0, 10)) {
		console.log(
			`  ${item.allowed ? "✓" : "✗"} ${formatBytes(item.bytes).padStart(10)}  ${item.rel}`,
		);
	}
	for (const item of unregistered) {
		violations.push({
			page: item.rel,
			kind: "未登记大文件",
			detail: `${formatBytes(item.bytes)} —— 请在 ASSET_ALLOWLIST 登记理由，或减重`,
		});
	}

	if (violations.length === 0) {
		console.log(`\n✓ 交付预算通过（${rows.length} 个页面，0 违规）\n`);
		return;
	}

	console.error(`\n✗ 交付预算未通过：${violations.length} 条违规\n`);
	for (const v of violations) {
		console.error(`  [${v.kind}] ${v.page} — ${v.detail}`);
	}
	console.error(
		"\n调整方式：改 src/lib/delivery-budget.ts 的阈值；若是「有意接受」，写进 ASSET_ALLOWLIST 并附理由。\n",
	);
	process.exit(1);
}

main();
