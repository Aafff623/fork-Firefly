---
title: "快速掌握属性绑定黑科技：多种场景破解模板硬编码困局"
published: 2026-08-25
description: "介绍如何在标记中设置（或修改）属性值的方式。"
image: ''
tags: [Java, Thymeleaf, 模板引擎]
category: 指南
collections: [java-fullstack, java-fullstack-frontend-basic]
draft: false
lang: ''
slug: java-course4-3-2
pinned: false
comment: true
---

### 设置任意属性值

`th:attr` 用于设置任意属性：
 
```html
<form action="subscribe.html" th:attr="action=@{/subscribe}">
  <fieldset>
    <input type="text" name="email" />
    <input type="submit" value="Subscribe!" th:attr="value=#{subscribe.submit}"/>
  </fieldset>
</form>
```

`th:attr`会将表达式的结果，设置到相应的属性中去。上面模板结果如下：

```html
<form action="/gtvg/subscribe">
  <fieldset>
    <input type="text" name="email" />
    <input type="submit" value="¡Suscríbe!"/>
  </fieldset>
</form>
```

我们也能同时设置多个属性值：

```html
<img src="../../images/gtvglogo.png" 
     th:attr="src=@{/images/gtvglogo.png},title=#{logo},alt=#{logo}" />
```

输出如下:

```html
<img src="/gtgv/images/gtvglogo.png" title="Logo de Good Thymes" alt="Logo de Good Thymes" />
```

### 设置值到指定的属性

使用 `th:attr` 来设置属性的好处是，我们可以设置任意命名的属性，这样方便自定义自己的属性。但是，缺点也很明显，如果使用任何属性，都是采用自定义的方式，那么，属性的维护有时就会变得很困难。考虑下面的示例：

```html
<input type="submit" value="Subscribe!" th:attr="value=#{subscribe.submit}"/>
```

上面可以指定了一个自定义属性`value`的值，这在语法上完全没有问题，但这并不是最佳的方式。因为，Thymeleaf 已经提供了属性名为`value`的属性。通常，你将使用其他的`th：*`属性设置 Thymeleaf 特定的标签属性（而不仅仅是像`th:attr`”`这样的任意属性）。

例如，要设置`value`属性，我们可以使用`th:value`：

```html
<input type="submit" value="Subscribe!" th:value="#{subscribe.submit}"/>
```

要设置 `action` 属性，使用`th:action`：
 

```html
<form action="subscribe.html" th:action="@{/subscribe}">
```

Thymeleaf 提供了很多属性，每个都针对特定的 HTML5 属性，比如`th:abbr`、`th:action`、`th:background`、`th:form`、`th:height`、`th:style`等等。


### 同时设置多个值


`th:alt-title` 和 `th:lang-xmllang` 是两个特殊的属性，可以同时设置同一个值到两个属性：

 * `th:alt-title` 用于设置 `alt` 和 `title`
 * `th:lang-xmllang` 用于设置 `lang` 和 `xml:lang`

观察下面的示例：

```html
<img src="../../images/gtvglogo.png" 
     th:attr="src=@{/images/gtvglogo.png},title=#{logo},alt=#{logo}" />
```

这个例子等价于:

```html
<img src="../../images/gtvglogo.png" 
     th:src="@{/images/gtvglogo.png}" th:alt-title="#{logo}" />
```

两者最终的结果都是：

```html
<img src="../../images/gtvglogo.png" 
     th:src="@{/images/gtvglogo.png}" th:title="#{logo}" th:alt="#{logo}" />
