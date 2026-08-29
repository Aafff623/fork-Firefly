---
title: "全栈实战笔记详情页图放大预览功能"
published: 2026-08-25
description: "定义三个ref"
image: ''
tags: [Vue, 前后端分离, 实战]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course18-5-5
pinned: false
comment: true
---

定义三个ref

```ts
const previewModalVisible = ref(false);
const previewModalRef = ref<HTMLDivElement | null>(null);
const previewCurrentIndex = ref(0);
```

监听键盘按键事件


```ts
onMounted(() => {
  // ...为节约篇幅，此处省略非核心内容

  // 监听键盘按键
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  if (previewModalVisible.value) {
    switch (event.key) {
      case 'Escape':
        closePreview();
        break;
      case 'ArrowLeft':
        previewPrev();
        break;
      case 'ArrowRight':
        previewNext();
        break;
    }
  }
};
```

放大预览功能逻辑如下：

```ts
<script setup lang="ts">

// ...为节约篇幅，此处省略非核心内容

// 打开预览
function openPreview(index: number) {
  console.log("openPreview " + index);
  previewCurrentIndex.value = index;
  previewModalVisible.value = true;

  if (previewModalRef.value) {
    previewModalRef.value.style.display = 'flex';
  }

  // 防止背景滚动
  document.body.style.overflow = 'hidden';
}

// 关闭预览
function closePreview() {
  previewModalVisible.value = false;

  if (previewModalRef.value) {
    previewModalRef.value.style.display = 'none';
  }

  // 恢复背景滚动
  document.body.style.overflow = '';
  // 更新轮播位置
  updateCarouselPosition();
}

// 预览上一张
function previewPrev() {
  if (note.value.images && note.value.images.length > 0) {
    previewCurrentIndex.value = Math.max(0, previewCurrentIndex.value - 1);
  }
}

// 预览下一张
function previewNext() {
  if (note.value.images && note.value.images.length > 0) {
    previewCurrentIndex.value = Math.min(note.value.images.length - 1, previewCurrentIndex.value + 1);
  }
}
</script>

<template>

  <!-- ...为节约篇幅，此处省略非核心内容 -->

  <!-- 图片预览模态框 -->
  <div class="preview-modal" id="previewModal" ref="previewModalRef" v-show="previewModalVisible">
    <div class="preview-content">
      <img class="preview-image" id="previewImage" :src="note.images[previewCurrentIndex]"
        v-if="note.images && note.images.length > 0" alt="图片预览">
      <div class="preview-close" @click="closePreview">
        <i class="fa fa-times"></i>
      </div>
      <div class="preview-counter" id="previewCounter">
        <span id="previewCurrent">{{ previewCurrentIndex + 1 }}</span> / <span id="previewTotal">{{ note.images?.length
          || 0 }}</span>
      </div>
      <div class="preview-control prev" @click="previewPrev">
        <i class="fa fa-angle-left"></i>
      </div>
      <div class="preview-control next" @click="previewNext">
        <i class="fa fa-angle-right"></i>
      </div>
    </div>
  </div>

  <!-- ...为节约篇幅，此处省略非核心内容 -->
</template>
```
