"""
Repository layer for theme data access.

Handles all database operations for themes and audit logs.
Uses Supabase client with service role for RLS bypass.
"""
from typing import Optional
from supabase import Client
from app.schemas.theme import ThemeCreate, ThemeUpdate, ThemeResponse, ThemeAuditLog
from app.core.logging import logger


class ThemeRepository:
    """Repository for theme database operations."""
    
    def __init__(self, supabase: Client):
        """
        Initialize theme repository.
        
        Args:
            supabase: Supabase client instance (with service role)
        """
        self.supabase = supabase
    
    async def get_theme_by_business_id(self, business_id: str) -> Optional[ThemeResponse]:
        """
        Get theme for a specific business.
        
        Args:
            business_id: Business UUID
        
        Returns:
            ThemeResponse if found, None otherwise
        """
        try:
            response = self.supabase.table('business_themes') \
                .select('*') \
                .eq('business_id', business_id) \
                .single() \
                .execute()
            
            if response.data:
                return ThemeResponse(**response.data)
            return None
        
        except Exception as e:
            # Not found is expected - return None
            if 'PGRST116' in str(e):  # Supabase "not found" error code
                return None
            logger.error(f"Error fetching theme for business {business_id}: {e}")
            raise
    
    async def create_theme(
        self,
        business_id: str,
        theme: ThemeCreate,
        changed_by_email: str = None,
        ip_address: str = None
    ) -> ThemeResponse:
        """
        Create a new theme for a business.
        
        Args:
            business_id: Business UUID
            theme: Theme data to create
            changed_by_email: Email of user creating theme (for audit)
            ip_address: IP address of request (for audit)
        
        Returns:
            Created ThemeResponse
        
        Raises:
            Exception: If creation fails
        """
        try:
            # Prepare theme data
            theme_data = {
                'business_id': business_id,
                'primary_color': theme.primary_color,
                'secondary_color': theme.secondary_color,
                'background_color': theme.background_color,
                'foreground_color': theme.foreground_color,
                'accent_color': theme.accent_color,
                'danger_color': theme.danger_color,
                'success_color': theme.success_color,
                'warning_color': theme.warning_color,
                'source': theme.source,
                'source_url': theme.source_url,
                'is_validated': True  # Set by backend after validation
            }
            
            # Insert theme
            response = self.supabase.table('business_themes') \
                .insert(theme_data) \
                .execute()
            
            if not response.data:
                raise Exception("Failed to create theme")
            
            created_theme = ThemeResponse(**response.data[0])
            
            # Log audit entry
            await self._log_theme_change(
                business_id=business_id,
                old_theme=None,
                new_theme=theme_data,
                change_type='created',
                changed_by_email=changed_by_email,
                ip_address=ip_address
            )
            
            logger.info(f"Created theme for business {business_id}")
            return created_theme
        
        except Exception as e:
            logger.error(f"Error creating theme for business {business_id}: {e}")
            raise
    
    async def update_theme(
        self,
        business_id: str,
        theme_update: ThemeUpdate,
        changed_by_email: str = None,
        ip_address: str = None
    ) -> ThemeResponse:
        """
        Update an existing theme.
        
        Args:
            business_id: Business UUID
            theme_update: Theme fields to update
            changed_by_email: Email of user updating theme (for audit)
            ip_address: IP address of request (for audit)
        
        Returns:
            Updated ThemeResponse
        
        Raises:
            Exception: If update fails or theme not found
        """
        try:
            # Get current theme for audit log
            current_theme = await self.get_theme_by_business_id(business_id)
            if not current_theme:
                raise Exception(f"Theme not found for business {business_id}")
            
            # Prepare update data (only include non-None fields)
            update_data = {}
            if theme_update.primary_color is not None:
                update_data['primary_color'] = theme_update.primary_color
            if theme_update.secondary_color is not None:
                update_data['secondary_color'] = theme_update.secondary_color
            if theme_update.background_color is not None:
                update_data['background_color'] = theme_update.background_color
            if theme_update.foreground_color is not None:
                update_data['foreground_color'] = theme_update.foreground_color
            if theme_update.accent_color is not None:
                update_data['accent_color'] = theme_update.accent_color
            if theme_update.danger_color is not None:
                update_data['danger_color'] = theme_update.danger_color
            if theme_update.success_color is not None:
                update_data['success_color'] = theme_update.success_color
            if theme_update.warning_color is not None:
                update_data['warning_color'] = theme_update.warning_color
            
            if not update_data:
                # No fields to update
                return current_theme
            
            # Mark as validated after backend processing
            update_data['is_validated'] = True
            
            # Update theme - MUST use .select() to return updated data
            response = self.supabase.table('business_themes') \
                .update(update_data) \
                .eq('business_id', business_id) \
                .execute()
            
            # Supabase PATCH returns empty data by default
            # Fetch the updated theme explicitly
            if not response.data or len(response.data) == 0:
                # Re-fetch the updated theme
                updated_theme = await self.get_theme_by_business_id(business_id)
                if not updated_theme:
                    raise Exception("Failed to update theme - theme not found after update")
            else:
                updated_theme = ThemeResponse(**response.data[0])
            
            # Log audit entry
            await self._log_theme_change(
                business_id=business_id,
                old_theme=current_theme.model_dump(),
                new_theme=updated_theme.model_dump(),
                change_type='updated',
                changed_by_email=changed_by_email,
                ip_address=ip_address
            )
            
            logger.info(f"Updated theme for business {business_id}")
            return updated_theme
        
        except Exception as e:
            logger.error(f"Error updating theme for business {business_id}: {e}")
            raise
    
    async def upsert_theme(
        self,
        business_id: str,
        theme: ThemeCreate,
        changed_by_email: str = None,
        ip_address: str = None
    ) -> ThemeResponse:
        """
        Create or update theme (upsert operation).
        
        Args:
            business_id: Business UUID
            theme: Theme data
            changed_by_email: Email of user (for audit)
            ip_address: IP address (for audit)
        
        Returns:
            ThemeResponse (created or updated)
        """
        existing_theme = await self.get_theme_by_business_id(business_id)
        
        if existing_theme:
            # Update existing theme
            theme_update = ThemeUpdate(
                primary_color=theme.primary_color,
                secondary_color=theme.secondary_color,
                background_color=theme.background_color,
                foreground_color=theme.foreground_color,
                accent_color=theme.accent_color,
                danger_color=theme.danger_color,
                success_color=theme.success_color,
                warning_color=theme.warning_color
            )
            return await self.update_theme(
                business_id=business_id,
                theme_update=theme_update,
                changed_by_email=changed_by_email,
                ip_address=ip_address
            )
        else:
            # Create new theme
            return await self.create_theme(
                business_id=business_id,
                theme=theme,
                changed_by_email=changed_by_email,
                ip_address=ip_address
            )
    
    async def delete_theme(
        self,
        business_id: str,
        changed_by_email: str = None,
        ip_address: str = None
    ) -> bool:
        """
        Delete a theme (soft delete - logs to audit).
        
        Args:
            business_id: Business UUID
            changed_by_email: Email of user deleting theme (for audit)
            ip_address: IP address (for audit)
        
        Returns:
            True if deleted, False if not found
        """
        try:
            # Get current theme for audit log
            current_theme = await self.get_theme_by_business_id(business_id)
            if not current_theme:
                return False
            
            # Delete theme
            response = self.supabase.table('business_themes') \
                .delete() \
                .eq('business_id', business_id) \
                .execute()
            
            # Log audit entry
            await self._log_theme_change(
                business_id=business_id,
                old_theme=current_theme.model_dump(),
                new_theme=None,
                change_type='deleted',
                changed_by_email=changed_by_email,
                ip_address=ip_address
            )
            
            logger.info(f"Deleted theme for business {business_id}")
            return True
        
        except Exception as e:
            logger.error(f"Error deleting theme for business {business_id}: {e}")
            raise
    
    async def get_audit_logs(
        self,
        business_id: str,
        limit: int = 50
    ) -> list[ThemeAuditLog]:
        """
        Get audit logs for a business's theme changes.
        
        Args:
            business_id: Business UUID
            limit: Maximum number of logs to return
        
        Returns:
            List of ThemeAuditLog entries (newest first)
        """
        try:
            response = self.supabase.table('theme_audit_log') \
                .select('*') \
                .eq('business_id', business_id) \
                .order('created_at', desc=True) \
                .limit(limit) \
                .execute()
            
            return [ThemeAuditLog(**log) for log in response.data]
        
        except Exception as e:
            logger.error(f"Error fetching audit logs for business {business_id}: {e}")
            raise
    
    async def _log_theme_change(
        self,
        business_id: str,
        old_theme: Optional[dict],
        new_theme: Optional[dict],
        change_type: str,
        changed_by_email: str = None,
        changed_by_user_id: str = None,
        ip_address: str = None,
        change_reason: str = None
    ) -> None:
        """
        Internal method to log theme changes to audit table.
        
        Args:
            business_id: Business UUID
            old_theme: Previous theme data (None for create)
            new_theme: New theme data (None for delete)
            change_type: Type of change (created, updated, deleted, auto_generated)
            changed_by_email: Email of user making change
            changed_by_user_id: User ID (if available)
            ip_address: IP address of request
            change_reason: Optional reason for change
        """
        try:
            audit_data = {
                'business_id': business_id,
                'old_theme': old_theme,
                'new_theme': new_theme,
                'change_type': change_type,
                'changed_by_email': changed_by_email,
                'changed_by_user_id': changed_by_user_id,
                'ip_address': ip_address,
                'change_reason': change_reason
            }
            
            self.supabase.table('theme_audit_log') \
                .insert(audit_data) \
                .execute()
        
        except Exception as e:
            # Log error but don't fail the main operation
            logger.error(f"Error logging theme change audit: {e}")
