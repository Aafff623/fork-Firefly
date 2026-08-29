---
title: "Spring AI核心API与统一接口"
published: 2026-08-25
description: "Spring AI的统一接口是其最核心的竞争力，它通过抽象出通用的API层，屏蔽了不同大模型、向量数据库的底层差异，让Java开发者可以面向接口编程，无需关心具体的AI服务实现。这部分内容是Sprin…"
image: ''
tags: [Spring AI, AI, 人工智能]
category: 指南
collections: [java-fullstack, java-fullstack-ai-cloud]
draft: false
lang: ''
slug: java-course22-3-1
pinned: false
comment: true
---

Spring AI的统一接口是其最核心的竞争力，它通过抽象出通用的API层，屏蔽了不同大模型、向量数据库的底层差异，让Java开发者可以面向接口编程，无需关心具体的AI服务实现。这部分内容是Spring AI的“骨架”，掌握它就掌握了Spring AI的核心使用逻辑。

## 一、核心接口的设计思路：从“碎片化调用”到“标准化抽象”
在Spring AI出现之前，调用不同大模型的流程是这样的：
- 调用OpenAI：使用`OpenAIClient`，传入`OpenAIChatRequest`，处理`OpenAIChatResponse`。
- 调用通义千问：使用`DashScopeClient`，传入`DashScopeChatRequest`，处理`DashScopeChatResponse`。
- 问题：每个模型的请求参数、响应结构、认证方式都不同，代码耦合度高，切换模型需重写大量代码。

Spring AI的解决思路是：
1. 抽象核心能力：将AI服务的核心能力（对话、嵌入计算、文本补全）抽象为通用接口。
2. 统一请求/响应模型：定义标准化的`Request`/`Response`对象，适配所有模型的参数与返回值。
3. 实现层适配：不同AI服务的SDK由框架底层适配，开发者只需依赖接口即可。

简单来说，这个设计思路和Spring Data的`Repository`接口、Spring Cloud的`LoadBalancerClient`接口是一致的——接口定义行为，实现层处理具体细节。

## 二、Spring AI的核心接口体系
Spring AI的核心接口主要分为三大类，覆盖了大模型的主流使用场景：对话交互、文本嵌入、文本补全（已逐步融合到对话接口中）。还有配套的提示词、响应处理等辅助接口。

### 1. 核心接口一：`ChatClient`（对话客户端，最常用）
`ChatClient`是Spring AI中最核心的接口，用于与大语言模型（LLM）进行对话交互，支持同步调用、流式调用、多轮对话，适配所有支持对话的大模型（OpenAI GPT、通义千问、文心一言等）。

#### （1）`ChatClient`核心方法
```java
public interface ChatClient {
    // 同步调用：发送单个提示词，返回完整响应
    ChatResponse call(Prompt prompt);

    // 流式调用：返回响应流（适配SSE，前端实时展示）
    default Flux<ChatResponse> stream(Prompt prompt) {
        return Flux.empty();
    }

    // 简化方法：直接传入字符串提示词，返回响应内容（语法糖）
    default String call(String message) {
        return call(new Prompt(message)).getResult().getOutput().getContent();
    }
}
```

#### （2）关键参数说明
- `Prompt`：提示词对象，是向大模型发送的“请求体”，包含：
  - `List<Message>`：消息列表，支持多轮对话（如用户消息、助手消息、系统消息）。
  - `Map<String, Object>`：模型参数（如温度、最大令牌数、顶采样等）。
- `ChatResponse`：对话响应对象，是大模型返回的“响应体”，包含：
  - `List<ChatResult>`：响应结果列表（通常为单个结果）。
  - `Metadata`：响应元数据（如令牌使用量、模型版本、响应时间）。
- `ChatResult`：单个响应结果，包含`Generation`（生成的内容）和`Metadata`。

#### （3）消息类型（`Message`）
多轮对话的核心是消息类型的管理，Spring AI定义了标准化的消息类型：
| 消息类型          | 作用                                                                 |
|-------------------|----------------------------------------------------------------------|
| `UserMessage`     | 用户发送的消息（如“写一个Spring Boot接口”）|
| `AssistantMessage`| 大模型返回的消息（助手回复）|
| `SystemMessage`   | 系统提示词（如“你是一个Java开发助手，回答简洁明了”）|
| `ToolMessage`     | 工具调用的返回消息（函数调用时使用）|

