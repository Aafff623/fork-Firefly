---
title: "全栈后端的安全围栏：MVC过滤器链"
published: 2026-08-25
description: "spring-web 模块提供了很多有用的过滤器。Spring 过滤器的实现依赖于 Servlet 容器。在实现上基于函数回调，可以对几乎所有请求进行过滤，但是缺点是一个过滤器实例只能在容器初始化时调…"
image: ''
tags: [Java, Spring MVC, Web]
category: 指南
collections: [java-fullstack, java-fullstack-spring]
draft: false
lang: ''
slug: java-course3-3-2
pinned: false
comment: true
---

`spring-web` 模块提供了很多有用的过滤器。Spring 过滤器的实现依赖于 Servlet 容器。在实现上基于函数回调，可以对几乎所有请求进行过滤，但是缺点是一个过滤器实例只能在容器初始化时调用一次。

使用过滤器的目的是用来做一些过滤操作，获取想要的数据。比如，在过滤器中修改字符编码或者是在过滤器中修改 HttpServletRequest 的一些参数（如过滤低俗文字、危险字符）等等。


### 3.2.1 HTTP PUT 表单

浏览器只能通过 HTTP GET 或 HTTP POST 提交表单数据，而非浏览器客户端则可以使用 HTTP PUT 和 PATCH。 Servlet API 要求 `ServletRequest.getParameter*()` 方法仅支持HTTP POST 的表单字段访问。那么，问题来了，如果用户使用 HTTP PUT 请求表单怎么办呢？

`spring-web`模块提供了 HttpPutFormContentFilter，它可以拦截内容类型为“application/x-www-form-urlencoded”的 HTTP PUT 和 PATCH 请求。从请求主体读取表单数据，并封装为 ServletRequest 以使表单数据可用通过 `ServletRequest.getParameter*()` 方法。


### 3.2.2 转发头

当请求经过负载平衡器等代理时，主机、端口等信息可能会发生改变，这对于需要创建资源链接的应用程序提出了挑战，因为链接应反映原始请求的主机、端口等客户视角。

RFC 7239 规范定义了代理如何来“Forwarded（已转发）” HTTP 头，转发时需要提供有关原始请求的信息。还有其他一些非标准转发的使用，例如“X-Forwarded-Host”、“X-Forwarded-Port”和“X-Forwarded-Proto”等。

ForwardedHeaderFilter 检测、提取并使用来自“Forwarded（已转发）”头或来自“X-Forwarded-Host”、“X-Forwarded-Port”和“X-Forwarded-Proto”的信息。它包装请求以覆盖它的主机、端口，并“隐藏”转发的头以供后续处理。

注意，使用转发头时存在一定的安全考虑隐患，毕竟在应用程序级别，很难确定转发头是否可信。这就是为什么应该正确配置网络上游以从外部过滤不可信的转发头。

没有代理并且不需要使用转发标头的应用程序可以配置 ForwardedHeaderFilter 以删除并忽略这些头。


### 3.2.3 ShallowEtagHeaderFilter

ShallowEtagHeaderFilter 是 Spring 提供的支持 ETag 的一个过滤器。所谓 ETag 是指被请求变量的实体值，是一个可以与 Web 资源关联的记号，而 Web 资源可以是一个 Web 页，也可以是 JSON 或 XML 文档，服务器单独负责判断记号是什么及其含义，并在 HTTP 响应头中将其传送到客户端，以下是服务器端返回的格式：

```
ETag:"D41D8CD98F00B204E9800998ECF8427E"
```
 
客户端的查询更新格式是这样的：

```
If-None-Match:"D41D8CD98F00B204E9800998ECF8427E"
```
 
如果 ETag 没改变，则返回状态 304 然后不返回，这也和 Last-Modified 一样。

ShallowEtagHeaderFilter 会将 JSP 等的内容缓存，生成 MD5 的 key，然后在响应中作为头的 Etage 返回给客户端。下次客户端对相同的资源（或者说相同的url）发出请求时，客户端会将之前生成的 key 作为 If-None-Match 的值发送到服务器。Filter 会将客户端传来的值和服务器上的做比较，如果相同，则返回304；否则，将发送新的内容到客户端。

### 3.2.4 CORS

Spring MVC 通过控制器上的注解为 CORS 配置提供细粒度的支持。然而，当与 Spring Security 一起使用时，建议依靠内置的 CorsFilter，它必须排在 Spring Security 的过滤器链之前。
