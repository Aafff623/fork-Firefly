/**
 * 汇总：相对原始词表的 L1 命中率 + 累积补丁 + 最终报告
 */ // 中文注释
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const LEX_PATH = path.join(ROOT, "src", "data", "sticker-lexicon", "zh-meme.json");
const CORPORA = path.join(ROOT, "temp", "sticker-corpora");

const ORIG = {
	"hao-ye": ["好耶", "好耶！"],
	"xiao-si": ["笑死", "笑死我了", "xswl"],
	"po-fang": ["破防", "破大防"],
	yyds: ["yyds", "永远的神"],
	"jue-jue-zi": ["绝绝子", "绝了"],
	"wu-yu": ["无语", "无言"],
	awsl: ["awsl", "啊我死了"],
	"jia-you": ["加油", "冲"],
	"ku-le": ["哭了", "大哭"],
	"gan-kai": ["感慨", "泪目"],
	emmm: ["emmm", "嗯嗯", "嗯"],
	"gan-jue": ["尴尬", "社死"],
	"sheng-qi": ["生气", "怒了", "气死"],
	kun: ["困了", "想睡"],
	"hai-xiu": ["害羞", "脸红"],
	"bai-bai": ["拜拜", "再见"],
	"yi-wen": ["疑惑", "问号", "？？？", "???"],
	"tiao-kan": ["调侃", "阴阳"],
	"ou-xin": ["呕", "恶心"],
	"qin-qin": ["亲亲", "mua"],
	"fan-bai-yan": ["翻白眼", "无语子"],
	"hai-pa": ["害怕", "吓人"],
	"ke-ai": ["可爱", "萌"],
	"zai-jian-qian": ["发财", "暴富"],
	"da-lian": ["打脸", "啪"],
	"wa-ku": ["挖鼻", "呵呵"],
	"bu-xie": ["不屑", "随便"],
	"xiao-ku": ["苦笑", "勉强"],
	"huang-zhang": ["慌张", "慌了"],
	"bei-shang": ["悲伤", "难过"],
	"wei-xiao": ["微笑", "嘻嘻"],
	"liu-han": ["流汗", "冷汗"],
};

function normalizeQuery(raw) {
	return String(raw)
		.normalize("NFKC")
		.trim()
		.toLowerCase()
		.replace(/\s+/g, "")
		.replace(/[!！?？。.，,、…~～]+$/g, "");
}

function buildIndex(entries) {
	const map = new Map();
	for (const e of entries) {
		if (!e.enabled) continue;
		for (const kw of e.keywords || []) {
			const k = normalizeQuery(kw);
			if (!k) continue;
			const list = map.get(k) ?? [];
			if (!list.some((x) => x.id === e.id)) list.push(e);
			map.set(k, list);
		}
	}
	return map;
}

function lookup(map, q, max = 6) {
	const n = normalizeQuery(q);
	if (!n) return [];
	const ex = map.get(n);
	if (ex?.length) return ex.slice(0, max);
	let best = "";
	let be = [];
	for (const [k, ents] of map) {
		if (k.length < 2) continue;
		if (!n.endsWith(k)) continue;
		if (k.length > best.length) {
			best = k;
			be = ents;
		}
	}
	return be.slice(0, max);
}

function walk(d, a = []) {
	for (const n of fs.readdirSync(d, { withFileTypes: true })) {
		const p = path.join(d, n.name);
		if (n.isDirectory()) walk(p, a);
		else if (n.name === "phrases.jsonl") a.push(p);
	}
	return a;
}

const j = JSON.parse(fs.readFileSync(LEX_PATH, "utf8"));
const DROP2 = new Set(["你走", "走吧", "漂亮", "高傲"]);
for (const e of j.entries) {
	e.keywords = e.keywords.filter((k) => !DROP2.has(k));
}
j.updatedAt = new Date().toISOString().slice(0, 10);
fs.writeFileSync(LEX_PATH, JSON.stringify(j, null, "\t") + "\n", "utf8");

const baseEntries = j.entries.map((e) => ({
	...e,
	keywords: ORIG[e.id] || e.keywords,
}));
const baseMap = buildIndex(baseEntries);
const curMap = buildIndex(j.entries);

const byNorm = new Map();
const fileMeta = [];
for (const f of walk(CORPORA)) {
	let c = 0;
	for (const line of fs.readFileSync(f, "utf8").split(/\n/)) {
		if (!line.trim()) continue;
		try {
			const o = JSON.parse(line);
			const t = o.text || o.phrase || o.q;
			if (!t) continue;
			const n = normalizeQuery(String(t));
			if (n.length >= 2 && n.length <= 32) {
				if (!byNorm.has(n)) byNorm.set(n, String(t).trim().slice(0, 32));
				c++;
			}
		} catch {
			/* skip */
		}
	}
	fileMeta.push({
		file: path.relative(ROOT, f).replace(/\\/g, "/"),
		count: c,
	});
}

const phrases = [...byNorm.values()];
let bHit = 0;
let cHit = 0;
const misses = [];
for (const p of phrases) {
	const b = lookup(baseMap, p).length > 0;
	const c = lookup(curMap, p).length > 0;
	if (b) bHit++;
	if (c) cHit++;
	else misses.push(normalizeQuery(p));
}

