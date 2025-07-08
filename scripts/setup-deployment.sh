#!/bin/bash

# Interactive deployment setup script
# This script helps configure GitHub repository and Vercel deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}     🚀 Personal Website Deployment Setup${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo ""
}

print_step() {
    echo -e "${PURPLE}📌 Step $1: $2${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

ask_question() {
    local question="$1"
    local default="$2"
    local var_name="$3"
    
    if [ -n "$default" ]; then
        echo -e "${YELLOW}$question (default: $default):${NC}"
    else
        echo -e "${YELLOW}$question:${NC}"
    fi
    
    read -r input
    if [ -z "$input" ] && [ -n "$default" ]; then
        eval "$var_name='$default'"
    else
        eval "$var_name='$input'"
    fi
}

check_prerequisites() {
    print_step "1" "Checking Prerequisites"
    
    # Check Git
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    print_success "Git is installed"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js (v18+) first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version is too old. Please install Node.js v18 or newer."
        exit 1
    fi
    print_success "Node.js v$(node --version) is installed"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed."
        exit 1
    fi
    print_success "npm is installed"
    
    echo ""
}

setup_git_repository() {
    print_step "2" "Git Repository Setup"
    
    # Check if already in a git repository
    if [ -d ".git" ]; then
        print_warning "Git repository already exists."
        
        # Check if remote origin exists
        if git remote get-url origin &> /dev/null; then
            CURRENT_REMOTE=$(git remote get-url origin)
            print_warning "Remote origin already exists: $CURRENT_REMOTE"
            
            ask_question "Do you want to keep this remote? (y/n)" "y" "KEEP_REMOTE"
            if [ "$KEEP_REMOTE" != "y" ]; then
                git remote remove origin
                print_success "Removed existing remote origin"
            else
                print_success "Keeping existing remote origin"
                return
            fi
        fi
    else
        print_warning "Initializing Git repository..."
        git init
        print_success "Git repository initialized"
    fi
    
    # Get GitHub repository URL
    echo -e "${YELLOW}Please create a GitHub repository first and get the repository URL.${NC}"
    echo -e "${YELLOW}Example: https://github.com/username/personal-website.git${NC}"
    echo ""
    
    ask_question "Enter your GitHub repository URL" "" "GITHUB_URL"
    
    if [ -z "$GITHUB_URL" ]; then
        print_error "GitHub repository URL is required."
        exit 1
    fi
    
    # Add remote origin
    git remote add origin "$GITHUB_URL"
    print_success "Added remote origin: $GITHUB_URL"
    
    echo ""
}

prepare_commit() {
    print_step "3" "Preparing Initial Commit"
    
    # Add all files
    git add .
    
    # Check if there are changes to commit
    if git diff --cached --quiet; then
        print_warning "No changes to commit."
    else
        git commit -m "Initial commit: Personal website with Next.js 15

- Complete personal website with blog and tools
- macOS-style code blocks
- Responsive design with dark/light theme
- SEO optimized with sitemap and RSS
- Security headers and XSS protection
- Comprehensive testing setup (Jest + Playwright)
- CI/CD pipeline with GitHub Actions
- Ready for Vercel deployment"
        
        print_success "Created initial commit"
    fi
    
    echo ""
}

install_vercel_cli() {
    print_step "4" "Vercel CLI Setup"
    
    # Check if Vercel CLI is installed
    if command -v vercel &> /dev/null; then
        print_success "Vercel CLI is already installed"
    else
        print_warning "Installing Vercel CLI..."
        npm install -g vercel
        print_success "Vercel CLI installed"
    fi
    
    echo ""
}

deploy_to_vercel() {
    print_step "5" "Deploying to Vercel"
    
    echo -e "${YELLOW}You need to login to Vercel first.${NC}"
    echo -e "${YELLOW}This will open a browser window for authentication.${NC}"
    echo ""
    
    ask_question "Ready to login to Vercel? (y/n)" "y" "LOGIN_READY"
    
    if [ "$LOGIN_READY" = "y" ]; then
        vercel login
        print_success "Logged in to Vercel"
    else
        print_error "Vercel login cancelled."
        exit 1
    fi
    
    echo ""
    echo -e "${YELLOW}Now we'll deploy your website to Vercel...${NC}"
    echo ""
    
    # Deploy to Vercel
    vercel --prod
    
    print_success "Deployment completed!"
    echo ""
}

push_to_github() {
    print_step "6" "Pushing to GitHub"
    
    echo -e "${YELLOW}Pushing your code to GitHub...${NC}"
    
    # Push to GitHub
    git push -u origin main
    
    print_success "Code pushed to GitHub"
    echo ""
}

setup_github_secrets() {
    print_step "7" "GitHub Secrets Configuration"
    
    echo -e "${YELLOW}To enable automatic deployments, you need to add secrets to your GitHub repository.${NC}"
    echo ""
    echo -e "${YELLOW}1. Go to your GitHub repository${NC}"
    echo -e "${YELLOW}2. Click Settings → Secrets and variables → Actions${NC}"
    echo -e "${YELLOW}3. Add the following secrets:${NC}"
    echo ""
    
    # Get Vercel project info
    if [ -f ".vercel/project.json" ]; then
        ORG_ID=$(cat .vercel/project.json | grep -o '"orgId":"[^"]*' | cut -d'"' -f4)
        PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*' | cut -d'"' -f4)
        
        echo -e "${GREEN}VERCEL_ORG_ID: $ORG_ID${NC}"
        echo -e "${GREEN}VERCEL_PROJECT_ID: $PROJECT_ID${NC}"
    else
        echo -e "${RED}Could not find Vercel project information.${NC}"
        echo -e "${YELLOW}Please run 'vercel link' first and then check .vercel/project.json${NC}"
    fi
    
    echo ""
    echo -e "${YELLOW}You also need to create a Vercel token:${NC}"
    echo -e "${YELLOW}1. Go to https://vercel.com/account/tokens${NC}"
    echo -e "${YELLOW}2. Create a new token${NC}"
    echo -e "${YELLOW}3. Add it as VERCEL_TOKEN secret in GitHub${NC}"
    echo ""
    
    ask_question "Press Enter when you've added all the secrets..." "" "SECRETS_DONE"
    
    print_success "GitHub secrets configuration completed"
    echo ""
}

show_completion_info() {
    print_step "8" "Deployment Complete!"
    
    echo -e "${GREEN}🎉 Your personal website has been successfully deployed!${NC}"
    echo ""
    echo -e "${BLUE}What's been set up:${NC}"
    echo -e "✅ Git repository initialized and pushed to GitHub"
    echo -e "✅ Project deployed to Vercel"
    echo -e "✅ CI/CD pipeline configured"
    echo -e "✅ Automatic deployments on push to main branch"
    echo ""
    
    if [ -f ".vercel/project.json" ]; then
        echo -e "${BLUE}Your website URLs:${NC}"
        echo -e "🌐 Production: Check your Vercel dashboard"
        echo -e "📱 Vercel Dashboard: https://vercel.com/dashboard"
    fi
    
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo -e "1. 📝 Create new blog posts: ${GREEN}npm run new-post${NC}"
    echo -e "2. 🔧 Customize tools in: ${GREEN}data/tools.json${NC}"
    echo -e "3. 🎨 Update styling and content as needed"
    echo -e "4. 🚀 Push changes to auto-deploy: ${GREEN}git push origin main${NC}"
    echo ""
    
    echo -e "${BLUE}Useful commands:${NC}"
    echo -e "• ${GREEN}npm run dev${NC} - Start development server"
    echo -e "• ${GREEN}npm run build${NC} - Build for production"
    echo -e "• ${GREEN}npm run test${NC} - Run tests"
    echo -e "• ${GREEN}vercel --prod${NC} - Manual deployment"
    echo ""
    
    echo -e "${PURPLE}Documentation:${NC}"
    echo -e "• 📚 Deployment Guide: DEPLOYMENT_GUIDE.md"
    echo -e "• ✍️  Blog Guide: BLOG_GUIDE.md"
    echo ""
}

# Main execution flow
main() {
    print_header
    
    echo -e "${YELLOW}This script will help you deploy your personal website to Vercel with automatic CI/CD.${NC}"
    echo ""
    
    ask_question "Ready to start the deployment setup? (y/n)" "y" "START_SETUP"
    
    if [ "$START_SETUP" != "y" ]; then
        echo -e "${YELLOW}Setup cancelled.${NC}"
        exit 0
    fi
    
    echo ""
    
    check_prerequisites
    setup_git_repository
    prepare_commit
    install_vercel_cli
    deploy_to_vercel
    push_to_github
    setup_github_secrets
    show_completion_info
    
    echo -e "${GREEN}🚀 Deployment setup completed successfully!${NC}"
}

# Handle script interruption
trap 'echo -e "${RED}❌ Setup interrupted${NC}"; exit 1' INT TERM

# Run main function
main "$@" 