# 图片管线与 2400+ 张正文图的体积/构建耗时分布

Type: research
Status: open

## Question

`public/` 共 144 MB，正文图 2400+ 张。构建链里 `generate-lqips.ts`（2×2 取角生成占位串）+ Astro 内建图片优化（`layout: constrained`、3 档断点 640/1024/1440）负责正文图。

需要回答：
- 图片体积分布：按格式（webp/jpg/png/avif/gif）、按目录、按单文件大小分档，各占多少？最大的前 20 张是什么？
- 构建期实际耗时分布（LQIP 一步多久、Astro 图片优化多久）？CI 单次 build 3 分钟里图片占多少？
- 参考站的做法：内容分仓 + 构建期 Sharp 转 avif + CDN 侧格式协商，且「增量压缩后仅需 1 分钟左右」。Firefly 能否引入增量？
- `public/gallery` 25 MB、`public/pets` 14 MB、`public/anime` 6.8 MB 这三块与正文图是不同用途，各自的必要性如何？
- 有没有「引用了但从未在页面上使用」的孤儿图片（可删）？

产出：体积分布表 + 增量优化可行性判断 + 可删清单。

## Answer

（待决议）
