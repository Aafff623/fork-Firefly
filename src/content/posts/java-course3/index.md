---
title: "Web 开发工程化实践（Java 课程 3 · 全 17 节合订）"
published: 2026-09-18
description: "单体项目全栈进阶：Web 开发工程化实践与 Spring MVC。"
image: ''
tags: [Java, Spring MVC, Web]
category: 指南
collections: [java-fullstack, java-fullstack-spring]
draft: false
lang: ''
slug: java-course3
pinned: false
comment: true
---
> 本页为原「Java 课程 3」全部 17 个分节的合订本；原分节链接会自动跳转到本页。


## 1.1 单体项目全栈进阶，如何实现Web开发工程化实践？

* 全栈后端之Java Web开发必备基础解析
    * 解密Servlet架构：斩获穿透HTTP协议的全栈开发者底层思维
    * Filter过滤链：构建防御攻击的安全护城河
    * Request对象深度操控：构建可扩展的RESTful参数解析体系
    * 快速掌握servlet全局中枢：ServletContext架构设计
    * 高效实现精准响应，快速掌握Response高阶技巧
    * 实战：快速构建基于Servlet的REST API服务
* 全栈后端之Java Web开发必备框架-Spring MVC基础
    * 从Servlet到Spring Web MVC，掌握企业级Web服务的线程模型与异步处理架构
    * 全栈后端的安全围栏：MVC过滤器链
    * 全栈后端的指令中心：控制器
* 全栈后端之Java Web开发必备框架-Spring MVC进阶
    * 进阶掌握MVC配置魔方：掌握多种自定义配置方式
* 全栈后端之Java Web开发必备框架-Spring MVC开发REST服务
    * 实战：掌握全栈前后端高效对话核心技能JSON处理
    * 实战：内嵌Tomcat支撑轻量级Servlet容器部署


## 2.1 解密Servlet架构：斩获穿透HTTP协议的全栈开发者底层思维

理解Servlet架构以及其与HTTP协议的关系，培养全栈开发者的底层思维：

### 1. Servlet 与 HTTP 协议基础
- Servlet 简介
    - Servlet是运行在服务器端的Java程序，用于处理客户端的请求并生成响应。它是Java Web应用程序的核心组件之一，能够接收来自客户端的HTTP请求，处理业务逻辑，并返回相应的HTTP响应。
- HTTP 协议概述
    - HTTP是一种应用层协议，用于在网络上进行客户端和服务器之间的信息交互。它基于请求 - 响应模型，客户端发送请求消息给服务器，服务器根据请求返回相应的响应消息。了解HTTP协议的请求方法（如GET、POST、PUT、DELETE等）、请求头和响应头字段、状态码等基础知识是理解Servlet架构的关键。

### 2. Servlet 架构剖析
- Servlet 容器
    - Servlet容器是运行Servlet的环境，如Tomcat、Jetty等。它负责加载Servlet类、创建Servlet实例、管理Servlet的生命周期，并将客户端的请求传递给相应的Servlet进行处理，同时将Servlet的响应返回给客户端。
- Servlet 生命周期
    - 初始化阶段：在Servlet容器启动时，会加载Servlet类并创建Servlet实例，调用 `init()` 方法进行初始化操作，如加载配置文件、建立数据库连接等。
    - 请求处理阶段：当有客户端请求到达时，Servlet容器会调用Servlet的 `service()` 方法，根据请求的方法（GET、POST等）调用相应的 `doGet()`、`doPost()` 等方法来处理请求。
    - 销毁阶段：当Servlet容器关闭或Servlet被卸载时，会调用 `destroy()` 方法，用于释放资源，如关闭数据库连接、释放文件句柄等。
- Servlet 接口与实现类
    - `Servlet` 接口是所有Servlet的根接口，定义了 `init()`、`service()`、`destroy()` 等方法。通常情况下，开发者会继承 `HttpServlet` 类来实现具体的Servlet，`HttpServlet` 类对 `Servlet` 接口进行了进一步的封装，提供了针对HTTP请求的处理方法，如 `doGet()`、`doPost()` 等。

### 3. HTTP 请求与响应处理
- 接收 HTTP 请求
    - Servlet通过 `HttpServletRequest` 对象来接收客户端的HTTP请求。可以从该对象中获取请求的URL、请求方法、请求参数、请求头等信息，以便进行后续的处理。
- 生成 HTTP 响应
    - 使用 `HttpServletResponse` 对象来生成响应并返回给客户端。可以设置响应的状态码、响应头字段，以及通过输出流将响应内容写入到客户端。
- 请求转发与重定向
    - 请求转发：是在服务器端将请求转发到另一个资源进行处理，客户端并不知道请求被转发，浏览器地址栏中的URL不会改变。
    - 重定向：是服务器告诉客户端重新发起一个新的请求到另一个URL，浏览器地址栏中的URL会发生改变。

### 4. 深入理解 Servlet 与 HTTP 协议的交互
- HTTP 协议的无状态性与 Servlet 会话管理
    - HTTP协议是无状态的，即每次请求之间相互独立，服务器不会记住客户端的状态。为了实现会话管理，Servlet提供了 `HttpSession` 对象，通过在客户端和服务器之间传递会话ID来跟踪用户的会话状态，从而实现用户登录、购物车等功能。
- HTTP 缓存与 Servlet 优化
    - 了解HTTP缓存机制，包括浏览器缓存和服务器端缓存，可以提高Web应用的性能。Servlet可以通过设置响应头中的缓存相关字段，如 `Cache-Control`、`Expires` 等，来控制页面的缓存策略。
- 处理 HTTP 错误与异常
    - 在处理HTTP请求时，可能会出现各种错误和异常情况，如404 Not Found、500 Internal Server Error等。Servlet可以通过 `try-catch` 块捕获异常，并使用 `HttpServletResponse` 的 `sendError()` 方法返回相应的错误状态码和错误信息给客户端，同时可以在服务器端记录错误日志以便排查问题。

### 5. Servlet 架构在全栈开发中的应用与拓展
- 与前端技术的结合
    - 在全栈开发中，Servlet作为后端技术，需要与前端技术（如HTML、CSS、JavaScript、前端框架等）进行交互。了解如何通过Servlet生成动态HTML页面、返回JSON数据给前端，以及与前端进行数据交互和页面渲染的方式。
- 与数据库及其他后端技术的集成
    - Servlet通常需要与数据库进行交互，以实现数据的存储、查询和更新等操作。掌握如何在Servlet中使用JDBC、Spring Data JPA等技术来访问数据库，同时了解如何与其他后端技术（如消息队列、缓存服务器等）集成，以构建完整的企业级应用。
- 性能优化与安全考虑
    - 性能优化：包括优化Servlet的代码逻辑、合理使用缓存、连接池等技术，提高应用的响应速度和并发处理能力。
    - 安全考虑：防止SQL注入、XSS攻击、CSRF攻击等安全漏洞，确保Web应用的安全性。例如，对用户输入进行严格的验证和过滤，使用参数化查询来防止SQL注入，设置合适的HTTP头字段来防止XSS攻击等。

理解Servlet架构和HTTP协议，全栈开发者能够更好地掌握Web应用的底层原理，在开发过程中更加灵活地运用各种技术，优化应用性能，提高应用的安全性和可扩展性。


## 2.2 Filter过滤链：构建防御攻击的安全护城河

在Web应用程序中，Filter过滤链能够像安全卫士一样，在请求到达Servlet之前和响应返回客户端之前进行拦截和处理，从而构建起一道防御攻击的安全护城河。

### 1. Filter基本概念
- 定义：Filter是Servlet规范中的一个重要组件，它可以对客户端的请求和服务器的响应进行拦截和处理。可以将其想象成一个“关卡”，请求和响应在通过这个“关卡”时会被检查和修改。
- 作用：主要用于对请求和响应进行预处理和后处理，比如字符编码转换、权限验证、日志记录、防止XSS和SQL注入等安全攻击。

### 2. Filter过滤链原理
多个Filter可以组成一个过滤链，请求会依次通过过滤链中的每个Filter，每个Filter可以对请求进行处理后再传递给下一个Filter，直到最终到达Servlet。响应则会按照相反的顺序，再次经过过滤链，每个Filter可以对响应进行处理后再返回给客户端。

### 3. 构建安全Filter过滤链实战步骤

#### 3.1 防止XSS攻击的Filter
XSS（跨站脚本攻击）是指攻击者通过在目标网站注入恶意脚本，当用户访问该网站时，脚本会在用户浏览器中执行，从而获取用户的敏感信息。可以通过过滤请求参数中的特殊字符来防止XSS攻击。
```java
import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import java.io.IOException;
import java.util.regex.Pattern;

// 自定义请求包装器，过滤请求参数中的特殊字符
class XSSRequestWrapper extends HttpServletRequestWrapper {
    private static final Pattern SCRIPT_TAG_PATTERN = Pattern.compile("<script(.*?)</script>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    private static final Pattern SCRIPT_SRC_PATTERN = Pattern.compile("src[\r\n]*=[\r\n]*\\\'(.*?)\\\'", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL);
    private static final Pattern SCRIPT_SRC_DOUBLE_QUOTE_PATTERN = Pattern.compile("src[\r\n]*=[\r\n]*\\\"(.*?)\\\"", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL);
    private static final Pattern EMBED_TAG_PATTERN = Pattern.compile("<embed(.*?)</embed>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    private static final Pattern OBJECT_TAG_PATTERN = Pattern.compile("<object(.*?)</object>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    private static final Pattern STYLE_TAG_PATTERN = Pattern.compile("<style(.*?)</style>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);

    public XSSRequestWrapper(HttpServletRequest request) {
        super(request);
    }

    @Override
    public String[] getParameterValues(String parameter) {
        String[] values = super.getParameterValues(parameter);
        if (values == null) {
            return null;
        }
        int count = values.length;
        String[] encodedValues = new String[count];
        for (int i = 0; i < count; i++) {
            encodedValues[i] = stripXSS(values[i]);
        }
        return encodedValues;
    }

    @Override
    public String getParameter(String parameter) {
        String value = super.getParameter(parameter);
        return stripXSS(value);
    }

    @Override
    public String getHeader(String name) {
        String value = super.getHeader(name);
        return stripXSS(value);
    }

    private String stripXSS(String value) {
        if (value != null) {
            value = SCRIPT_TAG_PATTERN.matcher(value).replaceAll("");
            value = SCRIPT_SRC_PATTERN.matcher(value).replaceAll("");
            value = SCRIPT_SRC_DOUBLE_QUOTE_PATTERN.matcher(value).replaceAll("");
            value = EMBED_TAG_PATTERN.matcher(value).replaceAll("");
            value = OBJECT_TAG_PATTERN.matcher(value).replaceAll("");
            value = STYLE_TAG_PATTERN.matcher(value).replaceAll("");
        }
        return value;
    }
}

// 防止XSS攻击的Filter
public class XSSFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // 初始化操作
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        XSSRequestWrapper xssRequestWrapper = new XSSRequestWrapper(httpRequest);
        chain.doFilter(xssRequestWrapper, response);
    }

    @Override
    public void destroy() {
        // 销毁操作
    }
}
```

