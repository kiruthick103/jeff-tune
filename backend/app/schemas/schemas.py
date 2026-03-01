from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

# User Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Image Schemas
class ImageBase(BaseModel):
    image_url: str
    prediction_result: Optional[str] = None

class ImageCreate(ImageBase):
    user_id: int

class UploadedImage(ImageBase):
    id: int
    user_id: int
    uploaded_at: datetime

    class Config:
        from_attributes = True

# AI Request Schemas
class AIRequestBase(BaseModel):
    prompt: str
    response: Optional[str] = None

class AIRequestCreate(AIRequestBase):
    user_id: int

class AIRequest(AIRequestBase):
    id: int
    user_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
