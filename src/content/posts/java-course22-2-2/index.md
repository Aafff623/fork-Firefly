---
title: "Spring AI核心介绍"
published: 2026-08-25
description: "Spring AI是Spring官方推出的AI工程化框架，诞生于2023年，隶属于Spring生态体系，其核心目标是将Spring生态的“约定优于配置”“依赖注入”“模块化”等设计思想迁移到AI领域，…"
image: ''
tags: [Spring AI, AI, 人工智能]
category: 指南
collections: [java-fullstack, java-fullstack-ai-cloud]
draft: false
lang: ''
slug: java-course22-2-2
pinned: false
comment: true
---

Spring AI是Spring官方推出的AI工程化框架，诞生于2023年，隶属于Spring生态体系，其核心目标是将Spring生态的“约定优于配置”“依赖注入”“模块化”等设计思想迁移到AI领域，解决Java项目整合AI大模型时的接口碎片化、生态耦合度低、工程化能力不足等痛点，让Java开发者能以熟悉的方式快速集成AI功能。

## 一、Spring AI的诞生背景与核心定位
### 1. 诞生背景：Java整合AI的痛点催生Spring AI
在Spring AI出现之前，Java开发者整合AI大模型主要面临以下问题：
- 接口不统一：OpenAI、通义千问、文心一言等大模型的API接口、参数、认证方式差异巨大，切换模型需重写大量代码。
- 与Spring生态脱节：原生SDK调用大模型时，无法利用Spring Boot的自动配置、依赖注入、配置化管理等能力，代码耦合度高。
- 工程化能力缺失：缺乏对提示词模板、上下文管理、函数调用、向量数据库的标准化支持，需手动封装大量工具类。
- 高并发适配难：直接调用大模型API时，难以结合Spring的异步处理、限流、缓存等能力，高并发场景下易出现性能问题。

Spring AI的出现，正是为了填补这一空白——将AI能力“Spring化”，让AI集成像使用Spring Boot开发接口一样简单。

### 2. 核心定位：AI能力的“Spring Boot”
Spring AI的核心定位可以概括为：
> 为Java生态提供标准化、工程化的AI集成框架，屏蔽不同AI服务的底层差异，让开发者以声明式、配置化的方式在Spring应用中集成AI功能（LLM对话、文本生成、嵌入计算、向量数据库交互等），并与Spring Boot、Spring Cloud、Spring Data等生态组件无缝协同。

简单来说，Spring AI就是AI领域的Spring Boot：它不生产AI模型，而是成为AI模型与Java应用之间的“桥梁”，并提供工程化的配套能力。

### 3. Spring AI的核心优势（对比原生SDK/第三方框架）
| 特性                | 原生大模型SDK（如OpenAI SDK） | LangChain4J（Java版LangChain） | Spring AI                          |
|---------------------|--------------------------------|---------------------------------|------------------------------------|
| Spring生态整合度    | 极低（无适配）| 中等（部分适配）| 极高（原生Spring生态，支持自动配置、依赖注入） |
| 统一接口支持        | 仅支持单一模型                | 支持多模型，但接口封装较复杂    | 极简统一接口（ChatClient/EmbeddingClient），切换模型仅改配置 |
| 配置化管理          | 硬编码API Key/参数            | 部分支持配置化                  | 完全支持Spring Boot配置化（application.yml） |
| 工程化能力          | 无（仅提供调用能力）| 中等（侧重AI逻辑编排）| 极高（整合缓存、异步、限流、监控等Spring能力） |
| 本土化模型支持      | 需手动适配国内模型            | 部分支持，需额外依赖            | 通过Spring AI Alibaba无缝支持通义千问等国内模型 |
| 学习成本            | 低，但适配成本高              | 高（需学习LangChain概念）| 低（Java开发者可直接复用Spring知识） |

## 二、Spring AI的核心设计理念
Spring AI延续了Spring生态的核心设计理念，同时结合AI场景做了针对性优化，核心理念包括：

### 1. 统一抽象（Unified Abstraction）
这是Spring AI最核心的设计理念。它为不同的AI服务提供标准化的接口，开发者面向接口编程，而非具体的模型实现。
- 例如：无论是调用OpenAI的GPT-3.5，还是通义千问的Qwen-7B，都使用同一个`ChatClient`接口，底层实现由框架自动适配。
- 价值：实现“一次编码，多模型适配”，切换模型时仅需修改配置文件，无需改动业务代码。

