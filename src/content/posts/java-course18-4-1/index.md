---
title: "全栈视角下的用户模块前后端划分与功能全流程剖析"
published: 2026-08-25
description: "将仿\"小红书\"项目的用户模块从 Thymeleaf 后端渲染迁移到 Vue 3 前端渲染，需要对架构、交互模式和数据流向进行全面调整。以下是核心改造点和实施建议。"
image: ''
tags: [Vue, 前后端分离, 实战]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course18-4-1
pinned: false
comment: true
---

将仿"小红书"项目的用户模块从 Thymeleaf 后端渲染迁移到 Vue 3 前端渲染，需要对架构、交互模式和数据流向进行全面调整。以下是核心改造点和实施建议。


### 架构层面的核心变化

#### 1. 渲染模式转变
- Thymeleaf 模式：
  ```
  浏览器 → HTTP请求 → 后端控制器 → Thymeleaf模板 → HTML响应
  ```
- Vue 3 模式：
  ```
  浏览器 → 加载HTML骨架 → Vue初始化 → API请求 → 动态渲染
  ```

#### 2. 数据交互方式
- 传统方式：表单提交/页面跳转
- Vue 方式：
  ```javascript
  // 用户登录示例
  async login() {
    try {
      const { data } = await this.$axios.post('/api/users/login', {
        username: this.username,
        password: this.password
      });
      this.$store.commit('setUser', data.user);
      this.$router.push('/home');
    } catch (error) {
      this.$message.error(error.response.data.message);
    }
  }
  ```


### 渐进式迁移策略

1. 先构建 API 层：
   - 为现有用户模块开发 REST API 接口
   - 确保新旧系统可以共存

2. 组件级迁移：
   - 先迁移独立组件（如登录表单）
   - 再迁移完整页面（如个人主页、设置页面）

3. 路由过渡：
   - 逐步将 Thymeleaf 路由替换为 Vue Router
   - 使用代理服务器处理新旧路由

4. 状态管理整合：
   - 在迁移期间保持 Session 和 Token 并存
   - 确保用户在迁移过程中不会丢失会话


通过以上改造，用户模块将从后端渲染转变为前端渲染，实现更流畅的交互体验和更好的可维护性。关键是要处理好前后端分离后的状态管理、API 设计和渐进式迁移策略。


### 在 Vue 3 中实现分页序号生成

在 Vue 3 中，我们可以使用计算属性或方法来替代 Thymeleaf 的 `${#numbers.sequence(1, totalPage)}` 功能。以下是几种实现方式：


### 方法一：使用计算属性生成页码数组

```vue
<template>
  <div class="pagination">
    <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
    
    <button 
      v-for="page in pageNumbers" 
      :key="page" 
      :class="{ active: page === currentPage }"
      @click="goToPage(page)"
    >
      {{ page }}
    </button>
    
    <button @click="nextPage" :disabled="currentPage === totalPage">下一页</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const currentPage = ref(1);
const totalPage = ref(10); // 从API获取或计算得到

// 计算属性生成页码数组
const pageNumbers = computed(() => {
  return Array.from({ length: totalPage.value }, (_, i) => i + 1);
});

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPage.value) {
    currentPage.value++;
  }
};

const goToPage = (page) => {
  currentPage.value = page;
};
</script>

<style scoped>
.active {
  background-color: #007bff;
  color: white;
}
</style>
```


### 方法二：使用方法生成页码（带省略号）

```vue
<template>
  <div class="pagination">
    <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
    
    <button 
      v-for="page in getDisplayedPages" 
      :key="page" 
      :class="{ active: page === currentPage }"
      @click="goToPage(page)"
    >
      {{ page === '...' ? page : page }}
    </button>
    
    <button @click="nextPage" :disabled="currentPage === totalPage">下一页</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const currentPage = ref(1);
const totalPage = ref(15); // 从API获取或计算得到
const displayRange = ref(2); // 当前页面前后显示的页数

// 生成带省略号的页码数组
const getDisplayedPages = computed(() => {
  const pages = [];
  const start = Math.max(1, currentPage.value - displayRange.value);
  const end = Math.min(totalPage.value, currentPage.value + displayRange.value);
  
  // 添加第一页
  pages.push(1);
  
  // 添加左侧省略号
  if (start > 2) {
    pages.push('...');
  }
  
  // 添加中间页码
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  // 添加右侧省略号
  if (end < totalPage.value - 1) {
    pages.push('...');
  }
  
  // 添加最后一页
  if (totalPage.value > 1) {
    pages.push(totalPage.value);
  }
  
  return pages;
});

// 其他方法保持不变
</script>
```


### 方法三：封装为可复用组件

```vue
<!-- Pagination.vue -->
<template>
  <div class="pagination">
    <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
    
    <button 
      v-for="page in getDisplayedPages" 
      :key="page" 
      :class="{ active: page === currentPage }"
      @click="goToPage(page)"
    >
      {{ page === '...' ? page : page }}
    </button>
    
    <button @click="nextPage" :disabled="currentPage === totalPage">下一页</button>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue';

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPage: {
    type: Number,
    required: true
  },
  displayRange: {
    type: Number,
    default: 2
  }
});

const emits = defineEmits(['page-change']);

// 生成带省略号的页码数组
const getDisplayedPages = computed(() => {
  // 实现同上一个示例
});

const prevPage = () => {
  if (props.currentPage > 1) {
    emits('page-change', props.currentPage - 1);
  }
};

const nextPage = () => {
  if (props.currentPage < props.totalPage) {
    emits('page-change', props.currentPage + 1);
  }
};

const goToPage = (page) => {
  if (page !== '...') {
    emits('page-change', page);
  }
};
</script>
```

在父组件中使用：
```vue
<template>
  <div>
    <Pagination 
      :currentPage="currentPage" 
      :totalPage="totalPage" 
      @page-change="handlePageChange" 
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Pagination from './components/Pagination.vue';

const currentPage = ref(1);
const totalPage = ref(10);

const handlePageChange = (page) => {
  currentPage.value = page;
  // 加载新页面的数据
  fetchData(page);
};
</script>
```


### Vue 3 与 Thymeleaf 的对比

| 功能                | Thymeleaf                          | Vue 3                          |
|---------------------|------------------------------------|--------------------------------|
| 生成页码数组        | `${#numbers.sequence(1, totalPage)}` | `Array.from({length: totalPage}, (_, i) => i + 1)` |
| 条件渲染            | `th:if`                            | `v-if`                         |
| 循环渲染            | `th:each`                          | `v-for`                        |
| 事件处理            | `th:onclick`                       | `@click`                       |
| 样式绑定            | `th:classappend`                   | `:class`                       |
| 文本绑定            | `th:text`                          | `v-text`                       |
