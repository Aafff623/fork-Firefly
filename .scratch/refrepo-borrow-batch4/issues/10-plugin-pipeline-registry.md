# 10: 插件管线分层登记表 + 顺序校验

**What to build:** `src/plugins/` 建分层登记表（remark/rehype/集成三类，或按 transformers/filters 思想分层），`astro.config.mjs` 从平铺 20+ 插件数组改为消费登记表；登记表声明依赖与顺序；构建期校验（缺失依赖/顺序矛盾可失败）。审批：顺序显式化不得改变现有管线行为（先等价重构再谈优化）。

**Blocked by:** None

**Status:** open

- [ ] 登记表结构 + astro.config 消费（行为等价，构建产物 diff 为空或仅注释差异）
- [ ] 依赖/顺序声明 + 校验脚本（可失败）
- [ ] CI 接入校验
- [ ] `pnpm build` 行为等价验证 + `pnpm check:gates` 绿

**参考**：`temp/reports/batch4/quartz-arch-perf.md`（四层插件管线+YAML 显式 order+构建期校验依赖缺失/顺序颠倒/循环依赖，config-loader.ts:100-192；我们 astro.config.mjs:348-393 是 20+ 插件扁平数组，顺序靠数组位置隐式表达——列为最值得学的一条）。上游 `temp/repos/quartz/`（管线契约思想，重实现）。
