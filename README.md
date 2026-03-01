# Jeff Tune Pro - AI Image SaaS Monorepo

Welcome to the production-ready upgrade of Jeff Tune Pro. The project has been refactored into a high-performance monorepo featuring a FastAPI backend and a React frontend.

## 🚀 Architecture
- **Frontend**: React + Vite + Tailwind CSS (deployed on Vercel).
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL (Docker-ready).
- **AI**: Integrated HuggingFace Router for vision and reasoning tasks.
- **Persistence**: Relational database for Users, Images, and Request logs.

## 📂 Project Structure
```text
jeff-tune-pro/
├── backend/             # FastAPI Backend Service
│   ├── app/             # API logic, Auth, DB, and AI Services
│   ├── Dockerfile       # Production container build
│   └── README.md        # Backend specific documentation
├── frontend/            # React Frontend Application
│   ├── src/             # UI Components and state management
│   ├── Dockerfile       # Nginx-based frontend container
│   └── README.md        # Frontend documentation
├── docker-compose.yml   # Full-stack orchestration (DB + API + UI)
├── vercel.json          # Deployment configuration for the frontend
└── package.json         # Root monorepo workspace management
```

## 🛠️ Getting Started

### Local Development (with Docker)
1. Ensure you have Docker and Docker Compose installed.
2. Create a `.env` file in the root directory (see `.env.example`).
3. Run the entire stack:
   ```bash
   docker-compose up --build
   ```
4. Access the UI at `http://localhost:3000` and the API docs at `http://localhost:8000/docs`.

### Local Development (without Docker)
1. **Backend**:
   ```bash
   cd backend && pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```
2. **Frontend**:
   ```bash
   cd frontend && npm install && npm run dev
   ```

## ☁️ Deployment
- **GitHub**: Integrated via GitHub Actions (if configured) or linked to Vercel.
- **Vercel**: The `frontend/` directory is automatically deployed using the provided `vercel.json`.
- **Backend**: Suitable for deployment on Docker-compatible hosts like Render, Railway, or Fly.io.

---
Built with ❤️ by Jeff AI Team.
