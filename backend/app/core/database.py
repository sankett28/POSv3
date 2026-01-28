"""Supabase database client initialization."""
from supabase import create_client, Client
from app.core.config import settings
from typing import Optional
from app.core.logging import logger
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


# Global Supabase client instance
_supabase_client: Optional[Client] = None

# Security instance for JWT token extraction
security = HTTPBearer()


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


def get_user_context_client(token: str) -> Client:
    """
    Create a Supabase client with user JWT token for RLS-aware operations.
    
    This client respects RLS policies because auth.uid() will return the
    user ID from the JWT token, allowing proper multi-tenant data isolation.
    
    Unlike the service role client (get_supabase), this client operates with
    user-level permissions and enforces Row-Level Security policies.
    
    Args:
        token: User JWT token from Authorization header
    
    Returns:
        Supabase Client configured with user context
    
    Raises:
        ValueError: If token is empty or Supabase URL is not configured
    
    Examples:
        >>> token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        >>> client = get_user_context_client(token)
        >>> # Now database operations respect RLS policies
        >>> response = client.table('businesses').insert({
        ...     'name': 'My Business',
        ...     'user_id': 'user-uuid'
        ... }).execute()
    
    Note:
        - This function creates a NEW client instance each time (no caching)
        - Tokens expire, so clients should be short-lived
        - Use this for user-initiated operations during onboarding
        - Use get_supabase() for admin operations that need to bypass RLS
    """
    # Validate token
    if not token or not token.strip():
        raise ValueError("JWT token is required for user-context client")
    
    # Validate Supabase configuration
    if not settings.supabase_url:
        raise ValueError(
            "Supabase URL is not configured. "
            "Set SUPABASE_URL in .env"
        )
    
    try:
        # Create client with user JWT token instead of service role key
        # This ensures auth.uid() returns the user ID from the token
        client = create_client(settings.supabase_url, token)
        logger.debug(f"Created user-context Supabase client")
        return client
    except Exception as e:
        logger.error(f"Failed to create user-context client: {e}")
        raise ValueError(f"Invalid JWT token: {e}")




def get_user_context_supabase(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Client:
    """
    FastAPI dependency to get a user-context Supabase client.
    
    Extracts JWT token from Authorization header and creates a client
    that respects RLS policies. This dependency should be used in endpoints
    that need to perform user-scoped database operations.
    
    Args:
        credentials: HTTP Bearer token from Authorization header (injected by FastAPI)
    
    Returns:
        Supabase Client with user context
    
    Raises:
        HTTPException: 401 if token is missing or invalid
    
    Usage in endpoints:
        from fastapi import Depends
        from app.core.database import get_user_context_supabase
        
        @router.post("/onboarding")
        async def create_onboarding(
            request: OnboardingRequest,
            user_id: str = Depends(get_current_user_id),
            db: Client = Depends(get_user_context_supabase)
        ):
            # db now respects RLS policies
            # auth.uid() will return the user ID from the JWT token
            business = await business_service.create_business(
                name=request.business_name,
                user_id=user_id,
                db=db
            )
    
    Note:
        - This dependency extracts the token from the Authorization header
        - The token is validated when creating the client
        - Use this for user-initiated operations (onboarding, profile updates, etc.)
        - Use get_supabase() dependency for admin operations
    """
    try:
        # Extract token from Authorization header
        token = credentials.credentials
        
        # Create and return user-context client
        return get_user_context_client(token)
    
    except ValueError as e:
        # Token validation failed
        logger.warning(f"Invalid token in user-context client creation: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {e}"
        )
    
    except Exception as e:
        # Unexpected error
        logger.error(f"Error creating user-context client: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed. Please log in again."
        )
