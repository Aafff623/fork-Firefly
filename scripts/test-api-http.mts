import assert from "node:assert/strict";
import {
	createRateLimiter,
	getClientAddress,
	json,
	rateLimited,
	readJson,
	upstreamError,
} from "../src/lib/api/http";

/* ---------- json: one content type, caller headers preserved ---------- */

const created = json(201, { hello: "世界" }, { "Cache-Control": "no-store" });
assert.equal(created.status, 201);
assert.equal(
	created.headers.get("content-type"),
	"application/json; charset=utf-8",
	"json() must always emit JSON with charset",
);
assert.equal(created.headers.get("cache-control"), "no-store");
assert.deepEqual(await created.json(), { hello: "世界" });

const forced = json(200, { ok: true }, { "Content-Type": "text/plain" });
assert.equal(
	forced.headers.get("content-type"),
	"application/json; charset=utf-8",
	"callers cannot downgrade the JSON content type",
);

/* ---------- readJson: ok / empty / invalid-json are distinct ---------- */

const parsed = await readJson(
	new Request("http://localhost/api", {
		method: "POST",
		body: JSON.stringify({ message: "hi" }),
	}),
);
assert.deepEqual(parsed, { kind: "ok", data: { message: "hi" } });

const blank = await readJson(
	new Request("http://localhost/api", { method: "POST", body: "  \n\t " }),
);
assert.deepEqual(
	blank,
	{ kind: "empty" },
	"whitespace body is empty, not invalid",
);

const missing = await readJson(
	new Request("http://localhost/api", { method: "POST" }),
);
assert.deepEqual(missing, { kind: "empty" }, "absent body is empty");

const broken = await readJson(
	new Request("http://localhost/api", { method: "POST", body: "{" }),
);
assert.deepEqual(
	broken,
	{ kind: "invalid-json" },
	"malformed JSON must not masquerade as a missing field",
);

const nullJson = await readJson(
	new Request("http://localhost/api", { method: "POST", body: "null" }),
);
assert.deepEqual(
	nullJson,
	{ kind: "ok", data: null },
	"null is legal JSON, routes decide what it means",
);

const tooLarge = await readJson(
	new Request("http://localhost/api", {
		method: "POST",
		body: JSON.stringify({ payload: "x".repeat(100) }),
	}),
	{ maxBytes: 20 },
);
assert.deepEqual(
	tooLarge,
	{ kind: "too-large" },
	"body over maxBytes is rejected without parsing",
);

const customLimit = await readJson(
	new Request("http://localhost/api", {
		method: "POST",
		body: JSON.stringify({ payload: "x".repeat(100) }),
	}),
	{ maxBytes: 1024 },
);
assert.equal(customLimit.kind, "ok", "custom maxBytes allows larger bodies");

/* ---------- limiter: window math, isolation, retry-after ---------- */

let now = 1_000_000;
const limiter = createRateLimiter({
	max: 2,
	windowMs: 1_000,
	keyPrefix: "test",
	now: () => now,
});

assert.deepEqual(limiter.check("a"), { allowed: true, retryAfterSeconds: 0 });
assert.deepEqual(limiter.check("a"), { allowed: true, retryAfterSeconds: 0 });

const blocked = limiter.check("a");
assert.equal(blocked.allowed, false);
assert.equal(
	blocked.retryAfterSeconds,
	1,
	"blocked call reports seconds until the oldest hit leaves the window",
);

assert.deepEqual(
	limiter.check("b"),
	{ allowed: true, retryAfterSeconds: 0 },
	"keys are isolated inside one limiter",
);

now += 999;
assert.equal(limiter.check("a").allowed, false, "window stays closed at 999ms");
now += 1;
assert.equal(
	limiter.check("a").allowed,
	true,
	"window slides open once the oldest hit expires",
);

const independent = createRateLimiter({
	max: 1,
	windowMs: 1_000,
	keyPrefix: "test",
	now: () => now,
});
assert.equal(
	independent.check("a").allowed,
	true,
	"separate limiter instances keep separate state",
);

let slowNow = 0;
const slow = createRateLimiter({
	max: 1,
	windowMs: 1_500,
	keyPrefix: "slow",
	now: () => slowNow,
});
assert.equal(slow.check("k").allowed, true);
slowNow = 100;
assert.equal(
	slow.check("k").retryAfterSeconds,
	2,
	"partial seconds round up so Retry-After never undershoots",
);

/* ---------- unified 429 contract ---------- */

const limited = rateLimited(3);
assert.equal(limited.status, 429);
assert.equal(limited.headers.get("retry-after"), "3");
assert.equal(
	limited.headers.get("content-type"),
	"application/json; charset=utf-8",
);
assert.deepEqual(await limited.json(), {
	error: "rate_limited",
	code: "rate_limited",
	message: "请求过于频繁，请稍后再试",
	retryAfter: 3,
});

/* ---------- unified 502 contract ---------- */

const upstream = upstreamError(401, "upstream rejected the token");
assert.equal(upstream.status, 502);
assert.equal(
	upstream.headers.get("content-type"),
	"application/json; charset=utf-8",
);
assert.deepEqual(await upstream.json(), {
	error: "upstream_error",
	upstreamStatus: 401,
	message: "upstream rejected the token",
});

/* ---------- client address: fixed precedence ---------- */

const allHeaders = new Request("http://localhost/api", {
	headers: {
		"cf-connecting-ip": " 1.1.1.1 ",
		"x-real-ip": "2.2.2.2",
		"x-forwarded-for": "3.3.3.3, 4.4.4.4",
	},
});
assert.equal(getClientAddress(allHeaders), "1.1.1.1", "cf-connecting-ip wins");

const realIp = new Request("http://localhost/api", {
	headers: {
		"x-real-ip": "2.2.2.2",
		"x-forwarded-for": "3.3.3.3, 4.4.4.4",
	},
});
assert.equal(
	getClientAddress(realIp),
	"2.2.2.2",
	"x-real-ip beats x-forwarded-for",
);

const forwarded = new Request("http://localhost/api", {
	headers: { "x-forwarded-for": " 3.3.3.3 , 4.4.4.4" },
});
assert.equal(
	getClientAddress(forwarded),
	"3.3.3.3",
	"x-forwarded-for uses the first hop and trims it",
);

const none = new Request("http://localhost/api");
assert.equal(getClientAddress(none), "unknown");

const blanks = new Request("http://localhost/api", {
	headers: {
		"cf-connecting-ip": "   ",
		"x-real-ip": "",
		"x-forwarded-for": " , ",
	},
});
assert.equal(
	getClientAddress(blanks),
	"unknown",
	"blank headers fall through instead of becoming an empty key",
);

console.log(
	"PASS api http (json / readJson / limiter window+retry-after / 429 / 502 / client address)",
);
