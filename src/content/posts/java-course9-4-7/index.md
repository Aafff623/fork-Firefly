---
title: "实战：在Java中实现异步I/O模型"
published: 2026-08-25
description: "从Java 1.7开始，Java提供了AIO（异步I/O）。Java AIO也被称为“NIO.2”，提供了异步I/O的方式，用法与标准I/O有非常大的差异。"
image: ''
tags: [分布式, CAP, 架构]
category: 指南
collections: [java-fullstack, java-fullstack-distributed]
draft: false
lang: ''
slug: java-course9-4-7
pinned: false
comment: true
---

从Java 1.7开始，Java提供了AIO（异步I/O）。Java AIO也被称为“NIO.2”，提供了异步I/O的方式，用法与标准I/O有非常大的差异。

Java AIO则采用“订阅-通知”模式，即应用程序向操作系统注册I/O监听，然后继续做自己的事情。当操作系统发生I/O事件，并且准备好数据后，再主动通知应用程序，触发相应的函数。

和同步I/O一样，Java的AIO也是由操作系统进行支持的。微软的Windows系统提供了一种异步I/O技术——IOCP（I/O CompletionPort，I/O完成端口），而在Linux平台下并没有这种异步I/O技术，所以使用的是epoll对异步I/O进行模拟。


Java AIO API同Java NIO一样，都是位于java.nio包下。以下是Java AIO版本实现的支持Echo协议的客户端及服务器。


#### 4.7.1 实战：开发AIO版本的Echo服务器

以下是使用原生Java AIO API来开发Echo协议的服务器的示例：

```java
package com.example.java.demo.aio;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.AsynchronousServerSocketChannel;
import java.nio.channels.AsynchronousSocketChannel;
import java.nio.channels.CompletionHandler;

/**
 * AsyncEchoServer 异步IO Echo服务器
 *
 * @version 2025/08/25
 **/
public class AsyncEchoServer {
    private static final int DEFAULT_PORT = 7;

    public static void main(String[] args) {
        // 解析传参进来的端口号
        int port;
        try {
            port = Integer.parseInt(args[0]);
        } catch (Exception e) {
            port = DEFAULT_PORT;
        }

        // 创建AsynchronousServerSocketChannel实例
        try (var asyncServerSocketChannel = AsynchronousServerSocketChannel.open()) {
            System.out.println("AsyncEchoServer启动，监听：" + port);
            asyncServerSocketChannel.bind(new java.net.InetSocketAddress(port));

            // 设置参数
            asyncServerSocketChannel.setOption(java.net.StandardSocketOptions.SO_REUSEADDR, true);
            asyncServerSocketChannel.setOption(java.net.StandardSocketOptions.SO_RCVBUF, 1024);

            // 使用CompletionHandler处理异步连接
            acceptConnection(asyncServerSocketChannel);

            // 保持主线程运行
            Thread.currentThread().join();

        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }

    // 递归接受连接的辅助方法
    private static void acceptConnection(AsynchronousServerSocketChannel serverChannel) {
        serverChannel.accept(null, new CompletionHandler<AsynchronousSocketChannel, Void>() {
            @Override
            public void completed(AsynchronousSocketChannel clientChannel, Void attachment) {
                try {
                    System.out.println("接收到客户端连接：" + clientChannel.getRemoteAddress());
                    System.out.println("等待客户端发送信息...");
                    System.out.println("--------------------------------------------------------------------------------");

                    // 继续接受下一个连接（真正实现并发）
                    acceptConnection(serverChannel);

                    // 为当前客户端开始读取数据
                    handleClient(clientChannel);

                } catch (IOException e) {
                    e.printStackTrace();
                }
            }

            @Override
            public void failed(Throwable exc, Void attachment) {
                System.out.println("接受客户端连接失败: " + exc.getMessage());
            }
        });
    }

    // 处理客户端数据的辅助方法
    private static void handleClient(AsynchronousSocketChannel clientChannel) {
        readClientData(clientChannel, ByteBuffer.allocate(1024));
    }

    private static void readClientData(AsynchronousSocketChannel clientChannel, ByteBuffer buffer) {
        clientChannel.read(buffer, buffer, new CompletionHandler<Integer, ByteBuffer>() {
            @Override
            public void completed(Integer result, ByteBuffer attachment) {
                if (result > 0) {
                    attachment.flip();
                    byte[] data = new byte[attachment.remaining()];
                    attachment.get(data);

                    System.out.println("Echo：" + new String(data));

                    // 回写数据，将attachment作为附件传递（而不是null）
                    clientChannel.write(ByteBuffer.wrap(data), attachment, new CompletionHandler<Integer, ByteBuffer>() {
                        @Override
                        public void completed(Integer result, ByteBuffer attachment) {
                            System.out.println("--------------------------------------------------------------------------------");
                            System.out.println("Echo完毕");
                            System.out.println("--------------------------------------------------------------------------------");
                            System.out.println("等待客户端发送信息...");
                            System.out.println("--------------------------------------------------------------------------------");

                            // 继续读取更多数据
                            attachment.clear();
                            readClientData(clientChannel, attachment);
                        }

                        @Override
                        public void failed(Throwable exc, ByteBuffer attachment) {
                            System.out.println("写入数据失败: " + exc.getMessage());
                            try {
                                clientChannel.close();
                            } catch (IOException e) {
                                e.printStackTrace();
                            }
                        }
                    });
                } else if (result == -1) {
                    try {
                        clientChannel.close();
                        System.out.println("客户端已关闭");
                        System.out.println("--------------------------------------------------------------------------------");
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }

            @Override
            public void failed(Throwable exc, ByteBuffer attachment) {
                System.out.println("读取数据失败: " + exc.getMessage());
                try {
                    clientChannel.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        });
    }

}
```


