"""Supabase database client initialization."""
from supabase import create_client, Client
from app.core.config import settings
from typing import Optional


# Global Supabase client instance
_supabase_client: Optional[Client] = None


def get_supabase() -> Client:
    """Get or create Supabase client instance."""
    global _supabase_client
    
    if _supabase_client is None:
        if not settings.supabase_url or not settings.supabase_service_role_key:
            raise ValueError(
                "Supabase configuration is required. "
                "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env"
            )
        _supabase_client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key
        )
    
    return _supabase_client


def reset_supabase_client() -> None:
    """Reset the Supabase client (useful for testing)."""
    global _supabase_client
    _supabase_client = None

