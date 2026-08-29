---
title: "掌握无限滚动刷新加载笔记内容生成笔记卡片网格的秘笈"
published: 2026-08-25
description: "修改explore.html，在<script增加如下内容"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-11-3
pinned: false
comment: true
---

修改explore.html，在`<script>`增加如下内容：

```js
<script>
    let currentPage = 0;
    let isLoading = false;
    let hasMore = true;
    loadMoreNotes();

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
        fetch(`/explore/note?page=${currentPage + 1}&category=${category}`)
            .then(response => response.json())
            .then(data => {
                if (data.notes && data.notes.length > 0) {
                    currentPage++;
                    // 添加笔记列表到网格布局中
                    appendNotes(data.notes);
                    hasMore = data.hasMore;
                } else {
                    hasMore = false;
                }

                isLoading = false;
                // 隐藏加载更多
                hideLoadMore();

                if (!hasMore) {
                    // 显示没有更多内容
                    showNoMoreContent();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                isLoading = false;
                // 隐藏加载更多
                hideLoadMore();
            });
    }

    // 隐藏加载更多
    function hideLoadMore() {
        document.getElementById("loadMore").style.display = "none";
    }

    // 显示没有更多内容
    function showNoMoreContent() {
        document.getElementById("noMoreContent").style.display = "block";
    }

    // 显示加载更多
    function showLoadMore() {
        document.getElementById("loadMore").style.display = "block";
    }

    const notesGrid = document.getElementById("notesGrid");
    // 添加笔记列表到网格布局中
    function appendNotes(notes) {
        for (let i = 0; i < notes.length; i++) {
            const note = notes[i];

            // 创建笔记卡片元素
            const noteElement = createNoteElement(note);

            notesGrid.appendChild(noteElement);
        }
    }

    // 创建笔记卡片元素
    function createNoteElement(note) {
        const noteElement = document.createElement("div");
        noteElement.className = "masonry-item";
        noteElement.innerHTML = `
            <div class="note-image-container">
                <img class="note-image" src="${note.cover}" alt="${note.title}">
            </div>
            <div class="note-content">
                <div class="note-title">${note.title}</div>
                <div class="note-author-stats">
                    <div class="note-author">
                        <img class="author-avatar" src="${note.avatar ? note.avatar : '/images/rn_avatar.png'}" alt="${note.username}">
                        <span class="author-name">${note.username}</span>
                    </div>
                    <div class="note-stats">
                        <div class="stat-item">
                            <i class="fa fa-heart-o">1024</i>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return noteElement;
    }


    const categoryItems = document.querySelectorAll('.category-item');

    // 为分页导航添加点击事件
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            categoryItems.forEach(item => {
                item.classList.remove('active');
            });
            item.classList.add('active');

            // 重置笔记网格数据
            notesGrid.innerHTML = '';

            // 恢复初始状态值
            currentPage = 0;
            isLoading = false;
            hasMore = true;
            loadMoreNotes();
        });
    });

    // 监听滚动事件
    window.addEventListener('scroll', function() {
        console.log('scroll');

        if (isLoading || !hasMore) {
            return;
        }

        console.log('scroll before');

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        console.log('scrollTop: ' + scrollTop);
        console.log('windowHeight: ' + windowHeight);
        console.log('documentHeight: ' + documentHeight);

        if (scrollTop + windowHeight >= documentHeight - 300) {
            loadMoreNotes();
        }

        console.log('scroll after');
    });
</script>
```
