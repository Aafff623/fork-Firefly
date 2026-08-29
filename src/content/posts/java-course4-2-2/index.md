---
title: "单体全栈工程师如何做Java模板引擎选型"
published: 2026-08-25
description: "既然，JSP 是公认的性能最好的模板引擎，为什么这些年来新的模板引擎层出不穷？为什么我们在实际项目中，反而更加推荐使用性能较差的 Thymeleaf？"
image: ''
tags: [Java, Thymeleaf, 模板引擎]
category: 指南
collections: [java-fullstack, java-fullstack-frontend-basic]
draft: false
lang: ''
slug: java-course4-2-2
pinned: false
comment: true
---

### 为什么选择 Thymeleaf 而不是 JSP

既然，JSP 是公认的性能最好的模板引擎，为什么这些年来新的模板引擎层出不穷？为什么我们在实际项目中，反而更加推荐使用性能较差的 Thymeleaf？

其实，对于开发者而言，除了从性能来考量一门语言或者一个工具之外，我们还要考虑人的因素，即开发人员本身的开发效率。这就好比是用汇编语言和 Java 语言做比较，很显然，汇编语言在程序处理的性能上肯定会比 Java 高很多，但从开发人员的角度来看，显然 Java 语言更加符合面向对象的思维，更加容易被开发人员所掌握，并且能够最快的实现功能，推出产品。所以在衡量一款工具的优劣的时候，往往需要从整体来看。


我们来对比下 JSP 的代码以及 Thymeleaf 的代码。下面是 JSP 编写的页面代码：

```jsp
<%@ taglib prefix="sf" uri="http://www.springframework.org/tags/form" %>
<%@ taglib prefix="s" uri="http://www.springframework.org/tags" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>

<html>

  <head>
    <title>Spring MVC view layer: Thymeleaf vs. JSP</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <link rel="stylesheet" type="text/css" media="all" href="<s:url value='/css/thvsjsp.css' />"/>
  </head>

  <body>

    <h2>This is a JSP</h2>

    <s:url var="formUrl" value="/subscribejsp" />
    <sf:form modelAttribute="subscription" action="${formUrl}">

      <fieldset>

        <div>
          <label for="email"><s:message code="subscription.email" />: </label>
          <sf:input path="email" />
        </div>
        <div>
          <label><s:message code="subscription.type" />: </label>
          <ul>
            <c:forEach var="type" items="${allTypes}" varStatus="typeStatus">
              <li>
                <sf:radiobutton path="subscriptionType" value="${type}" />
                <label for="subscriptionType${typeStatus.count}">
                  <s:message code="subscriptionType.${type}" />
                </label>
              </li>
            </c:forEach>
          </ul>
        </div>

        <div class="submit">
          <button type="submit" name="save"><s:message code="subscription.submit" /></button>
        </div>

      </fieldset>

    </sf:form>

  </body>

</html>
```

实现相同的功能，我们采用 Thymeleaf 来实现，是下面这个样子：

```html
<!DOCTYPE html>

<html xmlns:th="http://www.thymeleaf.org">

  <head>
    <title>Spring MVC view layer: Thymeleaf vs. JSP</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <link rel="stylesheet" type="text/css" media="all"
      href="../../css/thvsjsp.css" th:href="@{/css/thvsjsp.css}"/>
  </head>

  <body>

    <h2>This is a Thymeleaf template</h2>

    <form action="#" th:object="${subscription}" th:action="@{/subscribeth}">

      <fieldset>

        <div>
          <label for="email" th:text="#{subscription.email}">Email: </label>
          <input type="text" th:field="*{email}" />
        </div>
        <div>
          <label th:text="#{subscription.type}">Type: </label>
          <ul>
            <li th:each="type : ${allTypes}">
              <input type="radio" th:field="*{subscriptionType}" th:value="${type}" />
              <label th:for="${#ids.prev('subscriptionType')}"
                th:text="#{|subscriptionType.${type}|}">First type</label>
            </li>
            <li th:remove="all"><input type="radio" /> <label>Second Type</label></li>
          </ul>
        </div>

        <div class="submit">
          <button type="submit" name="save" th:text="#{subscription.submit}">Subscribe me!</button>
        </div>

      </fieldset>

    </form>

  </body>

</html>
```

对比 JSP 的代码以及 Thymeleaf 的代码可以看出：

* Thymeleaf 比 JSP 的代码更加接近 HTML，没有奇怪的标签，只是增加了一些有意义的属性。
* Thymeleaf 支持 HTML5 标准；JSP 如果要支持 HTML5 标准，需要新版的 Spring 框架来支持。
* JSP 需要部署到 Servlet 开发服务器上，并启动服务器。如果服务器不启动，JSP 页面不会渲染；而 Thymeleaf 即使不部署，也能直接在浏览器中打开它。


虽然，Thymeleaf 的性能不是最好的，但由于 Thymeleaf “原型即页面”的特点，非常适用于快速开发，符合 Spring Boot 开箱即用的原则。所谓“原型即页面”是指，Thymeleaf 页面，可以无需部署到 Servlet 开发服务器上，直接通过浏览器就能打开它。这种特点非常适合用于系统的界面原型设计。前端开发人员或者美工将原型设计好之后，提交给 Java 开发人员，只需要在原型的基础上，增加少量的 Thymeleaf 表达式语句，就能转化为系统的页面了。

界面的设计与实现相分离，这就是 Thymeleaf 广为流行的原因了。

### 什么是 Thymeleaf

Thymeleaf 是面向 Web 和独立环境的现代服务器端 Java 模板引擎，能够处理 HTML、XML、JavaScript、CSS 甚至纯文本。类似的产品还有JSP 、Freemarker等。