#### 3.2 防止SQL注入的Filter
SQL注入是指攻击者通过在输入中插入恶意的SQL语句，从而绕过应用程序的验证机制，对数据库进行非法操作。可以通过过滤请求参数中的SQL关键字来防止SQL注入。
```java
import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import java.io.IOException;
import java.util.regex.Pattern;

// 自定义请求包装器，过滤请求参数中的SQL关键字
class SQLRequestWrapper extends HttpServletRequestWrapper {
    private static final Pattern SQL_KEYWORD_PATTERN = Pattern.compile("(?:')|(?:--)|(/\\*(?:.|[\\n\\r])*?\\*/)|" +
            "(\\b(select|update|delete|insert|drop|alter)\\b)", Pattern.CASE_INSENSITIVE);

    public SQLRequestWrapper(HttpServletRequest request) {
        super(request);
    }

    @Override
    public String[] getParameterValues(String parameter) {
        String[] values = super.getParameterValues(parameter);
        if (values == null) {
            return null;
        }
        int count = values.length;
        String[] encodedValues = new String[count];
        for (int i = 0; i < count; i++) {
            encodedValues[i] = stripSQL(values[i]);
        }
        return encodedValues;
    }

    @Override
    public String getParameter(String parameter) {
        String value = super.getParameter(parameter);
        return stripSQL(value);
    }

    @Override
    public String getHeader(String name) {
        String value = super.getHeader(name);
        return stripSQL(value);
    }

    private String stripSQL(String value) {
        if (value != null) {
            value = SQL_KEYWORD_PATTERN.matcher(value).replaceAll("");
        }
        return value;
    }
}

// 防止SQL注入的Filter
public class SQLFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // 初始化操作
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        SQLRequestWrapper sqlRequestWrapper = new SQLRequestWrapper(httpRequest);
        chain.doFilter(sqlRequestWrapper, response);
    }

    @Override
    public void destroy() {
        // 销毁操作
    }
}
```

#### 3.3 配置Filter过滤链
在 `web.xml` 文件中配置Filter过滤链，确保请求依次经过防止XSS攻击的Filter和防止SQL注入的Filter。
```xml
<filter>
    <filter-name>XSSFilter</filter-name>
    <filter-class>com.example.XSSFilter</filter-class>
</filter>
<filter-mapping>
    <filter-name>XSSFilter</filter-name>
    <url-pattern>/*</url-pattern>
</filter-mapping>

<filter>
    <filter-name>SQLFilter</filter-name>
    <filter-class>com.example.SQLFilter</filter-class>
</filter>
<filter-mapping>
    <filter-name>SQLFilter</filter-name>
    <url-pattern>/*</url-pattern>
</filter-mapping>
```

### 4. 总结
通过构建Filter过滤链，可以在Web应用程序中有效地防御XSS和SQL注入等常见的安全攻击。在实际开发中，可以根据具体的安全需求添加更多的Filter，如权限验证Filter、日志记录Filter等，进一步完善安全防护体系。同时，要定期对Filter进行测试和优化，确保其能够及时有效地应对新出现的安全威胁。


## 2.3 Request对象深度操控：构建可扩展的RESTful参数解析体系

在构建 RESTful 应用程序时，对 `Request` 对象进行深度操控并构建可扩展的参数解析体系是很重要的，它能让我们更灵活、高效地处理客户端请求。

### 1. 核心原理
在 HTTP 请求中，`Request` 对象承载了客户端传递的各类信息，像请求参数、请求头、请求体等。构建可扩展的 RESTful 参数解析体系的核心在于，依据不同的请求方式（如 GET、POST 等）和参数位置（如查询参数、路径参数、请求体参数等），运用合适的策略对参数进行解析，同时要保证解析逻辑具备良好的扩展性，以便能轻松应对新的参数类型和解析需求。

### 2. 实现步骤

#### 2.1 定义参数解析器接口
首先要定义一个参数解析器接口，此接口规定了参数解析的基本方法，不同类型的参数解析器都要实现该接口。
```java
import javax.servlet.http.HttpServletRequest;

// 参数解析器接口
public interface ParameterResolver {
    // 判断当前解析器是否能处理该参数
    boolean supports(Class<?> parameterType, String parameterName, HttpServletRequest request);
    // 解析参数
    Object resolve(Class<?> parameterType, String parameterName, HttpServletRequest request);
}
```

#### 2.2 实现不同类型的参数解析器
根据不同的参数类型和位置，实现具体的参数解析器。以下是几种常见参数解析器的示例：

##### 查询参数解析器
```java
import javax.servlet.http.HttpServletRequest;
import java.util.Optional;

// 查询参数解析器
public class QueryParameterResolver implements ParameterResolver {
    @Override
    public boolean supports(Class<?> parameterType, String parameterName, HttpServletRequest request) {
        return request.getParameter(parameterName) != null;
    }

    @Override
    public Object resolve(Class<?> parameterType, String parameterName, HttpServletRequest request) {
        String value = request.getParameter(parameterName);
        if (parameterType == String.class) {
            return value;
        } else if (parameterType == Integer.class) {
            return Optional.ofNullable(value).map(Integer::valueOf).orElse(null);
        }
        return null;
    }
}
```

##### 路径参数解析器
```java
import javax.servlet.http.HttpServletRequest;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

// 路径参数解析器
public class PathParameterResolver implements ParameterResolver {
    private final Pattern pathPattern;

    public PathParameterResolver(String pathTemplate) {
        this.pathPattern = Pattern.compile(pathTemplate.replaceAll("\\{([^}]+)}", "([^/]+)"));
    }

    @Override
    public boolean supports(Class<?> parameterType, String parameterName, HttpServletRequest request) {
        String pathInfo = request.getPathInfo();
        if (pathInfo == null) {
            return false;
        }
        Matcher matcher = pathPattern.matcher(pathInfo);
        return matcher.matches();
    }

    @Override
    public Object resolve(Class<?> parameterType, String parameterName, HttpServletRequest request) {
        String pathInfo = request.getPathInfo();
        Matcher matcher = pathPattern.matcher(pathInfo);
        if (matcher.matches()) {
            int groupIndex = getGroupIndex(parameterName);
            if (groupIndex > 0 && groupIndex <= matcher.groupCount()) {
                String value = matcher.group(groupIndex);
                if (parameterType == String.class) {
                    return value;
                } else if (parameterType == Integer.class) {
                    return Integer.valueOf(value);
                }
            }
        }
        return null;
    }

    private int getGroupIndex(String parameterName) {
        // 这里需要根据具体的路径模板来确定参数的组索引，简单示例暂不实现复杂逻辑
        return 1;
    }
}
```

#### 2.3 构建参数解析器链
为了实现可扩展性，需要构建一个参数解析器链，让请求参数依次经过各个解析器进行尝试解析。
```java
import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;

// 参数解析器链
public class ParameterResolverChain {
    private final List<ParameterResolver> resolvers = new ArrayList<>();

    public ParameterResolverChain() {
        resolvers.add(new QueryParameterResolver());
        // 可以根据需要添加更多的解析器
    }

    public Object resolveParameter(Class<?> parameterType, String parameterName, HttpServletRequest request) {
        for (ParameterResolver resolver : resolvers) {
            if (resolver.supports(parameterType, parameterName, request)) {
                return resolver.resolve(parameterType, parameterName, request);
            }
        }
        return null;
    }
}
```

#### 2.4 在控制器中使用参数解析体系
在控制器方法中使用参数解析器链来解析请求参数。
```java
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

// 示例控制器
public class UserController {
    private final ParameterResolverChain resolverChain = new ParameterResolverChain();

    public void getUser(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Integer userId = (Integer) resolverChain.resolveParameter(Integer.class, "userId", request);
        if (userId != null) {
            // 根据 userId 查询用户信息
            String userInfo = "User info for ID: " + userId;
            response.getWriter().write(userInfo);
        } else {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Missing userId parameter");
        }
    }
}
```

### 3. 可扩展性设计
- 添加新的参数解析器：若要支持新的参数类型或解析方式，只需实现 `ParameterResolver` 接口，创建新的参数解析器，并将其添加到 `ParameterResolverChain` 中即可。
- 配置解析器顺序：可以通过调整 `ParameterResolverChain` 中解析器的顺序，来控制参数解析的优先级。

### 4. 总结
借助定义参数解析器接口、实现不同类型的参数解析器、构建参数解析器链，并在控制器中使用该解析体系，能够构建出一个可扩展的 RESTful 参数解析体系。此体系可以灵活处理各种类型的请求参数，并且方便后续的功能扩展。


## 2.4 快速掌握Servlet全局中枢：ServletContext架构设计

### 1. ServletContext 概述
#### 1.1 定义与作用
ServletContext 是 Servlet 容器为每个 Web 应用程序创建的一个全局对象，它代表了当前 Web 应用程序的上下文环境。可以把它想象成一个“信息仓库”，在整个 Web 应用程序的生命周期内，所有的 Servlet、Filter 等组件都可以共享这个对象中的数据和资源。
- 它提供了访问 Web 应用程序的初始化参数、资源文件等功能。
- 可用于在不同的 Servlet 之间共享数据，实现数据的全局存储和访问。

