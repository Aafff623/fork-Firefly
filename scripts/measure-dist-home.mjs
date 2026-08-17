/**
 * Measure homepage HTML / inline scripts / CSS / orphan linkage from a real dist.
 * Run twice; print stable integers.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const htmlPath = path.join(root, "dist/client/index.html");

if (!fs.existsSync(htmlPath)) {
	console.log("NO_DIST");
	process.exit(2);
}

const html = fs.readFileSync(htmlPath, "utf8");
const htmlBytes = Buffer.byteLength(html, "utf8");

const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
let inlineBytes = 0;
let inlineCount = 0;
let musicBlocking = 0;
let musicDeferred = 0;
for (const m of html.matchAll(scriptRe)) {
	const attrs = m[1] || "";
	const body = m[2] || "";
	const src = /src=["']([^"']+)["']/.exec(attrs);
	if (src) {
		if (/music-(manager|player)\.js/.test(src[1])) {
			if (/\bdefer\b|\basync\b|\btype=["']module["']/.test(attrs)) musicDeferred += 1;
			else musicBlocking += 1;
		}
		continue;
	}
	inlineCount += 1;
	inlineBytes += Buffer.byteLength(body, "utf8");
}

const cssHrefs = [...html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi)].map(
	(m) => {
		const href = /href=["']([^"']+)["']/.exec(m[0]);
		return href ? href[1] : "";
	},
);
let cssBytes = 0;
for (const href of cssHrefs) {
	if (!href.startsWith("/") && !href.startsWith("./")) continue;
	const rel = href.replace(/^\//, "");
	const p = path.join(root, "dist/client", rel);
	if (fs.existsSync(p)) cssBytes += fs.statSync(p).size;
}

function referenced(namePart) {
	const astro = path.join(root, "dist/client/_astro");
	if (!fs.existsSync(astro)) return { files: 0, htmlHits: 0 };
	const files = fs
		.readdirSync(astro)
		.filter((f) => f.toLowerCase().includes(namePart.toLowerCase()));
	let htmlHits = 0;
	for (const f of files) {
		if (html.includes(f)) htmlHits += 1;
	}
	return { files: files.length, htmlHits };
}

const ask = referenced("AskChat");
const live2d = referenced("Live2DWidget");
const askCss = referenced("ask.");

const out = {
	htmlBytes,
	inlineScriptBytes: inlineBytes,
	inlineScriptCount: inlineCount,
	cssBytes,
	musicBlocking,
	musicDeferred,
	askChatFiles: ask.files,
	askChatHtmlHits: ask.htmlHits,
	live2dFiles: live2d.files,
	live2dHtmlHits: live2d.htmlHits,
	askCssFiles: askCss.files,
	askCssHtmlHits: askCss.htmlHits,
};

process.stdout.write(`${JSON.stringify(out)}\n`);
