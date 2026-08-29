---
title: "深入理解Spring Security的配置"
published: 2026-08-25
description: "通过一些示例应用程序来演示Spring Security配置的使用，以便更好的理解配置的使用原理。"
image: ''
tags: [Java, Spring Security, 安全]
category: 指南
collections: [java-fullstack, java-fullstack-spring]
draft: false
lang: ''
slug: java-course6-4-4
pinned: false
comment: true
---

通过一些示例应用程序来演示Spring Security配置的使用，以便更好的理解配置的使用原理。

### 入门级Web安全配置

第一步是创建我们的Spring Security配置。该配置会创建一个名为`springSecurityFilterChain`的Servlet过滤器，它负责应用程序内的所有安全工作（保护应用程序URL、验证提交的用户名和密码、重定向到登录表单等）。以下示例展示了Spring Security配置的最基本示例：

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.authentication.builders.*;
import org.springframework.security.config.annotation.web.configuration.*;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    @Bean
    public UserDetailsService userDetailsService() {
        InMemoryUserDetailsManager manager = new InMemoryUserDetailsManager();
        manager.createUser(User.withDefaultPasswordEncoder().username("user").password("password").roles("USER").build());
        return manager;
    }
}
```

这个配置并不复杂或详尽，但它能完成很多工作：
- 要求对应用程序中的每个URL进行身份验证
- 为你生成登录表单
- 允许用户名为`user`、密码为`password`的用户通过基于表单的身份验证进行认证
- 允许用户注销
- 防止CSRF攻击
- 防止会话固定攻击
- 安全头集成：
    - 用于安全请求的HTTP严格传输安全
    - X-Content-Type-Options集成
    - 缓存控制（稍后可在应用程序中覆盖以允许缓存静态资源）
    - X-XSS-Protection集成
    - X-Frame-Options集成以帮助防止点击劫持
- 与以下Servlet API方法集成：
    - `HttpServletRequest#getRemoteUser()`
    - `HttpServletRequest#getUserPrincipal()`
    - `HttpServletRequest#isUserInRole(java.lang.String)`
    - `HttpServletRequest#login(java.lang.String, java.lang.String)`
    - `HttpServletRequest#logout()`


### AbstractSecurityWebApplicationInitializer

下一步是将`springSecurityFilterChain`注册到WAR文件中。在Servlet 3.0+环境中，可以借助Spring的`WebApplicationInitializer`支持通过Java配置来完成。毫不奇怪，Spring Security提供了一个基类（`AbstractSecurityWebApplicationInitializer`），以确保`springSecurityFilterChain`被自动注册。我们使用`AbstractSecurityWebApplicationInitializer`的方式取决于我们是否已经在使用Spring，或者Spring Security是否是应用程序中唯一的Spring组件。


#### 结合Spring MVC使用AbstractSecurityWebApplicationInitializer

如果我们在应用程序的其他地方使用Spring，可能已经有一个`WebApplicationInitializer`在加载我们的Spring配置。如果使用前面的配置，会出现错误。相反，我们应该将Spring Security注册到现有的`ApplicationContext`中。例如，如果我们使用Spring MVC，我们的`SecurityWebApplicationInitializer`可能如下所示：

```java
import org.springframework.security.web.context.*;
public class SecurityWebApplicationInitializer
        extends AbstractSecurityWebApplicationInitializer {

}
```

这只会为应用程序中的每个URL注册`springSecurityFilterChain`。之后，我们需要确保`WebSecurityConfig`在我们现有的`ApplicationInitializer`中被加载。例如，如果我们使用Spring MVC，它会被添加到`getServletConfigClasses()`中：

```java
public class MvcWebApplicationInitializer extends
        AbstractAnnotationConfigDispatcherServletInitializer {

    @Override
    protected Class<?>[] getServletConfigClasses() {
        return new Class[] { WebSecurityConfig.class, WebMvcConfig.class };
    }

    // ... 其他重写方法 ...

}
```

