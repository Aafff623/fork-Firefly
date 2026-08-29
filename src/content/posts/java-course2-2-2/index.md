---
title: "IoC和DI解耦艺术重塑Java工程实践"
published: 2026-08-25
description: "IoC 容器是 Spring 框架中非常重要核心组件，可以说，是伴随着 Spring 的诞生和成长的。Spring 通过 IoC 容器来管理所有 Java 对象（也被称为 bean）及其相互间的依赖关…"
image: ''
tags: [Java, Spring, IoC, AOP]
category: 指南
collections: [java-fullstack, java-fullstack-spring]
draft: false
lang: ''
slug: java-course2-2-2
pinned: false
comment: true
---

IoC 容器是 Spring 框架中非常重要核心组件，可以说，是伴随着 Spring 的诞生和成长的。Spring 通过 IoC 容器来管理所有 Java 对象（也被称为 bean）及其相互间的依赖关系。


### 2.2.1 依赖注入 VS. 控制反转

很多人都会被问及“依赖注入”与“控制反转”之间到底有哪些联系和区别。在 Java 应用程序中，不管是受限的嵌入式应用程序，还是多层架构的服务端企业级应用程序，它们通常由来自应
用适当的对象进行组合合作。也就是说，对象在应用程序中通过彼此依赖来实现功能。

尽管 Java 平台提供了丰富的应用程序开发功能，但它缺乏组织基本构建块成为一个完整系统的方法。那么，组织系统这个任务最后只能留给架构师和开发人员。开发者可以使用各种设计模式（如 Factory、Abstract Factory、Builder、Decorator 和 Service Locator）来组合各种类和对象实例构成应用程序。虽然这些模式给出了什么样的模式，能解决什么问题，但使用模式一个最大的障碍就是，除非开发者也有非常丰富的经验，否则仍然无法在应用程序中正确地使用它，这就给 Java 开发者带来了一定的技术门槛，特别是那些普通的开发人员。

而 Spring 框架的 IoC（Inversion of Control ，控制反转）组件就能够通过提供正规化的方法来组合不同的组件，使之成为一个完整的可用的应用。Spring 框架将规范化的设计模式作为一级的对象，这样方便开发者将之集成到自己的应用程序，这也是很多组织和机构选择使用 Spring 框架来开发健壮的、可维护的应用程序的原因。开发人员无须手动处理对象的依赖关系，而是交给了Spring 容器去管理，这极大地提升了开发体验。

那么“依赖注入”与“控制反转”又是什么关系呢？

“依赖注入”（Dependency Injection） 是 Martin Fowler 在 2004 年提出的关于“控制反转”的解释。Martin Fowler 认为“控制反转”一词让人产生疑惑，无法直白地理解“到底哪方面的控制被反转了”。所以，Martin Fowler 建议采用 “依赖注入”一词来代替“控制反转”。

“依赖注入”和“控制反转”其实就是一个事物的两种不同的说法而已，本质上是一回事。“依赖注入”是一个程序设计模式和架构模型，有些时候也称为“控制反转”，尽管在技术上来讲，“依
赖注入”是一个“控制反转”的特殊实现。“依赖注入”是指一个对象应用另外一个对象来提供一个特殊的能力。例如，把一个数据库连接以参数的形式传到一个对象的结构方法里，而不是在那个对象内部自行创建一个连接。“依赖注入”和“控制反转”的基本思想就是把类的依赖从类内部转化到外部以减少依赖。利用“控制反转”，对象在被创建的时候，会由一个调控系统统一进行对象实例的管理，将该对象所依赖的对象的引用通过调控系统传递给它。也可以说，依赖被注入到对象中。所以，“控制反转”是关于一个对象如何获取它所依赖的对象的引用的过程，而这个过程体现为“谁来传递依赖的引用”的这个职责的反转。

控制反转一般分为两种实现类型，依赖注入（Dependency Injection，简称DI）和依赖查找（Dependency Lookup）。其中依赖注入应用比较广泛。Spring 是采用依赖注入这种方式来实现控制反转。

### 2.2.2 IoC 容器和 bean

