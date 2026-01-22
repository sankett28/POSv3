"""
Database error handling decorators.

Provides decorators for handling database errors with retry logic,
structured error responses, and comprehensive logging.
"""
import time
import functools
import inspect
from typing import Callable, Any
from fastapi import HTTPException, status
from app.core.logging import logger


def handle_database_error(func: Callable) -> Callable:
    """
    Decorator for handling database errors with retry logic and structured responses.
    
    This decorator provides:
    - Retry logic with exponential backoff (max 3 retries) for connection failures
    - Structured HTTP error responses for different error types
    - Comprehensive error logging with sanitized details
    - User-friendly error messages
    
    Handles:
    - IntegrityError: Unique constraint and foreign key violations (409/400)
    - OperationalError: Connection failures with retry logic (503)
    - RLS Policy violations: Access denied errors (403)
    - General database errors: Internal server errors (500)
    
    Args:
        func: The function to wrap (can be sync or async)
    
    Returns:
        Wrapped function with error handling
    
    Examples:
        >>> @handle_database_error
        ... async def create_user(db, email, password):
        ...     return await db.table('users').insert({'email': email}).execute()
        
        >>> @handle_database_error
        ... def get_user(db, user_id):
        ...     return db.table('users').select('*').eq('id', user_id).execute()
    
    Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
    """
    @functools.wraps(func)
    async def async_wrapper(*args: Any, **kwargs: Any) -> Any:
        """Async wrapper for database operations."""
        max_retries = 3
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                return await func(*args, **kwargs)
            
            except Exception as e:
                error_str = str(e).lower()
                error_type = type(e).__name__
                
                # Log the error with details (sanitized)
                logger.error(
                    f"Database error in {func.__name__}: {error_type} - {str(e)}",
                    extra={
                        'function': func.__name__,
                        'error_type': error_type,
                        'retry_count': retry_count,
                        'args_count': len(args),
                        'kwargs_keys': list(kwargs.keys())
                    }
                )
                
                # Handle unique constraint violations (409 Conflict)
                if any(keyword in error_str for keyword in ['unique', 'duplicate', 'already exists']):
                    logger.warning(f"Unique constraint violation in {func.__name__}: {str(e)}")
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Resource already exists. This record conflicts with an existing entry."
                    )
                
                # Handle foreign key constraint violations (400 Bad Request)
                if any(keyword in error_str for keyword in ['foreign key', 'violates foreign key', 'fk_']):
                    logger.warning(f"Foreign key constraint violation in {func.__name__}: {str(e)}")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid reference to related resource. The referenced record does not exist."
                    )
                
                # Handle RLS policy violations (403 Forbidden)
                if any(keyword in error_str for keyword in ['policy', 'row-level security', 'rls', 'insufficient_privilege']):
                    logger.warning(f"RLS policy violation in {func.__name__}: {str(e)}")
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Access denied: You do not have permission to access this resource."
                    )
                
                # Handle connection/operational errors with retry logic
                if any(keyword in error_str for keyword in ['connection', 'timeout', 'network', 'unavailable', 'refused']):
                    retry_count += 1
                    
                    if retry_count < max_retries:
                        # Exponential backoff: 2^retry_count seconds
                        wait_time = 2 ** retry_count
                        logger.warning(
                            f"Database connection error in {func.__name__} "
                            f"(attempt {retry_count}/{max_retries}): {str(e)}. "
                            f"Retrying in {wait_time} seconds..."
                        )
                        time.sleep(wait_time)
                        continue  # Retry the operation
                    else:
                        logger.error(
                            f"Database connection failed after {max_retries} attempts in {func.__name__}: {str(e)}"
                        )
                        raise HTTPException(
                            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                            detail="Database temporarily unavailable. Please try again later."
                        )
                
                # Handle general database errors (500 Internal Server Error)
                logger.error(
                    f"Unexpected database error in {func.__name__}: {str(e)}",
                    exc_info=True
                )
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="An internal database error occurred. Please try again or contact support."
                )
    
    @functools.wraps(func)
    def sync_wrapper(*args: Any, **kwargs: Any) -> Any:
        """Sync wrapper for database operations."""
        max_retries = 3
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                return func(*args, **kwargs)
            
            except Exception as e:
                error_str = str(e).lower()
                error_type = type(e).__name__
                
                # Log the error with details (sanitized)
                logger.error(
                    f"Database error in {func.__name__}: {error_type} - {str(e)}",
                    extra={
                        'function': func.__name__,
                        'error_type': error_type,
                        'retry_count': retry_count,
                        'args_count': len(args),
                        'kwargs_keys': list(kwargs.keys())
                    }
                )
                
                # Handle unique constraint violations (409 Conflict)
                if any(keyword in error_str for keyword in ['unique', 'duplicate', 'already exists']):
                    logger.warning(f"Unique constraint violation in {func.__name__}: {str(e)}")
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Resource already exists. This record conflicts with an existing entry."
                    )
                
                # Handle foreign key constraint violations (400 Bad Request)
                if any(keyword in error_str for keyword in ['foreign key', 'violates foreign key', 'fk_']):
                    logger.warning(f"Foreign key constraint violation in {func.__name__}: {str(e)}")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid reference to related resource. The referenced record does not exist."
                    )
                
                # Handle RLS policy violations (403 Forbidden)
                if any(keyword in error_str for keyword in ['policy', 'row-level security', 'rls', 'insufficient_privilege']):
                    logger.warning(f"RLS policy violation in {func.__name__}: {str(e)}")
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Access denied: You do not have permission to access this resource."
                    )
                
                # Handle connection/operational errors with retry logic
                if any(keyword in error_str for keyword in ['connection', 'timeout', 'network', 'unavailable', 'refused']):
                    retry_count += 1
                    
                    if retry_count < max_retries:
                        # Exponential backoff: 2^retry_count seconds
                        wait_time = 2 ** retry_count
                        logger.warning(
                            f"Database connection error in {func.__name__} "
                            f"(attempt {retry_count}/{max_retries}): {str(e)}. "
                            f"Retrying in {wait_time} seconds..."
                        )
                        time.sleep(wait_time)
                        continue  # Retry the operation
                    else:
                        logger.error(
                            f"Database connection failed after {max_retries} attempts in {func.__name__}: {str(e)}"
                        )
                        raise HTTPException(
                            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                            detail="Database temporarily unavailable. Please try again later."
                        )
                
                # Handle general database errors (500 Internal Server Error)
                logger.error(
                    f"Unexpected database error in {func.__name__}: {str(e)}",
                    exc_info=True
                )
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="An internal database error occurred. Please try again or contact support."
                )
    
    # Return appropriate wrapper based on function type
    if inspect.iscoroutinefunction(func):
        return async_wrapper
    else:
        return sync_wrapper



