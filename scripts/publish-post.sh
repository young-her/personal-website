#!/bin/bash

# 一键发布博客文章脚本
# Usage: ./scripts/publish-post.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📝 博客和数据一键发布助手${NC}"
echo -e "${BLUE}=====================================${NC}"

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 请在项目根目录运行此脚本${NC}"
    exit 1
fi

# 询问用户想要的操作
echo -e "${YELLOW}请选择操作：${NC}"
echo "1. 📝 创建新文章"
echo "2. ✏️  编辑现有文章"
echo "3. 🛠️  编辑工具数据"
echo "4. 🚀 发布内容到线上"
echo "5. 👀 本地预览网站"

read -p "请输入选项 (1-5): " choice

case $choice in
    1)
        echo -e "${GREEN}📝 创建新文章...${NC}"
        npm run new-post
        
        # 询问是否立即编辑
        read -p "是否现在开始编辑? (y/n): " edit_now
        if [ "$edit_now" = "y" ] || [ "$edit_now" = "Y" ]; then
            # 获取最新创建的文章
            LATEST_FILE=$(ls -t content/blog/*.mdx | head -1)
            echo -e "${GREEN}正在打开编辑器...${NC}"
            code "$LATEST_FILE"
        fi
        ;;
    2)
        echo -e "${GREEN}✏️  选择要编辑的文章...${NC}"
        echo -e "${YELLOW}现有文章：${NC}"
        
        # 列出所有文章
        i=1
        for file in content/blog/*.mdx; do
            if [ "$file" != "content/blog/_template.mdx" ]; then
                filename=$(basename "$file" .mdx)
                echo "$i. $filename"
                files[$i]="$file"
                i=$((i+1))
            fi
        done
        
        read -p "请选择文章编号: " file_choice
        selected_file="${files[$file_choice]}"
        
        if [ -n "$selected_file" ]; then
            echo -e "${GREEN}正在打开编辑器...${NC}"
            code "$selected_file"
        else
            echo -e "${RED}❌ 无效选择${NC}"
            exit 1
        fi
        ;;
    3)
        echo -e "${GREEN}🛠️  编辑数据文件...${NC}"
        echo -e "${YELLOW}可编辑的数据文件：${NC}"
        echo "1. tools.json - 工具导航数据"
        echo "2. 其他数据文件"
        
        read -p "请选择数据文件 (1-2): " data_choice
        
        case $data_choice in
            1)
                echo -e "${GREEN}正在打开工具数据编辑器...${NC}"
                code "data/tools.json"
                echo -e "${BLUE}💡 提示：修改工具数据后保存即可，自动同步功能会检测到更改${NC}"
                ;;
            2)
                echo -e "${GREEN}选择其他数据文件...${NC}"
                if [ -d "data" ]; then
                    echo -e "${YELLOW}data目录下的文件：${NC}"
                    ls -la data/
                    read -p "请输入要编辑的文件名: " filename
                    if [ -f "data/$filename" ]; then
                        code "data/$filename"
                    else
                        echo -e "${RED}❌ 文件不存在${NC}"
                    fi
                else
                    echo -e "${RED}❌ data目录不存在${NC}"
                fi
                ;;
            *)
                echo -e "${RED}❌ 无效选择${NC}"
                exit 1
                ;;
        esac
        ;;
    4)
        echo -e "${GREEN}🚀 准备发布到线上...${NC}"
        
        # 检查是否有未提交的更改
        if ! git diff-index --quiet HEAD --; then
            echo -e "${YELLOW}📋 检测到未提交的更改：${NC}"
            git status --porcelain
            echo ""
            
            read -p "请输入提交信息: " commit_msg
            if [ -z "$commit_msg" ]; then
                commit_msg="更新博客和数据"
            fi
            
            echo -e "${YELLOW}📤 提交更改...${NC}"
            git add .
            git commit -m "$commit_msg"
            
            echo -e "${YELLOW}🔄 推送到远程仓库...${NC}"
            git push origin main
            
            echo -e "${GREEN}✅ 发布完成！${NC}"
            echo -e "${GREEN}🌐 Vercel 将在 2-3 分钟内自动部署${NC}"
            echo -e "${GREEN}📱 部署状态：https://vercel.com/dashboard${NC}"
        else
            echo -e "${YELLOW}⚠️  没有检测到更改，无需发布${NC}"
        fi
        ;;
    5)
        echo -e "${GREEN}👀 启动本地预览服务器...${NC}"
        echo -e "${GREEN}🌐 访问 http://localhost:3000${NC}"
        echo -e "${GREEN}📝 博客页面：http://localhost:3000/blog${NC}"
        echo -e "${GREEN}🛠️  工具页面：http://localhost:3000/tools${NC}"
        npm run dev
        ;;
    *)
        echo -e "${RED}❌ 无效选项${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}📚 提示：${NC}"
echo -e "${BLUE}• 本地预览：npm run dev${NC}"
echo -e "${BLUE}• 新建文章：npm run new-post${NC}"
echo -e "${BLUE}• 一键发布：./scripts/publish-post.sh${NC}"
echo -e "${BLUE}• 自动同步：npm run blog:auto-sync${NC}"
echo -e "${BLUE}• 部署状态：vercel ls${NC}" 