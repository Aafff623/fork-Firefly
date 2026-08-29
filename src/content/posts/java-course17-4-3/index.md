---
title: "Pinia全局状态管理：复杂业务场景下的数据流治理"
published: 2026-08-25
description: "虽然我们的手动状态管理解决方案在简单的场景中已经足够了，但是在大规模的生产应用中还有很多其他事项需要考虑"
image: ''
tags: [Vue, 前端, JavaScript]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course17-4-3
pinned: false
comment: true
---

虽然我们的手动状态管理解决方案在简单的场景中已经足够了，但是在大规模的生产应用中还有很多其他事项需要考虑：

* 更强的团队协作约定
* 与 Vue DevTools 集成，包括时间轴、组件内部审查和时间旅行调试
* 模块热更新 (HMR)
* 服务端渲染支持

Pinia 就是一个实现了上述需求的状态管理库，由 Vue 核心团队维护，对 Vue 2 和 Vue 3 都可用。

现有用户可能对 Vuex 更熟悉，它是 Vue 之前的官方状态管理库。由于 Pinia 在生态系统中能够承担相同的职责且能做得更好，因此 Vuex 现在处于维护模式。它仍然可以工作，但不再接受新的功能。对于新的应用，建议使用 Pinia。

事实上，Pinia 最初正是为了探索 Vuex 的下一个版本而开发的，因此整合了核心团队关于 Vuex 5 的许多想法。最终，我们意识到 Pinia 已经实现了我们想要在 Vuex 5 中提供的大部分内容，因此决定将其作为新的官方推荐。

相比于 Vuex，Pinia 提供了更简洁直接的 API，并提供了组合式风格的 API，最重要的是，在使用 TypeScript 时它提供了更完善的类型推导。


### 安装Pinia


对于一个现有的使用 JavaScript 包管理器的项目，你可以从 npm registry 中安装 Pinia：


```bash
npm install pinia
```


如果你打算启动一个新项目，你可能会发现使用 create-vue 这个脚手架工具更容易，它能创建一个基于 Vite 的项目，并包含加入 Pinia 的选项。


```bash
> npm create vue@latest

> npx
> create-vue

┌  Vue.js - The Progressive JavaScript Framework
│
◇  Project name (target directory):
│  state-management-pinia
│
◆  Select features to include in your project: (↑/↓ to navigate, space to select, a to toggle all, enter to confirm)
│  ◼ TypeScript
│  ◻ JSX Support
│  ◻ Router (SPA development)
│  ◼ Pinia (state management)
│  ◻ Vitest (unit testing)
│  ◻ End-to-End Testing
│  ◻ ESLint (error prevention)
│  ◻ Prettier (code formatting)
```


如上所示，创建化一个名为“state-management-pinia”并包含了Pinia的应用作为演示。

### 创建一个 pinia 实例


修改main.ts，创建一个 pinia 实例并将其传递给应用：


```vue
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)

// 创建一个 Pinia 实例并将其传递给应用
app.use(createPinia())

app.mount('#app')
```

pinia 实例就代表了根 store。 


### 创建全局状态文件


创建一个全局状态目录`src\stores`，在该目录下创建全局状态文件counter.ts代码如下：


```ts
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)

  function increment() {
    count.value++
  }

  return { count, increment }
})
```


### 多个组件共享的持久化状态


在`src\components`目录下，创建组件ComponentA.vue和ComponentB.vue，并导入全局状态文件。


ComponentA.vue代码如下：


```vue
<script setup lang="ts">
import { useCounterStore } from '../stores/counter'
const store = useCounterStore();
</script>

<template>
  <button @click="store.increment()">
    晁盖号令
  </button>
  : {{ store.count }}
</template>
```


ComponentB.vue代码如下：


```vue
<script setup lang="ts">
import { useCounterStore } from '../stores/counter'
const store = useCounterStore();
</script>

<template>
  <button @click="store.increment()">
    宋江号令
  </button>
  : {{ store.count }}
</template>
```


现在每当 store 对象被更改时，`<ComponentA>` 与 `<ComponentB>` 都会自动更新它们的视图。任意一个导入了 store 的组件都可以随意修改它的状态。


### 根组件App.vue代码如下：


```vue
<script setup lang="ts">
import ComponentA from './components/ComponentA.vue'
import ComponentB from './components/ComponentB.vue'
</script>

<template>
  <main>
    <div>
      <ComponentA />
    </div>
    <div>
      <ComponentB />
    </div>
  </main>
</template>
```


### 运行调测

运行应用，可以看到界面效果如同4.2节类似。
