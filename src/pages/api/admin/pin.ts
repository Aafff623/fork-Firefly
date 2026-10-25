import fs from "node:fs/promises";
import path from "node:path";
import type { APIRoute } from "astro";
import { json, rateLimited, readJson } from "@/lib/api/http";
import { type OwnerAuthResult, requireOwnerUser } from "@/lib/supabase-auth";

export const prerender = false;

const POSTS_ROOT = path.join(process.cwd(), "src", "content", "posts");
const GITHUB_REPO = "Aafff623/fork-Firefly";
const GITHUB_EDIT_BRANCH = "master";
const NO_STORE = { "Cache-Control": "no-store" };

function toPosix(p: string): string {
	return p.replace(/\\/g, "/");
}

/** 只改 pinned 一行，避免 gray-matter 重排整个 frontmatter */
function setPinnedFrontmatter(raw: string, pinned: boolean): string {
	const value = pinned ? "true" : "false";
	if (/^pinned:\s*(true|false)\s*$/m.test(raw)) {
		return raw.replace(/^pinned:\s*(true|false)\s*$/m, `pinned: ${value}`);
	}
	if (!raw.startsWith("---")) {
		return `---\npinned: ${value}\n---\n${raw}`;
	}
	return raw.replace(/^(---\r?\n)/, `$1pinned: ${value}\n`);
}

function githubEditUrl(relativePath: string): string {
	return `https://github.com/${GITHUB_REPO}/edit/${GITHUB_EDIT_BRANCH}/${toPosix(relativePath)}`;
}

async function pathExists(filePath: string): Promise<boolean> {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
}

function normalizeHintPath(filePathHint: string): string {
	let hint = filePathHint.trim();
	if (hint.startsWith("file:///")) {
		hint = decodeURIComponent(hint.slice("file:///".length));
		// Windows file:///D:/path → D:/path
		if (/^[A-Za-z]:\//.test(hint) === false && hint.startsWith("/")) {
			// file:///C:/... on some runtimes becomes /C:/...
			hint = hint.replace(/^\/([A-Za-z]:\/)/, "$1");
		}
	}
	return hint.replace(/\\/g, "/");
}

async function resolvePostFile(
	postId: string,
	filePathHint?: string,
): Promise<string | null> {
	if (filePathHint) {
		const hint = normalizeHintPath(filePathHint);
		const absolute = path.isAbsolute(hint)
			? path.normalize(hint)
			: path.join(process.cwd(), hint.replace(/^\//, ""));
		const relative = path.relative(POSTS_ROOT, absolute);
		const insidePosts =
			relative !== "" &&
			!relative.startsWith(`..${path.sep}`) &&
			!path.isAbsolute(relative) &&
			/\.(?:md|mdx)$/i.test(absolute);
		if (insidePosts && (await pathExists(absolute))) return absolute;
	}

	const id = postId.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
	const candidates = [
		path.join(POSTS_ROOT, `${id}.md`),
		path.join(POSTS_ROOT, `${id}.mdx`),
		path.join(POSTS_ROOT, id, "index.md"),
		path.join(POSTS_ROOT, id, "index.mdx"),
	];

	// id 已含 index 时（如 guide/index）
	if (id.endsWith("/index")) {
		const base = id.slice(0, -"/index".length);
		candidates.push(
			path.join(POSTS_ROOT, `${base}.md`),
			path.join(POSTS_ROOT, base, "index.md"),
			path.join(POSTS_ROOT, base, "index.mdx"),
		);
	}

	for (const candidate of candidates) {
		if (await pathExists(candidate)) return candidate;
	}
	return null;
}

function denied(auth: Extract<OwnerAuthResult, { ok: false }>): Response {
	if (auth.status === 429) return rateLimited(auth.retryAfterSeconds ?? 1);
	return json(auth.status, { ok: false, error: auth.error }, NO_STORE);
}

export const POST: APIRoute = async ({ request, cookies }) => {
	const validation = await requireOwnerUser(request, cookies, {
		originCheck: true,
	});
	if (!validation.ok) return denied(validation);

	const read = await readJson<{
		postId?: string;
		pinned?: boolean;
		filePath?: string;
	}>(request);
	if (read.kind === "invalid-json") {
		return json(400, { ok: false, error: "invalid_json" }, NO_STORE);
	}
	const body = read.kind === "ok" ? read.data : null;

	const postId = body?.postId?.trim();
	const pinned = body?.pinned;
	if (
		!postId ||
		!/^[a-z0-9][a-z0-9/_-]{0,180}$/i.test(postId) ||
		typeof pinned !== "boolean"
	) {
		return json(400, { ok: false, error: "invalid_payload" }, NO_STORE);
	}

	const absolute = await resolvePostFile(postId, body?.filePath);
	const relative = absolute
		? toPosix(path.relative(process.cwd(), absolute))
		: `src/content/posts/${postId}.md`;
	const editUrl = githubEditUrl(relative);

	const canWriteLocal = import.meta.env.DEV;

	// 非本地开发：这里是「禁止写」，与 owner/* 的「Git provider 未配置」区分
	if (!canWriteLocal) {
		return json(
			403,
			{
				ok: false,
				error: "prod_write_disabled",
				editUrl,
			},
			NO_STORE,
		);
	}

	if (!absolute) {
		return json(404, { ok: false, error: "file_not_found", editUrl }, NO_STORE);
	}

	try {
		const raw = await fs.readFile(absolute, "utf8");
		const next = setPinnedFrontmatter(raw, pinned);
		await fs.writeFile(absolute, next, "utf8");
		return json(200, { ok: true, pinned }, NO_STORE);
	} catch (error) {
		void error;
		return json(500, { ok: false, error: "write_failed", editUrl }, NO_STORE);
	}
};
