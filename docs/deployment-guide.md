# Flare Stack Blog 部署指南

本文档提供两种自动化部署方案，并尽量使用 CLI 减少浏览器操作。

> **日常更新无需浏览器**：代码推送到 `main` 分支后，GitHub Actions 会自动完成构建、数据库迁移、部署和 CDN 刷新。

---

## 方案对比

| 方案 | 平台 | 免费额度 | 特点 |
| :--- | :--- | :--- | :--- |
| 方案一 | GitHub Actions | 私有库 2000 分钟/月 | 灵活性高，支持手动触发，自动刷新 CDN，推荐 |
| 方案二 | Cloudflare Workers Builds | 3000 分钟/月 | 配置简单，但只能通过 `push` 触发，不自动刷新 CDN |

公开仓库使用 GitHub Actions 完全免费。

---

## 第一阶段：准备（两种方案通用）

### 1. Fork 仓库

点击仓库右上角 **Fork**，将代码复制到自己的 GitHub 账号下。只有自己的仓库才能配置 Secrets 和触发自动化部署。

### 2. 注册并启用服务

- **Cloudflare 账号**：[注册地址](https://dash.cloudflare.com/sign-up)。注意：需要添加支付方式才能启用 R2 和 Workers AI（免费额度充足，个人博客通常不收费）。
- **域名托管**：将域名 DNS 托管到 Cloudflare，这是使用免费 CDN 和自动化部署的前提。

### 3. 创建 Cloudflare 资源

以下操作大部分可以通过 **Wrangler CLI** 完成，无需打开浏览器 Dashboard。

```bash
# 安装/登录 Wrangler（首次需要浏览器授权）
npx wrangler login

# 创建 D1 数据库
npx wrangler d1 create my-blog-db
# 记录返回的 database_id

# 创建 R2 存储桶
npx wrangler r2 bucket create blog-assets

# 创建 KV 命名空间
npx wrangler kv:namespace create "KV"
npx wrangler kv:namespace create "OAUTH_KV"
# 记录返回的 id

# 创建 Queue
npx wrangler queues create blog-queue
```

创建后，用以下命令查看已创建资源的 ID：

```bash
npx wrangler d1 list
npx wrangler kv:namespace list
npx wrangler r2 bucket list
```

### 4. 获取核心 ID

```bash
# Account ID
npx wrangler whoami

# Zone ID（将 example.com 替换为你的域名）
npx wrangler zone list
```

### 5. 创建 API Token

这一步目前仍需在浏览器中操作：

1. 点击 Cloudflare 右上角头像 → My Profile → API Tokens → Create Token
2. **CDN 刷新 Token**（必需）：使用 "Edit zone DNS" 模板，权限添加 `Zone -> Cache Purge -> Purge`
3. **部署 Token**（方案一必需）：使用 "Edit Cloudflare Workers" 模板，额外添加 `D1 -> Edit` 权限

### 6. 创建 GitHub OAuth App（如需 GitHub 登录）

如果希望使用 GitHub OAuth 登录，需要在浏览器中配置：

1. 前往 GitHub Settings → Developer Settings → OAuth Apps → New OAuth App
2. **Homepage URL**: `https://<你的域名>`
3. **Authorization callback URL**: `https://<你的域名>/api/auth/callback/github`
4. 记录 **Client ID** 和 **Client Secret**

> **替代方案**：不想配置 GitHub OAuth？项目支持**邮箱密码注册**，详见下方「登录方式选择」。

---

## 第二阶段：选择部署方案

### 方案一：GitHub Actions 自动部署（推荐）

#### 1. 启用 Actions

Fork 后的仓库默认可能禁用 Actions，需要手动开启：

```bash
# 用 GitHub CLI 启用（无需打开网页）
gh auth login
gh repo edit <你的用户名>/flare-stack-blog --enable-actions
```

#### 2. 配置仓库 Secrets

**完全不需要在 GitHub 网页上逐个填写**，使用 `gh` 命令行批量设置：

```bash
# 进入仓库目录
cd flare-stack-blog

# 必需：部署相关 Secrets
gh secret set CLOUDFLARE_API_TOKEN --body "你的部署Token"
gh secret set CLOUDFLARE_ACCOUNT_ID --body "你的AccountID"
gh secret set D1_DATABASE_ID --body "你的D1数据库ID"
gh secret set KV_NAMESPACE_ID --body "你的KV命名空间ID"
gh secret set BUCKET_NAME --body "blog-assets"

# 必需：运行时 Secrets
gh secret set BETTER_AUTH_SECRET --body "$(openssl rand -hex 32)"
gh secret set BETTER_AUTH_URL --body "https://你的域名"
gh secret set ADMIN_EMAIL --body "你的邮箱"
gh secret set CLOUDFLARE_ZONE_ID --body "你的ZoneID"
gh secret set CLOUDFLARE_PURGE_API_TOKEN --body "你的CDN刷新Token"
gh secret set DOMAIN --body "你的域名"

# 可选：GitHub OAuth（如果不使用 GitHub 登录可不设）
gh secret set GH_CLIENT_ID --body "GitHub Client ID"
gh secret set GH_CLIENT_SECRET --body "GitHub Client Secret"

# 可选：其他运行时配置
gh secret set PAGEVIEW_SALT --body "$(openssl rand -hex 16)"
gh secret set GH_TOKEN --body "你的GitHub Personal Access Token"
gh secret set TURNSTILE_SECRET_KEY --body "你的Turnstile Secret Key"

# 构建时变量（使用 --env 或 Variables 设置）
gh variable set VITE_TURNSTILE_SITE_KEY --body "你的Turnstile Site Key"
gh variable set VITE_UMAMI_WEBSITE_ID --body "你的Umami Website ID"
gh variable set THEME --body "default"
```

> 完整环境变量列表请参考项目 README。

#### 3. 配置 Wrangler

```bash
cp wrangler.example.jsonc wrangler.jsonc
# 将前面获取的 D1 database_id、KV id 等资源 ID 填入 wrangler.jsonc
```

#### 4. 首次触发部署

```bash
# 推送代码到 main 分支即可触发自动部署
git add .
git commit -m "chore: initial setup"
git push origin main
```

或者手动触发：

```bash
gh workflow run "deploy to cloudflare workers"
```

后续每次 `git push` 到 `main` 分支，系统都会自动更新博客。

---

### 方案二：Cloudflare Dashboard 直连部署

如果你不想用 GitHub Actions，可以直接在 Cloudflare 上连接 Git 仓库：

1. Cloudflare Dashboard → Workers & Pages → Create application → Pages → Connect to Git
2. 选择你的仓库，构建配置：
   - **Framework preset**: `None`
   - **Build command**: `bun run build`
   - **Deploy command**: `bun run deploy`
   - 环境变量添加 `BUN_VERSION`: `1.3.5`
3. 首次部署完成后，在 Worker Settings → Variables and Secrets 中手动添加运行时 Secret

**注意**：此方案不会自动刷新 CDN 缓存，每次部署后需要手动在博客后台「设置」页面点击「清除 CDN 缓存」。

---

## 登录方式选择

### 方式 A：邮箱密码登录（推荐，无需第三方配置）

Better Auth 支持邮箱密码认证，**无需配置任何 OAuth App**：

1. 确保配置了邮件服务（Resend API Key，在后台「设置」页面配置）
2. 访问博客首页，使用 `.dev.vars` 中配置的 `ADMIN_EMAIL` 注册账号
3. 验证邮件会打印到控制台（开发环境）或通过 Resend 发送（生产环境）
4. 验证后自动获得管理员权限

### 方式 B：GitHub OAuth 登录

需要按照第一阶段第 6 步配置 GitHub OAuth App，并将 `GH_CLIENT_ID` 和 `GH_CLIENT_SECRET` 填入 Secrets。

---

## 第三阶段：可选高级配置

### 1. 图片优化（Cloudflare Images）

在 Dashboard 中为域名启用 [Image Resizing](https://developers.cloudflare.com/images/)，每月 5000 次免费转换请求，大幅提升图片加载速度。

### 2. 邮件系统（Resend）

1. 在 [Resend](https://resend.com/) 注册并绑定域名（建议用子域名）
2. 获取 API Key 后，在博客后台「设置」页面填入
3. 启用后支持：密码登录、验证码、评论回复邮件通知

### 3. 人机验证（Cloudflare Turnstile）

1. 在 Cloudflare Turnstile 页面创建 Widget
2. 记录 Site Key 和 Secret Key：
   - `VITE_TURNSTILE_SITE_KEY` → GitHub Variables（构建时变量）
   - `TURNSTILE_SECRET_KEY` → GitHub Secrets（运行时变量）

### 4. 站点信息

首次登录管理员后台后，打开「设置」页面编辑站点标题、描述、作者、社交链接和主题资源。`src/blog.config.ts` 仅作为默认兜底配置。

---

## 第四阶段：维护与更新

### 同步上游更新

当后台提示新版本（或手动检查）：

```bash
# 在 Fork 的仓库主页点击 Sync fork -> Update branch
# 或在本地：
git fetch upstream
git merge upstream/main
git push origin main
```

**自动部署**：
- 方案一：GitHub Actions 检测代码更新后自动触发部署
- 方案二：Cloudflare 自动检测新的 GitHub commit 并开始构建

本项目已将所有个性化配置抽象为环境变量，直接同步上游代码通常不会产生合并冲突。

---

## 常见问题

### 1. 部署成功但网页打不开或报错？

- **查看控制台**：按 F12 打开开发者工具，查看 Console 错误
- **查看实时日志**：Cloudflare Dashboard → Worker 项目 → Observability → Live，在另一个标签页打开博客即可捕获实时错误，通常能直接定位哪个环境变量缺失或配置错误
- **检查环境变量**：绝大多数"打不开"问题都是环境变量配置不正确导致的

### 2. 构建时变量和运行时变量有什么区别？

- **构建时变量**：以 `VITE_` 开头，在打包时硬编码到客户端代码中。如果配置错误，**必须**重新构建部署才能生效。
- **运行时变量**：服务端代码执行时读取，可动态调整。

方案一（GitHub Actions）中，Secrets 和 Variables 会自动分类；方案二（Cloudflare Dashboard）中，构建变量放在 Build → Variables，运行时变量放在 Variables and Secrets。

### 3. 如何配置统计分析？

系统内置浏览量统计（Cloudflare Queue + D1），后台展示流量概览，首页展示热门文章。可额外配置 `PAGEVIEW_SALT` 加强访客哈希匿名化。

可选集成 Umami 客户端追踪，配置 `UMAMI_SRC` 和 `VITE_UMAMI_WEBSITE_ID`。

### 4. 发布了文章但前台不显示？

发布按钮仅在文章状态为「已发布」且发布时间早于当前时间时才会真正发布。如果发布时间设为未来，后台任务会在该时间点自动执行。

### 5. 如何撤回已发布的文章？

将状态从「已发布」改为「草稿」，发布按钮会变成「撤回」按钮。

---

## 纯 CLI 初始化速查表

如果你希望**最大程度减少浏览器操作**，以下是关键命令汇总：

```bash
# === Cloudflare 资源创建 ===
npx wrangler login
npx wrangler d1 create my-blog-db
npx wrangler r2 bucket create blog-assets
npx wrangler kv:namespace create "KV"
npx wrangler kv:namespace create "OAUTH_KV"
npx wrangler queues create blog-queue

# === 获取 ID ===
npx wrangler whoami          # Account ID
npx wrangler zone list       # Zone ID
npx wrangler d1 list         # Database ID
npx wrangler kv:namespace list # KV ID

# === GitHub 配置 ===
gh auth login
gh repo edit <user>/<repo> --enable-actions
gh secret set CLOUDFLARE_API_TOKEN --body "xxx"
# ... 批量设置其他 secrets

# === 本地开发 ===
cp .env.example .env
cp .dev.vars.example .dev.vars
cp wrangler.example.jsonc wrangler.jsonc
bun install
bun dev

# === 部署 ===
git push origin main
# 或手动触发：
gh workflow run "deploy to cloudflare workers"
```

**仍需要浏览器的操作**：
1. 注册 Cloudflare / GitHub 账号
2. 添加支付方式（启用 R2 / Workers AI）
3. 创建 API Token（Cloudflare 网页）
4. 创建 GitHub OAuth App（如使用 GitHub 登录）
