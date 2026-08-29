# 配图与 R2（extract 渠道 1–3）

正文大图**不进 git**。上传 Cloudflare R2 后写公网 URL。  
桶：`firefly-comment`。公网：`https://img.threetwoa.live`。不要写到无 `img.` 域的旧桶。

渠道 4 合集走 [`../../_shared/periodical.md`](../../_shared/periodical.md)，不走本页。

## 各渠默认

| 渠 | 图从哪来 | 缺图处理 |
|----|----------|---------|
| 1 Obsidian | vault 附件（`extract_vault.py` 拷到 `assets/`） | 附件缺失时标记待补 |
| 2 粘贴 | 用户/原文配图；公众号从 `source/images/` 精选 | 原图不足时检索，仍缺则标记待补 |
| 3 调研 | **必须检索**场景匹配图（官方 OG / docs / README / 产品 UI） | 检索落空时标记待补 |

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

## 封面与正文插图

`image:` / 列表卡背景：必须使用已存在的合规本地素材或 R2 图片，不在提炼或发布流程中调用模型生图。正文插图可以使用园主截图、官方图或合规检索图；没有合适素材时标记待补。合集（渠道 4）同样只使用已有素材。

## 封面点名本站角色

封面或配图点名本站角色（DeepSeek 猫娘等）必须先搜桌宠真源，再决定生图：

- 组件：`src/components/features/SpritePet.svelte`
- 默认宠：`maid-deepseek-whale`（`src/lib/pets/builtinPets.ts` / `src/config/petConfig.ts`）
- 精灵：`public/pets/maid-deepseek-whale/`（`/pets/maid-deepseek-whale/spritesheet.webp`）

禁止凭空绘制本站角色；点名角色时优先使用 `SpritePet` / `public/pets/maid-deepseek-whale` 的真实素材。图片仍缺失时，在交付说明里写明待补位置和原因。
