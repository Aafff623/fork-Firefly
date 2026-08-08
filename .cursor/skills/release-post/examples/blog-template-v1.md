# Example: blog / theme / template — first product release

Aligned with `Aafff623/fork-Firefly` style constraints: product SemVer from `1.0.0`, no upstream `6.x` inheritance, usually no Assets.

**Tag**: `v1.0.0`  
**Release title**: `v1.0.0 — Initial public release`

```markdown
## What's new

First public product release of this standalone Astro blog template (Firefly-based). Configuration-driven site features and an Agent-assisted publishing workflow.

### Added

- Configuration-driven site setup under `src/config` (site, nav, sidebar, comments, wallpaper)
- Local draftbox for posts: preview in `pnpm dev`, excluded from git remotes until publish
- Agent skills pipeline for Obsidian/Knowledge → post → site cascade (stats, tags, heatmap)
- Waline comments integration and related site wiring
- Seasonal sidebar “surprise gift” announcement interaction

### Changed

- Repository treated as a standalone product; product versioning starts at `1.0.0` (separate from upstream theme version numbers)

### Fixed

- Content URL helpers for draftbox slug routing in local preview

### Documentation

- Maintainer docs for agent workflow, draftbox, and delivery checklist

### Credits

- Built on the Firefly / Fuwari Astro blog theme lineage; thanks to upstream authors and contributors

**Full Changelog**: https://github.com/Aafff623/fork-Firefly/commits/v1.0.0

---

## 中文摘要

- 首次对外产品版本 `v1.0.0`（不继承上游主题 6.x 版本号）
- 配置驱动站点 + 本地草稿箱 + Agent 发文级联
- 无发行附件；以 Template / 源码使用为主

完整说明见上方英文 notes。
```

**Publish reminder**

1. Show this draft to the user and edit together.  
2. Run `gh release create` only after the user says **「发布」**.  
3. Before publish: confirm tag `v1.0.0`, branch target, and whether `package.json` version should also move to `1.0.0`.
