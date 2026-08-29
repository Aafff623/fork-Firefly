---
title: "定义AI文案生成服务接口"
published: 2026-08-25
description: "定义AI文案生成服务接口src/main/java/com/example/rednote/aimicroservice/application/service/AiCopywritingService…"
image: ''
tags: [AI, 实战, 融合]
category: 指南
collections: [java-fullstack, java-fullstack-ai-cloud]
draft: false
lang: ''
slug: java-course23-2-3
pinned: false
comment: true
---

### 定义AI文案生成服务

定义AI文案生成服务接口`src/main/java/com/example/rednote/aimicroservice/application/service/AiCopywritingService.java`：

```java
package com.example.rednote.aimicroservice.application.service;

/**
 * AiCopywritingService AI文案生成服务
 *
 * @version 2025/08/03
 **/
public interface AiCopywritingService {
    /**
     * 生成文案
     *
     * @param prompt
     * @return
     */
    String generate(String prompt);

    /**
     * 构建提示词（复用前文逻辑）
     *
     * @param type
     * @param keywords
     * @return
     */
    String buildPrompt(String type, String keywords);
}
```


接口实现AiCopywritingServiceImpl如下：


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
 * AiCopywritingServiceImpl AI文案生成服务
 *
 * @version 2025/08/03
 **/
@Service
public class AiCopywritingServiceImpl implements AiCopywritingService {
    // 注入Spring AI 统一的ChatClient
    private final ChatClient chatClient;

    // 构造注入（无需手动创建客户端）
    public AiCopywritingServiceImpl(ChatModel chatModel) {
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

    // 生成文案
    @Override
    public String generate(String prompt) {
        // 1. 构建提示词
        Prompt aiPrompt = new Prompt(prompt);

        // 2. 调用AI模型
        ChatResponse response = chatClient.prompt(aiPrompt).call().chatResponse();

        // 3. 提取生成结果
        return response.getResult().getOutput().getText();
    }

    @Override
    public String buildPrompt(String type, String keywords) {
        return "请生成一篇小红书风格的" + type + "笔记文案，要求：" +
                "1. 标题吸引人，带emoji；" +
                "2. 正文分3-4行，每句不超过20字；" +
                "3. 结合关键词：" + keywords + "。";
    }
}
```


### 编写测试用例

新增测试用例`src/test/java/com/example/rednote/aimicroservice/application/service/AiCopywritingServiceTests.java`

```java
package com.example.rednote.aimicroservice.application.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class AiCopywritingServiceTests {

    @Autowired
    private AiCopywritingService aiCopywritingService;

    @Test
    void testCopywriting() {
        // 1. 构建提示词
        String prompt = aiCopywritingService.buildPrompt("职场", "Java、开发、编程");

        // 2. 调用生成服务（已自动处理缓存、API调用、错误处理）
        String result = aiCopywritingService.generate(prompt);

        System.out.println(result);

        assertNotNull(result);
    }

}
```


运行测试，效果如下：

```
💻Java开发日常｜写给所有编程女孩的成长笔记✨

每天和bug斗智斗勇💪  
代码写得优雅，职场走得更稳🚀  
Java不止是编程，更是逻辑的艺术🎨  
认真敲下的每一行，都是未来的底气💼
```
