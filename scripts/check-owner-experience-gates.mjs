import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) =>
	readFileSync(path.join(root, relativePath), "utf8");

const auth = read("src/lib/owner-auth.ts");
const start = read("src/pages/api/auth/github/start.ts");
const callback = read("src/pages/api/auth/github/callback.ts");
const session = read("src/pages/api/auth/session.ts");
const ownerPost = read("src/pages/api/owner/post.ts");
const pinApi = read("src/pages/api/admin/pin.ts");
const giscusConfig = read("src/config/commentConfig.ts");
const navbar = read("src/components/layout/Navbar.astro");

const gates = [
	["numeric GitHub owner id", auth.includes("OWNER_GITHUB_ID = 182515127")],
	[
		"DEV bypass requires opt-in and real loopback client",
		auth.includes('process.env.OWNER_DEV_BYPASS === "1"') &&
			auth.includes("isLoopbackAddress(clientAddress)"),
	],
	["HttpOnly signed cookie", auth.includes('"HttpOnly"')],
	[
		"OAuth state and PKCE",
		start.includes("code_challenge") && callback.includes("transaction.state"),
	],
	[
		"session responses are no-store",
		session.includes('"Cache-Control", "no-store"'),
	],
	[
		"production Git writes fail closed",
		ownerPost.includes("production_git_provider_unconfigured"),
	],
	[
		"Giscus native reactions remain enabled",
		giscusConfig.includes('reactionsEnabled: "1"'),
	],
	["owner account is mounted in navbar", navbar.includes("<OwnerAccount />")],
	[
		"legacy client admin auth is removed",
		!existsSync(path.join(root, "src/utils/admin-auth.ts")),
	],
	[
		"GitHub fallback edits target master",
		pinApi.includes('GITHUB_EDIT_BRANCH = "master"'),
	],
];

for (const [name, passed] of gates) {
	assert.equal(passed, true, `FAIL ${name}`);
	console.log(`PASS ${name}`);
}
