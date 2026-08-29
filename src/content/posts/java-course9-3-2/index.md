---
title: "线程对象深度解析，建立安全可靠的代码编写规范"
published: 2026-08-25
description: "在面向对象语言开发过程中，每个线程都与Thread类的一个实例相关联。由于Java语言的流行，下文中的例子将用Java来实现和使用线程对象，以作为并发应用程序的基本原型。"
image: ''
tags: [分布式, CAP, 架构]
category: 指南
collections: [java-fullstack, java-fullstack-distributed]
draft: false
lang: ''
slug: java-course9-3-2
pinned: false
comment: true
---

在面向对象语言开发过程中，每个线程都与Thread类的一个实例相关联。由于Java语言的流行，下文中的例子将用Java来实现和使用线程对象，以作为并发应用程序的基本原型。

### 3.2.1 定义和启动一个线程

Java中有两种创建Thread实例的方式。第一种是提供Runnable对象。

Runnable接口定义了一个方法run，用来包含线程要执行的代码。HelloRunnable示例如下所示。

```java
public class HelloRunnable implements Runnable {
    @Override
    public void run() {
        System.out.println("Hello from a runnable!");
    }
    public static void main(String[] args) {
        (new Thread(new HelloRunnable())).start();
    }
}
```


第二种创建Thread实例的方式是继承Thread。Thread类本身是实现Runnable，虽然它的run方法什么都没干。HelloThread示例如下所示。

```java
public class HelloThread extends Thread {
    @Override
    public void run() {
        System.out.println("Hello from a thread!");
    }
    public static void main(String[] args) {
        (new HelloThread()).start();
    }
}
```

请注意，这两个例子都是调用start方法来启动线程。

关于第一种方式，它使用Runnable对象，在实际应用中更普遍，因为Runnable对象可以继承Thread以外的类。第二种方式，在简单的应用程序中更容易使用，但受限于你的任务类必须是一个Thread的后代。本书推荐使用第一种方法，将Runnable任务从Thread对象分离来执行任务。这样不仅更灵活，而且它适用于高级线程管理API。

Thread类还定义了大量的方法用于线程管理。

### 3.2.2 暂停线程执行

Thread.sleep可以让当前线程执行暂停一个时间段，这样处理器的时间就可以给其他线程使用。

sleep有两种重载形式：一个是指定睡眠时间为毫秒级，另外一个是指定睡眠时间为纳秒级。然而，这些睡眠时间不能保证是精确的，因为它们是由操作系统提供的，并受其限制，因而不能假设sleep的睡眠时间是精确的。睡眠周期也可以通过中断来终止，我们将在后面的章节中看到。

以下SleepMessages示例是使用sleep每隔4秒打印一次消息：

```java
public class SleepMessages {

    public static void main(String[] args) throws InterruptedException
    {
        String importantInfo[] = {
                "Mares eat oats",
                "Does eat oats",
                "Little lambs eat ivy",
                "A kid will eat ivy too" };

        for (int i = 0; i < importantInfo.length; i++) {
        
            // 暂停4秒
            Thread.sleep(4000);
            
            // 打印消息
            System.out.println(importantInfo[i]);
        }
    }
}
```

请注意main声明抛出InterruptedException。当sleep是激活的时候，若有另一个线程中断当前线程时，则sleep抛出异常。由于该应用程序还没有定义另一个线程来引起中断，所以考虑捕捉InterruptedException。


### 3.2.3 中断线程

中断是表明一个线程应该停止它正在做和将要做的事。线程通过在Thread对象调用interrupt来实现线程的中断。为了中断机制能正常工作，被中断的线程必须支持自己的中断。

#### 1. 支持中断

如何实现线程支持自己的中断？这要看是它目前正在做什么。如果线程调用方法频繁抛出InterruptedException异常，那么它只要在run方法捕获了异常之后返回即可。例如：

```java
for (int i = 0; i < importantInfo.length; i++) {

    // 暂停4秒
    try {
        Thread.sleep(4000);
    } catch (InterruptedException e) {
    
        // 已经中断，无须更多信息
        return;
    }
    
    // 打印消息
    System.out.println(importantInfo[i]);
}
```


很多方法都会抛出InterruptedException，如sleep，被设计成在收到中断时立即取消它们当前的操作并返回。

若线程长时间没有调用方法抛出InterruptedException的话，那么它必须定期调用Thread.interrupted，该方法在接收到中断后将返回true。

```java
for (int i = 0; i < inputs.length; i++) {

    heavyCrunch(inputs[i]);
    
    if (Thread.interrupted()) {
    
        // 已经中断，无须更多信息
        return;
    }
}
```

在这个简单的例子中，代码简单地测试该中断，如果已接收到中断线程就退出。在更复杂的应用程序中，它可能会更有意义地抛出一个InterruptedException：


```java
if (Thread.interrupted()) {
    throw new InterruptedException();
}
```

#### 2. 中断状态标志

中断机制是使用被称为中断状态的内部标志实现的。调用Thread.interrupt可以设置该标志。当一个线程通过调用静态方法Thread.interrupted来检查中断时，中断状态被清除。非静态isInterrupted方法用于线程来查询另一个线程的中断状态，而不会改变中断状态标志。

按照惯例，任何方法因抛出一个InterruptedException而退出都会清除中断状态。当然，它可能因为另一个线程调用interrupt而让那个中断状态立即被重新设置回来。

### 3.2.4 等待另一个线程完成

join方法允许一个线程等待另一个线程完成。假设t是一个正在执行的Thread对象，那么执行方法

```java
t.join();
````

会导致当前线程暂停执行直到t线程终止。join允许程序员指定一个等待周期，与sleep一样，等待时间是依赖于操作系统的时间，同时不能假设join等待时间是精确的。

像sleep一样，join并通过InterruptedException退出来响应中断。