### 2. 约定优于配置（Convention Over Configuration）
Spring AI遵循Spring Boot的“约定优于配置”原则，提供大量默认配置，开发者只需少量配置即可快速启动AI功能。
- 例如：引入OpenAI依赖后，仅需在`application.yml`中配置API Key，框架会自动创建`ChatClient`实例，无需手动new对象。
- 价值：降低开发门槛，减少样板代码。

### 3. 模块化与可插拔（Modularity & Pluggability）
Spring AI采用模块化设计，核心功能与第三方集成解耦，开发者可按需引入依赖。
- 核心模块：`spring-ai-core`（核心抽象）、`spring-ai-chat`（对话功能）、`spring-ai-embedding`（嵌入计算）。
- 第三方模块：`spring-ai-openai`（OpenAI集成）、`spring-ai-milvus`（Milvus向量数据库集成）、`spring-ai-alibaba`（阿里云AI集成）。
- 价值：按需加载，减小应用体积，便于扩展。

### 4. 与Spring生态无缝协同（Seamless Spring Integration）
Spring AI深度整合Spring生态的核心组件，让AI功能能与现有业务系统自然融合：
- 与Spring Boot整合：支持自动配置、配置绑定、Actuator监控。
- 与Spring Cloud整合：支持微服务架构下的AI能力封装、服务发现、限流。
- 与Spring Data整合：支持向量数据库的Repository风格操作（如`VectorStoreRepository`）。
- 价值：AI功能可直接融入现有Java项目，无需重构系统。

## 三、Spring AI的生态体系与核心模块
Spring AI的生态体系分为核心层、集成层、应用层三个层次，每层包含不同的模块，共同构成完整的AI集成能力。

### 1. 核心层（Core Layer）：框架的基础能力
核心层是Spring AI的灵魂，提供标准化的抽象接口和基础工具，不依赖具体的AI服务，主要模块包括：
- spring-ai-core：核心模块，定义了`ChatClient`（对话客户端）、`EmbeddingClient`（嵌入客户端）、`Prompt`（提示词）、`Response`（响应）等核心接口，以及提示词模板、上下文管理等基础工具。
- spring-ai-context：上下文管理模块，支持多轮对话的上下文保存与加载（如基于Redis的上下文存储）。
- spring-ai-util：工具类模块，提供JSON解析、异常处理、参数校验等通用工具。

#### 核心接口示例（理解统一抽象）
```java
// 对话客户端核心接口：所有大模型的对话功能都实现此接口
public interface ChatClient {
    // 同步调用大模型，返回响应
    ChatResponse call(ChatRequest request);
    // 流式调用大模型，返回响应流（适配SSE）
    Flux<ChatResponse> stream(ChatRequest request);
}

// 嵌入客户端核心接口：所有大模型的嵌入计算都实现此接口
public interface EmbeddingClient {
    // 将文本转换为向量
    EmbeddingResponse embed(List<String> texts);
}
```

### 2. 集成层（Integration Layer）：对接外部AI服务与存储
集成层是核心层的具体实现，对接各类大模型、向量数据库、云AI服务，开发者可按需引入对应的依赖，主要包括：
- 大模型集成：`spring-ai-openai`（OpenAI/GPT）、`spring-ai-azure-openai`（Azure OpenAI）、`spring-ai-alibaba`（通义千问/阿里云AI）、`spring-ai-baidu`（文心一言）、`spring-ai-huggingface`（Hugging Face模型）。
- 向量数据库集成：`spring-ai-milvus`（Milvus）、`spring-ai-redis`（Redis Vector）、`spring-ai-pinecone`（Pinecone）、`spring-ai-weaviate`（Weaviate）。
- 数据处理集成：`spring-ai-tika`（文档解析）、`spring-ai-pdf`（PDF处理）、`spring-ai-image`（图片处理）。