原因是Spring Security需要能够检查一些Spring MVC配置，以便适当地配置底层请求匹配器，因此它们需要位于同一个应用程序上下文中。将Spring Security放在`getRootConfigClasses`中会将其放入父应用程序上下文，而父应用程序上下文可能无法找到Spring MVC的`HandlerMappingIntrospector`。


#### 为多个Spring MVC调度器配置

如果需要，可以将任何与Spring MVC无关的Spring Security配置放在不同的配置类中，如下所示：

```java
public class MvcWebApplicationInitializer extends
        AbstractAnnotationConfigDispatcherServletInitializer {

    @Override
    protected Class<?>[] getRootConfigClasses() {
        return new Class[] { NonWebSecurityConfig.class };
    }

    @Override
    protected Class<?>[] getServletConfigClasses() {
        return new Class[] { WebSecurityConfig.class, WebMvcConfig.class };
    }

    // ... 其他重写方法 ...

}
```

如果你有多个`AbstractAnnotationConfigDispatcherServletInitializer`实例，并且不想在两个实例中重复通用的安全配置，这会很有帮助。


### HttpSecurity

到目前为止，我们的`WebSecurityConfig`只包含关于如何认证用户的信息。Spring Security如何知道我们要求所有用户都进行认证？Spring Security如何知道我们想要支持基于表单的认证？实际上，有一个名为`SecurityFilterChain`的配置类在幕后被调用。它使用以下默认实现进行配置：

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(authorize -> authorize
            .anyRequest().authenticated()
        )
        .formLogin(Customizer.withDefaults())
        .httpBasic(Customizer.withDefaults());
    return http.build();
}
```

默认配置（如前面的示例所示）：
- 确保对我们应用程序的任何请求都要求用户进行认证
- 允许用户通过基于表单的登录进行认证
- 允许用户通过HTTP基本认证进行认证


### 多个HttpSecurity实例

为了有效地管理应用程序中的安全性（其中某些区域需要不同的保护），我们可以采用多个过滤器链以及`securityMatcher` DSL方法。这种方法允许我们为应用程序的特定部分定义不同的安全配置，增强整体应用程序的安全性和控制性。

我们可以配置多个`HttpSecurity`实例，就像在XML中可以有多个`<http>`块一样。关键是注册多个`SecurityFilterChain` `@Bean`。以下示例对以`/api/`开头的URL有不同的配置：

```java
@Configuration
@EnableWebSecurity
public class MultiHttpSecurityConfig {
    @Bean                                                              // (1)
    public UserDetailsService userDetailsService() throws Exception {
        UserBuilder users = User.withDefaultPasswordEncoder();
        InMemoryUserDetailsManager manager = new InMemoryUserDetailsManager();
        manager.createUser(users.username("user").password("password").roles("USER").build());
        manager.createUser(users.username("admin").password("password").roles("USER","ADMIN").build());
        return manager;
    }

