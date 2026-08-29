---
title: "全栈实战发布功能从Thymeleaf到Vue 3的架构升级指南"
published: 2026-08-25
description: "修改NoteController"
image: ''
tags: [Vue, 前后端分离, 实战]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course18-5-2
pinned: false
comment: true
---

### 后端接口改造


修改NoteController：

```java
/**
 * 处理笔记发布请求
 */
@PostMapping("/publish")
/*public String publishNote(@Valid @ModelAttribute("note") NotePublishDto notePublishDto,
                            BindingResult bindingResult,
                            Model model) {
    // 验证表单
    if (bindingResult.hasErrors()) {
        model.addAttribute("note", notePublishDto);
        return "note-publish";
    } else {
        // 获取当前用户信息
        User user = userService.getCurrentUser();

        // 通过笔记服务创建笔记
        *//*noteService.createNote(notePublishDto, user);*//*
        Note note = noteService.createNote(notePublishDto, user);
        model.addAttribute("note", note);

        // 显示笔记发布成功页面
        return "note-publish-success";
    }
}*/
public ResponseEntity<?> publishNote(@Valid @ModelAttribute("note") NotePublishDto notePublishDto,
                            BindingResult bindingResult) {
    // 验证表单
    if (bindingResult.hasErrors()) {
        // 自定义错误响应
        Map<String, String> errors = new HashMap<>();
        bindingResult.getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );

        return ResponseEntity.badRequest().body(errors);
    } else {
        // 获取当前用户信息
        User user = userService.getCurrentUser();

        // 通过笔记服务创建笔记
        noteService.createNote(notePublishDto, user);

        // 返回成功响应
        return ResponseEntity.ok("笔记创建成功");
    }
}
```


### 前端组件设计


#### NotePublish.vue

新增`src\views\NotePublish.vue`：