Spring 通过 IoC 容器来管理所有 Java 对象及其相互间的依赖关系。在软件开发过程中，系统的各个对象之间，各个模块之间，软件系统与硬件系统之间或多或少都会存在耦合关系，如果一个系统的耦合度过高，就会造成难以维护的问题。但是完全没有耦合的代码是不能工作的，代码需要相互协作、相互依赖来完成功能。而 IoC 的技术恰好就解决了这类问题，各个对象之间不需要直接关联，而是在需要用到对方的时候由 IoC 容器来管理对象之间的依赖关系，对于开发人员来说只需要维护相对独立的各个对象代码即可。

IoC 是一个过程，即对象定义其依赖关系，而其他与之配合的对象只能通过构造函数参数、工厂方法的参数，或者在从工厂方法构造或返回后在对象实例上设置的属性来定义其依赖关系。然后，IoC 容器在创建 bean 时会注入这些依赖项。这个过程在职责上是反转的，就是把原先代码里需要实现的对象创建、依赖的代码，反转给容器来帮忙实现和管理，所以称为“控制反转”。

IoC 的应用了以下设计模式。

* 反射：在运行状态中，根据提供的类的路径或者类名，通过反射来动态地获取该类的所有属性和方法。
* 工厂模式：把 IoC 容器当作一个工厂，在配置文件或者注解中给出定义，然后利用反射技术，根据给出的类名生成相应的对象。对象生成的代码及对象之间的依赖关系在配置文件中定义，这样就实现了解耦。

`org.springframework.beans` 和 `org.springframework.context` 包是 Spring IoC 容器的基础。BeanFactory 接口提供了能够管理任何类型的对象的高级配置机制。ApplicationContext 是 BeanFactory 的子接口，它更容易与 Spring 的 AOP 功能集成，进行消息资源处理（用于国际化）、事件发布，以及作为应用层特定的上下文（例如，用于 Web 应用程序的 WebApplicationContext）。简而言之，BeanFactory 提供了基本的配置功能，而 ApplicationContext 在此基础之前增加了更多的企业特定功能。

在 Spring 应用中， bean 是由 Spring IoC 容器来进行实例化、组装并受其管理的对象。bean 和它们之间的依赖关系反映在容器使用的配置元数据中。

### 2.2.3 配置元数据

配置元数据（Configuration Metadata）描述了 Spring 容器在应用程序中是如何来实例化、配置和组装对象的。

最初，Spring 是用 XML 文件格式来记录配置元数据，从而很好地实现了 IoC 容器本身与实际写入此配置元数据的格式完全分离。

当然，基于 XML 的元数据不是唯一允许的配置元数据形式。目前，比较流行的配置元数据的方式是采用注解或者是基于 Java 的配置。

* 基于注解的配置：Spring 2.5 引入了支持基于注解的配置元数据。
* 基于 Java 的配置：从 Spring 3.0 开始，Spring JavaConfig 项目提供了许多功能，并成为 Spring 框架核心的一部分。因此，可以使用 Java 而不是 XML 文件来定义应用程序类外部的 bean。这类注解，比较常用的有 `@Configuration`、`@Bean`、`@Import`和`@DependsOn` 等。

Spring 配置至少需要一个或者多个由容器管理的 bean。基于 XML 的配置元数据，需要用 `<beans/>` 元素内的 `<bean/>` 元素来配置这些 bean；而在基于 Java 的配置方式中，通常在使用了 `@Configuration` 注解的类中使用 `@Bean` 注解的方法。

以下示例显示了基于 XML 的配置元数据的基本结构。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="..." class="...">
        <!-- 放置这个bean的协作者和配置 -->
    </bean>

    <bean id="..." class="...">
        <!-- 放置这个bean的协作者和配置 -->
    </bean>

    <!-- 省略了更多的bean的配置-->
</beans>
```

在上面的 XML 文件中，id 属性是用于标识单个 bean 定义的字符串。class 属性定义 bean 的类型，并使用完全限定的类名。id 属性的值是指协作对象。

以下示例显示了基于注解的配置元数据的基本结构。


```java
@Configuration
public class AppConfig {

    @Bean
    public MyService myService() {
        return new MyServiceImpl();
    }
}
```

### 2.2.4 实例化容器

Spring IoC 容器需要在应用启动时进行实例化。在实例化过程中，IoC 容器会从各种外部资源（如本地文件系统、Java 类路径等）加载配置元数据，提供给 ApplicationContext 构造函数。

下面是一个从类路径中加载基于 XML 的配置元数据的例子。

```java
ApplicationContext context =
    new ClassPathXmlApplicationContext(new String[] {"services.xml", "daos.xml"});