    @Bean
    @Order(1)                                                         // (2)
    public SecurityFilterChain apiFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher("/api/**")                               // (3)
            .authorizeHttpRequests(authorize -> authorize
                .anyRequest().hasRole("ADMIN")
            )
            .httpBasic(Customizer.withDefaults());
        return http.build();
    }

    @Bean                                                             // (4)
    public SecurityFilterChain formLoginFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authorize -> authorize
                .anyRequest().authenticated()
            )
            .formLogin(Customizer.withDefaults());
        return http.build();
    }
}
```


* (1)像往常一样配置认证。
* (2)创建一个`SecurityFilterChain`实例，其中包含`@Order`以指定应首先考虑哪个`SecurityFilterChain`。 
* (3) `http.securityMatcher()`表示此`HttpSecurity`仅适用于以`/api/`开头的URL。
* (4)创建另一个`SecurityFilterChain`实例。如果URL不是以`/api/`开头，则使用此配置。由于此配置的`@Order`值在1之后（没有`@Order`默认为最后），因此它会在`apiFilterChain`之后被考虑。 


### 选择`securityMatcher`还是`requestMatchers`

一个常见的问题是：`http.securityMatcher()`方法与用于请求授权的`requestMatchers()`（即在`http.authorizeHttpRequests()`内部）有什么区别？

要回答这个问题，有助于理解的是，每个用于构建`SecurityFilterChain`的`HttpSecurity`实例都包含一个`RequestMatcher`来匹配传入的请求。如果一个请求与具有更高优先级的`SecurityFilterChain`（例如`@Order(1)`）不匹配，则可以尝试与具有更低优先级的过滤器链（例如没有`@Order`）进行匹配。

多个过滤器链的匹配逻辑由`FilterChainProxy`执行。

默认的`RequestMatcher`匹配任何请求，以确保Spring Security默认保护所有请求。

指定`securityMatcher`会覆盖此默认值。

如果没有过滤器链匹配特定请求，则该请求不受Spring Security保护。

以下示例演示了一个仅保护以`/secured/`开头的请求的单个过滤器链：

```java
@Configuration
@EnableWebSecurity
public class PartialSecurityConfig {

    @Bean
    public UserDetailsService userDetailsService() throws Exception {
        // ...
    }

    @Bean
    public SecurityFilterChain securedFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher("/secured/**")                           // (1)
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/secured/user").hasRole("USER")     // (2)
                .requestMatchers("/secured/admin").hasRole("ADMIN")   // (3)
                .anyRequest().authenticated()                         // (4)
            )
            .httpBasic(Customizer.withDefaults())
            .formLogin(Customizer.withDefaults());
        return http.build();
    }
}
```


* (1)以`/secured/`开头的请求将受到保护，但任何其他请求都不受保护。
* (2)对`/secured/user`的请求需要`ROLE_USER`权限。
* (3)对`/secured/admin`的请求需要`ROLE_ADMIN`权限。
* (4)任何其他请求（例如`/secured/other`）只需要一个已认证的用户。


建议提供一个不指定任何`securityMatcher`的`SecurityFilterChain`，以确保整个应用程序都受到保护，如前面的示例所示。

请注意，`requestMatchers`方法仅适用于单个授权规则。其中列出的每个请求还必须与用于创建`SecurityFilterChain`的这个特定`HttpSecurity`实例的整体`securityMatcher`匹配。在此示例中使用`anyRequest()`匹配此特定`SecurityFilterChain`中的所有其他请求（必须以`/secured/`开头）。

有关`requestMatchers`的更多信息，请参见[Authorize HttpServletRequests](https://docs.spring.io/spring-security/reference/servlet/authorization/authorize-http-requests.html)。


### `SecurityFilterChain`端点

`SecurityFilterChain`中的几个过滤器直接提供端点，例如由`http.formLogin()`设置的`UsernamePasswordAuthenticationFilter`提供`POST /login`端点。在上面的示例中，`/login`端点与`http.securityMatcher("/secured/**")`不匹配，因此该应用程序不会有任何`GET /login`或`POST /login`端点。此类请求将返回`404 Not Found`。这通常会让用户感到惊讶。

指定`http.securityMatcher()`会影响该`SecurityFilterChain`匹配的请求。但是，它不会自动影响过滤器链提供的端点。在这种情况下，你可能需要自定义你希望过滤器链提供的任何端点的URL。

以下示例演示了一个配置，该配置保护以`/secured/`开头的请求并拒绝所有其他请求，同时还自定义`SecurityFilterChain`提供的端点：

```java
@Configuration
@EnableWebSecurity
public class SecuredSecurityConfig {

    @Bean
    public UserDetailsService userDetailsService() throws Exception {
        // ...
    }

