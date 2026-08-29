---
title: "Spring Security授权架构深度解析"
published: 2026-08-25
description: "适用于授权的Spring Security架构。"
image: ''
tags: [Java, Spring Security, 安全]
category: 指南
collections: [java-fullstack, java-fullstack-spring]
draft: false
lang: ''
slug: java-course6-4-3
pinned: false
comment: true
---

适用于授权的Spring Security架构。

### 权限（Authorities）

认证（Authentication）章节讨论了所有的`Authentication`实现是如何存储`GrantedAuthority`对象列表的。这些对象代表已授予给主体（principal）的权限。`GrantedAuthority`对象由`AuthenticationManager`插入到`Authentication`对象中，随后在做出授权决策时由`AccessDecisionManager`实例读取。

`GrantedAuthority`接口只有一个方法：
```java
String getAuthority();
```

此方法被`AuthorizationManager`实例用来获取`GrantedAuthority`的精确字符串表示。通过以字符串形式返回表示，大多数`AuthorizationManager`实现都能轻松“读取”`GrantedAuthority`。如果`GrantedAuthority`无法精确地表示为字符串，则该`GrantedAuthority`被视为“复杂的”，且`getAuthority()`必须返回`null`。

复杂`GrantedAuthority`的一个示例是存储适用于不同客户账号的操作列表和权限阈值的实现。将这种复杂的`GrantedAuthority`表示为字符串会相当困难。因此，`getAuthority()`方法应返回`null`。这向任何`AuthorizationManager`表明，它需要支持特定的`GrantedAuthority`实现才能理解其内容。

Spring Security包含一个具体的`GrantedAuthority`实现：`SimpleGrantedAuthority`。此实现允许将任何用户指定的字符串转换为`GrantedAuthority`。安全架构中包含的所有`AuthenticationProvider`实例都使用`SimpleGrantedAuthority`来填充`Authentication`对象。

默认情况下，基于角色的授权规则包含`ROLE_`作为前缀。这意味着，如果有一个授权规则要求安全上下文具有“USER”角色，Spring Security默认会查找`GrantedAuthority#getAuthority`返回“ROLE_USER”的权限。

你可以使用`GrantedAuthorityDefaults`自定义此前缀。`GrantedAuthorityDefaults`的存在是为了允许自定义用于基于角色的授权规则的前缀。

你可以通过暴露一个`GrantedAuthorityDefaults` bean来配置授权规则使用不同的前缀，如下所示：

#### 自定义MethodSecurityExpressionHandler


```java
@Bean
static GrantedAuthorityDefaults grantedAuthorityDefaults() {
    return new GrantedAuthorityDefaults("MYPREFIX_");
}
```


你需要使用静态方法暴露`GrantedAuthorityDefaults`，以确保Spring在初始化Spring Security的方法安全`@Configuration`类之前发布它。

### 调用处理（Invocation Handling）
Spring Security提供了拦截器，用于控制对安全对象（如方法调用或Web请求）的访问。`AuthorizationManager`实例会做出调用是否被允许继续的调用前决策，以及关于是否可以返回给定值的调用后决策。

### 授权管理器（AuthorizationManager）

`AuthorizationManager`取代了`AccessDecisionManager`和`AccessDecisionVoter`。

建议自定义`AccessDecisionManager`或`AccessDecisionVoter`的应用程序改为使用`AuthorizationManager`。

`AuthorizationManager`由Spring Security的基于请求、基于方法和基于消息的授权组件调用，负责做出最终的访问控制决策。`AuthorizationManager`接口包含两个方法：

```java
AuthorizationDecision check(Supplier<Authentication> authentication, Object secureObject);

default void verify(Supplier<Authentication> authentication, Object secureObject)
        throws AccessDeniedException {
    // ...
}
```

`AuthorizationManager`的`check`方法会接收做出授权决策所需的所有相关信息。特别是，传递安全对象（secure Object）使得可以检查包含在实际安全对象调用中的那些参数。例如，假设安全对象是`MethodInvocation`。查询`MethodInvocation`以获取任何`Customer`参数会很容易，然后在`AuthorizationManager`中实现某种安全逻辑以确保主体被允许对该客户进行操作。如果允许访问，实现应返回肯定的`AuthorizationDecision`；如果拒绝访问，返回否定的`AuthorizationDecision`；如果放弃做出决策，则返回`null`的`AuthorizationDecision`。

`verify`方法调用`check`，并在出现否定的`AuthorizationDecision`时抛出`AccessDeniedException`。

### 基于委托的AuthorizationManager实现
尽管用户可以实现自己的`AuthorizationManager`来控制授权的所有方面，但Spring Security附带了一个委托`AuthorizationManager`，它可以与各个`AuthorizationManager`协作。

`RequestMatcherDelegatingAuthorizationManager`会将请求与最合适的委托`AuthorizationManager`进行匹配。对于方法安全，你可以使用`AuthorizationManagerBeforeMethodInterceptor`和`AuthorizationManagerAfterMethodInterceptor`。

以下展示了AuthorizationManager的相关实现类：

```
AuthorizationManager
├── RequestMatcherDelegatingAuthorizationManager
├── PreAuthorizeAuthorizationManager
├── Authority AuthorizationManager
├── PostAuthorizeAuthorizationManager
├── AuthenticatedAuthorizationManager
├── SecuredAuthorizationManager
└── Jsr250AuthorizationManager
```


使用这种方法，可以轮询`AuthorizationManager`实现的组合以做出授权决策。

