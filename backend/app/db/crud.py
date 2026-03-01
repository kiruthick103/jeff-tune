from sqlalchemy.orm import Session
from . import models
from ..schemas import schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# User CRUD
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Image CRUD
def create_image_record(db: Session, image: schemas.ImageCreate):
    db_image = models.UploadedImage(**image.model_dump())
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    return db_image

def get_user_images(db: Session, user_id: int):
    return db.query(models.UploadedImage).filter(models.UploadedImage.user_id == user_id).all()

# AI Request CRUD
def create_ai_request(db: Session, request: schemas.AIRequestCreate):
    db_request = models.AIRequest(**request.model_dump())
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request
