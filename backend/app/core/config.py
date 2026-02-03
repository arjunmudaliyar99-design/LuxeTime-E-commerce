import os
from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    # App config
    app_name: str = "Virtual Watch Try-On API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Security
    secret_key: str = "dev-secret-key-please-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    supabase_jwt_secret: str = ""  # Set via SUPABASE_JWT_SECRET env var
    
    # CORS
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    @field_validator('cors_origins', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            # Handle comma-separated string or wildcard
            if v == "*":
                return ["*"]
            return [origin.strip() for origin in v.split(',') if origin.strip()]
        return v
    
    @field_validator('debug', mode='before')
    @classmethod
    def parse_debug(cls, v):
        if isinstance(v, str):
            return v.lower() in ('true', '1', 'yes')
        return v
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    environment: str = "development"
    
    # Database (for future use)
    database_url: str = "sqlite:///./watches.db"
    
    # File storage
    upload_dir: str = "./uploads"
    max_upload_size: int = 10 * 1024 * 1024  # 10MB
    
    # Razorpay (optional)
    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""
    
    # Gmail SMTP Configuration
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_email: str = ""
    smtp_password: str = ""
    admin_email: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Ignore extra fields in .env file


@lru_cache()
def get_settings():
    # If the environment provides an empty string for CORS_ORIGINS,
    # pydantic-settings will attempt to json.loads it and raise
    # JSONDecodeError. Remove the var so the default applies instead.
    cors_env = os.environ.get('CORS_ORIGINS')
    if isinstance(cors_env, str) and cors_env.strip() == "":
        os.environ.pop('CORS_ORIGINS', None)
    return Settings()
