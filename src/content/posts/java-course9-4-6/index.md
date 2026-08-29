---
title: "实战：在Java中实现非阻塞I/O模型"
published: 2026-08-25
description: "从Java 1.4开始，Java提供了NIO（New I/O），用来替代标准Java I/O API（指1.1.1节所描述的早期的Java网络编程API）。Java NIO也被称为“Non-block…"
image: ''
tags: [分布式, CAP, 架构]
category: 指南
collections: [java-fullstack, java-fullstack-distributed]
draft: false
lang: ''
slug: java-course9-4-6
pinned: false
comment: true
---

从Java 1.4开始，Java提供了NIO（New I/O），用来替代标准Java I/O API（指1.1.1节所描述的早期的Java网络编程API）。Java NIO也被称为“Non-blocking I/O”，提供了非阻塞I/O的方式，用法与标准I/O有非常大的差异。

Java NIO提供了以下几个核心概念。

* 通道（Channel）和缓冲区（Buffer）：标准的I/O基于字节流和字符流进行操作的，而NIO是基于通道和缓冲区进行操作，数据总是从通道读取到缓冲区中，或者从缓冲区写入到通道中。
* 非阻塞I/O（Non-blocking I/O）:Java NIO可以让你非阻塞的使用I/O，例如，当线程从通道读取数据到缓冲区时，线程还是可以进行其他事情。当数据被写入到缓冲区时，线程可以继续处理它。从缓冲区写入通道也类似。
* 选择器（Selector）：Java NIO引入了选择器的概念，选择器用于监听多个通道的事件（比如：连接打开，数据到达）。因此，单个的线程可以监听多个数据通道，这极大提升了单机的并发能力。


Java NIO API位于java.nio包下。以下是Java NIO版本实现的支持Echo协议的客户端及服务器。


##### 4.6.1 开发NIO版本的Echo服务器

以下是使用原生Java NIO API来开发Echo协议的服务器的示例：

```java
package com.example.java.demo.net;

import java.io.IOException;
import java.net.ServerSocket;

/**
 * BlockingEchoServer 阻塞IO Echo服务器
 *
 * @version 2025/08/25
 **/
public class BlockingEchoServer {

    private static final int DEFAULT_PORT = 7;

    public static void main(String[] args) {
        // 解析传参进来的端口号
        int port;
        try {
            port = Integer.parseInt(args[0]);
        } catch (Exception e) {
            port = DEFAULT_PORT;
        }

        // 创建ServerSocket
        try (var serverSocket = new ServerSocket(port)) {
            System.out.println("BlockingEchoServer启动，监听端口：" + port);

            // 接受客户端连接，生成Socket实例
            while (true) {
                try (var clientSocket = serverSocket.accept()) {

                    System.out.println("接收到客户端连接：" + clientSocket.getInetAddress());
                    while (true) {
                        var input = clientSocket.getInputStream();
                        var output = clientSocket.getOutputStream();
                        var buffer = new byte[1024];

                        // 读取客户端的信息
                        var bytesRead = input.read(buffer);
                        if (bytesRead == -1) {
                            break;
                        }

                        // 发送信息给客户端
                        output.write(buffer, 0, bytesRead);

                        System.out.println("Echo：" + new String(buffer, 0, bytesRead));
                        System.out.println("Echo完毕");
                        System.out.println("--------------------------------------------------------------------------------");
                        System.out.println("等待下一个客户端连接...");
                        System.out.println("--------------------------------------------------------------------------------");
                    }
                } catch (IOException e) {
                    System.out.println("BlockingEchoServer异常：" + e.getMessage());
                }
            }
        } catch (IOException e) {
            System.out.println("BlockingEchoServer启动异常，监听端口：" + port);
            System.out.println(e.getMessage());
        }
    }
}
```


上述例子NonBlokingEchoServer实现了Echo协议，ServerSocketChannel与ServerSocket的职责类似。相比较而言，ServerSocket读和写操作都是同步阻塞的，在面对高并发的场景时，需要消耗大量的线程来维持连接。CPU在大量的线程之间频繁切换，性能损耗很大。一旦单机的连接超过1万，甚至达到几万的时候，服务器的性能会急剧下降。

NIO的Selector却很好地解决了这个问题，用主线程（一个线程或者是 CPU 个数的线程）保持住所有的连接，管理和读取客户端连接的数据，将读取的数据交给后面的线程处理，后续线程处理完业务逻辑后，将结果交给主线程发送响应给客户端，这样少量的线程就可以处理大量连接的请求。

在上述NonBlokingEchoServer例子中，使用Selector注册Channel，然后调用它的select()方法。这个select()方法会一直阻塞到某个注册的通道有事件就绪。一旦这个方法返回，线程就可以处理这些事件。事件包括例如有新连接进来（OP_ACCEPT），数据接收（OP_READ）等。


运行，可以看到控制台输出内容如下：

```
BlockingEchoServer启动，监听端口：7
```

##### 4.6.2 开发NIO版本的Echo客户端

以下是使用原生NIO API来开发Echo协议的客户端的示例：


```java
package com.example.java.demo.net;

import java.io.IOException;
import java.net.UnknownHostException;

/**
 * BlockingEchoClient 阻塞IO Echo客户端
 *
 * @version 2025/08/25
 **/
public class BlockingEchoClient {
    private static final int DEFAULT_PORT = 7;
    public static final String DEFAULT_HOST = "localhost";

    public static void main(String[] args) {
        // 解析传参进来的服务名、端口号
        String host;
        int port;
        try {
            host = args[0];
            port = Integer.parseInt(args[1]);
        } catch (Exception e) {
            host = DEFAULT_HOST;
            port = DEFAULT_PORT;
        }

        // 创建Socket
        try (var socket = new java.net.Socket(host, port)) {
            System.out.println("BlockingEchoClient启动，连接：" + host + ":" + port);
            var input = socket.getInputStream();
            var output = socket.getOutputStream();
            var reader = new java.util.Scanner(System.in);
            while (true) {
                System.out.print("请输入：");
                var line = reader.nextLine();
                output.write(line.getBytes());
                output.flush();
                var buffer = new byte[1024];

                var bytesRead = input.read(buffer);
                if (bytesRead == -1) {
                    break;
                }

                System.out.println("Echo：" + new String(buffer, 0, bytesRead));
                System.out.println("--------------------------------------------------------------------------------");
                System.out.println("等待下一个输入...");
                System.out.println("--------------------------------------------------------------------------------");
            }
        } catch (UnknownHostException e) {
            System.out.println("BlockingEchoClient异常：" + e.getMessage());
            System.out.println("请检查服务名是否正确！");
            System.exit(1);
        } catch (IOException e) {
            System.out.println("IO异常：" + e.getMessage());
            System.exit(1);
        }
    }
}
```

NonBlockingEchoClient的SocketChannel的使用与NonBlokingEchoServer的SocketChannel的使用基本类似。启动客户端，命令如下：

```
$ java NonBlockingEchoClient.java localhost 7
```


当NonBlockingEchoClient客户端与NonBlokingEchoServer服务器建立了连接之后，客户端就可以与服务器进行交互了。

当我们在客户端输入“a”字符时，服务器也会将“a”发送回客户端，客户端输入的任务内容，服务器也会原样返回。


NonBlokingEchoServer控制台输出内容如下：

```
接收到客户端连接：/127.0.0.1
Echo：hello!
Echo完毕
--------------------------------------------------------------------------------
等待下一个客户端连接...
--------------------------------------------------------------------------------
Echo：yes!
Echo完毕
--------------------------------------------------------------------------------
等待下一个客户端连接...
--------------------------------------------------------------------------------
```