#### 1.2 生命周期
ServletContext 对象在 Web 应用程序启动时由 Servlet 容器创建，在整个应用程序的生命周期内存在，直到应用程序被停止或卸载时才会被销毁。

### 2. ServletContext 的主要功能与使用场景

#### 2.1 获取应用程序初始化参数
在 `web.xml` 中可以配置应用程序的初始化参数，Servlet 可以通过 ServletContext 获取这些参数。
```xml
<!-- web.xml -->
<context-param>
    <param-name>databaseURL</param-name>
    <param-value>jdbc:mysql://localhost:3306/mydb</param-value>
</context-param>
```
```java
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/example")
public class ExampleServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ServletContext context = getServletContext();
        String databaseURL = context.getInitParameter("databaseURL");
        response.getWriter().println("Database URL: " + databaseURL);
    }
}
```

#### 2.2 共享数据
多个 Servlet 可以通过 ServletContext 共享数据。
```java
// 在一个 Servlet 中设置数据
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/setData")
public class SetDataServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ServletContext context = getServletContext();
        context.setAttribute("sharedData", "This is shared data");
        response.getWriter().println("Data set in ServletContext");
    }
}

// 在另一个 Servlet 中获取数据
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/getData")
public class GetDataServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ServletContext context = getServletContext();
        String sharedData = (String) context.getAttribute("sharedData");
        response.getWriter().println("Shared data: " + sharedData);
    }
}
```

#### 2.3 访问资源文件
ServletContext 可以用于访问 Web 应用程序中的资源文件，如配置文件、图片等。
```java
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;

@WebServlet("/readResource")
public class ReadResourceServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ServletContext context = getServletContext();
        InputStream inputStream = context.getResourceAsStream("/WEB-INF/config.properties");
        // 处理输入流，读取配置文件内容
    }
}
```

### 3. ServletContext 架构设计要点

#### 3.1 数据管理
- 数据的存储与获取：使用 `setAttribute` 方法存储数据，使用 `getAttribute` 方法获取数据。注意，存储的数据应该是线程安全的，避免多个线程同时修改数据导致的数据不一致问题。
- 数据的清理：在应用程序关闭时，应该清理 ServletContext 中存储的不必要的数据，避免内存泄漏。

#### 3.2 资源管理
- 资源的加载：通过 `getResourceAsStream` 方法加载资源文件，确保资源文件的路径正确。
- 资源的缓存：对于一些频繁访问的资源，可以考虑在 ServletContext 中进行缓存，提高访问效率。

#### 3.3 事件监听
可以通过实现 `ServletContextListener` 接口来监听 ServletContext 的创建和销毁事件，在事件发生时执行相应的操作，如初始化数据库连接池、关闭资源等。
```java
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

@WebListener
public class MyServletContextListener implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent sce) {
        // 应用程序启动时执行的操作
        System.out.println("Web application started");
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        // 应用程序关闭时执行的操作
        System.out.println("Web application stopped");
    }
}
```

### 4. 总结
ServletContext 是 Servlet 架构中的全局中枢，掌握它的架构设计和使用方法对开发高效、可维护的 Web 应用程序很重要。合理利用 ServletContext 的功能，可以实现数据的共享、资源的管理和事件的监听，提升 Web 应用程序的性能和可扩展性。


## 2.5 高效实现精准响应 ，快速掌握Response高阶技巧

在 Java Web 开发中，`ServletResponse` 是一个关键接口，它负责封装服务器对客户端的响应信息。下面为你介绍一些 `ServletResponse` 的高阶使用技巧。

### 1. 响应编码与字符集设置
为了避免响应内容出现乱码问题，需要正确设置响应的编码和字符集。

```java
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/encodingExample")
public class EncodingExampleServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // 设置响应的字符编码为 UTF-8
        response.setCharacterEncoding("UTF-8");
        // 设置响应的内容类型，同时指定字符集
        response.setContentType("text/html;charset=UTF-8");
        response.getWriter().write("这是一段中文响应内容");
    }
}
```
上述代码中，`setCharacterEncoding` 方法用于设置响应的字符编码，`setContentType` 方法不仅指定了响应内容类型为 HTML，还明确了字符集为 UTF-8。

### 2. 重定向
重定向是指服务器通知客户端重新向另一个 URL 发送请求。重定向分为临时重定向（状态码 302）和永久重定向（状态码 301）。

```java
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/redirectExample")
public class RedirectExampleServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // 临时重定向
        response.sendRedirect("https://www.example.com");

        // 若要实现永久重定向
        // response.setStatus(HttpServletResponse.SC_MOVED_PERMANENTLY);
        // response.setHeader("Location", "https://www.example.com");
    }
}
```
`sendRedirect` 方法会自动设置状态码为 302 并添加 `Location` 响应头。如果要实现永久重定向，需要手动设置状态码 301 和 `Location` 头。

### 3. 设置响应头
通过设置响应头可以控制客户端的行为，例如设置缓存策略、跨域访问等。

```java
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/headerExample")
public class HeaderExampleServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // 设置缓存策略，禁止缓存
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setDateHeader("Expires", 0);

        // 允许跨域访问
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");

        response.getWriter().write("响应内容");
    }
}
```
上述代码中，设置了缓存策略以禁止客户端缓存响应内容，同时设置了跨域访问的相关响应头，允许任何域名访问该资源。

### 4. 响应二进制数据
当需要向客户端发送二进制数据（如图片、文件等）时，可使用 `ServletOutputStream`。

```java
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;

@WebServlet("/binaryResponseExample")
public class BinaryResponseExampleServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // 设置响应内容类型为图片
        response.setContentType("image/jpeg");

        // 获取要发送的图片文件
        File imageFile = new File("path/to/your/image.jpg");
        FileInputStream fis = new FileInputStream(imageFile);
        OutputStream os = response.getOutputStream();

        byte[] buffer = new byte[4096];
        int bytesRead;
        while ((bytesRead = fis.read(buffer)) != -1) {
            os.write(buffer, 0, bytesRead);
        }

        fis.close();
        os.close();
    }
}
```
此代码示例中，将一张图片以二进制形式发送给客户端。首先设置响应内容类型为图片，然后使用 `FileInputStream` 读取图片文件，再通过 `ServletOutputStream` 将文件内容发送给客户端。

### 5. 异步响应
对于处理耗时较长的请求，使用异步响应可以避免阻塞 Servlet 线程，提高服务器的并发处理能力。

```java
import javax.servlet.AsyncContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet(asyncSupported = true, urlPatterns = "/asyncExample")
public class AsyncExampleServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // 开启异步处理
        AsyncContext asyncContext = request.startAsync();
        asyncContext.start(() -> {
            try {
                // 模拟耗时操作
                Thread.sleep(5000);
                response.getWriter().write("异步处理完成");
            } catch (Exception e) {
                e.printStackTrace();
            } finally {
                asyncContext.complete();
            }
        });
    }
}
```
在上述代码中，通过 `request.startAsync()` 开启异步处理，将耗时操作放在一个新的线程中执行，避免阻塞 Servlet 线程。操作完成后，调用 `asyncContext.complete()` 结束异步处理。


## 2.6 实战：快速构建基于Servlet的REST API服务

下面聊聊如何快速构建可监控的 REST API 服务。

### 项目初始化


执行以下命令进行初始化项目原型：


```
mvn archetype:generate -DgroupId=com.example.servlet -DartifactId=servlet-rest-api-service -DarchetypeArtifactId=maven-archetype-webapp -DarchetypeVersion=1.5 -DinteractiveMode=false
```

此时会创建一个名为"spring-jdbc-template"的项目。这里使用的项目原型类型是maven-archetype-webapp，表示初始化的应用是一个Web应用。


在 `pom.xml` 中添加必要的依赖，包括 Servlet API、JSON 处理库（如 Jackson）：
```xml
<dependencies>
    <!-- Servlet API -->
    <dependency>
        <groupId>jakarta.servlet</groupId>
        <artifactId>jakarta.servlet-api</artifactId>
        <version>6.1.0</version>
        <scope>provided</scope>
    </dependency>
    <!-- Jackson JSON 处理库 -->
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
        <version>2.19.2</version>
    </dependency>

    <!-- ...为节约篇幅，此处省略非核心内容 -->
</dependencies>
```
### 创建业务代码所在目录


在`src/main`目录下，已经初始化了一个webapp目录，这个目录下还有WEB-INF目录和index.jsp文件。WEB-INF目录下有web.xml文件。


需要在`src/main`目录下创建一个java目录，用来放置业务代码。


### 定义数据模型

创建一个简单的 Java 类来表示 API 处理的数据：
```java
package com.example.servlet.model;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * User 用户模型
 *
 * @version 2025/08/10
 **/
public class User {
    @JsonProperty("id")
    private int id;

    @JsonProperty("name")
    private String name;

    public User() {
    }

    public User(int id, String name) {
        this.id = id;
        this.name = name;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

}
```

### 创建 Servlet 处理 REST 请求

创建一个 Servlet 来处理 REST API 请求：

```java
package com.example.servlet.interfaces;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.servlet.model.User;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;

/**
 * UserServlet User Servlet
 *
 * @version 2025/08/10
 **/
@WebServlet("/users")
public class UserServlet extends HttpServlet {
    private ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        // 设置内容类型为JSON
        response.setContentType("application/json");

        // 设置字符编码
        response.setCharacterEncoding("UTF-8");

        // 构造用户模型对象
        User user = new User(1, "Way Lau");

        // 将对象转为JSON字符串
        String json = objectMapper.writeValueAsString(user);

        // 写出JSON字符串
        PrintWriter out = response.getWriter();
        out.print(json);
        out.flush();
    }
}
```


### 打包项目

使用 Maven 打包项目：

```bash
mvn clean package
```

生成了servlet-rest-api-service.war文件。

### 部署到 Servlet 容器


