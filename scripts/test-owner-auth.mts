import assert from "node:assert/strict";
import {
	canUseOwnerDevBypass,
	createOAuthTransaction,
	createOwnerSession,
	isAllowedOwnerPath,
	OWNER_GITHUB_ID,
	validateMutationRequest,
	verifyOAuthTransaction,
	verifyOwnerSession,
} from "../src/lib/owner-auth";

const secret = "test-only-secret-with-at-least-thirty-two-bytes";
const now = Date.UTC(2026, 7, 21, 0, 0, 0);

const previousDevBypass = process.env.OWNER_DEV_BYPASS;
process.env.OWNER_DEV_BYPASS = "1";
const loopbackRequest = new Request("http://127.0.0.1:4323/");
assert.equal(canUseOwnerDevBypass(loopbackRequest, true, "127.0.0.1"), true);
assert.equal(canUseOwnerDevBypass(loopbackRequest, false, "127.0.0.1"), false);
assert.equal(
	canUseOwnerDevBypass(loopbackRequest, true, "192.168.1.20"),
	false,
);
if (previousDevBypass === undefined) delete process.env.OWNER_DEV_BYPASS;
else process.env.OWNER_DEV_BYPASS = previousDevBypass;

const ownerToken = await createOwnerSession(
	{
		id: OWNER_GITHUB_ID,
		login: "Aafff623",
		avatarUrl: "https://avatars.githubusercontent.com/u/182515127?v=4",
	},
	secret,
	now,
);
const owner = await verifyOwnerSession(ownerToken, secret, now + 1_000);
assert.equal(owner?.role, "owner");
assert.equal(owner?.githubId, OWNER_GITHUB_ID);
assert.ok(owner?.csrf && owner.csrf.length >= 24);

const normalToken = await createOwnerSession(
	{ id: 42, login: "reader", avatarUrl: "" },
	secret,
	now,
);
assert.equal(
	(await verifyOwnerSession(normalToken, secret, now + 1_000))?.role,
	"user",
);
assert.equal(
	await verifyOwnerSession(`${ownerToken}tampered`, secret, now),
	null,
);
assert.equal(
	await verifyOwnerSession(ownerToken, secret, now + 8 * 60 * 60 * 1000),
	null,
);

const transaction = await createOAuthTransaction(
	{ returnTo: "/owner/editor/?post=zcode-ade-guomo" },
	secret,
	now,
);
const verifiedTransaction = await verifyOAuthTransaction(
	transaction.cookieValue,
	secret,
	now + 30_000,
);
assert.equal(verifiedTransaction?.state, transaction.state);
assert.equal(verifiedTransaction?.verifier, transaction.verifier);
assert.equal(
	verifiedTransaction?.returnTo,
	"/owner/editor/?post=zcode-ade-guomo",
);

assert.equal(isAllowedOwnerPath("zcode-ade-guomo/index.md"), true);
assert.equal(isAllowedOwnerPath("../.env"), false);
assert.equal(isAllowedOwnerPath("zcode-ade-guomo/payload.svg"), false);

const mutation = new Request("https://blog.example/api/admin/pin/", {
	method: "POST",
	headers: {
		cookie: `firefly_owner_session=${ownerToken}`,
		origin: "https://blog.example",
		"x-firefly-csrf": owner?.csrf ?? "",
	},
});
assert.equal(
	(await validateMutationRequest(mutation, secret, now + 1_000)).ok,
	true,
);

const crossSite = new Request("https://blog.example/api/admin/pin/", {
	method: "POST",
	headers: {
		cookie: `firefly_owner_session=${ownerToken}`,
		origin: "https://evil.example",
		"x-firefly-csrf": owner?.csrf ?? "",
	},
});
assert.deepEqual(
	await validateMutationRequest(crossSite, secret, now + 1_000),
	{
		ok: false,
		status: 403,
		error: "origin_mismatch",
	},
);

console.log("PASS owner auth state/session/CSRF/path gates");
