import { access, cp, readdir, rm } from "node:fs/promises";
import path from "node:path";

const source = path.resolve("dist/client/pagefind");
const vercelStatic = path.resolve(".vercel/output/static");
const target = path.join(vercelStatic, "pagefind");

await access(source);

try {
	await access(vercelStatic);
} catch {
	console.log("[pagefind] Vercel static output not found; skipping output sync.");
	process.exit(0);
}

await rm(target, { recursive: true, force: true });
await cp(source, target, { recursive: true });

const files = await readdir(target);
if (!files.includes("pagefind.js")) {
	throw new Error("[pagefind] Synced output is missing pagefind.js");
}

console.log(`[pagefind] Synced ${files.length} files to .vercel/output/static/pagefind.`);
