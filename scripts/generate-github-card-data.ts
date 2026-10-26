/**
 * GitHub 卡构建期静态数据
 *
 * 扫描内容里的 `::github{repo="owner/repo"}` 指令，向 api.github.com 取
 * description / language / avatar / license，写入 src/constants/github-card-data.json，
 * 供 src/plugins/rehype-component-github-card.mjs 在构建期直接渲染（无 JS 也能看到真实信息）。
 *
 * 约定：
 * - GITHUB_TOKEN 只从环境变量读，不写进代码、不写进 JSON；没有 token 走公开 API（60 次/小时/IP）。
 * - 单请求 5s 超时；任一仓库失败（网络 / 404 / 限流）就保留 JSON 里的旧值，绝不阻断构建。
 * - 产物 JSON 入库：CI 没有 token 或被限流时，构建仍有上一份数据兜底。
 * - 排除 src/content/posts/_draftbox（本地草稿不入库，派生数据也不把草稿仓库名带进仓库）。
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_DIR = path.join(ROOT, "src", "content");
const EXCLUDED_DIR = path.join(CONTENT_DIR, "posts", "_draftbox");
const OUTPUT_FILE = path.join(
	ROOT,
	"src",
	"constants",
	"github-card-data.json",
);
const REPOSITORY_PATTERN = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;
const DIRECTIVE_PATTERN =
	/::github\s*\{[^}]*\brepo\s*=\s*["']([^"']+)["'][^}]*\}/g;
const REQUEST_TIMEOUT_MS = 5000;
const UNAUTHENTICATED_RATE_LIMIT = 60;

interface GithubCardData {
	description: string | null;
	language: string | null;
	avatarUrl: string | null;
	license: string | null;
}

type GithubCardCache = Record<string, GithubCardData>;

interface GithubApiRepo {
	description?: string | null;
	language?: string | null;
	forks?: number;
	stargazers_count?: number;
	owner?: { avatar_url?: string | null } | null;
	license?: { spdx_id?: string | null } | null;
}

async function listMarkdownFiles(dir: string): Promise<string[]> {
	const entries = await fs.readdir(dir, { withFileTypes: true });
	const files: string[] = [];
	for (const entry of entries) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			if (full === EXCLUDED_DIR) continue;
			files.push(...(await listMarkdownFiles(full)));
		} else if (/\.mdx?$/.test(entry.name)) {
			files.push(full);
		}
	}
	return files;
}

async function findRepositories(
	files: string[],
): Promise<{ repositories: Map<string, string>; directives: number }> {
	const repositories = new Map<string, string>();
	let directives = 0;

	for (const file of files) {
		const source = await fs.readFile(file, "utf-8");
		for (const match of source.matchAll(DIRECTIVE_PATTERN)) {
			directives++;
			const repo = match[1];
			if (REPOSITORY_PATTERN.test(repo)) {
				repositories.set(repo.toLowerCase(), repo);
			} else {
				console.warn(`[GITHUB-CARD] Skip invalid repo "${repo}" in ${file}`);
			}
		}
	}

	return { repositories, directives };
}

async function readCache(): Promise<GithubCardCache> {
	try {
		const parsed = JSON.parse(await fs.readFile(OUTPUT_FILE, "utf-8"));
		return parsed && typeof parsed === "object" ? parsed : {};
	} catch {
		return {};
	}
}

interface FetchResult {
	data: GithubCardData;
	rateLimitRemaining: number | null;
}

async function fetchRepositoryData(repo: string): Promise<FetchResult> {
	const [owner, name] = repo.split("/");
	const headers: Record<string, string> = {
		Accept: "application/vnd.github+json",
		"X-GitHub-Api-Version": "2022-11-28",
	};
	// token 只在本进程内拼请求头，不落盘、不写日志
	const token = process.env.GITHUB_TOKEN?.trim();
	if (token) headers.Authorization = `Bearer ${token}`;

	const response = await fetch(
		`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`,
		{ headers, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) },
	);

	const remainingHeader = response.headers.get("x-ratelimit-remaining");
	const rateLimitRemaining =
		remainingHeader === null ? null : Number.parseInt(remainingHeader, 10);

	if (!response.ok) {
		const error = new Error(
			`GitHub API returned ${response.status}${response.statusText ? ` ${response.statusText}` : ""}`,
		) as Error & { rateLimitRemaining?: number | null };
		error.rateLimitRemaining = rateLimitRemaining;
		throw error;
	}

	const data = (await response.json()) as GithubApiRepo;
	const description =
		typeof data.description === "string"
			? data.description.replace(/:[a-zA-Z0-9_]+:/g, "").trim()
			: "";

	return {
		rateLimitRemaining,
		data: {
			description: description || null,
			language: typeof data.language === "string" ? data.language : null,
			avatarUrl:
				typeof data.owner?.avatar_url === "string"
					? data.owner.avatar_url
					: null,
			license:
				typeof data.license?.spdx_id === "string" ? data.license.spdx_id : null,
		},
	};
}

async function main(): Promise<void> {
	const existingCache = await readCache();
	const files = await listMarkdownFiles(CONTENT_DIR);
	const { repositories, directives } = await findRepositories(files);
	const usingToken = Boolean(process.env.GITHUB_TOKEN?.trim());
	const nextCache: GithubCardCache = {};
	let refreshed = 0;
	let kept = 0;
	let rateLimited = false;

	console.log(
		`[GITHUB-CARD] ${directives} directive(s) in ${files.length} markdown file(s), ${repositories.size} unique repo(s).`,
	);
	console.log(
		`[GITHUB-CARD] Auth: ${
			usingToken
				? "GITHUB_TOKEN"
				: `none (public API, ${UNAUTHENTICATED_RATE_LIMIT} requests/hour per IP)`
		}`,
	);

	for (const [cacheKey, repo] of repositories) {
		if (rateLimited) {
			if (existingCache[cacheKey]) {
				nextCache[cacheKey] = existingCache[cacheKey];
				kept++;
			}
			continue;
		}

		try {
			const result = await fetchRepositoryData(repo);
			nextCache[cacheKey] = result.data;
			refreshed++;
			if (result.rateLimitRemaining === 0) {
				rateLimited = true;
				console.warn(
					"[GITHUB-CARD] Hit the GitHub rate limit; remaining repos keep their cached data.",
				);
			}
		} catch (error) {
			const remaining = (error as { rateLimitRemaining?: number | null })
				?.rateLimitRemaining;
			if (remaining === 0) rateLimited = true;

			if (existingCache[cacheKey]) {
				nextCache[cacheKey] = existingCache[cacheKey];
				kept++;
				console.warn(
					`[GITHUB-CARD] Failed to refresh ${repo}; keeping cached data. ${(error as Error).message}`,
				);
			} else {
				console.warn(
					`[GITHUB-CARD] Failed to load ${repo}; the card will show its static fallback. ${(error as Error).message}`,
				);
			}
		}
	}

	const sortedCache = Object.fromEntries(
		Object.entries(nextCache).sort(([a], [b]) => a.localeCompare(b)),
	);
	await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
	await fs.writeFile(
		OUTPUT_FILE,
		`${JSON.stringify(sortedCache, null, "\t")}\n`,
	);

	console.log(
		`[GITHUB-CARD] Wrote ${Object.keys(sortedCache).length} repo(s) to ${path.relative(ROOT, OUTPUT_FILE)} (${refreshed} refreshed, ${kept} kept from cache).`,
	);
}

main().catch((error) => {
	// 生成失败不能挡住构建：卡片会退回静态兜底状态
	console.error(
		"[GITHUB-CARD] Unexpected failure; existing JSON left untouched.",
		error,
	);
});
