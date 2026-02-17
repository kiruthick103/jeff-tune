# Jeff Tune-1 Pro

Production-ready AI chatbot with glass UI, OpenRouter multi-model support, PostgreSQL chat persistence, and Docker.

## Features

- **Glass UI:** Glass panels, no solid backgrounds, backdrop blur
- **Chat persistence:** PostgreSQL stores sessions and messages
- **Docker:** Run with `docker-compose up`

## Quick start (Docker)

```bash
cd jeff-tune-1-pro
# Add your key to .env: OPENROUTER_API_KEY=sk-or-v1-...
docker-compose up -d
# Open http://localhost:3000
```

## Local run (without Docker)

1. **PostgreSQL** running on localhost:5432, database `jeff_chat`, user `postgres` / password `postgres`

2. **Install and configure:**
   ```bash
   npm install
   cp .env.example .env
   # Edit .env: OPENROUTER_API_KEY, DATABASE_URL
   ```

3. **Start:**
   ```bash
   npm start
   ```
   Open http://localhost:3000

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| OPENROUTER_API_KEY | Yes | From [openrouter.ai/keys](https://openrouter.ai/keys) |
| DATABASE_URL | Yes | `postgresql://user:pass@host:5432/jeff_chat` |
| PORT | No | Default 3000 |

## Docker

- **docker-compose up** – Starts app + PostgreSQL, creates schema
- **docker-compose down** – Stops services (data kept in `pgdata` volume)
