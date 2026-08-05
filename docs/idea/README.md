# docs/idea/

本目录是博客的 **灵感库**：收录样式 / 组件 / 视觉语言构想，供后续 session 提取后走调研 → PRD → 落地闭环。

**只存构想，不写实现代码。**

## 目录约定

```text
docs/idea/{theme}/
  └── *.md          # 该主题下的构想正文（可多篇）
```

| 项 | 规则 |
|---|---|
| `{theme}` | kebab-case，与后续 `docs/outputs/{report,prd,handoff}/{theme}/` 对齐 |
| 建夹时机 | **有构想再建模**，禁止空 theme 目录 |
| 文件名 | 可读短名即可，如 `mood.md` · `component-sketch.md` · `2026-08-02-notes.md` |
| 附件 | 截图 / 参考图可放同目录 `assets/`（有再加） |

## 与任务流的关系

```text
docs/idea/{theme}/          # 灵感沉淀（本目录）
  → 新 session 提取
  → docs/outputs/report/{theme}/   # 调研（可选）
  → docs/outputs/prd/{theme}/prd.md
  → handoff → 实施 → Review → commit-history
```

灵感阶段不触发 PRD 门禁；一旦开调研 / 写 PRD，仍遵守 `docs/agents/workflow.md`。

## 单篇构想建议结构

不必死板，够下一任 Agent 接手即可：

```markdown
# {一句话标题}

## 灵感来源
- 对话摘要 / 参考站 / 截图路径

## 想要的感觉
- 气质、交互、与现站的关系（对齐 / 故意冲突）

## 可能落点
- 页面 / 组件 / 配置键（猜即可，调研时再核）

## 开放问题
- 还没想清楚的点
```

## 索引

| theme | 说明 | 状态 |
|---|---|---|
| `hallmark-gsap-ui` | Hallmark×GSAP（+MiniMax）组件动效编排 skill 构想 | step-1 分析完成 |
| `calendar-cover` | 侧栏日历封面 GIF：像素/软绘人物 · idle 闭环 · 轮询 | 已认可截图 + mood 沉淀（2026-08-03） |
| `zhuzhiliao-toy` | 竹知了玩具模拟器 → 角落互动彩蛋（画圈甩动 + 真实竹叫采样） | step-1 + clone 补记（2026-08-04） |
| `interface-lab` | Interface Lab：视频懒播 · 折纸信封 Motion · 橱窗注册表；Desktop-only 作反模式 | step-1 分析完成（2026-08-04） |
| `codex-pet-deepseek` | 双桌宠：浏览 Maid（v2）/ 文章 OpenPet（8×9）；PRD 已落地 | step-3 shipped（2026-08-04） |
| `comment-sticker-suggest` | 评论梗图联想（架构 / 调研） | 已有 architecture · research-index |
| `pixtale-gallery` | Pixtale（Next 瀑布相册）→ 产品壳与密度参考 | step-1（2026-08-05） |
| `pinterest-masonry` | Pinterest 式瀑布 + Grok 轮子消化；对齐本站 Astro 栈 | step-1（2026-08-05） |

探针类（`temp/_cdn_probe` · `_page.html` · `_probe.bin`）不建 theme。  
桌宠：产品已在 `public/pets/`；`temp/maid-deepseek-whale*` / `openpet-ai-girls*` 仅作可选对照源（可删）。
