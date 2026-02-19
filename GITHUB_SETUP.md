# GitHub Repository Setup

## Step 1: Create GitHub Repository

1. **Go to GitHub**: https://github.com/new
2. **Repository name**: `jeff-tune-1-pro`
3. **Description**: `Monochromatic AI chatbot with OpenRouter integration`
4. **Visibility**: Public ☑️
5. **Don't initialize** with README, .gitignore, or license (we already have these)
6. Click **"Create repository"**

## Step 2: Connect Local Repository

After creating the repository on GitHub, run these commands:

```bash
# Replace YOUR_USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/jeff-tune-1-pro.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Netlify

### Option A: Quick Deploy (Recommended)
1. Go to [netlify.com](https://netlify.com)
2. Sign up/login with GitHub
3. Click "Add new site" → "Import an existing project"
4. Select GitHub → Choose `jeff-tune-1-pro` repository
5. Build settings:
   - **Build command**: `npm install`
   - **Publish directory**: `public`
   - **Functions directory**: `netlify/functions`
6. Click "Deploy site"

### Option B: Manual Deploy
1. Drag and drop the entire project folder to [app.netlify.com/drop](https://app.netlify.com/drop)

## Step 4: Configure Environment Variables

In your Netlify site dashboard:
1. Go to **Site settings** → **Environment variables**
2. Add:
   - **OPENROUTER_API_KEY**: Get from [openrouter.ai/keys](https://openrouter.ai/keys)
   - **DATABASE_URL**: Optional (for chat persistence)

## Step 5: Test Your Live Site

Your AI chatbot will be live at: `https://your-site-name.netlify.app`

## What's Included

✅ **Monochromatic Theme**: Clean black & white design
✅ **AI Integration**: OpenRouter API with multiple models
✅ **Serverless Functions**: Netlify Functions for backend
✅ **Chat Persistence**: Database support (optional)
✅ **Responsive Design**: Works on all devices
✅ **Rate Limiting**: 30 requests per minute
✅ **Markdown Support**: Rich text rendering

## Repository Ready

Your local repository is ready with:
- All code committed to Git
- Netlify configuration files
- Deployment guides
- Monochromatic theme applied

Just create the GitHub repository and push!