将生成的 WAR 文件部署到 Tomcat 等 Servlet 容器中。

以为例，将WAR文件放置到webapps目录下，执行

```
cd D:\dev\java\apache-tomcat-11.0.10-windows-x64\apache-tomcat-11.0.10\bin
.\startup.bat
```

### REST API
使用工具（如浏览器、Postman 或 cURL）测试 REST API：

```bash
curl http://localhost:8080/servlet-rest-api-service/users
```

结果如下：

```
{"id":1,"name":"Way Lau"}
```


### 总结

这样你就可以快速构建一个可监控的 REST API 服务。使用 Servlet 处理 REST 请求，结合 Jackson 进行 JSON 数据处理，方便对 API 服务的性能和使用情况进行监控和分析。


## 3.1 从Servlet到Spring Web MVC，掌握企业级Web服务的线程模型与处理架构

在企业级Web服务开发中，理解从Servlet到Spring Web MVC的线程模型与处理架构的演变和特点很重要。

### Servlet的线程模型与处理架构
- 线程模型：Servlet容器为每个请求分配一个线程来处理。当请求到达时，容器从线程池中取出一个空闲线程执行Servlet的 `service` 方法，处理请求并生成响应。请求处理完成后，线程返回线程池等待下一次任务。这种模型简单直接，但在高并发场景下可能出现线程资源竞争和阻塞问题。
- 处理架构：客户端发送HTTP请求到Servlet容器，容器根据请求的URL等信息将请求分发到对应的Servlet。Servlet通过 `ServletRequest` 和 `ServletResponse` 对象获取请求信息并生成响应。Servlet可以访问后端资源，如数据库、文件系统等，进行业务逻辑处理。

### Spring Web MVC的线程模型与处理架构
- 线程模型：Spring Web MVC基于Servlet容器，在其基础上进行了更高层次的封装和扩展。通常使用 `ThreadPoolTaskExecutor` 等线程池来管理线程。在处理请求时，从线程池中获取线程执行控制器（Controller）方法。与Servlet相比，Spring Web MVC的线程模型更具灵活性和可配置性，可以根据业务需求调整线程池参数，如核心线程数、最大线程数、队列容量等，以优化性能。
- 处理架构：采用前端控制器（DispatcherServlet）设计模式。所有请求首先到达 `DispatcherServlet`，它根据请求的URL和配置信息将请求分发给相应的处理器映射（Handler Mapping），找到对应的控制器（Controller）。控制器处理请求，调用业务逻辑服务（Service），获取数据后返回模型和视图（ModelAndView）。`DispatcherServlet` 再根据视图解析器（View Resolver）将模型数据渲染到视图中，生成最终的响应返回给客户端。

### 两者对比与优势
- Servlet：是Java Web开发的基础，提供了底层的请求处理和响应生成能力，适用于简单的Web应用或对底层控制要求较高的场景。但在处理复杂业务逻辑和高并发时，开发和维护成本较高。
- Spring Web MVC：构建在Servlet之上，提供了更高级的抽象和更灵活的配置方式。通过注解驱动等方式简化了开发流程，将业务逻辑、视图展示和请求处理等功能进行了清晰的分离，提高了代码的可维护性和可扩展性。在企业级应用中，尤其适合处理复杂的业务逻辑和高并发场景。

### 企业级应用中的最佳实践
- 线程池优化：根据应用的并发量和业务特点，合理配置Spring Web MVC的线程池参数。对于IO密集型任务，可适当增加线程数；对于CPU密集型任务，要避免线程过多导致上下文切换开销过大。
- 请求处理优化：在控制器中，尽量避免长时间阻塞线程的操作，如大量的文件读取或复杂的数据库查询。可以采用异步处理、缓存等技术来提高响应速度。
- 架构设计：利用Spring Web MVC的分层架构，将业务逻辑封装在服务层，数据访问封装在数据访问层，视图展示在视图层，各层之间通过清晰的接口进行交互，提高系统的可维护性和可测试性。


## 3.2 全栈后端的安全围栏：MVC过滤器链

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


## 3.3 全栈后端的指令中心：控制器

### 3.3.1 控制器概述

`@Controller` 和 `@RestController` 是 Spring MVC 中实现控制器的常用注解。这些注解可以用来表示请求映射、请求输入、异常处理等。使用带注解的的控制器具有灵活的方法签名，不必扩展基类，也不需要实现特定的接口。


以下是一个使用 `@Controller` 注解的例子：

```java
@Controller
public class HelloController {

    @GetMapping("/hello")
    public String handle(Model model) {
        model.addAttribute("message", "Hello World!");
        return "index";
    }
}
```

### 3.3.2 声明控制器


你可以使用 Servlet 的 WebApplicationContext 中的标准 Spring bean 定义来定义控制器 bean。`@Controller`的原型允许自动检测，可以被 Spring 自动注册。

要启用这种 `@Controller` bean 的自动检测，你可以将组件扫描添加到 Java 配置中：

```java
@Configuration
@ComponentScan("com.example.spring")
public class WebConfig {

    // ...
}
```


等价于以下基于 XML 的配置：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:p="http://www.springframework.org/schema/p"
    xmlns:context="http://www.springframework.org/schema/context"
    xsi:schemaLocation="
        http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context
        http://www.springframework.org/schema/context/spring-context.xsd">

    <context:component-scan base-package="com.example.spring"/>

    <!-- ... -->

</beans>
```

`@RestController` 等价于 `@Controller` 与 `@ResponseBody` 的组合，主要用于返回在 RESTful 应用常用的 JSON 格式数据。即

```
@RestController = @Controller + @ResponseBody 
```

其中：

* `@ResponseBody`：该注解指示方法返回值的应绑定到 Web 响应正文。
* `@RestController`：暗示用户，这是一个支持 REST 的控制器。

### 3.3.3 请求映射


`@RequestMapping` 注解用于将请求映射到控制器方法上。它具有通过 URL、HTTP 方法、请求参数、头和媒体类型进行匹配的各种属性。它可以在类级使用来表示共享映射，或者在方法级使用，以缩小到特定的端点映射。

`@RequestMapping` 还有一些基于特定 HTTP 方法的快捷方式变体：

* `@GetMapping`
* `@PostMapping`
* `@PutMapping`
* `@DeleteMapping`
* `@PatchMapping`

在类级别仍需要 `@RequestMapping` 来表示共享映射。

以下是类级别和方法级别映射的示例：

```java
@RestController
@RequestMapping("/persons")
class PersonController {

    @GetMapping("/{id}")
    public Person getPerson(@PathVariable Long id) {
        // ...
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void add(@RequestBody Person person) {
        // ...
    }
}
```

#### URI 匹配模式


Spring 支持使用 glob 模式和通配符来映射请求：

* `?`：匹配一个字符
* `*`：匹配路径段中的零个或多个字符
* `**`：匹配零个或多个路径段

你还可以声明 URI 变量并使用`@PathVariable`访问它们的值：

```java
@GetMapping("/owners/{ownerId}/pets/{petId}")
public Pet findPet(@PathVariable Long ownerId, @PathVariable Long petId) {
    // ...
}
```

URI 变量可以在类或者方法级别上声明：

```java
@Controller
@RequestMapping("/owners/{ownerId}")
public class OwnerController {

