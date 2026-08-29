---
title: "全栈后端性能加速引擎：HTTP缓存策略深度解析，让响应速度"
published: 2026-08-25
description: "一个好的 HTTP 缓存策略可以显着提高 Web 应用程序的性能和客户的体验。HTTP 响应头中的 Cache-Control 以及 Last-Modified 和 ETag 文件主要负责缓存处理。"
image: ''
tags: [Java, Spring MVC, Web]
category: 指南
collections: [java-fullstack, java-fullstack-spring]
draft: false
lang: ''
slug: java-course3-4-3
pinned: false
comment: true
---

一个好的 HTTP 缓存策略可以显着提高 Web 应用程序的性能和客户的体验。HTTP 响应头中的 Cache-Control 以及 Last-Modified 和 ETag 文件主要负责缓存处理。

### 4.3.1 HTTP 缓存概述

Cache-Control 用于指定所有缓存机制在整个请求/响应链中必须服从的指令。这些指令指定用于阻止缓存对请求或响应造成不利干扰的行为。这些指令通常覆盖默认缓存算法。缓存指令是单向的，即请求中存在一个指令并不意味着响应中将存在同一个指令。

Last-Modified 实体头部字段值通常用作一个缓存验证器。简单来说，如果实体值在 Last-Modified 值之后没有被更改，则认为该缓存条目有效。

ETag 是一个 HTTP 响应头，由 HTTP/1.1 兼容的 Web 服务器返回，用于确定给定 URL 中内容是否已经更改。它可以被认为是 Last-Modified 头的更复杂的后继者。当服务器返回带有ETag 头的表示时，客户端可以在随后的 GET 中，在 If-None-Match 头中使用此头。如果内容未更改，则服务器返回“304: Not Modified”。

### 4.3.2 缓存控制

Spring Web MVC 支持许多缓存的策略，并提供了为应用程序配置 Cache-Control 头的方法。 

Spring Web MVC 在其几个 API 中使用了一个配置约定 setCachePeriod(int seconds) 方法：

* 值为-1：不会生成 Cache-Control 响应头。
* 值为0：使用“Cache-Control: no-store”指令时，将阻止缓存。
* 值 n>0：将使用“Cache-Control: max-age=n”指令将给定响应缓存n秒。

CacheControl 构建器类简单地描述了可用的 Cache-Control 指令，并使构建自己的 HTTP 缓存策略变得更加容易。一旦构建完成，一个 CacheControl 实例可以被接受为几个 Spring Web MVC API 中的一个参数。


```java
// 缓存一个小时 - "Cache-Control: max-age=3600"
CacheControl ccCacheOneHour = CacheControl.maxAge(1, TimeUnit.HOURS);

// 阻止缓存 - "Cache-Control: no-store"
CacheControl ccNoStore = CacheControl.noStore();

// 在公共和私人缓存中缓存十天，
// 公共缓存不应该转换响应
// "Cache-Control: max-age=864000, public, no-transform"
CacheControl ccCustom = CacheControl.maxAge(10, TimeUnit.DAYS)
                                    .noTransform().cachePublic();
```

### 4.3.3 静态资源


应该为静态资源提供适当的 Cache-Control 和头以获得最佳性能。以下是一个配置示例：


```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/resources/**")
                .addResourceLocations("/public-resources/")
                .setCacheControl(CacheControl.maxAge(1, TimeUnit.HOURS).cachePublic());
    }

}
```

如果是基于 XML，则上述配置等同如下：


```xml
<mvc:resources mapping="/resources/**" location="/public-resources/">
    <mvc:cache-control max-age="3600" cache-public="true"/>
</mvc:resources>
```

### 4.3.4 控制器缓存


Spring MVC 控制器可以支持 Cache-Control、ETag 和 If-Modified-Since 等 HTTP 请求。控制器可以使用 HttpEntity 类型与请求/响应进行交互，返回 ResponseEntity 的控制器可以包含 HTTP 缓存信息，如下所示：


```java
@GetMapping("/book/{id}")
public ResponseEntity<Book> showBook(@PathVariable Long id) {

    Book book = findBook(id);
    String version = book.getVersion();

    return ResponseEntity
                .ok()
                .cacheControl(CacheControl.maxAge(30, TimeUnit.DAYS))
                .eTag(version)
                .body(book);
}
```


@RequestMapping 方法也可以支持相同的行为。实现如下：


```java
@RequestMapping
public String myHandleMethod(WebRequest webRequest, Model model) {

    long lastModified = // 1. 特定于应用程序的计算

    if (request.checkNotModified(lastModified)) {
        // 2. 快捷退出。 不需要进一步处理
        return null;
    }

    // 3. 或者另外请求处理
    model.addAttribute(...);
    return "myViewName";

```