```

当系统规模比较大时，通常会让 bean 定义分到多个 XML 文件。这样，每个单独的 XML 配置文件通常就能够表示系统结构中的逻辑层或模块。就如上面的例子所演示的那样。
当某个构造函数需要多个资源位置时，可以使用一个或多个 `<import/>` 来从另一个文件加载 bean 的定义。例如，

```xml
<beans>
    <import resource="services.xml"/>
    <import resource="resources/messageSource.xml"/>
    <import resource="/resources/themeSource.xml"/>

    <bean id="bean1" class="..."/>
    <bean id="bean2" class="..."/>
</beans>
```

### 2.2.5 使用容器

ApplicationContext 是高级工厂的接口，能够维护不同 bean 及其依赖项的注册表。其提供的方法 `T getBean(String name, Class<T> requiredType)`，可以用于检索 bean 的实例。

ApplicationContext 读取 bean 定义并按如下方式访问它们：

```java
// 创建并配置 bean
ApplicationContext context =
    new ClassPathXmlApplicationContext("services.xml", "daos.xml");

// 检索配置了的 bean 实例
PetStoreService service = context.getBean("petStore", PetStoreService.class);

// 使用 bean 实例
List<String> userList = service.getUsernameList();
```

如果配置方式不是 XML 而是 Groovy 的话，则可以将  ClassPathXmlApplicationContext 改为 GenericGroovyApplicationContext 即可。GenericGroovyApplicationContext 是另外一个 Spring 框架上下文的实现：

```java
ApplicationContext context =
    new GenericGroovyApplicationContext("services.groovy", "daos.groovy");
```

以上是使用 ApplicationContext 的 getBean 来检索 bean 的实例的方式。ApplicationContext 接口还有其他一些检索 bean 的方法，但理想情况下应用程序代码不应该使用它们。 因为程序代码根本不需要调用 getBean 方法的话，就可以完全不依赖于 Spring API。例如，Spring 与 Web 框架的集成为各种 Web 框架组件（如控制器和 JSF 托管的 bean）提供了依赖注入，允许您通过元数据（例如自动装配注入）声明对特定 bean 的依赖关系。


### 2.2.6 bean 的命名

每个 bean 都有一个或多个标识符。这些标识符在托管 bean 的容器中必须是唯一的。一个 bean 通常只有一个标识符，但是如果它需要多个标识符，额外的可以被认为是别名。

在基于 XML 的配置元数据中，使用 id 或者 name 属性来指定 bean 标识符。id 属性允许你指定一个 id。通常，这些标识符的名称是字母，比如“myBean”、“userService”等，但也可能包含特殊字符。如果您想向 bean 引入其他别名，也可以在 name 属性中指定它们，用“,”、“;”或空格分隔。历史原因，在 Spring 3.1 以前的版本中，id 属性被定义为一个 `xsd:ID` 类型，所以限制了可能的字符。从 Spring 3.1 开始，它被定义为一个 `xsd:string` 类型。请注意，虽然类型做了更改，但 bean id 唯一性仍由容器强制执行。

用户也可以不必为 bean 提供名称或标识符。如果没有显式提供名称或标识符，则容器会为该 bean 自动生成一个唯一的名称。但是，如果要通过名称引用该 bean，则必须提供一个名称。

在命名 bean 时尽量遵守使用标准 Java 约定。也就是说，bean 的名字以一个小写字母开头的骆驼法命名规则，比如“accountManager”、“accountService”、“userDao”、“loginController”等等。使用这样命名的 bean 会让应用程序的配置更易于阅读和理解。

Spring 为未命名的组件生成 bean 名称，同样遵循以上规则。本质上，最简单的命名方式，就是直接采用类名称并将其初始字符变为小写。但也有特例，当前两个字符或多个字符是大写时，我们不进行处理。比如，“URL”类的 bean 的名词仍然是“URL”。这些命名规则，定义在 `java.beans.Introspector.decapitalize` 方法中。

### 2.2.7 实例化 bean 的方式

所谓 bean 的实例化，就是根据配置来创建对象的过程。

如果是使用基于 XML 的配置方式，则在 `<bean />` 元素的 class 属性中指定需要实例化的对象的类型（或类）。这个 class 属性在内部实现，通常是一个 BeanDefinition 实例的 Class 属性。但也有关例外情况，比如使用工厂方法或者 bean 定义继承进行实例化。

使用 Class 属性有两种方式：

* 通常，在容器本身是通过反射机制，来调用调用指定类的构造函数，从而创建 bean。这与使用 Java 代码的 new 运算符相同。
* 通过静态工厂方法创建，类中包含静态方法。通过调用静态方法返回对象的类型可能和 Class 一样，也可能完全不一样。

如果你想配置使用静态的内部类，你必须用内部类的二进制名称。例如，在 `com.example` 包下有个 User 类，这里类里面有个静态的内部类 Account，这种情况下 bean 定义的 class 属性应该是“com.example.User$Account”。这里需要注意，使用“$”字符来分割外部类和内部类的名称。

概况起来，bean 的实例化有三种方式。

#### 1. 通过构造函数实例化

Spring IoC 容器可以管理几乎所有你想让它管理的类，它不限于管理 POJO。大多数 Spring 用户更喜欢使用 POJO（一个默认无参的构造方法和 setter、getter方法）。但在容器中使用非 bean 形式的类也是可以的。比如遗留系统中的连接池，很显然它与 JavaBean 规范不符，但 Spring 也能管理它。

当你使用构造方法来创建 bean 的时候，Spring 对类来说并没有什么特殊。也就是说，正在开发的类不需要实现任何特定的接口或者以特定的方式进行编码。但是，根据你所使用的 IoC 类型，你可能需要一个默认（无参）的构造方法。

当使用基于XML的元数据配置文件，可以这样来指定 bean 类：

```xml
<bean id="exampleBean" class="example.ExampleBean"/>

