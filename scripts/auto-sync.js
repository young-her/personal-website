#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const chokidar = require('chokidar');

// 配置
const BLOG_DIR = path.join(process.cwd(), 'content/blog');
const DATA_DIR = path.join(process.cwd(), 'data'); // 新增：数据目录
const DEBOUNCE_DELAY = 5000; // 5秒防抖
const EXCLUDE_FILES = ['_template.mdx'];

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 获取Git状态
function getGitStatus() {
  return new Promise((resolve, reject) => {
    exec('git status --porcelain', (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout.trim());
    });
  });
}

// 提交并推送更改
function syncChanges(changedFiles) {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toLocaleString('zh-CN');
    
    // 分类文件类型
    const blogFiles = changedFiles.filter(f => f.includes('/content/blog/'));
    const dataFiles = changedFiles.filter(f => f.includes('/data/'));
    
    let changeDescription = '';
    const fileTypes = [];
    
    if (blogFiles.length > 0) {
      const blogFileNames = blogFiles.map(f => path.basename(f)).join(', ');
      fileTypes.push(`博客文章 (${blogFileNames})`);
    }
    
    if (dataFiles.length > 0) {
      const dataFileNames = dataFiles.map(f => path.basename(f)).join(', ');
      fileTypes.push(`数据文件 (${dataFileNames})`);
    }
    
    changeDescription = fileTypes.join(' + ');
    const commitMessage = `auto-sync: 更新${changeDescription} - ${timestamp}`;

    log('yellow', '📤 正在同步更改到远程仓库...');
    
    exec(`git add . && git commit -m "${commitMessage}" && git push origin main`, (error, stdout, stderr) => {
      if (error) {
        log('red', `❌ 同步失败: ${error.message}`);
        reject(error);
        return;
      }
      
      log('green', '✅ 同步成功！');
      log('cyan', `📝 提交信息: ${commitMessage}`);
      log('blue', '🚀 Vercel 将在几分钟内自动部署更新');
      resolve();
    });
  });
}

// 检查文件是否为博客文章
function isBlogPost(filePath) {
  const basename = path.basename(filePath);
  return filePath.includes('/content/blog/') && 
         basename.endsWith('.mdx') && 
         !EXCLUDE_FILES.includes(basename);
}

// 检查文件是否为数据文件
function isDataFile(filePath) {
  return filePath.includes('/data/') && 
         (filePath.endsWith('.json') || filePath.endsWith('.js'));
}

// 防抖功能
let syncTimeout;
let pendingChanges = new Set();

function debouncedSync(filePath) {
  pendingChanges.add(filePath);
  
  clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {
    try {
      const gitStatus = await getGitStatus();
      if (gitStatus) {
        await syncChanges(Array.from(pendingChanges));
      } else {
        log('yellow', '⚠️  没有检测到更改，跳过同步');
      }
    } catch (error) {
      log('red', `❌ 同步过程中出错: ${error.message}`);
    }
    pendingChanges.clear();
  }, DEBOUNCE_DELAY);
}

// 主函数
function startAutoSync() {
  log('blue', '🚀 启动博客和数据自动同步监听器');
  log('blue', `📁 监听博客目录: ${BLOG_DIR}`);
  log('blue', `📊 监听数据目录: ${DATA_DIR}`);
  log('blue', `⏱️  防抖延迟: ${DEBOUNCE_DELAY / 1000}秒`);
  log('blue', '================================');

  // 检查目录是否存在
  if (!fs.existsSync(BLOG_DIR)) {
    log('red', `❌ 博客目录不存在: ${BLOG_DIR}`);
  }
  
  if (!fs.existsSync(DATA_DIR)) {
    log('red', `❌ 数据目录不存在: ${DATA_DIR}`);
  }

  // 创建文件监听器
  const watchPaths = [BLOG_DIR, DATA_DIR].filter(dir => fs.existsSync(dir));
  
  if (watchPaths.length === 0) {
    log('red', '❌ 没有有效的监听目录');
    process.exit(1);
  }

  const watcher = chokidar.watch(watchPaths, {
    ignored: /(^|[\/\\])\../, // 忽略隐藏文件
    persistent: true,
    ignoreInitial: true
  });

  // 监听文件事件
  watcher
    .on('add', filePath => {
      if (isBlogPost(filePath)) {
        log('green', `📝 新增博客文章: ${path.basename(filePath)}`);
        debouncedSync(filePath);
      } else if (isDataFile(filePath)) {
        log('green', `📊 新增数据文件: ${path.basename(filePath)}`);
        debouncedSync(filePath);
      }
    })
    .on('change', filePath => {
      if (isBlogPost(filePath)) {
        log('yellow', `✏️  修改博客文章: ${path.basename(filePath)}`);
        debouncedSync(filePath);
      } else if (isDataFile(filePath)) {
        log('yellow', `🔧 修改数据文件: ${path.basename(filePath)}`);
        debouncedSync(filePath);
      }
    })
    .on('unlink', filePath => {
      if (isBlogPost(filePath)) {
        log('red', `🗑️  删除博客文章: ${path.basename(filePath)}`);
        debouncedSync(filePath);
      } else if (isDataFile(filePath)) {
        log('red', `🗑️  删除数据文件: ${path.basename(filePath)}`);
        debouncedSync(filePath);
      }
    })
    .on('error', error => {
      log('red', `❌ 监听器错误: ${error.message}`);
    });

  log('green', '✅ 自动同步已启动！');
  log('cyan', '💡 提示：');
  log('cyan', '  • 编辑博客 .mdx 文件会自动触发同步');
  log('cyan', '  • 编辑数据 .json 文件（如工具数据）会自动触发同步');
  log('cyan', '  • 同步有 5 秒防抖，避免频繁提交');
  log('cyan', '  • 按 Ctrl+C 停止监听');
  log('cyan', '================================');

  // 优雅退出
  process.on('SIGINT', () => {
    log('yellow', '\n🛑 正在停止自动同步...');
    watcher.close();
    log('green', '✅ 自动同步已停止');
    process.exit(0);
  });
}

// 检查依赖
function checkDependencies() {
  try {
    require('chokidar');
  } catch (error) {
    log('red', '❌ 缺少依赖 chokidar');
    log('yellow', '📦 请运行: npm install --save-dev chokidar');
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  checkDependencies();
  startAutoSync();
}

module.exports = { startAutoSync }; 