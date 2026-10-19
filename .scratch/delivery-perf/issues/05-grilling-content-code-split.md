# 内容与代码分仓：做不做、做到什么程度

Type: grilling
Status: open
Blocked by: 01

## Question

参考站把它当架构主线之一：博客正文与图片放在**独立仓库**，主仓只做代理/本地副本，理由是「100 多篇博文、1000 多张图片，资源加起来 300 MB，每次部署 CI/CD 都沉在来回 300 MB 的流量里」。

Firefly 现状：`public/` 共 **144 MB**（assets 93M / gallery 25M / pets 14M / anime 6.8M），全部在同一个 git 仓库里。

要决定：
- 要不要把内容/大资产移出主仓？
- 如果做，边界在哪：只移 `public/` 大资产？还是连 `src/content/posts/` 一起？
- 代价评估：现有 `post-publish` 发文流水线（vault → 成帖 → validate → cascade）会受什么影响？图片上 R2 的现有做法能否承接？
- 不做的理由也要写下来（如果决定不做，这是给未来探索者的一条边界）。

## Answer

（待决议）
