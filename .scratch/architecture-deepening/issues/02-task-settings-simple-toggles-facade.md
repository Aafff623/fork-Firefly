# 显示设置的简单开关 facade（架构深化第二刀）

Type: task
Status: claimed

## Scope

把设置面板里「一个 localStorage 键 + 一个 apply 副作用」这类简单布尔开关收进一个 facade：组件只认 id，不再逐个 import `getXxx/setXxx`。不碰主题色、壁纸模式、遮罩、头像框、宠物选择等带结构的设置。

## Done（2026-10-21）

- `src/lib/settings/boolean-storage.ts`：`readBooleanSetting(key, fallback)` / `writeBooleanSetting(key, value)`；返回 `false` 表示当前环境不可写，保留原有「不可写就不 apply」语义。
- `src/utils/setting-utils.ts`：6 个同形开关迁到 boolean-storage，净减 121 行。
- `src/lib/settings/simple-toggles.ts`：`SIMPLE_TOGGLE_IDS`（9 个）+ `ENTRIES`（defaultValue / storedValue / apply 三元组）+ `getSimpleToggleDefaults()` / `readSimpleToggle()` / `writeSimpleToggle()`。
- `src/components/controls/DisplaySettingsIntegrated.svelte`：删掉 26 条逐个子函数 import，改走 facade（33 处调用，覆盖全部 9 个 id）。
- `scripts/test-simple-toggles.mts` + `test:toggles`，并接入 `check:behavior`。

## Verification

- `tsx scripts/test-simple-toggles.mts`：PASS —— 9 个 id 全枚举；7 个可回环；`cardBorder` / `cardFollowTheme` 在面板未开放时写入不得伪造生效；无 localStorage 时写入完全无痕且不抛。
- `pnpm run check:behavior`：5/5 PASS（lifecycle / comment-image / ask / settings-storage / simple-toggles）。
- `astro check`：0 errors / 0 warnings / 10 hints（331 files）。
- `tsc --noEmit`：exit 0。
- `biome check`（本轮 10 个相关文件）：0 错。
- 浏览器（dev 4321，ego lite）：`waves` / `gradient` / `noteCard` / `sakura` / `petRoam` 五个真实点击，旋钮 class 与 localStorage 同步翻转；重载后面板状态与存储一致；页面 `error` 事件 0 条。
- `pnpm build`：exit 0。`check-v41-gates.mjs` 29/29、`check:budget` 865 页 0 违规、`check-ui-motion-gates` 10/10、`check-community-comment-gates` 9/9（均在迁移后复跑）。

## Residual

- 主题色 / hue / 壁纸模式 / overlay 三档 / 头像框 / 宠物选择仍是各自 getter，未纳入 facade：它们不是「一个键一个布尔」，硬塞会把 facade 变成第二个 setting-utils。
- `writeSimpleToggle` 丢弃了 `writeBooleanSetting` 的返回值。组件层此前也不检查，无行为变化；若将来要「不可写就不改 UI」，需要 facade 显式把布尔透传。
- 面板 9 个 `default*` 常量仍散在组件里；等第二次改动这条线时再收成一个 `$derived` 表。
- `check:behavior` 的 fake DOM 只覆盖 `documentElement` / `body` / `getElementById` / `querySelector`，不是真 DOM；换 happy-dom 之前，这条测试只保证路由与语义，不保证样式副作用。
