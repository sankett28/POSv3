"""
Usage examples for the handle_database_error decorator.

This file demonstrates how to use the decorator in various scenarios.
These examples are for documentation purposes only.
"""
from app.core.decorators import handle_database_error
from supabase import Client


# Example 1: Async function with database operation
@handle_database_error
async def create_user(db: Client, email: str, password_hash: str):
    """
    Create a new user with error handling.
    
    The decorator will:
    - Catch unique constraint violations (duplicate email) and return 409
    - Catch connection errors and retry with exponential backoff
    - Log all errors appropriately
    - Return structured HTTP error responses
    """
    response = db.table('users').insert({
        'email': email,
        'password_hash': password_hash,
        'onboarding_completed': False
    }).execute()
    
    return response.data[0]


# Example 2: Async function with foreign key relationship
@handle_database_error
async def create_business(db: Client, user_id: str, business_name: str):
    """
    Create a business record with foreign key to user.
    
    The decorator will:
    - Catch foreign key violations (invalid user_id) and return 400
    - Catch unique constraint violations (duplicate user_id) and return 409
    - Handle RLS policy violations and return 403
    """
    response = db.table('businesses').insert({
        'user_id': user_id,
        'name': business_name,
        'slug': business_name.lower().replace(' ', '-')
    }).execute()
    
    return response.data[0]


# Example 3: Sync function with database query
@handle_database_error
def get_user_by_email(db: Client, email: str):
    """
    Retrieve user by email with error handling.
    
    The decorator works with both sync and async functions.
    """
    response = db.table('users').select('*').eq('email', email).single().execute()
    return response.data


# Example 4: Function with RLS policy enforcement
@handle_database_error
async def update_business_config(db: Client, business_id: str, config_data: dict):
    """
    Update business configuration with RLS enforcement.
    
    The decorator will:
    - Catch RLS policy violations if user doesn't own the business (403)
    - Handle any database errors gracefully
    """
    response = db.table('business_configurations').update(config_data).eq(
        'business_id', business_id
    ).execute()
    
    return response.data[0]


# Example 5: Function that might have connection issues
@handle_database_error
async def fetch_all_products(db: Client, business_id: str):
    """
    Fetch all products for a business.
    
    The decorator will:
    - Retry up to 3 times if connection fails
    - Use exponential backoff (2s, 4s)
    - Return 503 if all retries fail
    """
    response = db.table('products').select('*').eq('business_id', business_id).execute()
    return response.data


# Example 6: Complex operation with multiple constraints
@handle_database_error
async def create_product_with_category(
    db: Client,
    business_id: str,
    product_name: str,
    category_id: str,
    price: float
):
    """
    Create a product with category relationship.
    
    The decorator handles:
    - Foreign key violation if category_id doesn't exist (400)
    - Unique constraint if product name already exists for business (409)
    - RLS policy if user doesn't own the business (403)
    - Connection errors with retry logic (503 after retries)
    """
    response = db.table('products').insert({
        'business_id': business_id,
        'name': product_name,
        'category_id': category_id,
        'price': price
    }).execute()
    
    return response.data[0]


# Example 7: Using in FastAPI endpoint
"""
from fastapi import APIRouter, Depends
from app.core.database import get_supabase
from app.core.decorators import handle_database_error

router = APIRouter()

@router.post("/users")
async def create_user_endpoint(
    email: str,
    password: str,
    db: Client = Depends(get_supabase)
):
    # The decorator is applied to the service function
    user = await create_user(db, email, hash_password(password))
    return {"user": user}
"""


# Example 8: Error handling in service layer
"""
class UserService:
    def __init__(self, db: Client):
        self.db = db
    
    @handle_database_error
    async def register_user(self, email: str, password: str):
        # All database errors are handled by the decorator
        response = self.db.table('users').insert({
            'email': email,
            'password_hash': hash_password(password),
            'onboarding_completed': False
        }).execute()
        
        return response.data[0]
    
    @handle_database_error
    async def get_user_profile(self, user_id: str):
        # RLS policies are enforced, decorator handles violations
        response = self.db.table('users').select('*').eq('id', user_id).single().execute()
        return response.data
"""
