---
title: "掌握前端搜索功能的核心要点"
published: 2026-08-25
description: "在网页中实现 <input 搜索功能通常涉及以下几个核心步骤：用户输入监听、搜索逻辑处理、结果展示和交互反馈。以下从前端实现到后端交互的完整流程进行解析，并提供代码示例。"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-12-2
pinned: false
comment: true
---

在网页中实现 `<input>` 搜索功能通常涉及以下几个核心步骤：用户输入监听、搜索逻辑处理、结果展示和交互反馈。以下从前端实现到后端交互的完整流程进行解析，并提供代码示例。


### 前端HTML设置

修改explore.html中搜索框的内容：

```html
<!-- 搜索框-->
<div class="col-md-3">
    <div class="input-group">
        <input class="form-control" type="text" placeholder="搜索感兴趣的内容" aria-label="Search"
                id="searchInput">
        <button class="btn btn-outline-secondary" type="button" id="searchButton">
            搜索
        </button>
    </div>
</div>
```

修改点：

* `<input>`增加了id属性
* 增加了`<button>`

### 搜索触发方式
- 实时获取：使用 `input` 事件监听用户输入，实时获取到搜索内容
- 按钮触发：添加搜索按钮，点击后执行搜索


以下代码实时获取到搜索内容，并缓存在searchContent变量中：

```javascript
// 缓存搜索的内容（确保在loadMoreNotes()执行前声明）
let searchContent = '';

// ...为节约篇幅，此处省略非核心内容

// 获取搜索输入框的值
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', function() {
        searchContent = this.value;
});
```


以下代码当点击搜索按钮时，触发执行搜索：

```javascript
// 搜索按钮执行搜索
document.getElementById('searchButton').addEventListener('click', function() {
    // 获取搜索输入框的值
    searchContent = document.getElementById('searchInput').value;

    // 执行搜索
    performSearch();
});

// 执行搜索
function performSearch() {
    // 重置笔记网格数据
    notesGrid.innerHTML = '';

    // 恢复初始状态值
    currentPage = 0;
    isLoading = false;
    hasMore = true;

    // 加载更多笔记
    loadMoreNotes();
};
```


### 分页导航点击事件处理

将与performSearch()代码逻辑一致的部分，重构为performSearch()。

```js
// 为分页导航添加点击事件
categoryItems.forEach(item => {
    item.addEventListener('click', () => {
        categoryItems.forEach(item => {
            item.classList.remove('active');
        });
        item.classList.add('active');

        // 以下代码重构为performSearch()
        /*
        // 重置笔记网格数据
        notesGrid.innerHTML = '';

        // 恢复初始状态值
        currentPage = 0;
        isLoading = false;
        hasMore = true;
        loadMoreNotes();
        */
        performSearch();

    });
});
```
### 重构loadMoreNotes()

重构loadMoreNotes()函数：

```js
// 加载更多笔记
function loadMoreNotes() {
        if (isLoading || !hasMore) {
            // 隐藏加载更多
            hideLoadMore();
            // 显示没有更多内容
            showNoMoreContent();
            return;
        }

        isLoading = true;
        // 显示加载更多
        showLoadMore();

        // 获取当前分类
        let category = document.querySelector('.category-item.active').textContent.trim();

        // 发送请求
        /*fetch(`/explore/note?page=${currentPage + 1}&category=${category}`)*/
        fetch(`/explore/note?page=${currentPage + 1}&category=${category}&query=${searchContent}`)
        
        // ...为节约篇幅，此处省略非核心内容
}
```


在发送AJAX请求时，传递query参数，值是searchContent。
