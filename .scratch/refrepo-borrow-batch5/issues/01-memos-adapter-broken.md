# 01: 修 memos-adapter 休眠缺陷（API v1 410）

**What to build:** 修复 adapter 与 Memos 主干 API 的断代：① 路径 `/api/v1/memos`→`/api/memos`；② pageSize 默认 10000 改 ≤1000（或分页拉取）；③ `parent` 参数新版已无，改 CEL `creator==` 过滤。验证用本地 Memos 新桩或 mock（记录验证方式）。**修完 `memos.enable` 仍默认 false——本票只除雷，不改变默认数据源。**

**Blocked by:** None

**Status:** resolved（2026-10-26；mock 验证，未接真实 Memos 实例）

- [x] 路径/pageSize/parent 三处修复
- [x] mock 验证：`/api/memos`、pageSize 1000、`filter=creator == "users/…"`、分页、非 NORMAL 过滤
- [x] 失败降级路径验证（adapter 抛错由 DynamicSidebar catch；修掉 finally 的 unhandled rejection）
- [ ] `memos.enable: true` 本地端到端跑通一次（无本地 Memos 实例，未做）
- [x] `npx tsc --noEmit --isolatedDeclarations` 绿

## Result

- `/api/v1/memos` → `/api/memos`；pageSize 10000 → 1000；parent 参数 → CEL `filter: creator == "users/…"`。
- 修复 `promise.finally` 未处理 rejection 的隐患；enable 仍保持默认 false。
- 新增 `scripts/test-memos-adapter.mts` 并接进 `check:behavior`。
- 端到端真实 Memos 未验证；需要实例/CORS 后再补。

**参考**：`temp/reports/batch5/memos-arch-perf.md` 第 1 条 + `memos-borrow.md`；已亲验：adapter:194 打 `/api/v1/memos`、Memos 主干 `testdata/http_compat.jsonl:41` 该路径 410 Gone、`proto/api/CHANGELOG.md` 确认移除、`dynamicConfig.memos.enable` 默认 false。上游 `temp/repos/memos/`。
