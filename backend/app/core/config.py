"""Configuration management using Pydantic settings."""
from pydantic_settings import BaseSettings
from pydantic import validator
from typing import Optional, Union


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Supabase configuration (required)
    supabase_url: Optional[str] = None
    supabase_service_role_key: Optional[str] = None
    
    # Server configuration
    backend_port: int = 8000
    
    # CORS configuration - can be string (comma-separated) or list
    cors_origins: Union[str, list[str]] = "http://localhost:3000"
    
    @validator('cors_origins', pre=True)
    def parse_cors_origins(cls, v):
        """Parse CORS origins from comma-separated string or list."""
        if isinstance(v, str):
            # Split by comma and strip whitespace
            return [origin.strip() for origin in v.split(',') if origin.strip()]
        return v if isinstance(v, list) else ["http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()

