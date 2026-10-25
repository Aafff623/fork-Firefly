# Issue · 第二轮架构深化

Status: ready-for-agent

## 来源

2026-10-25 第二轮架构评审（`improve-codebase-architecture`）在上一轮 10-21 的五个候选之外，重新扫了设置、评论、生命周期、API、桌宠、内容工具六块，得到六个候选。上一轮已落地的 seam 复核结果：页面生命周期只做了一半；simple-toggles 只有一个消费者；评论图存储与检索纯核心落地；5 个行为测试本地全绿。

## 问题

六处摩擦共同造成三类后果：

1. **软导航后的静默失效**：27 处监听挂在 `swup:contentReplaced`，Swup 4.8.2 从不派发这个名字；只监听它的组件在第一次软导航后不再初始化。Profile 每次导航叠两套 boot 和旧计时链。
2. **同一知识多份实现**：设置键名/默认值/应用规则在 `setting-utils`、Layout 首屏脚本、面板三处平行；API 有 5 份限流、4 种响应信封；文章查询有 4 套遍历/打分/摘要；评论栈有 4 套生命周期。
3. **新增一处就要复制一套**：新设置项、新 API 端点、新评论通道、新列表消费方都得先读多个文件才知道顺序和边界，测试面也被大接口挡住。

## 证据（摘要）

- Swup 4.8.2 bundle 只派发 `swup:<hook>`（如 `swup:page:view`、`swup:content:replace`），无 `contentReplaced`；23 个文件、27 处监听。
- `setting-utils` 80 个导出 / 1817 行；Layout 内联脚本另有约 340 行首屏设置逻辑；`typeof localStorage` 守卫 41 次。
- 15 个 API 路由：5 份限流（配额、超限答法各不相同）、4 种响应信封、6 份手写 `json()`；坏 JSON 被当作缺参、限流被答成 200 空结果、502 body 可能带上游 401。
- 文章查询：`content-utils`、`post-search`、`ask-retrieve`、`allPostMeta` 四套；草稿过滤 8 处、effective time 2 份、日期格式 5 套、Markdown→纯文本 4 份。
- 评论：Giscus 自建 runtime、Waline 一个壳里三个启动器、Dynamic 用 React effect、贴纸建议 MutationObserver 无清理；`waline-boot` 对外 3 个导出、内部 1049 行。
- 桌宠：`SpritePet` 2593 行、18 个 props、7 个全局事件、5 个 DOM 选择器、2 个 storage key；rAF 常驻，5 个 timeout 未登记。

## 本轮决策（2026-10-25 园主确认）

- 设置：重开上一轮边界，做**全量设置登记表**（主题/壁纸/overlay/头像框/宠物都进）。
- API：限流超限统一**显式 429**（code + Retry-After），坏编码与缺参分开。
- ArticleIndex：**统一打分核心**，按 list/search/ask 模式给不同权重；口径同源，结果可不同。
- WIP：**只做干净文件**；`setting-utils`、`Layout`、`Profile`、`GlyphTitleEffects` 等在制品相关票保持 blocked。

## 边界

- 不改 Giscus/Waline 平台分工（ADR-0006），不换 Supabase Auth（ADR-0008），不改托管（ADR-0009）。
- 不做视觉改版、不做内容迁移、不 push、不碰其他 Agent 未提交的半成品。
- 票的最终状态与实现记录进 `.scratch/architecture-deepening-2/`；不放 `TODO.md`。
