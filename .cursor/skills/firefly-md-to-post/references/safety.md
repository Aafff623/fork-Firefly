# 边界（有脏源再读）

## 编码

- 统一 LF；title/slug/链接文案去掉 `FEFF`/ZWSP/软连字符  
- Mojibake：**不**静默二次解码；保留片段 + 报告 warn  
- 调试性「wrong encoding」说明默认不进正文  

## 链接 / HTML

| 处理 | 动作 |
|------|------|
| `javascript:` `data:text/html` `vbscript:` | 去掉 href → 纯文本标注 |
| `<script>`、`file:` iframe、`on*` | 删除 |
| tracking（`utm_*` `fbclid` `gclid` `spm`…） | 只剥参数，**保留** host+path |
| 嵌套畸形链 | 拆成安全链接或纯文本+一 URL |
| 缺 def 引用/脚注 | 降级纯文本 + warn，勿发明 URL |
| `../foo.md` | `[[foo]]` 或 `/posts/foo/`（按文件名） |
| 允许 HTML | `a[http(s)]` `img` `details` 文档化 iframe/video/audio |

## 结构

多块 FM→重建一块；`draft:false`+口令→强制 `draft:true`+password；未闭合围栏就地修或把**原文**隔离进 code；缺失 `![[Pasted…]]`→删+warn；列表/宽表可截断但留缩减版。

## 保真

禁止只写「已处理」却删光样本。危险 payload 可删；mojibake、业务 URL、坏围栏原文须仍可辨认。
