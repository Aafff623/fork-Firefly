---
title: "深度解析Thymeleaf表达式基本对象"
published: 2026-08-25
description: "在 Thymeleaf 中，一些对象和变量 map 总是可以被调用，这些对象被称为“表达式基本对象”，让我们一起来看看他们。"
image: ''
tags: [Java, Thymeleaf, 模板引擎]
category: 指南
collections: [java-fullstack, java-fullstack-frontend-basic]
draft: false
lang: ''
slug: java-course4-4-2
pinned: false
comment: true
---

在 Thymeleaf 中，一些对象和变量 map 总是可以被调用，这些对象被称为“表达式基本对象”，让我们一起来看看他们。


### 基本对象

 * \#ctx : 上下文对象。是 `org.thymeleaf.context.IContext` 或者`org.thymeleaf.context.IWebContext` 的实现，取决于我们的环境是 (桌面程序的或者是 web 程序)。

注意`＃vars`和`＃root`是同一个对象的同义词，但建议使用`＃ctx`。

```java
${#ctx.locale}
${#ctx.variableNames}

${#ctx.request}
${#ctx.response}
${#ctx.session}
${#ctx.servletContext}
```

 * \#locale : 直接访问与`java.util.Locale`关联的当前的请求。                

```java
${#locale}
```


### Web 上下文命名空间用于 request/session 属性等

Thymeleaf 在 web 环境中，有一系列的快捷方式用于访问请求参数、会话属性等应用属性。注意，这些不是“上下文对象（context objects）”，但有 map 添加到上下文作为变量，这样我们就能访问它们而无需`#`。它们类似于“命名空间（namespaces）”。

 * param : 用于检索请求参数。 `${param.foo}`是一个使用`foo`请求参数的值`String[]` ，所以`${param.foo[0]}` 将会通常用于获取第一个值。

```java
${param.foo}
${param.size()}
${param.isEmpty()}
${param.containsKey('foo')}
...
```

 * session : 用于检索会话属性。

```java
${session.foo} 
${session.size()}
${session.isEmpty()}
${session.containsKey('foo')}
...
```

 * application : 用于检索应用及上下文属性。

```java
${application.foo} 
${application.size()}
${application.isEmpty()}
${application.containsKey('foo')}
...
```

注意没有必要指定访问请求属性的命名空间，因为所有请求属性都会自动添加到上下文中作为上下文根中的变量：


```java
${myRequestAttribute}
```


### Web 上下文对象

在 web 环境，下列对象可以直接访问（注意它们是对象，而非 map 或者是命名空间）:

 * \#request : 直接访问与当前请求关联的 `javax.servlet.http.HttpServletRequest`对象。

```java
${#request.getAttribute('foo')}
${#request.getParameter('foo')}
${#request.getContextPath()}
${#request.getRequestName()}
...
```

 * \#session : 直接访问与当前请求关联的 `javax.servlet.http.HttpSession`对象。
 
```java
${#session.getAttribute('foo')}
${#session.id}
${#session.lastAccessedTime}
...
```

 * \#servletContext : 直接访问与当前请求关联的 `javax.servlet.ServletContext`对象。


```java
${#servletContext.getAttribute('foo')}
${#servletContext.contextPath}
...
```
