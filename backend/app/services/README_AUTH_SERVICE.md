# AuthService Implementation Guide

## Overview

The `AuthService` class provides enhanced authentication functionality with integrated caching and onboarding verification. This service is part of the auth-flow-and-caching-improvements specification.

## Features

- **User Authentication**: Authenticate users with Supabase
- **Complete User State**: Retrieve user data including onboarding status
- **Business Verification**: Check if user has completed business setup
- **JWT Token Generation**: Create tokens with onboarding status in payload
- **Integrated Caching**: Reduce database load with Redis caching
- **Error Handling**: Comprehensive error handling with decorators

## Implementation Details

### Tasks Completed (6.1-6.5)

✅ **Task 6.1**: AuthService `__init__` accepts CacheService
- Initializes with db_client, cache_service, and jwt_secret
- Validates all required parameters
- Logs initialization

✅ **Task 6.2**: `get_user_state` method with caching
- Checks cache first (cache key: `user:{user_id}`)
- Falls back to database on cache miss
- Caches result with 15-minute TTL
- Returns complete user data including `onboarding_completed`

✅ **Task 6.3**: `verify_business_exists` method with caching
- Checks cache first (cache key: `user:{user_id}:business`)
- Queries businesses table on cache miss
- Caches result with 30-minute TTL
- Returns boolean indicating business existence

✅ **Task 6.4**: `create_jwt_token` includes onboarding_status
- Generates JWT with `user_id` and `onboarding_completed` in payload
- Includes expiration time (default: 1 hour, configurable)
- Uses HS256 algorithm for signing

✅ **Task 6.5**: `login` method returns complete user state
- Authenticates with Supabase
- Retrieves user state (with caching)
- Verifies business existence (with caching)
- Creates custom JWT token
- Returns complete response with user object

## Usage Examples

### Basic Setup

```python
from app.core.database import get_supabase
from app.services.cache_service import CacheService
from app.services.auth_service import AuthService
import redis

# Initialize dependencies
db = get_supabase()
redis_client = redis.Redis(host='localhost', port=6379, db=0)
cache = CacheService(redis_client)

# Create AuthService instance
auth_service = AuthService(
    db_client=db,
    cache_service=cache,
    jwt_secret='your-secret-key-here'
)
```

### User Login

```python
# Login user and get complete state
result = auth_service.login('user@example.com', 'password123')

print(result)
# Output:
# {
#     'access_token': 'eyJ...',  # Supabase token
#     'refresh_token': 'eyJ...',  # Supabase refresh token
#     'custom_token': 'eyJ...',   # Custom JWT with onboarding status
#     'user': {
#         'id': '123e4567-e89b-12d3-a456-426614174000',
#         'email': 'user@example.com',
#         'onboarding_completed': True,
#         'has_business': True
#     }
# }
```

### Get User State

```python
# Get user state (uses cache if available)
user_state = auth_service.get_user_state('123e4567-e89b-12d3-a456-426614174000')

print(user_state)
# Output:
# {
#     'id': '123e4567-e89b-12d3-a456-426614174000',
#     'email': 'user@example.com',
#     'onboarding_completed': True,
#     'created_at': '2024-01-01T00:00:00Z',
#     'updated_at': '2024-01-01T00:00:00Z'
# }
```

### Verify Business Exists

```python
# Check if user has a business (uses cache if available)
has_business = auth_service.verify_business_exists('123e4567-e89b-12d3-a456-426614174000')

if has_business:
    print("User has completed business setup")
else:
    print("User needs to complete business setup")
```

### Create JWT Token

```python
from datetime import timedelta

# Create custom JWT token with onboarding status
token = auth_service.create_jwt_token(
    user_id='123e4567-e89b-12d3-a456-426614174000',
    onboarding_completed=True,
    expires_delta=timedelta(hours=24)
)

print(token)
# Output: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

# Decode to see payload
import jwt
payload = jwt.decode(token, 'your-secret-key-here', algorithms=['HS256'])
print(payload)
# Output:
# {
#     'user_id': '123e4567-e89b-12d3-a456-426614174000',
#     'onboarding_completed': True,
#     'exp': 1234567890,
#     'iat': 1234567890
# }
```

## Integration with FastAPI

### Example API Endpoint

```python
from fastapi import APIRouter, Depends
from app.services.auth_service import AuthService
from app.core.database import get_supabase
from app.services.cache_service import CacheService
import redis

router = APIRouter()

def get_auth_service() -> AuthService:
    """Dependency to get AuthService instance."""
    db = get_supabase()
    redis_client = redis.Redis(host='localhost', port=6379, db=0)
    cache = CacheService(redis_client)
    return AuthService(db, cache, 'your-secret-key')

@router.post("/login")
async def login(
    email: str,
    password: str,
    auth_service: AuthService = Depends(get_auth_service)
):
    """Login endpoint using AuthService."""
    return auth_service.login(email, password)

@router.get("/me")
async def get_me(
    user_id: str,
    auth_service: AuthService = Depends(get_auth_service)
):
    """Get current user state."""
    user_state = auth_service.get_user_state(user_id)
    has_business = auth_service.verify_business_exists(user_id)
    
    return {
        **user_state,
        'has_business': has_business
    }
```

