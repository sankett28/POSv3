"""
Theme API endpoints.

Provides REST API for theme management:
- GET /api/v1/themes - Get theme for current business
- PUT /api/v1/themes - Create or update theme
- PATCH /api/v1/themes - Partially update theme
- DELETE /api/v1/themes - Delete theme
- GET /api/v1/themes/audit - Get audit logs
- POST /api/v1/themes/validate - Validate theme without saving
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from app.core.database import get_supabase
from app.api.v1.auth import get_current_user_id
from app.repositories.theme_repo import ThemeRepository
from app.services.theme_service import ThemeService
from app.schemas.theme import (
    ThemeCreate,
    ThemeUpdate,
    ThemePublic,
    ThemeResponse,
    ThemeValidationResult,
    ThemeAuditLog
)
from app.core.logging import logger
from typing import List

router = APIRouter(prefix="/themes", tags=["themes"])


# Dependency to get theme service
def get_theme_service() -> ThemeService:
    """Get theme service instance."""
    supabase = get_supabase()
    theme_repo = ThemeRepository(supabase)
    return ThemeService(theme_repo)


# Dependency to get current business ID from authenticated user
async def get_current_business_id(
    user_id: str = Depends(get_current_user_id)
) -> str:
    """
    Get current business ID for authenticated user.
    
    Looks up the business owned by the current user.
    
    Args:
        user_id: Authenticated user ID from JWT token
    
    Returns:
        Business ID (UUID string)
    
    Raises:
        HTTPException: 404 if user has no business
    """
    try:
        db = get_supabase()
        response = db.table('businesses') \
            .select('id') \
            .eq('user_id', user_id) \
            .limit(1) \
            .execute()
        
        if not response.data or len(response.data) == 0:
            logger.warning(f"No business found for user {user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No business found for current user. Please complete onboarding first."
            )
        
        business_id = response.data[0]['id']
        logger.info(f"Resolved business_id {business_id} for user {user_id}")
        return business_id
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching business for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch business information"
        )


# Helper to extract client IP
def get_client_ip(request: Request) -> str:
    """Extract client IP address from request."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@router.get(
    "",
    response_model=ThemePublic,
    summary="Get theme for current business",
    description="""
    Get the theme for the current business.
    
    Returns an empty object {} if no theme is configured.
    Frontend should use default theme in this case.
    
    This endpoint is called on app bootstrap to apply custom theme.
    """
)
async def get_theme(
    business_id: str = Depends(get_current_business_id),
    theme_service: ThemeService = Depends(get_theme_service)
):
    """Get theme for current business."""
    try:
        theme = await theme_service.get_theme(business_id)
        return theme
    except Exception as e:
        logger.error(f"Error fetching theme: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch theme"
        )


@router.put(
    "",
    response_model=ThemeResponse,
    summary="Create or update theme",
    description="""
    Create or update theme for current business.
    
    All colors are validated for:
    - Valid hex format (#RRGGBB)
    - Sufficient contrast ratios (WCAG 2.0 AA)
    - Color distinctness
    
    If validation fails, returns 422 with detailed error messages.
    
    Requires admin/owner permissions.
    """
)
async def create_or_update_theme(
    theme: ThemeCreate,
    request: Request,
    business_id: str = Depends(get_current_business_id),
    theme_service: ThemeService = Depends(get_theme_service)
):
    """Create or update theme."""
    try:
        # TODO: Extract user email from JWT when auth is implemented
        changed_by_email = "admin@example.com"  # Placeholder
        ip_address = get_client_ip(request)
        
        theme_response, validation_result = await theme_service.create_or_update_theme(
            business_id=business_id,
            theme=theme,
            changed_by_email=changed_by_email,
            ip_address=ip_address,
            auto_correct=False  # Strict validation, no auto-correction
        )
        
        logger.info(
            f"Theme saved for business {business_id}. "
            f"Validation: {validation_result.is_valid}"
        )
        
        return theme_response
    
    except ValueError as e:
        # Validation error
        logger.warning(f"Theme validation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error saving theme: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save theme"
        )


@router.patch(
    "",
    response_model=ThemeResponse,
    summary="Partially update theme",
    description="""
    Update specific theme fields without providing all colors.
    
    Only provided fields will be updated.
    The complete theme (after updates) is validated.
    
    Requires admin/owner permissions.
    """
)
async def update_theme_partial(
    theme_update: ThemeUpdate,
    request: Request,
    business_id: str = Depends(get_current_business_id),
    theme_service: ThemeService = Depends(get_theme_service)
):
    """Partially update theme."""
    try:
        # TODO: Extract user email from JWT when auth is implemented
        changed_by_email = "admin@example.com"  # Placeholder
        ip_address = get_client_ip(request)
        
        theme_response, validation_result = await theme_service.update_theme_partial(
            business_id=business_id,
            theme_update=theme_update,
            changed_by_email=changed_by_email,
            ip_address=ip_address
        )
        
        return theme_response
    
    except ValueError as e:
        logger.warning(f"Theme update failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error updating theme: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update theme"
        )


@router.delete(
    "",
    summary="Delete theme",
    description="""
    Delete theme for current business.
    
    Frontend will fall back to default theme.
    Change is logged to audit trail.
    
    Requires admin/owner permissions.
    """
)
async def delete_theme(
    request: Request,
    business_id: str = Depends(get_current_business_id),
    theme_service: ThemeService = Depends(get_theme_service)
):
    """Delete theme."""
    try:
        # TODO: Extract user email from JWT when auth is implemented
        changed_by_email = "admin@example.com"  # Placeholder
        ip_address = get_client_ip(request)
        
        deleted = await theme_service.delete_theme(
            business_id=business_id,
            changed_by_email=changed_by_email,
            ip_address=ip_address
        )
        
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Theme not found"
            )
        
        return {"message": "Theme deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting theme: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete theme"
        )


@router.post(
    "/validate",
    response_model=ThemeValidationResult,
    summary="Validate theme without saving",
    description="""
    Validate theme colors without saving to database.
    
    Useful for:
    - Live validation in theme editor UI
    - Pre-validation before LLM generation
    - Testing color combinations
    
    Returns validation result with errors, warnings, and contrast ratios.
    """
)
async def validate_theme(
    theme: ThemeCreate,
    theme_service: ThemeService = Depends(get_theme_service)
):
    """Validate theme without saving."""
    try:
        validation_result = await theme_service.validate_theme(theme)
        return validation_result
    except Exception as e:
        logger.error(f"Error validating theme: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to validate theme"
        )


@router.get(
    "/audit",
    response_model=List[ThemeAuditLog],
    summary="Get theme audit logs",
    description="""
    Get audit trail of theme changes for current business.
    
    Returns up to 50 most recent changes, newest first.
    
    Useful for:
    - Compliance tracking
    - Change history review
    - Debugging theme issues
    
    Requires admin/owner permissions.
    """
)
async def get_audit_logs(
    business_id: str = Depends(get_current_business_id),
    theme_service: ThemeService = Depends(get_theme_service)
):
    """Get theme audit logs."""
    try:
        logs = await theme_service.theme_repo.get_audit_logs(business_id)
        return logs
    except Exception as e:
        logger.error(f"Error fetching audit logs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch audit logs"
        )
