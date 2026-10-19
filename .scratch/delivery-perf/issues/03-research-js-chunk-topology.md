# 74 个 JS chunk 的归属与合并空间

Type: research
Status: open

## Question

首页发起 74 个 JS 请求、解压 876 KB。文件名形态显示它们来自**逐组件的 `<script>` 块**（如 `Navbar.astro_astro_type_script_index_0/1/2`、`Profile...index_0/1`、`PostPage...index_0/1`），而非统一入口 + 按需 chunk。

需要回答：
- 74 个 chunk 里，哪些是**首屏必需**、哪些可延后（`defer` / 空闲 / 交互时）？
- 每个 chunk 的实际用途与体积归属（当前最大：`translation` 121 KB、`client` 55 KB、`Icon` 50 KB、`geometry-data` 47 KB、`calendar-widget` 44 KB）。
- 有没有「同页多份重复代码」——例如 `translation.BEzIkmdt.js` 121 KB 在首页是否真的需要全量？
- 参考站只用了 5 个入口 chunk + 60 个按业务域懒加载 chunk，且 `<head>` 里 `modulepreload` 15 个关键 chunk。Firefly 能否照此建立「入口 + 按域懒加载」的分包策略？
- 现有门禁 `scripts/check-v41-gates.mjs` 有「无 >50KB 孤儿 chunk」断言，它与现状是否一致？

产出：chunk 归属表 + 「可延后 / 可合并 / 可删」三档清单。

## Answer

（待决议）
