import os
import shutil
import uuid
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from .db import models, crud, database
from .schemas import schemas
from .services import ai_service
from .api import auth
from .core.logging import setup_logging, logger

# Create Database tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Jeff Tune Pro AI SaaS")

@app.on_event("startup")
async def startup_event():
    setup_logging()
    logger.info("Application starting up...")

# CORS Setup

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@app.get("/")
def read_root():
    return {"message": "Welcome to Jeff Tune Pro AI API"}

@app.post("/upload-image", response_model=schemas.UploadedImage)
async def upload_image(
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    file_bytes = await file.read()
    if not ai_service.validate_image(file_bytes):
        raise HTTPException(status_code=400, detail="Invalid image data")

    # Save file
    file_ext = file.filename.split(".")[-1]
    file_name = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    
    with open(file_path, "wb") as buffer:
        buffer.write(file_bytes)

    # Run AI Model
    ai_result = ai_service.classify_image(file_bytes)
    prediction = ai_result.get("prediction", "Unknown")
    confidence = ai_result.get("confidence", 0.0)

    # Store in DB
    image_data = schemas.ImageCreate(
        user_id=current_user.id,
        image_url=file_path,
        prediction_result=f"{prediction} ({confidence*100:.1f}%)"
    )
    db_image = crud.create_image_record(db, image_data)

    return db_image
