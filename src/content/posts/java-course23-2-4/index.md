---
title: "实现AI文案生成服务控制器"
published: 2026-08-25
description: "java"
image: ''
tags: [AI, 实战, 融合]
category: 指南
collections: [java-fullstack, java-fullstack-ai-cloud]
draft: false
lang: ''
slug: java-course23-2-4
pinned: false
comment: true
---

### 编写控制器

```java
package com.example.rednote.aimicroservice.interfaces.controller;

import com.example.rednote.aimicroservice.application.service.AiCopywritingService;
import com.example.rednote.aimicroservice.application.dto.CopywritingRequestDto;
import com.example.rednote.aimicroservice.application.dto.CopywritingResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AiController AI文案生成控制器
 *
 * @version 2025/08/03
 **/
@RestController
@RequestMapping("/ai")
public class AiController {
    @Autowired
    private AiCopywritingService aiCopywritingService;

    @PostMapping("/copywriting")
    public ResponseEntity<CopywritingResponseDto> generateCopywriting(@RequestBody CopywritingRequestDto request) {
        // 1. 构建提示词
        String prompt = aiCopywritingService.buildPrompt(request.getType(), request.getKeywords());

        // 2. 调用生成服务（已自动处理缓存、API调用、错误处理）
        String result = aiCopywritingService.generate(prompt);

        // 3. 解析为DTO，用"\n\n"分割为标题和正文
        String[] textArray = result.split("\n\n");

        CopywritingResponseDto dto;
        if (textArray.length > 1) {
            // 如果包含"\n\n"，则识别为标题和正文
            dto = new CopywritingResponseDto(textArray[0], textArray[1]);
        } else {
            // 如果不包含"\n\n"，则没有标题仅有正文
            dto = new CopywritingResponseDto(null, result);
        }

        return ResponseEntity.ok(dto);
    }

}
```

需要处理返回数据格式不一致的问题，比如下面这种是有`\n\n`的，可以被识别为标题和正文两部分：

```
💔情感修行：男女在健身中找回彼此的节奏  \n\n情感是场双人瑜伽，需默契与坚持。  \n男女如阴阳，互补中成就彼此修行。  \n健身不只是塑形，更是心灵的磨合。  \n一起流汗的日子，藏着最深的默契。
```

下面这种是没有`\n\n`的，被识别为没有标题仅有正文部分：

```
💔✨情感修行：男女在健身中找回彼此  \n健身房里，汗水比言语更诚实  \n他举铁，她瑜伽，心却慢慢靠近  \n爱情不是躺赢，是共同流汗的坚持
```


### 编写请求DTO

CopywritingRequestDto类定义在`src/main/java/com/example/rednote/aimicroservice/application/dto/CopywritingRequestDto.java`:


```java
package com.example.rednote.aimicroservice.application.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 * CopywritingRequestDto AI文案生成请求DTO
 *
 * @version 2025/08/03
 **/
@Getter
@Setter
@AllArgsConstructor
public class CopywritingRequestDto {
    // 内容类型
    private String type;
    // 用户输入的关键词
    private String keywords;
}
```


### 编写响应DTO

CopywritingResponseDto类定义在`src/main/java/com/example/rednote/aimicroservice/application/dto/CopywritingResponseDto.java`:


```java
package com.example.rednote.aimicroservice.application.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 * CopywritingResponseDto AI文案生成响应DTO
 *
 * @version 2025/12/21
 **/
@Getter
@Setter
@AllArgsConstructor
public class CopywritingResponseDto {
    // 文案标题
    private String title;

    // 文案内容
    private String content;
}
```
