---
title: "提示词工程与Spring AI的整合"
published: 2026-08-25
description: "提示词工程是Spring AI连接业务意图与大模型能力的核心纽带，其整合逻辑在于以模板化+结构化消息+可插拔增强的方式，解决提示词硬编码、上下文管理混乱、多轮对话失控、输出格式不可控四大问题，同时与S…"
image: ''
tags: [Spring AI, AI, 人工智能]
category: 指南
collections: [java-fullstack, java-fullstack-ai-cloud]
draft: false
lang: ''
slug: java-course22-3-2
pinned: false
comment: true
---

提示词工程是Spring AI连接业务意图与大模型能力的核心纽带，其整合逻辑在于以模板化+结构化消息+可插拔增强的方式，解决提示词硬编码、上下文管理混乱、多轮对话失控、输出格式不可控四大问题，同时与Spring生态深度融合，实现“一次设计、多模型适配”。以下从核心组件、工程化实践、进阶技巧与实战示例展开详解。


## 一、核心整合组件：从“字符串拼接”到“可维护组件”
Spring AI提供了Prompt/Message/PromptTemplate/Advisor四大核心组件，构建提示词工程的完整能力链，彻底告别硬编码。

### 1. 基础单元：`Prompt`与`Message`（结构化对话的基石）
`Prompt`是向模型发送的请求载体，`Message`是对话的最小单元，两者结合实现“角色清晰、上下文可追溯”的对话结构。
| 组件 | 核心作用 | 关键类型/用法 |
| :--- | :--- | :--- |
| `Message` | 定义对话角色与内容 | 系统消息（SystemMessage）：设置模型身份/规则（如“你是Java高级工程师，回答简洁规范”）；用户消息（UserMessage）：承载用户查询；助手消息（AssistantMessage）：存储模型历史回复；工具消息（ToolMessage）：接收工具调用结果（配合Function Calling） |
| `Prompt` | 封装完整对话上下文 | 由`List<Message>`+模型参数（temperature、maxTokens）组成，支持多轮对话与参数化配置 |

示例：构建结构化Prompt
```java
List<Message> messages = List.of(
    new SystemMessage("你是Java代码生成助手，输出必须包含完整类注释和单元测试"),
    new UserMessage("生成一个Spring Boot Controller，实现用户查询接口"),
    new AssistantMessage("已生成Controller，是否需要补充分页功能？"),
    new UserMessage("是的，需要PageHelper分页")
);
Prompt prompt = new Prompt(messages, ChatOptions.builder().temperature(0.3).build());
```

### 2. 核心工具：`PromptTemplate`（提示词的“模板引擎”）
`PromptTemplate`是提示词工程的生产力核心，支持参数化填充、模板复用、版本管理，适配Spring Resource抽象，可从文件/配置中心加载模板，解决硬编码与维护难题。
#### 核心能力
- 参数占位符：用`{变量名}`定义动态参数，支持Map/Bean填充。
- 模板加载：支持classpath文件（如`prompt/gen-code.st`）、远程配置（Nacos/Apollo）。
- 类型安全：配合Spring的`ConversionService`实现参数自动类型转换。

#### 实战代码
```java
// 1. 从字符串创建模板（适合简单场景）
String templateStr = "生成{language}语言的{function}函数，参数为{params}，返回类型{returnType}";
PromptTemplate template = new PromptTemplate(templateStr);

// 2. 从文件加载模板（适合复杂场景，classpath:prompt/gen-code.st）
PromptTemplate fileTemplate = new PromptTemplate(new ClassPathResource("prompt/gen-code.st"));

// 3. 填充参数并生成Prompt
Map<String, Object> params = Map.of(
    "language", "Java",
    "function", "calculateSum",
    "params", "int a, int b",
    "returnType", "int"
);
Prompt prompt = template.create(params);
```

