---
title: "笔记详情页图放大预览功能实现"
published: 2026-08-25
description: "修改HTML部分，添加图片预览模态框"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-9-9
pinned: false
comment: true
---

### 图片放大预览功能


修改HTML部分，添加图片预览模态框：

```html
<head>
    <!-- 原有头部内容 -->
    <style>
        /* 原有轮播和预览样式 */
 
        
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
    </style>
</head>
<body>
    <!-- 主内容区 -->
    <main class="container py-4 main-content">
          <!-- 原有主内容区 -->
 
          <!-- img 上加 preview-trigger--> 
          <img class="note-image preview-trigger" th:src="${image}" 
                th:alt="${note.title}" th:attr="data-index=${stat.index}">
    </main>
    
    <!-- 图片预览模态框 -->
    <div class="preview-modal" id="previewModal">
        <div class="preview-content">
            <img class="preview-image" id="previewImage" src="" alt="图片预览">
            <div class="preview-close" onclick="closePreview()">
                <i class="fa fa-times"></i>
            </div>
            <div class="preview-counter" id="previewCounter">
                <span id="previewCurrent">1</span> / <span id="previewTotal">[[${note.images.size()}]]</span>
            </div>
            <div class="preview-control prev" onclick="previewPrev()">
                <i class="fa fa-angle-left"></i>
            </div>
            <div class="preview-control next" onclick="previewNext()">
                <i class="fa fa-angle-right"></i>
            </div>
        </div>
    </div>
    
    <script>
        // ...为节约篇幅，此处省略非核心内容

        // 预览图片功能实现
        const previewImage = document.getElementById('previewImage');
        const previewModal = document.getElementById('previewModal');
        const previewCurrent = document.getElementById('previewCurrent');
        const previewClose = document.querySelector('.preview-close');

        // 打开预览
        function openPreview(index) {
            console.log("openPreview " + index);

            currentSlideNum = index + 1;
            previewImage.src = carouselItems[index].querySelector('img').src;
            previewCurrent.textContent = currentSlideNum;
            previewModal.style.display = 'flex';

            // 防止背景滚动
            document.body.style.overflow = 'hidden';
        }

        // 关闭预览
        function closePreview() {
            previewModal.style.display = 'none';

            // 恢复背景滚动
            document.body.style.overflow = '';

            // 更新轮播位置
            updateCarouselPosition();
        }

        // 预览上一张
        function previewPrev() {
            currentSlideNum = Math.max(1, currentSlideNum - 1);
            previewImage.src = carouselItems[currentSlideNum - 1].querySelector('img').src;
            previewCurrent.textContent = currentSlideNum;
        }

        // 预览下一张
        function previewNext() {
            currentSlideNum = Math.min(carouselItems.length, currentSlideNum + 1);
            previewImage.src = carouselItems[currentSlideNum - 1].querySelector('img').src;
            previewCurrent.textContent = currentSlideNum;
        }

        // 为所有preview-trigger类型图片添加点击事件
        const previewTriggers = document.querySelectorAll('.preview-trigger');
        previewTriggers.forEach((trigger, index) => {
            trigger.addEventListener('click', () => {
                openPreview(index);
            });
        });

        // 为关闭按钮添加点击事件
        previewClose.addEventListener('click', closePreview);

        // 键盘导航
        document.addEventListener('keydown', (event) => {
            if (previewModal.style.display === 'flex') {
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
        })
    </script>
</body>
</html>
```


### 运行调测

下图9-6、9-7展示的是图片放大预览的效果。

![图9-6 放大预览图片1](./images/9-6.png)


![图9-7 放大预览图片2](./images/9-7.png)
