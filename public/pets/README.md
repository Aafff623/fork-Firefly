# 站内桌宠资源

默认双 DeepSeek + 访客可选 Codex v1 皮（设置面板换皮）。

配置见 `src/config/petConfig.ts`；交互见 `docs/knowledge/dual-pet-deepseek.md` · `docs/knowledge/codex-pet-picker.md`。

## 结构

```text
pets/
├── maid-deepseek-whale/          # 浏览默认 · Atlas v2 · 1536×2288
├── openpet-deepseek/             # 文章默认 · classic 8×9 · 1536×1872
├── diandian--lllucasxu/          # 可选 · MIT · 三花猫 · 换卡跑停睡 · 卡间 7.5s
├── claude--xiangking/            # 可选 · MIT · Claude · 显示 96px
├── elaina--nyakku-shigure/       # 可选 · 非商业再分发已授权 · idle 1.8× · 换卡女巫形态
├── gpt-muse--opask/              # 可选 · 仓默认 CC BY-NC · 无设置黄线
└── gojo--lilokhalikfa/           # 可选 · 非商业再分发已授权 · Gojo
```

可选皮来源：[legeling/awesome-codex-pet](https://github.com/legeling/awesome-codex-pet)（代码 MIT · 素材默认 CC BY-NC 4.0；单宠以 `submission.json` / 本表为准）。  
复拉：`node scripts/fetch-codex-pets.mjs`

## 许可

| 包 | 说明 |
|---|---|
| Maid | codex-pets / aimcp；**unknown**（作者线索 DeaDumB） |
| OpenPet | AwesomeHou/openpet-ai-girls；仓内 **无 LICENSE** |
| diandian | **MIT**（LLLucasXU） |
| claude | **MIT**（xiangking） |
| elaina | 维护者确认非商业仓库再分发（2026-07-18） |
| gojo | 同上 |
| gpt-muse | 按 awesome-codex-pet **素材默认 CC BY-NC 4.0** 理解；设置面板不标「许可未明确」 |

个人博客非商业展示可接入；**商用 / 付费 / 广告站须单独确认或替换**。请署名作者与来源仓。

历史 cc-haha 四宠已移除（见 `docs/knowledge/cc-haha-pets.md`）。

## 启用

`spritePetConfig.enable = true`；`pickerEnabled` 控制设置里是否出现换皮。与 Spine / Live2D（`pioConfig.ts`）互斥。
