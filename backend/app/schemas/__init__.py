from datetime import datetime
from typing import Any

from pydantic import BaseModel, EmailStr, Field


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict[str, Any]
    breach_alert: dict[str, Any] | None = None


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = "Analyst"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ScanRequest(BaseModel):
    request: str = Field(min_length=1)
    mode: str = "domain"
    limit: int = Field(default=500, ge=100, le=10000)
    lang: str = "es"


class BreachCheckRequest(BaseModel):
    email: EmailStr


class VerifyIncidentRequest(BaseModel):
    action: str
    reason: str


class ScrapeRequest(BaseModel):
    url: str
    dynamic: bool = False


class AIAnalyzeRequest(BaseModel):
    context: str
    question: str | None = None
