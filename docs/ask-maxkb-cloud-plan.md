# MaxKB 智能问答助手 · 上云待办规划（2核4G 优先）

> 状态：待执行（本机 `/ask` HeroUI 岛 + 同源代理已通；MaxKB 仍绑本机）
> 关联：`src/pages/ask.astro` → `AskChat` React 岛；`src/pages/api/ask.ts`（session / retrieve / SSE chat）
> 本机 MaxKB：localhost:8080，管理员见本地密管（勿入库），step-3.7-flash + 站点知识库已验证

---

## 0. 背景与目标

- **现状**：本机 Docker 已跑通 MaxKB；博客 `/ask` 已改为 **HeroUI Pro** 对话岛，经同源 `/api/ask` 代理（本站 posts 检索 + MaxKB `stream:true` SSE）。桌宠 `LiveChatWidget` 仍可能直连本机 MaxKB，与 `/ask` 不同路。
- **目标**：把 MaxKB 上云，开放给访客；代理上游改为公网 MaxKB，去掉对本机 `127.0.0.1:8080` 的依赖。
- **预算约束**：尽量 **2核4G**，低成本起步；官方推荐 4核8G，个人博客单用户问答 2核4G 够用。

---

## 一、服务器选型（2核4G）

| 项 | 建议 |
|---|---|
| 规格 | **2核4G** 轻量应用服务器 |
| 厂商 | 阿里云 / 腾讯云 轻量（新用户常有 2核4G 优惠价，约 50-80 元/月） |
| 系统 | Ubuntu 22.04（推荐）或 CentOS 7 |
| 磁盘 | ≥40GB（MaxKB 镜像 ~2GB + PostgreSQL 数据 + 日志） |
| 带宽 | 个人博客问答够用，3-5M 即可 |
| 地域 | 就近（国内访客选国内地域，需备案域名；无所谓可海外） |

> 备注：如果厂商同价位有 2核4G 加量（如 4G→8G 加价很少），直接选 8G 更省心；没有就 2核4G 起步。

---

## 二、云服务器部署 MaxKB

### 步骤 1：安装 Docker

```bash
# Ubuntu
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker
```

### 步骤 2：运行 MaxKB 容器

```bash
mkdir -p /opt/maxkb/data /opt/maxkb/python-packages
docker run -d --name=maxkb --restart=always -p 8080:8080 \
  -v /opt/maxkb/data:/var/lib/postgresql/data \
  -v /opt/maxkb/python-packages:/opt/maxkb/app/sandbox/python-packages \
  1panel/maxkb
```

> 国内拉镜像慢就用国内源：`registry.fit2cloud.com/maxkb/maxkb`

### 步骤 3：开放端口 + 安全组

- 云控制台**安全组放行 8080**（TCP）
- 服务器防火墙：
  ```bash
  ufw allow 8080/tcp
  ```

### 步骤 4：访问验证

- 浏览器打开 `http://<服务器IP>:8080` → 用 `admin / MaxKB@123..` 首次登录，**改掉默认密码**

---

## 三、云端配置（重复本机的配置，数据重做）

> 云端数据与本地不共用，需在云端重建（本机知识库数据不迁移，重新爬取更干净）。

### 1. 加模型（step-3.7-flash）

- 系统管理 → 模型管理 → 添加模型 → 供应商选 **OpenAI**
- API 域名：`https://api.stepfun.com/step_plan/v1`
- API Key：见本地密管（勿入库）
- 基础模型：`step-3.7-flash`（自定义输入后从下拉选中，回车添加）
- 模型类型：大语言模型

### 2. 建知识库（Web 站点类型）

- 知识库 → 创建 → Web 知识库
- 名称：ForkFirefly 站点知识库
- 向量模型：maxkb-embedding
- Web 根地址：`https://fork-firefly.vercel.app`（或正式域名，见第五节）
- 创建后自动爬取，等文档全部"成功"

> ⚠️ **2核4G 注意**：爬取 + 向量化是内存峰值时刻，文档多时分小批/分批确认，避免 OOM。可临时加 1-2GB swap 兜底。

### 3. 建应用并关联

