---
title: "全栈实战笔记详情页多图轮播功能"
published: 2026-08-25
description: "新增src\\views\\NoteDetail.vue"
image: ''
tags: [Vue, 前后端分离, 实战]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course18-5-4
pinned: false
comment: true
---

### 前端组件设计


#### NoteDetail.vue

新增`src\views\NoteDetail.vue`：

```vue
<script setup lang="ts">
import { NoteDetailDto } from '@/dto/note-detail-dto';
import { User } from '@/dto/user';
import { useAuthStore } from '@/stores/auth';
import axios from '@/services/axios';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import router from '@/router';

const carouselContainerRef = ref<HTMLDivElement | null>(null);
const note = ref<NoteDetailDto>(new NoteDetailDto());
const currentIndex = ref<number>(0);
const me = ref<User>(new User());
const authStore = useAuthStore();

// 获取路由参数中的noteId
const route = useRoute();
const noteId = ref(route.params.noteId);

onMounted(() => {
  // 获取当前用户信息
  me.value = authStore.getUser ? authStore.getUser : new User();

  // 获取笔记详情
  fetchNote(noteId.value)
});

const fetchNote = async (noteId: any) => {
  try {
    const response = await axios.get(`/api/note/${noteId}`);
    note.value = response.data;
  } catch (error) {
    console.error('获取笔记详情失败：' + error);
  }

}

// 更新轮播位置
function updateCarouselPosition() {
  if (carouselContainerRef.value) {
    carouselContainerRef.value.style.transform = `translateX(-${currentIndex.value * 100}%)`;
  }
}

// 上一张
function prevSlide() {
  currentIndex.value = Math.max(currentIndex.value - 1, 0);
  updateCarouselPosition();
}

// 下一张
function nextSlide() {
  if (note.value.images && note.value.images.length > 0) {
    currentIndex.value = Math.min(currentIndex.value + 1, note.value.images.length - 1);
    updateCarouselPosition();
  }

}

//  取消发布
function handleBack() {
  router.back();
}


// TODO 删除笔记
function deleteNote() {

}

// TODO 打开预览
function openPreview(index: number) {

}

// TODO 关闭预览
function closePreview() {

}

// TODO 预览上一张
function previewPrev() {

}

// TODO 预览下一张
function previewNext() {

}
</script>
<template>
  <!-- 主内容区 -->
  <main class="container py-4 main-content">
    <!-- 笔记内容 -->
    <div class="note-container">
      <!-- 笔记图片 -->
      <div class="note-images">
        <!-- 图片轮播容器 -->
        <div class="carousel-container" id="carouselContainer" ref="carouselContainerRef">
          <!-- 动态生成轮播项 -->
          <div class="carousel-item-img" v-for="(image, index) in note.images">
            <!-- 在img上加 preview-trigger -->
            <img class="note-image preview-trigger" :src="image" :alt="note.title" @click="openPreview(index)">
          </div>
        </div>

        <!-- 轮播指示器 -->
        <div class="carousel-indicator" id="carouselIndicator">
          <span id="currentSlide">{{ currentIndex + 1 }}</span> / <span id="totalSlides">{{ note.images.length }}</span>
        </div>

        <!-- 轮播控制按钮 -->
        <div class="carousel-control prev" @click="prevSlide">
          <i class="fa fa-angle-left"></i>
        </div>
        <div class="carousel-control next" @click="nextSlide">
          <i class="fa fa-angle-right"></i>
        </div>
      </div>

      <!-- 笔记内容区 -->
      <div class="note-content">
        <!-- 标题 -->
        <h1 class="note-title">{{ note.title }}</h1>

        <!-- 内容 -->
        <p class="note-text">
          {{ note.content }}<br><br>
        </p>

        <!-- 话题 -->
        <div class="note-tags">
          <span class="tag" v-for="topic in note.topics">
            {{ topic }}
          </span>
        </div>

        <!-- 操作栏 -->
        <div class="note-action-bar">
          <!-- 返回 -->
          <button class="btn btn-light btn-sm" @click="handleBack">
            <i class="fa fa-arrow-left"></i>
          </button>
          <!-- 编辑 -->
          <a :href="'/note/' + note.noteId + '/edit'">
            <button class="btn btn-light btn-sm" v-if="me.username === note.username">
              <i class="fa fa-edit"></i>
            </button>
          </a>
          <!-- 删除 -->
          <button class="btn btn-light btn-sm" v-if="me.username === note.username" @click="deleteNote">
            <i class="fa fa-trash"></i>
          </button>
          <!-- 分享 -->
          <button class="btn btn-light btn-sm">
            <i class="fa fa-share-alt"></i>
          </button>
          <!-- 点赞 -->
          <button class="btn btn-light btn-sm">
            <i class="fa fa-heart-o"></i>
          </button>
          <!-- 收藏 -->
          <button class="btn btn-light btn-sm">
            <i class="fa fa-star-o"></i>
          </button>
        </div>

        <!-- 作者信息 -->
        <div class="author-info">
          <!-- 点击作者头像跳转到作者详情页 -->
          <a :href="'/user/profile/' + note.userId">
            <img class="author-avatar" :src="note.avatar ? note.avatar : '/images/rn_avatar.png'" alt="作者头像">
          </a>

          <div>
            <div class="author-name">
              {{ note.username }}
            </div>
            <div class="author-meta">
              已获得 1024 粉丝
            </div>
          </div>
          <div class="author-follow" v-if="me.username != note.username">
            + 关注
          </div>
        </div>
      </div>

      <!-- 评论区 -->
      <div class="comments-section">
        <div class="comments-header">
          <div class="comments-title">
            评论区
          </div>
        </div>

        <!-- 评论输入框 -->
        <div class="comment-input">
          <img class="comment-avatar" src="/images/rn_avatar.png" alt="头像">
          <textarea class="comment-textarea" placeholder="分享你的想法..."></textarea>
          <div class="comment-btn">
            发送
          </div>
        </div>

        <!-- 评论列表 -->
        <div class="comment-list" id="commentList"></div>
      </div>
    </div>
  </main>

  <!-- 图片预览模态框 -->
  <div class="preview-modal" id="previewModal">
    <div class="preview-content">
      <img class="preview-image" id="previewImage" src="" alt="图片预览">
      <div class="preview-close" @click="closePreview">
        <i class="fa fa-times"></i>
      </div>
      <div class="preview-counter" id="previewCounter">
        <span id="previewCurrent">1</span> / <span id="previewTotal">{{ note.images.length }}</span>
      </div>
      <div class="preview-control prev" @click="previewPrev">
        <i class="fa fa-angle-left"></i>
      </div>
      <div class="preview-control next" @click="previewNext">
        <i class="fa fa-angle-right"></i>
      </div>
    </div>
  </div>

  <!-- 回复弹窗 -->
  <div class="modal" id="replyModal" tabindex="-1" aria-labelledby="replyModalLabel">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="replyModalLabel">回复 <span id="replyToUsername"></span></h5>
        </div>
        <div class="modal-body">
          <div class="reply-to-content"></div>
          <textarea class="form-control" id="replyContent" rows="3" placeholder="写下你的回复..."></textarea>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-light close-model" data-bs-dismiss="modal">取消</button>
          <button type="button" class="btn btn-danger" id="submitReply">提交回复</button>
        </div>
      </div>
    </div>
  </div>
</template>
<style setup>
/* 全局样式 */
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background-color: #f5f5f5;
}

/* 笔记内容区 */
.note-container {
  background-color: white;
  margin-bottom: 20px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.note-images {
  position: relative;
  background-color: #000;
}

.note-image {
  width: 100%;
  max-height: 60vh;
  object-fit: contain;
}

.note-content {
  padding: 20px;
}

.note-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
}

.note-text {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
}

.note-tags {
  margin-bottom: 20px;
}

.tag {
  display: inline-block;
  background-color: #f0f0f0;
  color: #666;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  margin-right: 8px;
  margin-bottom: 8px;
}

.note-action-bar {
  margin-bottom: 20px;
}

/* 作者信息 */
.author-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
}

.author-name {
  font-size: 16px;
  font-weight: 600;
}

.author-follow {
  margin-left: auto;
  background-color: #ff2442;
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
}

.author-follow.following {
  background-color: #f0f0f0;
  color: #666;
}

/* 评论区（第一部分）*/
.comments-section {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.comments-title {
  font-size: 18px;
  font-weight: 600;
}

.comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 12px;
}

.comment-input {
  display: flex;
  margin-bottom: 20px;
}

.comment-textarea {
  flex-grow: 1;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  resize: none;
  outline: none;
}

.comment-btn {
  margin-left: 12px;
  background-color: #ff2442;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.comment-item {
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}


/* 新增轮播和预览样式 */
.carousel-container {
  display: flex;
  transition: transform 0.5s ease;
}

.carousel-item-img {
  min-width: 100%;
  position: relative;
}

.carousel-indicator {
  position: absolute;
  bottom: 15px;
  right: 15px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 12px;
  z-index: 10;
}

.carousel-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: white;
  font-size: 24px;
  padding: 10px;
  cursor: pointer;
  z-index: 10;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.carousel-control:hover {
  opacity: 1;
}

.carousel-control.prev {
  left: 10px;
}

.carousel-control.next {
  right: 10px;
}

/* 图片预览模态框 */
.preview-modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  justify-content: center;
  align-items: center;
}

.preview-content {
  max-width: 90%;
  max-height: 90%;
  position: relative;
}

.preview-image {
  max-width: 100%;
  max-height: 85vh;
  object-fit: contain;
  cursor: pointer;
}

.preview-close {
  position: absolute;
  top: -40px;
  right: 0;
  color: white;
  font-size: 30px;
  cursor: pointer;
}

.preview-counter {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 14px;
}

.preview-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: white;
  font-size: 30px;
  cursor: pointer;
  padding: 20px;
}

.preview-control.prev {
  left: -60px;
}

.preview-control.next {
  right: -60px;
}

/* 去掉下划线 */
a {
  text-decoration: none;
}

/* 点赞按钮样式 */
.liked {
  color: #ff2442;
}

/* 评论区（第二部分）*/
.comment-user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 10px;
}

.comment-user-info {
  flex: 1;
}

.comment-username {
  font-weight: bold;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.comment-content {
  margin-left: 42px;
  margin-bottom: 10px;
}


.reply-btn,
.delete-comment {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 12px;
}

.delete-comment {
  margin-left: 10px;
}

.empty-comments {
  color: #999;
  text-align: center;
  padding: 20px 0;
}

/*评论回复*/
.reply-list {
  margin-left: 42px;
  margin-top: 10px;
  padding-left: 10px;
  border-left: 2px solid #f5f5f5;
}

.reply-item {
  margin-bottom: 10px;
}

.reply-header {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
}

.reply-username,
.reply-target {
  font-weight: bold;
  margin-right: 5px;
}

.reply-to {
  margin-right: 5px;
}

.reply-time {
  margin-left: 10px;
  font-size: 12px;
  color: #999;
}

.reply-content {
  margin-top: 5px;
  margin-left: 0;
}

.submit-reply {
  background-color: #ff2442;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
```

#### note-detail-dto.ts

新增`src\dto\note-detail-dto.ts`：


```ts
export class NoteDetailDto {
  noteId: number = 0;
  title: string = '';
  content: string = '';
  images: Array<string> = [];
  topics: Array<string> = [];
  category: string = '';
  username: string = '';
  userId: number = 0;
  avatar: string = '';
  likeCount: number = 0;
  liked: boolean = false;
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
      path: '/note/:noteId',
      name: 'note-detail',
      component: () => import('../views/NoteDetail.vue'),
      meta: { requiresAuth: true },
    }
  ],
})
```


### 运行调测

运行应用访问笔记详情页面进行操作，界面效果如下图5-4所示。


![图5-4 访问笔记详情页面进行操作](./images/5-4.png)
