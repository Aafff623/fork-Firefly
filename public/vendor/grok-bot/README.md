# Grok Bot 引擎（本地副本）

几何与角色脚本属于 **xAI / 相应权利人**，仅供本机学习预览，禁止商用、禁止再分发、禁止推进 git。

本目录除本 README 外全部 gitignore。线上构建若缺这些文件，侧栏会锁在静态头像，不跑 Bot。

## 本地拷贝

从学习仓 replica 拷到这里（保持 `src/` 目录，站点按此顺序加载）：

```text
.scratch/refs/grok-icon-study/replica/geometry-data.js
.scratch/refs/grok-icon-study/replica/src/math.js
.scratch/refs/grok-icon-study/replica/src/tables.js
.scratch/refs/grok-icon-study/replica/src/pose.js
.scratch/refs/grok-icon-study/replica/src/tricks.js
.scratch/refs/grok-icon-study/replica/src/fx.js
.scratch/refs/grok-icon-study/replica/src/eyes.js
.scratch/refs/grok-icon-study/replica/src/character.js
```

PowerShell：

```powershell
$src = ".\.scratch\refs\grok-icon-study\replica"
$dst = ".\public\vendor\grok-bot"
New-Item -ItemType Directory -Force -Path "$dst\src" | Out-Null
Copy-Item -Force "$src\geometry-data.js" "$dst\geometry-data.js"
Copy-Item -Force "$src\src\*.js" -Destination "$dst\src\"
```

不要改 replica 源码。侧栏编舞在 `src/scripts/profile-grok-carousel.ts`。
