/**
 * 梗图联想密集循环测试 harness
 * - 读取 temp/sticker-corpora 下各子目录 phrases.jsonl（可缺省、可轮询）
 * - L1 直调词表逻辑；未命中可选 DeepSeek Agent（节流）
 * - 高价值命中写回 zh-meme.json keywords（持久）
 * - 产出 temp/sticker-corpora/bench-report.md
 */ // 中文注释：独立 node 脚本，不依赖 astro path alias

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIREFLY_ROOT = path.resolve(__dirname, "..", "..");
const LEXICON_PATH = path.join(
	FIREFLY_ROOT,
	"src",
	"data",
	"sticker-lexicon",
	"zh-meme.json",
);
const CORPORA_ROOT = path.join(FIREFLY_ROOT, "temp", "sticker-corpora");
const DEFAULT_PATCH_PATH = path.join(CORPORA_ROOT, "lexicon-keyword-patch.json");
const DEFAULT_REPORT_PATH = path.join(CORPORA_ROOT, "bench-report.md");
const ENV_PATH = path.join(FIREFLY_ROOT, ".env");

// ---------- CLI ---------- // 中文注释：参数解析
function parseArgs(argv) {
	const opts = {
		rounds: 2,
		agent: true,
		concurrency: 1,
		gapMs: 300,
		maxAgent: 200,
		waitMs: 90_000,
		pollMs: 5_000,
		seed: true,
		apply: true,
		maxResults: 6,
		maxKwLen: 8,
		minKwLen: 2,
		dirs: null, // 中文注释：null=全部；否则只扫指定子目录名
		reportPath: DEFAULT_REPORT_PATH,
		patchPath: DEFAULT_PATCH_PATH,
	};
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		const next = () => argv[++i];
		if (a === "--rounds") opts.rounds = Math.max(1, Number(next()) || 2);
		else if (a === "--no-agent") opts.agent = false;
		else if (a === "--agent") opts.agent = true;
		else if (a === "--concurrency")
			opts.concurrency = Math.max(1, Math.min(2, Number(next()) || 1));
		else if (a === "--gap-ms") opts.gapMs = Math.max(0, Number(next()) || 300);
		else if (a === "--max-agent")
			opts.maxAgent = Math.max(0, Number(next()) || 200);
		else if (a === "--wait-ms") opts.waitMs = Math.max(0, Number(next()) || 0);
		else if (a === "--poll-ms")
			opts.pollMs = Math.max(1000, Number(next()) || 5000);
		else if (a === "--max-kw-len")
			opts.maxKwLen = Math.max(2, Number(next()) || 8);
		else if (a === "--no-seed") opts.seed = false;
		else if (a === "--no-apply") opts.apply = false;
		else if (a === "--dirs") {
			const raw = String(next() || "");
			opts.dirs = raw
				.split(/[,，]/)
				.map((s) => s.trim())
				.filter(Boolean);
		} else if (a === "--report") opts.reportPath = path.resolve(next());
		else if (a === "--patch") opts.patchPath = path.resolve(next());
		else if (a === "--help" || a === "-h") {
			console.log(`Usage: node run-corpus-loop.mjs [options]
  --rounds N         测试轮数（默认 2：写回前/后）
  --agent / --no-agent
  --concurrency 1|2  Agent 并发（默认 1）
  --gap-ms N         Agent 间隔 ms（默认 300）
  --max-agent N      每轮最多 Agent 调用（默认 120）
  --wait-ms N        等待语料目录出现（默认 90000）
  --poll-ms N        轮询间隔（默认 5000）
  --dirs a,b         只加载指定语料子目录（如 ack-replies）
  --report PATH      报告输出路径
  --patch PATH       补丁输出路径
  --no-seed          不用词表 keywords 做种子
  --no-apply         只写补丁，不合并进 zh-meme.json`);
			process.exit(0);
		}
	}
	return opts;
}

// ---------- env（只读，永不打印 key） ---------- // 中文注释
function loadEnvFile(filePath) {
	if (!fs.existsSync(filePath)) return;
	const text = fs.readFileSync(filePath, "utf8");
	for (const line of text.split(/\r?\n/)) {
		const t = line.trim();
		if (!t || t.startsWith("#")) continue;
		const eq = t.indexOf("=");
		if (eq <= 0) continue;
		const key = t.slice(0, eq).trim();
		let val = t.slice(eq + 1).trim();
		if (
			(val.startsWith('"') && val.endsWith('"')) ||
			(val.startsWith("'") && val.endsWith("'"))
		) {
			val = val.slice(1, -1);
		}
		if (!(key in process.env) || process.env[key] === "") {
			process.env[key] = val;
		}
	}
}

