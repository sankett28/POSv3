"""Authentication API routes."""
import time
import socket
import errno
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.core.database import get_supabase
from supabase import Client
from app.core.logging import logger
from app.services.auth_service import AuthService
from app.services.cache_service import CacheService
from app.core.decorators import handle_database_error
import httpx


router = APIRouter()
security = HTTPBearer()


class LoginRequest(BaseModel):
    """Login request schema."""
    email: str
    password: str


class LoginResponse(BaseModel):
    """Login response schema."""
    access_token: str
    refresh_token: str
    expires_at: int  # Unix timestamp when token expires
    user_id: str
    email: str


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    Extract and verify user ID from JWT token using Supabase.
    
    Properly verifies the token signature with Supabase to prevent token forgery.
    """
    try:
        token = credentials.credentials
        
        # Verify token with Supabase
        db = get_supabase()
        try:
            # Supabase client verifies the token signature and expiration
            user_response = db.auth.get_user(token)
            if not user_response or not user_response.user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token"
                )
            return str(user_response.user.id)
        except (httpx.ConnectError, httpx.ReadTimeout, httpx.ConnectTimeout, httpx.NetworkError, httpx.TimeoutException) as e:
            # Network/connectivity errors - don't treat as auth failure
            logger.warning(f"Supabase unreachable during token verification: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Auth service unreachable. Please check your internet connection."
            )
        except (socket.gaierror, socket.herror, OSError) as e:
            # DNS resolution errors and socket errors (including Windows errno 11001)
            logger.warning(f"Network/DNS error during token verification: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Auth service unreachable. Please check your internet connection."
            )
        except HTTPException:
            # Re-raise HTTPExceptions (like 401 for invalid token)
            raise
        except Exception as e:
            # Check if it's a network-related error by examining the error message/type and errno
            error_str = str(e).lower()
            # Check for network-related keywords
            network_keywords = ['connection', 'timeout', 'network', 'unreachable', 'dns', 'resolve', 'getaddrinfo', 'failed', 'errno']
            is_network_error = any(keyword in error_str for keyword in network_keywords)
            
            # Check for Windows socket error codes (11001 = getaddrinfo failed, 10051 = network unreachable, etc.)
            if hasattr(e, 'errno') and e.errno in (errno.ENETUNREACH, errno.EHOSTUNREACH, errno.ECONNREFUSED, 11001, 10051, 10060):
                is_network_error = True
            
            if is_network_error:
                logger.warning(f"Network error during token verification: {e}")
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Auth service unreachable. Please check your internet connection."
                )
            # Real auth failure
            logger.error(f"Token verification error: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
    except HTTPException:
        raise
    except (socket.gaierror, socket.herror, OSError) as e:
        # DNS resolution errors and socket errors
        logger.warning(f"Network/DNS error validating token: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Auth service unreachable. Please check your internet connection."
        )
    except Exception as e:
        # Outer catch for any other unexpected errors
        error_str = str(e).lower()
        network_keywords = ['connection', 'timeout', 'network', 'unreachable', 'dns', 'resolve', 'getaddrinfo', 'failed', 'errno']
        is_network_error = any(keyword in error_str for keyword in network_keywords)
        
        # Check for Windows socket error codes
        if hasattr(e, 'errno') and e.errno in (errno.ENETUNREACH, errno.EHOSTUNREACH, errno.ECONNREFUSED, 11001, 10051, 10060):
            is_network_error = True
        
        if is_network_error:
            logger.warning(f"Network error validating token: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Auth service unreachable. Please check your internet connection."
            )
        logger.error(f"Error validating token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )


@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    """
    Login endpoint using Supabase authentication.
    """
    from app.core.config import settings
    from app.core.database import get_supabase
    
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase not configured. Please configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
        )
    
    try:
        db = get_supabase()
        # Use Supabase auth to sign in
        response = db.auth.sign_in_with_password({
            "email": login_data.email,
            "password": login_data.password
        })
        
        if not response.user or not response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Calculate expires_at from expires_in (seconds) or use session expiry
        if hasattr(response.session, 'expires_at') and response.session.expires_at:
            expires_at = response.session.expires_at
        elif hasattr(response.session, 'expires_in') and response.session.expires_in:
            expires_at = int(time.time()) + response.session.expires_in
        else:
            # Default to 1 hour if not specified
            expires_at = int(time.time()) + 3600
        
        return LoginResponse(
            access_token=response.session.access_token,
            refresh_token=response.session.refresh_token,
            expires_at=expires_at,
            user_id=response.user.id,
            email=response.user.email
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )


class RefreshTokenRequest(BaseModel):
    """Refresh token request schema."""
    refresh_token: str


class RefreshTokenResponse(BaseModel):
    """Refresh token response schema."""
    access_token: str
    refresh_token: str
    expires_at: int
    user_id: str
    email: str


@router.post("/refresh", response_model=RefreshTokenResponse)
async def refresh_token(refresh_data: RefreshTokenRequest):
    """
    Refresh access token using refresh token.
    """
    from app.core.config import settings
    from app.core.database import get_supabase
    
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase not configured. Please configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
        )
    
    try:
        db = get_supabase()
        # Use Supabase auth to refresh the token
        response = db.auth.refresh_session(refresh_data.refresh_token)
        
        if not response.user or not response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Calculate expires_at from expires_in (seconds) or use session expiry
        if hasattr(response.session, 'expires_at') and response.session.expires_at:
            expires_at = response.session.expires_at
        elif hasattr(response.session, 'expires_in') and response.session.expires_in:
            expires_at = int(time.time()) + response.session.expires_in
        else:
            # Default to 1 hour if not specified
            expires_at = int(time.time()) + 3600
        
        return RefreshTokenResponse(
            access_token=response.session.access_token,
            refresh_token=response.session.refresh_token,
            expires_at=expires_at,
            user_id=response.user.id,
            email=response.user.email
        )
    except (httpx.ConnectError, httpx.ReadTimeout, httpx.ConnectTimeout, httpx.NetworkError, httpx.TimeoutException) as e:
        # Network/connectivity errors - don't treat as auth failure
        logger.warning(f"Supabase unreachable during token refresh: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Auth service unreachable. Please check your internet connection."
        )
    except (socket.gaierror, socket.herror, OSError) as e:
        # DNS resolution errors and socket errors
        logger.warning(f"Network/DNS error during token refresh: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Auth service unreachable. Please check your internet connection."
        )
    except HTTPException:
        raise
    except Exception as e:
        # Check if it's a network-related error
        error_str = str(e).lower()
        network_keywords = ['connection', 'timeout', 'network', 'unreachable', 'dns', 'resolve', 'getaddrinfo', 'failed', 'errno']
        is_network_error = any(keyword in error_str for keyword in network_keywords)
        
        # Check for Windows socket error codes
        if hasattr(e, 'errno') and e.errno in (errno.ENETUNREACH, errno.EHOSTUNREACH, errno.ECONNREFUSED, 11001, 10051, 10060):
            is_network_error = True
        
        if is_network_error:
            logger.warning(f"Network error during token refresh: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Auth service unreachable. Please check your internet connection."
            )
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )




def get_auth_service() -> AuthService:
    """
    Dependency to get AuthService instance with cache integration.
    
    Creates and returns an AuthService instance with:
    - Supabase database client
    - Redis cache service
    - JWT secret from configuration
    
    Returns:
        AuthService instance ready for use
    """
    from app.core.config import settings
    
    # Get database client
    db = get_supabase()
    
    # Use centralized Redis client
    from app.core.redis import redis_client
    
    # Create cache service
    cache_service = CacheService(redis_client)
    
    # Create and return auth service
    jwt_secret = getattr(settings, 'jwt_secret', settings.supabase_service_role_key)
    return AuthService(db, cache_service, jwt_secret)


class UserProfileResponse(BaseModel):
    """User profile response schema for /me endpoint."""
    id: str
    email: str
    onboarding_completed: bool
    has_business: bool
    business: Optional[Dict[str, Any]] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


@router.get("/me", response_model=UserProfileResponse)
@handle_database_error
async def get_current_user_profile(
    user_id: str = Depends(get_current_user_id),
    auth_service: AuthService = Depends(get_auth_service)
) -> UserProfileResponse:
    """
    Get current user's complete profile with caching.
    
    This endpoint:
    1. Extracts user_id from JWT token
    2. Retrieves user state from cache or database
    3. Checks if user has a business (with caching)
    4. If user has business, fetches business, config, and theme data
    5. Returns complete user profile
    
    The response uses cached data when available to reduce database load.
    
    Args:
        user_id: User ID extracted from JWT token (dependency)
        auth_service: AuthService instance (dependency)
    
    Returns:
        UserProfileResponse containing:
        - id: User UUID
        - email: User email
        - onboarding_completed: Whether user completed onboarding
        - has_business: Whether user has a business record
        - business: Business data (if has_business is true)
        - created_at: User creation timestamp
        - updated_at: User last update timestamp
    
    Raises:
        HTTPException: 401 for invalid token, 404 for user not found,
                      500 for server errors
    
    Examples:
        GET /api/v1/auth/me
        Authorization: Bearer <token>
        
        Response:
        {
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "email": "user@example.com",
            "onboarding_completed": true,
            "has_business": true,
            "business": {
                "id": "business-uuid",
                "name": "My Business",
                "configuration": {...},
                "theme": {...}
            },
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }
    
    Validates: Requirements 8.4, 8.5
    """
    try:
        # Get user state (uses cache if available)
        logger.info(f"Fetching profile for user {user_id}")
        user_state = auth_service.get_user_state(user_id)
        
        # Check if user has a business (uses cache if available)
        has_business = auth_service.verify_business_exists(user_id)
        
        # Initialize business data
        business_data = None
        
        # If user has business, fetch complete business data
        if has_business:
            try:
                db = get_supabase()
                
                # Fetch business record
                business_response = db.table('businesses').select(
                    'id, name, slug, website_url, is_active, created_at, updated_at'
                ).eq('user_id', user_id).execute()
                
                if business_response.data and len(business_response.data) > 0:
                    business = business_response.data[0]
                    business_id = business['id']
                    
                    # Fetch business configuration
                    config_response = db.table('business_configurations').select('*').eq(
                        'business_id', business_id
                    ).execute()
                    
                    # Fetch business theme
                    theme_response = db.table('business_themes').select('*').eq(
                        'business_id', business_id
                    ).execute()
                    
                    # Build complete business data
                    business_data = {
                        **business,
                        'configuration': config_response.data[0] if config_response.data else None,
                        'theme': theme_response.data[0] if theme_response.data else None
                    }
                    
                    logger.info(f"Fetched complete business data for user {user_id}")
            
            except Exception as business_error:
                # Log error but don't fail the request
                logger.warning(
                    f"Error fetching business data for user {user_id}: {business_error}"
                )
                # has_business will still be true, but business_data will be None
        
        # Build and return response
        response = UserProfileResponse(
            id=user_state['id'],
            email=user_state['email'],
            onboarding_completed=user_state.get('onboarding_completed', False),
            has_business=has_business,
            business=business_data,
            created_at=user_state.get('created_at'),
            updated_at=user_state.get('updated_at')
        )
        
        logger.info(
            f"Profile fetched successfully for user {user_id} "
            f"(onboarding: {response.onboarding_completed}, has_business: {has_business})"
        )
        
        return response
    
    except HTTPException:
        # Re-raise HTTP exceptions (like 404 from get_user_state)
        raise
    
    except Exception as e:
        logger.error(f"Error fetching user profile for {user_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user profile"
        )
