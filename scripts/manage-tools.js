#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 创建readline接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 工具数据文件路径
const TOOLS_FILE = path.join(process.cwd(), 'data/tools.json');

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

// 提示函数
function ask(question, defaultValue = '') {
  return new Promise((resolve) => {
    const prompt = defaultValue ? `${question} (${defaultValue}): ` : `${question}: `;
    rl.question(prompt, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

// 读取工具数据
function loadToolsData() {
  try {
    if (!fs.existsSync(TOOLS_FILE)) {
      log('red', '❌ 工具数据文件不存在');
      process.exit(1);
    }
    const data = fs.readFileSync(TOOLS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    log('red', `❌ 读取工具数据失败: ${error.message}`);
    process.exit(1);
  }
}

// 保存工具数据
function saveToolsData(data) {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(TOOLS_FILE, jsonString, 'utf8');
    log('green', '✅ 工具数据已保存');
  } catch (error) {
    log('red', `❌ 保存工具数据失败: ${error.message}`);
    process.exit(1);
  }
}

// 生成URL友好的ID
function generateId(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // 移除特殊字符
    .replace(/[\s_-]+/g, '-') // 将空格和下划线替换为连字符
    .replace(/^-+|-+$/g, ''); // 移除首尾的连字符
}

// 显示所有工具
function displayTools(toolsData) {
  log('cyan', '\n📋 当前工具列表：');
  toolsData.tools.forEach((tool, index) => {
    const featured = tool.featured ? '⭐' : '  ';
    const category = toolsData.categories.find(cat => cat.id === tool.category);
    const categoryName = category ? category.name : tool.category;
    console.log(`${featured} ${index + 1}. ${tool.name} (${categoryName}) - ${tool.description}`);
  });
}

// 显示所有分类
function displayCategories(toolsData) {
  log('cyan', '\n📂 当前分类列表：');
  toolsData.categories.forEach((category, index) => {
    console.log(`  ${index + 1}. ${category.name} (${category.id}) - ${category.description}`);
  });
}

// 添加新工具
async function addTool(toolsData) {
  log('green', '\n📝 添加新工具');
  
  const name = await ask('工具名称');
  if (!name) {
    log('red', '❌ 工具名称不能为空');
    return;
  }

  const description = await ask('工具描述');
  if (!description) {
    log('red', '❌ 工具描述不能为空');
    return;
  }

  const url = await ask('工具URL');
  if (!url) {
    log('red', '❌ 工具URL不能为空');
    return;
  }

  // 显示可用分类
  displayCategories(toolsData);
  const categoryId = await ask('分类ID（从上述列表选择）');
  
  // 验证分类是否存在
  const categoryExists = toolsData.categories.some(cat => cat.id === categoryId);
  if (!categoryExists) {
    log('red', '❌ 分类不存在');
    return;
  }

  const tagsInput = await ask('标签（用逗号分隔）', '');
  const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

  const featuredInput = await ask('是否为推荐工具 (y/n)', 'n');
  const featured = featuredInput.toLowerCase() === 'y';

  const id = generateId(name);

  // 检查ID是否已存在
  const idExists = toolsData.tools.some(tool => tool.id === id);
  if (idExists) {
    log('red', `❌ 工具ID "${id}" 已存在`);
    return;
  }

  // 创建新工具
  const newTool = {
    id,
    name,
    description,
    url,
    category: categoryId,
    tags,
    featured
  };

  toolsData.tools.push(newTool);
  saveToolsData(toolsData);

  log('green', `✅ 工具 "${name}" 已添加`);
  log('cyan', `🔗 ID: ${id}`);
  log('cyan', `🌐 URL: ${url}`);
}

// 编辑工具
async function editTool(toolsData) {
  displayTools(toolsData);
  
  const indexInput = await ask('\n请输入要编辑的工具编号');
  const index = parseInt(indexInput) - 1;
  
  if (index < 0 || index >= toolsData.tools.length) {
    log('red', '❌ 无效的工具编号');
    return;
  }

  const tool = toolsData.tools[index];
  log('yellow', `\n✏️  编辑工具: ${tool.name}`);

  const name = await ask('工具名称', tool.name);
  const description = await ask('工具描述', tool.description);
  const url = await ask('工具URL', tool.url);
  
  displayCategories(toolsData);
  const categoryId = await ask('分类ID', tool.category);
  
  const tagsInput = await ask('标签（用逗号分隔）', tool.tags.join(', '));
  const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
  
  const featuredInput = await ask('是否为推荐工具 (y/n)', tool.featured ? 'y' : 'n');
  const featured = featuredInput.toLowerCase() === 'y';

  // 更新工具
  tool.name = name;
  tool.description = description;
  tool.url = url;
  tool.category = categoryId;
  tool.tags = tags;
  tool.featured = featured;

  saveToolsData(toolsData);
  log('green', `✅ 工具 "${name}" 已更新`);
}

// 删除工具
async function deleteTool(toolsData) {
  displayTools(toolsData);
  
  const indexInput = await ask('\n请输入要删除的工具编号');
  const index = parseInt(indexInput) - 1;
  
  if (index < 0 || index >= toolsData.tools.length) {
    log('red', '❌ 无效的工具编号');
    return;
  }

  const tool = toolsData.tools[index];
  const confirm = await ask(`确认删除工具 "${tool.name}"? (y/n)`, 'n');
  
  if (confirm.toLowerCase() === 'y') {
    toolsData.tools.splice(index, 1);
    saveToolsData(toolsData);
    log('green', `✅ 工具 "${tool.name}" 已删除`);
  } else {
    log('yellow', '❌ 操作已取消');
  }
}

// 添加新分类
async function addCategory(toolsData) {
  log('green', '\n📂 添加新分类');
  
  const name = await ask('分类名称');
  if (!name) {
    log('red', '❌ 分类名称不能为空');
    return;
  }

  const description = await ask('分类描述');
  if (!description) {
    log('red', '❌ 分类描述不能为空');
    return;
  }

  const icon = await ask('分类图标（Lucide React图标名）', 'Folder');
  const id = generateId(name);

  // 检查ID是否已存在
  const idExists = toolsData.categories.some(cat => cat.id === id);
  if (idExists) {
    log('red', `❌ 分类ID "${id}" 已存在`);
    return;
  }

  // 创建新分类
  const newCategory = {
    id,
    name,
    description,
    icon
  };

  toolsData.categories.push(newCategory);
  saveToolsData(toolsData);

  log('green', `✅ 分类 "${name}" 已添加`);
  log('cyan', `🔗 ID: ${id}`);
}

// 主菜单
async function showMenu() {
  const toolsData = loadToolsData();
  
  log('blue', '\n🛠️  工具数据管理器');
  log('blue', '==================');
  
  while (true) {
    console.log('\n请选择操作：');
    console.log('1. 📋 查看所有工具');
    console.log('2. ➕ 添加新工具');
    console.log('3. ✏️  编辑工具');
    console.log('4. 🗑️  删除工具');
    console.log('5. 📂 查看所有分类');
    console.log('6. ➕ 添加新分类');
    console.log('7. 📄 直接编辑JSON文件');
    console.log('0. 🚪 退出');

    const choice = await ask('\n请输入选项 (0-7)');

    switch (choice) {
      case '1':
        displayTools(toolsData);
        break;
      case '2':
        await addTool(toolsData);
        break;
      case '3':
        await editTool(toolsData);
        break;
      case '4':
        await deleteTool(toolsData);
        break;
      case '5':
        displayCategories(toolsData);
        break;
      case '6':
        await addCategory(toolsData);
        break;
      case '7':
        log('green', '📄 正在打开JSON编辑器...');
        require('child_process').exec(`code "${TOOLS_FILE}"`);
        log('blue', '💡 提示：直接编辑JSON文件后，保存即可生效');
        break;
      case '0':
        log('green', '👋 再见！');
        rl.close();
        return;
      default:
        log('red', '❌ 无效选项');
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  showMenu().catch(error => {
    log('red', `❌ 发生错误: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { loadToolsData, saveToolsData, generateId }; 