# 16: 相册目录扫描（info.json hidden/external 模式）

**What to build:** 相册从「手动登记制」扩展为「目录扫描制」：`public/images/albums/<name>/info.json` 描述元数据（标题/描述/封面/hidden/external 标记），构建期扫描目录自动上架；与现有手动登记制并存（新相册走扫描，存量不动）。hidden 控制列表可见性，external 标记外链图片。

**Blocked by:** None

**Status:** open

- [ ] info.json schema 定义（含 hidden/external）
- [ ] 构建期扫描 + 与现有登记制合并渲染
- [ ] hidden 相册不进列表但可直接访问（或按现有密码行为对齐）
- [ ] 本地造 2 个相册目录验证扫描与渲染
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch2/shirone-borrow.md` 第 5 条（对方相册不走 collection，`public/images/albums` 目录扫描 + JSON meta；我们手动登记）。上游做法见 `temp/repos/Shirone/src/`（重实现）。
