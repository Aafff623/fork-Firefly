# 来源模块：`wechat`（微信公众号 → vault）

公众号文常见特点：**排版与配图专业、正文偏重、热点话题数日内易重复**。  
本模块目标：原文与配图**完整归档**，再写成可在 Obsidian 里调的笔记，并挂上 Theme/facet 索引。用语进库不在本工序。落盘进 vault，不进 Knowledge。

## 触发词

`公众号` / `微信公众号` / `wechat` / `mp.weixin` / 「这篇公众号」/ 粘贴 `mp.weixin.qq.com` 链接 / 「按公众号流程归档」

## 输入形态（按可得程度选）

| 优先级 | 输入 | 说明 |
|---|---|---|
| 1 | 用户导出的全文 MD + 本地图 | 最稳；图已在手 |
| 2 | 用户在浏览器可打开的文章页 + 允许 Agent 用浏览器工具另存 | 需多 Agent：抓正文/下图 |
| 3 | 仅链接 | 先尝试可访问抓取；失败则停手请用户导出，**禁止**编造正文 |

合规：只处理园主有权阅读的公开/已订阅内容；不绕过登录墙、不写破解类脚本。密钥不入库。

## Multi-Task × Multi-Agent（默认开启）

父 Agent **不要**单线程又抓又写又润色。用 Cursor Multi-Task / `Task` 子代理并行（或严格串行四岗，但职责仍拆开）：

```text
┌─ Agent-Archive（归档员）        → source/article.md + source/images/* + meta.json
├─ Agent-Classify（分类/去重）    → theme + facet + dedupe 扫描（近 7 日）
├─ Agent-Extract（提炼）          → 主体 {短题}.md（详略得当；重文只留可带走点）
└─ Agent-TTA（语式）              → 标题/小节去课件腔；不要重写成另一张嘴
```

| 角色 | 职责 | 成功标准 |
|---|---|---|
| **Archive** | 正文与配图**无损**落 `source/`；MD 内图片改为 `source/images/…` 相对路径；写 `meta.json`（url/title/author/date） | 打开 `source/article.md` 图文可本地预览；无外链图依赖 |
| **Classify** | 对照 [`theme-taxonomy.md`](theme-taxonomy.md) 选 Theme/facet；扫同 Theme 近 7 日是否撞题 | 写出目录路径 + `dedupe` 字段；撞题则建议合并或只写差分 |
| **Extract** | 从 `source/` 提炼主体笔记；可引用 `assets/`（从原图精选拷贝，非再外链） | 有判断、有结构；不是原文缩进粘贴 |
| **TTA** | 去课件腔（禁「一句话收束」等）；园主调完才是理想稿 | 主体不像目录通稿 |

并行建议：Archive ∥ Classify 可同时开；Extract 依赖 Archive（至少有正文）；TTA 依赖 Extract。  
父 Agent 汇总：在 vault 已有主题夹下建 `{日期}_{短题}/`（优先 `Agentic Coding/`）+ 交付文件树。不要写 `Knowledge/todo`。

### 父 Agent 检查清单

- [ ] `source/article.md` + 图齐全，引用相对路径有效  
- [ ] 文首 YAML：`source: wechat` + `theme` + `facet` + `origin_*` + `dedupe`  
- [ ] 主体笔记 ≠ 原文副本；原文只在 `source/`  
- [ ] 已去课件腔；交付含 Theme/facet 路径  
- [ ] 未默默写 posts；园主调完再交给 `knowledge-output`

## extract 流程（插在渠道 2 清洗里）

```text
识别来源 = wechat
  → Multi-Agent：Archive + Classify（并行）
  → 确认 Theme/facet / 去重结论（撞题则问园主：合并 or 差分）
  → Extract 写主体 → 去课件腔
  → 落盘 vault\{已有主题夹}\{日期}_{短题}\
  → 停。园主调完再 output（公众号默认草稿箱，除非用户明确正式发）
```

## 与「删繁就简」的差分

| 层 | 策略 |
|---|---|
| `source/` | **求全**：原文 + 原图，不在这一层删减 |
| 主体 `{短题}.md` | **求准求薄**：只留可带走的判断、步骤、数字；广告/重复鸡汤狠删 |
| 配图 | 主体 `assets/` 只精选 1–4 张真正服务论点的图；其余留在 `source/images/` |

成帖后站点会对正文图做等比例限高 + Fancybox 单击放大（见博客仓 `docs/agents/workflow.md`「正文插图显示」）；归档原图勿为版面裁切。

原则：**源头求厚、笔记求薄、语式求人味。**

## 配图

1. **先用原文图**（Archive 已落盘）  
2. extract 阶段原图精选后按 [`images.md`](images.md) 上 R2；检索仍空就标记待补
3. 禁止把微信外链图直接写进主体笔记当唯一引用（易失效）

## 反例

- 只存链接不存正文/图  
- 把全文当「提炼笔记」交差（没有 source/ 分层）  
- 单 Agent 糊成一锅，图丢了才发现  
- 忽略近几天同 Theme 撞题，连开同构目录  
- 在本工序抽用语或做封面

## 与其它来源

| 若实际是… | 改标 |
|---|---|
| BibiGPT 视频总结 | `bibigpt`（先搜证） |
| 已进 Obsidian vault | 渠道 1 `obsidian`（`extract_vault.py`），不是另开入口 |
| 用户粘贴普通 MD（非公众号） | 仍是渠道 2 `paste` |
