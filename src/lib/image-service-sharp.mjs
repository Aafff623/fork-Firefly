/**
 * 构建期图像服务：显式指回 Astro 自带的 sharp。
 *
 * 为什么需要这个文件：
 * `@astrojs/cloudflare` 默认把 `imageService` 解析成 `"cloudflare-binding"`，构建期用
 * `dist/entrypoints/image-service-workerd.js`，而那个服务的 transform 是
 *
 *     async transform(inputBuffer, transform) {
 *       return { data: inputBuffer, format: transform.format };   // 原字节返回
 *     }
 *
 * ——即**故意的 no-op**：只把源字节按请求的格式改个扩展名。真正处理本该在运行时
 * 通过 `IMAGES` 绑定（Cloudflare Images）发生，但预渲染页面的图片在构建期就已经
 * 落成静态文件，运行时那条路走不到；而 `deploy-cf.yml` 还会把 `images` 绑定从生成的
 * wrangler.json 里删掉。两头都断，结果就是全站图片从不被处理。
 *
 * 实测（2026-10-18 本地全量 build）：优化步骤对每张图都报 `before: 118kB, after: 118kB`；
 * 产物宽高与源图逐一相等（无缩放）；`.png`/`.jpg` 源的产物内容仍是 png/jpeg，只是
 * 文件名变成了 `.webp`。`dist/client` 因此到 1.4 GB，其中 113 个 >1MB 的 webp 合计 191 MB。
 *
 * 怎么绕过去（**必须两处一起改，缺一不可**）：
 *
 * 1. `astro.config.mjs` 的 `cloudflare({ imageService: "compile" })`。
 *    适配器 `setImageConfig()` 的 `switch (buildService)` 里，`cloudflare-binding` 分支
 *    **无条件覆写** `service: WORKERD_IMAGE_SERVICE`；只有 `"compile"` 分支才会去看
 *    `hasUserImageService(config)` 并尊重用户提供的入口。默认值就是 `cloudflare-binding`，
 *    所以不改这里，下面的入口会被直接丢掉（实测踩过这个坑）。
 * 2. `image.service` 指向本文件。`hasUserImageService()` 把 sharp 官方入口
 *    (`astro/assets/services/sharp`) 和 workerd 入口都排除在外，所以直接写 sharp 官方
 *    路径也会被判成「没有用户服务」而回落 workerd。包一层薄壳把路径变成「自定义」，
 *    实际实现仍是官方 sharp 服务。
 *
 * 实测效果（2026-10-19，本地全量 build）：
 *   dist/client 1.4 GB → 748 MB；>1 MB 文件 150 → 44；其中 webp 113 个/191 MB → 7 个/13.8 MB。
 *   样例源图 `13-6-13-2.png`（2.4 MB）产物从「4 份 2.4 MB 的 PNG 改名」变成
 *   真 webp 且断点生效：640px 53 KB / 1024px 119 KB / 1440px 206 KB / 原尺寸 268 KB。
 *   构建耗时约 6 分钟 → 约 9 分钟。这是拿到真实压缩的必要成本。
 */
export { default } from "astro/assets/services/sharp";