    @GetMapping("/pets/{petId}")
    public Pet findPet(@PathVariable Long ownerId, @PathVariable Long petId) {
        // ...
    }
}
```

可以显式地命名 URI 变量，例如`@PathVariable("customId")`，但如果名称相同，并且你的代码是使用调试信息编译的，或者使用 Java 8 上的`-parameters`编译器标志进行编译，则可以无需对 URI 变量命名。

可以使用正则表达式声明一个 URI 变量，其语法为`{varName:regex}` 。例如，给定 URL “/spring-web-3.0.5.jar”，从下面的方法中提取名称、版本和文件扩展名：


```java
@GetMapping("/{name:[a-z-]+}-{version:\\d\\.\\d\\.\\d}{ext:\\.[a-z]+}")
public void handle(@PathVariable String version, @PathVariable String ext) {
    // ...
}
```


#### 后缀匹配和 RFD

RFD（Reflected file download，反射文件下载）攻击类似于 XSS，因为它依赖于请求输入，例如查询参数、URI 变量，被反映在响应中。然而，与其将 JavaScript 插入 HTML 中不同，RFD 攻击依赖于浏览器切换来执行下载，并在稍后双击时将响应视为可执行脚本。

在 Spring MVC 中，`@ResponseBody` 和 `ResponseEntity` 方法面临风险，因为它们可以呈现不同的内容类型，客户端可以通过 URL 路径扩展来请求这些内容类型。禁用后缀模式匹配和使用路径扩展进行内容协商可降低风险，但不足以防止 RFD 攻击。

为了防止 RFD 攻击，在呈现响应主体之前，Spring MVC 添加了一个 `Content-Disposition:inline;filename=f.txt` 头来安全的下载文件。


#### 消费媒体类型

可以根据请求的内容类型缩小请求映射的范围：


```java
@PostMapping(path = "/pets", consumes = "application/json")
public void addPet(@RequestBody Pet pet) {
    // ...
}
```

consumes 属性还支持否定表达式。例如，“!text/plain”表示除“text/plain”以外的任何内容类型。


MediaType 为常用的媒体类型提供常量，例如 APPLICATION_JSON_VALUE，APPLICATION_JSON_UTF8_VALUE。


#### 生成媒体类型

可以根据 Accept 请求头和控制器方法生成的内容类型列表缩小请求映射的范围：


```java
@GetMapping(path = "/pets/{petId}", produces = "application/json;charset=UTF-8")
@ResponseBody
public Pet getPet(@PathVariable String petId) {
    // ...
}
```

媒体类型可以指定一个字符集。同时，也支持否定表达式。例如，“!text/plain”表示除“text/plain”以外的任何内容类型。

可以在类级别声明共享 produces 属性。当在类级别使用时，方法级别的 produces 性将覆盖类级别声明。

MediaType 为常用的媒体类型提供常量，例如 APPLICATION_JSON_VALUE，APPLICATION_JSON_UTF8_VALUE。

#### 参数和头

可以根据请求参数条件缩小请求映射。比如：

```java
@GetMapping(path = "/pets/{petId}", params = "myParam=myValue")
public void findPet(@PathVariable String petId) {
    // ...
}
```

也可以对请求头条件使用相同的内容：

```java
@GetMapping(path = "/pets", headers = "myHeader=myValue")
public void findPet(@PathVariable String petId) {
    // ...
}
```

### 3.3.4 处理器方法


#### 矩阵变量

矩阵变量可出现在任何路径段中，每个变量用分号分隔，多个值用逗号分隔，例如“/cars;color=red,green;year=2012”。 也可以通过重复的变量名称来指定多个值，例如，“color=red;color=green;color=blue”。

如果 URL 需要包含矩阵变量，则控制器方法的请求映射必须使用 URI 变量来屏蔽该变量内容，并确保可以成功匹配请求。下面是一个例子：


```java
// GET /pets/42;q=11;r=22

@GetMapping("/pets/{petId}")
public void findPet(@PathVariable String petId, @MatrixVariable int q) {

    // petId == 42
    // q == 11
}
```


矩阵变量可以给定默认值：


```java
// GET /pets/42

@GetMapping("/pets/{petId}")
public void findPet(@MatrixVariable(required=false, defaultValue="1") int q) {

    // q == 1
}
```

若需要获得所有矩阵变量，可以使用 MultiValueMap：


```java
// GET /owners/42;q=11;r=12/pets/21;q=22;s=23

@GetMapping("/owners/{ownerId}/pets/{petId}")
public void findPet(
        @MatrixVariable MultiValueMap<String, String> matrixVars,
        @MatrixVariable(pathVar="petId"") MultiValueMap<String, String> petMatrixVars) {

    // matrixVars: ["q" : [11,22], "r" : 12, "s" : 23]
    // petMatrixVars: ["q" : 22, "s" : 23]
}
```


如果要启用矩阵变量，可以在 Java 配置中通过 Path Matching 设置一个带有 `removeSemicolonContent=false` 的 UrlPathHelper。在 XML 命名空间中，使用`<mvc:annotation-driven enable-matrix-variables="true"/>`。


#### @RequestParam

`@RequestParam` 将 Servlet 请求参数（即查询参数或表单数据）绑定到控制器中的方法参数上。

以下代码片段显示了用法：


```java
@Controller
@RequestMapping("/pets")
public class EditPetForm {

    // ...

    @GetMapping
    public String setupForm(@RequestParam("petId") int petId, Model model) {
        Pet pet = this.clinic.loadPet(petId);
        model.addAttribute("pet", pet);
        return "petForm";
    }

    // ...

}
```

#### @RequestHeader

@RequestHeader 将请求头绑定到控制器中的方法参数上。


以下是获取头上的 Accept-Encoding 和 Keep-Alive 的值：


```java
@GetMapping("/demo")
public void handle(
        @RequestHeader("Accept-Encoding") String encoding,
        @RequestHeader("Keep-Alive") long keepAlive) {
    //...
}
```

#### @CookieValue


@CookieValue  将 HTTP cookie 的值绑定到控制器中的方法参数上。


以下代码示例演示了如何获取 cookie 值：

```java
@GetMapping("/demo")
public void handle(@CookieValue("JSESSIONID") String cookie) {
    //...
}
```

如果目标方法参数类型不是字符串，则会自动应用类型转换来转成字符串。


#### @ModelAttribute

在方法参数上使用`@ModelAttribute`来访问模型中的属性，或者如果不存在，则将其实例化。模型属性还覆盖了来自 HTTP Servlet 请求参数的名称与字段名称匹配的值。这被称为数据绑定，它不必处理解析和转换单个查询参数和表单字段。例如：

```java
@PostMapping("/owners/{ownerId}/pets/{petId}/edit")
public String processSubmit(@ModelAttribute Pet pet) { }
```

#### @SessionAttributes

@SessionAttributes 用于在请求之间的 HTTP Servlet 会话中存储模型属性。这通常会列出模型属性的名称或模型属性的类型，这些属性应该透明地存储在会话中供随后的访问请求使用。

```java
@Controller
@SessionAttributes("pet")
public class EditPetForm {
    // ...
}
```


#### @SessionAttribute


如果你需要访问全局（即在控制器之外）管理的预先存在的会话属性，并且可能存在也可能不存在，请在方法参数上使用 `@SessionAttribute`:

```java
@RequestMapping("/")
public String handle(@SessionAttribute User user) {
    // ...
}
```


对于需要添加或删除会话属性的用例，请考虑将 org.springframework.web.context.request.WebRequest 或 javax.servlet.http.HttpSession 注入控制器方法。

为了将会话中的模型属性临时存储为控制器工作流的一部分，请考虑使用 @SessionAttributes 中所述的 SessionAttributes。


#### @RequestAttribute

类似于 `@SessionAttribute`，可以使用 `@RequestAttribute` 注解来访问先前创建的请求属性，例如， 通过 Servlet 过滤器或 HandlerInterceptor：

```java
@GetMapping("/")
public String handle(@RequestAttribute Client client) {
    // ...
}
```


#### 重定向属性

默认情况下，所有模型属性都被视为在重定向 URL 中作为 URI 模板变量公开。例如：

```java
@PostMapping("/files/{path}")
public String upload(...) {
    // ...
    return "redirect:files/{path}";
}
```


#### Multipart

在启用 MultipartResolver 之后，具有"multipart/form-data"的 POST 请求内容将被解析并作为常规请求参数访问。下面的例子访问一个常规表单字段和一个上传的文件：

```java
@Controller
public class FileUploadController {

    @PostMapping("/form")
    public String handleFormUpload(@RequestParam("name") String name,
            @RequestParam("file") MultipartFile file) {

        if (!file.isEmpty()) {
            byte[] bytes = file.getBytes();

            // 省略保存字节的逻辑
            return "redirect:uploadSuccess";
        }

        return "redirect:uploadFailure";
    }

}
```

Multipart 内容也可以用作数据绑定到命令对象的一部分。 例如，上面的表单域和文件可能是表单对象上的字段：

```java
class MyForm {

    private String name;

    private MultipartFile file;

    // ...

}

@Controller
public class FileUploadController {

    @PostMapping("/form")
    public String handleFormUpload(MyForm form, BindingResult errors) {

        if (!form.getFile().isEmpty()) {
            byte[] bytes = form.getFile().getBytes();
            // store the bytes somewhere
            return "redirect:uploadSuccess";
        }

        return "redirect:uploadFailure";
    }

}
```


#### @RequestBody

使用 @RequestBody 通过 HttpMessageConverter 将请求体读取并反序列化成一个 Object。下面是一个带有 `@RequestBody` 参数的例子：


```java
@PostMapping("/accounts")
public void handle(@RequestBody Account account) {
    // ...
}
```

#### HttpEntity


HttpEntity 大部分与 `@RequestBody` 相同，只是基于容器对象来公开请求头和正文的。下面是一个例子：

```java
@PostMapping("/accounts")
public void handle(HttpEntity<Account> entity) {
    // ...
}
```

#### @ResponseBody

在一个方法上使用 `@ResponseBody` 注解，将通过 HttpMessageConverter 将返回已经经过序列化的响应主体。例如：


```java
@GetMapping("/accounts/{id}")
@ResponseBody
public Account handle() {
    // ...
}
```


#### ResponseEntity


ResponseEntity 大部分与 `@ResponseBody` 相同，只是基于容器对象来指定请求头和正文的。下面是一个例子：

```java
@PostMapping("/something")
public ResponseEntity<String> handle() {
    // ...
    URI location = ...
    return new ResponseEntity.created(location).build();
}
```


#### Jackson JSON

Spring MVC 为 Jackson 的序列化视图提供了内置的支持。以下是在 @ResponseBody 或 ResponseEntity 控制器方法上，使用 Jackson 的 `@JsonView` 注解来激活序列化视图类的例子：

```java
@RestController
public class UserController {

    @GetMapping("/user")
    @JsonView(User.WithoutPasswordView.class)
    public User getUser() {
        return new User("eric", "7!jd#h23");
    }
}

public class User {

    public interface WithoutPasswordView {};
    public interface WithPasswordView extends WithoutPasswordView {};

    private String username;
    private String password;

    public User() {
    }

    public User(String username, String password) {
        this.username = username;
        this.password = password;
    }

    @JsonView(WithoutPasswordView.class)
    public String getUsername() {
        return this.username;
    }

    @JsonView(WithPasswordView.class)
    public String getPassword() {
        return this.password;
    }
}
```

### 3.3.5 模型方法


可以在 `@RequestMapping` 方法参数上使用 `@ModelAttribute` 来创建或访问模型中的 Object 并将其绑定到请求中。`@ModelAttribute`也可以用作控制器方法的方法级注解，其目的不是处理请求，而是在请求处理之前添加常用模型属性。

控制器可以有任意数量的 `@ModelAttribute` 方法。 所有这些方法在相同控制器中的 `@RequestMapping` 方法之前被调用。`@ModelAttribute` 方法也可以通过 `@ControllerAdvice` 在控制器之间共享。 

`@ModelAttribute` 方法具有灵活的方法签名。它们支持许多与 `@RequestMapping` 方法相同的参数，除了 `@ModelAttribute` 本身或任何与请求主体相关的东西。

以下要使用 `@ModelAttribute` 方法的示例：


```java
@ModelAttribute
public void populateModel(@RequestParam String number, Model model) {
    model.addAttribute(accountRepository.findAccount(number));
    // add more ...
}
```

### 3.3.6 绑定器方法


`@Controller` 或 `@ControllerAdvice` 类中的 `@InitBinder` 方法可用于自定义表示基于字符串的请求值（例如请求参数、路径变量、头、cookie 等）的方法参数的类型转换。在将请求参数绑定到 `@ModelAttribute` 参数（即命令对象）上时，类型转换也适用。


`@InitBinder` 方法支持许多与 `@RequestMapping` 方法相同的参数，除了 `@ModelAttribute (command object)` 参数。下面是一个例子：


```java
@Controller
public class FormController {

    @InitBinder
    public void initBinder(WebDataBinder binder) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        dateFormat.setLenient(false);
        binder.registerCustomEditor(Date.class, new CustomDateEditor(dateFormat, false));
    }

    // ...
}
```


## 4.1 全栈后端异常治理：将未捕获异常导致的线上事故

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


## 4.2 CORS安全策略

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


## 4.3 全栈后端性能加速引擎：HTTP缓存策略深度解析，让响应速度

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


## 4.4 进阶掌握MVC配置魔方：掌握多种自定义配置方式

Spring MVC 提供了基于 Java 和 XML 的配置，其默认的配置值可以满足大多数的应用场景。当然，Spring MVC 也提供了 API 以方便开发人员来自定义配置。


### 4.4.1 启用 MVC 配置

在基于 Java 的配置中，启用 MVC 配置是使用 `@EnableWebMvc` 注解：


```java
@Configuration
@EnableWebMvc
public class WebConfig {
}
```

如果是使用基于 XML 的配置，则需要使用 `<mvc:annotation-driven>` 元素：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:mvc="http://www.springframework.org/schema/mvc"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="
        http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/mvc
        http://www.springframework.org/schema/mvc/spring-mvc.xsd">

    <mvc:annotation-driven/>

</beans>
```

### 4.4.2 类型转换

默认情况下，Number 和 Date 类型的格式化程序已安装，包括支持 `@NumberFormat` 和 `@DateTimeFormat` 注解。如果 Joda 类库存在于类路径中，则还会安装对 Joda 时间格式库的全面支持。

在 Java 配置中，注册自定义格式化器和转换器实现如下：


```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addFormatters(FormatterRegistry registry) {
        // ...
    }
}
```

如果是使用基于 XML 的配置，则用法如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:mvc="http://www.springframework.org/schema/mvc"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="
        http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/mvc
        http://www.springframework.org/schema/mvc/spring-mvc.xsd">

