---
title: "定义AI评论生成服务接口"
published: 2026-08-25
description: "定义AI评论生成服务接口src/main/java/com/example/rednote/aimicroservice/application/service/AiCommentService.jav…"
image: ''
tags: [AI, 实战, 融合]
category: 指南
collections: [java-fullstack, java-fullstack-ai-cloud]
draft: false
lang: ''
slug: java-course23-3-2
pinned: false
comment: true
---

### 定义AI评论生成服务

定义AI评论生成服务接口`src/main/java/com/example/rednote/aimicroservice/application/service/AiCommentService.java`：

```java
package com.example.rednote.aimicroservice.application.service;

/**
 * AiCopywritingService AI评论生成服务
 *
 * @version 2025/08/03
 **/
public interface AiCommentService {
    /**
     * 生成评论建议
     *
     * @param prompt
     * @return
     */
    String generate(String prompt);

    /**
     * 构建提示词
     *
     * @param type
     * @param content
     * @return
     */
    String buildPrompt(String type, String content);
}
```


接口实现AiCommentServiceImpl如下：


```java
package com.example.rednote.aimicroservice.application.service;

import com.alibaba.cloud.ai.dashscope.chat.DashScopeChatOptions;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

/**
 * AiCommentServiceImpl AI评论生成服务
 *
 * @version 2025/08/03
 **/
@Service
public class AiCommentServiceImpl implements AiCommentService {
    // 注入Spring AI 统一的ChatClient
    private final ChatClient chatClient;

    // 构造注入（无需手动创建客户端）
    public AiCommentServiceImpl(ChatModel chatModel) {
        // 构造时，可以设置 ChatClient 的参数
        // {@link org.springframework.ai.chat.client.ChatClient};
        this.chatClient = ChatClient.builder(chatModel)
                // 实现 Logger 的 Advisor
                .defaultAdvisors(
                        new SimpleLoggerAdvisor()
                )
                // 设置 ChatClient 中 ChatModel 的 Options 参数
                .defaultOptions(
                        DashScopeChatOptions.builder()
                                .withTopP(0.7)
                                .build()
                )
                .build();
    }

    // 生成评论
    @Override
    public String generate(String prompt) {
        // 1. 构建提示词
        Prompt aiPrompt = new Prompt(prompt);

        // 2. 调用AI模型
        ChatResponse response = chatClient.prompt(aiPrompt).call().chatResponse();

        // 3. 提取生成结果
        String text = response.getResult().getOutput().getText();

        return text;
    }

    @Override
    public String buildPrompt(String type, String content) {
        return "请为以下笔记生成" + type + "风格的评论建议，要求：" +
                "1. 笔记内容为：" + content   + "。" +
                "2. 每条评论不超过20字，带emoji，符合年轻人语气，不要重复。" +
                "3. 提供共3-5条评论。除了评论内容外，不要有其他多余的内容。评论条目前面不要加序号";
    }
}
```


### 编写测试用例

新增测试用例`src/test/java/com/example/rednote/aimicroservice/application/service/AiCommentServiceTests.java`

```java
package com.example.rednote.aimicroservice.application.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class AiCommentServiceTests {

    @Autowired
    private AiCommentService aiCommentService;

    @Test
    void testComment() {
        // 1. 构建提示词
        String prompt = aiCommentService.buildPrompt("职场", "Java在企业级应用开发中占有不可替代的地位。");

        // 2. 调用生成服务（已自动处理缓存、API调用、错误处理）
        String result = aiCommentService.generate(prompt);

        System.out.println(result);

        assertNotNull(result);
    }

}
```


运行测试，效果如下：

```
Java稳如老狗，企业级开发还得靠它 🐶  
大厂都在用，Java真香警告！🔥  
后端王者，不服来辩 🙌  
想进名企？Java必须拿下 💪  
虽老但强，生态太成熟了 🌱
```
