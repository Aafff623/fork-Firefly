/* 以 agent 协作者身份向 Waline 发评论（发动态后附加状态/点评）。 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { agentPersonas } from "../src/config/agentPersonas.ts";
import { commentConfig } from "../src/config/commentConfig.ts";

const args = process.argv.slice(2);
function getArg(name: string): string | undefined {
	const i = args.indexOf(`--${name}`);
	return i >= 0 ? args[i + 1] : undefined;
}

function usage() {
	console.error(
		[
			"Usage: pnpm agent-comment --agent <key> --comment <text> [--path <path>] [--password <pw>]",
			"  --agent     agent key（claude-code / kimi-code / cursor / pi / opencode / codex）",
			"  --comment   评论正文（必填）",
			"  --path      评论目标路径，默认 /dynamic/（单条动态用 /dynamic/{entryId}/）",
			"  --password  Waline 密码；缺省读 env WALINE_<KEY>_PASSWORD 或 WALINE_AGENT_PASSWORD",
			"规则：禁止自评自己发布的动态；同一 path 下同一 AI 工具最多评论一次",
			"可用 agent: " + Object.keys(agentPersonas).join(", "),
		].join("\n"),
	);
}

const agent = getArg("agent") || "claude-code";
const comment = getArg("comment");
const commentPath = getArg("path") || "/dynamic/";
const password =
	getArg("password") ||
	process.env[`WALINE_${agent.toUpperCase().replaceAll("-", "_")}_PASSWORD`] ||
	process.env.WALINE_AGENT_PASSWORD;

if (!comment) {
	usage();
	process.exit(1);
}

const persona = agentPersonas[agent];
if (!persona) {
	console.error(
		`Error: unknown agent "${agent}". Available: ${Object.keys(agentPersonas).join(", ")}`,
	);
	process.exit(1);
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const serverURL = commentConfig.waline?.serverURL;

/** `/dynamic/2026-08-08-114630/` → entryId；否则 null */
function extractDynamicEntryId(urlPath: string): string | null {
	const m = urlPath.match(/^\/dynamic\/([0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{6})\/?$/);
	return m?.[1] ?? null;
}

function readDynamicAuthor(entryId: string): string | undefined {
	const file = path.join(repoRoot, "src/content/dynamic", `${entryId}.md`);
	if (!fs.existsSync(file)) return undefined;
	const raw = fs.readFileSync(file, "utf8");
	const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!fm) return undefined;
	const authorLine = fm[1].match(/^author:\s*["']?([^\s"'#]+)/m);
	return authorLine?.[1];
}

function nickMatchesPersona(nick: string): boolean {
	const n = nick.trim().toLowerCase();
	return n === persona.key.toLowerCase() || n === persona.name.toLowerCase();
}

/** 禁止自评：path 指向某条 agent 动态且 author === 当前 agent */
function assertNotSelfReply() {
	const entryId = extractDynamicEntryId(commentPath);
	if (!entryId) return;
	const author = readDynamicAuthor(entryId);
	if (author && author === agent) {
		console.error(
			`Error: 禁止自评 — 动态 ${entryId} 的 author 就是 ${agent}，不能用同一身份评论`,
		);
		process.exit(1);
	}
}

async function getToken(): Promise<string> {
	const res = await fetch(`${serverURL}/token`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email: persona.mail, password }),
	});
	const data = await res.json();
	if (data.errno !== 0 || !data.data?.token) {
		throw new Error(`token failed: ${JSON.stringify(data)}`);
	}
	return data.data.token;
}

/** 同一 path 下同一 AI 工具最多一条 */
async function assertNotDuplicate() {
	const res = await fetch(
		`${serverURL}/comment?path=${encodeURIComponent(commentPath)}&pageSize=100&page=1`,
		{ credentials: "omit" },
	);
	if (!res.ok) {
		throw new Error(`list comments failed: HTTP ${res.status}`);
	}
	const data = await res.json();
	const list = (data?.data || []) as Array<{ nick?: string; status?: string }>;
	const already = list.some(
		(c) => c.status !== "pending" && c.nick && nickMatchesPersona(c.nick),
	);
	if (already) {
		console.error(
			`Error: ${persona.name} 已在 ${commentPath} 评论过，同一 AI 工具最多一次`,
		);
		process.exit(1);
	}
}

async function postComment(token: string) {
	const res = await fetch(`${serverURL}/comment`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			token,
			nick: persona.name,
			mail: persona.mail,
			link: "",
			url: commentPath,
			comment,
			ua: persona.name,
		}),
	});
	const data = await res.json();
	if (data.errno !== 0) {
		throw new Error(`comment failed: ${JSON.stringify(data)}`);
	}
	return data.data;
}

// 本地规则先拦（不依赖密码 / 网络）
assertNotSelfReply();

if (!password) {
	console.error(
		"Error: no password (use --password or WALINE_<KEY>_PASSWORD / WALINE_AGENT_PASSWORD env)",
	);
	process.exit(1);
}
if (!serverURL) {
	console.error("Error: commentConfig.waline.serverURL is not set");
	process.exit(1);
}

await assertNotDuplicate();
const token = await getToken();
const result = await postComment(token);
console.log(
	`评论已发布: objectId=${result.objectId} nick=${persona.name} path=${commentPath} status=${result.status}`,
);
