# 14: 配置域 JSON Schema 生成（编辑器/Agent 护栏）

**What to build:** 33 个配置域从 TS 类型生成 JSON Schema：① 生成脚本（types → JSON Schema，或手写同步+校验脚本防漂移）；② schema 落 `schemas/` 或 config 目录；③ VS Code 关联（yaml.schemas 或 json 模式映射）；④ 与批 1 票 12 的 frontmatter.json 护栏同一思路扩展到 config。若生成链路太重，降级为「手写 schema + 漂移检查脚本」。

**Blocked by:** None

**Status:** open

- [ ] schema 产出与配置域一一对应（或首批覆盖高频域）
- [ ] VS Code 改配置有补全/校验（验收方式）
- [ ] 漂移检查：schema 与 TS 类型不一致时 CI 或 check 报错
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch2/shirone-borrow.md` 第 2 条（对方 37 配置域 + 类型/schema 生成 + YAML 覆盖层；我们 33 域零 schema）+ `shirone-arch-perf.md`。上游做法见 `temp/repos/Shirone/`（重实现）。
