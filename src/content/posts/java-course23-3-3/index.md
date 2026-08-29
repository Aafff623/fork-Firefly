---
title: "实现AI评论生成服务控制器"
published: 2026-08-25
description: "CommentSuggestionRequestDto类定义在src/main/java/com/example/rednote/aimicroservice/application/dto/Comme…"
image: ''
tags: [AI, 实战, 融合]
category: 指南
collections: [java-fullstack, java-fullstack-ai-cloud]
draft: false
lang: ''
slug: java-course23-3-3
pinned: false
comment: true
---

### 编写请求DTO

CommentSuggestionRequestDto类定义在`src/main/java/com/example/rednote/aimicroservice/application/dto/CommentSuggestionRequestDto.java`:


```java
package com.example.rednote.aimicroservice.application.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 * CommentSuggestionRequestDto AI评论生成请求DTO
 *
 * @version 2025/08/03
 **/
@Getter
@Setter
@AllArgsConstructor
public class CommentSuggestionRequestDto {
    // 内容类型
    private String type;
    // 内容
    private String content;
}
```


### 编写响应DTO

CommentSuggestionResponseDto类定义在`src/main/java/com/example/rednote/aimicroservice/application/dto/CommentSuggestionResponseDto.java`:


```java
package com.example.rednote.aimicroservice.application.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 * CommentSuggestionResponseDto AI评论生成响应DTO
 *
 * @version 2025/08/03
 **/
@Getter
@Setter
@AllArgsConstructor
public class CommentSuggestionResponseDto {
    private String[] commentSuggestions;
}
```

### 编写控制器


修改AiController，增加以下方法：


```java
import com.example.rednote.aimicroservice.application.dto.CommentSuggestionRequestDto;
import com.example.rednote.aimicroservice.application.dto.CommentSuggestionResponseDto;

// ...为节约篇幅，此处省略非核心内容

@Autowired
private AiCommentService aiCommentService;

@PostMapping("/comment")
public ResponseEntity<CommentSuggestionResponseDto> generateComment(@RequestBody CommentSuggestionRequestDto request) {
    // 1. 构建提示词
    String prompt = aiCommentService.buildPrompt(request.getType(), request.getContent());

    // 2. 调用生成服务（已自动处理缓存、API调用、错误处理）
    String result = aiCommentService.generate(prompt);

    // 3. 解析为DTO，用"\n"分割多条评论
    String[] textArray = result.split("\n");
    CommentSuggestionResponseDto dto = new CommentSuggestionResponseDto(textArray);

    return ResponseEntity.ok(dto);
}
```

需要处理返回数据，按照`\n`格式将评论列表进行分割比如：

```
✨情感和健身一样，坚持才有默契💪  \n情侣瑜伽太戳了，流汗也浪漫💞  \n健身修心，感情也在汗水里升华🔥  \n阴阳互补，一起修炼最甜的关系🧘‍♀️❤️  \n互相成就的感觉，大概就是爱情了💯
```


将会分割为5条评论：

```
✨情感和健身一样，坚持才有默契💪  
情侣瑜伽太戳了，流汗也浪漫💞  
健身修心，感情也在汗水里升华🔥  
阴阳互补，一起修炼最甜的关系🧘‍♀️❤️  
互相成就的感觉，大概就是爱情了💯
```
