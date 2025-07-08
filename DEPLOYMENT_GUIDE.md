# 🚀 Vercel 部署指南

这个指南将帮助你将个人网站项目部署到 Vercel，并配置自动化 CI/CD 流程。

## 📋 前置条件

- [GitHub](https://github.com) 账户
- [Vercel](https://vercel.com) 账户
- 本地安装了 [Git](https://git-scm.com/)
- 本地安装了 [Node.js](https://nodejs.org/) (v18+)

## 🔧 部署步骤

### 1. 创建 GitHub 仓库

1. 在 GitHub 上创建新仓库：
   - 仓库名建议：`personal-website` 或 `young-personal-website`
   - 设置为 Public（推荐）或 Private
   - **不要**勾选"Initialize this repository with a README"

2. 将本地项目推送到 GitHub：

```bash
# 初始化 Git 仓库（如果还没有）
git init

# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit: Personal website with Next.js 15"

# 推送到 main 分支
git push -u origin main
```

### 2. 连接 Vercel

#### 方式一：通过 Vercel Dashboard（推荐）

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New..." → "Project"
3. 从 GitHub 导入你的仓库
4. 配置项目设置：
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` （保持默认）
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` （保持默认）
   - **Install Command**: `npm install`

#### 方式二：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录 Vercel
vercel login

# 在项目根目录运行
vercel

# 按提示配置：
# ? Set up and deploy "~/path/to/personal-website"? [Y/n] y
# ? Which scope do you want to deploy to? [Your Account]
# ? Link to existing project? [y/N] n
# ? What's your project's name? personal-website
# ? In which directory is your code located? ./
```

### 3. 配置环境变量

在 Vercel Dashboard 中设置以下环境变量：

1. 进入项目 → Settings → Environment Variables
2. 添加以下变量：

```bash
# 基础配置
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# 可选：分析工具
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id

# 可选：其他第三方服务
# DATABASE_URL=your-database-url
# API_SECRET_KEY=your-api-secret
```

### 4. 配置自动部署

#### GitHub Actions CI/CD

项目已经包含完整的 GitHub Actions 配置文件（`.github/workflows/ci.yml`），需要在 GitHub 仓库中添加以下 Secrets：

1. 进入 GitHub 仓库 → Settings → Secrets and variables → Actions
2. 添加以下 Secrets：

```bash
# Vercel 配置（必需）
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id

# 网站 URL（可选）
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

#### 获取 Vercel 配置信息

**获取 VERCEL_TOKEN：**
1. 访问 [Vercel Account Settings](https://vercel.com/account/tokens)
2. 创建新的 Token
3. 复制 Token 值

**获取 ORG_ID 和 PROJECT_ID：**

方法1 - 通过 Vercel CLI：
```bash
# 在项目目录运行
vercel link

# 查看 .vercel/project.json 文件
cat .vercel/project.json
```

方法2 - 通过 Dashboard：
- ORG_ID：Vercel Dashboard → Settings → General → Team ID
- PROJECT_ID：项目 Dashboard → Settings → General → Project ID

### 5. 自定义域名（可选）

1. 在 Vercel Dashboard 中：
   - 进入项目 → Settings → Domains
   - 添加你的自定义域名
   - 按照提示配置 DNS 记录

2. 更新环境变量：
   ```bash
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ```

## 🔄 自动部署流程

配置完成后，自动部署流程如下：

### Production 部署 (main 分支)

1. 推送代码到 `main` 分支
2. GitHub Actions 自动运行：
   - 代码检查（ESLint + TypeScript）
   - 单元测试
   - 构建应用
   - E2E 测试
   - 安全扫描
3. 所有检查通过后自动部署到生产环境

```bash
git add .
git commit -m "feat: 添加新功能"
git push origin main
```

### Preview 部署 (PR)

1. 创建 Pull Request 到 `main` 分支
2. 自动创建预览部署
3. 在 PR 中查看预览链接

```bash
git checkout -b feature/new-feature
git add .
git commit -m "feat: 新功能开发"
git push origin feature/new-feature
# 然后在 GitHub 创建 PR
```

## 📋 部署后检查清单

- [ ] 网站可以正常访问
- [ ] 所有页面（首页、博客、工具）都能正常加载
- [ ] 博客文章渲染正确
- [ ] 代码高亮功能正常
- [ ] 响应式设计在不同设备上正常
- [ ] SEO meta 标签正确
- [ ] RSS feed 和 sitemap 可访问
- [ ] 安全头部配置正确

## 🛠️ 常用命令

```bash
# 本地开发
npm run dev

# 生产构建测试
npm run build
npm run start

# 运行测试
npm run test
npm run test:e2e

# 部署到 Vercel
vercel --prod

# 查看部署状态
vercel ls

# 查看部署日志
vercel logs
```

## 🐛 常见问题

### 1. 构建失败

**问题：** Type checking 失败
**解决：** 运行 `npm run lint` 和 `npx tsc --noEmit` 检查代码问题

### 2. 环境变量问题

**问题：** 生产环境缺少环境变量
**解决：** 检查 Vercel Dashboard 中的环境变量配置

### 3. 域名配置问题

**问题：** 自定义域名无法访问
**解决：** 检查 DNS 配置，确保 CNAME 记录指向 Vercel

### 4. 部署权限问题

**问题：** GitHub Actions 部署失败
**解决：** 检查 GitHub Secrets 配置是否正确

### 5. 图片或静态资源 404

**问题：** 图片无法显示
**解决：** 确保图片路径正确，静态资源放在 `public` 目录下

## 📞 获取帮助

- [Vercel 文档](https://vercel.com/docs)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [GitHub Actions 文档](https://docs.github.com/en/actions)

## 🎉 部署成功

恭喜！你的个人网站现在已经成功部署到 Vercel，并配置了自动化 CI/CD 流程。

每次推送代码到 `main` 分支时，网站都会自动更新！🚀 