```vue
<script setup lang="ts">
import { NotePublishDto } from '@/dto/note-publish-dto';
import type { ApiValidationError } from '@/errors/api-validation-error';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/services/axios';
import { AxiosError } from 'axios'

const noteFormRef = ref<HTMLFormElement | null>(null);
const note = ref<NotePublishDto>(new NotePublishDto())
const errors = ref<ApiValidationError>({})
const uploadedImagesRef = ref<HTMLDivElement | null>(null);
const imageUploadRef = ref<HTMLInputElement | null>(null);
const router = useRouter();
let selectedFiles: Array<File> = [];

onMounted(() => {
  // 监听图片上传
  imageUploadRef.value?.addEventListener('change', handleFileChange)
})

// 监听图片上传
function handleFileChange(this: HTMLInputElement, ev: Event) {
  if (ev.target instanceof HTMLInputElement && ev.target.files) {
    const files = Array.from(ev.target.files)
    selectedFiles = selectedFiles.concat(files)
    updateFileList()
  }
}

// 更新文件列表的显示
function updateFileList() {
  if (uploadedImagesRef.value) {
    // 清空图片预览
    uploadedImagesRef.value.innerHTML = "";

    // 生成图片预览
    for (let i = 0; i < selectedFiles.length; i++) {
      const fileItem = document.createElement("div");
      fileItem.className = "uploaded-image";

      const deleteBtn = document.createElement("div");
      deleteBtn.className = "delete-btn";
      deleteBtn.onclick = () => deleteFile(i);
      fileItem.appendChild(deleteBtn);

      const deleteBtnIcon = document.createElement("i");
      deleteBtnIcon.className = "fa fa-times";
      deleteBtn.appendChild(deleteBtnIcon);

      const imagePreview = document.createElement("img");
      imagePreview.className = "preview-img";
      imagePreview.alt = "预览";
      fileItem.appendChild(imagePreview);

      const reader = new FileReader();
      reader.onload = function (e) {
        if (e.target != null) {
          imagePreview.src = e.target.result + '';
        }
      }
      reader.readAsDataURL(selectedFiles[i]);

      uploadedImagesRef.value.appendChild(fileItem);
    }
  }
}

// 删除预览文件
function deleteFile(i: number) {
  selectedFiles.splice(i, 1);
  updateFileList();
}

// 取消发布
function cancelPublish() {
  // 确认是否要取消
  if (confirm('确定要取消发布吗？所有内容将不会被保存')) {
    router.back()
  }
}

// 发布笔记
const handleNotePublish = async () => {
  if (noteFormRef.value) {
    // 获取表单数据
    const formData = new FormData(noteFormRef.value)

    // 创建DataTransfer对象
    const dataTransfer = new DataTransfer()

    // 将选中的图片添加到DataTransfer对象中
    for (let i = 0; i < selectedFiles.length; i++) {
      dataTransfer.items.add(selectedFiles[i])
    }

    // 将DataTransfer对象设置给表单数据
    if (imageUploadRef.value && dataTransfer.files) {
      imageUploadRef.value.files = dataTransfer.files

      for (const file of imageUploadRef.value.files) {
        formData.append('images', file)
      }
    }

    // 调用API发布笔记
    try {
      await axios.post(`/api/note/publish`, formData)

      // 发布成功提示
      alert('发布成功')

      // 清空错误
      errors.value = {}

      // 跳转到首页
      router.push({ name: 'home' })
    } catch (err) {
      // 失败
      if (err instanceof AxiosError) {
        // 获取错误信息
        const axiosError = err as AxiosError<ApiValidationError>
        if (axiosError.response?.status === 400 && axiosError.response.data) {
          // 绑定后端返回的错误信息到errors上
          errors.value = axiosError.response.data
        }
      }
    }
  }
}


</script>

<template>
  <!-- 操作栏 -->
  <div class="header">
    <div class="container">
      <div class="d-flex justify-content-between align-items-center">
        <button class="btn btn-cancel" id="cancelPublishBtn" @click="cancelPublish">
          取消
        </button>
        <button class="btn btn-publish" id="publishNoteBtn" @click="handleNotePublish">
          发布
        </button>
      </div>
    </div>
  </div>

  <!-- 主体部分 -->
  <div class="container content">
    <form id="noteForm" method="post" action="/note/publish" enctype="multipart/form-data" ref="noteFormRef">
      <!-- 标题输入框 -->
      <input type="text" class="note-title" id="title" name="title" v-model="note.title" placeholder="分享你的生活点滴...">
      <div class="error-message" v-if="errors.title">
        {{ errors.title }}
      </div>

      <!-- 图片上传区域 -->
      <div class="image-upload">
        <!-- 图片选取上传按钮 -->
        <div class="upload-btn" onclick="document.getElementById('imageUpload').click()">
          <i class="fa fa-plus"></i>
        </div>
        <p>上传图片（最多9张）</p>
        <input type="file" id="imageUpload" name="images" multiple style="display: none;" accept="image/*"
          v:field="note.images" ref="imageUploadRef">

        <!-- 已上传图片预览 -->
        <div class="uploaded-images" id="uploadedImages" ref="uploadedImagesRef"></div>

        <!-- 错误消息 -->
        <div class="error-message" v-if="errors.images">
          {{ errors.images }}
        </div>
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

/* 图片上传区域 */
.image-upload {
  background-color: #f8f8f8;
  border-radius: 8px;
  padding: 24px 0;
  text-align: center;
  margin-bottom: 20px;
}

.image-upload .upload-btn {
  width: 80px;
  height: 80px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.image-upload .upload-btn:hover {
  border-color: #ff2442;
}

.image-upload .upload-btn i {
  font-size: 24px;
  color: #999;
}

.image-upload p {
  margin-top: 12px;
  color: #666;
  font-size: 14px;
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

#### note-publish-dto.ts

新增`src\dto\note-publish-dto.ts`：


```ts
export class NotePublishDto {
  title: string = '';
  content: string = '';
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
      path: '/note/publish',
      name: 'note-publish',
      component: () => import('../views/NotePublish.vue'),
      meta: { requiresAuth: true },
    }
  ],
})
```


### 运行调测

运行应用访问笔记发布页面进行操作，界面效果如下图5-1所示。


![图5-1 访问笔记发布页面进行操作](./images/5-1.png)


如果笔记发布页面输入的内容不符合要求，则会进行错误提示，如下图5-2所示。


![图5-2 错误提示](./images/5-2.png)


笔记发布成功之后，会有如下图5-3所示的提示，并自动跳转到首页。


![图5-3 笔记发布成功提示](./images/5-3.png)
