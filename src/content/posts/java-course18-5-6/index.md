---
title: "全栈实战编辑功能：掌握前后端分离架构下的更新策略"
published: 2026-08-25
description: "修改NoteController"
image: ''
tags: [Vue, 前后端分离, 实战]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course18-5-6
pinned: false
comment: true
---

### 后端接口改造

#### 修改NoteController


修改NoteController：

```java
@GetMapping("/{noteId}/edit")
@PreAuthorize("@noteServiceImpl.isAuthor(#noteId, authentication.name)")
/* public String editNote(@PathVariable Long noteId, Model model) {
    Optional<Note> noteOptional = noteService.findByNoteId(noteId);

    if (!noteOptional.isPresent()) {
        throw new NoteNotFoundException("");
    }

    Note note = noteOptional.get();

    NoteEditDto noteEditDto = new NoteEditDto();
    noteEditDto.setNoteId(note.getNoteId());
    noteEditDto.setTitle(note.getTitle());
    noteEditDto.setContent(note.getContent());
    noteEditDto.setCategory(note.getCategory());
    noteEditDto.setImages(note.getImages());

    // List转为String
    noteEditDto.setTopics(StringUtil.listToSplit(note.getTopics(), " "));

    model.addAttribute("note", noteEditDto);

    return "note-edit";
}*/
public ResponseEntity<?> editNote(@PathVariable Long noteId) {
    Optional<Note> noteOptional = noteService.findByNoteId(noteId);

    if (!noteOptional.isPresent()) {
        throw new NoteNotFoundException("");
    }

    Note note = noteOptional.get();

    NoteEditDto noteEditDto = new NoteEditDto();
    noteEditDto.setNoteId(note.getNoteId());
    noteEditDto.setTitle(note.getTitle());
    noteEditDto.setContent(note.getContent());
    noteEditDto.setCategory(note.getCategory());
    noteEditDto.setImages(note.getImages());

    // List转为String
    noteEditDto.setTopics(StringUtil.listToSplit(note.getTopics(), " "));

    return ResponseEntity.ok(noteEditDto);
}

@PostMapping("/{noteId}")
@PreAuthorize("@noteServiceImpl.isAuthor(#noteId, authentication.name)")
/*public String updateNote(@PathVariable Long noteId,
                          @Valid @ModelAttribute("note") NoteEditDto noteEditDto,
                          BindingResult bindingResult,
                          Model model,
                          RedirectAttributes redirectAttributes) {
    Optional<Note> noteOptional = noteService.findByNoteId(noteId);

    if (!noteOptional.isPresent()) {
        throw new NoteNotFoundException("");
    }

    // 验证表单
    if (bindingResult.hasErrors()) {
        model.addAttribute("note", noteEditDto);
        return "note-edit";
    }

    Note note = noteOptional.get();

    try {
        noteService.updateNote(note, noteEditDto);
        redirectAttributes.addFlashAttribute("success", "笔记更新成功");
        return "redirect:/note/" + noteId;
    } catch (Exception ex) {
        log.error("笔记更新异常: {}", ex.getMessage(), ex);

        redirectAttributes.addFlashAttribute("error", "笔记更新失败: " + ex.getMessage());
        return "redirect:/note/" + noteId + "/edit";
    }
}*/
public ResponseEntity<?> updateNote(@PathVariable Long noteId,
                          @Valid @RequestBody NoteEditDto noteEditDto,
                          BindingResult bindingResult) {
    Optional<Note> noteOptional = noteService.findByNoteId(noteId);

    if (!noteOptional.isPresent()) {
        throw new NoteNotFoundException("");
    }

    // 验证表单
    if (bindingResult.hasErrors()) {
        // 自定义错误响应
        Map<String, String> errors = new HashMap<>();
        bindingResult.getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );
        return ResponseEntity.badRequest().body(errors);
    }

    Map<String, String> map = new HashMap<>();
    Note note = noteOptional.get();

    try {
        noteService.updateNote(note, noteEditDto);
        map.put("success", "笔记更新成功");
        return ResponseEntity.ok(map);
    } catch (Exception ex) {
        log.error("笔记更新异常: {}", ex.getMessage(), ex);
        map.put("error", "笔记更新失败: " + ex.getMessage());
        return ResponseEntity.ok(map);
    }
}
```


### 前端组件设计


#### NoteEdit.vue

新增`src\views\NoteEdit.vue`：

