---
title: "全栈后端异常治理：将未捕获异常导致的线上事故"
published: 2026-08-25
description: "如果在请求映射期间发生异常或从请求处理程序（如 @Controller）抛出异常，则 DispatcherServlet 将委托 HandlerExceptionResolver bean 链来解决异…"
image: ''
tags: [Java, Spring MVC, Web]
category: 指南
collections: [java-fullstack, java-fullstack-spring]
draft: false
lang: ''
slug: java-course3-4-1
pinned: false
comment: true
---

### 4.1.1 异常处理概述


如果在请求映射期间发生异常或从请求处理程序（如 `@Controller`）抛出异常，则 DispatcherServlet 将委托 HandlerExceptionResolver bean 链来解决异常并提供替代处理。这个处理通常是一个错误响应。

下面列出了可用的 HandlerExceptionResolver 实现：

* SimpleMappingExceptionResolver：处理异常类名称和错误视图名称之间的映射。用于在浏览器应用程序中呈现错误页面。
* DefaultHandlerExceptionResolver：用于解决 Spring MVC 引发的异常并将它们映射到 HTTP 状态代码。
* ResponseStatusExceptionResolver：使用 `@ResponseStatus` 注解来解决异常，并根据注解中的值将它们映射到 HTTP 状态代码。
* ExceptionHandlerExceptionResolver：通过在 `@Controller` 或 `@ControllerAdvice` 类中调用 `@ExceptionHandler` 方法来解决异常。详见 `@ExceptionHandler` 方法。


### 4.1.2 @ExceptionHandler

`@Controller`和`@ControllerAdvice` 类可以拥有 `@ExceptionHandler` 方法来处理来自控制器方法的异常。例如：

```java
@Controller
public class SimpleController {

    // ...

    @ExceptionHandler
    public ResponseEntity<String> handle(IOException ex) {
        // ...
    }

}
```

该注解可以列出要匹配的异常类型。或者简单地将目标异常声明为方法参数，如上所示。当多个异常方法匹配时，根异常匹配通常优先于引发异常匹配。准确的说，ExceptionDepthComparator 用于根据抛出的异常类型的深度对异常进行排序。

在 Spring MVC 中支持 `@ExceptionHandler` 方法建立在 DispatcherServlet 级别 HandlerExceptionResolver 机制上。

### 4.1.3 框架异常处理

只需在 Spring 配置中声明多个 HandlerExceptionResolver bean 并根据需要设置它们的顺序属性，就可以形成一个异常解析链。order 属性越高，异常解析器定位的越晚。

HandlerExceptionResolver 指定它可以返回：

* 指向错误视图的　ModelAndView。
* 如果在解析器中处理了异常，则为Empty ModelAndView。
* 如果异常未解决，则返回 null，供后续解析器尝试使用; 如果异常仍然存在，则允许冒泡到 Servlet 容器。

MVC Config 内置了多种解析器，用于默认的 Spring MVC 异常声明、`@ResponseStatus` 注解的异常声明，以及 `@ExceptionHandler` 方法。 当然，也可以自定义这些解析器的列表或将其替换掉。

### 4.1.4 REST API 异常

REST 服务的一个常见要求是在响应正文中包含错误详细信息。Spring 框架不会自动执行此操作，因为响应正文中的错误详细信息表示是特定于应用程序的。然而，`@RestController` 可以使用带有 ResponseEntity 返回值的 `@ExceptionHandler` 方法来设置响应的状态和主体。这些方法也可以在 `@ControllerAdvice` 类中声明以全局应用它们。

如果想要实现自定义错误信息的全局异常处理，那么应用程序应该考虑扩展 ResponseEntityExceptionHandler，它提供对 Spring MVC 引发的异常的处理以及钩子来定制响应主体。要使用它，需要创建一个 ResponseEntityExceptionHandler 的子类，用 `@ControllerAdvice` 注解，覆盖必要的方法，并将其声明为 Spring bean。

### 4.1.5 注解异常


带有 `@ResponseStatus` 注解的异常类会被 ResponseStatusExceptionResolver 解析。可以实现自定义的一些异常，同时在页面上进行显示。具体的使用方法如下。


首先定义一个异常类：

```java
@ResponseStatus(value = HttpStatus.FORBIDDEN,reason = "用户名和密码不匹配!")
public class UserNameNotMatchPasswordException extends RuntimeException{

}
```

抛出异常：

```java
@RequestMapping("/testResponseStatusExceptionResolver")
public String testResponseStatusExceptionResolver(@RequestParam("i") int i){
    if (i==13){
        throw new UserNameNotMatchPasswordException(); 
    }

    return "success"; 
}  
```

### 4.1.6 容器错误页面


如果异常未被 HandlerExceptionResolver 处理，或者应状态设置为错误状态（即4xx、5xx），则 Servlet 容器可能会在 HTML 中呈现默认错误页面。默认错误页面，可以在 web.xml 中声明：

```xml
<error-page>
    <location>/error</location>
</error-page>
```

鉴于上述情况，当异常冒泡时，或者响应具有错误状态时，Servlet 容器在容器内将 ERROR 分派到配置的 URL（例如“/error”）。然后由 DispatcherServlet 进行处理，可能将其映射到一个 `@Controller`，该实现可以通过模型返回错误视图名称或呈现 JSON 响应，如下所示：

```java
@RestController
public class ErrorController {

    @RequestMapping(path = "/error")
    public Map<String, Object> handle(HttpServletRequest request) {
        Map<String, Object> map = new HashMap<String, Object>();
        map.put("status", request.getAttribute("javax.servlet.error.status_code"));
        map.put("reason", request.getAttribute("javax.servlet.error.message"));
        return map;
    }
}
```

注意：Servlet API 不提供在 Java 中创建错误页面映射的方法，所以需要同时使用 WebApplicationInitializer 和 web.xml 来实现。
