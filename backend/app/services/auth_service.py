"""
Authentication service with onboarding verification and caching.

Handles user authentication, JWT token generation, and user state management
with integrated caching to reduce database load.
"""
from typing import Dict, Optional
from datetime import datetime, timedelta
import jwt
from app.core.logging import logger
from app.core.decorators import handle_database_error, safe_cache_operation
from app.services.cache_service import CacheService
from supabase import Client


class AuthService:
    """
    Enhanced authentication service with onboarding verification and caching.
    
    This service provides:
    - User authentication with complete state retrieval
    - JWT token generation with onboarding status
    - Business existence verification
    - Integrated caching for frequently accessed data
    
    Validates: Requirements 1.3, 1.5, 2.1, 2.2, 4.1, 8.1, 8.2, 8.3
    """
    
    def __init__(self, db_client: Client, cache_service: CacheService, jwt_secret: str):
        """
        Initialize authentication service.
        
        Args:
            db_client: Supabase client instance for database operations
            cache_service: CacheService instance for caching operations
            jwt_secret: Secret key for JWT token signing
        
        Raises:
            ValueError: If any required parameter is None
        
        Examples:
            >>> from app.core.database import get_supabase
            >>> from app.services.cache_service import CacheService
            >>> import redis
            >>> 
            >>> db = get_supabase()
            >>> redis_client = redis.Redis(host='localhost', port=6379)
            >>> cache = CacheService(redis_client)
            >>> auth_service = AuthService(db, cache, 'your-secret-key')
        
        Validates: Requirements 4.1 (Task 6.1)
        """
        if db_client is None:
            raise ValueError("db_client cannot be None")
        if cache_service is None:
            raise ValueError("cache_service cannot be None")
        if not jwt_secret:
            raise ValueError("jwt_secret cannot be empty")
        
        self.db = db_client
        self.cache = cache_service
        self.jwt_secret = jwt_secret
        
        logger.info("AuthService initialized with cache integration")
    
    @safe_cache_operation
    @handle_database_error
    def get_user_state(self, user_id: str) -> Dict:
        """
        Get complete user state with caching.
        
        Checks cache first for user data. If cache miss, queries database
        and populates cache with the result. Returns user data including
        onboarding_completed status.
        
        Args:
            user_id: UUID of the user
        
        Returns:
            Dictionary containing user state:
            {
                'id': str,
                'email': str,
                'onboarding_completed': bool,
                'created_at': str (ISO format),
                'updated_at': str (ISO format)
            }
        
        Raises:
            HTTPException: If user not found or database error occurs
        
        Examples:
            >>> user_state = auth_service.get_user_state('123e4567-e89b-12d3-a456-426614174000')
            >>> print(user_state['onboarding_completed'])
            True
        
        Validates: Requirements 1.5, 4.1, 4.5, 4.6 (Task 6.2)
        """
        # Build cache key for user data
        cache_key = self.cache.build_key('user', user_id)
        
        # Try to get from cache first
        cached_user = self.cache.get(cache_key)
        if cached_user is not None:
            logger.debug(f"User state retrieved from cache: {user_id}")
            return cached_user
        
        # Cache miss - query database
        logger.debug(f"Cache miss for user {user_id}, querying database")
        
        # Query users table with onboarding_completed field
        response = self.db.table('users').select(
            'id, email, onboarding_completed, created_at, updated_at'
        ).eq('id', user_id).execute()
        
        if not response.data or len(response.data) == 0:
            from fastapi import HTTPException, status
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User not found: {user_id}"
            )
        
        user_data = response.data[0]
        
        # Cache the user data with default TTL for 'user' entity type (15 minutes)
        self.cache.set(
            cache_key,
            user_data,
            ttl=self.cache.default_ttl['user']
        )
        
        logger.debug(f"User state retrieved from database and cached: {user_id}")
        return user_data
    
    @safe_cache_operation
    @handle_database_error
    def verify_business_exists(self, user_id: str) -> bool:
        """
        Check if user has a business record with caching.
        
        Checks cache first for business existence. If cache miss, queries
        database and caches the result.
        
        Args:
            user_id: UUID of the user
        
        Returns:
            True if user has a business record, False otherwise
        
        Examples:
            >>> has_business = auth_service.verify_business_exists('123e4567-e89b-12d3-a456-426614174000')
            >>> if has_business:
            ...     print("User has completed business setup")
        
        Validates: Requirements 2.2, 4.2 (Task 6.3)
        """
        # Build cache key for user's business
        cache_key = self.cache.build_key('user', user_id, 'business')
        
        # Try to get from cache first
        cached_business = self.cache.get(cache_key)
        if cached_business is not None:
            logger.debug(f"Business existence retrieved from cache for user: {user_id}")
            # Cache stores the business data or False
            return cached_business is not False
        
        # Cache miss - query database
        logger.debug(f"Cache miss for business of user {user_id}, querying database")
        
        # Query businesses table for this user
        response = self.db.table('businesses').select(
            'id, user_id, name'
        ).eq('user_id', user_id).execute()
        
        has_business = response.data and len(response.data) > 0
        
        # Cache the result
        # If business exists, cache the business data; otherwise cache False
        cache_value = response.data[0] if has_business else False
        self.cache.set(
            cache_key,
            cache_value,
            ttl=self.cache.default_ttl['business']
        )
        
        logger.debug(f"Business existence for user {user_id}: {has_business}")
        return has_business
    
    def create_jwt_token(
        self, 
        user_id: str, 
        onboarding_completed: bool,
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """
        Create JWT token with user_id and onboarding_completed in payload.
        
        Generates a JWT token containing user identification and onboarding
        status. This allows the frontend to make routing decisions without
        additional API calls.
        
        Args:
            user_id: UUID of the user
            onboarding_completed: Whether user has completed onboarding
            expires_delta: Optional custom expiration time (default: 1 hour)
        
        Returns:
            Encoded JWT token string
        
        Examples:
            >>> token = auth_service.create_jwt_token(
            ...     '123e4567-e89b-12d3-a456-426614174000',
            ...     True,
            ...     timedelta(hours=24)
            ... )
            >>> print(token)
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        
        Validates: Requirements 1.3, 8.3 (Task 6.4)
        """
        if expires_delta is None:
            expires_delta = timedelta(hours=1)
        
        # Calculate expiration time
        expire = datetime.utcnow() + expires_delta
        
        # Build JWT payload with user_id and onboarding_completed
        payload = {
            'user_id': user_id,
            'onboarding_completed': onboarding_completed,
            'exp': expire,
            'iat': datetime.utcnow()
        }
        
        # Encode and sign the token
        token = jwt.encode(payload, self.jwt_secret, algorithm='HS256')
        
        logger.debug(
            f"JWT token created for user {user_id} "
            f"(onboarding_completed: {onboarding_completed})"
        )
        
        return token
    
    @handle_database_error
    def login(self, email: str, password: str) -> Dict:
        """
        Authenticate user and return complete user state.
        
        This method:
        1. Authenticates user credentials with Supabase
        2. Retrieves user data including onboarding_completed from database
        3. Checks if user has a business record
        4. Creates JWT token with onboarding status
        5. Caches user data for future requests
        6. Returns complete user state for frontend routing
        
        Args:
            email: User's email address
            password: User's password
        
        Returns:
            Dictionary containing:
            {
                'access_token': str,
                'refresh_token': str,
                'user': {
                    'id': str,
                    'email': str,
                    'onboarding_completed': bool,
                    'has_business': bool
                }
            }
        
        Raises:
            HTTPException: If authentication fails or database error occurs
        
        Examples:
            >>> result = auth_service.login('user@example.com', 'password123')
            >>> print(result['user']['onboarding_completed'])
            True
            >>> print(result['user']['has_business'])
            True
        
        Validates: Requirements 1.5, 2.1, 2.2, 2.3, 2.4, 4.1, 8.1, 8.2 (Task 6.5)
        """
        from fastapi import HTTPException, status
        
        # Authenticate with Supabase
        try:
            auth_response = self.db.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if not auth_response.user or not auth_response.session:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid credentials"
                )
            
            user_id = str(auth_response.user.id)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Get complete user state from database (with caching)
        user_state = self.get_user_state(user_id)
        
        # Verify if user has a business (with caching)
        has_business = self.verify_business_exists(user_id)
        
        # Create custom JWT token with onboarding status
        # Note: We still return Supabase tokens for compatibility,
        # but we could use our custom token for additional claims
        custom_token = self.create_jwt_token(
            user_id,
            user_state.get('onboarding_completed', False),
            expires_delta=timedelta(hours=24)
        )
        
        # Build complete response with user state
        response = {
            'access_token': auth_response.session.access_token,
            'refresh_token': auth_response.session.refresh_token,
            'custom_token': custom_token,  # Our custom token with onboarding status
            'user': {
                'id': user_id,
                'email': user_state['email'],
                'onboarding_completed': user_state.get('onboarding_completed', False),
                'has_business': has_business
            }
        }
        
        logger.info(
            f"User logged in successfully: {email} "
            f"(onboarding: {user_state.get('onboarding_completed', False)}, "
            f"has_business: {has_business})"
        )
        
        return response
