---
title: "单体全栈开发必知的视图方案，带领实现前后端无缝协作"
published: 2026-08-25
description: "对于动态 HTML 内容的展示，模板引擎必不可少。Java 主要通过 Servlet 来支持动态内容的请求和响应。Spring MVC 支持 Thymeleaf 、FreeMarker 和 JSP 等…"
image: ''
tags: [Java, Thymeleaf, 模板引擎]
category: 指南
collections: [java-fullstack, java-fullstack-frontend-basic]
draft: false
lang: ''
slug: java-course4-2-1
pinned: false
comment: true
---

对于动态 HTML 内容的展示，模板引擎必不可少。Java 主要通过 Servlet 来支持动态内容的请求和响应。Spring MVC 支持 Thymeleaf 、FreeMarker 和 JSP 等多种技术。对于 Spring Boot 而言，它支持 FreeMarker、Groovy、Thymeleaf、Mustache 等引擎的自动配置功能。

实际上，Java 模板引擎品种繁多，各有各的优势和缺点。


### 关于性能

模板引擎的性能，是很多用户选择模板引擎的重要参考指标。Jeroen Reijn 对各个 Java 模板引擎做了性能分析，并将结果发表在了其个人网站上（<https://github.com/jreijn/spring-comparing-template-engines>）。让我们一起来看下性能指标的对比数据。

Jeroen Reijn 选取了以下模板作为测试的版本，这些模板引擎都是结合 Spring MVC 来工作：

* JSP + [JSTL](https://jstl.java.net/) - v1.2
* [Freemarker](http://www.freemarker.org/) - v2.3.28.RELEASE
* [Velocity](http://velocity.apache.org/) - v2.3
* [Velocity Tools](http://velocity.apache.org/tools/) - v3.1
* [Thymeleaf](http://www.thymeleaf.org/) - v3.0.11.RELEASE
* Mustache - Based on [JMustache](https://github.com/samskivert/jmustache) - v1.15
* [Scalate](http://scalate.fusesource.org/)  - v1.9.8
* [Jade4j](https://github.com/neuland/jade4j) - v1.3.1
* [HTTL](http://httl.github.io/en/) - v1.0.11
* [Pebble](https://pebbletemplates.io/) - v3.1.6
* [Handlebars](http://jknack.github.io/handlebars.java/) - v4.3.1
* [chunk](http://www.x5software.com/chunk/) - v3.6.2
* [HtmlFlow](https://github.com/xmlet/HtmlFlow/) - v4.0
* [Trimou](http://trimou.org/) - v2.5.1.Final
* [Rocker](https://github.com/fizzed/rocker/) - v1.3.0
* [Ickenham](https://github.com/enpassant/ickenham) - v1.5.0
* [Rythm](http://rythmengine.org/) - v1.4.1
* [Groovy Templates](https://groovy.apache.org/) - v2.5.6
* [Liqp - Jekyll](https://github.com/bkiers/Liqp) - v0.8.5.3
* [kolinx.html](https://github.com/Kotlin/kotlinx.html) - v1.8.22


在处理 25000 个并发级别为 25 的请求所需的总时间，测试结果如下所示（数值越小越好）：


```
Jade4j                  567.7   seconds
Handlebars              147.7   seconds
Scalate - Scaml          33.33  seconds
Pebble                   27.92  seconds
HTTL                     24.61  seconds
Thymeleaf                24.09  seconds
Velocity                 23.07  seconds
Freemarker               11.80  seconds
jTwig                    10.95  seconds
Mustache (JMustache)      8.836 seconds
JSP                       7.888 seconds
```

从测试结果中我们看到，JSP 的性能是最高的，而 jTwig 和 Thymeleaf 相对较差。