### 3. 增强机制：`PromptAdvisor`（可插拔的提示词增强）
`PromptAdvisor`是Spring AI的“提示词拦截器”，支持在调用模型前/后注入逻辑，实现日志审计、敏感词过滤、上下文增强、输出格式校验等功能，适配企业级合规与工程化要求。
示例：实现敏感词过滤Advisor
```java
@Component
public class SensitiveWordAdvisor implements PromptAdvisor {
    @Autowired
    private SensitiveWordFilter filter;

    @Override
    public Prompt advise(Prompt prompt) {
        // 过滤用户消息中的敏感词
        List<Message> filteredMessages = prompt.getMessages().stream()
            .map(msg -> {
                if (msg instanceof UserMessage) {
                    String filteredContent = filter.filter(msg.getContent());
                    return new UserMessage(filteredContent);
                }
                return msg;
            }).collect(Collectors.toList());
        return new Prompt(filteredMessages, prompt.getOptions());
    }
}
```
通过`@Order`注解控制Advisor执行顺序，轻松组合多增强逻辑。


## 二、工程化实践：提示词的“生命周期管理”
Spring AI将提示词工程融入Spring生态，实现模板化、可配置、可监控、可复用的全生命周期管理，适配企业级开发流程。

### 1. 模板管理：从“代码内嵌”到“配置化+版本化”
- 配置中心集成：将模板存储在Nacos/Apollo，支持动态更新，无需重启服务。
- 版本控制：通过文件名或配置前缀区分版本（如`prompt/gen-code-v1.st`），适配灰度发布。
- 多环境适配：通过`application-{profile}.yml`配置不同环境的模板参数，如开发环境用测试模型，生产环境用正式模型。

### 2. 上下文管理：多轮对话的“记忆机制”
多轮对话的核心是上下文维护，Spring AI提供两种管理方式：
1.  内存式上下文：适合短会话，用`List<Message>`存储历史消息，注意控制token上限（避免超出模型上下文窗口）。
2.  持久化上下文：适合长会话，将`Message`序列化为JSON存储在Redis，通过`sessionId`关联，示例：
```java
@Autowired
private StringRedisTemplate redisTemplate;

public Prompt buildMultiTurnPrompt(String sessionId, String userInput) {
    // 从Redis获取历史消息
    String historyJson = redisTemplate.opsForValue().get("ai:session:" + sessionId);
    List<Message> messages = historyJson == null ? new ArrayList<>() : 
        objectMapper.readValue(historyJson, new TypeReference<List<Message>>(){});
    
    // 添加新消息
    messages.add(new UserMessage(userInput));
    
    // 保存更新后的上下文
    redisTemplate.opsForValue().set("ai:session:" + sessionId, objectMapper.writeValueAsString(messages), 24, TimeUnit.HOURS);
    
    // 构建Prompt（设置maxTokens避免溢出）
    return new Prompt(messages, ChatOptions.builder().maxTokens(2048).build());
}
```

### 3. 输出格式控制：从“自由文本”到“结构化输出”
通过提示词+Spring AI的`EntityConverter`实现输出格式强约束，解决JSON/XML/CSV解析问题：
1.  提示词约束：在系统消息中明确格式要求，如“输出必须为JSON，包含code/message/data三个字段”。
2.  实体映射：用`@JsonIgnoreProperties`注解定义响应实体，框架自动解析JSON，示例：
```java
// 定义响应实体
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ApiResponse {
    private int code;
    private String message;
    private Object data;
}

// 解析响应
String jsonResponse = chatClient.call(prompt).getResult().getOutput().getContent();
ApiResponse response = objectMapper.readValue(jsonResponse, ApiResponse.class);
```


## 三、提示词工程的核心模式与Spring AI实现
Spring AI完美适配主流提示词工程模式，通过结构化消息+模板化+Advisor组合实现，大幅提升模型响应质量。
| 工程模式 | 核心逻辑 | Spring AI实现方式 | 适用场景 |
| :--- | :--- | :--- | :--- |
| 角色提示（Role Prompting） | 定义模型身份与行为规则 | SystemMessage设置角色，如“你是金融合规专家，禁止输出敏感信息” | 行业垂直场景（金融/医疗/政务） |
| 少样本学习（Few-Shot） | 提供2-3个示例引导模型 | 在UserMessage中加入示例，如“示例1：输入A→输出B；示例2：输入C→输出D” | 复杂格式生成（如SQL/代码） |
| 思维链（CoT） | 要求模型“逐步推理” | SystemMessage加入“请逐步分析问题，列出步骤后给出结论” | 逻辑推理（如算法题/故障排查） |
| ReAct（推理+工具调用） | 模型自主决定是否调用工具 | ToolMessage接收工具结果，配合Function Calling API实现“推理→调用→总结” | 复杂信息查询（如天气/股票/知识库检索） |
| RAG（检索增强生成） | 注入外部知识，减少幻觉 | 通过Advisor拦截Prompt，从向量数据库检索相关文档并追加到上下文 | 企业知识库问答/文档摘要 |