<bean name="anotherExample" class="example.ExampleBeanTwo"/>
```

#### 2. 使用静态工厂方法实例化

当采用静态工厂方法创建 bean 时，除了需要指定 class 属性外，还需要通过 `factory-method` 属性来指定创建 bean 实例的工厂方法，Spring 将调用此方法返回实例对象。就此而言，跟通过普通构造器创建类实例没什么两样。

下面的 bean 定义展示了如何通过工厂方法来创建bean实例。


```xml
<bean id="clientService"
    class="example.ClientService"
    factory-method="createInstance"/>
```

以下是需要创建实例的类的定义：

```java
public class ClientService {
    private static ClientService clientService = new ClientService();
    private ClientService() {}

    public static ClientService createInstance() {
        return clientService;
    }
}
```

注意：在此例中，createInstance() 必须是一个 static 方法。

#### 3. 使用工厂实例方法实例化


通过调用工厂实例的非静态方法进行实例化,与通过静态工厂方法实例化类似。使用这种方式时，class 属性置为空，而`factory-bean`属性必须指定为当前(或其祖先)容器中包含工厂方法的 bean 的名称，而该工厂 bean 的工厂方法本身必须通过`factory-method`属性来设定。


```xml
<!-- 工厂bean，包含createInstance()方法 -->
<bean id="serviceLocator" class="example.DefaultServiceLocator">
    <!-- 其他需要注入的依赖项 -->
</bean>

<!-- 通过工厂bean创建的ben -->
<bean id="clientService"
    factory-bean="serviceLocator"
    factory-method="createClientServiceInstance"/>
```


以下是需要创建实例的类的定义：

```java
public class DefaultServiceLocator {

    private static ClientService clientService = new ClientServiceImpl();
    private DefaultServiceLocator() {}

    public ClientService createClientServiceInstance() {
        return clientService;
    }
}
```


```xml
<bean id="serviceLocator" class="example.DefaultServiceLocator">
    <!-- 其他需要注入的依赖项 -->
</bean>

<bean id="clientService"
    factory-bean="serviceLocator"
    factory-method="createClientServiceInstance"/>

<bean id="accountService"
    factory-bean="serviceLocator"
    factory-method="createAccountServiceInstance"/>
```

以下是需要创建实例的类的定义：

```java
public class DefaultServiceLocator {

    private static ClientService clientService = new ClientServiceImpl();
    private static AccountService accountService = new AccountServiceImpl();

    private DefaultServiceLocator() {}

    public ClientService createClientServiceInstance() {
        return clientService;
    }