function getDeepSeekEnv() {
	const apiKey = (
		process.env.DEEPSEEK_API_KEY ||
		process.env.STICKER_AGENT_API_KEY ||
		""
	).trim();
	if (!apiKey) return null;
	const baseUrl = (
		process.env.DEEPSEEK_API_BASE ||
		process.env.STICKER_AGENT_BASE_URL ||
		"https://api.deepseek.com"
	).replace(/\/$/, "");
	const model =
		process.env.DEEPSEEK_MODEL ||
		process.env.STICKER_AGENT_MODEL ||
		"deepseek-v4-flash";
	return { apiKey, baseUrl, model };
}

// ---------- normalize + L1（与生产逻辑对齐） ---------- // 中文注释
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
	for (const entry of entries) {
		if (!entry.enabled) continue;
		for (const kw of entry.keywords || []) {
			const key = normalizeQuery(kw);
			if (!key) continue;
			const list = map.get(key) ?? [];
			if (!list.some((e) => e.id === entry.id)) list.push(entry);
			map.set(key, list);
		}
	}
	return map;
}

function lookupLexicon(map, rawQuery, maxResults) {
	const q = normalizeQuery(rawQuery);
	if (!q) return [];
	const exact = map.get(q);
	if (exact?.length) return exact.slice(0, maxResults);

	let bestKey = "";
	let bestEntries = [];
	for (const [key, entries] of map) {
		if (key.length < 2) continue;
		if (!q.endsWith(key)) continue;
		if (key.length > bestKey.length) {
			bestKey = key;
			bestEntries = entries;
		}
	}
	return bestEntries.slice(0, maxResults);
}

// ---------- corpora IO ---------- // 中文注释
function walkFiles(dir, namePredicate) {
	const out = [];
	if (!fs.existsSync(dir)) return out;
	const stack = [dir];
	while (stack.length) {
		const cur = stack.pop();
		let ents;
		try {
			ents = fs.readdirSync(cur, { withFileTypes: true });
		} catch {
			continue;
		}
		for (const ent of ents) {
			const p = path.join(cur, ent.name);
			if (ent.isDirectory()) stack.push(p);
			else if (ent.isFile() && namePredicate(ent.name, p)) out.push(p);
		}
	}
	return out;
}

function listPhraseFiles(dirsFilter = null) {
	// 中文注释：dirsFilter 为子目录名列表时，只收这些目录下的 phrases.jsonl
	if (Array.isArray(dirsFilter) && dirsFilter.length) {
		const out = [];
		for (const d of dirsFilter) {
			const p = path.join(CORPORA_ROOT, d, "phrases.jsonl");
			if (fs.existsSync(p)) out.push(p);
		}
		return out;
	}
	return walkFiles(CORPORA_ROOT, (name) => name === "phrases.jsonl");
}

function sleep(ms) {
	return new Promise((r) => setTimeout(r, ms));
}

async function waitForCorpora(waitMs, pollMs, dirsFilter = null) {
	const started = Date.now();
	let files = listPhraseFiles(dirsFilter);
	if (files.length) return files;
	if (waitMs <= 0) return files;
	console.log(
		`[bench] 等待语料 phrases.jsonl 出现（最多 ${waitMs}ms，间隔 ${pollMs}ms）…`,
	);
	while (Date.now() - started < waitMs) {
		await sleep(pollMs);
		files = listPhraseFiles(dirsFilter);
		if (files.length) {
			console.log(`[bench] 发现 ${files.length} 个 phrases.jsonl`);
			return files;
		}
		const left = Math.max(0, waitMs - (Date.now() - started));
		console.log(`[bench] 仍无语料，剩余等待 ~${Math.ceil(left / 1000)}s`);
	}
	return listPhraseFiles(dirsFilter);
}

function loadPhrasesFromJsonl(files) {
	const texts = new Set();
	const meta = [];
	for (const file of files) {
		let lines;
		try {
			lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
		} catch {
			continue;
		}
		let n = 0;
		for (const line of lines) {
			const t = line.trim();
			if (!t) continue;
			try {
				const obj = JSON.parse(t);
				const text =
					typeof obj.text === "string"
						? obj.text
						: typeof obj.phrase === "string"
							? obj.phrase
							: typeof obj.q === "string"
								? obj.q
								: null;
				if (!text || !String(text).trim()) continue;
				const norm = normalizeQuery(text);
				if (!norm || norm.length < 2) continue;
				if (norm.length > 32) continue;
				texts.add(String(text).trim().slice(0, 32));
				n++;
			} catch {
				// 跳过坏行
			}
		}
		meta.push({ file, count: n });
	}
	return { texts, meta };
}

