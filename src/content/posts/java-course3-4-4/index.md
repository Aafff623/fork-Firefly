---
title: "进阶掌握MVC配置魔方：掌握多种自定义配置方式"
published: 2026-08-25
description: "Spring MVC 提供了基于 Java 和 XML 的配置，其默认的配置值可以满足大多数的应用场景。当然，Spring MVC 也提供了 API 以方便开发人员来自定义配置。"
image: ''
tags: [Java, Spring MVC, Web]
category: 指南
collections: [java-fullstack, java-fullstack-spring]
draft: false
lang: ''
slug: java-course3-4-4
pinned: false
comment: true
---

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