示例：CoT+少样本组合实现复杂计算
```java
List<Message> messages = List.of(
    new SystemMessage("你是数学老师，解决问题时请按步骤推理，先分析已知条件，再计算，最后总结答案。示例：\n问：2+3×4=？\n答：1. 先算乘法3×4=12；2. 再加2得14；3. 答案是14。"),
    new UserMessage("问：(5+2)×(8-3)=？")
);
Prompt prompt = new Prompt(messages);
String response = chatClient.call(prompt);
// 输出：1. 先算括号内5+2=7和8-3=5；2. 再算乘法7×5=35；3. 答案是35。
```


## 四、进阶实战：提示词工程与Spring AI Alibaba整合
结合Spring AI Alibaba，可进一步实现本土化提示词优化+阿里云生态协同，适配国内模型特性：
1.  中文提示词模板库：Spring AI Alibaba预置通义千问/Qwen的中文优化模板，如“生成电商商品标题，包含核心卖点+促销信息，不超过30字”。
2.  通义千问格式适配：自动适配通义千问的token计算与上下文窗口，避免因中文token溢出导致的响应截断。
3.  阿里云内容安全集成：通过Advisor调用阿里云内容安全API，实时检测提示词与响应中的敏感信息，符合《生成式AI服务管理暂行办法》。

示例：Spring AI Alibaba整合通义千问的提示词优化
```java
// 1. 引入Spring AI Alibaba依赖（pom.xml）
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-ai-alibaba-dashscope-spring-boot-starter</artifactId>
    <version>0.1.0</version>
</dependency>

// 2. 配置通义千问模型（application.yml）
spring:
  ai:
    alibaba:
      dashscope:
        api-key: 你的AK/SK
        chat:
          model: qwen-plus
          temperature: 0.5

// 3. 中文模板+少样本示例
String template = "生成{productType}的中文推广文案，风格{style}，字数{wordCount}字。示例：\n手机→轻薄长续航，追剧一整天→15字";
PromptTemplate promptTemplate = new PromptTemplate(template);
Prompt prompt = promptTemplate.create(Map.of(
    "productType", "智能手表",
    "style", "科技感",
    "wordCount", "20"
));

// 4. 调用模型（业务代码零改动）
String result = chatClient.call(prompt);
```


## 五、最佳实践与避坑指南
1.  模板复用优先：将通用提示词（如系统消息、格式要求）抽为公共模板，通过参数化适配不同场景。
2.  token管理：用Spring AI的`TokenCountEstimator`估算token数，避免超出模型上下文窗口（如GPT-3.5上限4096）。
3.  敏感词双校验：通过Advisor拦截输入+模型输出，配合阿里云内容安全服务，满足合规要求。
4.  多模型适配：同一模板通过配置切换模型（如OpenAI→通义千问），测试不同模型的响应质量，选择最优解。


### 总结
提示词工程与Spring AI的整合，本质是将“提示词”从开发过程中的“临时字符串”升级为“可维护、可复用、可监控”的企业级组件。通过PromptTemplate解决复用问题，Message解决上下文问题，Advisor解决增强问题，EntityConverter解决输出格式问题，再结合Spring AI Alibaba的本土化适配，让Java团队在合规、高效的前提下，充分释放大模型的能力。

需要我基于这些内容，整理一份提示词工程实战清单（含模板示例、多轮对话代码、输出格式约束模板、常见坑与规避方案）吗？
