# Calendar voxel covers

日历封面统一采用「角色主导的 3D 像素短循环」，左侧保留日期安全区，不再混用风景图或旧 2D 人物。

| 资产 | 角色谱系 | 输出预算 |
| --- | --- | --- |
| `rose-cat-gardener.*` | 旧粉色猫耳像素角色 → 花园工作台 | 360×202 / 10fps / ≤300 KB |
| `cyan-data-cube.*` | 旧青色短发像素角色 → 数据立方体 | 360×202 / 10fps / ≤300 KB |
| `violet-firefly-lantern.*` | 旧紫色短发像素角色 → 萤火灯笼 | 360×202 / 10fps / ≤300 KB |

- `.webp`：角色概念图与静态回退源。
- `.gif`：由已有视频素材以 `xfade` 制成的页面轮播资产。
- 动画边界：锁定机位，只允许呼吸、眨眼、手部微动和环境微光；禁止推拉摇移及明显形变。
- 扩池命令：`python scripts/video_to_seamless_gif.py --in <video> --out <cover.gif> --mode xfade --xfade 0.45 --width 360 --fps 10 --max-colors 128 --max-seconds 3.4`
