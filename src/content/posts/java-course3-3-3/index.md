---
title: "全栈后端的指令中心：控制器"
published: 2026-08-25
description: "@Controller 和 @RestController 是 Spring MVC 中实现控制器的常用注解。这些注解可以用来表示请求映射、请求输入、异常处理等。使用带注解的的控制器具有灵活的方法签名…"
image: ''
tags: [Java, Spring MVC, Web]
category: 指南
collections: [java-fullstack, java-fullstack-spring]
draft: false
lang: ''
slug: java-course3-3-3
pinned: false
comment: true
---

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
