---
title: "实战：在Java中实现阻塞I/O模型"
published: 2026-08-25
description: "Java语言从初创之日起，就是为网络而生的。随着互联网应用的发展，Java也被越来越多的企业所采用。接下来将演示了如何基于Java实现常用网络I/O模型。"
image: ''
tags: [分布式, CAP, 架构]
category: 指南
collections: [java-fullstack, java-fullstack-distributed]
draft: false
lang: ''
slug: java-course9-4-5
pinned: false
comment: true
---

Java语言从初创之日起，就是为网络而生的。随着互联网应用的发展，Java也被越来越多的企业所采用。接下来将演示了如何基于Java实现常用网络I/O模型。


执行以下命令进行初始化项目原型：

```
mvn archetype:generate -DgroupId=com.example.java.demo -DartifactId=java-io-demo -DarchetypeArtifactId=maven-archetype-quickstart -DarchetypeVersion=1.5 -DinteractiveMode=false
```


本节先演示在Java中实现阻塞I/O模型的网络应用。

### 4.5.1 开发Echo协议的服务器

早期的Java提供java.net包用于开发网络应用，这类API也被称为Java OIO（Old-blocking I/O，阻塞I/O）。以下演示了使用java.net包及java.io来开发Echo协议的客户端及服务器的过程。

提示：Echo协议是指把接收到的信息按照原样返回，其重要的作用是用于检测和调试网络。这个协议可以基于TCP/UDP协议用于服务器检测端口7有无信息。有关该协议内容详见<https://tools.ietf.org/html/rfc862>。


以下是使用原生java.net包来开发Echo协议的服务器的示例：

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


上述例子BlockingEchoServer实现了Echo协议。BlockingEchoServer主要是使用了java.net包中Socket和ServerSocket类库。这两个类库主要是用于开发基于TCP协议的应用。如果是想要开发UDP协议的应用，则需要使用DatagramSocket类。

ServerSocket用于服务器端，而Socket是建立网络连接时使用的。在客户端连接服务器成功时，客户端以及服务器两端都会产生一个Socket实例，通过操作这个实例，来完成所需的会话。对于一个网络连接来说，Socket是平等的，并没有差别，不会因为在服务器端或在客户端而产生不同的级别，不管是Socket还是ServerSocket，他们的工作都是通过Socket类和其子类来完成的。

运行BlockingEchoServer，可以看到控制台输出内容如下：

```
BlockingEchoServer启动，监听端口：7
```

### 4.5.2 开发Echo协议的客户端

以下是使用原生java.net包来开发Echo协议的客户端的示例：


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

BlockingEchoClient的Socket的使用与BlockingEchoServer的Socket的使用基本类似。如果你本地的JDK版本是11以上，则可以跳过编译阶段直接运行源码，命令如下：

```
$ java BlockingEchoClient.java localhost 7
```

提示：从JDK 11开始，可以直接运行启动Java源码文件。有关Java的最新特性，可参阅《Java核心编程》。

当BlockingEchoClient客户端与BlockingEchoServer服务器建立了连接之后，客户端就可以与服务器进行交互了。

当我们在客户端输入“hello!”字符时，服务器也会将“hello!”发送回客户端，客户端输入的任何内容，服务器也会原样返回。


BlockingEchoClient控制台输出内容如下：

```
请输入：hello!
Echo：hello!
--------------------------------------------------------------------------------
等待下一个输入...
--------------------------------------------------------------------------------
请输入：yes!
Echo：yes!
--------------------------------------------------------------------------------
等待下一个输入...
--------------------------------------------------------------------------------
请输入：
```


BlockingEchoServer控制台输出内容如下：

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

###  4.5.3 java.net包API的缺点

BlockingEchoClient和BlockingEchoServer代码只是一个简单的示例，如果是要创建一个复杂的客户端-服务器协议仍然需要大量的样板代码，并且要求开发者必须掌握相当多的底层技术细节才能使它整个流畅地运行起来。Socket和ServerSocket类库的API只支持由本地系统套接字库提供的所谓的阻塞函数，因此客户端与服务器的通信是阻塞的，并且要求每个新加入的连接，必须在服务器中创建一个新的Socket实例。这极大消耗了服务器的性能，并且也使得连接数受到了限制。


BlockingEchoClient客户端与BlockingEchoServer服务器所实现的方式是阻塞的。


那么Java是否可以实现非阻塞的I/O程序呢？答案是肯定的，且听下回分解。