    public AccountService createAccountServiceInstance() {
        return accountService;
    }

}
```

### 2.2.8 注入方式


在 Spring 框架中，主要有以下两种注入方式。

#### 1. 基于构造函数

基于构造函数的 DI 是通过调用具有多个参数的构造函数的容器来完成的，每个参数表示依赖关系，这个与调用具有特定参数的静态工厂方法来构造 bean 几乎是等效的。以下示例演示了一个只能使用构造函数注入的依赖注入的类，该类是一个 POJO，并不依赖于容器特定的接口、基类或注解。

```java
public class SimpleMovieLister {

    // SimpleMovieLister依赖于MovieFinder
    private MovieFinder movieFinder;

    // Spring容器可以通过构造器来注入MovieFinder
    public SimpleMovieLister(MovieFinder movieFinder) {
        this.movieFinder = movieFinder;
    }

    // 省略使用注入的MovieFinder的具体业务逻辑...
}
```

基于构造函数的 DI 通常需要处理传参。构造函数的参数解析是通过参数的类型来匹配的。如果 bean 的构造函数参数不存在歧义，那么构造器参数的顺序也就是这些参数实例化以及装载的顺序。参考如下代码：

```java
package x.y;

public class Foo {

    public Foo(Bar bar, Baz baz) {
        // ...
    }

}
```

假设`Bar`和`Baz`在继承层次上不相关，也没有什么歧义的话，下面的配置完全可以工作正常，开发者不需要再去`<constructor-arg>`元素中指定构造函数参数的索引或类型信息。

```xml
<beans>
    <bean id="foo" class="x.y.Foo">
        <constructor-arg ref="bar"/>
        <constructor-arg ref="baz"/>
    </bean>

    <bean id="bar" class="x.y.Bar"/>

    <bean id="baz" class="x.y.Baz"/>
</beans>
```

当引用另一个 bean 的时候，如果类型确定的话，匹配会工作正常（如上面的例子）。

当使用简单的类型的时候，比如说 `<value>true</value>`，Spring IoC 容器是无法判断值的类型的，所以是无法匹配的。考虑代码如下：

```java
package example;

public class ExampleBean {

    private int years;

    private String ultimateAnswer;

    public ExampleBean(int years, String ultimateAnswer) {
        this.years = years;
        this.ultimateAnswer = ultimateAnswer;
    }

}
```

那么，在上面代码这种情况下，容器可以通过使用构造函数参数的 `type` 属性来实现简单类型的匹配。比如：

```xml
<bean id="exampleBean" class="example.ExampleBean">
    <constructor-arg type="int" value="7500000"/>
    <constructor-arg type="java.lang.String" value="42"/>
</bean>
```

或者使用 `index` 属性来指定构造参数的位置，比如：

```xml
<bean id="exampleBean" class="example.ExampleBean">
    <constructor-arg index="0" value="7500000"/>
    <constructor-arg index="1" value="42"/>
</bean>
```

这个索引也同时是为了解决构造函数中有多个相同类型的参数无法精确匹配的问题。注意，索引是从0开始的。

开发者也可以通过参数的名称来去除二义性。

```xml
<bean id="exampleBean" class="example.ExampleBean">
    <constructor-arg name="years" value="7500000"/>
    <constructor-arg name="ultimateAnswer" value="42"/>
</bean>
```

注意，做这项工作的代码必须启用了调试标记编译，这样 Spring 才可以从构造函数查找参数名称。开发者也可以使用 `@ConstructorProperties` 注解来显式声明构造函数的名称，比如如下代码：

```java
package example;

public class ExampleBean {

    // 省略了字段...

    @ConstructorProperties({"years", "ultimateAnswer"})
    public ExampleBean(int years, String ultimateAnswer) {
        this.years = years;
        this.ultimateAnswer = ultimateAnswer;
    }

}
```


### 2. 基于 setter 方法

基于 setter 方法的 DI 是通过在调用无参数构造函数或无参数静态工厂方法来实例化 bean 之后，通过容器调用 bean 的 setter 方法完成的。

以下示例演示了一个只能使用 setter 来将依赖进行注入的类。该类是一个 POJO，并不依赖于容器特定的接口、基类或注解。

```java
public class SimpleMovieLister {

    // SimpleMovieLister依赖于MovieFinder
    private MovieFinder movieFinder;

    // Spring容器可以通过setter方法来注入MovieFinder
    public void setMovieFinder(MovieFinder movieFinder) {
        this.movieFinder = movieFinder;
    }

    // 省略使用注入的MovieFinder的具体业务逻辑...
}
```
