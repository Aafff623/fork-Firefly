# 日历封面：3D 像素数字花园 · 角色轮播

## 灵感来源

- 对话：园主认可侧栏笔记本日历封面的一帧截图（2026-08-03）
- 剪贴板原图：`C:\Users\Lenovo\AppData\Local\quickclipboard\clipboard_images\f3bad864b941771b.png`
- 入库截图：[`assets/ref-loop-ok-2026-08-03.png`](./assets/ref-loop-ok-2026-08-03.png)
- 旧参考素材：`public/assets/images/widgets/calendar/06.gif`（2D 像素粉发角色，已由新资产替换）
- 2026-08-13 维护结论：不再展示风景封面；统一为 3D voxel / chibi 角色短循环

## 想要的感觉

- **3D 像素角色**：圆润 voxel / chibi，以旧像素人物的粉、青、紫原型为谱系，不复刻具体形象
- **日期安全区**：角色放在右侧，左侧维持低纹理、低亮度负空间，保证日期与翻月按钮可读
- **背景克制**：花园工作台、数据门与萤火灯笼只服务角色叙事，不使用纯风景封面
- **循环观感**：锁定机位的 idle 闭环（呼吸、眨眼、微光），单圈内不突然跳帧
- **性能边界**：360×202、10fps、约 3.1s、128 色；单张目标不超过 300 KB

气质关键词：`voxel · character-led · calm · garden-tech · calendar-banner-safe`

## 可能落点

- 组件：`src/components/widget/Calendar.astro` 封面区（`.calendar-cover-media`）
- 资产：`public/assets/images/widgets/calendar/voxel/`
- 轮询：`data-cover-gifs` + 切换间隔（现 5.2s）
- 生成链路：角色概念图 → MiniMax `MiniMax-Hailuo-2.3` 图生视频 → `scripts/video_to_seamless_gif.py`（xfade）
- 资产说明与复现参数：[`public/assets/images/widgets/calendar/voxel/README.md`](../../../public/assets/images/widgets/calendar/voxel/README.md)

## 扩池规则

- 新封面必须是角色主导的 3D 像素场景，不得加入纯风景图。
- 左侧 42% 保持日期安全区；运镜只允许锁定机位的微幅景深变化。
- 入池前同时检查首尾闭环、浅色/暗色模式可读性、离屏停播和单张 300 KB 预算。
