import { access, cp, readdir, rm } from "node:fs/promises";
import path from "node:path";

const source = path.resolve("dist/client/pagefind");

await access(source);

type SyncTarget = {
	label: string;
	staticRoot: string;
};

const targets: SyncTarget[] = [];

if (process.env.EDGEONE) {
	targets.push({
		label: "EdgeOne",
		staticRoot: path.resolve(".edgeone/assets"),
	});
} else {
	targets.push({
		label: "Vercel",
		staticRoot: path.resolve(".vercel/output/static"),
	});
}

let synced = 0;

for (const { label, staticRoot } of targets) {
	try {
		await access(staticRoot);
	} catch {
		console.log(
			`[pagefind] ${label} static output not found (${staticRoot}); skipping.`,
		);
		continue;
	}

	const target = path.join(staticRoot, "pagefind");
	await rm(target, { recursive: true, force: true });
	await cp(source, target, { recursive: true });

	const files = await readdir(target);
	if (!files.includes("pagefind.js")) {
		throw new Error(
			`[pagefind] Synced ${label} output is missing pagefind.js`,
		);
	}

	console.log(
		`[pagefind] Synced ${files.length} files to ${path.relative(process.cwd(), target)}.`,
	);
	synced += 1;
}

if (synced === 0) {
	console.log("[pagefind] No adapter static output found; skipping output sync.");
}
