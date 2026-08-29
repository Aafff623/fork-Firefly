---
title: "全量适配国内主流大模型（零代码切换）"
published: 2026-08-25
description: "Spring AI Alibaba的首要本土化能力是对国内大模型的无缝适配，基于Spring AI的ChatClient/EmbeddingClient统一接口，实现“一次编码，多国内模型切换”，无需…"
image: ''
tags: [Spring AI, AI, 人工智能]
category: 指南
collections: [java-fullstack, java-fullstack-ai-cloud]
draft: false
lang: ''
slug: java-course22-4-1
pinned: false
comment: true
---

Spring AI Alibaba的首要本土化能力是对国内大模型的无缝适配，基于Spring AI的`ChatClient`/`EmbeddingClient`统一接口，实现“一次编码，多国内模型切换”，无需针对不同模型的SDK重写代码。

### 1. 支持的核心国内模型
| 模型类型       | 具体模型                                                                 | 适用场景                     |
|----------------|--------------------------------------------------------------------------|------------------------------|
| 大语言模型（LLM） | 通义千问（Qwen-turbo/Qwen-plus/Qwen-max）、阿里云百炼定制模型             | 对话交互、文本生成、函数调用 |
| 嵌入模型（Embedding） | 通义千问Embedding-v1、阿里云百炼嵌入模型                                 | 语义搜索、RAG、相似度计算   |
| 多模态模型     | 通义千问VL（图文交互）、阿里云视觉大模型（文生图/图生文）                 | 图片识别、图文生成           |

### 2. 实战：调用通义千问大模型（仅需配置+依赖）
#### （1）引入依赖
```xml
<!-- Spring AI Alibaba核心依赖（通义千问/百炼平台） -->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-ai-alibaba-dashscope-spring-boot-starter</artifactId>
    <version>0.1.0</version> <!-- 建议使用最新版本 -->
</dependency>
```

#### （2）配置阿里云API Key
```yaml
spring:
  ai:
    alibaba:
      dashscope:
        # 阿里云DashScope API Key（从阿里云百炼平台/灵积平台获取）
        api-key: your-aliyun-dashscope-api-key
        chat:
          # 通义千问模型版本（可选：qwen-turbo/qwen-plus/qwen-max/qwen-vl）
          model: qwen-plus
          # 生成温度（0-1，值越大越随机）
          temperature: 0.7
          # 上下文窗口大小（通义千问plus默认8k，max支持32k）
          max-tokens: 8192
        embedding:
          # 通义千问嵌入模型
          model: text-embedding-v1
```

#### （3）业务代码（与Spring AI完全一致，零改动）
```java
import org.springframework.ai.chat.ChatClient;
import org.springframework.ai.chat.embedding.EmbeddingClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class QwenController {

    // 自动注入适配通义千问的ChatClient
    @Autowired
    private ChatClient chatClient;

    // 自动注入适配通义千问的EmbeddingClient
    @Autowired
    private EmbeddingClient embeddingClient;

    /**
     * 通义千问对话接口
     */
    @GetMapping("/ai/qwen/chat")
    public String chat(@RequestParam String message) {
        return chatClient.call(new Prompt(message)).getResult().getOutput().getContent();
    }

    /**
     * 通义千问嵌入计算（文本转向量）
     */
    @GetMapping("/ai/qwen/embed")
    public double similarity(@RequestParam String text1, @RequestParam String text2) {
        // 直接调用框架内置的相似度计算方法
        return embeddingClient.similarity(text1, text2);
    }
}
```

#### （4）关键说明
- 统一接口兼容：Spring AI Alibaba的`ChatClient`完全遵循Spring AI的核心抽象，因此之前基于Spring AI开发的代码（如对话、嵌入、函数调用）可以零改动迁移到通义千问。
- 模型参数适配：框架自动将Spring AI的标准参数（如`temperature`、`max-tokens`）转换为国内模型的对应参数，无需开发者关注参数差异。

### 3. 进阶：支持阿里云百炼定制模型
阿里云百炼平台允许企业基于通义千问微调专属模型（如金融行业模型、电商客服模型），Spring AI Alibaba可直接调用这些定制模型，仅需修改配置：
```yaml
spring:
  ai:
    alibaba:
      dashscope:
        api-key: your-api-key
        chat:
          # 替换为百炼定制模型的ID
          model: your-custom-model-id
          # 定制模型的专属参数（框架自动传递）
          parameters:
            top_p: 0.8
```
