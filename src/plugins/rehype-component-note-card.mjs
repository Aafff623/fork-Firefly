/// <reference types="mdast" />
import { h } from "hastscript";
import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Creates a Note Card component.
 *
 * `::note{file="notes/xxx.md" title="可选" description="可选"}`
 * 构建时读取 `public/{file}` 下的 Markdown 笔记，生成 GitHub 风格引用卡片。
 * 点击卡片主体用客户端脚本弹窗预览；右侧按钮下载原始文件。
 *
 * @param {Object} properties - The properties of the component.
 * @param {string} properties.file - Path relative to public/ (e.g. "notes/xxx.md").
 * @param {string} [properties.title] - Override card title.
 * @param {string} [properties.description] - Override card description.
 * @param {import('mdast').RootContent[]} children - The children elements of the component.
 * @returns {import('mdast').Parent} The created Note Card component.
 */
export function NoteCardComponent(properties, children) {
	if (Array.isArray(children) && children.length !== 0) {
		return h("div", { class: "hidden" }, [
			'Invalid directive. ("note" directive must be leaf type `::note{file="..."}`)',
		]);
	}

	const file = properties.file;
	if (!file) {
		return h("div", { class: "hidden" }, [
			'Invalid directive. ("note" directive requires a "file" attribute)',
		]);
	}

	const publicRoot = resolve("public");
	const target = resolve("public", file);
	if (!target.startsWith(publicRoot)) {
		return h("div", { class: "hidden" }, ["::note file must be under public/"]);
	}

	let raw;
	try {
		raw = readFileSync(target, "utf-8");
	} catch {
		return h("div", { class: "hidden" }, [`::note file not found: ${file}`]);
	}

	const title = properties.title || extractTitle(raw);
	const description = properties.description || extractDescription(raw);
	const lines = raw.split(/\r?\n/).filter(Boolean).length;
	const words = raw.replace(/\s+/g, "").length;
	const sizeStr = formatBytes(statSync(target).size);
	const fileUrl = "/" + file.replace(/\\/g, "/");

	const titlebar = h(
		"div",
		{ class: "nc-titlebar" },
		[h("span", { class: "nc-badge" }, ["笔记"]), h("span", { class: "nc-title" }, [title])],
	);

	const children_ = [titlebar];
	if (description) {
		children_.push(h("div", { class: "nc-description" }, [description]));
	}
	children_.push(
		h("div", { class: "nc-infobar" }, [
			h("span", { class: "nc-meta" }, [sizeStr]),
			h("span", { class: "nc-meta" }, [`${lines} 行`]),
			h("span", { class: "nc-meta" }, [`${words} 字`]),
		]),
	);

	const main = h(
		"a",
		{
			class: "card-note-main no-styling",
			"data-note-preview": fileUrl,
			href: fileUrl,
			title: "点击预览",
		},
		children_,
	);

	const download = h(
		"a",
		{
			class: "card-note-download no-styling",
			href: fileUrl,
			download: "",
			title: "下载笔记",
		},
		["下载"],
	);

	return h("div", { class: "card-note" }, [main, download]);
}

function extractTitle(raw) {
	for (const line of raw.split(/\r?\n/)) {
		const m = line.match(/^#\s+(.+)/);
		if (m) return m[1].trim();
	}
	return "Markdown 笔记";
}

function extractDescription(raw) {
	for (const line of raw.split(/\r?\n/)) {
		const t = line.trim();
		if (!t || t.startsWith("#") || t.startsWith("```") || t.startsWith("---")) continue;
		return t.length > 100 ? t.slice(0, 100) + "…" : t;
	}
	return "";
}

function formatBytes(bytes) {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