Thymeleaf 的主要目标是提供一个优雅和高度可维护的创建模板的方式。为了实现这一点，它建立在自然模板（Natural Templates）的概念上，将其逻辑注入到模板文件中，不会影响模板被用作设计原型。这改善了设计的沟通，弥合了设计和开发团队之间的差距。

Thymeleaf 的设计从一开始就遵从 Web 标准，特别是 HTML5，这样就能创建完全符合验证的模板。

Thymeleaf 的语法优雅易懂。Thymeleaf 使用 OGNL（Object-Graph Navigation Language），它是一种功能强大的表达式语言，通过它简单一致的表达式语法，可以存取对象的任意属性，调用对象的方法，遍历整个对象的结构图，实现字段类型转化等功能。它使用相同的表达式去存取对象的属性。这样可以更好的取得数据。在与 Spring 应用集成过程中使用 SpringEL，而 OGNL 与 SpringEL 在语法上都极其类似。

Thymeleaf 3 使用一个名为 AttoParser 2 （<http://www.attoparser.org>）的新解析器。AttoParser 是一个新的、基于事件（不符合SAX标准）的解析器，由 Thymeleaf 的作者开发，符合 Thymeleaf 的风格。

### Thymeleaf 处理模版

Thymeleaf 能处理以下 6 种类型的模版，我们称之为模版模式（Template Mode）:

 * HTML
 * XML
 * TEXT
 * JAVASCRIPT
 * CSS
 * RAW
 
其中包含有两种标记模板模式（HTML 和 XML），三种文本模板模式（TEXT、JAVASCRIPT 和C SS）和一个无操作模板模式（RAW）。
 
HTML 模板模式将允许任何类型的 HTML 输入，包括 HTML5、HTML4 和 XHTML。将不执行验证或对格式进行严格检查，这样就能尽可能的将模板代码/结构进行输出。

XML 模板模式将允许 XML 输入。在这种情况下，代码预期格式是良好的，不存在未关闭的标签和没有引用的属性等。如果找到未符合 XML 格式要求，解析器将抛出异常。请注意，该模式不会针对 DTD 或 XML 架构去执行验证。

TEXT 模板模式将允许对非标记性质的模板使用特殊语法。此类模板的示例可能是文本电子邮件或模板文档。请注意，HTML 或 XML 模板也可以作为 TEXT 处理，在这种情况下，它们将不会被解析为标记，并且每个标签 DOCTYPE、注释等将被视为纯文本。

JAVASCRIPT 模板模式将允许在 Thymeleaf 应用程序中处理 JavaScript 文件。这意味着能够使用 JavaScript 文件中的模型数据与 HTML 文件中可以完成的方式相同，但可以使用特定于 JavaScript 的集成，例如专门的转义或自然脚本（natural scripting）。 JAVASCRIPT 模板模式被认为是文本模式，因此使用与 TEXT 模板模式相同的特殊语法。

CSS 模板模式将允许处理涉及 Thymeleaf 应用程序的 CSS 文件。与 JAVASCRIPT 模式类似，CSS 模板模式也是文本模式，并使用 TEXT 模板模式下的特殊处理语法。

RAW 模板模式根本不会处理模板。它用于将未经修改的资源（文件、URL 响应等）插入正在处理的模板中。例如，HTML 格式的外部不受控制的资源可以包含在应用程序模板中，这些资源可能包含的任何 Thymeleaf 代码将不会被执行。

### 标准方言

Thymeleaf 是一个非常可扩展的模板引擎，实际上它更像是一个模板引擎框架（template engine framework），允许您定义和自定义您的模板。

将一些逻辑应用于标记工件（例如标签、某些文本、注释或只有占位符）的一个对象被称为处理器（processor）。方言（dialect）通常包括这些处理器的集合以及一些额外的工件。Thymeleaf 的核心库提供了一种称为标准方言（Standard Dialect）的方言，提供给用户开箱即用的功能。

当然，如果用户希望在利用库的高级功能的同时定义自己的处理逻辑，用户也可以创建自己的方言（甚至扩展标准的方言），也可以将 Thymeleaf 配置为同时使用几种方言。

> 官方的 thymeleaf-spring3 和 thymeleaf-spring4 集成包都定义了一种称为“SpringStandard Dialect”的方言，与标准方言大致相同，但是对于 Spring 框架中的某些功能则更加友好，例如， 想通过使用 Spring Expression Language 或 SpringEL 而不是 OGNL。所以如果你是一个 Spring MVC 用户，这里的所有东西都能够在你的 Spring 应用程序中使用。

标准方言的大多数处理器是属性处理器。这样，即使在处理之前，浏览器也可以正确地显示 HTML 模板文件，因为它们将简单地忽略其他属性。对比 JSP，在浏览器中会直接显示的代码片断：

```html
<form:inputText name="userName" value="${user.name}" />
```

Thymeleaf 标准方言将允许我们实现与以下功能相同的功能：:

```html
<input type="text" name="userName" value="James Carrot" th:value="${user.name}" />
```
 
浏览器会忽略 `th:value`，直接显示 `value` 里写死的静态值（这里是“James Carrot”），所以原型文件双击就能打开看效果；真正由模板渲染时，`${user.name}` 的求值结果会把这个静态值替换掉。

这有助于您的设计师和开发人员处理相同的模板文件，并减少将静态原型转换为工作模板文件所需的工作量。这样的功能是称为“自然模板(Natural Templating)”的功能。

有关 Thymeleaf 标准方言的内容，会在下一章节详细讲述。
