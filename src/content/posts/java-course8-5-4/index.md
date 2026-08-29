---
title: "校验用户输入的密码是否正确"
published: 2026-08-25
description: "java"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-5-4
pinned: false
comment: true
---

### 代码实现

```java
@Override
public boolean verifyPassword(String username, String password) {
    boolean isMatch = false;

    // 获取已有加密密码
    if(userRepository.findByUsername(username).isPresent()) {
        User user = userRepository.findByUsername(username).get();
        String encodedPassword = user.getPassword();

        // 验证密码是否与加密后的密码匹配
        isMatch = passwordEncoder.matches(password, encodedPassword);
    }

    return isMatch;
}
```


PasswordEncoder的matches方法用于验证用户输入的密码是否与存储在数据库中的加密密码匹配。‌

#### matches方法的作用

matches方法的主要作用是比较用户输入的未加密密码与数据库中存储的加密密码是否一致。该方法接受两个参数：未加密的原始密码（rawPassword）和加密后的密码（encodedPassword），返回一个布尔值，表示两者是否匹配。如果匹配成功，返回true；否则，返回false‌。

#### matches方法的实现原理

在验证密码时，matches方法会使用与加密密码时相同的算法对用户输入的未加密密码进行处理，生成一个临时的加密密码。然后，将这个临时加密密码与数据库中存储的加密密码进行比较。如果两者相同，说明用户输入的密码正确‌。


### 输入校验改为后端验证

修改login-form.html，将前端校验的代码注释掉：

```js
/*
// 表单提交处理
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', function(e) {
    // 实际项目中会有更多前端验证逻辑
    if (!validateForm()) {
        e.preventDefault();
    }

    loginForm.submit();
});

function validateForm() {
    let isValid = true;

    // 验证用户名
    const username = document.getElementById('username').value;
    if (username.length < 4 || username.length > 20) {
        document.getElementById('usernameError').textContent = '用户名长度应为4-20个字符';
        isValid = false;
    } else {
        document.getElementById('usernameError').textContent = '';
    }

    // 验证密码
    const password = document.getElementById('password').value;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/;
    if (!passwordRegex.test(password)) {
        document.getElementById('passwordError').textContent = '密码长度应为8-20个字符，包含字母和数字';
        isValid = false;
    } else {
        document.getElementById('passwordError').textContent = '';
    }


    return isValid;
}
*/
```
