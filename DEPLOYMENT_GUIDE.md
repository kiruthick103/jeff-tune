# Jeff AI Deployment Guide

## Quick Deployment Steps

### 1. Create GitHub Repository
```bash
# Option A: Manual (Recommended)
# Go to https://github.com/new
# Repository name: jeff-tune-1-pro
# Description: Monochromatic AI chatbot with OpenRouter integration
# Make it Public
# Click "Create repository"

# Option B: Using GitHub CLI (if installed)
gh repo create jeff-tune-1-pro --public --description "Monochromatic AI chatbot with OpenRouter integration"

# Option C: Using curl (requires GitHub token)
curl -X POST -H "Authorization: token YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d '{"name":"jeff-tune-1-pro","description":"Monochromatic AI chatbot with OpenRouter integration","private":false}'
```

### 2. Push to GitHub
```bash
# After creating the repository on GitHub:
git remote add origin https://github.com/YOUR_USERNAME/jeff-tune-1-pro.git
git branch -M main
git push -u origin main
```

### 3. Deploy to Netlify

#### Method A: Netlify Dashboard (Easiest)
1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub
4. Select the `jeff-tune-1-pro` repository
5. Build settings:
   - Build command: `npm install`
   - Publish directory: `public`
   - Functions directory: `netlify/functions`
6. Click "Deploy site"

#### Method B: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
netlify init
netlify deploy --prod
```

### 4. Configure Environment Variables
In Netlify dashboard, add these environment variables:
- `OPENROUTER_API_KEY`: Get from [openrouter.ai/keys](https://openrouter.ai/keys)
- `DATABASE_URL`: Optional PostgreSQL connection string

### 5. Test Your Deployment
Visit your Netlify URL and test the chat functionality!

## Repository Structure
```
jeff-tune-1-pro/
├── public/                 # Frontend files
│   ├── index.html
│   ├── style.css          # Monochromatic theme
│   └── app.js             # Updated for Netlify
├── netlify/
│   └── functions/         # Serverless functions
│       ├── api.js
│       └── chat.js
├── routes/                # API routes
├── services/              # OpenRouter integration
├── utils/                 # Utilities
├── netlify.toml          # Netlify configuration
├── package.json          # Dependencies
└── DEPLOYMENT_GUIDE.md   # This file
```

## Features
✅ Monochromatic black & white theme
✅ OpenRouter AI integration
✅ Serverless functions for Netlify
✅ Chat session persistence (with database)
✅ Responsive design
✅ Rate limiting
✅ Markdown rendering

## Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| OPENROUTER_API_KEY | Yes | OpenRouter API key |
| DATABASE_URL | No | PostgreSQL for chat persistence |

## Support
For issues:
1. Check Netlify function logs
2. Verify environment variables
3. Test API endpoints manually
