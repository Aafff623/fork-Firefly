# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the actual label strings used in this repo's issue tracker.

| Label in mattpocock/skills | Label in our tracker | Meaning                                  |
| -------------------------- | -------------------- | ---------------------------------------- |
| `needs-triage`             | `needs-triage`       | Maintainer needs to evaluate this issue  |
| `needs-info`               | `needs-info`         | Waiting on reporter for more information |
| `ready-for-agent`          | `ready-for-agent`    | Fully specified, ready for an AFK agent  |
| `ready-for-human`          | `ready-for-human`    | Requires human implementation            |
| `wontfix`                  | `wontfix`            | Will not be actioned                     |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the corresponding label string from this table.

Edit the "Label in our tracker" column to match whatever vocabulary you actually use.

## 本仓怎么表达

本地 markdown tracker 没有标签对象，状态写在文件里（见 `issue-tracker.md`）：

- **角色**：issue 文件顶部一行 `Status: <role>`，取上表第二列的字符串。
- **`/triage` 的执行方式**：改写那一行，而不是调用 `gh label create`。
- 除五角色外，wayfinder 的票额外带一行 `Type: research|prototype|grilling|task`，
  以及可选的 `Blocked by: NN, NN`。这三个字段是本仓 tracker 的既有约定，不要改写成标签。