    <mvc:annotation-driven conversion-service="conversionService"/>

    <bean id="conversionService"
            class="org.springframework.format.support.FormattingConversionServiceFactoryBean">
        <property name="converters">
            <set>
                <bean class="org.example.MyConverter"/>
            </set>
        </property>
        <property name="formatters">
            <set>
                <bean class="org.example.MyFormatter"/>
                <bean class="org.example.MyAnnotationFormatterFactory"/>
            </set>
        </property>
        <property name="formatterRegistrars">
            <set>
                <bean class="org.example.MyFormatterRegistrar"/>
            </set>
        </property>
    </bean>

</beans>
```


### 4.4.3 验证


默认情况下，如果 Bean 验证存在于类路径中，例如 Hibernate Validator、LocalValidatorFactoryBean 被注册为全局验证器，则会用于加了 `@Valid` 和 Validated 的控制器方法参数的验证。

在 Java 配置中，可以自定义全局的 Validator 实例：

```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public Validator getValidator(); {
        // ...
    }
}
```


如果是使用基于 XML 的配置，则用法如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:mvc="http://www.springframework.org/schema/mvc"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="
        http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/mvc
        http://www.springframework.org/schema/mvc/spring-mvc.xsd">

    <mvc:annotation-driven validator="globalValidator"/>

</beans>
```


### 4.4.4 拦截器


在 Java 配置中，在应用中注册拦截器用于传入请求：

```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new LocaleInterceptor());
        registry.addInterceptor(new ThemeInterceptor())
            .addPathPatterns("/**").excludePathPatterns("/admin/**");
        registry.addInterceptor(new SecurityInterceptor())
            .addPathPatterns("/secure/*");
    }
}
```

如果是使用基于 XML 的配置，则用法如下：

```xml
<mvc:interceptors>
    <bean class="org.springframework.web.servlet.i18n.LocaleChangeInterceptor"/>
    <mvc:interceptor>
        <mvc:mapping path="/**"/>
        <mvc:exclude-mapping path="/admin/**"/>
        <bean class="org.springframework.web.servlet.theme.ThemeChangeInterceptor"/>
    </mvc:interceptor>
    <mvc:interceptor>
        <mvc:mapping path="/secure/*"/>
        <bean class="org.example.SecurityInterceptor"/>
    </mvc:interceptor>
</mvc:interceptors>
```

### 4.4.5 内容类型

可以配置 Spring MVC 如何根据请求确定请求的媒体类型，例如 Accept  头、URL 路径扩展、查询参数等。

默认情况下，首先检查 URL 路径扩展，根据类路径依赖关系将 json、xml、rss 和 atom 注册为已知扩展，然后再检查 Accept 头。

考虑将这些默认值仅更改为 Accept header，并且如果你必须使用基于 URL 的内容类型解析，请考虑路径扩展中的查询参数策略。有关更多详细信息，请参见后缀匹配和后缀匹配以及 RFD。

在 Java 配置中，自定义请求的内容类型示例如下：

```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
        configurer.mediaType("json", MediaType.APPLICATION_JSON);
    }
}
```

如果是使用基于 XML 的配置，则用法如下：

```xml
<mvc:annotation-driven content-negotiation-manager="contentNegotiationManager"/>

<bean id="contentNegotiationManager" 
    class="org.springframework.web.accept.ContentNegotiationManagerFactoryBean">
    <property name="mediaTypes">
        <value>
            json=application/json
            xml=application/xml
        </value>
    </property>
</bean>
```


### 4.4.6 消息转换器


自定义 HttpMessageConverter 可以在 Java 配置中通过覆盖 configureMessageConverters() 方法来实现，如果你想要替换由 Spring MVC 创建的默认转换器，或者如果你只想定制它们或将其他转换器添加到默认转换器，则可以重写 extendMessageConverters() 方法。

下面是一个例子，它添加了 Jackson JSON 和 XML 转换器的自定义 ObjectMapper：

```java
@Configuration
@EnableWebMvc
public class WebConfiguration implements WebMvcConfigurer {

    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        Jackson2ObjectMapperBuilder builder = new Jackson2ObjectMapperBuilder()
                .indentOutput(true)
                .dateFormat(new SimpleDateFormat("yyyy-MM-dd"))
                .modulesToInstall(new ParameterNamesModule());
        converters.add(new MappingJackson2HttpMessageConverter(builder.build()));
        converters.add(new MappingJackson2XmlHttpMessageConverter(builder.xml().build()));
    }
}
```


如果是使用基于 XML 的配置，则用法如下：

```xml
<mvc:annotation-driven>
    <mvc:message-converters>
        <bean class="org.springframework.http.converter.json.MappingJackson2HttpMessageConverter">
            <property name="objectMapper" ref="objectMapper"/>
        </bean>
        <bean class="org.springframework.http.converter.xml.MappingJackson2XmlHttpMessageConverter">
            <property name="objectMapper" ref="xmlMapper"/>
        </bean>
    </mvc:message-converters>
</mvc:annotation-driven>

<bean id="objectMapper" class="org.springframework.http.converter.json.Jackson2ObjectMapperFactoryBean"
      p:indentOutput="true"
      p:simpleDateFormat="yyyy-MM-dd"
      p:modulesToInstall="com.fasterxml.jackson.module.paramnames.ParameterNamesModule"/>

<bean id="xmlMapper" parent="objectMapper" p:createXmlMapper="true"/>
```


### 4.4.7 视图控制器


这是定义一个 ParameterizableViewController 的快捷方式，它可以在调用时立即转发到视图。如果在视图生成响应之前没有 Java 控制器逻辑要执行，则在静态情况下使用它。

以下是在 Java 中将“/”请求转发到名为“home”的视图的示例：

```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("home");
    }
}
```

如果是使用基于 XML 的配置，则用法如下：

```xml
<mvc:view-controller path="/" view-name="home"/>
```

### 4.4.8 视图解析器

MVC配置简化了视图解析器的注册。

以下是一个 Java 配置示例，它使用 FreeMarker HTML 模板和 Jackson 作为 JSON 呈现的视图解析器：

```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void configureViewResolvers(ViewResolverRegistry registry) {
        registry.enableContentNegotiation(new MappingJackson2JsonView());
        registry.jsp();
    }
}
```


如果是使用基于 XML 的配置，则用法如下：

```xml
<mvc:view-resolvers>
    <mvc:content-negotiation>
        <mvc:default-views>
            <bean class="org.springframework.web.servlet.view.json.MappingJackson2JsonView"/>
        </mvc:default-views>
    </mvc:content-negotiation>
    <mvc:jsp/>
</mvc:view-resolvers>
```


### 4.4.9 静态资源

此选项提供了一种便捷的方式来从基于资源的位置列表中提供静态资源。

在下面的示例中，如果请求以“/resources”开头，则会使用相对路径查找并提供相对于 Web 应用程序根目录下的“/public”或“/static”下的类路径的静态资源，这些资源将在未来1年内到期，以确保最大限度地利用浏览器缓存并减少浏览器发出的 HTTP 请求。 Last-Modified 头也被评估，如果存在，则返回 304 状态码。


```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/resources/**")
            .addResourceLocations("/public", "classpath:/static/")
            .setCachePeriod(31556926);
    }
}
```


如果是使用基于 XML 的配置，则用法如下：

```xml
<mvc:resources mapping="/resources/**"
    location="/public, classpath:/static/"
    cache-period="31556926" />
```

### 4.4.10 DefaultServletHttpRequestHandler

