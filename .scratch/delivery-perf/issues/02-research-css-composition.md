# 首页 CSS 582KB 的构成与可裁剪空间

Type: research
Status: open

## Question

首页加载 8 个 CSS 文件、解压合计约 582 KB（`_astro/Layout.DjD_Pc1C.css` 412 KB、`_astro/MainGridLayout.DtLIR5Pd.css` 120 KB，其余零散）。`CONTEXT.md` 已把它列为「降到 <300KB 需 Tailwind 层重构，拍板项」。

需要回答：
- 这 412 KB 里，按规则来源分（Tailwind utilities / 自研 `.css` / `@layer` / 第三方组件库）各占多少？
- 哪些规则在**首页 DOM 上从未命中**（可裁剪）？哪些是跨页共用、必须保留？
- Tailwind 4 的 content 扫描范围是否过宽（把 `docs/`、`temp/`、组件字符串里的类名都收进来了）？
- 按页拆 CSS（每路由只带自己的）可行吗？Astro 当前是怎么分文件的？
- 参考站 84 KB 的 CSS 是怎么做到的（shadcn + Tailwind 4，全站约 150 行自研样式）？

产出：一份按「可立即裁剪 / 需重构 / 必须保留」三档分类的清单，附证据与预估节省。

## Answer

（待决议）
