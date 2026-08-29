---
title: "扩展为更灵活的用户角色与权限管理"
published: 2026-08-25
description: "角色枚举如下"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-15-2
pinned: false
comment: true
---

### 设计角色


角色枚举如下：

```java
package com.example.rednote.common;

/**
 * Role 角色枚举
 *
 * @version 2025/06/18
 **/
public enum Role {
    USER("用户"),
    ADMIN("管理员");

    private final String description;

    Role(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
```

### 将用户关联角色


扩展User实体，添加角色字段：


```java
@Entity
@Table(name = "t_user")
@Data // @Data集合了 @ToString， @EqualsAndHashCode，所有字段的 @Getter和所有非final字段的 @Setter, @RequiredArgsConstructor
@NoArgsConstructor // 无参构造器
@AllArgsConstructor // 包含所有参数的构造器
public class User {

    // ...为节约篇幅，此处省略非核心内容
    
    /**
     * 角色
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

}
```

上述代码，在创建User时会自动默认赋值为USER角色。但原先数据库已存在的历史数据，则不一定会赋值USE角色（可能是ADMIN角色，取决于具体的数据库）。比如，在MySQL里，t_user表最终的结果如下：

```sql
mysql> DESCRIBE t_user;
+----------+----------------------+------+-----+---------+-------+
| Field    | Type                 | Null | Key | Default | Extra |
+----------+----------------------+------+-----+---------+-------+
| user_id  | bigint               | NO   | PRI | NULL    |       |
| avatar   | varchar(255)         | YES  |     | NULL    |       |
| bio      | varchar(255)         | YES  |     | NULL    |       |
| password | varchar(255)         | YES  |     | NULL    |       |
| phone    | varchar(255)         | YES  |     | NULL    |       |
| username | varchar(255)         | YES  |     | NULL    |       |
| role     | enum('ADMIN','USER') | NO   |     | NULL    |       |
+----------+----------------------+------+-----+---------+-------+
7 rows in set (0.037 sec)
```

t_user表的role字段已经是支持枚举类型了，但没有提供默认值（Default是NULL），因此，数据库会自动给role字段赋值一个默认值ADMIN或者USER。以下是在MySQL中，role字段赋值的默认值是ADMIN：


```sql
mysql> select * from t_user;
+---------+-----------------------------------------------------------------------------+--------------------------------------------------------------------------+--------------------------------------------------------------+-------------+----------+-------+
| user_id | avatar                                                                      | bio                                                                      | password                                                     | phone       | username | role  |
+---------+-----------------------------------------------------------------------------+--------------------------------------------------------------------------+--------------------------------------------------------------+-------------+----------+-------+
|       1 | /uploads/2025-08-21/35ff037f-043a-4551-8912-99b89eb11591_user_181_181.jpg | Life was like a box of chocolates, you never know what you're gonna get. | $2a$10$wfuboZNYniQBTNo5/3vuau6HKpbr0y3ktavpzH6L3jd6Yw7cbHwKm | 13411111111 | user     | ADMIN |
|       2 | NULL                                                                        | NULL                                                                     | $2a$10$5QzEQnaMCKP/jy4PCHy7Re2gJE18xzslF3JoBwgbubkYPprdtNQla | 13411111112 | bobo     | ADMIN |
+---------+-----------------------------------------------------------------------------+--------------------------------------------------------------------------+--------------------------------------------------------------+-------------+----------+-------+
2 rows in set (0.012 sec)
```


还需要手动执行如下脚本来将存量数据改为USER角色：


```
UPDATE t_user SET role = 'USER';
```


### 修改UserDetailsServiceImpl服务


修改UserDetailsServiceImpl服务，按照User实体上维护的实际的角色返回：

```java
@Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 根据用户名查询用户，判定用户是否存在
        Optional<User> optionalUser = userRepository.findByUsername(username);
        if (!optionalUser.isPresent()) {
            // 抛出用户不存在的异常
            throw new UsernameNotFoundException(ExceptionType.USERNAME_NOT_FOUND);
        }

        User user = optionalUser.get();

        // 将User转为自定义的UserDetails对象
        return new CustomUserDetails(
                user.getUserId(),
                user.getUsername(),
                user.getPassword(),
                /*// 设置所有的数据库里面的用户都是USER角色
                AuthorityUtils.createAuthorityList("ROLE_USER"));*/
                AuthorityUtils.createAuthorityList("ROLE_" + user.getRole().name()));
    }
}
```
