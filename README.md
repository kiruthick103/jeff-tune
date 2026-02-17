# Jeff Tune-1 Pro

Production-ready AI chatbot with a ChatGPT-like interface and OpenRouter multi-model support. Runs in VS Code, Cursor, or any Node.js environment.

## Folder structure

```
jeff-tune-1-pro/
├── server.js           # Express server entry
├── package.json
├── .env.example
├── .env                # Create this; add your API key
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── routes/
│   └── chat.js         # POST /api/chat, GET /api/models
├── services/
│   └── openrouter.js   # OpenRouter client, smart routing, retry
└── utils/
    ├── cache.js        # Response cache for repeated prompts
    └── middleware.js   # Request validation and sanitization
```

## Installation

1. **Clone or copy** the project into a folder (e.g. `jeff-tune-1-pro`).

2. **Install dependencies:**

   ```bash
   cd jeff-tune-1-pro
   npm install
   ```

3. **Add your OpenRouter API key:**
   - Copy `.env.example` to `.env` in the project root.
   - Get an API key from [OpenRouter](https://openrouter.ai/keys).
   - In `.env`, set:
     ```
     OPENROUTER_API_KEY=your_actual_key_here
     ```
   - Do not commit `.env` or share the key. The server reads it; the key is never sent to the frontend.

4. **Start the app:**

   ```bash
   npm start
   ```

5. **Open in browser:**  
   [http://localhost:3000](http://localhost:3000)

## Commands

| Command        | Description                    |
|----------------|--------------------------------|
| `npm install`  | Install dependencies           |
| `npm start`    | Run server (default port 3000) |

Optional: set `PORT=3000` in `.env` to change the port.

## Features

- **UI:** Sidebar (new chat, history, model selector, settings placeholder), main chat area, sticky input, scrollable messages, typing indicator, markdown and code blocks, copy button.
- **Backend:** `POST /api/chat` proxies to OpenRouter; API key from `.env` only; rate limiting, timeout, validation, basic caching.
- **Smart routing:** “code/programming” → coding model; “write/story” → creative model; else → general model. Fallback and retries on failure.

## Deployment (Render)

1. **New Web Service** in [Render](https://render.com); connect your Git repo (or push this folder to a repo).

2. **Build & run:**
   - **Build command:** `npm install`
   - **Start command:** `npm start`

3. **Environment:** In Render dashboard → Environment, add:
   - `OPENROUTER_API_KEY` = your OpenRouter API key  
   - Optionally `PORT` (Render usually sets this automatically).

4. **Deploy.** The app will be available at `https://your-service-name.onrender.com`.

No placeholders; all code is complete and ready to run after adding your API key.