## Caching Behavior

### Cache Keys

- User state: `user:{user_id}`
- Business existence: `user:{user_id}:business`

### Cache TTLs

- User data: 15 minutes
- Business data: 30 minutes

### Cache Invalidation

Cache should be invalidated when:
- User completes onboarding → invalidate `user:{user_id}`
- Business is created/updated → invalidate `user:{user_id}:business`
- User logs out → invalidate `user:{user_id}`

Example invalidation:
```python
# After onboarding completion
cache.invalidate(f'user:{user_id}')
cache.invalidate(f'user:{user_id}:business')
```

## Error Handling

The AuthService uses decorators for comprehensive error handling:

### `@handle_database_error`
- Retries connection failures (max 3 times with exponential backoff)
- Returns structured HTTP errors for different failure types
- Logs all errors with sanitized details

### `@safe_cache_operation`
- Catches cache failures and logs warnings
- Returns None to allow graceful degradation to database
- Never breaks application flow

### Example Error Scenarios

```python
# User not found
try:
    user_state = auth_service.get_user_state('invalid-user-id')
except HTTPException as e:
    print(e.status_code)  # 404
    print(e.detail)  # "User not found: invalid-user-id"

# Invalid credentials
try:
    result = auth_service.login('user@example.com', 'wrong-password')
except HTTPException as e:
    print(e.status_code)  # 401
    print(e.detail)  # "Invalid credentials"

# Database connection failure (with retry)
# Automatically retries 3 times with exponential backoff
# If all retries fail, returns 503 Service Unavailable
```

## Requirements Validation

This implementation validates the following requirements:

- **Requirement 1.3**: JWT token includes onboarding_status
- **Requirement 1.5**: Database is source of truth for onboarding_status
- **Requirement 2.1**: Login verifies onboarding_status from database
- **Requirement 2.2**: Login checks if business record exists
- **Requirement 2.3**: Login includes onboarding_required flag
- **Requirement 2.4**: Login includes business_setup_required flag
- **Requirement 4.1**: Cache user data after login
- **Requirement 4.2**: Cache business data after retrieval
- **Requirement 4.5**: Return cached data if valid TTL exists
- **Requirement 4.6**: Fetch from database and update cache on miss
- **Requirement 8.1**: Login returns user object with onboarding_status
- **Requirement 8.2**: Login returns has_business boolean
- **Requirement 8.3**: JWT token contains user_id and onboarding_status

## Testing

### Manual Testing

1. **Setup Redis**:
   ```bash
   docker run -d -p 6379:6379 redis:latest
   ```

2. **Test Login**:
   ```python
   result = auth_service.login('test@example.com', 'password')
   assert 'user' in result
   assert 'onboarding_completed' in result['user']
   assert 'has_business' in result['user']
   ```

3. **Verify Caching**:
   ```python
   # First call - cache miss
   user1 = auth_service.get_user_state(user_id)
   
   # Second call - cache hit (should be faster)
   user2 = auth_service.get_user_state(user_id)
   
   assert user1 == user2
   ```

### Unit Testing (Future)

Property-based tests should be implemented for:
- Property 1: Signup Default State
- Property 3: JWT Contains Onboarding Status
- Property 4: Database is Source of Truth
- Property 5: Login Verifies Business Existence
- Property 6: Login Response Completeness
- Property 10: Entity Caching After Retrieval

## Next Steps

1. **Update API Endpoints**: Modify `/api/v1/auth/login` to use AuthService
2. **Implement /me Endpoint**: Create `/api/v1/auth/me` endpoint
3. **Frontend Integration**: Update frontend to handle new response structure
4. **Cache Invalidation**: Implement cache invalidation in OnboardingService
5. **Property Tests**: Write property-based tests using Hypothesis

## Dependencies

- `supabase`: Database client
- `redis`: Cache client
- `pyjwt`: JWT token generation
- `fastapi`: HTTP exception handling
- `app.core.decorators`: Error handling decorators
- `app.services.cache_service`: Caching service

## Notes

- The service returns both Supabase tokens (for compatibility) and a custom JWT token
- Custom JWT token includes onboarding_completed in payload for frontend routing
- All database operations use the `@handle_database_error` decorator
- All cache operations use the `@safe_cache_operation` decorator
- Cache failures never break the application (graceful degradation)
