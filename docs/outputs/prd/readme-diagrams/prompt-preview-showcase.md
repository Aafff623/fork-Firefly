# Preview / Showcase — 截图规范（禁止生图冒充 UI）

气质参考：`references/preview/`、`references/showcase/`（Prodly / Storm / Jasper / Sniffnet 等）。  
这些图只教 Agent **什么叫专业真机界面**，不拿去 image-to-image 伪造本产品 UI。

## 硬规则

| 资产 | method | 说明 |
|------|--------|------|
| `preview-shell.png` | `screenshot` | 对本地 Preview 站整页/壳截图 |
| `preview-*.png` | `screenshot` | 代表性分区 1–3 张 |
| `showcase-*.png` | `screenshot` | 产品主链路 Playwright 槽位 |

```yaml
asset: showcase-console.png
method: screenshot
slot: Console / Command Center
steps:
  - pnpm dev / uvicorn ...
  - open URL ...
  - Playwright fullPage or clip
quality_bar: references/showcase/saas-dashboard-prodly.png
avoid: [AI mock UI, architecture diagram, invented pixels]
```

## 质量条（对标时检查）

- 颜色统一（主色 + 辅色 + 中性），无装饰噪点  
- 信息密度高但分区清晰（卡片 / 表 / 侧栏对齐）  
- 真实数据或约定 Demo 数据（本仓 Demo 纪律）  
- 圆角、间距、字重一致  

## 禁止

- 用 Features / Architecture 说明图冒充 Showcase  
- 文生图「假 Dashboard」当实机  
- Preview 与 Showcase 文件名/章节混用  
