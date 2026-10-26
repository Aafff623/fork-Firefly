import assert from "node:assert/strict";

/*
 * batch5-01：Memos 主干 API 契约回归。
 * 只穿过 fetchMemos 的公开接口；用假 fetch 验证路径、pageSize、CEL 过滤、分页与失败。
 */

type FetchCall = { url: string; init?: RequestInit };
const calls: FetchCall[] = [];
const originalFetch = globalThis.fetch;

function memo(overrides: Record<string, unknown> = {}) {
	return {
		name: "memos/1",
		state: "NORMAL",
		creator: "users/threetwoa",
		createTime: "2026-10-01T00:00:00Z",
		updateTime: "2026-10-01T00:00:00Z",
		content: "hello",
		visibility: "PUBLIC",
		pinned: false,
		attachments: [],
		...overrides,
	};
}

globalThis.fetch = (async (input: RequestInfo | URL) => {
	const url = String(input);
	calls.push({ url });
	const parsed = new URL(url);
	if (parsed.pathname !== "/api/memos") {
		return new Response("gone", { status: 410 });
	}
	const pageToken = parsed.searchParams.get("pageToken") ?? "";
	const payload =
		pageToken === ""
			? { memos: [memo(), memo({ name: "memos/2", state: "ARCHIVED" })], nextPageToken: "next" }
			: { memos: [memo({ name: "memos/3", content: "second page" })], nextPageToken: "" };
	return new Response(JSON.stringify(payload), {
		status: 200,
		headers: { "content-type": "application/json" },
	});
}) as typeof fetch;

const { fetchMemos } = await import("../src/utils/memos-adapter");
const entries = await fetchMemos("https://memos.example.com/", {
	parent: "users/threetwoa",
});

assert.equal(calls.length, 2, "paginates until nextPageToken is empty");
assert.ok(
	calls.every((call) => new URL(call.url).pathname === "/api/memos"),
	"uses the current /api/memos path",
);
assert.equal(
	new URL(calls[0].url).searchParams.get("pageSize"),
	"1000",
	"pageSize stays within the current API limit",
);
assert.equal(
	new URL(calls[0].url).searchParams.get("filter"),
	'creator == "users/threetwoa"',
	"translates legacy parent into CEL filter",
);
assert.equal(
	new URL(calls[0].url).searchParams.get("parent"),
	null,
	"does not send the removed parent parameter",
);
assert.deepEqual(
	entries.map((entry) => entry.id),
	["1", "3"],
	"filters non-NORMAL memos and keeps page order",
);

globalThis.fetch = (async () =>
	new Response("upstream down", { status: 503 })) as typeof fetch;
await assert.rejects(
	() => fetchMemos("https://down.example.com", { maxPages: 1 }),
	/Memos API error: 503/,
	"surfaces upstream failure to the caller",
);

globalThis.fetch = originalFetch;
console.log("PASS memos adapter (v2 path / pageSize / CEL filter / pagination / failure)");
