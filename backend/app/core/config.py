"""Configuration management using Pydantic settings."""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Supabase configuration (optional if using test credentials)
    supabase_url: Optional[str] = None
    supabase_service_role_key: Optional[str] = None
    
    # Server configuration
    backend_port: int = 8000
    
    # CORS configuration
    cors_origins: list[str] = ["http://localhost:3000"]
    
    # Temporary test credentials (for development only)
    test_user_email: Optional[str] = None
    test_user_password: Optional[str] = None
    test_user_id: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()

