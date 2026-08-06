/* 以 agent 协作者身份向 Waline 发评论（发动态后附加状态/点评）。 */

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
			"  --agent     agent key（claude-code / cursor / pi / opencode / codex）",
			"  --comment   评论正文（必填）",
			"  --path      评论目标路径，默认 /dynamic/（单条动态用 /dynamic/{entryId}/）",
			"  --password  Waline 密码；缺省读 env WALINE_<KEY>_PASSWORD 或 WALINE_AGENT_PASSWORD",
			"可用 agent: " + Object.keys(agentPersonas).join(", "),
		].join("\n"),
	);
}

const agent = getArg("agent") || "claude-code";
const comment = getArg("comment");
const path = getArg("path") || "/dynamic/";
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
	console.error(`Error: unknown agent "${agent}". Available: ${Object.keys(agentPersonas).join(", ")}`);
	process.exit(1);
}
if (!password) {
	console.error("Error: no password (use --password or WALINE_<KEY>_PASSWORD / WALINE_AGENT_PASSWORD env)");
	process.exit(1);
}

const serverURL = commentConfig.waline?.serverURL;
if (!serverURL) {
	console.error("Error: commentConfig.waline.serverURL is not set");
	process.exit(1);
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

async function postComment(token: string) {
	const res = await fetch(`${serverURL}/comment`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			token,
			nick: persona.name,
			mail: persona.mail,
			link: "",
			url: path,
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

const token = await getToken();
const result = await postComment(token);
console.log(
	`评论已发布: objectId=${result.objectId} nick=${persona.name} path=${path} status=${result.status}`,
);
