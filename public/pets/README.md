# 站内桌宠资源（双 DeepSeek）

浏览态 **Maid-DeepSeek-Whale**（Atlas v2 · 8×11）+ 文章页 **OpenPet DeepSeek**（classic 8×9）。

配置见 `src/config/petConfig.ts`；交互见 `docs/knowledge/dual-pet-deepseek.md`。

## 结构

```text
pets/
├── maid-deepseek-whale/spritesheet.webp   # 1536×2288 · v2
└── openpet-deepseek/spritesheet.webp      # 1536×1872 · 8×9
```

## 许可黄线

| 包 | 说明 |
|---|---|
| Maid | 来源 codex-pets / aimcp；许可标注 **unknown**（作者线索 DeaDumB） |
| OpenPet | 来自 AwesomeHou/openpet-ai-girls；仓内 **无 LICENSE** |

本站站内试用接入；**公开再分发前须自行确认授权**。历史 cc-haha 四宠资源已移除（见 `docs/knowledge/cc-haha-pets.md` 归档说明）。

## 启用

`spritePetConfig.enable = true`；与 Spine / Live2D（`pioConfig.ts`）互斥。
