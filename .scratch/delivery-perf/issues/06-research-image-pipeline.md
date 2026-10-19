# 图片管线与 2400+ 张正文图的体积/构建耗时分布

Type: research
Status: resolved
Resolved by: 实现会话（perf/delivery-budget），2026-10-19

## Question

`public/` 共 144 MB，正文图 2400+ 张。构建链里 `generate-lqips.ts`（2×2 取角生成占位串）+ Astro 内建图片优化（`layout: constrained`、3 档断点 640/1024/1440）负责正文图。

需要回答：图片体积分布、构建耗时分布、参考站做法、`public/gallery`/`pets`/`anime` 的必要性、孤儿图片。

## Answer

### 结论一：图像管线根本没有在转换，只是在改名复制

这是本次调查最重要的发现，比首页那 5.1 MB 严重得多。

**证据链（全部可复现）：**

```bash
# 源图
$ stat -c "%s" src/content/posts/java-course8/images/13-6-13-2.png
2457528
# 产物（4 份，全部与源图字节完全相同）
$ stat -c "%s" dist/client/_astro/13-6-13-2.*.webp
2457528   (×4)
$ sha256sum src/content/posts/java-course8/images/13-6-13-2.png dist/client/_astro/13-6-13-2.*.webp
35925ffd708b700b  (×5，完全相同)
# 内容格式（用 sharp 读产物）
$ sharp(dist/client/_astro/13-6-13-2.Dq0XqO3T_Zd0P4C.webp).metadata()
{ format: 'png', width: 1705, height: 1206 }
```

即：**扩展名是 `.webp`，内容是 PNG，尺寸没缩，字节没变**。同一张源图产出 **4 份一模一样的副本**（`breakpoints` 3 档 + fallback，但每档都指向同一份未转换的字节）。

**线上同样如此**：`curl https://www.threetwoa.live/_astro/13-6-13-2.Dq0XqO3T_Zd0P4C.webp` → `2,457,528` 字节，与源图一致。不是本地构建的假象。

**规模（本地全量 build，`dist/client` 共 1.4 GB / 8563 文件）：**

| 维度 | 数值 |
|---|---|
| 单文件 >1 MB 的文件数 | 150 |
| 其中 webp | **113 个 / 191.3 MB** |
| mp3 | 6 个 / 34.7 MB |
| mp4 | 6 个 / 18.3 MB |
| gif | 10 个 / 18.8 MB |
| `rss.xml` | 1 个 / **17.1 MB** |
| html | 13 个 / 22.0 MB |

按顶层目录：`_astro` 106 个 / 177.5 MB（正文图产物，主体）、`assets` 19 个 / 65.7 MB、`posts` 14 个 / 24.0 MB（合订课页 HTML）、`pets` 7 个 / 13.8 MB、`anime` 3 个 / 5.2 MB。

**根因（已定位到适配器默认值）：**

`node_modules/@astrojs/cloudflare/dist/utils/image-config.js`：

```js
function normalizeImageServiceConfig(config) {
  if (!config || typeof config === "string") {
    const mode = config ?? "cloudflare-binding";   // ← 默认值
    return { buildService: mode, runtimeService: mode === "compile" ? "passthrough" : mode };
  }
  ...
}
```

`astro.config.mjs` 里 `cloudflare({ prerenderEnvironment: "node" })` 没传 `imageService` → 默认 `"cloudflare-binding"` → `buildService` 也是 `"cloudflare-binding"` → 构建期走 `@astrojs/cloudflare/image-service-workerd`，**不是** sharp。实测产物就是原字节复制。

注意：单纯传 `imageService: "compile"` 也未必够 —— 该文件 `case "compile"` 分支里写的是
`service: hasUserImageService(config) ? config.service : WORKERD_IMAGE_SERVICE`，
即没显式配置 `image.service` 时仍回落 workerd 服务。修之前需要先确认这条分支在当前版本的实际行为（**未验证**，只读了源码）。

**为什么这是最大的一处**：一张 2.34 MB 的正文插图，若真转成 webp（1705px、q85）应在 150~250 KB 量级，即**降 10 倍以上**。191 MB 的 webp 存量理论上能压到 20 MB 以内。首页那 5.1 MB 相比之下是零头。

**不建议在本分支直接修**：改 `imageService` 会一次性改变全站 2400+ 张图的输出（视觉与体积同时变），且需要一次完整构建验证；这属于需要园主过目的改动，不是「顺手改一行」。

### 结论二：`public/gallery` 25 MB / `pets` 14 MB / `anime` 6.8 MB 各自用途

- `pets/` 7 个文件 >1 MB，合计 13.8 MB —— 桌宠 spritesheet，已在 `ASSET_ALLOWLIST` 登记；降规格决策挂 04 号票。
- `anime/` 3 个 / 5.2 MB —— 追番页封面。`siteConfig.pages.anime = true`，在用。
- `gallery/` —— 相册页（`/gallery/` 单页交付 20.19 MB，是列表页里最重的）。在用，未评估必要性。

### 结论三：孤儿图片未做完整差集

本次没有完成「引用了但从未使用」的差集统计（时间/预算用于上面的根因定位）。**未验证**。

### 结论四：构建耗时

未实测分步耗时。已知：本地全量 `pnpm build`（LQIP → astro build → 字体子集 → 剥 KaTeX 旧格式 → pagefind）约 5~8 分钟；其中 `astro build` 单步在首次失败尝试里记录为 **2m 03s**（失败点在字体下载，不在图片）。**图片转换如果真正开启，这一步会显著变长**，需要在做结论一的修复时一并测量。

### 附：另一处顺带发现

正文代码样例里存在**未转义的 `<script`**：`posts/java-course3` 的 HTML 里有
`Pattern.compile("<script(.*?)</script>")`（引号被转成 `&#x22;`，尖括号没有）。
浏览器会把 `<script(.*?)</script>` 解析成一个 script 元素，导致该代码样例渲染不完整。
本次只是在写交付预算提取器时撞到（正则把 813 KB 误算成内联脚本），**未确认是否为渲染缺陷**，留待验证。

### 本次交付的相关改动

- 新增 `src/lib/delivery-budget.ts` + `scripts/check-delivery-budget.ts`：产物级交付预算门禁，
  阈值先按现状登记（post 单页最高 46.4 MB、请求数最高 314），把存量债看得见并防回归。
- `ASSET_ALLOWLIST` 已登记 `pets/`、`assets/music/`、`assets/videos/`、`rss.xml` 等（各附理由）。
