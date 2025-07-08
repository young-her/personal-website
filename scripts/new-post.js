#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 创建readline接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 提示函数
function ask(question, defaultValue = '') {
  return new Promise((resolve) => {
    const prompt = defaultValue ? `${question} (${defaultValue}): ` : `${question}: `;
    rl.question(prompt, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

// 生成URL友好的slug
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // 移除特殊字符
    .replace(/[\s_-]+/g, '-') // 将空格和下划线替换为连字符
    .replace(/^-+|-+$/g, ''); // 移除首尾的连字符
}

// 格式化日期为YYYY-MM-DD
function formatDate(date = new Date()) {
  return date.toISOString().split('T')[0];
}

// 生成文章模板
function generatePostTemplate(metadata) {
  return `---
title: "${metadata.title}"
description: "${metadata.description}"
date: "${metadata.date}"
author: "${metadata.author}"
tags: [${metadata.tags.map(tag => `"${tag}"`).join(', ')}]
published: ${metadata.published}
---

# ${metadata.title}

${metadata.description}

## 介绍

在这里开始写你的文章内容...

## 主要内容

### 小节标题

写下你的想法和见解。

\`\`\`javascript
// 示例代码
function example() {
  console.log("Hello, World!");
}
\`\`\`

### 另一个小节

继续你的内容...

## 结论

总结你的文章要点。

---

*感谢阅读！如果你觉得这篇文章有帮助，请分享给其他人。*
`;
}

// 主函数
async function createNewPost() {
  console.log('🚀 创建新的博客文章\n');

  try {
    // 收集文章信息
    const title = await ask('文章标题');
    if (!title) {
      console.log('❌ 标题不能为空');
      process.exit(1);
    }

    const description = await ask('文章描述');
    if (!description) {
      console.log('❌ 描述不能为空');
      process.exit(1);
    }

    const author = await ask('作者', '站长');
    const date = await ask('发布日期 (YYYY-MM-DD)', formatDate());
    const tagsInput = await ask('标签 (用逗号分隔)', 'React,JavaScript');
    const published = await ask('是否发布 (y/n)', 'y');

    // 处理数据
    const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
    const slug = generateSlug(title);
    const isPublished = published.toLowerCase() === 'y' || published.toLowerCase() === 'yes';

    const metadata = {
      title,
      description,
      author,
      date,
      tags,
      published: isPublished
    };

    // 生成文件路径
    const contentDir = path.join(process.cwd(), 'content', 'blog');
    const filePath = path.join(contentDir, `${slug}.mdx`);

    // 检查文件是否已存在
    if (fs.existsSync(filePath)) {
      const overwrite = await ask(`文件 ${slug}.mdx 已存在，是否覆盖？ (y/n)`, 'n');
      if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
        console.log('❌ 操作已取消');
        process.exit(1);
      }
    }

    // 确保目录存在
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
    }

    // 生成并写入文件
    const content = generatePostTemplate(metadata);
    fs.writeFileSync(filePath, content, 'utf8');

    console.log('\n✅ 文章创建成功！');
    console.log(`📄 文件位置: ${filePath}`);
    console.log(`🔗 URL: /blog/${slug}`);
    console.log(`📝 你可以现在开始编辑 ${slug}.mdx 文件`);

    // 提供便捷的编辑命令
    console.log('\n💡 快速编辑命令:');
    console.log(`   code content/blog/${slug}.mdx`);
    console.log(`   vim content/blog/${slug}.mdx`);

  } catch (error) {
    console.error('❌ 创建文章时出错:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  createNewPost();
}

module.exports = { createNewPost, generateSlug, formatDate }; 