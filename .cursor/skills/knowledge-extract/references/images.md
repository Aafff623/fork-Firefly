# 配图与 R2（extract 渠道 1–3）

正文大图**不进 git**。上传 Cloudflare R2 后写公网 URL。  
桶：`firefly-comment`。公网：`https://img.threetwoa.live`。不要写到无 `img.` 域的旧桶。

渠道 4 合集走 [`../../_shared/periodical.md`](../../_shared/periodical.md)，不走本页。

## 各渠默认

| 渠 | 图从哪来 | MiniMax |
|----|----------|---------|
| 1 Obsidian | vault 附件（`extract_vault.py` 拷到 `assets/`） | 仅附件缺失且检索也空 |
| 2 粘贴 | 用户/原文配图；公众号从 `source/images/` 精选 | 仅原图不够说明论点时 |
| 3 调研 | **必须检索**场景匹配图（官方 OG / docs / README / 产品 UI） | 检索落空才允许 |

GIF：仅当用户在本轮提示词里明确要动图。

## 检索匹配（渠道 3 必做；1/2 缺图时补）

1. 按小节列出场景（例如「侧栏礼盒悬停」「R2 上传失败时的控制台」）。
2. 优先：官方文档截图、GitHub README、产品 OG、公告图。
3. 其次：合规可引用的博文配图（保留来源链接与抓取日）。
4. 不要：空洞科技库存、与段落无关的壁纸、微信外链当唯一引用。
5. 视频站：用封面/官方剧照；不要去扒口播帧当配图。

## 上传

本地可先 webify（JPG、长边约 1200–1600、RGBA 贴深色底）。缓存 `.scratch/` 或 `%TEMP%`（gitignore）。

object key（extract 阶段还没有 slug）：

```text
knowledge/{theme}/{YYYY-MM-DD}-{ascii-short}/{ascii-name}.jpg
```

```bash
python .cursor/skills/_shared/scripts/upload_r2.py \
  --file <local.jpg> \
  --key knowledge/{theme}/{date}-{short}/foo.jpg \
  --verify
```

密钥只读本机 env / Firefly `.env`（`R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`），不入库、不打印。  
上传后 `GET` 公网 URL，确认 HTTP 200 再写入笔记。失败就汇报，禁止假装已上 R2。

正文：

```markdown
![说明](https://img.threetwoa.live/knowledge/{theme}/{date}-{short}/foo.jpg)

*图：一句话说明。来源：[原页](https://example.com)（抓取日）。*
```

`assets/` 可留本地副本方便预览；主体 md **优先写 R2 URL**，避免 output 再把大图拷进 git。

## 封面 ≠ 正文插图

`image:` / 列表卡背景：必须 MiniMax 自生成（默认二次元人物，主题元素编进画面；或场景图）。禁止把园主配图或检索素材当封面。  
正文插图：园主截图、官方图、检索图可以。合集（渠道 4）仍禁止生图。

## 封面点名本站角色

封面或配图点名本站角色（DeepSeek 猫娘等）必须先搜桌宠真源，再决定生图：

- 组件：`src/components/features/SpritePet.svelte`
- 默认宠：`maid-deepseek-whale`（`src/lib/pets/builtinPets.ts` / `src/config/petConfig.ts`）
- 精灵：`public/pets/maid-deepseek-whale/`（`/pets/maid-deepseek-whale/spritesheet.webp`）

禁止自造鲸背杂志风。生图走 `firefly-minimax-media`（先 `check_quota.py`），不要在本页重写 prompt 工艺。

## MiniMax 兜底

正文缺图才走这里。封面不走兜底，见上一节「封面 ≠ 正文插图」。

1. 检索（或原图）确实没有能说明该节的图。点名本站角色时先过上一节真源。
2. 读 `firefly-minimax-media`，先 `scripts/check_quota.py`。
3. 交付写明：哪几张是生图、额度是否过门禁。
4. 合集（渠道 4）默认禁止生图。
