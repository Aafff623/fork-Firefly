---
title: "常见并发风险深度解析：避免90%的生产环境异常单"
published: 2026-08-25
description: "多线程并发会带来如下的问题"
image: ''
tags: [分布式, CAP, 架构]
category: 指南
collections: [java-fullstack, java-fullstack-distributed]
draft: false
lang: ''
slug: java-course9-5-2
pinned: false
comment: true
---

多线程并发会带来如下的问题：

* 安全性问题。在没有充足同步的情况下，多个线程中的操作执行顺序是不可预测的，甚至会产生奇怪的结果。线程间的通信主要是通过共享访问字段及其字段所引用的对象来实现的。这种形式的通信是非常有效的，但可能导致两种错误：线程干扰（thread interference）和内存一致性错误（memory consistency errors）。
* 活跃度问题。一个并行应用程序的及时执行能力被称为它的活跃度（liveness）。安全性的含义是“永远不发生糟糕的事情”，而活跃度则关注于另外一个目标，即“某件正确的事情最终会发生”。当某个操作无法继续执行下去，就会发生活跃度问题。在串行程序中，活跃度问题形式之一就是无意中造成的无限循环（死循环）。而在多线程程序中，常见的活跃度问题主要有死锁、饥饿以及活锁。
* 性能问题。在设计良好的并发应用程序中，线程能提升程序的性能，但无论如何，线程总是带来某种程度的运行时开销。而这种开销主要是在线程调度器临时关起活跃线程并转而运行另外一个线程的上下文切换操作（Context Switch）上，因为执行上下文切换，需要保存和恢复执行上下文，丢失局部性，并且CPU时间将更多地花在线程调度而不线程运行上。当线程共享数据时，必须使用同步机制，而这些机制往往会抑制某些编译器优化，使内存缓存区中的数据无效，以及增加贡献内存总线的同步流量。所以这些因素都会带来额外的性能开销。


### 5.2.1 死锁（Deadlock）

死锁是指两个或两个以上的线程永远被阻塞，一直等待对方的资源。

下面是一个Java编写的死锁的例子。

Alphonse和Gaston是朋友，都很有礼貌。礼貌的一个严格的规则是，当你给一个朋友鞠躬时，你必须保持鞠躬，直到你的朋友鞠躬回给你。不幸的是，这条规则有个缺陷，那就是如果两个朋友同一时间向对方鞠躬，那就永远不会完了。这个示例应用程序中，死锁模型是这样的：

```java
package com.example.java.demo.concurrency;

public class Deadlock {

	public static void main(String[] args) {
		final Friend alphonse = new Friend("Alphonse");
        final Friend gaston = new Friend("Gaston");
        new Thread(new Runnable() {
            public void run() {
                alphonse.bow(gaston);
            }
        }).start();
        
        new Thread(new Runnable() {
            public void run() {
                gaston.bow(alphonse);
            }
        }).start();
	}
	
	static class Friend {
        private final String name;

        public Friend(String name) {
            this.name = name;
        }

        public String getName() {
            return this.name;
        }

        public synchronized void bow(Friend bower) {
            System.out.format("%s: %s" + "  has bowed to me!%n", 
            		this.name, bower.getName());
            bower.bowBack(this);
        }

        public synchronized void bowBack(Friend bower) {
            System.out.format("%s: %s" + " has bowed back to me!%n", 
            		this.name, bower.getName());
        }
    }

}
```

当它们尝试调用bowBack时两个线程将被阻塞。无论是哪个线程，也永远不会结束，因为每个线程都在等待对方鞠躬。这就是死锁了。


### 5.2.2 饥饿（Starvation）

饥饿描述了一个线程由于访问足够的共享资源而不能执行程序的现象。这种情况一般出现在共享资源被某些“贪婪”线程占用，而导致资源长时间不被其他线程可用。例如，假设一个对象提供一个同步的方法，往往需要很长时间返回。如果一个线程频繁调用该方法，其他线程若也需要频繁地同步访问同一个对象则通常会被阻塞。

### 5.2.3 活锁（Livelock）


一个线程常常处于响应另一个线程的动作，如果其他线程也常常响应该线程的动作，那么就可能出现活锁。与死锁的线程一样，程序无法进一步执行。然而，线程是不会阻塞的，它们只是会忙于应对彼此的恢复工作。现实中的例子是，两人面对面试图通过一条走廊：Alphonse移动到他的左侧给Gaston让路，而Gaston移动到他的右侧想让Alphonse过去，两个人同时让路，但其实两人都挡住了对方，他们仍然彼此阻塞。

下面就介绍几种解决并发问题的常用方法。
