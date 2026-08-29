---
title: "攻克多图选择及多次选择的难点"
published: 2026-08-25
description: "本节实现"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-7-4
pinned: false
comment: true
---

本节实现

1. 为图片上传组件添加预览功能，让用户可以实时看到上传的图片
2. 实现图片的动态添加和删除功能，提升用户体验
3. 设计提交按钮，并添加点击事件，在提交前进行表单验证

### 图片预览、多图选择及多次选择

在 HTML 中，`<input type="file" multiple>` 允许用户一次选择多个文件。然而，这个功能本身并不支持“多次选择”同一个文件输入框中的文件。用户每次点击文件选择对话框时，只能选择一组新的文件，这些文件会替换之前选择的文件。

如果你希望实现多次选择文件的功能（即用户可以选择文件多次，并将所有选择的文件累积到一个列表中），你需要使用 JavaScript 来实现这个功能。以下是一个简单的实现方案：


```js
<script>
    // ...为节约篇幅，此处省略非核心内容

    // 收集选择的文件
    let selectedFiles = [];

    // 监听文件的选择
    document.getElementById("imageUpload").addEventListener("change", function (event) {
        // 获取选择的文件
        const files = Array.from(event.target.files);

        // 添加到已收集的选择数组里面去
        selectedFiles = selectedFiles.concat(files);

        // 更新文件列表显示
        updateFileList();
    })


    // 获取已上传图片预览的 DOM 元素
    const uploadedImages = document.getElementById("uploadedImages");

    // 更新文件列表显示
    function updateFileList() {
        // 清空图片预览
        uploadedImages.innerHTML = "";

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
                imagePreview.src = e.target.result;
            }
            reader.readAsDataURL(selectedFiles[i]);

            uploadedImages.appendChild(fileItem);
        }
    }

    // 删除预览文件
    function deleteFile(i) {
        selectedFiles.splice(i, 1);
        updateFileList();
    }

    // 取消发布的事件处理
    document.getElementById("cancelPublishBtn").addEventListener("click", function (event) {
        // 用户确认是否取消发布
        if (confirm("确定要取消发布吗？所有内容将不会被保存")) {
            window.history.back();
        }
    })
});

</script>
```


上述代码：

* 可以通过使用 FileReader 来实现图片的预览功能。FileReader 允许我们读取文件的内容，并将其转换为 Data URL，这样我们就可以直接在 <img> 标签中显示图片
* updateFileList 函数现在为每个文件项添加了一个删除按钮。
* deleteFile 函数用于从 selectedFiles 数组中删除指定索引的文件，并更新文件列表显示。


### 如何将文件数组赋值给 `<form>`？


在 JavaScript 中，`<form>` 元素不能直接接收文件数组作为其内容。文件数组通常是指用户通过 `<input type="file">` 元素选择的文件列表，这些文件需要以特定的方式添加到表单中，以便在提交表单时能够上传到服务器。

如果你希望将文件数组的内容上传到服务器，通常需要使用 FormData 对象来构建表单数据，然后通过 POST 请求发送这些数据。

如果你需要模拟文件选择或拖放操作，可以使用 DataTransfer 对象来构建一个文件列表，然后通过编程的方式将其赋值给一个 `<input type="file">` 元素。


以下示例展示了如何将将文件数组赋值给 `<form>`：

```js
// 在发布按钮上设置点击事件
document.getElementById("publishNoteBtn").addEventListener("click", function (event) {
    // ...为节约篇幅，此处省略非核心内容

    // 将收集到的图片上传，需要创建DataTransfer对象
    const dataTransfer = new DataTransfer();
    for (let i = 0; i < selectedFiles.length; i++) {
        // 将文件添加到DataTransfer对象中
        dataTransfer.items.add(selectedFiles[i]);
    }

    // 将DataTransfer对象设置给上传文件的input元素
    document.getElementById("imageUpload").files = dataTransfer.files;

    // 提交表单
    document.getElementById("noteForm").submit();
})
```
