/**
 * 从 awesome-codex-pet 拉取首批可选桌宠到 public/pets/。
 * 用法：node scripts/fetch-codex-pets.mjs
 * 不调用 Codex install.sh（那是 ~/.codex/pets，与博客无关）。
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const petsRoot = path.resolve(__dirname, "../public/pets");
const rawBase =
	"https://raw.githubusercontent.com/legeling/awesome-codex-pet/main/pets";

/** 首批可选皮 slug（与 PRD / builtinPets 对齐） */
const SLUGS = [
	"diandian--lllucasxu",
	"claude--xiangking",
	"elaina--nyakku-shigure",
	"gpt-muse--opask",
	"gojo--lilokhalikfa",
];

async function fetchOne(slug) {
	const dir = path.join(petsRoot, slug);
	await mkdir(dir, { recursive: true });
	for (const file of ["pet.json", "spritesheet.webp"]) {
		const url = `${rawBase}/${slug}/${file}`;
		const res = await fetch(url);
		if (!res.ok) {
			throw new Error(`${url} → ${res.status}`);
		}
		const buf = Buffer.from(await res.arrayBuffer());
		await writeFile(path.join(dir, file), buf);
		console.log(`  ${slug}/${file} (${buf.length} bytes)`);
	}
}

async function main() {
	console.log(`→ ${petsRoot}`);
	for (const slug of SLUGS) {
		console.log(`Fetching ${slug} ...`);
		await fetchOne(slug);
	}
	console.log("done");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
