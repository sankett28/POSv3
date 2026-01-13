"""Authentication API routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_supabase
from supabase import Client
from app.core.logging import logger


router = APIRouter()
security = HTTPBearer()


class LoginRequest(BaseModel):
    """Login request schema."""
    email: str
    password: str


class LoginResponse(BaseModel):
    """Login response schema."""
    access_token: str
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
        except Exception as e:
            logger.error(f"Token verification error: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
    except HTTPException:
        raise
    except Exception as e:
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
        
        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        return LoginResponse(
            access_token=response.session.access_token,
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

