# Jeff Tune Pro - AI Image Processing SaaS

A production-ready FastAPI-based AI application for image classification and analysis.

## Features
- **FastAPI Backend**: High-performance, asynchronous REST API.
- **SQLAlchemy ORM**: Clean database interactions with PostgreSQL.
- **JWT Auth**: Secure authentication with JWT and bcrypt password hashing.
- **AI Integration**: Image classification using HuggingFace Router.
- **Dockerized**: Containerized environment for easy scaling and deployment.
- **Structured Logging**: Production-ready logging system.

## Folder Structure
```text
backend/
├── app/
│   ├── api/             # Auth and business logic routes
│   ├── core/            # Security (JWT), logging, global config
│   ├── db/              # SQLAlchemy models, CRUD, and session
│   ├── schemas/         # Pydantic models for data validation
│   ├── services/        # AI Service and image processing
│   └── main.py          # Application entry point
├── uploads/             # Image storage
├── Dockerfile           # Backend container config
└── requirements.txt     # Python dependencies
docker-compose.yml       # Orchestration for DB and Backend
```

## Getting Started

### Local Setup
1. Clone the repository.
2. Create a `.env` file with your credentials:
```env
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=jeff_tune_db
SECRET_KEY=your_random_secret_key
HF_TOKEN=your_huggingface_token
```
3. Run with Docker Compose:
```bash
docker-compose up --build
```

The API will be available at `http://localhost:8000/docs`.

### API Documentation
FastAPI automatically generates interactive API documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Components
- **User Authentication**: Login and registration with JWT protection.
- **Image Upload**: Upload `.jpg` or `.png` images for AI analysis.
- **AI Processing**: Automated classification via HuggingFace models.
