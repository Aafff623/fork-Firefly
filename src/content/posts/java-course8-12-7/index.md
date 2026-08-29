---
title: "设计瀑布流布局实现方案"
published: 2026-08-25
description: "瀑布流布局是小红书等内容平台常用的设计方式，它可以根据内容高度自动调整位置，形成错落有致的视觉效果，提升用户浏览体验。"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-12-7
pinned: false
comment: true
---

瀑布流布局是小红书等内容平台常用的设计方式，它可以根据内容高度自动调整位置，形成错落有致的视觉效果，提升用户浏览体验。


### 瀑布流布局的优势与特点

1. 视觉优势：
   - 错落有致的布局，提升视觉吸引力
   - 充分利用空间，减少空白区域
   - 适应不同高度的内容，保持整体和谐

2. 用户体验：
   - 浏览体验更自然，减少频繁滚动
   - 内容呈现更有层次感，突出重点
   - 增加内容曝光机会，提高参与度

3. 响应式设计：
   - 移动端使用1列或者2列布局
   - 平板使用3列布局
   - 桌面端使用4列布局


### CSS样式


修改explore.html增加如下样式：

```css
/* 瀑布流布局 */
.masonry {
    column-count: 4;
    column-gap: 1em;
    padding: 10;
}
.masonry-item {
    display: inline-block;
    margin: 0 0 1.5em;
    width: 100%;
}

.masonry-note-image {
    border-radius: 12px;
    width: 100%;
    height: auto;
}

@media only screen and (max-width: 320px) {
    .masonry {
        column-count: 1;
    }
}

@media only screen and (min-width: 321px) and (max-width: 768px){
    .masonry {
        column-count: 2;
    }
}
@media only screen and (min-width: 769px) and (max-width: 1200px){
    .masonry {
        column-count: 3;
    }
}
@media only screen and (min-width: 1201px) {
    .masonry {
        column-count: 4;
    }
}
```


### HTML应用样式

```html
<!-- 笔记卡片网格 -->
<!--<div class="notes-grid" id="notesGrid">-->
<div class="masonry" id="notesGrid">
    <!-- 笔记卡片是通过JavaScript动态生成 -->
</div>
```

### 创建笔记元素应用样式

```html
// 创建笔记卡片元素
function createNoteElement(note) {
    const noteElement = document.createElement("div");
    noteElement.className = "masonry-item";
    noteElement.innerHTML = `
        <!--<div class="note-image-container">-->
            <!-- 点击跳转到笔记详情页 -->
            <a href="/note/${note.noteId}">
                <!--<img class="note-image" src="${note.cover}" alt="${note.title}">-->
                <img class="masonry-note-image" src="${note.cover}" alt="${note.title}">
            </a>
        <!--</div>-->

        <!-- ...为节约篇幅，此处省略非核心内容 -->
 
    `;

    return noteElement;
}
```

在`img`上增加masonry-note-image类型样式，同时去除note-image-container类型的`div`。


### 瀑布流布局演示

下面是将小红书首页笔记卡片改为瀑布流布局的效果演示方案。

大尺寸设备效果如下图12-8所示。


![图12-8 大尺寸设备效果](./images/12-8.png)


中等尺寸设备效果如下图12-9所示。


![图12-9 中等尺寸设备效果](./images/12-9.png)


小尺寸设备效果如下图12-10所示。


![图12-10 小尺寸设备效果](./images/12-10.png)


通过以上实现，你可以将小红书首页的笔记卡片从传统网格布局改为瀑布流布局，提升用户体验和内容展示效果。
