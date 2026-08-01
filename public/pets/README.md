# 站内桌宠资源（cc-haha）

本目录 spritesheet 与引导图移植自 [NanmiCoder/cc-haha](https://github.com/NanmiCoder/cc-haha)（MIT License）。

## 结构

```text
pets/
├── dada-code/spritesheet.webp
├── huhu-plan/spritesheet.webp
├── bubu-fix/spritesheet.webp
├── huihui-build/spritesheet.webp
└── guides/
    ├── action-sheet-guide.zh.png
    └── action-sheet-guide.en.png
```

## 启用

编辑 `src/config/petConfig.ts`，将 `enable` 设为 `true`，并用 `petId` 选择角色。

与 Spine / Live2D（`pioConfig.ts`）互斥，三者最多开一个。

## 说明

- 这是**博客站内悬浮宠**，不是 Electron 系统桌面置顶窗。
- 自定义动作表导入首期未接入；引导图仅供后续扩展参考。
- 详见 `docs/knowledge/cc-haha-pets.md`。
