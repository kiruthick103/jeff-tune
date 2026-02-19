# Netlify Deployment Guide

## Overview
This guide will help you deploy Jeff Tune-1 Pro AI chatbot to Netlify using serverless functions.

## Prerequisites
- Netlify account (free tier works)
- OpenRouter API key
- Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Configure Environment Variables

### Option A: Netlify Dashboard
1. Go to your Netlify site dashboard
2. Navigate to **Site settings > Environment variables**
3. Add these variables:
   ```
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   DATABASE_URL=postgresql://user:pass@host:5432/jeff_chat
   ```

### Option B: Netlify CLI
```bash
netlify env:set OPENROUTER_API_KEY "your_openrouter_api_key_here"
netlify env:set DATABASE_URL "postgresql://user:pass@host:5432/jeff_chat"
```

## Step 2: Database Setup (Optional)

### For Production:
- Use a managed PostgreSQL service like:
  - Supabase (free tier available)
  - PlanetScale
  - Railway
  - Heroku Postgres

### For Testing (No Persistence):
You can skip DATABASE_URL - chat will work but won't persist between sessions.

## Step 3: Deploy to Netlify

### Method A: Git Integration (Recommended)
1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Netlify
3. Netlify will auto-detect and deploy

### Method B: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

### Method C: Drag & Drop
1. Run `npm run build` (if you have a build step)
2. Drag the entire project folder to Netlify deploy page

## Step 4: Verify Deployment

1. Visit your Netlify URL
2. Test the chat functionality
3. Check browser console for any errors
4. Monitor Netlify function logs

## Configuration Files Created

### `netlify.toml`
- Configures build settings
- Sets up function redirects
- Defines Node.js version

### `netlify/functions/`
- Contains serverless function wrappers
- Maintains existing Express routes

## Troubleshooting

### Common Issues:
1. **Function timeouts**: Increase timeout in netlify.toml
2. **Database connection**: Verify DATABASE_URL format
3. **CORS issues**: Already handled in functions
4. **Missing dependencies**: Check package.json includes all required packages

### Monitoring:
- Check Netlify Functions logs
- Monitor site build logs
- Test API endpoints directly

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| OPENROUTER_API_KEY | Yes | From [openrouter.ai/keys](https://openrouter.ai/keys) |
| DATABASE_URL | No | PostgreSQL connection string (optional) |

## Cost Considerations

- **Netlify**: Free tier includes 100k function invocations/month
- **OpenRouter**: Pay-per-use, various models available
- **Database**: Free tiers available on most providers

## Support

For issues:
1. Check Netlify function logs
2. Verify environment variables
3. Test API endpoints manually
4. Review OpenRouter API documentation
