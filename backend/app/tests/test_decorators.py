"""
Unit tests for database error handling decorators.

Tests the handle_database_error decorator for:
- Retry logic with exponential backoff
- Unique constraint violation handling
- Foreign key constraint violation handling
- RLS policy violation handling
- Connection error handling with retries
- General error handling
"""
import pytest
import time
from unittest.mock import MagicMock, patch
from fastapi import HTTPException
from app.core.decorators import handle_database_error


class TestHandleDatabaseErrorDecorator:
    """Test the handle_database_error decorator."""
    
    @pytest.mark.asyncio
    async def test_successful_operation(self):
        """Test that successful operations pass through without modification."""
        @handle_database_error
        async def successful_operation():
            return {"success": True, "data": "test"}
        
        result = await successful_operation()
        assert result == {"success": True, "data": "test"}
    
    @pytest.mark.asyncio
    async def test_unique_constraint_violation(self):
        """Test handling of unique constraint violations (409 Conflict)."""
        @handle_database_error
        async def operation_with_unique_violation():
            raise Exception("duplicate key value violates unique constraint")
        
        with pytest.raises(HTTPException) as exc_info:
            await operation_with_unique_violation()
        
        assert exc_info.value.status_code == 409
        assert "already exists" in exc_info.value.detail.lower()
    
    @pytest.mark.asyncio
    async def test_unique_constraint_already_exists(self):
        """Test handling of 'already exists' error messages."""
        @handle_database_error
        async def operation_with_already_exists():
            raise Exception("Resource already exists in database")
        
        with pytest.raises(HTTPException) as exc_info:
            await operation_with_already_exists()
        
        assert exc_info.value.status_code == 409
        assert "already exists" in exc_info.value.detail.lower()
    
    @pytest.mark.asyncio
    async def test_foreign_key_constraint_violation(self):
        """Test handling of foreign key constraint violations (400 Bad Request)."""
        @handle_database_error
        async def operation_with_fk_violation():
            raise Exception("violates foreign key constraint fk_business_user")
        
        with pytest.raises(HTTPException) as exc_info:
            await operation_with_fk_violation()
        
        assert exc_info.value.status_code == 400
        assert "invalid reference" in exc_info.value.detail.lower()
    
    @pytest.mark.asyncio
    async def test_rls_policy_violation(self):
        """Test handling of RLS policy violations (403 Forbidden)."""
        @handle_database_error
        async def operation_with_rls_violation():
            raise Exception("new row violates row-level security policy")
        
        with pytest.raises(HTTPException) as exc_info:
            await operation_with_rls_violation()
        
        assert exc_info.value.status_code == 403
        assert "access denied" in exc_info.value.detail.lower()
    
    @pytest.mark.asyncio
    async def test_rls_insufficient_privilege(self):
        """Test handling of insufficient privilege errors."""
        @handle_database_error
        async def operation_with_insufficient_privilege():
            raise Exception("insufficient_privilege: permission denied")
        
        with pytest.raises(HTTPException) as exc_info:
            await operation_with_insufficient_privilege()
        
        assert exc_info.value.status_code == 403
        assert "permission" in exc_info.value.detail.lower()
    
    @pytest.mark.asyncio
    async def test_connection_error_with_retry_success(self):
        """Test connection error retry logic - succeeds on second attempt."""
        call_count = 0
        
        @handle_database_error
        async def operation_with_connection_error():
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                raise Exception("connection refused by server")
            return {"success": True}
        
        with patch('time.sleep'):  # Mock sleep to speed up test
            result = await operation_with_connection_error()
        
        assert result == {"success": True}
        assert call_count == 2  # Failed once, succeeded on retry
    
    @pytest.mark.asyncio
    async def test_connection_error_max_retries_exceeded(self):
        """Test connection error retry logic - fails after max retries."""
        call_count = 0
        
        @handle_database_error
        async def operation_with_persistent_connection_error():
            nonlocal call_count
            call_count += 1
            raise Exception("connection timeout")
        
        with patch('time.sleep'):  # Mock sleep to speed up test
            with pytest.raises(HTTPException) as exc_info:
                await operation_with_persistent_connection_error()
        
        assert exc_info.value.status_code == 503
        assert "temporarily unavailable" in exc_info.value.detail.lower()
        assert call_count == 3  # Should have tried 3 times
    
    @pytest.mark.asyncio
    async def test_connection_error_exponential_backoff(self):
        """Test that exponential backoff is applied correctly."""
        call_count = 0
        sleep_times = []
        
        @handle_database_error
        async def operation_with_connection_error():
            nonlocal call_count
            call_count += 1
            raise Exception("network unavailable")
        
        def mock_sleep(seconds):
            sleep_times.append(seconds)
        
        with patch('time.sleep', side_effect=mock_sleep):
            with pytest.raises(HTTPException):
                await operation_with_connection_error()
        
        # Should have exponential backoff: 2^1=2, 2^2=4
        assert sleep_times == [2, 4]
        assert call_count == 3
    
    @pytest.mark.asyncio
    async def test_general_database_error(self):
        """Test handling of general database errors (500 Internal Server Error)."""
        @handle_database_error
        async def operation_with_general_error():
            raise Exception("unexpected database error")
        
        with pytest.raises(HTTPException) as exc_info:
            await operation_with_general_error()
        
        assert exc_info.value.status_code == 500
        assert "internal" in exc_info.value.detail.lower()
    
    def test_sync_function_successful_operation(self):
        """Test that sync functions work correctly."""
        @handle_database_error
        def sync_successful_operation():
            return {"success": True, "data": "sync"}
        
        result = sync_successful_operation()
        assert result == {"success": True, "data": "sync"}
    
    def test_sync_function_unique_constraint(self):
        """Test sync function with unique constraint violation."""
        @handle_database_error
        def sync_operation_with_unique_violation():
            raise Exception("duplicate key value violates unique constraint")
        
        with pytest.raises(HTTPException) as exc_info:
            sync_operation_with_unique_violation()
        
        assert exc_info.value.status_code == 409
    
    def test_sync_function_connection_retry(self):
        """Test sync function with connection retry logic."""
        call_count = 0
        
        @handle_database_error
        def sync_operation_with_connection_error():
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                raise Exception("connection refused")
            return {"success": True}
        
        with patch('time.sleep'):
            result = sync_operation_with_connection_error()
        
        assert result == {"success": True}
        assert call_count == 2
    
    @pytest.mark.asyncio
    async def test_error_logging(self):
        """Test that errors are logged with appropriate details."""
        @handle_database_error
        async def operation_with_error():
            raise Exception("test error for logging")
        
        with patch('app.core.decorators.logger') as mock_logger:
            with pytest.raises(HTTPException):
                await operation_with_error()
            
            # Verify error was logged
            assert mock_logger.error.called
            call_args = mock_logger.error.call_args
            assert "test error for logging" in str(call_args)
    
    @pytest.mark.asyncio
    async def test_function_with_args_and_kwargs(self):
        """Test that decorator preserves function arguments."""
        @handle_database_error
        async def operation_with_params(arg1, arg2, kwarg1=None):
            return {"arg1": arg1, "arg2": arg2, "kwarg1": kwarg1}
        
        result = await operation_with_params("value1", "value2", kwarg1="kwvalue")
        assert result == {"arg1": "value1", "arg2": "value2", "kwarg1": "kwvalue"}
    
    @pytest.mark.asyncio
    async def test_multiple_error_keywords(self):
        """Test that error detection works with various keyword variations."""
        # Test unique variations
        unique_errors = [
            "unique constraint violated",
            "UNIQUE constraint failed",
            "duplicate key error"
        ]
        
        for error_msg in unique_errors:
            @handle_database_error
            async def operation():
                raise Exception(error_msg)
            
            with pytest.raises(HTTPException) as exc_info:
                await operation()
            assert exc_info.value.status_code == 409
        
        # Test foreign key variations
        fk_errors = [
            "foreign key constraint failed",
            "violates foreign key constraint",
            "fk_users_business_id violation"
        ]
        
        for error_msg in fk_errors:
            @handle_database_error
            async def operation():
                raise Exception(error_msg)
            
            with pytest.raises(HTTPException) as exc_info:
                await operation()
            assert exc_info.value.status_code == 400
        
        # Test connection variations
        connection_errors = [
            "connection refused",
            "connection timeout",
            "network error",
            "database unavailable"
        ]
        
        for error_msg in connection_errors:
            call_count = 0
            
            @handle_database_error
            async def operation():
                nonlocal call_count
                call_count += 1
                raise Exception(error_msg)
            
            with patch('time.sleep'):
                with pytest.raises(HTTPException) as exc_info:
                    await operation()
                assert exc_info.value.status_code == 503
                assert call_count == 3  # Should retry 3 times
    
    @pytest.mark.asyncio
    async def test_case_insensitive_error_detection(self):
        """Test that error detection is case-insensitive."""
        @handle_database_error
        async def operation_with_uppercase_error():
            raise Exception("UNIQUE CONSTRAINT VIOLATION")
        
        with pytest.raises(HTTPException) as exc_info:
            await operation_with_uppercase_error()
        
        assert exc_info.value.status_code == 409
    
    @pytest.mark.asyncio
    async def test_preserves_function_metadata(self):
        """Test that decorator preserves function name and docstring."""
        @handle_database_error
        async def documented_function():
            """This is a test function."""
            return "result"
        
        assert documented_function.__name__ == "documented_function"
        assert documented_function.__doc__ == "This is a test function."