- 智能体 → 创建 → 简易智能体 → 名称"站点问答助手"
- AI 模型选 step-3.7-flash
- 关联知识库 → 添加 → 选 ForkFirefly（勾选后点"添加"）
- 保存 → 发布
- 记录公开访问链接：`http://<服务器IP>:8080/chat/<xxxx>`

---

## 四、改博客对接公网 MaxKB

当前 `/ask` **不再用 iframe**，走同源代理：

- 环境变量 / 配置：`MAXKB_API_BASE`（默认 `http://127.0.0.1:8080/chat/api`）、`MAXKB_ACCESS_TOKEN`
- 上云后把 `MAXKB_API_BASE` 指到 `http(s)://<云端>/chat/api`，token 换成云端应用 access_token
- 重新 build/部署博客（Vercel）；确认 `/api/ask/?action=session|retrieve|chat` 通

桌宠 `LiveChatWidget` 若仍硬编码 `localhost:8080`，需另改或复用同一代理。

---

## 五、（可选）域名 + HTTPS

| 项 | 做法 |
|---|---|
| 有备案域名 | DNS 解析到服务器 IP；Nginx 反代 443→8080 + Let's Encrypt 证书 |
| 无备案/海外 | 直接用 `http://<IP>:8080` 先跑通；或海外服务器 + 域名 |
| 简单 HTTPS | 用 Caddy（自动 HTTPS）反代，比 Nginx 省事 |

> 域名可暂缓——先 `http://IP:8080` 把功能跑通，再补域名。

---

## 六、2核4G 注意事项（关键）

1. **内存大头**：PostgreSQL+pgvector(~1GB) + Redis(~200MB) + Django/Celery(~800MB) ≈ 常驻 1.5-2GB，2核4G 能跑。
2. **峰值时刻**：爬取/向量化时内存冲高，**分小批导入**，或先 `free -h` 盯内存。
3. **加 swap 兜底**（可选）：
   ```bash
   fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
   ```
4. **关可选吃内存功能**：语音输入/输出、长期记忆等不必要就不开。
5. **负载预期**：个人博客单用户问答负载很低，2核4G 完全够；高并发（>几十人同时）才需升配。

---

## 七、验证清单（照做）

- [ ] 服务器可 `ssh` 登录，Docker 装好
- [ ] MaxKB 容器运行中，`http://IP:8080` 可访问并登录
- [ ] step-3.7-flash 模型添加成功（能对话）
- [ ] Web 知识库爬取完成（文档全部"成功"）
- [ ] 应用关联知识库 + 保存 + 发布
- [ ] 公开链接打开能基于站点内容回答（有知识来源引用）
- [ ] 博客 `MAXKB_API_BASE` / token 指向云端，`/ask` SSE 对话正常
- [ ] 手机/无痕浏览器验证访客视角
- [ ] （若做域名）HTTPS 生效，无 mixed-content 报错

---

## 八、待办执行顺序（照这个走）

| 序 | 待办 | 预估 |
|---|---|---|
| 1 | 选购 2核4G 轻量服务器（或 4核8G 若加价少） | 10 分钟 |
| 2 | 云上装 Docker + 跑 MaxKB 容器 + 开放 8080 | 30 分钟 |
| 3 | 云端登录改密码 + 加 stepfun 模型 | 10 分钟 |
| 4 | 云端建 Web 知识库（爬 fork-firefly.vercel.app），分批爬 | 30-60 分钟 |
| 5 | 建应用关联知识库 + 保存发布 | 10 分钟 |
| 6 | 配置博客 MaxKB 上游为公网并重新部署 | 20 分钟 |
| 7 | （可选）域名 + HTTPS | 按需 |
| 8 | 按第七节清单验收 | 20 分钟 |

**合计**：约 2-3 小时（不含域名备案）；月成本约 **50-80 元**（服务器）+ stepfun 调用费（已有额度）。

---

## 相关文件

- 本机 ask 页：`src/pages/ask.astro`
- 本机 MaxKB：`localhost:8080`（`docker ps` 看容器）
- 本文档：`docs/ask-maxkb-cloud-plan.md`
