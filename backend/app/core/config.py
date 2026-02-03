import os
import json
from functools import lru_cache
from typing import List, Union
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
    cors_origins: Union[str, List[str]] = ["http://localhost:3000", "http://localhost:5173"]
    
    @field_validator('cors_origins', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            s = v.strip()
            # Empty string -> return default local origins
            if s == "":
                return ["http://localhost:3000", "http://localhost:5173"]
            # Wildcard
            if s == "*":
                return ["*"]
            # JSON array
            if s.startswith('['):
                try:
                    parsed = json.loads(s)
                    if isinstance(parsed, list):
                        return parsed
                except Exception:
                    pass
            # Comma-separated list
            return [origin.strip() for origin in s.split(',') if origin.strip()]
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
    # Normalize `CORS_ORIGINS` so pydantic's EnvSettingsSource can json.loads it
    cors_env = os.environ.get('CORS_ORIGINS')
    default_origins = ["http://localhost:3000", "http://localhost:5173"]
    if isinstance(cors_env, str):
        s = cors_env.strip()
        if s == "":
            os.environ['CORS_ORIGINS'] = json.dumps(default_origins)
        elif s == "*":
            os.environ['CORS_ORIGINS'] = json.dumps(["*"])
        elif s.startswith('['):
            try:
                json.loads(s)
            except Exception:
                os.environ['CORS_ORIGINS'] = json.dumps(default_origins)
        else:
            parts = [p.strip() for p in s.split(',') if p.strip()]
            os.environ['CORS_ORIGINS'] = json.dumps(parts)

    return Settings()
import os
import json
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
            s = v.strip()
            # Empty string -> return default local origins
            if s == "":
                return ["http://localhost:3000", "http://localhost:5173"]
            # Wildcard
            if s == "*":
                return ["*"]
            # JSON array
            if s.startswith('['):
                try:
                    parsed = json.loads(s)
                    if isinstance(parsed, list):
                        return parsed
                except Exception:
                    pass
            # Comma-separated list
            return [origin.strip() for origin in s.split(',') if origin.strip()]
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
    # Normalize `CORS_ORIGINS` so pydantic's EnvSettingsSource can json.loads it
    cors_env = os.environ.get('CORS_ORIGINS')
    default_origins = ["http://localhost:3000", "http://localhost:5173"]
    if isinstance(cors_env, str):
        s = cors_env.strip()
        if s == "":
            os.environ['CORS_ORIGINS'] = json.dumps(default_origins)
        elif s == "*":
            os.environ['CORS_ORIGINS'] = json.dumps(["*"])
        elif s.startswith('['):
            try:
                json.loads(s)
            except Exception:
                os.environ['CORS_ORIGINS'] = json.dumps(default_origins)
        else:
            parts = [p.strip() for p in s.split(',') if p.strip()]
            os.environ['CORS_ORIGINS'] = json.dumps(parts)

    return Settings()