#### AuthorityAuthorizationManager
Spring Security提供的最常见的`AuthorizationManager`是`AuthorityAuthorizationManager`。它配置有一组要在当前`Authentication`上查找的权限。如果`Authentication`包含任何已配置的权限，它将返回肯定的`AuthorizationDecision`。否则，它将返回否定的`AuthorizationDecision`。

#### AuthenticatedAuthorizationManager
另一个管理器是`AuthenticatedAuthorizationManager`。它可用于区分匿名用户、完全认证用户和通过“记住我”功能认证的用户。许多网站允许在“记住我”认证下进行某些有限的访问，但要求用户通过登录来确认其身份以获得完全访问权限。

#### AuthorizationManagers
`AuthorizationManagers`中还有有用的静态工厂，用于将各个`AuthorizationManager`组合成更复杂的表达式。

#### 自定义授权管理器
显然，你也可以实现自定义的`AuthorizationManager`，并且可以在其中放入几乎任何你想要的访问控制逻辑。它可能特定于你的应用程序（与业务逻辑相关），或者可能实现某些安全管理逻辑。例如，你可以创建一个可以查询Open Policy Agent或你自己的授权数据库的实现。


### 适配AccessDecisionManager和AccessDecisionVoters
在`AuthorizationManager`之前，Spring Security提供了`AccessDecisionManager`和`AccessDecisionVoter`。

在某些情况下，例如迁移较旧的应用程序时，可能希望引入一个调用`AccessDecisionManager`或`AccessDecisionVoter`的`AuthorizationManager`。

要调用现有的`AccessDecisionManager`，你可以这样做：


```java
@Component
public class AccessDecisionManagerAuthorizationManagerAdapter implements AuthorizationManager {
    private final AccessDecisionManager accessDecisionManager;
    private final SecurityMetadataSource securityMetadataSource;

    @Override
    public AuthorizationDecision check(Supplier<Authentication> authentication, Object object) {
        try {
            Collection<ConfigAttribute> attributes = this.securityMetadataSource.getAttributes(object);
            this.accessDecisionManager.decide(authentication.get(), object, attributes);
            return new AuthorizationDecision(true);
        } catch (AccessDeniedException ex) {
            return new AuthorizationDecision(false);
        }
    }

    @Override
    public void verify(Supplier<Authentication> authentication, Object object) {
        Collection<ConfigAttribute> attributes = this.securityMetadataSource.getAttributes(object);
        this.accessDecisionManager.decide(authentication.get(), object, attributes);
    }
}
```

然后将其连接到你的`SecurityFilterChain`中。

或者，要仅调用`AccessDecisionVoter`，你可以这样做：


```java
@Component
public class AccessDecisionVoterAuthorizationManagerAdapter implements AuthorizationManager {
    private final AccessDecisionVoter accessDecisionVoter;
    private final SecurityMetadataSource securityMetadataSource;

    @Override
    public AuthorizationDecision check(Supplier<Authentication> authentication, Object object) {
        Collection<ConfigAttribute> attributes = this.securityMetadataSource.getAttributes(object);
        int decision = this.accessDecisionVoter.vote(authentication.get(), object, attributes);
        switch (decision) {
        case ACCESS_GRANTED:
            return new AuthorizationDecision(true);
        case ACCESS_DENIED:
            return new AuthorizationDecision(false);
        }
        return null;
    }
}
```

然后将其连接到你的`SecurityFilterChain`中。

### 角色层次结构（Hierarchical Roles）
应用程序中的特定角色应自动“包含”其他角色是一个常见需求。例如，在一个具有“admin”（管理员）和“user”（用户）角色概念的应用程序中，你可能希望管理员能够执行普通用户可以执行的所有操作。要实现这一点，你可以确保所有管理员用户也被分配“user”角色。或者，你可以修改每个需要“user”角色的访问约束，使其也包含“admin”角色。如果你的应用程序中有很多不同的角色，这可能会变得相当复杂。

使用角色层次结构允许你配置哪些角色（或权限）应包含其他角色。这在基于过滤器的授权中通过`HttpSecurity#authorizeHttpRequests`支持，在基于方法的授权中通过用于pre-post注解的`DefaultMethodSecurityExpressionHandler`、用于`@Secured`的`SecuredAuthorizationManager`以及用于JSR-250注解的`Jsr250AuthorizationManager`支持。你可以通过以下方式一次性配置所有这些的行为：

#### 角色层次结构配置

```java
@Bean
static RoleHierarchy roleHierarchy() {
    return RoleHierarchyImpl.withDefaultRolePrefix()
        .role("ADMIN").implies("STAFF")
        .role("STAFF").implies("USER")
        .role("USER").implies("GUEST")
        .build();
}

// 并且，如果使用pre-post方法安全，还需添加

@Bean
static MethodSecurityExpressionHandler methodSecurityExpressionHandler(RoleHierarchy roleHierarchy) {
    DefaultMethodSecurityExpressionHandler expressionHandler = new DefaultMethodSecurityExpressionHandler();
    expressionHandler.setRoleHierarchy(roleHierarchy);
    return expressionHandler;
}
```


这里我们有四个角色处于`ROLE_ADMIN ⇒ ROLE_STAFF ⇒ ROLE_USER ⇒ ROLE_GUEST`的层次结构中。当针对任何基于过滤器或方法的规则评估安全约束时，使用`ROLE_ADMIN`认证的用户将表现得好像他们拥有所有四个角色一样。`⇒`符号可以被理解为“包含”的意思。

角色层次结构提供了一种方便的方式来简化应用程序的访问控制配置数据和/或减少需要分配给用户的权限数量。对于更复杂的需求，你可能希望在应用程序所需的特定访问权限与分配给用户的角色之间定义逻辑映射，并在加载用户信息时在两者之间进行转换。
