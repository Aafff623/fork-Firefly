# 参考仓库借鉴第三批 · Spec

## Problem Statement

第三批调研（hugo-PaperMod + hexo-theme-butterfly，报告在 `temp/reports/batch3/`）定位出 18 项思想迁移级增量。两仓与我们的重合度依旧极高，差异集中在：工程卫生（noindex/搜索排除/注入点/文档重建/版本门禁/CDN 总闸）、SEO 与统计（站长验证/PV-UV/主动推送/每标签 RSS）、以及一批中文博客常见交互小件。

## Solution

18 项独立小改动，三组推进：

1. **工程治理组（01–06）**：分环境 noindex 门控、searchHidden 统一退出、配置参考自动生成、显示开关词汇表、工具链版本门禁、CDN 资产登记表。
2. **SEO/统计组（07–12）**：站长验证 meta、站点 PV/UV + CF Web Analytics、IndexNow/百度推送、每标签 RSS、noscript 暗色兜底、复制追加版权。
3. **交互/功能组（13–18）**：inject 注入点、最新评论卡、首页三模式、锚点焦点管理、PWA（默认关）、小件打包。

共用原则：全部思想迁移零代码复制；改共享文件前查 WIP；G1 防误伤生产；I5 高风险单独评估。

## User Stories

1. 作为园主，预览/分支部署不会被搜索引擎收录，生产不受影响。
2. 作为园主，某篇文章可以一键退出搜索与 llms.txt，不用改构建。
3. 作为维护者/Agent，配置参考文档能从 config 真源重建，不手工抄。
4. 作为维护者，新增「可按篇覆盖」的显示项有既定词汇（站点默认+单篇覆盖）。
5. 作为维护者，CI 会拦住 Node/pnpm 版本不对的环境。
6. 作为维护者，第三方 JS/CSS 资产有登记表和 provider 切换总闸。
7. 作为园主，百度/Google 站长验证 meta 一处配置。
8. 作为读者，侧栏能看到站点访问量（免 cookie）。
9. 作为园主，新文章发布后主动推送给百度/IndexNow。
10. 作为读者，每个标签有独立 RSS 可订阅。
11. 作为读者，禁用 JS 的浏览器里暗色主题不闪错。
12. 作为读者，复制文章正文时自动带上版权与原文链接（代码块除外）。
13. 作为维护者，head/bottom 有配置化注入点放统计代码/自定义脚本。
14. 作为读者，侧栏看到最新评论。
15. 作为园主，首页可以在文章列表/信息卡/名片三态间配置切换。
16. 作为读者，锚点跳转后焦点落在目标标题，键盘用户不迷路。
17. 作为读者，站点可离线访问（PWA，默认关）。
18. 作为读者，归档能按月看、列表页能订 RSS、长图能缩放。

## Implementation Decisions

- **01 noindex 门控**：显式环境变量（如 `PUBLIC_ENV`/构建期常量）判定 preview/production；robots.txt 同步分环境输出；本地与 CI 双验证防误伤生产。
- **02 searchHidden**：frontmatter 布尔 + Pagefind 的 data 属性过滤 + llms.txt 过滤同源；与加密文（构建期加密，非明文）区分——这是产品能力缺口非安全缺口。
- **03 配置参考生成**：从 `src/config/*.ts` 的类型与注释生成参考页（或扩展点清单），进 `docs/`；遵守 AGENTS.md 不从可重建来源手工维护文档。
- **04 开关词汇表**：确立「站点默认（config）+ 单篇覆盖（frontmatter）」的命名与读取模式（.Param 级联思想），写入 spec 供后续配置项遵循；不合并现有文件。
- **05 版本门禁**：CI 加 Node/pnpm 版本断言（ engines 字段 + 显式检查）。
- **06 CDN 登记表**：`cdnConfig.ts` 配置域登记第三方资产（名称/版本/URL/provider），provider 支持 local/jsdelivr/unpkg/cdnjs/custom 切换；存量资产逐步登记。
- **07 站长验证**：siteConfig 加 verification 段（google/baidu/bing），Layout meta 输出。
- **08 PV/UV**：CF Web Analytics beacon（免 cookie，适配 Workers）；展示组件按开关；不学 butterfly 把 token 内联进客户端。
- **09 主动推送**：构建后脚本，参照批 2 票 13（快照+降级+超时）纪律；失败不阻断构建。
- **10 每标签 RSS**：依赖批 2 票 04 的静态标签路由；在其上挂 RSS 端点。
- **11 noscript 兜底**：首屏内联脚本在无 JS 时按系统偏好落暗/亮，不闪错。
- **12 复制版权**：selection 复制事件追加版权与链接；排除 pre/code 块；可配置。
- **13 注入点**：customCodeConfig（head/bottom/footer 三点），默认关；FooterConfig.html 先例泛化；侧栏保持 componentMap 一条路，不并存逃逸舱。
- **14 最新评论卡**：复用批 1 票 08 构建期 fetch + token 模式打 Giscus API；失败回退隐藏。
- **15 首页三模式**：siteConfig 加 homeMode（regular/homeInfo/profile）参数开关，零代码切形态；与现有侧栏 Profile 常驻的关系要设计（profile 模式下是否隐藏侧栏卡）。
- **16 锚点焦点**：标题锚点跳转后 focus 目标 + reduced-motion 平滑滚动降级。
- **17 PWA**：manifest + SW 默认关；SW 缓存策略与 CF 头叠加风险要专项测试；本票可长期 open 观望。
- **18 小件包**：按月归档分组、列表页 RSS 按钮、accesskey、全局 toast、分类栏滚动记忆、Mermaid 大图缩放、阅读模式轻量档（与批 1 票 14 沉浸阅读分工：轻量开关 vs 全沉浸）。

## 验收总则

- 每票：本地 `pnpm dev` 关键路径 + `pnpm check && pnpm type-check`；CI/门禁票跑 `pnpm check:gates`。
- G1 必须本地+CI 双环境验证 noindex 行为；09 必须验证构建失败降级。
- 全组合并后 `pnpm check:gates` 全绿才进发布确认；push 仍需园主单独授权。