### 2. 核心接口二：`EmbeddingClient`（嵌入客户端）
`EmbeddingClient`用于将文本转换为向量（Embedding），是实现语义搜索、RAG（检索增强生成）的核心接口，适配所有支持嵌入计算的模型（如OpenAI text-embedding-3-small、通义千问embedding-v1）。

#### （1）`EmbeddingClient`核心方法
```java
public interface EmbeddingClient {
    // 批量将文本转换为向量
    EmbeddingResponse embed(List<String> texts);

    // 简化方法：单个文本转换为向量（语法糖）
    default EmbeddingResponse embed(String text) {
        return embed(List.of(text));
    }

    // 计算两个文本的相似度（语法糖）
    default double similarity(String text1, String text2) {
        EmbeddingResponse response1 = embed(text1);
        EmbeddingResponse response2 = embed(text2);
        return cosineSimilarity(response1.getEmbeddings().get(0).getValues(), 
                                response2.getEmbeddings().get(0).getValues());
    }
}
```

#### （2）关键参数说明
- `EmbeddingResponse`：嵌入响应对象，包含：
  - `List<Embedding>`：向量列表，每个`Embedding`包含`List<Double>`类型的向量值。
  - `Metadata`：元数据（如令牌使用量、模型版本）。
- 相似度计算：框架内置了余弦相似度计算方法，可直接用于语义匹配。

### 3. 辅助接口：`PromptTemplate`（提示词模板）
`PromptTemplate`是提示词工程的核心工具，用于实现参数化提示词，避免硬编码提示词，提升代码复用性。

#### （1）核心用法
```java
// 定义模板（参数用{变量名}表示）
String template = "生成一篇关于{topic}的Java教程，字数{wordCount}字，风格{style}";
PromptTemplate promptTemplate = new PromptTemplate(template);

// 填充参数
Map<String, Object> params = Map.of(
    "topic", "Spring AI",
    "wordCount", 500,
    "style", "通俗易懂"
);
Prompt prompt = promptTemplate.create(params);

// 调用大模型
String response = chatClient.call(prompt);
```

## 三、统一接口的核心特性：“一次编码，多模型适配”
Spring AI的统一接口最核心的价值在于模型无关性，即切换大模型时，业务代码无需修改，仅需调整配置和依赖。以下通过OpenAI切换到通义千问的示例，展示这一特性。

### 步骤1：调用OpenAI（初始实现）
#### （1）引入依赖
```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-openai-spring-boot-starter</artifactId>
    <version>0.8.1</version>
</dependency>
```

#### （2）配置application.yml
```yaml
spring:
  ai:
    openai:
      api-key: your-openai-api-key
      chat:
        model: gpt-3.5-turbo
        temperature: 0.7 # 模型参数
```

#### （3）业务代码
```java
@RestController
public class AiController {
    @Autowired
    private ChatClient chatClient;

    @GetMapping("/ai/chat")
    public String chat(@RequestParam String message) {
        // 1. 构建系统提示词（多轮对话示例）
        List<Message> messages = List.of(
            new SystemMessage("你是一个Java开发助手，回答简洁明了"),
            new UserMessage(message)
        );
        Prompt prompt = new Prompt(messages);
        // 2. 调用大模型（统一接口）
        return chatClient.call(prompt).getResult().getOutput().getContent();
    }

    // 流式调用示例（SSE）
    @GetMapping(value = "/ai/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> stream(@RequestParam String message) {
        Prompt prompt = new Prompt(new UserMessage(message));
        return chatClient.stream(prompt)
                .map(response -> response.getResult().getOutput().getContent());
    }
}
```

### 步骤2：切换到通义千问（仅改配置和依赖，代码不变）
#### （1）替换依赖
```xml
<!-- 移除OpenAI依赖，引入Spring AI Alibaba通义千问依赖 -->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-ai-alibaba-dashscope-spring-boot-starter</artifactId>
    <version>0.1.0</version>
</dependency>
```

#### （2）修改配置application.yml
```yaml
spring:
  ai:
    alibaba:
      dashscope:
        api-key: your-aliyun-dashscope-api-key # 阿里云通义千问API Key
        chat:
          model: qwen-plus # 通义千问模型
          temperature: 0.7 # 模型参数（与OpenAI一致，框架自动适配）
```

