---
title: "掌握自定义校验器处理复杂数据类型"
published: 2026-08-25
description: "基于之前的笔记发布界面，我将补充完整的后端接口实现，包括表单处理、图片上传和安全校验。以下是核心代码实现"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-7-5
pinned: false
comment: true
---

基于之前的笔记发布界面，我将补充完整的后端接口实现，包括表单处理、图片上传和安全校验。以下是核心代码实现：


### DTO 对象

```java
package com.example.rednote.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * NotePublishDto 笔记发布DTO
 *
 * @version 2025/08/18
 **/
@Getter
@Setter
public class NotePublishDto {
    @NotEmpty(message = "标题不能为空")
    @Size(max = 60, message = "标题长度不能超过60个字符")
    private String title;

    @NotEmpty(message = "内容不能为空")
    @Size(max = 900, message = "内容长度不能超过900个字符")
    private String content;

    private String topics;

    @NotEmpty(message = "分类不能为空")
    private String category;

    @NotEmpty(message = "图片不能为空")
    @Size(min = 1, max = 9, message = "上传图片最多9张")
    private List<MultipartFile> images;
}
```

`List<MultipartFile>`用于接收前端传过来的图片数组。由于`List<MultipartFile>`的校验较为复杂，因此需要自定义校验器。


### 支持对集合中每个元素的验证


在使用 jakarta.validation 来验证 `List<MultipartFile>` 中的每个 MultipartFile 是否为空时，你可以创建一个自定义验证器。由于 jakarta.validation 本身不直接支持对集合中每个元素的验证，你需要实现一个自定义的验证注解和对应的验证器。

以下是一个完整的实现步骤。

#### 1. 创建自定义验证注解

首先，创建一个自定义注解来标记需要验证的字段：

```java
package com.example.rednote.annotation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * NotEmptyMultipartFileList 验证 List<MultipartFile> 中的每个 MultipartFile 是否为空
 *
 * @version 2025/08/18
 **/
@Documented
@Constraint(validatedBy = NotEmptyMultipartFileListValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface NotEmptyMultipartFileList {
    String message() default "文件列表不能包含空文件";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
```

#### 2. 实现自定义验证器

接下来，实现一个验证器来检查 `List<MultipartFile>` 中的每个文件是否为空：


```java
package com.example.rednote.annotation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * NotEmptyMultipartFileListValidator 自定义验证器来检查 List<MultipartFile> 中的每个文件是否为空
 *
 * @version 2025/08/18
 **/
public class NotEmptyMultipartFileListValidator implements ConstraintValidator<NotEmptyMultipartFileList, List<MultipartFile>> {
    @Override
    public boolean isValid(List<MultipartFile> multipartFiles, ConstraintValidatorContext constraintValidatorContext) {
        if (multipartFiles != null && !multipartFiles.isEmpty()) {
            for (MultipartFile multipartFile : multipartFiles) {
                if (multipartFile.isEmpty()) {
                    return false;
                }
            }

            return true;
        }

        return false;
    }
}
```

### 在DTO中使用自定义校验器注解

现在，你可以在DTO中使用这个自定义注解来验证文件列表：


```java
import com.example.rednote.annotation.NotEmptyMultipartFileList;

// ...为节约篇幅，此处省略非核心内容

@Getter
@Setter
public class NotePublishDto {
    // ...为节约篇幅，此处省略非核心内容

    /*@NotEmpty(message = "图片不能为空")*/
    // 添加自定义的验证器注解
    @NotEmptyMultipartFileList(message = "图片不能为空")
    @Size(min = 1, max = 9, message = "上传图片最多9张")
    private List<MultipartFile> images;
 
}
```

### 在控制器中使用`@Valid`注解


在控制器中使用`@Valid`注解，实现对DTO对象的自动校验：

```java
package com.example.rednote.controller;

import com.example.rednote.dto.NotePublishDto;
import com.example.rednote.entity.User;
import com.example.rednote.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * NoteController 笔记控制器 
 * @version 2025/08/18
**/
@Controller
@RequestMapping("/note")
public class NoteController {

    @Autowired
    private UserService userService;

    /**
     * 显示笔记发布页面
     */
    @GetMapping("/publish")
    public String showPublishForm(Model model) {
        model.addAttribute("note", new NotePublishDto());
        return "note-publish";
    }

    /**
     * 处理笔记发布请求
     */
    @PostMapping("/publish")
    public String publishNote(@Valid @ModelAttribute("note") NotePublishDto notePublishDto,
                              BindingResult bindingResult,
                              Model model){
        // 验证表单
        if (bindingResult.hasErrors()) {
            model.addAttribute("note", notePublishDto);
            return "note-publish";
        } else {
            // TODO 通过笔记服务创建笔记

            // 显示笔记发布成功页面
            return "note-publish-success";
        }

    }
}

```

上述代码

* 校验失败，则返回note-publish.html
* 校验成功，则返回note-publish-success.html
