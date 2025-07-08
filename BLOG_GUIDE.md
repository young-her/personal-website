# 📝 博客文章管理指南

这个指南将教你如何轻松地向你的个人网站添加新的MDX博客文章。

## 🚀 快速开始

### 方法1：使用自动化脚本（推荐）

运行以下命令来创建新文章：

```bash
npm run new-post
```

或者：

```bash
npm run post:new
```

脚本会交互式地询问以下信息：
- 文章标题
- 文章描述
- 作者（默认：站长）
- 发布日期（默认：今天）
- 标签（用逗号分隔）
- 是否立即发布

### 方法2：使用模板文件

1. 复制模板文件：
   ```bash
   cp content/blog/_template.mdx content/blog/你的文章名.mdx
   ```

2. 编辑新文件，修改前置元数据和内容

3. 将 `published: false` 改为 `published: true`

### 方法3：手动创建

在 `content/blog/` 目录下创建新的 `.mdx` 文件。

## 📋 文章格式规范

### 前置元数据（Front Matter）

每篇文章都必须包含以下前置元数据：

```yaml
---
title: "文章标题"                    # 必需
description: "文章描述"              # 必需，用于SEO和预览
date: "2025-07-08"                  # 必需，格式：YYYY-MM-DD
author: "作者名"                     # 可选，默认：站长
tags: ["标签1", "标签2"]            # 可选，用于分类和搜索
published: true                     # 必需，false=草稿，true=发布
---
```

### 文件命名规范

- 使用小写字母和连字符
- 避免特殊字符和空格
- 示例：`my-first-post.mdx`、`react-hooks-guide.mdx`

### 内容结构建议

```markdown
# 文章标题

简要介绍...

## 主要章节

### 子章节

内容...

## 结论

总结...
```

## 🎨 支持的Markdown功能

### 1. 代码块

支持语法高亮的代码块：

````markdown
```javascript
function hello() {
  console.log("Hello World!");
}
```
````

支持的语言：
- JavaScript/TypeScript
- Python
- CSS/SCSS
- HTML
- JSON
- Bash/Shell
- SQL
- 等等...

### 2. 行内代码

使用反引号包围：`const variable = "value"`

### 3. 图片

```markdown
![图片描述](/images/blog/your-image.jpg)
```

图片应放在 `public/images/blog/` 目录下。

### 4. 链接

```markdown
[链接文字](https://example.com)
[内部链接](/blog/another-post)
```

### 5. 列表

无序列表：
```markdown
- 项目1
- 项目2
- 项目3
```

有序列表：
```markdown
1. 第一步
2. 第二步
3. 第三步
```

任务列表：
```markdown
- [x] 已完成
- [ ] 待办事项
```

### 6. 表格

```markdown
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 数据1 | 数据2 | 数据3 |
```

### 7. 引用

```markdown
> 这是一个引用块
> 可以跨多行
```

### 8. 分隔线

```markdown
---
```

## 📁 目录结构

```
personal-website/
├── content/
│   └── blog/
│       ├── _template.mdx          # 文章模板
│       ├── my-first-post.mdx      # 示例文章
│       └── your-new-post.mdx      # 你的新文章
├── public/
│   └── images/
│       └── blog/                  # 博客图片目录
│           └── your-image.jpg
└── scripts/
    └── new-post.js                # 新建文章脚本
```

## 🔧 高级功能

### 1. 草稿功能

设置 `published: false` 可以将文章保存为草稿，不会在网站上显示。

### 2. 标签系统

使用标签来分类文章：
```yaml
tags: ["React", "JavaScript", "前端开发", "教程"]
```

### 3. 相关文章推荐

系统会自动根据标签推荐相关文章。

### 4. 阅读时间估算

系统会自动计算文章的预计阅读时间。

### 5. SEO优化

- 自动生成meta标签
- 支持Open Graph
- 生成sitemap.xml
- 支持RSS订阅

## 🛠️ 本地开发

### 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000/blog` 查看博客列表。

### 预览新文章

1. 确保 `published: true`
2. 保存文件
3. 刷新浏览器页面

## 📖 最佳实践

### 1. 写作建议

- 使用清晰的标题结构
- 添加适当的代码示例
- 包含图片来增强可读性
- 使用列表来组织信息

### 2. SEO优化

- 编写有意义的标题和描述
- 使用相关的标签
- 包含内部链接
- 优化图片alt文本

### 3. 内容组织

- 使用一致的文章结构
- 添加目录（对于长文章）
- 包含总结或结论
- 添加相关资源链接

## 🐛 常见问题

### Q: 为什么我的文章没有显示？

A: 检查以下几点：
- 确保 `published: true`
- 检查前置元数据格式是否正确
- 确保文件扩展名是 `.mdx`
- 检查控制台是否有错误信息

### Q: 如何修改现有文章？

A: 直接编辑 `content/blog/` 目录下的对应 `.mdx` 文件即可。

### Q: 如何删除文章？

A: 删除对应的 `.mdx` 文件，或设置 `published: false`。

### Q: 如何修改文章URL？

A: 重命名文件名即可，文件名会作为URL的slug。

## 🆘 获取帮助

如果遇到问题，请：
1. 查看浏览器控制台错误信息
2. 检查终端的错误输出
3. 参考现有文章的格式
4. 查看这个指南的相关章节

---

享受写作的乐趣！✨ 