# vendor

## `heroui-pro-react`

`@heroui-pro/react` 在公开 npm / npmmirror 上只有空壳（无 `dist`），完整包需 HeroUI Pro 登录后安装。

EdgeOne / CI 无法使用本机 `~/.heroui` 缓存，故将 **1.0.0-beta.7** 完整产物落盘于此，由 `package.json` 以 `file:vendor/heroui-pro-react` 引用。

升级 Pro 版本时：本机 `heroui-pro install` 后，再同步覆盖本目录并更新依赖。