DefaultServletHttpRequestHandler 这允许将 DispatcherServlet 映射到“/”（从而覆盖容器默认 Servlet 的映射），同时仍允许静态资源请求由容器的默认 Servlet 处理。 它使用“/**”的 URL 映射和相对于其他 URL 映射的最低优先级来配置 DefaultServletHttpRequestHandler。

该处理程序将把所有请求转发给默认的 Servlet。因此，重要的是它保持最后的所有其他 URL HandlerMapping 的顺序。如果你使用 `<mvc：annotation-driven>`，或者如果你要设置自定义 HandlerMapping 实例，请确保将其顺序属性设置为低于 DefaultServletHttpRequestHandler 的值（即 Integer.MAX_VALUE）。

要启用该功能，请使用：

```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void configureDefaultServletHandling(DefaultServletHandlerConfigurer configurer) {
        configurer.enable();
    }
}
```


如果是使用基于 XML 的配置，则用法如下：

```xml
<mvc:default-servlet-handler/>
```

### 4.4.11 路径匹配


这允许自定义与 URL 匹配和 URL 处理相关的选项。

Java 配置中的示例如下：


```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        configurer
            .setUseSuffixPatternMatch(true)
            .setUseTrailingSlashMatch(false)
            .setUseRegisteredSuffixPatternMatch(true)
            .setPathMatcher(antPathMatcher())
            .setUrlPathHelper(urlPathHelper());
    }

    @Bean
    public UrlPathHelper urlPathHelper() {
        //...
    }

    @Bean
    public PathMatcher antPathMatcher() {
        //...
    }

}
```


如果是使用基于 XML 的配置，则用法如下：

```xml
<mvc:annotation-driven>
    <mvc:path-matching
        suffix-pattern="true"
        trailing-slash="false"
        registered-suffixes-only="true"
        path-helper="pathHelper"
        path-matcher="pathMatcher"/>
</mvc:annotation-driven>

<bean id="pathHelper" class="org.example.app.MyPathHelper"/>
<bean id="pathMatcher" class="org.example.app.MyPathMatcher"/>
```


## 5.1 实战：掌握全栈前后端高效对话核心技能JSON处理

在 Spring MVC 中处理 JSON 数据是开发 Web 应用时的常见需求，下面聊聊 Spring MVC 进行 JSON 处理的实战内容，涵盖环境搭建、配置、数据转换、请求响应处理等方面。


### 项目初始化


执行以下命令进行初始化项目原型：


```
mvn archetype:generate -DgroupId=com.example.spring.mvc -DartifactId=spring-mvc-json -DarchetypeArtifactId=maven-archetype-webapp -DarchetypeVersion=1.5 -DinteractiveMode=false
```

此时会创建一个名为“spring-mvc-json”的Web应用程序。

在 `pom.xml` 中添加必要的依赖，包括 Servlet API、JSON 处理库（如 Jackson）等：
```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-framework-bom</artifactId>
      <version>6.2.9</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>

    <!-- ...为节约篇幅，此处省略非核心内容 -->
  </dependencies>
</dependencyManagement>

<dependencies>
    <!-- Servlet API -->
    <dependency>
        <groupId>jakarta.servlet</groupId>
        <artifactId>jakarta.servlet-api</artifactId>
        <version>6.1.0</version>
        <scope>provided</scope>
    </dependency>
    <!-- Jackson JSON 处理库 -->
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
        <version>2.19.2</version>
    </dependency>
    <!-- Spring MVC -->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-webmvc</artifactId>
    </dependency>

    <!-- ...为节约篇幅，此处省略非核心内容 -->
</dependencies>
```


### 创建数据模型

和之前一样，创建一个简单的 `User` 类作为数据模型：


```java
package com.example.spring.mvc.model;

/**
 * User 用户模型
 *
 * @version 2025/08/08
 **/
public class User {
    private long id;
    private String name;
    private String email;

    public User() {
    }

