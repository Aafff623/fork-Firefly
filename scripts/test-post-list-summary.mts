import assert from "node:assert/strict";

type Summary = {
	description: string;
	words: number;
	minutes: number;
};

let getPostListSummary: ((body: string, description: string) => Summary) | undefined;
try {
	({ getPostListSummary } = await import("../src/utils/post-list-summary"));
} catch {
	// RED 阶段：实现还不存在时，下面的断言要明确报出缺少的能力。
}

assert.ok(
	getPostListSummary,
	"列表卡需要能从原始 Markdown 取得摘要、字数和阅读时长，而不渲染整篇文章",
);

const explicitDescription = getPostListSummary(
	"# 标题\n\nalpha beta gamma",
	"编辑填写的摘要",
);
assert.deepEqual(explicitDescription, {
	description: "编辑填写的摘要",
	words: 5,
	minutes: 1,
});

const fallbackDescription = getPostListSummary(
	"# 标题\n\n第一段含有 [链接文字](https://example.com) 和 ![示意图](diagram.png)。\n\n第二段不应成为摘要。",
	"",
);
assert.equal(fallbackDescription.description, "第一段含有 链接文字 和 示意图。");
assert.ok(fallbackDescription.words > 0);
assert.equal(fallbackDescription.minutes, 1);

console.log("post-list summary checks passed");