```vue
<script setup lang="ts">
import { NoteEditDto } from '@/dto/note-edit-dto';
import type { ApiValidationError } from '@/errors/api-validation-error';
import axios from '@/services/axios';
import type { AxiosError } from 'axios';
import { onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const note = ref<NoteEditDto>(new NoteEditDto())
const errors = ref<ApiValidationError>({})
const success = ref('')
const error = ref('')
const router = useRouter()
const route = useRoute()

// 从路由参数中获取笔记ID
const noteId = ref(route.params.noteId)

// 组件挂载时，获取笔记详情
onMounted(() => {
  fetchNote(noteId.value)
});

// 获取笔记详情
const fetchNote = async (noteId: any) => {
  try {
    const response = await axios.get(`/api/note/${noteId}/edit`)
    note.value = response.data
  } catch (error) {
    console.error('获取笔记详情失败：' + error)
  }
}

// 取消编辑
function cancelEdit() {
  if (confirm('确定要取消修改吗？')) {
    router.back()
  }
}

// 保存笔记
const handleNoteEdit = async () => {
  try {
    const response = await axios.post(`/api/note/${noteId.value}`, note.value)

    if (response.data['success']) {
      success.value = response.data['success']
    } else if (response.data['error']) {
      error.value = response.data['error']
    }
  } catch (error) {
    const axiosError = error as AxiosError<ApiValidationError>
    if (axiosError.response?.status === 400 && axiosError.response.data) {
      errors.value = axiosError.response.data
    }
  }
}
</script>
<template>
  <!-- 操作栏 -->
  <div class="header">
    <div class="container">
      <div class="d-flex justify-content-between align-items-center">
        <button class="btn btn-cancel" id="cancelPublishBtn" @click="cancelEdit">
          取消
        </button>
        <button class="btn btn-publish" id="publishNoteBtn" @click="handleNoteEdit">
          保存
        </button>
      </div>
    </div>
  </div>

  <!-- 主体部分 -->
  <div class="container content">
    <form id="noteForm" method="post">
      <!-- 标题输入框 -->
      <input type="text" class="note-title" id="title" name="title" v-model="note.title" placeholder="分享你的生活点滴...">
      <div class="error-message" v-if="errors.title">
        {{ errors.title }}
      </div>

      <!-- 已上传图片预览 -->
      <div class="uploaded-images" id="uploadedImages">
        <div class="uploaded-image" v-for="image in note.images">
          <img :src="image" class="preview-img">
        </div>
      </div>
      <!-- 错误消息 -->
      <div class="error-message" v-if="errors.images">
        {{ errors.images }}
      </div>

      <!-- 笔记内容 -->
      <textarea class="note-content" id="content" name="content" v-model="note.content"
        placeholder="详细描述你的分享内容..."></textarea>
      <div class="error-message" v-if="errors.content">
        {{ errors.content }}
      </div>

      <!-- 话题 -->
      <div class="topic-input">
        <input type="text" class="form-control" id="topicInput" name="topics" v-model="note.topics"
          placeholder="添加话题，多个话题用空格隔开">
      </div>

      <!-- 分类 -->
      <div class="category-selector">
        <label for="categorySelect" class="form-label">请选择一个分类：</label>
        <select class="form-control" id="categorySelect" name="category" v-model="note.category">
          <option value="穿搭">穿搭</option>
          <option value="美食">美食</option>
          <option value="彩妆">彩妆</option>
          <option value="影视">影视</option>
          <option value="职场">职场</option>
          <option value="情感">情感</option>
          <option value="家居">家居</option>
          <option value="游戏">游戏</option>
          <option value="旅行">旅行</option>
          <option value="健身">健身</option>
        </select>
        <div class="error-message" v-if="errors.category">
          {{ errors.category }}
        </div>
      </div>
    </form>

    <!-- 操作反馈 -->
    <div v-if="success" class="alert alert-success mt-4">
      <i class="fa fa-check-circle"></i>
      {{ success }}
    </div>
    <div v-if="error" class="alert alert-danger mt-4">
      <i class="fa fa-exclamation-circle"></i>
      {{ error }}
    </div>
  </div>
</template>
<style setup>
/* 基础样式 */
body {
  background-color: #fef6f6;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.container {
  max-width: 768px;
  margin: 0 auto;
  padding: 0 16px;
}

/* 顶部导航栏 */
.header {
  background-color: white;
  border-bottom: 1px solid #eee;
  padding: 12px 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header .btn {
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: 600;
}

.btn-cancel {
  color: #333;
  border: 1px solid #ddd;
}

.btn-publish {
  background-color: #ff2442;
  color: white;
  border: none;
}

.btn-publish:hover {
  background-color: #e61e3a;
}

/* 内容区域 */
.content {
  padding: 16px 0;
}

/* 标题输入框 */
.note-title {
  border: none;
  width: 100%;
  font-size: 20px;
  font-weight: 600;
  padding: 12px 0;
  outline: none;
}

.note-title::placeholder {
  color: #999;
}

/* 已上传图片展示 */
.uploaded-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.uploaded-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.uploaded-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.uploaded-image .delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
}

/* 笔记内容编辑器 */
.note-content {
  width: 100%;
  min-height: 200px;
  border: none;
  outline: none;
  font-size: 16px;
  line-height: 1.6;
  padding: 12px 0;
}

.note-content::placeholder {
  color: #999;
}

/* 话题选择 */
.topic-input {
  position: relative;
  margin-bottom: 20px;
}

.topic-input input {
  width: 100%;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 8px;
  outline: none;
}

/* 分类选择 */
.category-selector {
  margin-bottom: 20px;
}

.category-input i {
  color: #ff2442;
}

/* 添加到 style 标签中 */
.category-selector select {
  width: 100%;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: white;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  cursor: pointer;
}

.category-selector select:focus {
  outline: none;
  border-color: #ff2442;
  box-shadow: 0 0 0 2px rgba(255, 36, 66, 0.1);
}

.btn-view-note {
  background-color: #ff2442;
  color: white;
}

.error-message {
  color: #ff2442;
  font-size: 12px;
  margin-top: 4px;
}
</style>
```

#### note-edit-dto.ts

新增`src\dto\note-edit-dto.ts`：


```ts
export class NoteEditDto {
  noteId: number = 0;
  title: string = '';
  content: string = '';
  images: Array<string> = [];
  topics: string = '';
  category: string = '';
}
```

### 路由配置


```ts
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ...为节约篇幅，此处省略非核心内容

    ,
    {
      path: '/note/:noteId/edit',
      name: 'note-edit',
      component: () => import('../views/NoteEdit.vue'),
      meta: { requiresAuth: true },
    }
  ],
})
```


### 运行调测

运行应用访问笔记编辑页面进行操作，操作成功界面效果如下图5-5所示。


![图5-5 操作成功界面效果](./images/5-5.png)


操作失败界面效果如下图5-6所示。


![图5-6 操作失败界面效果](./images/5-6.png)