    @Bean
    @Order(1)
    public SecurityFilterChain securedFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher("/secured/**")                           // (1)
            .authorizeHttpRequests(authorize -> authorize
                .anyRequest().authenticated()                         // (2)
            )
            .formLogin(formLogin -> formLogin                         // (3)
                .loginPage("/secured/login")
                .loginProcessingUrl("/secured/login")
                .permitAll()
            )
            .logout(logout -> logout                                  // (4)
                .logoutUrl("/secured/logout")
                .logoutSuccessUrl("/secured/login?logout")
                .permitAll()
            )
            .formLogin(Customizer.withDefaults());
        return http.build();
    }

    @Bean
    public SecurityFilterChain defaultFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authorize -> authorize
                .anyRequest().denyAll()                               // (5)
            );
        return http.build();
    }
}
```


* (1)以`/secured/`开头的请求将受到此过滤器链的保护。 
* (2)以`/secured/`开头的请求需要一个已认证的用户。 
* (3)自定义表单登录，为URL添加`/secured/`前缀。 
* (4)自定义注销，为URL添加`/secured/`前缀。 
* (5)所有其他请求都将被拒绝。 


此示例自定义了登录和注销页面，这会禁用Spring Security生成的页面。你必须为`GET /secured/login`和`GET /secured/logout`提供自己的自定义端点。请注意，Spring Security仍然为你提供`POST /secured/login`和`POST /secured/logout`端点。


### 实际示例

以下示例演示了一个更贴近实际的配置，将所有这些元素组合在一起：

```java
@Configuration
@EnableWebSecurity
public class BankingSecurityConfig {

    @Bean                                                               // (1)
    public UserDetailsService userDetailsService() {
        UserBuilder users = User.withDefaultPasswordEncoder();
        InMemoryUserDetailsManager manager = new InMemoryUserDetailsManager();
        manager.createUser(users.username("user1").password("password").roles("USER", "VIEW_BALANCE").build());
        manager.createUser(users.username("user2").password("password").roles("USER").build());
        manager.createUser(users.username("admin").password("password").roles("ADMIN").build());
        return manager;
    }

    @Bean
    @Order(1)                                                          // (2)
    public SecurityFilterChain approvalsSecurityFilterChain(HttpSecurity http) throws Exception {
        String[] approvalsPaths = { "/accounts/approvals/**", "/loans/approvals/**", "/credit-cards/approvals/**" };
        http
            .securityMatcher(approvalsPaths)
            .authorizeHttpRequests(authorize -> authorize
                .anyRequest().hasRole("ADMIN")
            )
            .httpBasic(Customizer.withDefaults());
        return http.build();
    }

    @Bean
    @Order(2)                                                          // (3)
    public SecurityFilterChain bankingSecurityFilterChain(HttpSecurity http) throws Exception {
        String[] bankingPaths = { "/accounts/**", "/loans/**", "/credit-cards/**", "/balances/**" };
        String[] viewBalancePaths = { "/balances/**" };
        http
            .securityMatcher(bankingPaths)
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers(viewBalancePaths).hasRole("VIEW_BALANCE")
                .anyRequest().hasRole("USER")
            );
        return http.build();
    }

    @Bean                                                              // (4)
    public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
        String[] allowedPaths = { "/", "/user-login", "/user-logout", "/notices", "/contact", "/register" };
        http
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers(allowedPaths).permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(formLogin -> formLogin
                .loginPage("/user-login")
                .loginProcessingUrl("/user-login")
            )
            .logout(logout -> logout
                .logoutUrl("/user-logout")
                .logoutSuccessUrl("/?logout")
            );
        return http.build();
    }
}
```


* (1)首先配置认证设置。 
* (2)定义一个带有`@Order(1)`的`SecurityFilterChain`实例，这意味着该过滤器链将具有最高优先级。此过滤器链仅适用于以`/accounts/approvals/`、`/loans/approvals/`或`/credit-cards/approvals/`开头的请求。对此过滤器链的请求需要`ROLE_ADMIN`权限，并允许HTTP基本认证。
