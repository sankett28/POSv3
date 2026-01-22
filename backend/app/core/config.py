"""Configuration management using Pydantic settings."""
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import Optional, Union


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Supabase configuration (required)
    supabase_url: Optional[str] = None
    supabase_service_role_key: Optional[str] = None
    
    # Server configuration
    backend_port: int = 8000
    
    # CORS configuration - loaded from .env as comma-separated string
    cors_origins: Optional[Union[str, list[str]]] = None
    
    # Redis configuration (required - must be set in .env)
    redis_url: str
    
    # Service charge default configuration
    default_service_charge_enabled: bool = True
    default_service_charge_rate: float = 10.0
    
    @field_validator('cors_origins', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS origins from comma-separated string or list."""
        if v is None:
            return []
        if isinstance(v, str):
            # Split by comma and strip whitespace
            return [origin.strip() for origin in v.split(',') if origin.strip()]
        return v if isinstance(v, list) else []
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="forbid"
    )


# Global settings instance
settings = Settings()

