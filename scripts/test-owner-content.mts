import assert from "node:assert/strict";
import {
	contentSha256,
	normalizeOwnerSlug,
	validateOwnerPostSource,
} from "../src/lib/owner-content";

assert.equal(normalizeOwnerSlug("zcode-ade-guomo"), "zcode-ade-guomo");
assert.equal(normalizeOwnerSlug("../.env"), null);
assert.equal(normalizeOwnerSlug("post/../../secret"), null);

const valid = `---
title: 测试文章
published: 2026-08-21
description: 安全编辑测试
tags: [Test]
---

# 正文
`;
assert.deepEqual(validateOwnerPostSource(valid), { ok: true });
assert.equal(validateOwnerPostSource("# no frontmatter").ok, false);
assert.equal(validateOwnerPostSource("---\ntitle: x\n---\nbody").ok, false);
assert.equal(
	validateOwnerPostSource("---\ntitle: x\npublished: nope\n---\nbody").ok,
	false,
);
assert.equal(
	validateOwnerPostSource(
		"---\ntitle: x\npublished: 2026-08-21\ntags: [1]\n---\nbody",
	).ok,
	false,
);
assert.equal(
	await contentSha256(valid),
	await contentSha256(valid),
	"content hash must be stable",
);
assert.notEqual(
	await contentSha256(valid),
	await contentSha256(`${valid}\nnext`),
);

console.log("PASS owner content slug/frontmatter/hash gates");
