---
title: "AI辅助编程快速实现用户信息展示页面"
published: 2026-08-25
description: "新增src\\views\\UserProfile.vue"
image: ''
tags: [Vue, 前后端分离, 实战]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course18-4-8
pinned: false
comment: true
---

### 前端组件设计


#### UserProfile.vue

新增`src\views\UserProfile.vue`：

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { NoteExploreDto } from '@/dto/note-explore-dto'
import { User } from '@/dto/user'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { useRouter } from "vue-router"

const user = ref<User>(new User())
const authStore = useAuthStore()
const me = ref<User>(new User())
const noteList = ref<Array<NoteExploreDto>>([])
const totalPages = ref<number>(0)
const currentPage = ref<number>(0)
const route = useRoute()
const router = useRouter()

// 注销
function logout() {
  authStore.logout()

  // 跳转到登录页面
  router.push({ name: 'login' })
}

// 从路由里面获取用户ID
const userId = ref(route.params.userId)

// 构造查询参数pageIndex，默认从1开始
const pageIndex = ref(route.query.page || 1)

onMounted(() => {
  // 获取用户信息
  fetchUserProfile(userId.value, pageIndex.value)

  // 获取当前用户信息
  me.value = authStore.getUser ? authStore.getUser : new User()
})

const fetchUserProfile = async (userId: any, pageIndex: any) => {
  // 调用API获取用户信息
  try {
    const response = await axios.get(`/api/user/profile/${userId}?page=${pageIndex}`)
    user.value = response.data['user']
    currentPage.value = response.data['currentPage']
    totalPages.value = response.data['totalPages']
    noteList.value = response.data['noteList']
  } catch (error) {
    console.error('获取用户信息失败：' + error)
  }
}
</script>

<template>
  <!-- 导航栏 -->
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container">
      <a class="navbar-brand" href="/">
        <img src="/images/rn_logo.png" alt="RN" height="24">
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
        aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <a class="nav-link" href="#">
              {{ user.username }}
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/user/profile">个人资料</a>
          </li>
          <li class="nav-item">
            <!-- 注销 -->
            <a class="nav-link" href="#" @click="logout">退出登录</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <!-- 主体部分 -->
  <div class="container mt-5">
    <div class="row justify-content-center">
      <!-- 用户个人信息 -->
      <div class="row col-md-8">
        <div class="col-md-4 text-center">
          <img :src="user.avatar ? user.avatar : '/images/rn_avatar.png'" class="rounded-circle" alt="用户头像" height="88"
            width="88">
          <p class="mt-3">{{ user.username }}</p>

          <!-- 仅作者自己可见 -->
          <div v-if="me.username === user.username">
            <a href="/user/edit" class="btn btn-primary btn-sm">编辑资料</a>
          </div>

        </div>

        <div class="col-md-8">
          <dive class="mb-3">
            <label class="form-label">RN号：{{ user.userId }}</label>
          </dive>
          <dive class="mb-3">
            <p class="form-control-plaintext">{{ user.bio ? user.bio : '这家伙很懒，什么都没写' }}</p>
          </dive>

          <!-- 仅作者自己可见 -->
          <div v-if="me.username === user.username">
            <a href="/user/change-password" class="btn btn-outline-secondary">修改密码</a>
          </div>
        </div>
      </div>

      <!-- 笔记列表 -->
      <div class="col-md-8">
        <!-- 空状态提示 -->
        <div class="empty-state" v-if="noteList.length === 0">
          <div class="empty-icon">
            <i class="fa fa-file-o"></i>
          </div>
          <div class="empty-text">
            还没有发布任何笔记
          </div>
          <!-- 仅作者自己可见 -->
          <div v-if="me.username == user.username">
            <a href="/note/publish" class="create-note-btn">
              <i class="fa fa-plus"></i>
              发布第一篇笔记
            </a>
          </div>
        </div>

        <!-- 非空状态提示 -->
        <div class="note-grid" v-if="noteList.length > 0">
          <!-- 循环遍历笔记列表生成笔记卡片 -->
          <div class="note-card" v-for="note in noteList">
            <a :href="'/note/' + note.noteId">
              <img :src="note.cover" class="note-image" alt="note.title">
            </a>
            <div class="note-content">
              <dive class="note-title">
                {{ note.title }}
              </dive>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页导航 -->
      <div class="col-md-8">
        <div class="pagination" v-if="totalPages > 0">
          <a class="page-btn" v-if="currentPage > 1"
            :href="'/user/profile/' + user.userId + '?page=' + (currentPage - 1)">«</a>

          <a class="page-btn" v-for="pageNum in Array.from({ length: totalPages }, (_, i) => i + 1)"
            :href="'/user/profile/' + user.userId + '?page=' + pageNum" :class="{ active: pageNum === currentPage }">{{
              pageNum }}</a>

          <a class="page-btn" v-if="currentPage < totalPages"
            :href="'/user/profile/' + user.userId + '?page=' + (currentPage + 1)">»</a>
        </div>
      </div>
    </div>
  </div>
</template>
<style setup>
/* 小红书风格 */
* {
  font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: #f5f5f5;
}

/* 顶部导航栏 */
.header {
  position: sticky;
  top: 0;
  background-color: white;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #f0f0f0;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.user-meta {
  font-size: 12px;
  color: #666;
}

.action-btn {
  margin-left: auto;
  font-size: 14px;
  color: #ff2442;
}

/* 笔记列表 */
.note-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  padding: 16px;
}

.note-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s;
}

.note-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.note-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.note-content {
  padding: 12px;
}

.note-title {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  color: #333;
  margin-bottom: 8px;
}

.note-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

/* 空状态提示 */
.empty-state {
  padding: 48px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: #e0e0e0;
  margin-bottom: 16px;
}

.empty-text {
  color: #999;
  margin-bottom: 24px;
}

.create-note-btn {
  background-color: #ff2442;
  color: white;
  padding: 10px 24px;
  border-radius: 24px;
  font-weight: 500;
}

/* 分页组件 */
.pagination {
  padding: 24px;
  display: flex;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
}

.page-btn {
  padding: 6px 12px;
  border-radius: 4px;
  color: #666;
  text-decoration: none;
}

.page-btn.active {
  background-color: #ff2442;
  color: white;
  font-weight: 500;
}
</style>
```

### `useRouter()` 和 `useRoute()` 的区别


在 Vue 3 中，`router` 对象（通过 `useRouter()` 获取）没有 `params` 属性，而是需要通过 `useRoute()` 来获取当前路由的参数。


区分 `useRoute()` 和 `useRouter()`如下表所示。


| API               | 用途                          | 主要属性/方法                          |
|-------------------|-------------------------------|----------------------------------------|
| `useRoute()`      | 获取当前路由信息              | `params`, `query`, `path`, `fullPath`  |
| `useRouter()`     | 执行路由导航操作              | `push`, `replace`, `go`, `back`        |


#### user.ts

新增`src\dto\user.ts`：


```ts
export class User {
  userId: number = 0;
  username: string = '';
  password: string = '';
  phone: string = '';
  avatar: string = '';
  bio: string = '';
  role: string = '';
}
```


#### note-explore-dto.ts

新增`src\dto\note-explore-dto.ts`：


```ts
export interface NoteExploreDto {
  noteId: number;
  title: string;
  cover: string;
  username: string;
  avatar: string;
  userId: string;
  liked: boolean;
  likeCount: number;
}
```