### 3. 应用层（Application Layer）：高阶AI能力与场景化封装
应用层基于核心层和集成层，提供高阶的AI能力和场景化的封装，简化复杂AI场景的开发，主要包括：
- spring-ai-function-calling：函数调用模块，支持大模型自动触发Java方法调用（如查询数据库、调用第三方API）。
- spring-ai-retrieval-augmented-generation：RAG（检索增强生成）模块，封装“文档加载→嵌入生成→向量检索→大模型生成”的完整流程，快速实现语义搜索。
- spring-ai-spring-boot-starter：Spring Boot启动器，提供自动配置、健康检查、指标监控等能力。

## 四、Spring AI与Spring AI Alibaba的关系
在学习Spring AI时，很多开发者会混淆Spring AI与Spring AI Alibaba，这里明确两者的关系：
1. Spring AI：是核心框架，由Spring官方维护，主要支持国外主流大模型（OpenAI、Azure OpenAI）和通用向量数据库，是基础底座。
2. Spring AI Alibaba：是阿里云基于Spring AI扩展的本土化框架，由阿里云团队维护，核心是适配国内生态：
   - 集成阿里云AI服务：通义千问（Qwen）、阿里云视觉AI、语音AI、百炼平台。
   - 适配阿里云基础设施：OSS（文件存储）、RDS（数据库）、NAS（分布式存储）。
   - 解决本土化问题：数据合规、国产化服务器适配、阿里云AccessKey管理。
3. 关系总结：Spring AI Alibaba是Spring AI的“本土化插件”，依赖Spring AI的核心抽象，为国内开发者提供更贴合本土场景的AI集成能力。

## 五、快速体验：第一个Spring AI程序（核心概念落地）
为了让你直观感受Spring AI的核心能力，这里给出一个最简单的Spring AI demo，实现调用OpenAI的GPT-3.5进行对话：
### 1. 环境准备
- JDK 17+（Spring AI要求Spring Boot 3.x，需JDK 17+）
- Maven/Gradle
- OpenAI API Key（需注册OpenAI账号获取）

### 2. 引入依赖（pom.xml）
```xml
<dependencies>
    <!-- Spring Boot Starter Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <!-- Spring AI OpenAI依赖 -->
    <dependency>
        <groupId>org.springframework.ai</groupId>
        <artifactId>spring-ai-openai-spring-boot-starter</artifactId>
        <version>0.8.1</version> <!-- 请使用最新版本 -->
    </dependency>
</dependencies>
```

### 3. 配置OpenAI API Key（application.yml）
```yaml
spring:
  ai:
    openai:
      api-key: your-openai-api-key # 替换为你的OpenAI API Key
      chat:
        model: gpt-3.5-turbo # 默认模型
```

### 4. 编写业务代码
```java
import org.springframework.ai.chat.ChatClient;
import org.springframework.ai.chat.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AiController {

    // 自动注入Spring AI创建的ChatClient实例（无需手动创建）
    @Autowired
    private ChatClient chatClient;

    @GetMapping("/ai/chat")
    public String chat(@RequestParam String message) {
        // 1. 构建提示词
        Prompt prompt = new Prompt(message);
        // 2. 调用大模型（统一接口，切换模型无需改代码）
        ChatResponse response = chatClient.call(prompt);
        // 3. 返回结果
        return response.getResult().getOutput().getContent();
    }
}
```

### 5. 测试
启动项目后，访问`http://localhost:8080/ai/chat?message=写一个Spring Boot的Hello World程序`，即可得到GPT-3.5返回的代码结果。

关键亮点：整个过程中，你没有写任何与OpenAI SDK相关的代码，仅通过依赖引入和配置，就实现了大模型调用，这正是Spring AI的核心价值。


### 总结
1. 核心定位：Spring AI是Spring官方的AI工程化框架，核心是为Java应用提供标准化、低耦合的AI集成能力，让AI功能的开发像Spring Boot接口开发一样简单。
2. 核心设计：基于统一抽象、约定优于配置、模块化的设计理念，深度整合Spring生态，实现“一次编码，多模型适配”。
3. 生态体系：分为核心层（基础抽象）、集成层（对接外部AI服务）、应用层（高阶AI能力），覆盖从简单对话到复杂RAG的全场景。
4. 本土化延伸：Spring AI Alibaba是Spring AI的本土化扩展，解决国内大模型（通义千问）、阿里云服务的集成问题，是国内开发者的首选。

这些知识点串起来，Spring AI 的整体轮廓就清楚了，后面看核心功能和实战开发会顺很多。
