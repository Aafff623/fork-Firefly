---
title: "掌握Thymeleaf模板片段，解决页面重复开发痛点"
published: 2026-08-25
description: "本章节将介绍如何来使用 Thymeleaf 模板片段。"
image: ''
tags: [Java, Thymeleaf, 模板引擎]
category: 指南
collections: [java-fullstack, java-fullstack-frontend-basic]
draft: false
lang: ''
slug: java-course4-4-1
pinned: false
comment: true
---

本章节将介绍如何来使用 Thymeleaf 模板片段。

Thymeleaf 模板片段的目的，就是让模板片段可以在多个页面实现重用，从而减少了代码量，也使整个页面更加的“模块化”。

### 定义和引用片段

在我们的模板中，我们经常需要从其他模板中添加 HTML 页面片段，如页脚、标题、菜单等，这些页面片段由于在各个页面都会被引用到，所以设置为页面片段，从而实现页面片段的重用。

为了做到这一点，Thymeleaf 需要我们来定义这些“片段”，可以使用`th:fragment`属性来完成。

我们定义了`/WEB-INF/templates/footer.html`页面作为例子。

```html
<!DOCTYPE html>

<html xmlns:th="http://www.thymeleaf.org">

  <body>
  
    <div th:fragment="copy">
      &copy; 2017 <a href=""></a>
    </div>
  
  </body>
  
</html>
```

如果，我们想引用这个 `copy` 代码片段，我们可以用 `th:insert` 或 `th:replace` 属性（`th:include` 也是可以实现类似功能，但自 Thymeleaf 3.0 以来就不再推荐使用了）:


```html
<body>

  ...

  <div th:insert="~{footer :: copy}"></div>
  
</body>
```

注意`th：insert`需要一个“片段表达式（`〜{...}`）”。 在上面的例子中，“片段表达式（`〜{`，`}`）”是完全可选，所以上面的代码将等效于：


```html
<body>

  ...

  <div th:insert="footer :: copy"></div>
  
</body>
```

### Thymeleaf 片段规范语法

以下是 Thymeleaf 片段规范语法：

 * `"~{templatename::selector}"` 名为`templatename`的模板上的指定标记选择器。 `selector`可以只是一个片段名；
 * `"~{templatename}"` ： 包含完整的模版 `templatename`；
 * `~{::selector}"` 或 `"~{this::selector}"` ： 是指相同模版中的代码片段。
   
### 不使用 `th:fragment`

 不使用 `th:fragment`也可以引用HTML片段，比如：
 

```html
...
<div id="copy-section">
  &copy; 2017 <a href=""></a>
</div>
...
```

通过 id 也可以引用到页面片段:

```html
<body>

  ...

  <div th:insert="~{footer :: #copy-section}"></div>
  
</body>
```

### `th:insert`、 `th:replace` 、`th:include`三者区别

`th:insert`、 `th:replace` 、`th:include`三者都能实现片段的引用，但在最终的实现效果上还是存在差异。其中：

* `th：insert`是最简单的，它将简单地插入指定的片段作为正文的主标签；
* `th：replace`用指定实际片段来替换其主标签；
* `th：include`类似于`th：insert`，但不是插入片段它只插入此片段的“内容”。

所以考虑下面的例子：


```html
<footer th:fragment="copy">
  &copy; 2017 <a href=""></a>
</footer>
```

三种方式同时引用该片段：

```html
<body>

  ...

  <div th:insert="footer :: copy"></div>

  <div th:replace="footer :: copy"></div>

  <div th:include="footer :: copy"></div>
  
</body>
```

结果为：

```html
<body>

  ...

  <div>
    <footer>
      &copy; 2017 <a href=""></a>
    </footer>
  </div>

  <footer>
    &copy; 2017 <a href=""></a>
  </footer>

  <div>
    &copy; 2017 <a href=""></a>
  </div>
  
</body>
```
