"""
Onboarding API routes.

Handles complete onboarding flow: business creation, configuration, and theme setup.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from app.core.database import get_supabase, get_user_context_supabase
from app.core.logging import logger
from app.api.v1.auth import get_current_user_id
from app.schemas.onboarding import OnboardingRequest, OnboardingResponse
from app.services.business_service import BusinessService
from app.services.configuration_service import ConfigurationService
from app.services.theme_service import ThemeService


router = APIRouter()


@router.post("/onboarding", response_model=OnboardingResponse)
async def create_onboarding(
    request: OnboardingRequest,
    user_id: str = Depends(get_current_user_id),
    db: Client = Depends(get_supabase)
) -> OnboardingResponse:
    """
    Process complete onboarding submission with atomic transaction handling.
    
    Creates business, configuration, and theme records atomically using service role client.
    The service role client bypasses RLS policies, which is appropriate for onboarding
    since we're creating records on behalf of the authenticated user.
    
    If any step fails, rolls back by deleting the created business (CASCADE deletes related records).
    
    Args:
        request: Onboarding data from frontend
        user_id: Authenticated user ID from JWT token
        db: Supabase service role client instance
    
    Returns:
        OnboardingResponse with success status and business_id
    
    Raises:
        HTTPException: 400 for validation errors, 401 for auth errors, 
                      403 for permission errors, 500 for server errors
    """
    business_id = None
    
    try:
        # Initialize services with service role client
        # Service role bypasses RLS, which is appropriate for onboarding
        # since we're creating records on behalf of the authenticated user
        business_service = BusinessService(db)
        config_service = ConfigurationService(db)
        theme_service = ThemeService(supabase=db)
        
        # Step 1: Create business record
        logger.info(f"Creating business for user {user_id}: {request.business_name}")
        business = await business_service.create_business(
            name=request.business_name,
            user_id=user_id,  # Pass user_id for RLS policy
            website_url=request.website_url if request.website_url else None,
            is_active=True
        )
        business_id = business['id']
        logger.info(f"Business created successfully: {business_id}")
        
        # Step 2: Create configuration record (with rollback on failure)
        try:
            logger.info(f"Creating configuration for business {business_id}")
            await config_service.create_configuration(
                business_id=business_id,
                business_type=request.business_type,
                revenue_range=request.revenue,
                has_gst=(request.has_gst == 'yes'),
                gst_number=request.gst_number,
                service_charge=request.service_charge,
                billing_type=request.billing_type,
                price_type=request.price_type,
                table_service=request.table_service,
                kitchen_tickets=request.kitchen_tickets,
                restaurant_service_charge=request.restaurant_service_charge,
                number_of_tables=request.number_of_tables,
                website_url=request.website_url,
                brand_prompt=request.brand_prompt,
                branding_choice=request.branding_choice
            )
            logger.info(f"Configuration created successfully for business {business_id}")
        except Exception as config_error:
            logger.error(f"Configuration creation failed: {config_error}")
            # Rollback: Delete the business (CASCADE will delete related records)
            await _rollback_business(db, business_id)
            raise
        
        # Step 3: Create theme record (with rollback on failure)
        try:
            logger.info(f"Creating theme for business {business_id}")
            await theme_service.create_theme(
                business_id=business_id,
                theme_mode=request.theme_mode or 'light',  # Default to light mode
                primary_color=request.primary_color or '#912b48',  # Default primary color
                secondary_color=request.secondary_color or '#ffffff',
                background_color=request.background_color or '#ffffff',  # Changed from #fff0f3 to #ffffff
                foreground_color=request.foreground_color or '#610027',
                accent_color=request.accent_color or '#b45a69',
                danger_color=request.danger_color or '#ef4444',
                success_color=request.success_color or '#22c55e',
                warning_color=request.warning_color or '#f59e0b',
                branding_choice=request.branding_choice or 'manual',  # Default to manual
                website_url=request.website_url,
                brand_prompt=request.brand_prompt
            )
            logger.info(f"Theme created successfully for business {business_id}")
        except Exception as theme_error:
            logger.error(f"Theme creation failed: {theme_error}")
            # Rollback: Delete the business (CASCADE will delete related records)
            await _rollback_business(db, business_id)
            raise
        
        # Step 4: Update user.onboarding_completed = True
        try:
            logger.info(f"Updating onboarding_completed for user {user_id}")
            db.table('users').update({
                'onboarding_completed': True
            }).eq('id', user_id).execute()
            logger.info(f"User {user_id} onboarding_completed set to True")
        except Exception as user_update_error:
            logger.error(f"User update failed: {user_update_error}")
            # Rollback: Delete the business (CASCADE will delete related records)
            await _rollback_business(db, business_id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update user onboarding status"
            )
        
        logger.info(f"Onboarding completed successfully for business {business_id}")
        
        return OnboardingResponse(
            success=True,
            business_id=business_id,
            message="Onboarding completed successfully"
        )
    
    except ValueError as e:
        # Validation errors (400)
        logger.warning(f"Validation error during onboarding: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    except PermissionError as e:
        # Permission errors (403)
        logger.warning(f"Permission error during onboarding: {e}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    
    except Exception as e:
        # Server errors (500)
        logger.error(f"Error during onboarding: {e}", exc_info=True)
        
        # Check if it's an RLS policy violation
        error_str = str(e).lower()
        if 'policy' in error_str or 'row-level security' in error_str or 'rls' in error_str:
            logger.warning(f"RLS policy violation for user {user_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission denied: Row-Level Security policy violation. Please ensure you are authenticated and authorized."
            )
        
        # Check for other permission errors
        if '403' in error_str or 'permission' in error_str or 'forbidden' in error_str:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission denied. Please ensure you are authenticated and authorized."
            )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to complete onboarding. Please try again."
        )


async def _rollback_business(db: Client, business_id: str) -> None:
    """
    Rollback helper: Delete business record (CASCADE deletes related records).
    
    Args:
        db: Supabase client instance
        business_id: Business UUID to delete
    """
    try:
        logger.warning(f"Rolling back: Deleting business {business_id}")
        db.table('businesses').delete().eq('id', business_id).execute()
        logger.info(f"Rollback successful: Business {business_id} deleted")
    except Exception as rollback_error:
        logger.error(
            f"Rollback failed for business {business_id}: {rollback_error}",
            exc_info=True
        )
