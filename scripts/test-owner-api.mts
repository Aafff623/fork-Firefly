import assert from "node:assert/strict";

const baseUrl = process.env.OWNER_API_BASE_URL || "http://127.0.0.1:4323";
const start = await fetch(
	`${baseUrl}/api/auth/github/start/?returnTo=${encodeURIComponent("/owner/editor/?post=zcode-ade-guomo")}`,
	{ redirect: "manual" },
);
assert.equal(start.status, 302);
assert.equal(
	start.headers.get("location"),
	"/owner/editor/?post=zcode-ade-guomo",
);
const sessionCookie = start.headers
	.getSetCookie()
	.find((cookie) => cookie.startsWith("firefly_owner_session="))
	?.split(";", 1)[0];
assert.ok(
	sessionCookie,
	"DEV login must issue an HttpOnly owner session cookie",
);

const sessionResponse = await fetch(`${baseUrl}/api/auth/session/`, {
	headers: { cookie: sessionCookie },
});
const session = (await sessionResponse.json()) as {
	authenticated?: boolean;
	role?: string;
	viewer?: { id?: number; login?: string };
	csrf?: string;
	dev?: boolean;
};
assert.equal(session.authenticated, true);
assert.equal(session.role, "owner");
assert.equal(session.viewer?.id, 182515127);
assert.equal(session.viewer?.login, "Aafff623");
assert.equal(session.dev, true);
assert.ok(session.csrf);

const postResponse = await fetch(
	`${baseUrl}/api/owner/post/?slug=zcode-ade-guomo`,
	{ headers: { cookie: sessionCookie } },
);
const post = (await postResponse.json()) as {
	ok?: boolean;
	source?: string;
	baseSha?: string;
};
assert.equal(postResponse.status, 200);
assert.equal(post.ok, true);
assert.ok(post.source?.startsWith("---"));
assert.match(post.baseSha ?? "", /^[a-f0-9]{64}$/);

const crossSite = await fetch(`${baseUrl}/api/owner/post/`, {
	method: "PUT",
	headers: {
		"Content-Type": "application/json",
		cookie: sessionCookie,
		origin: "https://evil.example",
		"x-firefly-csrf": session.csrf ?? "",
	},
	body: JSON.stringify({
		slug: "zcode-ade-guomo",
		source: post.source,
		baseSha: post.baseSha,
	}),
});
assert.equal(crossSite.status, 403);

const conflict = await fetch(`${baseUrl}/api/owner/post/`, {
	method: "PUT",
	headers: {
		"Content-Type": "application/json",
		cookie: sessionCookie,
		origin: baseUrl,
		"x-firefly-csrf": session.csrf ?? "",
	},
	body: JSON.stringify({
		slug: "zcode-ade-guomo",
		source: post.source,
		baseSha: "0".repeat(64),
	}),
});
assert.equal(conflict.status, 409);

const svgForm = new FormData();
svgForm.set("slug", "zcode-ade-guomo");
svgForm.set(
	"image",
	new File(["<svg></svg>"], "attack.svg", { type: "image/svg+xml" }),
);
const svgUpload = await fetch(`${baseUrl}/api/owner/image/`, {
	method: "POST",
	headers: {
		cookie: sessionCookie,
		origin: baseUrl,
		"x-firefly-csrf": session.csrf ?? "",
	},
	body: svgForm,
});
assert.equal(svgUpload.status, 415);

const editorPage = await fetch(
	`${baseUrl}/owner/editor/?post=zcode-ade-guomo`,
	{ headers: { cookie: sessionCookie } },
);
assert.equal(editorPage.status, 200);
assert.match(await editorPage.text(), /园主编辑器|OWNER WORKBENCH/);

console.log("PASS owner API DEV login/read/CSRF/conflict/SVG/editor gates");
