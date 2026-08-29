---
title: "Filter过滤链：构建防御攻击的安全护城河"
published: 2026-08-25
description: "在Web应用程序中，Filter过滤链能够像安全卫士一样，在请求到达Servlet之前和响应返回客户端之前进行拦截和处理，从而构建起一道防御攻击的安全护城河。以下将从Filter的基本概念出发，详细介…"
image: ''
tags: [Java, Spring MVC, Web]
category: 指南
collections: [java-fullstack, java-fullstack-spring]
draft: false
lang: ''
slug: java-course3-2-2
pinned: false
comment: true
---

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
