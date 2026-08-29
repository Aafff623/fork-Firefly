---
title: "创建处理评论相关请求的控制器"
published: 2026-08-25
description: "java"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-14-5
pinned: false
comment: true
---

### 控制器层


```java
package com.example.rednote.controller;

import com.example.rednote.dto.CommentResponseDto;
import com.example.rednote.entity.Comment;
import com.example.rednote.entity.Note;
import com.example.rednote.entity.User;
import com.example.rednote.exception.CommentNotFoundException;
import com.example.rednote.exception.NoteNotFoundException;
import com.example.rednote.service.CommentService;
import com.example.rednote.service.NoteService;
import com.example.rednote.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * CommentController 评论控制器
 *
 * @version 2025/08/22
 **/
@Controller
@RequestMapping("/comment")
public class CommentController {
    @Autowired
    private NoteService noteService;

    @Autowired
    private UserService userService;

    @Autowired
    private CommentService commentService;

    // 处理创建评论的请求
    @PostMapping("/{noteId}")
    public ResponseEntity<CommentResponseDto> createComment(@PathVariable("noteId") Long noteId,
                                                            @RequestBody String content) {
        // 判定笔记是否存在
        Optional<Note> optionalNote = noteService.findNoteById(noteId);
        if (!optionalNote.isPresent()) {
            throw new NoteNotFoundException("");
        }

        Note note = optionalNote.get();
        User user = userService.getCurrentUser();

        Comment comment = commentService.createComment(note, user, content);

        // 将Comment对象转换成DTO对象
        CommentResponseDto commentResponseDto = CommentResponseDto.toCommentResponseDto(comment);

        return ResponseEntity.ok(commentResponseDto);
    }

    // 处理获取笔记评论列表的请求
    @GetMapping("/{noteId}")
    public ResponseEntity<List<CommentResponseDto>> getCommentsByNoteId(@PathVariable("noteId") Long noteId) {
        // 判定笔记是否存在
        Optional<Note> optionalNote = noteService.findNoteById(noteId);
        if (!optionalNote.isPresent()) {
            throw new NoteNotFoundException("");
        }

        List<Comment> comments = commentService.getCommentsByNoteId(noteId);

        // 将Comment对象转换成DTO对象
        List<CommentResponseDto> commentResponseDtoList = comments.stream().map(CommentResponseDto::toCommentResponseDto)
                .collect(Collectors.toUnmodifiableList());

        return ResponseEntity.ok(commentResponseDtoList);
    }

    // 处理创建回复的请求
    @PostMapping("/{noteId}/reply/{parentCommentId}")
    public ResponseEntity<CommentResponseDto> replyToComment(@PathVariable("noteId") Long noteId,
                                                             @PathVariable("parentCommentId") Long parentCommentId,
                                                             @RequestBody String content) {
        // 判定笔记是否存在
        Optional<Note> optionalNote = noteService.findNoteById(noteId);
        if (!optionalNote.isPresent()) {
            throw new NoteNotFoundException("");
        }

        // 判定父级评论是否存在
        Optional<Comment> optionalParentComment = commentService.findCommentById(parentCommentId);
        if (!optionalParentComment.isPresent()) {
            throw new CommentNotFoundException("");
        }

        // 判定父级评论是否属于该笔记
        Comment parentComment = optionalParentComment.get();
        if (!parentComment.getNote().getNoteId().equals(noteId)) {
            throw new CommentNotFoundException("评论与笔记不匹配");
        }

        Note note = optionalNote.get();
        User user = userService.getCurrentUser();
        Comment reply = commentService.replyToComment(note, parentComment, user, content);

        // 将Comment对象转换成DTO对象
        CommentResponseDto commentResponseDto = CommentResponseDto.toCommentResponseDto(reply);

        return ResponseEntity.ok(commentResponseDto);
    }

    // 处理删除评论（包含回复）的请求
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable("commentId") Long commentId) {
        // 判定评论是否存在
        Optional<Comment> optionalComment = commentService.findCommentById(commentId);
        if (!optionalComment.isPresent()) {
            throw new CommentNotFoundException("");
        }

        // 判定评论是否是自己的
        Comment comment = optionalComment.get();
        User user = userService.getCurrentUser();
        if (!comment.getUser().getUserId().equals(user.getUserId())) {
            throw new CommentNotFoundException("无权删除他人的评论");
        }

        commentService.deleteComment(comment);

        return ResponseEntity.noContent().build();
    }
}
```


这里需要注意，不能直接返回实体Comment给前端，需要转为CommentResponseDto对象，否则报以下序列化错误：


