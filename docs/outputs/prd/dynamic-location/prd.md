# PRD：动态发布时定位（方案 A）

> 状态：**approved**（2026-08-08）  
> 主题：`dynamic-location`  
> 批准：园主确认方案 **A**（发布时分级填 `location`）

## 已拍板

| # | 决策 |
|---|---|
| 1 | **不**在访客浏览器做 GPS / IP |
| 2 | **发布时**解析并写入 frontmatter `location` |
| 3 | 优先级：手写/CLI 覆盖 → 直连 IP 粗定位（可关）→ 常驻地 `home` |
| 4 | IP 查询**必须绕开** HTTP(S)_PROXY；且仅当出口判定为**中国大陆**才采用，否则回落 home（防系统 TUN/VPN 漂到加州等） |
| 5 | 前端 MapPin 只展示字符串；不接地图 SDK |
| 6 | 旧动态无 `location` 时仍回落 `home` / `defaultLocation` |
| 7 | 展示粒度到**市级**（如 `山西 · 运城`），不写学校/小区 |

## 范围（首期）

- `dynamicConfig.location`：`home` + `ipGeo`
- `scripts/resolve-dynamic-location.mjs` + `pnpm new-dynamic` 写入
- `dynamic-post` skill 约定 Agent Write 时同样解析

## 非目标（首期）

- 浏览器 Geolocation 弹窗
- 高德/腾讯选点 UI
- 展示 IP / 经纬度明文
- 访客侧实时定位

## 成功标准

- `pnpm new-dynamic "…"` 生成的 md 含 `location:`
- 开着系统代理时，IP 层不误用代理出口；失败则稳落 `home`
- 显式 `--location` / FM 手写永远优先