#### （3）业务代码：完全无需修改
启动项目后，访问相同的接口，即可调用通义千问模型，这就是统一接口的威力。

## 四、核心API的进阶使用场景
### 1. 多轮对话（上下文管理）
通过`List<Message>`维护对话上下文，实现连续的多轮交互：
```java
@GetMapping("/ai/multi-chat")
public String multiChat(@RequestParam String message, @RequestParam(required = false) String sessionId) {
    // 模拟从Redis中获取会话上下文（生产环境需用Redis/数据库存储）
    List<Message> messages = new ArrayList<>();
    // 初始系统消息
    messages.add(new SystemMessage("你是一个Java开发助手，回答简洁明了"));
    // 历史消息（模拟）
    messages.add(new UserMessage("什么是Spring AI？"));
    messages.add(new AssistantMessage("Spring AI是Spring官方的AI工程化框架..."));
    // 新的用户消息
    messages.add(new UserMessage(message));

    Prompt prompt = new Prompt(messages);
    return chatClient.call(prompt).getResult().getOutput().getContent();
}
```

### 2. 流式响应（SSE适配前端）
通过`stream`方法实现流式输出，前端可实时接收大模型的回复：
```java
@GetMapping(value = "/ai/stream-chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<String> streamChat(@RequestParam String message) {
    Prompt prompt = new Prompt(new UserMessage(message));
    return chatClient.stream(prompt)
            .map(response -> response.getResult().getOutput().getContent())
            .onErrorResume(e -> Flux.just("发生错误：" + e.getMessage()));
}
```

### 3. 嵌入计算与语义相似度
使用`EmbeddingClient`计算文本向量并判断相似度：
```java
@RestController
public class EmbeddingController {
    @Autowired
    private EmbeddingClient embeddingClient;

    @GetMapping("/ai/similarity")
    public double similarity(@RequestParam String text1, @RequestParam String text2) {
        // 直接调用框架内置的相似度计算方法
        return embeddingClient.similarity(text1, text2);
    }

    @GetMapping("/ai/embed")
    public List<Double> embed(@RequestParam String text) {
        // 获取文本的向量值
        return embeddingClient.embed(text)
                .getEmbeddings()
                .get(0)
                .getValues();
    }
}
```

## 五、统一接口的扩展：自定义客户端（进阶）
如果需要适配企业私有部署的大模型（如本地部署的Llama 2），可以实现`ChatClient`接口，自定义客户端：
```java
@Component
public class CustomLlmChatClient implements ChatClient {
    // 注入私有模型的SDK客户端
    @Autowired
    private CustomLlmClient customLlmClient;

    @Override
    public ChatResponse call(Prompt prompt) {
        // 1. 转换Spring AI的Prompt为私有模型的请求参数
        String promptText = prompt.getMessages().stream()
                .map(Message::getContent)
                .collect(Collectors.joining("\n"));
        // 2. 调用私有模型
        String responseText = customLlmClient.generate(promptText);
        // 3. 转换为Spring AI的ChatResponse返回
        Generation generation = new Generation(responseText);
        ChatResult chatResult = new ChatResult(generation);
        return new ChatResponse(List.of(chatResult));
    }

    // 实现流式调用（可选）
    @Override
    public Flux<ChatResponse> stream(Prompt prompt) {
        // 自定义流式处理逻辑
        return Flux.just(new ChatResponse(List.of(new ChatResult(new Generation("流式响应...")))));
    }
}
```
这样，业务代码可以直接注入`ChatClient`，无需关心是公有模型还是私有模型。


### 总结
1. 核心接口是Spring AI的灵魂：`ChatClient`（对话）和`EmbeddingClient`（嵌入）是最核心的两个接口，覆盖了大模型的主流使用场景，所有模型适配都基于这两个接口实现。
2. 统一接口的核心价值是“模型无关性”：切换大模型仅需修改依赖和配置，业务代码零改动，实现“一次编码，多模型适配”。
3. 配套工具提升开发效率：`PromptTemplate`（参数化提示词）、内置的相似度计算、流式响应等功能，简化了AI功能的开发。
4. 接口可扩展：支持自定义客户端，适配企业私有部署的大模型，满足个性化需求。

这些核心API和统一接口用熟了，Spring AI 的各类功能就能灵活调起来，后面做项目实战会顺手很多。
