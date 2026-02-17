# Host Jeff Tune-1 Pro on Render

Your repo is at **https://github.com/kiruthick103/jeff-tune**. Follow these steps to host it.

## 1. Open Render

Go to **[https://dashboard.render.com](https://dashboard.render.com)** and sign in (or create an account). Use “Sign in with GitHub” and allow Render to access your repos.

## 2. Create a Web Service

1. Click **New +** → **Web Service**.
2. Connect **GitHub** if needed and choose the **kiruthick103/jeff-tune** repository.
3. Use these settings:
   - **Name:** `jeff-tune-1-pro` (or any name)
   - **Region:** Pick the closest to you
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance type:** Free (or paid if you prefer)

## 3. Add environment variables

In the same screen, open **Environment** and add:

| Key | Value |
|-----|--------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key (from [openrouter.ai/keys](https://openrouter.ai/keys)) |

Click **Advanced** and add (optional, for saving chats):

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |

- **Without `DATABASE_URL`:** The app will run and chat will work; history is in-memory only and is lost on restart.
- **With PostgreSQL:** Create a Postgres database on Render (see below), then add `DATABASE_URL` from that database so chats are saved.

## 4. (Optional) Add PostgreSQL for saving chats

1. In the Render dashboard, click **New +** → **PostgreSQL**.
2. Create a database (e.g. name: `jeff-chat-db`), same region as the web service.
3. After it’s created, open the database → **Info** → copy **Internal Database URL**.
4. Open your **Web Service** → **Environment** → **Add Environment Variable**:
   - Key: `DATABASE_URL`
   - Value: paste the Internal Database URL.

Redeploy the web service so it picks up `DATABASE_URL`. Chats will then be stored in the database.

## 5. Deploy

Click **Create Web Service**. Render will build and deploy. When it’s done, your app will be at:

**https://jeff-tune-1-pro.onrender.com**  
(or whatever name you gave the service)

## 6. Push changes from your PC

After you change code:

```powershell
cd "c:\Users\kirut\OneDrive\Documents\coding softwares\py ml projects\jeff ai\jeff-tune-1-pro"
git add .
git commit -m "Your message"
git push origin main
```

Render will auto-deploy from `main`.

---

**Summary:** Connect the GitHub repo to a Render Web Service, set `OPENROUTER_API_KEY`, then optionally add a Postgres database and set `DATABASE_URL` to persist chats.
