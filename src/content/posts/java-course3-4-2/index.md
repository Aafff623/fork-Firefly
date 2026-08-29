---
title: "CORS安全策略"
published: 2026-08-25
description: "出于安全原因，浏览器禁止对当前源以外的资源进行 AJAX 调用。CORS（Cross-origin resource sharing，跨域资源共享）是一个 W3C 标准。它允许浏览器向跨源服务器，发出…"
image: ''
tags: [Java, Spring MVC, Web]
category: 指南
collections: [java-fullstack, java-fullstack-spring]
draft: false
lang: ''
slug: java-course3-4-2
pinned: false
comment: true
---

### 4.2.1 CORS 概述

出于安全原因，浏览器禁止对当前源以外的资源进行 AJAX 调用。CORS（Cross-origin resource sharing，跨域资源共享）是一个 W3C 标准。它允许浏览器向跨源服务器，发出XMLHttpRequest 请求，从而克服了 AJAX 只能同源使用的限制。


Spring MVC HandlerMapping 提供了对 CORS 的内置支持。在成功将请求映射到处理程序后，HandlerMapping 会检查给定请求和处理程序的 CORS 配置并采取进一步的操作。预检请求被直接处理掉，而简单和实际的 CORS 请求会被拦截，验证是否需要设置 CORS 响应头。

为了实现跨域请求（即 Origin 头域存在并且与请求的主机不同），你需要有一些明确声明的 CORS 配置。如果找不到匹配的 CORS 配置，则会拒绝预检请求。没有将 CORS 头添加到简单和实际的 CORS 请求的响应，会被浏览器拒绝掉。

每个 HandlerMapping 可以单独配置基于 URL 模式的 CorsConfiguration 映射。在大多数情况下，应用程序将使用 MVC 配置来实现全局映射。

HandlerMapping 级别的全局 CORS 配置可以与更细粒度的处理器级 CORS 配置相结合。例如，带注解的控制器可以使用类级别或方法级别的 `@CrossOrigin` 注解。


### 4.2.2 @CrossOrigin

`@CrossOrigin` 注解用于在带注解的控制器方法上启用跨域请求：


```java
@RestController
@RequestMapping("/account")
public class AccountController {

    @CrossOrigin
    @GetMapping("/{id}")
    public Account retrieve(@PathVariable Long id) {
        // ...
    }

    @DeleteMapping("/{id}")
    public void remove(@PathVariable Long id) {
        // ...
    }
}
```

默认`@CrossOrigin`允许：

* 所有的源。
* 所有头。
* 控制器方法所映射到的所有 HTTP 方法。
* allowedCredentials 默认情况下未启用，因为它建立了一个信任级别，用于公开敏感的用户特定信息，如 Cookie 和 CSRF 令牌，并且只能在适当的情况下使用。
* maxAge 设置为 30 分钟。


`@CrossOrigin` 也在类级别上得到支持，并由所有方法继承，也可以在类和方法级别同时使用：


```java
@CrossOrigin(maxAge = 3600)
@RestController
@RequestMapping("/account")
public class AccountController {

    @CrossOrigin("http://domain2.com")
    @GetMapping("/{id}")
    public Account retrieve(@PathVariable Long id) {
        // ...
    }

    @DeleteMapping("/{id}")
    public void remove(@PathVariable Long id) {
        // ...
    }
}
```


### 4.2.3 全局 CORS 配置


除了细粒度的控制器方法级配置之外，还可能需要定义一些全局 CORS 配置。可以在任何 HandlerMapping 上分别设置基于 URL 的 CorsConfiguration 映射。然而，大多数应用程序将使用 MVC 的 Java 配置或 XML 配置来完成此操作。

默认情况下全局配置启用以下功能：

* 所有的源。
* 所有头。
* GET、HEAD 和 POST 方法。
* allowedCredentials 默认情况下未启用，因为它建立了一个信任级别，用于公开敏感的用户特定信息，如 Cookie 和 CSRF 令牌，并且只能在适当的情况下使用。
* maxAge 设置为 30 分钟。

### 4.2.4 自定义

可以通过基于 Java 或者 XML 的配置来自定义 CORS。


#### Java 配置


要在 MVC 的 Java 配置中启用 CORS，请使用 CorsRegistry 回调：


```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {

        registry.addMapping("/api/**")
            .allowedOrigins("http://domain2.com")
            .allowedMethods("PUT", "DELETE")
            .allowedHeaders("header1", "header2", "header3")
            .exposedHeaders("header1", "header2")
            .allowCredentials(true).maxAge(3600);

        // ...
    }
}
```

#### XML 配置

要在 XML 命名空间中启用 CORS，请使用 `<mvc:cors>` 元素：

```java
<mvc:cors>

    <mvc:mapping path="/api/**"
        allowed-origins="http://domain1.com, http://domain2.com"
        allowed-methods="GET, PUT"
        allowed-headers="header1, header2, header3"
        exposed-headers="header1, header2" allow-credentials="true"
        max-age="123" />

    <mvc:mapping path="/resources/**"
        allowed-origins="http://domain1.com" />

</mvc:cors>
```


### 4.2.5 CORS 过滤器


你可以通过内置的 CorsFilter 来应用 CORS 支持。


配置过滤器将 CorsConfigurationSource 传递给其构造函数：


```java
CorsConfiguration config = new CorsConfiguration();

onfig.applyPermitDefaultValues()

config.setAllowCredentials(true);
config.addAllowedOrigin("http://domain1.com");
config.addAllowedHeader("");
config.addAllowedMethod("");

UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
source.registerCorsConfiguration("/**", config);

CorsFilter filter = new CorsFilter(source);
```