def handle_rls_error(func: Callable) -> Callable:
    """
    Decorator specifically for handling RLS policy violations.
    
    This is a specialized decorator that focuses on Row-Level Security (RLS)
    policy violations. It catches InsufficientPrivilege exceptions and returns
    403 Forbidden responses with appropriate logging.
    
    Args:
        func: The function to wrap (can be sync or async)
    
    Returns:
        Wrapped function with RLS error handling
    
    Examples:
        >>> @handle_rls_error
        ... async def get_business(db, business_id, user_id):
        ...     return await db.table('businesses').select('*').eq('id', business_id).execute()
    
    Validates: Requirement 6.6
    """
    @functools.wraps(func)
    async def async_wrapper(*args: Any, **kwargs: Any) -> Any:
        """Async wrapper for RLS error handling."""
        try:
            return await func(*args, **kwargs)
        except Exception as e:
            error_str = str(e).lower()
            
            # Check for RLS policy violations
            if any(keyword in error_str for keyword in [
                'policy', 'row-level security', 'rls', 
                'insufficient_privilege', 'permission denied'
            ]):
                logger.warning(
                    f"RLS policy violation in {func.__name__}: {str(e)}",
                    extra={
                        'function': func.__name__,
                        'error_type': type(e).__name__
                    }
                )
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: insufficient permissions to access this resource."
                )
            
            # Re-raise if not an RLS error
            raise
    
    @functools.wraps(func)
    def sync_wrapper(*args: Any, **kwargs: Any) -> Any:
        """Sync wrapper for RLS error handling."""
        try:
            return func(*args, **kwargs)
        except Exception as e:
            error_str = str(e).lower()
            
            # Check for RLS policy violations
            if any(keyword in error_str for keyword in [
                'policy', 'row-level security', 'rls', 
                'insufficient_privilege', 'permission denied'
            ]):
                logger.warning(
                    f"RLS policy violation in {func.__name__}: {str(e)}",
                    extra={
                        'function': func.__name__,
                        'error_type': type(e).__name__
                    }
                )
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: insufficient permissions to access this resource."
                )
            
            # Re-raise if not an RLS error
            raise
    
    # Return appropriate wrapper based on function type
    if inspect.iscoroutinefunction(func):
        return async_wrapper
    else:
        return sync_wrapper


def safe_cache_operation(func: Callable) -> Callable:
    """
    Decorator for cache operations that should not break application flow.
    
    This decorator wraps cache operations in try-except blocks, logs failures,
    and returns None to allow graceful degradation to database queries.
    
    Cache failures should never break the application - they should only
    result in slightly slower performance as the system falls back to the database.
    
    Args:
        func: The function to wrap (can be sync or async)
    
    Returns:
        Wrapped function with safe cache error handling
    
    Examples:
        >>> @safe_cache_operation
        ... async def get_cached_user(cache, user_id):
        ...     return cache.get(f'user:{user_id}')
        
        >>> @safe_cache_operation
        ... def set_cached_user(cache, user_id, user_data):
        ...     return cache.set(f'user:{user_id}', user_data)
    
    Validates: Requirement 5.6
    """
    @functools.wraps(func)
    async def async_wrapper(*args: Any, **kwargs: Any) -> Any:
        """Async wrapper for safe cache operations."""
        try:
            return await func(*args, **kwargs)
        except Exception as e:
            logger.warning(
                f"Cache operation failed in {func.__name__}: {str(e)}. "
                f"Falling back to database.",
                extra={
                    'function': func.__name__,
                    'error_type': type(e).__name__,
                    'args_count': len(args),
                    'kwargs_keys': list(kwargs.keys())
                }
            )
            return None  # Graceful degradation - allow database fallback
    
    @functools.wraps(func)
    def sync_wrapper(*args: Any, **kwargs: Any) -> Any:
        """Sync wrapper for safe cache operations."""
        try:
            return func(*args, **kwargs)
        except Exception as e:
            logger.warning(
                f"Cache operation failed in {func.__name__}: {str(e)}. "
                f"Falling back to database.",
                extra={
                    'function': func.__name__,
                    'error_type': type(e).__name__,
                    'args_count': len(args),
                    'kwargs_keys': list(kwargs.keys())
                }
            )
            return None  # Graceful degradation - allow database fallback
    
    # Return appropriate wrapper based on function type
    if inspect.iscoroutinefunction(func):
        return async_wrapper
    else:
        return sync_wrapper
