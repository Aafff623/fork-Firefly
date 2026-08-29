---
title: "全栈实战评论功能：掌握千万级访问的实时评论应对方案"
published: 2026-08-25
description: "CommentController评论接口已经适配，无需调整。"
image: ''
tags: [Vue, 前后端分离, 实战]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course18-7-2
pinned: false
comment: true
---

### 后端接口

CommentController评论接口已经适配，无需调整。


```java
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
```


### 前端组件设计
 
#### 定义DTO对象

新增`src\dto\comment-response-dto.ts`：

```ts
export class CommentResponseDto {
  commentId: number = 0;
  content: string = '';
  noteId: number | null = null;
  userId: number | null = null;
  username: string = '';
  avatar: string = '';
  createdAt: string = '';
  parentCommentId: number | null = null;
  parentCommentUsername: string = '';
  replies: Array<CommentResponseDto> = [];
}
```

#### 增加评论事件处理

修改`src\views\NoteDetail.vue`，增加如下函数：

```ts
// 评论状态
const newComment = ref('');
const commentResponseDtoArray = ref<Array<CommentResponseDto>>([]);

// 发布评论
const postComment = async () => {
  if (newComment.value.trim() === '') {
    return
  }

  try {
    const response = await axios.post(`/api/comment/${noteId.value}`,
      // 传递的是纯文本内容
      newComment.value.trim(),
      { headers: { 'Content-Type': 'text/plain' } }
    )

    // 返回的评论列表插入到原来列表顶部
    commentResponseDtoArray.value.unshift(response.data)
    newComment.value = ''
  } catch (error) {
    console.error('发布评论错误：', error)
  }
}


// ...为节约篇幅，此处省略非核心内容

<!-- 评论输入框 -->
<div class="comment-input">
    <img class="comment-avatar" src="/images/rn_avatar.png" alt="头像">
    <textarea class="comment-textarea" placeholder="分享你的想法..." v-model="newComment"></textarea>
    <div class="comment-btn" @click="postComment">
    发送
    </div>
</div>
```
