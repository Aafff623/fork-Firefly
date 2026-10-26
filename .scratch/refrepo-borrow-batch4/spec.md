# 参考仓库借鉴第四批 · Spec

## Problem Statement

第四批调研（quartz + vitepress，报告在 `temp/reports/batch4/`）定位出 18 项增量。核心矛盾：站点自称「数字花园」但缺数字花园的基础设施（链接关系数据与消费它的反链/图谱/嵌入），以及一批文章/文档体系小缺口（outline 接线、搜索键盘导航、每页开关、片段包含）。VitePress 侧同时得出「不建 /docs 子站」的明确结论。

## Solution

18 项，两组推进，J1 为枢纽：

1. **数字花园组（01–11）**：01 链接图谱数据底座（枢纽）→ 02 反链面板 / 03 关系图谱 / 05 悬浮预览 / 09 Explorer 树（均依赖或半依赖 01）；04 死链+孤儿检测（独立探针）；06 transclusion；07 Obsidian 语法包；08 unlisted 第三态；10 插件管线登记表；11 加密页 shadow index。
2. **文章/文档体系组（12–18）**：outline 层级接线、搜索键盘导航、片段包含、frontmatter 每页开关、editLink pattern、内容层小件（Badge/警报语法）、lastUpdated（暂缓）。

共用原则：先数据契约后组件（J1 先行）；不建 docs 子站；轻依赖优先；K7 暂缓待口径决策。

## User Stories

1. 作为读者，在文章 B 页面能看到「哪些文章链接到了 B」（反链）。
2. 作为读者，能看到文章间的关系图谱，点节点跳转。
3. 作为读者，鼠标悬停在 `[[链接]]` 上能预览目标摘要。
4. 作为维护者，构建时能发现站内死链和没有任何入链的孤儿页。
5. 作为园主，某篇文章可以标记 unlisted（可直接访问但不出现在列表/RSS）。
6. 作为维护者，markdown 支持 ==高亮==、%%注释%%、aliases 等 Obsidian 常用语法。
7. 作为读者，能用 `![[某文]]` 把另一篇内容嵌入当前文。
8. 作为读者，侧栏有文件夹树导航，按内容目录浏览。
9. 作为维护者，markdown 插件的顺序与依赖是显式登记 + 构建期校验的，不靠数组位置。
10. 作为读者，文章目录的显示层级可以按篇配置。
11. 作为读者，搜索结果可以用方向键选择、回车打开。
12. 作为维护者，写 docs 手册能用 `@include` 片段引入代码文件区域，不手工抄。
13. 作为园主，单篇文章可以关目录/关搜索/自定义标题模板。
14. 作为维护者，文档页有「编辑此页」链接且可单篇关闭。
15. 作为读者，标题旁能有徽章标注（如「新」「系列」）。
16. 作为读者，GitHub 风格 [!TIP] 警报语法与现有 admonition 和平共处。
17. 作为读者，加密文章不出现在列表和 RSS 里。

## Implementation Decisions

- **01 链接图谱数据**：构建期扩展/新建 link-graph 数据（slug → outlinks/inlinks，含锚点与显示文本），JSON 或二进制索引落构建产物；数据契约先定（J2/J3/J5/J9 都吃它）；与现有 article-index 的关系明确（并存或扩展）；remark-wiki-link 解析逻辑复用（它已有 slug/路径/裸文件名三级解析）。
- **02 反链面板**：文章页底部/侧栏「链接到此」列表，按 J1 数据渲染；空态隐藏。
- **03 关系图谱**：局部图（当前文章 ±1 跳）优先，全局图其次；d3-force 体积先评估（或 canvas 自绘轻量）；island 按需加载。
- **04 死链+孤儿检测**：构建期脚本扫全站内部链接；死链报错/警告分级（先警告后硬门禁）；孤儿页列表供园主参考；接 CI。
- **05 悬浮预览**：floating-ui + 构建期摘要数据（标题+首段）；触屏设备降级为点击。
- **06 transclusion**：`![[page]]` 构建期展开；循环嵌入检测；深度限制。
- **07 语法包**：`==high==`/`%%hidden%%`/表格转义/aliases frontmatter/大小写不敏感匹配；逐项小 remark 插件，可独立开关。
- **08 unlisted**：frontmatter 第三可见态（draft/unlisted/public）；列表/RSS/llms.txt 过滤规则明确。
- **09 Explorer**：侧栏文件夹树组件（第二阶段）；只做侧栏不改内容组织；与现有 nav/合集导航的关系设计。
- **10 插件管线**：`src/plugins/` 建分层登记表（remark/rehype/集成三类），astro.config 消费登记表；构建期校验依赖与顺序（可失败检查脚本）。
- **11 shadow index**：加密文章从列表/RSS/llms.txt 隐藏但保留直链可访问（配合 J8 的可见态词汇）。
- **12 outline 层级**：`computeTocItems` 的 maxLevel 接线到配置/篇级。
- **13 搜索键盘**：结果列表方向键导航 + 回车打开 + aria-activedescendant；纯前端。
- **14 片段包含**：`@include path#region` 与 `<<<` 语法，支持行范围；URL 重基；docs/agents 手册先用起来。
- **15 frontmatter 开关**：titleTemplate/outline/search/pageClass/head 可选字段，schema 扩展。
- **16 editLink**：函数式 URL 生成 + 单篇关闭；docs/agents+spec 页先行；与批 2 票 05 的「编辑此页」小件合并或分工明确。
- **17 内容层小件**：Badge 标题徽章（内容层 frontmatter，与 title-mood 展示层不冲突）+ GitHub 警报语法兼容。
- **18 lastUpdated**：暂缓。待园主定「文章时间口径」后再评估；若做必须解 CI fetch-depth 与 .git 体积问题。

## 验收总则

- 每票：本地 `pnpm dev` 关键路径 + `pnpm check && pnpm type-check`；J1/J4 加构建产物验证；J4 接 CI。
- 全组合并后 `pnpm check:gates` 全绿才进发布确认；push 仍需园主单独授权。
