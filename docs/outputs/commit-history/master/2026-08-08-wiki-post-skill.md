# 2026-08-08 · wiki-post skill + GitHub Wiki handbook

## Summary

- 新增项目级 skill `wiki-post`（对齐 `release-post`：先起草，显式「推送 Wiki」才 publish）
- 调研 Oh My Zsh / FiraCode / VS Code Wiki 形态 + 对照本仓 `docs/official/`（出厂）与 `src/config`（本站）
- 工作区旁挂 `blog/fork-Firefly.wiki`，落地使用者手册多页（含 Official-Docs-Map 与 fork 差异功能页）

## Commits（建议粒度）

1. `docs(skills): add wiki-post for GitHub Wiki handbooks` — skill 正文 + AGENTS/CLAUDE 登记
2. Wiki 仓单独：`docs(wiki): add fork-Firefly user handbook pages`

## Notes

- 全局 / `.agents` / `blog/.cursor/skills` 为 junction，防漂移
- `.scratch/wiki-draft` 会话 staging 已清；Wiki SSOT 在 `fork-Firefly.wiki`
- 未停其他 agent 服务；未动无关 `dist/` 在制品