/** 从词表 keywords 生成种子 + 口语变体 */ // 中文注释：语料未就绪时也能自测
function buildSeedPhrases(entries) {
	const out = new Set();
	const prefixes = ["哈哈", "啊", "我", "真的", "也太", "有点", "太", ""];
	const suffixes = ["了", "啊", "呀", "！", "!!!", "~", ""];
	for (const e of entries) {
		if (!e.enabled) continue;
		for (const kw of e.keywords || []) {
			const base = String(kw).trim();
			if (!base) continue;
			out.add(base);
			for (const p of prefixes) {
				for (const s of suffixes) {
					const v = `${p}${base}${s}`;
					const n = normalizeQuery(v);
					if (n.length >= 2 && n.length <= 32) out.add(v.slice(0, 32));
				}
			}
		}
		// title 也作为候选查询
		if (e.title) out.add(String(e.title).trim());
	}
	return out;
}

// ---------- Agent ---------- // 中文注释：节流 + 只选已有 id
function parseIds(content) {
	const data = JSON.parse(content);
	if (!Array.isArray(data.ids)) return [];
	return data.ids.filter((id) => typeof id === "string" && !!id);
}

async function suggestByDeepSeek(env, catalog, query, maxResults) {
	const system = `你是博客评论区的中文热梗表情匹配助手。根据用户短词，从给定目录中选出最合适的表情 id。
必须输出 JSON 对象，格式示例：{"ids":["hao-ye","xiao-si"]}
规则：
1. 只能使用目录里已有的 id，禁止编造 id 或 URL。
2. 最多返回 ${maxResults} 个 id，按相关度排序。
3. 仅当语义明显匹配（同义/近义/同一情绪或梗）时才选；不确定或只是表情包长配文 → {"ids":[]}。
4. 禁止因为「有点像调侃/无语」就把无关长句硬塞进某个 id。
5. 只输出 JSON，不要其他文字。`;
	const user = `用户输入：${query}\n目录：${JSON.stringify(catalog)}`;
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), 2800);
	try {
		const res = await fetch(`${env.baseUrl}/chat/completions`, {
			method: "POST",
			signal: controller.signal,
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${env.apiKey}`,
			},
			body: JSON.stringify({
				model: env.model,
				messages: [
					{ role: "system", content: system },
					{ role: "user", content: user },
				],
				stream: false,
				thinking: { type: "disabled" },
				response_format: { type: "json_object" },
				max_tokens: 256,
				temperature: 0.2,
			}),
		});
		if (!res.ok) {
			console.warn(`[bench] DeepSeek HTTP ${res.status}`);
			return [];
		}
		const payload = await res.json();
		const content = payload?.choices?.[0]?.message?.content;
		if (!content) return [];
		return parseIds(content).slice(0, maxResults);
	} catch (err) {
		const name = err instanceof Error ? err.name : "";
		if (name !== "AbortError") {
			console.warn("[bench] DeepSeek error:", name || "unknown");
		}
		return [];
	} finally {
		clearTimeout(timer);
	}
}

/** 简单并发池 */ // 中文注释
async function mapPool(items, concurrency, worker) {
	const results = new Array(items.length);
	let cursor = 0;
	async function runner() {
		while (cursor < items.length) {
			const i = cursor++;
			results[i] = await worker(items[i], i);
		}
	}
	const n = Math.min(concurrency, Math.max(1, items.length));
	await Promise.all(Array.from({ length: n }, () => runner()));
	return results;
}

// ---------- 写回 ---------- // 中文注释：只挂现有 entry，短词高价值
function keywordAlreadyCovered(map, phrase) {
	return lookupLexicon(map, phrase, 1).length > 0;
}

/** 评论联想可复用的短 keyword 门禁 */ // 中文注释
function isHighValueKeyword(raw, opts) {
	const s = String(raw || "").trim();
	if (!s) return false;
	const n = normalizeQuery(s);
	if (!n) return false;
	if (n.length < opts.minKwLen || n.length > opts.maxKwLen) return false;
	// 拒绝明显长配文 / 句子
	if (/[，,。！？!?]/.test(s)) return false;
	if ([...n].length > opts.maxKwLen) return false;
	// 拒绝空心填充
	if (/^(.)\1{3,}$/u.test(n)) return false;
	return true;
}

/** 与 entry 标题/已有词有字面重叠 → 更高置信 */ // 中文注释
function overlapsEntry(entry, phrase) {
	const n = normalizeQuery(phrase);
	const bag = [entry.title, ...(entry.keywords || [])]
		.map((x) => normalizeQuery(x))
		.filter(Boolean);
	for (const b of bag) {
		if (!b) continue;
		if (n === b || n.includes(b) || b.includes(n)) return true;
		// 至少共享 2 个汉字
		const chars = [...n].filter((ch) => /[\u4e00-\u9fff]/.test(ch));
		let share = 0;
		for (const ch of chars) {
			if (b.includes(ch)) share++;
		}
		if (share >= 2) return true;
	}
	return false;
}

/**
 * 高价值同义/近义补丁（不依赖 Agent，挂到已有 id）
 * 仅短词，禁止外链
 */ // 中文注释
const HEURISTIC_SYNONYMS = {
	"hao-ye": [
		"太好了",
		"棒",
		"真棒",
		"nice",
		"可以可以",
		"好嘟",
		// ack 软答应 // 中文注释
		"好的",
		"好的呢",
		"好哒",
		"好嘞",
		"好呀",
		"好哦",
		"好滴",
		"得嘞",
		"嗯呐",
		"嗯哼",
		"好说",
	],
	"xiao-si": ["乐了", "笑哭", "笑不活了", "哈哈哈", "蚌埠住了", "笑疯", "笑嘻了"],
	"po-fang": ["防不住", "破大防了", "心态崩了", "绷不住"],
	yyds: [
		"永远滴神",
		"封神了",
		"太神了",
		// ack 确认/收到（thumbsup） // 中文注释
		"收到",
		"收到了",
		"明白",
		"明白了",
		"了解",
		"了解了",
		"知道了",
		"晓得了",
		"没问题",
		"搞定",
		"可以的",
		"行的",
		"ok",
		"ok啦",
		"已读",
		"已阅",
		"妥了",
		"稳的",
		"成了",
		"准了",
		"包的",
		"get到了",
	],
	"jue-jue-zi": ["绝绝", "太绝了", "绝了啊", "YYDS级"],
	"wu-yu": ["无语了", "无语住了", "醉了", "服了"],
	awsl: ["啊啊啊", "我死了", "冲晕了"],
	"jia-you": [
		"冲鸭",
		"搞起",
		"奥利给",
		"加油鸭",
		// ack 行动承接（clap） // 中文注释
		"安排了",
		"安排上了",
		"马上安排",
		"照做",
		"照做了",
		"照办",
		"按你说的",
		"按这个来",
		"我试试",
		"交给我",
	],
	"ku-le": ["呜呜", "泪崩", "哭哭", "哭辽"],
	"gan-kai": ["感动", "破防哭", "眼眶湿了"],
	emmm: ["嗯？", "那啥", "这个嘛"],
	"gan-jue": ["尴尬了", "社死现场", "脚趾抠地"],
	"sheng-qi": ["恼了", "气死了", "怒了啊", "火大"],
	kun: ["困困", "好困", "想睡觉", "哈欠"],
	"hai-xiu": ["害臊", "羞羞", "脸红红"],
	"bai-bai": ["拜了个拜", "溜了", "先走了", "88"],
	"yi-wen": ["啥情况", "为什么", "哈？", "嗯？？"],
	"tiao-kan": ["阴阳怪气", "嘲讽", "阴阳人"],
	"ou-xin": ["呕了", "恶臭", "恶心了"],
	"qin-qin": ["亲一口", "mua~", "啵啵"],
	"fan-bai-yan": ["白眼", "无语子啊", "翻个白眼"],
	"hai-pa": ["吓死", "恐怖", "怂了"],
	"ke-ai": ["好萌", "萌萌", "可爱捏", "萌死"],
	"zai-jian-qian": ["暴富了", "发财了", "躺赚"],
	"da-lian": ["打脸了", "啪啪打脸", "打脸现场"],
	"wa-ku": ["呵呵呵", "干笑", "嘿嘿"],
	"bu-xie": ["无所谓", "随意", "爱咋咋地"],
	"xiao-ku": ["苦笑了", "勉强笑", "尬笑"],
	"huang-zhang": ["慌了啊", "慌慌", "急了"],
	"bei-shang": ["伤心", "难受", "郁闷"],
	"wei-xiao": ["嘿嘿嘿", "偷笑", "坏笑"],
	"liu-han": ["汗", "冷汗了", "尴尬汗"],
};

function collectHeuristicAdditions(lexicon, opts) {
	const byId = new Map(lexicon.entries.map((e) => [e.id, e]));
	const out = [];
	for (const [entryId, kws] of Object.entries(HEURISTIC_SYNONYMS)) {
		if (!byId.has(entryId)) continue;
		for (const kw of kws) {
			if (isHighValueKeyword(kw, opts)) {
				out.push({ entryId, keyword: kw, via: "heuristic" });
			}
		}
	}
	return out;
}

function mergeKeywordsIntoLexicon(lexicon, additions, opts) {
	/** additions: Array<{ entryId, keyword }> */ // 中文注释
	const byId = new Map(lexicon.entries.map((e) => [e.id, e]));
	const added = [];
	const seen = new Set();
	for (const { entryId, keyword } of additions) {
		const entry = byId.get(entryId);
		if (!entry || !entry.enabled) continue;
		const raw = String(keyword).trim();
		if (!isHighValueKeyword(raw, opts)) continue;
		const norm = normalizeQuery(raw);
		const key = `${entryId}::${norm}`;
		if (seen.has(key)) continue;
		seen.add(key);
		const exists = (entry.keywords || []).some(
			(k) => normalizeQuery(k) === norm,
		);
		if (exists) continue;
		entry.keywords = [...(entry.keywords || []), raw];
		added.push({ entryId, keyword: raw, normalized: norm });
	}
	if (added.length) {
		lexicon.updatedAt = new Date().toISOString().slice(0, 10);
	}
	return added;
}

// ---------- 一轮评测 ---------- // 中文注释
async function runRound(label, phrases, lexicon, opts, agentEnv) {
	const map = buildIndex(lexicon.entries);
	const catalog = lexicon.entries
		.filter((e) => e.enabled)
		.map((e) => ({ id: e.id, title: e.title, keywords: e.keywords }));

	let l1Hit = 0;
	let agentHit = 0;
	let miss = 0;
	let agentCalls = 0;
	let agentErrors = 0;
	const latencies = [];
	const misses = [];
	const agentMappings = []; // { phrase, entryId, latencyMs }

	const list = [...phrases];
	const l1Misses = [];

	for (const phrase of list) {
		const t0 = Date.now();
		const hits = lookupLexicon(map, phrase, opts.maxResults);
		const ms = Date.now() - t0;
		latencies.push(ms);
		if (hits.length) {
			l1Hit++;
		} else {
			l1Misses.push(phrase);
		}
	}

	if (opts.agent && agentEnv && l1Misses.length && opts.maxAgent > 0) {
		// 优先短词（评论联想主战场），再补少量中长词探测
		const ranked = [...l1Misses].sort((a, b) => {
			const na = normalizeQuery(a).length;
			const nb = normalizeQuery(b).length;
			const score = (n) => (n >= 2 && n <= opts.maxKwLen ? n : 100 + n);
			return score(na) - score(nb) || na - nb;
		});
		const shortFirst = ranked.filter((p) =>
			isHighValueKeyword(p, opts),
		);
		const rest = ranked.filter((p) => !isHighValueKeyword(p, opts));
		const toAgent = [...shortFirst, ...rest].slice(0, opts.maxAgent);
		console.log(
			`[bench] ${label}: L1 miss ${l1Misses.length}，短词候选 ${shortFirst.length}，Agent 处理 ${toAgent.length}（并发 ${opts.concurrency}，间隔 ${opts.gapMs}ms）`,
		);
		let lastCallAt = 0;
		const agentResults = await mapPool(
			toAgent,
			opts.concurrency,
			async (phrase) => {
				const wait = opts.gapMs - (Date.now() - lastCallAt);
				if (wait > 0) await sleep(wait);
				lastCallAt = Date.now();
				agentCalls++;
				const t0 = Date.now();
				const ids = await suggestByDeepSeek(
					agentEnv,
					catalog,
					normalizeQuery(phrase).slice(0, 32),
					opts.maxResults,
				);
				const ms = Date.now() - t0;
				latencies.push(ms);
				const valid = ids.filter((id) =>
					catalog.some((c) => c.id === id),
				);
				if (!valid.length) {
					agentErrors++;
					return { phrase, entryId: null, ms };
				}
				return { phrase, entryId: valid[0], ms };
			},
		);

		const hitSet = new Set();
		for (const r of agentResults) {
			if (r?.entryId) {
				agentHit++;
				hitSet.add(r.phrase);
				agentMappings.push({
					phrase: r.phrase,
					entryId: r.entryId,
					latencyMs: r.ms,
				});
			}
		}
		// 未进 Agent 或 Agent 未命中的，一律计 miss（不重复累加）
		for (const phrase of l1Misses) {
			if (!hitSet.has(phrase)) misses.push(phrase);
		}
	} else {
		misses.push(...l1Misses);
	}

	miss = misses.length;
	const total = list.length;
	const avgLatency =
		latencies.length === 0
			? 0
			: Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);

	return {
		label,
		total,
		l1Hit,
		agentHit,
		miss,
		agentCalls,
		agentErrors,
		avgLatencyMs: avgLatency,
		l1Rate: total ? l1Hit / total : 0,
		anyHitRate: total ? (l1Hit + agentHit) / total : 0,
		misses,
		agentMappings,
	};
}

function pct(n) {
	return `${(n * 100).toFixed(1)}%`;
}

function topCounts(items, limit = 30) {
	const c = new Map();
	for (const x of items) {
		const k = normalizeQuery(x) || x;
		c.set(k, (c.get(k) || 0) + 1);
	}
	return [...c.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, limit);
}

function writeReport({
	opts,
	corpusMeta,
	seedCount,
	phraseCount,
	round1,
	round2,
	added,
	patchCount,
	agentAvailable,
	reportPath,
	patchPath,
}) {
	const lines = [];
	lines.push("# Sticker Suggest Bench Report");
	lines.push("");
	lines.push(`生成时间：${new Date().toISOString()}`);
	lines.push("");
	lines.push("## 配置");
	lines.push("");
	lines.push("| 项 | 值 |");
	lines.push("|---|---|");
	lines.push(`| rounds | ${opts.rounds} |`);
	lines.push(`| agent | ${opts.agent && agentAvailable ? "on" : "off"} |`);
	lines.push(`| concurrency | ${opts.concurrency} |`);
	lines.push(`| gapMs | ${opts.gapMs} |`);
	lines.push(`| maxAgent | ${opts.maxAgent} |`);
	lines.push(`| dirs | ${opts.dirs?.length ? opts.dirs.join(",") : "(all)"} |`);
	lines.push(`| phrases | ${phraseCount} |`);
	lines.push(`| seedPhrases | ${seedCount} |`);
	lines.push(`| corpusFiles | ${corpusMeta.length} |`);
	lines.push(`| keywordsAdded | ${added.length} |`);
	lines.push(`| patchEntries | ${patchCount} |`);
	lines.push("");

	if (corpusMeta.length) {
		lines.push("## 语料文件");
		lines.push("");
		lines.push("| 文件 | 行数(有效) |");
		lines.push("|---|---|");
		for (const m of corpusMeta) {
			const rel = path.relative(FIREFLY_ROOT, m.file).replace(/\\/g, "/");
			lines.push(`| ${rel} | ${m.count} |`);
		}
		lines.push("");
	}

	lines.push("## 命中率对比");
	lines.push("");
	lines.push("| 轮次 | 总数 | L1 命中 | Agent 命中 | Miss | L1 命中率 | 综合命中率 | 均延迟 ms | Agent 调用 |");
	lines.push("|---|---|---|---|---|---|---|---|---|");
	const rows = [round1, round2].filter(Boolean);
	for (const r of rows) {
		lines.push(
			`| ${r.label} | ${r.total} | ${r.l1Hit} | ${r.agentHit} | ${r.miss} | ${pct(r.l1Rate)} | ${pct(r.anyHitRate)} | ${r.avgLatencyMs} | ${r.agentCalls} |`,
		);
	}
	lines.push("");

	if (round1 && round2) {
		const dL1 = (round2.l1Rate - round1.l1Rate) * 100;
		const dAny = (round2.anyHitRate - round1.anyHitRate) * 100;
		lines.push("### 变化");
		lines.push("");
		lines.push(`- L1 命中率：${pct(round1.l1Rate)} → ${pct(round2.l1Rate)}（${dL1 >= 0 ? "+" : ""}${dL1.toFixed(1)} pt）`);
		lines.push(
			`- 综合命中率：${pct(round1.anyHitRate)} → ${pct(round2.anyHitRate)}（${dAny >= 0 ? "+" : ""}${dAny.toFixed(1)} pt）`,
		);
		lines.push(`- 新增 keywords：${added.length}`);
		lines.push("");
	}

	lines.push("## Top Miss（归一化）");
	lines.push("");
	const finalMisses = (round2 || round1).misses;
	const tops = topCounts(finalMisses, 40);
	if (!tops.length) {
		lines.push("_无 miss_");
	} else {
		lines.push("| 短语 | 次数 |");
		lines.push("|---|---|");
		for (const [k, n] of tops) {
			lines.push(`| ${k} | ${n} |`);
		}
	}
	lines.push("");

	lines.push("## 写回 Keywords（样本）");
	lines.push("");
	if (!added.length) {
		lines.push("_本轮无新增_");
	} else {
		lines.push("| entryId | keyword |");
		lines.push("|---|---|");
		for (const a of added.slice(0, 80)) {
			lines.push(`| ${a.entryId} | ${a.keyword} |`);
		}
		if (added.length > 80) {
			lines.push(`| … | 另有 ${added.length - 80} 条 |`);
		}
	}
	lines.push("");
	lines.push("## 路径");
	lines.push("");
	lines.push(`- 词表：\`src/data/sticker-lexicon/zh-meme.json\``);
	const patchRel = path.relative(FIREFLY_ROOT, patchPath).replace(/\\/g, "/");
	const reportRel = path.relative(FIREFLY_ROOT, reportPath).replace(/\\/g, "/");
	lines.push(`- 补丁：\`${patchRel}\``);
	lines.push(`- 报告：\`${reportRel}\``);
	lines.push("");

	fs.mkdirSync(path.dirname(reportPath), { recursive: true });
	// UTF-8 BOM，避免 Windows 记事本/部分工具乱码
	fs.writeFileSync(reportPath, "\uFEFF" + lines.join("\n"), "utf8");
}

// ---------- main ---------- // 中文注释
async function main() {
	const opts = parseArgs(process.argv.slice(2));
	loadEnvFile(ENV_PATH);

	if (!fs.existsSync(LEXICON_PATH)) {
		console.error("[bench] 找不到词表:", LEXICON_PATH);
		process.exit(1);
	}

	let lexicon = JSON.parse(fs.readFileSync(LEXICON_PATH, "utf8"));
	const agentEnv = getDeepSeekEnv();
	const agentAvailable = !!agentEnv;
	if (opts.agent && !agentAvailable) {
		console.warn("[bench] 未检测到 DEEPSEEK_API_KEY，本轮跳过 Agent");
		opts.agent = false;
	} else if (opts.agent) {
		console.log(
			`[bench] Agent 就绪（model=${agentEnv.model}，key 已加载，不打印）`,
		);
	}

	// 轮询语料（可按 --dirs 过滤，含 ack-replies） // 中文注释
	const phraseFiles = await waitForCorpora(opts.waitMs, opts.pollMs, opts.dirs);
	// 再扫一次，给并发下载一点缓冲
	await sleep(1500);
	const phraseFiles2 = listPhraseFiles(opts.dirs);
	const files = phraseFiles2.length ? phraseFiles2 : phraseFiles;

	const { texts: corpusTexts, meta: corpusMeta } = loadPhrasesFromJsonl(files);
	const seedSet = opts.seed ? buildSeedPhrases(lexicon.entries) : new Set();
	const all = new Set();
	for (const t of corpusTexts) all.add(t);
	for (const t of seedSet) all.add(t);

	// 去重按 normalize
	const byNorm = new Map();
	for (const t of all) {
		const n = normalizeQuery(t);
		if (!n || n.length < 2) continue;
		if (!byNorm.has(n)) byNorm.set(n, t);
	}
	const phrases = [...byNorm.values()];
	console.log(
		`[bench] 短语 ${phrases.length}（语料 ${corpusTexts.size} + 种子 ${seedSet.size}，文件 ${files.length}）`,
	);

	if (!phrases.length) {
		console.error("[bench] 无可用短语，退出");
		process.exit(1);
	}

	// Round 1：测 + 收集 Agent 映射（写回前）
	const round1 = await runRound("round1-before-writeback", phrases, lexicon, opts, agentEnv);
	console.log(
		`[bench] R1 L1=${pct(round1.l1Rate)} any=${pct(round1.anyHitRate)} miss=${round1.miss} agentCalls=${round1.agentCalls}`,
	);

	// 写回：启发式同义词 + Agent 高价值短词 → entry.keywords
	const additions = collectHeuristicAdditions(lexicon, opts);
	const mapBefore = buildIndex(lexicon.entries);
	const byId = new Map(lexicon.entries.map((e) => [e.id, e]));
	for (const m of round1.agentMappings) {
		const phrase = m.phrase;
		if (keywordAlreadyCovered(mapBefore, phrase)) continue;
		let kw = phrase.trim();
		const stripped = kw
			.replace(/^(哈哈|啊|我|真的|也太|有点|太)+/u, "")
			.replace(/[了啊呀！!~～]+$/u, "");
		const core = normalizeQuery(stripped);
		if (core.length >= opts.minKwLen && core.length <= opts.maxKwLen) {
			kw = stripped.trim() || kw;
		}
		if (!isHighValueKeyword(kw, opts)) continue;
		const entry = byId.get(m.entryId);
		if (!entry) continue;
		// Agent 命中且短词：要求与 entry 有字面重叠，或本身极短（≤4）近义场景
		const nlen = normalizeQuery(kw).length;
		if (nlen > 4 && !overlapsEntry(entry, kw)) continue;
		additions.push({ entryId: m.entryId, keyword: kw, via: "agent" });
		const nkw = normalizeQuery(kw);
		if (nkw && nkw !== kw && isHighValueKeyword(nkw, opts)) {
			additions.push({ entryId: m.entryId, keyword: nkw, via: "agent" });
		}
	}

	const added = mergeKeywordsIntoLexicon(lexicon, additions, opts);

	// 补丁文件（按 entry 聚合）
	const patchById = new Map();
	for (const a of added) {
		const arr = patchById.get(a.entryId) ?? [];
		arr.push(a.keyword);
		patchById.set(a.entryId, arr);
	}
	const patch = {
		updatedAt: new Date().toISOString(),
		addedKeywordCount: added.length,
		entries: [...patchById.entries()].map(([id, keywords]) => ({
			id,
			addKeywords: keywords,
		})),
	};
	fs.mkdirSync(path.dirname(opts.patchPath), { recursive: true });
	fs.writeFileSync(
		opts.patchPath,
		JSON.stringify(patch, null, "\t") + "\n",
		"utf8",
	);

	if (opts.apply && added.length) {
		fs.writeFileSync(
			LEXICON_PATH,
			JSON.stringify(lexicon, null, "\t") + "\n",
			"utf8",
		);
		console.log(`[bench] 已合并 ${added.length} 个 keywords → zh-meme.json`);
		// 重新读入，确保第二轮用磁盘版本
		lexicon = JSON.parse(fs.readFileSync(LEXICON_PATH, "utf8"));
	} else if (!added.length) {
		console.log("[bench] 无新增 keywords 可写回");
	} else {
		console.log("[bench] --no-apply：仅写补丁，未改 zh-meme.json");
	}

	// Round 2：写回后只比 L1（Agent 关闭，测缓存命中提升）
	let round2 = null;
	if (opts.rounds >= 2) {
		const optsR2 = { ...opts, agent: false };
		round2 = await runRound("round2-after-writeback", phrases, lexicon, optsR2, null);
		console.log(
			`[bench] R2 L1=${pct(round2.l1Rate)} any=${pct(round2.anyHitRate)} miss=${round2.miss}`,
		);
	}

	// 若仍有等待窗口且语料变多，追加一轮语料增量（可选增强）
	const lateFiles = listPhraseFiles(opts.dirs);
	if (lateFiles.length > files.length) {
		console.log(
			`[bench] 检测到新增语料文件 ${lateFiles.length - files.length}，追加增量评测…`,
		);
		const { texts: more } = loadPhrasesFromJsonl(lateFiles);
		for (const t of more) {
			const n = normalizeQuery(t);
			if (n && !byNorm.has(n)) {
				byNorm.set(n, t);
				phrases.push(t);
			}
		}
	}

	writeReport({
		opts,
		corpusMeta,
		seedCount: seedSet.size,
		phraseCount: phrases.length,
		round1,
		round2,
		added,
		patchCount: patch.entries.length,
		agentAvailable,
		reportPath: opts.reportPath,
		patchPath: opts.patchPath,
	});

	// JSON 语法自检
	try {
		JSON.parse(fs.readFileSync(LEXICON_PATH, "utf8"));
		console.log("[bench] zh-meme.json JSON OK");
	} catch (e) {
		console.error("[bench] zh-meme.json 语法错误", e);
		process.exit(1);
	}

	console.log(`[bench] 报告 → ${opts.reportPath}`);
	console.log(
		JSON.stringify(
			{
				phrases: phrases.length,
				round1L1: round1.l1Rate,
				round1Any: round1.anyHitRate,
				round2L1: round2?.l1Rate ?? null,
				keywordsAdded: added.length,
				report: opts.reportPath,
			},
			null,
			2,
		),
	);
}

main().catch((err) => {
	console.error("[bench] fatal:", err instanceof Error ? err.message : err);
	process.exit(1);
});