```


### 附加和添加前缀


`th:attrappend` 和 `th:attrprepend` 用于附加和添加前缀属性。例如：


```html
<input type="button" value="Do it!" class="btn" th:attrappend="class=${' ' + cssStyle}" />
```

执行模版， `cssStyle` 变量设置为 `"warning"`时，输出如下：

```html
<input type="button" value="Do it!" class="btn warning" />
```

同时，有 `th:classappend` 和 `th:styleappend` 用于设置 CSS 的 class 和 style。例如：

```html
<tr th:each="prod : ${prods}" class="row" th:classappend="${prodStat.odd}? 'odd'">
```


### 固定值布尔属性

HTML具有布尔属性的概念，没有值的属性意味着该值为“true”。 在XHTML中，这些属性只取一个值，即它本身。

例如，属性`checked`的用法:

```html
<input type="checkbox" name="option2" checked /> <!-- HTML -->
<input type="checkbox" name="option1" checked="checked" /> <!-- XHTML -->
```


标准方言包括允许您通过评估条件来设置这些属性，如果评估为true，则该属性将被设置为其固定值，如果评估为false，则不会设置该属性：

```html
<input type="checkbox" name="active" th:checked="${user.active}" />
```

标准方言中存在以下固定值布尔属性：


<div class="table-scroller">
<table>
<tbody>
<tr class="odd">
<td style="text-align: left;"><code>th:async</code></td>
<td style="text-align: left;"><code>th:autofocus</code></td>
<td style="text-align: left;"><code>th:autoplay</code></td>
</tr>
<tr class="even">
<td style="text-align: left;"><code>th:checked</code></td>
<td style="text-align: left;"><code>th:controls</code></td>
<td style="text-align: left;"><code>th:declare</code></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><code>th:default</code></td>
<td style="text-align: left;"><code>th:defer</code></td>
<td style="text-align: left;"><code>th:disabled</code></td>
</tr>
<tr class="even">
<td style="text-align: left;"><code>th:formnovalidate</code></td>
<td style="text-align: left;"><code>th:hidden</code></td>
<td style="text-align: left;"><code>th:ismap</code></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><code>th:loop</code></td>
<td style="text-align: left;"><code>th:multiple</code></td>
<td style="text-align: left;"><code>th:novalidate</code></td>
</tr>
<tr class="even">
<td style="text-align: left;"><code>th:nowrap</code></td>
<td style="text-align: left;"><code>th:open</code></td>
<td style="text-align: left;"><code>th:pubdate</code></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><code>th:readonly</code></td>
<td style="text-align: left;"><code>th:required</code></td>
<td style="text-align: left;"><code>th:reversed</code></td>
</tr>
<tr class="even">
<td style="text-align: left;"><code>th:scoped</code></td>
<td style="text-align: left;"><code>th:seamless</code></td>
<td style="text-align: left;"><code>th:selected</code></td>
</tr>
</tbody>
</table>
</div>

### 默认属性处理器

Thymeleaf 提供“默认属性处理器（default attribute processor）”，当标准方言没有提供的属性时，也可以设置其属性。比如：

```html
<span th:whatever="${user.name}">...</span>
```

`th:whatever` 并不是标准方言中提供的属性，但仍然可以正确对属性进行赋值。最终输出如下:

```html
<span whatever="John Apricot">...</span>
```

默认属性处理器与`th:attr`设置任意属性，有着异曲同工之妙。

### 支持对 HTML5 友好的属性及元素名称

`data-{prefix}-{name}` 语法是 HTML5 中编写自定义属性的标准方式，不需要开发人员使用任何命名空间的名字（如`th：*`）。
Thymeleaf 支持种语法自动提供给所有的方言（而不只是标准方言）。

考虑下面的例子：

```html	
<table>
    <tr data-th-each="user : ${users}">
        <td data-th-text="${user.login}">...</td>
        <td data-th-text="${user.name}">...</td>
    </tr>
</table>
```

其实完全等价于：

```html	
<table>
    <tr th:each="user : ${users}">
        <td th:each="${user.login}">...</td>
        <td th:each="${user.name}">...</td>
    </tr>
</table>
```

如果你是一个对 HTML5 语法有“强迫症”的开发人员，那么你可以放心的使用`data-{prefix}-{name}` 语法来使用 Thymeleaf 元素。
