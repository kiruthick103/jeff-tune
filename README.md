# Jeff Tune Pro 🤖

A production-ready AI SaaS chatbot built with Next.js 14, OpenRouter, and Vercel.

## Features

- 🤖 **Multi-Model AI Routing** — Auto-routes to GPT-4o, Claude 3.5, or Gemini based on task type
- ⚡ **Streaming Responses** — Real-time streaming via Vercel AI SDK edge functions
- 🕵️ **Agent Mode** — Tool-calling AI agent with calculator, datetime, and extensible tools
- 👨‍💻 **Developer Mode** — Shows model selected, latency, and token usage per message
- 🌙 **Dark / Light Mode** — Smooth theme switching with next-themes
- 🔒 **Secure API** — Server-side key management, Zod validation, rate limiting
- 📱 **Responsive Design** — Works beautifully on mobile and desktop
- 🚀 **Deployed on Vercel** — Edge-optimized API routes for global performance

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **AI SDK**: Vercel AI SDK + OpenRouter
- **UI**: shadcn/ui + Tailwind CSS
- **Auth & DB**: Supabase (optional)
- **Deployment**: Vercel
- **Analytics**: Vercel Analytics

## Getting Started

```bash
# Install dependencies
npm install

# Create .env.local and fill in values
cp .env.local.example .env.local

# Run locally
npm run dev
```

## Environment Variables

```
OPENROUTER_API_KEY=your_openrouter_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url       # optional
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key     # optional
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Deployment

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

## License

MIT