```

com.fasterxml.jackson.databind.exc.InvalidDefinitionException: No serializer found for class org.hibernate.proxy.pojo.bytebuddy.ByteBuddyInterceptor and no properties discovered to create BeanSerializer (to avoid exception, disable SerializationFeature.FAIL_ON_EMPTY_BEANS) (through reference chain: com.example.rednote.entity.Comment["note"]->com.example.rednote.entity.Note["author"]->com.example.rednote.entity.User$HibernateProxy["hibernateLazyInitializer"])
	at com.fasterxml.jackson.databind.exc.InvalidDefinitionException.from(InvalidDefinitionException.java:77) ~[jackson-databind-2.19.0.jar:2.19.0]
	at com.fasterxml.jackson.databind.SerializerProvider.reportBadDefinition(SerializerProvider.java:1359) ~[jackson-databind-2.19.0.jar:2.19.0]
	at com.fasterxml.jackson.databind.DatabindContext.reportBadDefinition(DatabindContext.java:415) ~[jackson-databind-2.19.0.jar:2.19.0]
	at com.fasterxml.jackson.databind.ser.impl.UnknownSerializer.failForEmpty(UnknownSerializer.java:52) ~[jackson-databind-2.19.0.jar:2.19.0]
	at com.fasterxml.jackson.databind.ser.impl.UnknownSerializer.serialize(UnknownSerializer.java:29) ~[jackson-databind-2.19.0.jar:2.19.0]
	at com.fasterxml.jackson.databind.ser.BeanPropertyWriter.serializeAsField(BeanPropertyWriter.java:732) ~[jackson-databind-2.19.0.jar:2.19.0]
	at com.fasterxml.jackson.databind.ser.std.BeanSerializerBase.serializeFields(BeanSerializerBase.java:760) ~[jackson-databind-2.19.0.jar:2.19.0]
	at com.fasterxml.jackson.databind.ser.BeanSerializer.serialize(BeanSerializer.java:183) ~[jackson-databind-2.19.0.jar:2.19.0]
	at com.fasterxml.jackson.databind.ser.BeanPropertyWriter.serializeAsField(BeanPropertyWriter.java:732) ~[jackson-databind-2.19.0.jar:2.19.0]
	at com.fasterxml.jackson.databind.ser.std.BeanSerializerBase.serializeFields(BeanSerializerBase.java:760) ~[jackson-databind-2.19.0.jar:2.19.0]
	at com.fasterxml.jackson.databind.ser.BeanSerializer.serialize(BeanSerializer.java:183) ~[jackson-databind-2.19.0.jar:2.19.0]
	at com.fasterxml.jackson.databind.ser.BeanPropertyWriter.serializeAsField(BeanPropertyWriter.java:732) ~[jackson-databind-2.19.0.jar:2.19.0]
	at com.fasterxml.jackson.databind.ser.std.BeanSerializerBase.serializeFields(BeanSerializerBase.java:760) ~[jackson-databind-2.19.0.jar:2.19.0]
	at com.fasterxml.jackson.databind.ser.BeanSerializer.serialize(BeanSerializer.java:183) ~[jackson-databind-2.19.0.jar:2.19.0]
	at com.fasterxml.jackson.databind.ser.DefaultSerializerProvider._serialize(DefaultSerializerProvider.java:503) ~[jackson-databind-2.19.0.jar:2.19.0]
	at com.fasterxml.jackson.databind.ser.DefaultSerializerProvider.serializeValue(DefaultSerializerProvider.java:342) ~[jackson-databind-2.19.0.jar:2.19.0]
	at com.fasterxml.jackson.databind.ObjectWriter$Prefetch.serialize(ObjectWriter.java:1587) ~[jackson-databind-2.19.0.jar:2.19.0]
	at com.fasterxml.jackson.databind.ObjectWriter.writeValue(ObjectWriter.java:1061) ~[jackson-databind-2.19.0.jar:2.19.0]
	at org.springframework.http.converter.json.AbstractJackson2HttpMessageConverter.writeInternal(AbstractJackson2HttpMessageConverter.java:485) ~[spring-web-6.2.7.jar:6.2.7]
	at org.springframework.http.converter.AbstractGenericHttpMessageConverter.write(AbstractGenericHttpMessageConverter.java:126) ~[spring-web-6.2.7.jar:6.2.7]
	at org.springframework.web.servlet.mvc.method.annotation.AbstractMessageConverterMethodProcessor.writeWithMessageConverters(AbstractMessageConverterMethodProcessor.java:345) ~[spring-webmvc-6.2.7.jar:6.2.7]
	at org.springframework.web.servlet.mvc.method.annotation.HttpEntityMethodProcessor.handleReturnValue(HttpEntityMethodProcessor.java:263) ~[spring-webmvc-6.2.7.jar:6.2.7]
	at org.springframework.web.method.support.HandlerMethodReturnValueHandlerComposite.handleReturnValue(HandlerMethodReturnValueHandlerComposite.java:78) ~[spring-web-6.2.7.jar:6.2.7]
	at org.springframework.web.servlet.mvc.method.annotation.ServletInvocableHandlerMethod.invokeAndHandle(ServletInvocableHandlerMethod.java:136) ~[spring-webmvc-6.2.7.jar:6.2.7]
	at org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.invokeHandlerMethod(RequestMappingHandlerAdapter.java:986) ~[spring-webmvc-6.2.7.jar:6.2.7]
	at org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.handleInternal(RequestMappingHandlerAdapter.java:891) ~[spring-webmvc-6.2.7.jar:6.2.7]
	at org.springframework.web.servlet.mvc.method.AbstractHandlerMethodAdapter.handle(AbstractHandlerMethodAdapter.java:87) ~[spring-webmvc-6.2.7.jar:6.2.7]
	at org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:1089) ~[spring-webmvc-6.2.7.jar:6.2.7]
	at org.springframework.web.servlet.DispatcherServlet.doService(DispatcherServlet.java:979) ~[spring-webmvc-6.2.7.jar:6.2.7]
	at org.springframework.web.servlet.FrameworkServlet.processRequest(FrameworkServlet.java:1014) ~[spring-webmvc-6.2.7.jar:6.2.7]
	at org.springframework.web.servlet.FrameworkServlet.doPost(FrameworkServlet.java:914) ~[spring-webmvc-6.2.7.jar:6.2.7]
```    


