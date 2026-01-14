"""Authentication API routes."""
import time
import socket
import errno
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_supabase
from supabase import Client
from app.core.logging import logger
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

