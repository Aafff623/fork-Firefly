---
title: "全栈实战用户管理删除用户"
published: 2026-08-25
description: "AdminController删除用户相关的接口，已完全适配无需调整。"
image: ''
tags: [Vue, 前后端分离, 实战]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course18-9-6
pinned: false
comment: true
---

### 后端删除用户接口

AdminController删除用户相关的接口，已完全适配无需调整。

```java
/**
 * 处理用户删除的请求
 */
@DeleteMapping("/user/{userId}")
public ResponseEntity<DeleteResponseDto> deleteUser(@PathVariable Long userId) {
    // 判定用户是否存在，不存在则抛出异常
    Optional<User> optionalUser = userService.findByUserId(userId);
    if (!optionalUser.isPresent()) {
        throw new UserNotFoundException("");
    }

    userService.deleteUser(userId);

    DeleteResponseDto deleteResponseDto = new DeleteResponseDto();
    deleteResponseDto.setMessage("用户删除成功");
    deleteResponseDto.setRedirectUrl("/admin/user");

    return ResponseEntity.ok(deleteResponseDto);
}
```


### 前端删除用户组件设计


修改`src\components\AdminUser.vue`：

```ts
// 删除用户
const deleteUser = async (userId: number) => {
  if (!confirm('确定要删除这个用户吗？')) return;

  try {
    // 调用API获取用户数据
    const response = await axios.delete(`/api/admin/user/${userId}`);
    console.log('response.json:', response.data);

    // 从列表中移除用户
    userList.value = userList.value.filter(u => u.userId !== userId);
  } catch (error) {
    console.error('获取用户数据失败:', error);
  }
};

// ...为节约篇幅，此处省略非核心内容

<button class="btn btn-sm btn-danger" @click="deleteUser(user.userId)">删除</button>
```