    public User(long id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    // Getters and Setters
    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
```

### 创建控制器


创建一个控制器类来处理 HTTP 请求并返回 JSON 数据：

```java
package com.example.spring.mvc.controller;

import com.example.spring.mvc.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * UserController 用户控制器
 *
 * @version 2025/08/10
 **/
@Controller
@RequestMapping("/users")
public class UserController {

    // 用户存储
    private final ConcurrentHashMap<Long, User> users = new ConcurrentHashMap<>();
    private final AtomicLong counter = new AtomicLong(1);

    public UserController() {
        // 初始化测试数据
        Long id1 = counter.getAndIncrement();
        users.put(id1, new User(id1, "John", "john@example.com"));

        Long id2 = counter.getAndIncrement();
        users.put(id2, new User(id2, "Smith", "smith@example.com"));
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(new ArrayList<>(users.values()));
    }

    @PostMapping
    @ResponseBody
    public User createUser(@RequestBody User user) {
        Long id = counter.getAndIncrement();
        user.setId(id);

        users.put(id, user);

        return user;
    }
}
```


使用ConcurrentHashMap来存储用户数据。

### Spring MVC 配置


创建 Spring MVC 的配置类，配置组件扫描、消息转换器等：

```java
package com.example.spring.mvc.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * WebConfig Web配置
 *
 * @version 2025/08/10
 **/
@Configuration
@EnableWebMvc
@ComponentScan(basePackages = "com.example.spring.mvc")
public class WebConfig implements WebMvcConfigurer {

    @Bean
    public MappingJackson2HttpMessageConverter mappingJackson2HttpMessageConverter() {
        return new MappingJackson2HttpMessageConverter();
    }
}
```


### Web应用初始化

创建一个 `WebInitializer` 类来初始化 Spring MVC 应用：


```java
package com.example.spring.mvc.config;

import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRegistration;
import org.springframework.web.WebApplicationInitializer;
import org.springframework.web.context.ContextLoaderListener;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.servlet.DispatcherServlet;

/**
 * WebInitializer Web应用初始化
 *
 * @version 2025/08/10
 **/
public class WebInitializer implements WebApplicationInitializer {
    @Override
    public void onStartup(ServletContext servletContext) throws ServletException {
        AnnotationConfigWebApplicationContext rootContext = new AnnotationConfigWebApplicationContext();
        rootContext.register(WebConfig.class);

        servletContext.addListener(new ContextLoaderListener(rootContext));

        AnnotationConfigWebApplicationContext dispatcherContext = new AnnotationConfigWebApplicationContext();
        dispatcherContext.register(WebConfig.class);

        ServletRegistration.Dynamic dispatcher = servletContext.addServlet("dispatcher", new DispatcherServlet(dispatcherContext));
        dispatcher.setLoadOnStartup(1);
        dispatcher.addMapping("/");
    }
}
```


### 测试 JSON 处理

使用 Maven 打包项目：

```bash
mvn clean package
```

生成了spring-mvc-json.war文件。

将项目部署到 Servlet 容器（如 Tomcat）中，然后使用工具（如 Postman 或 cURL）进行测试。

#### 发送 GET 请求


```bash
curl http://localhost:8080/spring-mvc-json/users
```


预期响应：


```json
[{"id":1,"name":"John Doe","email":"john@example.com"},{"id":2,"name":"Jane Smith","email":"jane@example.com"}]
```

#### 发送 POST 请求


```bash
curl -X POST -H "Content-Type: application/json" -d '{ "name":"User","email":"user@example.com"}' http://localhost:8080/spring-mvc-json/users
```


预期响应：
```json
{
  "id": 3,
  "name": "User",
  "email": "user@example.com"
}
```


这样你就可以在纯 Spring 框架中实现 Spring MVC 的 JSON 处理功能。


## 5.2 实战：内嵌Tomcat支撑轻量级Servlet容器部署

传统部署需先安装 Tomcat，再手动部署 WAR 包，操作过于繁琐。而嵌入式 Tomcat 将容器与应用代码打包在一起，方便部署、运行、测试。


### 核心优势

#### 1. 简化部署与运维
   - 零依赖外部服务器：  
     传统部署需先安装 Tomcat，再手动部署 WAR 包；而嵌入式 Tomcat 将容器与应用代码打包在一起，直接通过 `java -jar` 运行，避免环境配置差异。
   - 环境一致性：  
     开发、测试、生产环境使用相同的 Tomcat 版本和配置，减少“在我机器上能运行”的问题。
   - 自动化运维友好：  
     可与 Docker、Kubernetes 等容器化工具无缝集成，支持镜像化部署和动态扩缩容。

#### 2. 提升开发效率
   - 快速启动与热重启：  
     嵌入式 Tomcat 通常与开发工具（如 IntelliJ IDEA、Spring DevTools）深度集成，支持代码修改后秒级重启应用，显著提升调试效率。
   - 日志集成：  
     应用日志与 Tomcat 日志统一输出，便于问题排查（如通过 Logback 或 Log4j2 集中管理）。

#### 3. 适配微服务架构
   - 独立进程模型：  
     每个微服务可嵌入独立的 Tomcat 实例，避免共享容器导致的资源竞争和依赖冲突。
   - 轻量化与弹性：  
     嵌入式 Tomcat 的资源占用（内存、CPU）通常低于独立服务器，适合大规模微服务集群部署。

#### 4. 支持云原生与 Serverless
   - 无状态化设计：  
     嵌入式 Tomcat 天然适合无状态服务，可快速水平扩展以应对流量高峰。
   - 函数即服务（FaaS）适配：  
     在 AWS Lambda、Azure Functions 等场景中，嵌入式容器可缩短冷启动时间，提升响应速度。


### 项目初始化


执行以下命令进行初始化项目原型：


```
mvn archetype:generate -DgroupId=com.example.spring.mvc -DartifactId=spring-mvc-json-tomcat-embed -DarchetypeArtifactId=maven-archetype-webapp -DarchetypeVersion=1.5 -DinteractiveMode=false
```

此时会创建一个名为“spring-mvc-json-tomcat-embed”的Web应用程序。


在 `pom.xml` 中添加必要的依赖，包括 Servlet API、JSON 处理库（如 Jackson）：
```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-framework-bom</artifactId>
      <version>6.2.9</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>

    <!-- ...为节约篇幅，此处省略非核心内容 -->
  </dependencies>
</dependencyManagement>

<dependencies>
    <!-- Servlet API -->
    <dependency>
        <groupId>jakarta.servlet</groupId>
        <artifactId>jakarta.servlet-api</artifactId>
        <version>6.1.0</version>
        <scope>provided</scope>
    </dependency>
    <!-- Jackson JSON 处理库 -->
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
        <version>2.19.2</version>
    </dependency>
    <!-- Spring MVC -->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-webmvc</artifactId>
    </dependency>
    <!-- Tomcat Embed -->
    <dependency>
      <groupId>org.apache.tomcat.embed</groupId>
      <artifactId>tomcat-embed-core</artifactId>
      <version>11.0.10</version>
    </dependency>
    <dependency>
      <groupId>org.apache.tomcat.embed</groupId>
      <artifactId>tomcat-embed-jasper</artifactId>
      <version>11.0.10</version>
    </dependency>

    <!-- ...为节约篇幅，此处省略非核心内容 -->
</dependencies>
```


### 创建数据模型

和之前一样，创建一个简单的 `User` 类作为数据模型：


```java
package com.example.spring.mvc.model;

/**
 * User 用户模型
 *
 * @version 2025/08/08
 **/
public class User {
    private long id;
    private String name;
    private String email;

    public User() {
    }

    public User(long id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    // Getters and Setters
    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
```

### 创建控制器


创建一个控制器类来处理 HTTP 请求并返回 JSON 数据：

```java
package com.example.spring.mvc.controller;

import com.example.spring.mvc.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * UserController 用户控制器
 *
 * @version 2025/08/10
 **/
@Controller
@RequestMapping("/users")
public class UserController {

    // 用户存储
    private final ConcurrentHashMap<Long, User> users = new ConcurrentHashMap<>();
    private final AtomicLong counter = new AtomicLong(1);

    public UserController() {
        // 初始化测试数据
        Long id1 = counter.getAndIncrement();
        users.put(id1, new User(id1, "John", "john@example.com"));

        Long id2 = counter.getAndIncrement();
        users.put(id2, new User(id2, "Smith", "smith@example.com"));
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(new ArrayList<>(users.values()));
    }

    @PostMapping
    @ResponseBody
    public User createUser(@RequestBody User user) {
        Long id = counter.getAndIncrement();
        user.setId(id);

        users.put(id, user);

        return user;
    }
}
```


使用ConcurrentHashMap来存储用户数据。

### Spring MVC 配置


创建 Spring MVC 的配置类，配置组件扫描、消息转换器等：

```java
package com.example.spring.mvc.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * WebConfig Web配置
 *
 * @version 2025/08/10
 **/
@Configuration
@EnableWebMvc
@ComponentScan(basePackages = "com.example.spring.mvc")
public class WebConfig implements WebMvcConfigurer {

    @Bean
    public MappingJackson2HttpMessageConverter mappingJackson2HttpMessageConverter() {
        return new MappingJackson2HttpMessageConverter();
    }
}
```


### Web应用初始化

创建一个 `WebInitializer` 类来初始化 Spring MVC 应用：


```java
package com.example.spring.mvc.config;

import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRegistration;
import org.springframework.web.WebApplicationInitializer;
import org.springframework.web.context.ContextLoaderListener;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.servlet.DispatcherServlet;

/**
 * WebInitializer Web应用初始化
 *
 * @version 2025/08/10
 **/
public class WebInitializer implements WebApplicationInitializer {
    @Override
    public void onStartup(ServletContext servletContext) throws ServletException {
        AnnotationConfigWebApplicationContext rootContext = new AnnotationConfigWebApplicationContext();
        rootContext.register(WebConfig.class);

        servletContext.addListener(new ContextLoaderListener(rootContext));

        AnnotationConfigWebApplicationContext dispatcherContext = new AnnotationConfigWebApplicationContext();
        dispatcherContext.register(WebConfig.class);

        ServletRegistration.Dynamic dispatcher = servletContext.addServlet("dispatcher", new DispatcherServlet(dispatcherContext));
        dispatcher.setLoadOnStartup(1);
        dispatcher.addMapping("/");
    }
}
```

### Web应用程序入口

使用Tomcat作为内嵌Servlet容器启动：


```java
package com.example.spring.mvc;

import org.apache.catalina.LifecycleException;
import org.apache.catalina.startup.Tomcat;

import java.io.File;

/**
 * App 内嵌Tomcat应用启动类
 *
 * @version 2025/08/10
 **/
public class App {
    public static void main(String[] args) throws LifecycleException {
        // 创建Tomcat启动器
        Tomcat tomcat = new Tomcat();

        // 设置基础目录，许多其他位置（比如工作目录）的默认设置都是从基础目录派生出来的
        // 可以自定义目录，或者是使用缓存目录 System.getProperty("java.io.tmpdir")
        File baseDir = new File("/data/tomcat-embed");
        tomcat.setBaseDir(baseDir.getAbsolutePath());

        // 设置默认HTTP连接器端口号
        tomcat.setPort(8080);

        // 添加Web应用程序，这相当于将Web应用程序添加到主机的appBase（通常是Tomcat的webapps目录）。
        // contextPath - 要使用的上下文映射，""表示根上下文；
        // docBase - 上下文的基本目录，用于静态文件。必须存在且为绝对路径。
        String contextPath = "";
        String docBase = new File("src/main/webapp").getAbsolutePath();
        tomcat.addWebapp(contextPath, docBase);

        // 启动Tomcat
        tomcat.start();

        // 获取默认HTTP连接器
        tomcat.getConnector();
    }
}
```


### 测试 JSON 处理

右键运行App.java文件，可以启动应用，然后使用工具（如 Postman 或 cURL）进行测试。

#### 发送 GET 请求


```bash
curl http://localhost:8080/users
```


预期响应：


```json
[{"id":1,"name":"John Doe","email":"john@example.com"},{"id":2,"name":"Jane Smith","email":"jane@example.com"}]
```

#### 发送 POST 请求


```bash
curl -X POST -H "Content-Type: application/json" -d '{ "name":"User","email":"user@example.com"}' http://localhost:8080/users
```


预期响应：
```json
{
  "id": 3,
  "name": "User",
  "email": "user@example.com"
}
```

### 制作uber-jar进行打包、运行


这样你就可以在纯 Spring 框架中实现 Spring MVC 的 JSON 处理功能。


uber-jar 也被称为"fat jar"或者"shadow jar"，简单来说，就是一个包含了项目所有依赖的 jar 包。通常，一个 Java 项目会依赖很多外部库，这些库都是以独立的 jar 文件存在的。部署项目的时候，需要把项目本身的 jar 包和所有依赖的 jar 包一起放到服务器上。uber-jar 的出现就是为了简化这个过程，它把所有需要的库都打包到一个 jar 文件里，这样部署和分发就方便多了。

举个例子，假设你在开发一个简单的 Web 应用，它用了 Spring 框架、Hibernate ORM 和一些日志库。如果没有 uber-jar，你需要把应用的 jar 包，加上 Spring、Hibernate、日志库等等所有依赖的 jar 包一起部署到服务器。这样部署起来比较麻烦，而且容易出现版本冲突之类的问题。

但如果用了 uber-jar，所有这些依赖都会被打包到应用的 jar 包里。你只需要部署这一个文件，服务器就能跑起你的应用了，是不是方便很多？

uber-jar 的优点主要有以下几点：

* 部署简单： 只需要部署一个文件，不用管理一堆依赖。
* 避免依赖冲突： 所有的依赖都在 uber-jar 里，不会和其他应用的依赖冲突。
* 可移植性强： uber-jar 可以很方便地复制到不同的环境运行，不用担心缺依赖。

当然，uber-jar 也有缺点：

* 文件体积大： 因为它包含了所有依赖，uber-jar 的文件体积会比普通的 jar 包大很多。
* 更新麻烦： 如果要更新某个依赖，需要重新构建整个 uber-jar。

那在 Maven 里怎么创建 uber-jar 呢？可以使用maven-shade-plugin，在pom.xml中添加如下内容：


```xml
<build>
    <finalName>spring-mvc-json-tomcat-embed</finalName>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-shade-plugin</artifactId>
        <version>3.6.0</version>
        <configuration>
          <createDependencyReducedPom>true</createDependencyReducedPom>
          <filters>
            <filter>
              <artifact>*:*</artifact>
              <excludes>
                <exclude>module-info.class</exclude>
                <exclude>META-INF/*.SF</exclude>
                <exclude>META-INF/*.DSA</exclude>
                <exclude>META-INF/*.RSA</exclude>
              </excludes>
            </filter>
          </filters>
        </configuration>
        <executions>
          <execution>
            <phase>package</phase>
            <goals>
              <goal>shade</goal>
            </goals>
            <configuration>
              <transformers>
                <!-- 设置主类 -->
                <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                  <mainClass>com.example.spring.mvc.App</mainClass>
                </transformer>
              </transformers>
            </configuration>
          </execution>
        </executions>
      </plugin>
    </plugins>
</build>    
```


修改打包的格式为jar：

```xml
<!--<packaging>war</packaging>-->
<packaging>jar</packaging>
```


使用 Maven 打包项目：

```bash
mvn clean package
```

生成了spring-mvc-json-tomcat-embed.jar文件。该JAR文件可以直接通过以下方式启动：
```bash
java -jar spring-mvc-json-tomcat-embed.jar
```

### 总结

嵌入式 Tomcat 把容器和应用代码打包在一起，消除了外部服务器依赖，简化了配置流程。无论是构建微服务、快速原型开发，还是适配容器化环境，它都能降低系统复杂度。


## 6.1 课程总结

* 全栈后端之Java Web开发必备基础解析
    * 解密Servlet架构：斩获穿透HTTP协议的全栈开发者底层思维
    * Filter过滤链：构建防御攻击的安全护城河
    * Request对象深度操控：构建可扩展的RESTful参数解析体系
    * 快速掌握servlet全局中枢：ServletContext架构设计
    * 高效实现精准响应，快速掌握Response高阶技巧
    * 实战：快速构建基于Servlet的REST API服务
* 全栈后端之Java Web开发必备框架-Spring MVC基础
    * 从Servlet到Spring Web MVC，掌握企业级Web服务的线程模型与异步处理架构
    * 全栈后端的安全围栏：MVC过滤器链
    * 全栈后端的指令中心：控制器
* 全栈后端之Java Web开发必备框架-Spring MVC进阶
    * 进阶掌握MVC配置魔方：掌握多种自定义配置方式
* 全栈后端之Java Web开发必备框架-Spring MVC开发REST服务
    * 实战：掌握全栈前后端高效对话核心技能JSON处理
    * 实战：内嵌Tomcat支撑轻量级Servlet容器部署