### JSON序列化错误解决方案：使用DTO（数据传输对象）隔离实体

这个错误是由于Jackson在序列化Hibernate代理对象时遇到问题导致的。当Hibernate加载实体时，会使用代理（Proxy）延迟加载关联对象，而Jackson默认无法处理这些代理对象。


推荐使用DTO来控制序列化的数据，避免直接序列化实体：

```java
package com.example.rednote.dto;

import com.example.rednote.entity.Comment;
import com.example.rednote.entity.Note;
import com.example.rednote.entity.User;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * CommentResponseDto 评论的响应对象
 *
 * @version 2025/08/22
 **/
@Getter
@Setter
public class CommentResponseDto {

    // 以下是从Comment对象中获取
    private Long commentId;
    private String content;
    private LocalDateTime createAt;

    // 以下是从User对象中获取
    private Long userId;
    private String username;
    private String avatar;

    // 以下是从Note对象中获取
    private Long noteId;

    // 以下是从Comment的parent对象中获取
    private Long parentCommentId;

    // 以下是从Comment的parent对象中的User对象中获取
    private String parentCommentUsername;

    // 子评论
    private List<CommentResponseDto> replies = new ArrayList<>();

    public static CommentResponseDto toCommentResponseDto(Comment comment) {
        if (comment == null) {
            return null;
        }

        CommentResponseDto commentResponseDto = new CommentResponseDto();
        commentResponseDto.setCommentId(comment.getCommentId());
        commentResponseDto.setContent(comment.getContent());
        commentResponseDto.setCreateAt(comment.getCreateAt());

        User user = comment.getUser();
        commentResponseDto.setUserId(user.getUserId());
        commentResponseDto.setUsername(user.getUsername());
        commentResponseDto.setAvatar(user.getAvatar());

        Note note = comment.getNote();
        commentResponseDto.setNoteId(note.getNoteId());

        Comment parentComment = comment.getParent();
        if (parentComment != null) {
            commentResponseDto.setParentCommentId(parentComment.getCommentId());

            User parentCommentUser = parentComment.getUser();
            commentResponseDto.setParentCommentUsername(parentCommentUser.getUsername());
        }

        List<Comment> replies = comment.getReplies();
        for (Comment reply : replies) {
            CommentResponseDto replyDto = toCommentResponseDto(reply);
            commentResponseDto.getReplies().add(replyDto);
        }

        return commentResponseDto;
    }
}
```


通过以上方法，你应该能够解决JSON序列化时的代理对象问题。选择最适合你项目的方案，通常结合使用DTO和注解配置是最推荐的做法。
