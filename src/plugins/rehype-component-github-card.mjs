/// <reference types="mdast" />
import fs from "node:fs";
import { h } from "hastscript";

/**
 * GitHub 卡片（::github{repo="owner/repo"}）
 *
 * 构建期优先渲染 scripts/generate-github-card-data.ts 生成的静态数据
 * （description / language / avatar / license），所以无 JS、爬虫、分享截图都能看到真实仓库信息。
 * stars / forks 是易变数据，构建期不落盘：由卡片内联的管理器在浏览器请求一次，
 * 写 localStorage（24h TTL），inflight 去重 + Swup 切页只补新卡片，失败就保留静态值。
 *
 * 管理器脚本每页只输出一次（按 vfile 标记），避免同一篇文章多张卡片重复内联。
 */
const STATIC_DATA_FILE = new URL(
	"../constants/github-card-data.json",
	import.meta.url,
);
const REPOSITORY_PATTERN = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;

/** 构建期静态数据；文件缺失或损坏时退化为空表，卡片显示兜底文案 */
function loadStaticData() {
	try {
		const parsed = JSON.parse(fs.readFileSync(STATIC_DATA_FILE, "utf8"));
		return parsed && typeof parsed === "object" ? parsed : {};
	} catch {
		return {};
	}
}

const staticData = loadStaticData();

/**
 * 每页只发一次的管理器脚本。SwupScriptsPlugin 会在每次 content:replace 后重跑内联脚本，
 * 所以逻辑必须幂等：管理器挂在 window 上，重复执行只触发一次增量刷新。
 */
const CARD_MANAGER_SCRIPT = `
(function () {
	var NS = "__ffGithubCards";
	var STORE_PREFIX = "ff-github-card:";
	var TTL = 24 * 60 * 60 * 1000;
	var TIMEOUT = 5000;
	var inflight = Object.create(null);
	var done = Object.create(null);

	function formatCount(value) {
		if (typeof value !== "number" || !isFinite(value)) return "\\u2014";
		try {
			return new Intl.NumberFormat("en-us", {
				notation: "compact",
				maximumFractionDigits: 1
			})
				.format(value)
				.replace(/[\\u202f\\u00a0 ]/g, "");
		} catch (error) {
			return String(value);
		}
	}

	function readCache(key) {
		try {
			var raw = window.localStorage.getItem(STORE_PREFIX + key);
			if (!raw) return null;
			var entry = JSON.parse(raw);
			if (!entry || typeof entry.fetchedAt !== "number") return null;
			if (Date.now() - entry.fetchedAt >= TTL) return null;
			var data = entry.data;
			if (!data || typeof data.stars !== "number" || typeof data.forks !== "number") {
				return null;
			}
			return data;
		} catch (error) {
			return null;
		}
	}

	function writeCache(key, data) {
		try {
			window.localStorage.setItem(
				STORE_PREFIX + key,
				JSON.stringify({ fetchedAt: Date.now(), data: data })
			);
		} catch (error) {
			// 隐私模式 / 配额不足：静默跳过，不影响卡片
		}
	}

	function fetchRepo(repo) {
		var controller =
			typeof window.AbortController === "function" ? new window.AbortController() : null;
		var timer = controller ? window.setTimeout(function () { controller.abort(); }, TIMEOUT) : 0;
		var url =
			"https://api.github.com/repos/" +
			repo.split("/").map(encodeURIComponent).join("/");

		return window
			.fetch(url, {
				referrerPolicy: "no-referrer",
				signal: controller ? controller.signal : undefined,
				headers: { Accept: "application/vnd.github+json" }
			})
			.then(function (response) {
				if (!response.ok) throw new Error("GitHub API returned " + response.status);
				return response.json();
			})
			.then(
				function (data) {
					if (timer) window.clearTimeout(timer);
					var description =
						typeof data.description === "string"
							? data.description.replace(/:[a-zA-Z0-9_]+:/g, "").trim()
							: "";
					return {
						description: description || null,
						language: typeof data.language === "string" ? data.language : null,
						stars: typeof data.stargazers_count === "number" ? data.stargazers_count : null,
						forks: typeof data.forks === "number" ? data.forks : null,
						avatarUrl:
							data.owner && typeof data.owner.avatar_url === "string"
								? data.owner.avatar_url
								: null,
						license:
							data.license && typeof data.license.spdx_id === "string"
								? data.license.spdx_id
								: null
					};
				},
				function (error) {
					if (timer) window.clearTimeout(timer);
					throw error;
				}
			);
	}

	function applyData(card, data) {
		function setText(selector, value) {
			var el = card.querySelector(selector);
			if (el && value) el.textContent = value;
		}

		if (typeof data.stars === "number") setText(".gc-stars", formatCount(data.stars));
		if (typeof data.forks === "number") setText(".gc-forks", formatCount(data.forks));
		if (data.description) setText(".gc-description", data.description);
		if (data.language) setText(".gc-language", data.language);
		if (data.license) setText(".gc-license", data.license);

		if (data.avatarUrl) {
			var avatar = card.querySelector(".gc-avatar");
			if (avatar) {
				avatar.style.backgroundImage =
					'url("' + data.avatarUrl + (data.avatarUrl.indexOf("?") === -1 ? "?s=32" : "&s=32") + '")';
				avatar.style.backgroundColor = "transparent";
			}
		}

		card.classList.remove("fetch-waiting", "fetch-error");
	}

	function enhanceCard(card) {
		var repo = card.getAttribute("repo");
		if (!repo) return;
		var key = repo.toLowerCase();

		var cached = readCache(key);
		if (cached) {
			applyData(card, cached);
			return;
		}
		// 本会话已经请求过（成功或失败）就不再发，失败场景保留构建期静态值
		if (done[key]) return;

		var promise = inflight[key];
		if (!promise) {
			promise = fetchRepo(repo)
				.then(
					function (data) {
						writeCache(key, data);
						return data;
					},
					function (error) {
						console.warn("[GITHUB-CARD] Failed to load", repo, error);
						return null;
					}
				)
				.then(function (data) {
					delete inflight[key];
					done[key] = true;
					return data;
				});
			inflight[key] = promise;
		}

		promise.then(function (data) {
			if (data) applyData(card, data);
		});
	}

	function enhanceAll() {
		var cards = document.querySelectorAll("a.card-github[repo]");
		for (var i = 0; i < cards.length; i++) enhanceCard(cards[i]);
	}

	function refresh() {
		if (typeof window.requestAnimationFrame === "function") {
			window.requestAnimationFrame(enhanceAll);
		} else {
			enhanceAll();
		}
	}

	function init() {
		document.addEventListener("astro:page-load", refresh);
		document.addEventListener("swup:content:replace", refresh);
		document.addEventListener("password:decrypted", refresh);
		refresh();
	}

	var manager = window[NS];
	if (manager) {
		manager.refresh();
	} else {
		window[NS] = { refresh: refresh };
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", init);
		} else {
			init();
		}
	}
})();
`;