上述例子AsyncEchoServer实现了Echo协议，AsynchronousServerSocketChannel与ServerSocketChannel的职责类似。相比较而言，AsynchronousServerSocketChannel实现了异步的I/O，而无需再使用Selector，因此整体代码比之ServerSocketChannel要简化很多。


运行，可以看到控制台输出内容如下：

```
AsyncEchoServer启动，监听：7
```

#### 4.7.2 实战：开发AIO版本的Echo客户端

以下是使用原生AIO API来开发Echo协议的客户端的示例：


```java
package com.example.java.demo.aio;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.concurrent.ExecutionException;

/**
 * AsyncEchoClient 异步IO Echo客户端
 *
 * @version 2025/08/25
 **/
public class AsyncEchoClient {
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

        // 创建AsynchronousSocketChannel
        try (var channel = java.nio.channels.AsynchronousSocketChannel.open()) {
            System.out.println("AsyncEchoClient启动，连接：" + host + ":" + port);

            // 等待连接完成
            var connectFuture = channel.connect(new InetSocketAddress(host, port));
            // 等待连接建立完成
            connectFuture.get();

            var scanner = new java.util.Scanner(System.in);

            while (true) {
                System.out.print("请输入：");
                var line = scanner.nextLine();

                if (line == null || line.isEmpty()) {
                    continue;
                }

                // 写入数据
                var writeFuture = channel.write(java.nio.ByteBuffer.wrap(line.getBytes()));
                // 等待写入完成
                writeFuture.get();

                // 读取响应
                var buffer = java.nio.ByteBuffer.allocate(1024);
                var readFuture = channel.read(buffer);
                // 等待读取完成
                int bytesRead = readFuture.get();

                if (bytesRead > 0) {
                    buffer.flip();
                    byte[] data = new byte[buffer.remaining()];
                    buffer.get(data);
                    System.out.println("Echo：" + new String(data));
                    System.out.println("--------------------------------------------------------------------------------");
                    System.out.println("Echo完毕");
                    System.out.println("--------------------------------------------------------------------------------");
                } else if (bytesRead == -1) {
                    System.out.println("服务器连接已关闭");
                    break;
                }

                System.out.println("等待下一个输入...");
                System.out.println("--------------------------------------------------------------------------------");
            }
        } catch (ExecutionException e) {
            System.out.println("操作执行异常: " + e.getMessage());
        } catch (InterruptedException e) {
            System.out.println("操作被中断: " + e.getMessage());
        } catch (IOException e) {
            System.out.println("IO异常: " + e.getMessage());
        }
    }
}
```

AsyncEchoClient的AsynchronousSocketChannel的使用与NonBlockingEchoClient的SocketChannel的使用基本类似。启动客户端，命令如下：

```
$ java AsyncEchoClient.java localhost 7
```


当AsyncEchoClient客户端与AsyncEchoServer服务器建立了连接之后，客户端就可以与服务器进行交互了。

当我们在客户端输入“hello!”字符时，服务器也会将“hello!”发送回客户端，客户端输入的任务内容，服务器也会原样返回。


AsyncEchoServer控制台输出内容如下：

```
接收到客户端连接：/127.0.0.1:7394
等待客户端发送信息...
--------------------------------------------------------------------------------
Echo：hello!
--------------------------------------------------------------------------------
Echo完毕
--------------------------------------------------------------------------------
等待客户端发送信息...
--------------------------------------------------------------------------------
Echo：yes!
--------------------------------------------------------------------------------
Echo完毕
--------------------------------------------------------------------------------
等待客户端发送信息...
```
