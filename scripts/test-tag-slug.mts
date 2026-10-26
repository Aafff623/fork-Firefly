import assert from "node:assert/strict";
import { tagAliases } from "../src/config/tagAliases";
import { collectTagGroups, normalizeTagSlug } from "../src/utils/tag-slug";

type SlugCase = [input: string, expected: string];

const cases: SlugCase[] = [
	["Hello World", "hello-world"],
	["hello-world", "hello-world"],
	["HELLO_WORLD", "hello-world"],
	["  hello   world  ", "hello-world"],
	["Hello--World", "hello-world"],
	["hello___world", "hello-world"],
	["--Hello--World--", "hello-world"],
	["ＡＩ　编程", "ai-编程"],
	["Ｈｅｌｌｏ　Ｗｏｒｌｄ", "hello-world"],
	["AGENTS.md", "agents-md"],
	["Node.js", "node-js"],
	["C++", "c"],
	["中文 Tag", "中文-tag"],
	["标签／测试", "标签-测试"],
	["café", "café"],
	["cafe\u0301", "café"],
	["", ""],
	["   ", ""],
	["!!!", ""],
	["🔥", ""],
];

for (const [input, expected] of cases) {
	assert.equal(
		normalizeTagSlug(input),
		expected,
		`normalizeTagSlug(${JSON.stringify(input)}) 应为 ${JSON.stringify(expected)}`,
	);
}

assert.equal(
	normalizeTagSlug("Hello World"),
	normalizeTagSlug("hello-world"),
	"“Hello World” 与 “hello-world” 必须落到同一个 slug",
);

const groups = collectTagGroups(
	[
		{ name: "Hello World" },
		{ name: "hello-world" },
		{ name: "中文" },
		{ name: "NotUsed" },
	],
	[
		{ tags: ["Hello World", "中文"] },
		{ tags: ["hello-world", "中文"] },
		// 同一篇同时写两种写法：文章数只能算一次
		{ tags: ["HELLO WORLD", "Hello World"] },
	],
);

const hello = groups.find((group) => group.slug === "hello-world");
assert.ok(hello, "大小写/连字符写法应合并成一个 hello-world 分组");
assert.equal(
	hello.count,
	3,
	"hello-world 的文章数应为 3（同篇重复写法不重复计）",
);
assert.equal(hello.name, "Hello World", "展示名应取出现次数最多的原始写法");
assert.equal(hello.variants.length, 3, "三个原始写法都应保留在 variants 中");
for (const variant of ["HELLO WORLD", "Hello World", "hello-world"]) {
	assert.ok(hello.variants.includes(variant), `variants 应包含 ${variant}`);
}

const chinese = groups.find((group) => group.slug === "中文");
assert.ok(chinese, "Unicode 字母标签应保留自己的 slug");
assert.equal(chinese.count, 2);
assert.equal(chinese.name, "中文");

const unused = groups.find((group) => group.slug === "notused");
assert.ok(unused, "只在标签表出现、暂未挂文章的标签也应生成分组");
assert.equal(unused.count, 0);

assert.deepEqual(
	collectTagGroups([{ name: "!!!" }], [{ tags: ["", "   ", "🔥"] }]),
	[],
	"空标签与纯符号/emoji 标签不应生成静态路由",
);

const aliasSlugs = new Map<string, string>();
for (const key of Object.keys(tagAliases)) {
	const slug = normalizeTagSlug(key);
	assert.ok(slug, `tagAliases 的 key "${key}" 归一后不应为空`);
	assert.ok(
		!aliasSlugs.has(slug),
		`tagAliases 的 "${key}" 与 "${aliasSlugs.get(slug)}" 归一后撞车：${slug}`,
	);
	aliasSlugs.set(slug, key);
}

console.log("tag slug checks passed");
