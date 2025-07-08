# 📝 博客和数据自动同步完整指南

这个指南将介绍如何使用博客和数据自动同步功能，让您专注于写作和内容管理，同步交给自动化。

## 🚀 快速开始

### 方案一：一键发布工具（推荐新手）

```bash
# 启动一键发布助手
npm run blog:publish

# 或者
./scripts/publish-post.sh
```

这个工具提供交互式菜单：
1. 📝 创建新文章
2. ✏️  编辑现有文章  
3. 🛠️  编辑工具数据
4. 🚀 发布内容到线上
5. 👀 本地预览网站

### 方案二：自动监听同步（推荐熟练用户）

```bash
# 安装依赖（首次使用）
npm install

# 启动自动同步监听器
npm run blog:auto-sync

# 或者
npm run blog:watch
```

启动后，监听器会：
- 🔍 监听 `content/blog/` 目录下的所有 `.mdx` 文件
- 📊 监听 `data/` 目录下的所有 `.json` 文件（如工具数据）
- ⚡ 自动检测文件新增、修改、删除
- 🕐 5秒防抖，避免频繁提交
- 📤 自动 git 提交和推送
- 🚀 触发 Vercel 自动部署

### 方案三：传统手动同步

```bash
# 创建新文章
npm run new-post

# 编辑工具数据
npm run tools:edit

# 本地预览
npm run dev

# 手动同步博客
npm run blog:sync

# 手动同步数据文件
npm run data:sync

# 或者手动操作
git add .
git commit -m "更新内容"
git push origin main
```

## 📋 详细功能说明

### 🆕 创建新文章

#### 使用脚本创建：
```bash
npm run new-post
```

脚本会询问：
- 文章标题
- 文章描述  
- 作者（默认：站长）
- 发布日期（默认：今天）
- 标签（用逗号分隔）
- 是否立即发布

#### 手动创建：
```bash
cp content/blog/_template.mdx content/blog/your-article-slug.mdx
```

### ✏️ 编辑文章

#### 方式一：使用一键工具
```bash
npm run blog:publish
# 选择选项 2：编辑现有文章
```

#### 方式二：直接编辑
```bash
code content/blog/your-article.mdx
vim content/blog/your-article.mdx
```

### 🛠️ 管理工具数据

#### 方式一：使用专门的工具管理器（推荐）
```bash
npm run tools:manage
```

提供完整的工具管理功能：
- 📋 查看所有工具和分类
- ➕ 添加新工具/新分类
- ✏️  编辑现有工具
- 🗑️  删除工具
- 📄 直接编辑JSON文件

#### 方式二：直接编辑JSON文件
```bash
npm run tools:edit
# 或者
code data/tools.json
```

#### 方式三：使用一键发布工具
```bash
npm run blog:publish
# 选择选项 3：编辑工具数据
```

### 🔄 自动同步详解

#### 启动监听器：
```bash
npm run blog:auto-sync
```

监听器特性：
- **监听范围**：
  - `content/blog/*.mdx`（排除 `_template.mdx`）
  - `data/*.json`（包括工具数据等）
- **防抖机制**：5秒内的多次更改会合并为一次提交
- **智能提交信息**：区分博客文章和数据文件，生成相应的提交信息
- **自动推送**：推送到 `main` 分支
- **状态反馈**：彩色日志显示同步状态

#### 停止监听器：
按 `Ctrl+C` 或发送 `SIGINT` 信号

### 📱 发布到线上

所有方案最终都通过以下流程发布：

1. **Git 提交**：将更改提交到本地仓库
2. **推送远程**：推送到 GitHub `main` 分支  
3. **触发部署**：Vercel 自动检测推送并开始构建
4. **自动上线**：2-3分钟后新内容上线

## 🛠️ 可用的 npm 脚本

### 文章管理
```bash
npm run new-post           # 创建新文章
npm run post:new           # 创建新文章（别名）
```

### 工具和数据管理
```bash
npm run tools:manage       # 工具数据管理器（交互式）
npm run tools:edit         # 直接编辑工具JSON文件
npm run data:sync          # 手动同步数据文件
```

### 发布和同步
```bash
npm run blog:publish       # 一键发布工具（交互式）
npm run blog:sync          # 手动同步博客（一次性）
npm run blog:auto-sync     # 自动同步监听器
npm run blog:watch         # 自动同步监听器（别名）
```

### 预览和开发
```bash
npm run blog:preview       # 本地预览（启动dev服务器）
npm run dev                # 开发服务器
```

### 部署相关
```bash
npm run deploy            # 生产环境部署
npm run deploy:preview    # 预览环境部署
```

## 📂 文件结构

```
personal-website/
├── content/blog/              # 博客文章目录
│   ├── _template.mdx         # 文章模板
│   ├── my-article.mdx        # 你的文章
│   └── ...
├── data/                      # 数据文件目录
│   ├── tools.json            # 工具导航数据
│   └── ...                   # 其他数据文件
├── scripts/                   # 自动化脚本
│   ├── new-post.js           # 新建文章脚本
│   ├── publish-post.sh       # 一键发布脚本
│   ├── auto-sync.js          # 自动同步脚本
│   ├── manage-tools.js       # 工具管理脚本
│   └── deploy.sh             # 部署脚本
└── BLOG_AUTO_SYNC.md         # 本说明文件
```

## 🔧 配置选项

### 自动同步配置

在 `scripts/auto-sync.js` 中可以调整：