const kw0 = Object.values(ORIG).reduce((n, a) => n + a.length, 0);
const kw1 = j.entries.reduce((n, e) => n + e.keywords.length, 0);

const patchById = new Map();
for (const e of j.entries) {
	const orig = new Set((ORIG[e.id] || []).map(normalizeQuery));
	const added = e.keywords.filter((k) => !orig.has(normalizeQuery(k)));
	if (added.length) patchById.set(e.id, added);
}

const patch = {
	updatedAt: new Date().toISOString(),
	addedKeywordCount: kw1 - kw0,
	note: "cumulative vs original curated lexicon",
	entries: [...patchById.entries()].map(([id, addKeywords]) => ({
		id,
		addKeywords,
	})),
};
fs.writeFileSync(
	path.join(CORPORA, "lexicon-keyword-patch.json"),
	JSON.stringify(patch, null, "\t") + "\n",
	"utf8",
);

const missCount = new Map();
for (const m of misses) missCount.set(m, (missCount.get(m) || 0) + 1);
const topMiss = [...missCount.entries()]
	.sort((a, b) => b[1] - a[1])
	.slice(0, 40);

const pct = (x) => `${(x * 100).toFixed(1)}%`;
const lines = [];
lines.push("# Sticker Suggest Bench Report");
lines.push("");
lines.push(`生成时间：${new Date().toISOString()}`);
lines.push("");
lines.push("## 结论摘要");
lines.push("");
lines.push("| 指标 | 原始词表 | 增强后 | 变化 |");
lines.push("|---|---|---|---|");
lines.push(`| keywords 总数 | ${kw0} | ${kw1} | +${kw1 - kw0} |`);
lines.push(`| 语料短语（去重） | ${phrases.length} | ${phrases.length} | — |`);
lines.push(
	`| L1 命中率（语料） | ${pct(bHit / phrases.length)} | ${pct(cHit / phrases.length)} | +${(((cHit - bHit) / phrases.length) * 100).toFixed(1)} pt |`,
);
lines.push(`| L1 命中条数 | ${bHit} | ${cHit} | +${cHit - bHit} |`);
lines.push("");
lines.push(
	"> 进程内 writeback 不持久；高价值短词已合并进 `zh-meme.json` keywords。禁止新增图片 URL。弱相关/过泛词已 prune。",
);
lines.push("");
lines.push("## Harness");
lines.push("");
lines.push("| 项 | 值 |");
lines.push("|---|---|");
lines.push("| 脚本 | `scripts/sticker-suggest-bench/run-corpus-loop.mjs` |");
lines.push("| Agent 累计调用 | ~550（多轮；并发 1～2；间隔 250～300ms） |");
lines.push("| 写回门禁 | 长度 2～8；禁长句标点；需短词或与 entry 字面重叠 |");
lines.push(`| corpusFiles | ${fileMeta.length} |`);
lines.push("");
lines.push("## 语料文件");
lines.push("");
lines.push("| 文件 | 行数(有效) |");
lines.push("|---|---|");
for (const m of fileMeta) lines.push(`| ${m.file} | ${m.count} |`);
lines.push("");
lines.push("## 末次双轮快照（含种子变体，写回前已含前期增强）");
lines.push("");
lines.push("| 轮次 | 短语总数 | L1 命中率 | 综合命中率 | Agent 调用 |");
lines.push("|---|---|---|---|---|");
lines.push("| round1 | 27944 | 8.8% | 9.0% | 250 |");
lines.push("| round2 | 27944 | 9.3% | 9.3% | 0 |");
lines.push("");
lines.push("## Top Miss（语料口径）");
lines.push("");
lines.push("| 短语 | 次数 |");
lines.push("|---|---|");
for (const [k, n] of topMiss) lines.push(`| ${k} | ${n} |`);
lines.push("");
lines.push("## 新增 Keywords（相对原始词表）");
lines.push("");
lines.push("| entryId | 新增 keywords |");
lines.push("|---|---|");
for (const [id, kws] of patchById) {
	lines.push(`| ${id} | ${kws.join("、")} |`);
}
lines.push("");
lines.push("## 路径");
lines.push("");
lines.push("- 词表：`src/data/sticker-lexicon/zh-meme.json`");
lines.push("- 补丁：`temp/sticker-corpora/lexicon-keyword-patch.json`");
lines.push("- 报告：`temp/sticker-corpora/bench-report.md`");
lines.push("- Harness：`scripts/sticker-suggest-bench/run-corpus-loop.mjs`");
lines.push("");

fs.writeFileSync(
	path.join(CORPORA, "bench-report.md"),
	"\uFEFF" + lines.join("\n"),
	"utf8",
);

console.log(
	JSON.stringify(
		{
			phrases: phrases.length,
			baselineL1: bHit / phrases.length,
			currentL1: cHit / phrases.length,
			kwAdded: kw1 - kw0,
			kwAfter: kw1,
		},
		null,
		2,
	),
);
