"""Authentication API routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_supabase
from supabase import Client
from app.core.logging import logger
import jwt
from typing import Dict, Any


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
    Extract user ID from JWT token.
    
    For V1, we use simple JWT validation without signature verification
    (Supabase handles auth on frontend).
    """
    try:
        token = credentials.credentials
        
        # Decode token without verification (Supabase handles this)
        # In production, you'd verify the signature
        try:
            decoded = jwt.decode(token, options={"verify_signature": False})
        except jwt.DecodeError:
            # Try decoding with test secret if it's a test token
            try:
                decoded = jwt.decode(token, "test_secret", algorithms=["HS256"])
            except:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token format"
                )
        
        user_id = decoded.get("sub")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user ID"
            )
        
        return str(user_id)
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
    Login endpoint.
    
    For V1, this is a simple endpoint that uses Supabase auth.
    In production, you'd integrate with Supabase Auth properly.
    
    Temporary: Supports hardcoded test credentials from .env for development.
    """
    from app.core.config import settings
    from app.core.database import get_supabase
    
    # Check for temporary test credentials first (if configured)
    if (settings.test_user_email and settings.test_user_password and 
        settings.test_user_id and
        login_data.email == settings.test_user_email and 
        login_data.password == settings.test_user_password):
        # Generate a simple JWT-like token for test user
        # In production, this would be a proper JWT from Supabase
        import time
        test_token_payload = {
            "sub": settings.test_user_id,
            "email": settings.test_user_email,
            "iat": int(time.time()),
            "exp": int(time.time()) + 86400  # 24 hours
        }
        # Create a simple token (not a real JWT, but works for V1)
        test_token = jwt.encode(test_token_payload, "test_secret", algorithm="HS256")
        
        logger.info(f"Test user login: {settings.test_user_email}")
        return LoginResponse(
            access_token=test_token,
            user_id=settings.test_user_id,
            email=settings.test_user_email
        )
    
    # Otherwise, use Supabase auth
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase not configured. Use test credentials or configure Supabase."
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