```javascript
const BLOG_DIR = path.join(process.cwd(), 'content/blog');  // 博客监听目录
const DATA_DIR = path.join(process.cwd(), 'data');          // 数据监听目录  
const DEBOUNCE_DELAY = 5000;                                // 防抖延迟（毫秒）
const EXCLUDE_FILES = ['_template.mdx'];                    // 排除文件
```

### 文章前置元数据格式

```yaml
---
title: "文章标题"                    # 必需
description: "文章描述"              # 必需，用于SEO
date: "2025-07-08"                  # 必需，格式：YYYY-MM-DD
author: "作者名"                     # 可选，默认：站长
tags: ["标签1", "标签2"]            # 可选，用于分类
published: true                     # 必需，false=草稿，true=发布
---
```

### 工具数据格式

```json
{
  "categories": [
    {
      "id": "category-id",              // 分类唯一标识
      "name": "分类名称",                // 显示名称
      "description": "分类描述",         // 分类说明
      "icon": "IconName"                // Lucide React图标名
    }
  ],
  "tools": [
    {
      "id": "tool-id",                  // 工具唯一标识
      "name": "工具名称",                // 显示名称
      "description": "工具描述",         // 工具说明
      "url": "https://example.com",     // 工具链接
      "category": "category-id",        // 所属分类ID
      "tags": ["标签1", "标签2"],       // 标签数组
      "featured": true                  // 是否为推荐工具
    }
  ]
}
```

## 🚨 注意事项

### 1. 网络连接
- 自动同步需要稳定的网络连接
- 确保能正常访问 GitHub 和 Vercel

### 2. Git 配置  
- 确保已配置 Git 用户信息：
  ```bash
  git config --global user.name "Your Name"
  git config --global user.email "your.email@example.com"
  ```

### 3. 权限设置
- 确保对仓库有推送权限
- Vercel 项目已正确关联 GitHub 仓库

### 4. 文件命名
- 文章文件名使用小写字母和连字符
- 工具和分类ID自动生成，无需手动设置
- 避免特殊字符和空格
- 示例：`my-awesome-post.mdx`

## 🎯 最佳实践

### 1. 写作和内容管理流程建议

**使用自动监听器的工作流：**
```bash
# 1. 启动自动同步
npm run blog:auto-sync

# 2. 启动本地预览（新终端）
npm run dev

# 3. 创建或编辑内容
npm run new-post          # 创建文章
npm run tools:manage      # 管理工具
# 或直接编辑文件

# 4. 保存文件，自动同步生效
# 5. 在浏览器查看效果：
#    - 博客：http://localhost:3000/blog
#    - 工具：http://localhost:3000/tools
```

**使用一键工具的工作流：**
```bash
# 1. 启动一键工具
npm run blog:publish

# 2. 选择相应操作（创建/编辑文章/编辑工具/发布/预览）
# 3. 按提示完成操作
```

### 2. 内容质量检查

**文章发布前检查：**
- [ ] 标题和描述是否清晰
- [ ] 日期是否正确
- [ ] 标签是否合适
- [ ] 内容是否完整
- [ ] 代码示例是否正确
- [ ] 链接是否有效
- [ ] `published: true` 是否设置

**工具数据检查：**
- [ ] 工具名称和描述是否准确
- [ ] URL是否有效可访问
- [ ] 分类是否正确
- [ ] 标签是否有助于搜索
- [ ] 推荐状态是否合适

### 3. 版本控制建议

- 使用有意义的提交信息
- 频繁小步提交而非大批量提交
- 草稿阶段可设置 `published: false`
- 定期备份工具数据

## 🆘 故障排除

### 常见问题

**Q: 自动同步失败？**
A: 检查网络连接、Git 配置、仓库权限

**Q: Vercel 没有自动部署？**  
A: 检查 Vercel 项目设置中的 Git 集成配置

**Q: 文章没有显示？**
A: 确保 `published: true` 且前置元数据格式正确

**Q: 新工具没有显示？**
A: 检查工具JSON格式是否正确，分类ID是否存在

**Q: 监听器停止工作？**
A: 重启监听器：`npm run blog:auto-sync`

### 调试模式

如需调试，可以：
```bash
# 查看 Git 状态
git status

# 查看最近提交
git log --oneline -5

# 查看 Vercel 部署状态
vercel ls

# 手动部署测试
vercel --prod

# 验证工具数据格式
npm run tools:manage
# 选择选项 1 查看所有工具
```

## 🎉 总结

现在您有了完整的内容管理和同步方案：

### 📝 博客管理：
1. **自动监听同步**：适合频繁写作，完全自动化
2. **一键发布工具**：适合偶尔写作，半自动化  
3. **传统手动同步**：适合精确控制，手动操作

### 🛠️ 工具数据管理：
1. **专门管理器**：`npm run tools:manage` - 完整的交互式管理
2. **直接编辑**：`npm run tools:edit` - 直接编辑JSON文件
3. **一键工具集成**：在发布工具中包含数据管理功能

### 🔄 自动同步覆盖：
- ✅ 博客文章（`.mdx` 文件）
- ✅ 工具数据（`tools.json` 等）
- ✅ 其他数据文件（`data/` 目录下）
- ✅ 智能提交信息分类
- ✅ 防抖机制避免频繁提交

选择最适合您工作流程的方案，专注于创作优质内容和管理实用工具！

---

💡 **提示**：首次使用建议先用一键工具熟悉流程，然后可升级到自动监听模式提升效率。工具管理器提供了最友好的数据编辑体验。 