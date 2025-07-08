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

echo -e "${BLUE}📝 博客文章一键发布助手${NC}"
echo -e "${BLUE}================================${NC}"

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 请在项目根目录运行此脚本${NC}"
    exit 1
fi

# 询问用户想要的操作
echo -e "${YELLOW}请选择操作：${NC}"
echo "1. 📝 创建新文章"
echo "2. ✏️  编辑现有文章"
echo "3. 🚀 发布文章到线上"
echo "4. 👀 本地预览博客"

read -p "请输入选项 (1-4): " choice

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
        echo -e "${GREEN}🚀 准备发布到线上...${NC}"
        
        # 检查是否有未提交的更改
        if ! git diff-index --quiet HEAD --; then
            echo -e "${YELLOW}📋 检测到未提交的更改：${NC}"
            git status --porcelain
            echo ""
            
            read -p "请输入提交信息: " commit_msg
            if [ -z "$commit_msg" ]; then
                commit_msg="更新博客文章"
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
    4)
        echo -e "${GREEN}👀 启动本地预览服务器...${NC}"
        echo -e "${GREEN}🌐 访问 http://localhost:3000/blog${NC}"
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
echo -e "${BLUE}• 部署状态：vercel ls${NC}" 