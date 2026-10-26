# 06: tag slug 坍缩防护

**What to build:** 标签 slug 规范化防坍缩：大小写/空格/连字符归一（如 "Hello World" 与 "hello-world" 归为一 slug），与现有 `src/config/tagAliases.ts` 别名机制互补（别名管同义不同名，本票管同名不同形）；新增标签时提示冲突。

**Blocked by:** None

**Status:** resolved（2026-10-26；归一函数 + 冲突合并 + 边界测试已上线；交互球/搜索按本轮边界未改组件）

- [x] slug 归一函数上线，标签页/标签球/搜索口径一致 — 新静态标签路由、`/tags/` 静态目录、每标签 RSS 统一走 `normalizeTagSlug`；交互球与 `/tags/` 搜索仍用原名 + `tagAliases`（本批不改 TagChalkSphere/搜索脚本），静态页用冲突组 canonical 名对齐
- [x] 与 tagAliases 兼容（不破坏现有别名）— 别名表未改；测试断言 21 个 key 归一后均非空且互不撞 slug
- [x] 归一边界用例测试（大小写/空格/unicode/连字符）— `scripts/test-tag-slug.mts`：20 条 normalize 用例 + 分组合并/计数/空标签/纯 emoji
- [x] `pnpm check && pnpm type-check` 绿 — 按本轮指示不用 pnpm，等价执行 `npx astro check` 与 `npx tsc --noEmit --isolatedDeclarations`

**参考**：`temp/reports/batch2/astro-paper-borrow.md` 第 10 条。低收益低风险，可与 04 合并实施。

## 实现记录（2026-10-26）

- `src/utils/tag-slug.ts`：`normalizeTagSlug` 走 NFKC → 小写 → 非字母/数字/组合符折成 `-` → 去首尾 `-`；`"Hello World"` / `"hello-world"` / `"HELLO_WORLD"` 均为 `hello-world`，全角 `ＡＩ　编程` 为 `ai-编程`，空标签/纯 emoji 为空串。
- `collectTagGroups`：按归一 slug 合并写法；文章数按 slug 去重（同篇同时写两种写法只算一次）；展示名取组内出现次数最多的原文，并列取字典序最小者。
- 冲突提示：构建期 `getStaticPaths` 对合并组 `console.warn`；静态页头部显示「同名写法已合并：…」。当前生产已发布标签无同 slug 冲突；草稿箱里的 `harness` 与已发布 `Harness` 是现成例子，dev（含草稿）会触发合并，生产构建不含草稿故 `/tags/harness/` 只显示 `Harness`。
- `tagAliases` 只读复用，不参与 slug 分组，避免把「同义不同名」误并入同一 URL。

## 验证

- `npx tsx scripts/test-tag-slug.mts`：通过；已追加到 `package.json` 的 `check:behavior`，整组 15 个行为测试全绿。
- `npx tsc --noEmit --isolatedDeclarations`：0 errors。
- `npx astro check`：0 errors / 0 warnings / 10 条既有 hints。

未验证 / 边界：

- 未改 `TagChalkSphere` 与 `/tags/` 内联搜索脚本，交互入口仍是原名 + 别名匹配；静态入口与交互入口的「同名不同形」合并口径不一致是已知边界。