/**
 * 当前页面是否还需要输出管理器脚本（同一 vfile 只发一次）
 *
 * @param {{ vfile?: { data?: Record<string, unknown> } }} context - rehype-components 传入的上下文
 * @returns {boolean} 本张卡片是否需要携带脚本
 */
function shouldEmitManager(context) {
	const vfile = context?.vfile;
	if (!vfile || typeof vfile !== "object") return true;
	if (!vfile.data || typeof vfile.data !== "object") vfile.data = {};
	if (vfile.data.githubCardManagerEmitted) return false;
	vfile.data.githubCardManagerEmitted = true;
	return true;
}

/**
 * Creates a GitHub Card component.
 *
 * @param {Object} properties - The properties of the component.
 * @param {string} properties.repo - The GitHub repository in the format "owner/repo".
 * @param {import('mdast').RootContent[]} children - The children elements of the component.
 * @param {Object} [context] - rehype-components context ({ tree, vfile, processor }).
 * @returns {import('mdast').Parent} The created GitHub Card component.
 */
export function GithubCardComponent(properties, children, context) {
	if (Array.isArray(children) && children.length !== 0)
		return h("div", { class: "hidden" }, [
			'Invalid directive. ("github" directive must be leaf type "::github{repo="owner/repo"}")',
		]);

	if (
		typeof properties.repo !== "string" ||
		!REPOSITORY_PATTERN.test(properties.repo)
	)
		return h(
			"div",
			{ class: "hidden" },
			'Invalid repository. ("repo" attributte must be in the format "owner/repo")',
		);

	const repo = properties.repo;
	const cardUuid = `GC${Math.random().toString(36).slice(-6)}`; // Collisions are not important
	const data = staticData[repo.toLowerCase()] ?? null;
	const hasData = data !== null;

	const avatarUrl = data?.avatarUrl
		? `${data.avatarUrl}${data.avatarUrl.includes("?") ? "&" : "?"}s=32`
		: null;

	const nAvatar = h(`div#${cardUuid}-avatar`, {
		class: "gc-avatar",
		style: avatarUrl
			? `background-image: url("${avatarUrl}"); background-color: transparent;`
			: undefined,
	});
	const nLanguage = h(
		`span#${cardUuid}-language`,
		{ class: "gc-language" },
		data?.language ?? "Unavailable",
	);

	const nTitle = h("div", { class: "gc-titlebar" }, [
		h("div", { class: "gc-titlebar-left" }, [
			h("div", { class: "gc-owner" }, [
				nAvatar,
				h("div", { class: "gc-user" }, repo.split("/")[0]),
			]),
			h("div", { class: "gc-divider" }, "/"),
			h("div", { class: "gc-repo" }, repo.split("/")[1]),
		]),
		h("div", { class: "github-logo" }),
	]);

	const nDescription = h(
		`div#${cardUuid}-description`,
		{ class: "gc-description" },
		hasData
			? data.description || "Description not set"
			: "Repository details unavailable",
	);

	// stars / forks 构建期不缓存（会变），无 JS 时显示占位符，由运行时管理器补
	const nStars = h(`div#${cardUuid}-stars`, { class: "gc-stars" }, "\u2014");
	const nForks = h(`div#${cardUuid}-forks`, { class: "gc-forks" }, "\u2014");
	const nLicense = h(
		`div#${cardUuid}-license`,
		{ class: "gc-license" },
		hasData ? data.license || "no-license" : "\u2014",
	);

	const cardChildren = [
		nTitle,
		nDescription,
		h("div", { class: "gc-infobar" }, [nStars, nForks, nLicense, nLanguage]),
	];
	if (shouldEmitManager(context)) {
		cardChildren.push(
			h("script", { type: "text/javascript" }, CARD_MANAGER_SCRIPT),
		);
	}

	return h(
		`a#${cardUuid}-card`,
		{
			class: hasData
				? "card-github no-styling"
				: "card-github fetch-error no-styling",
			href: `https://github.com/${repo}`,
			target: "_blank",
			repo,
		},
		cardChildren,
	);
}
