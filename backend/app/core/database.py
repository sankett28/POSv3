"""Supabase database client initialization."""
from supabase import create_client, Client
from app.core.config import settings
from typing import Optional


# Global Supabase client instance
_supabase_client: Optional[Client] = None


def get_supabase() -> Client:
    """Get or create Supabase client instance."""
    global _supabase_client
    
    # #region agent log
    import json
    with open('e:\\posv3\\POSv3\\.cursor\\debug.log', 'a') as f:
        f.write(json.dumps({"location":"database.py:11","message":"get_supabase called","data":{"clientExists":_supabase_client is not None,"hasUrl":bool(settings.supabase_url),"hasKey":bool(settings.supabase_service_role_key)},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"E"}) + '\n')
    # #endregion
    if _supabase_client is None:
        if not settings.supabase_url or not settings.supabase_service_role_key:
            # #region agent log
            with open('e:\\posv3\\POSv3\\.cursor\\debug.log', 'a') as f:
                f.write(json.dumps({"location":"database.py:17","message":"Supabase config missing","data":{"hasUrl":bool(settings.supabase_url),"hasKey":bool(settings.supabase_service_role_key)},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"E"}) + '\n')
            # #endregion
            raise ValueError(
                "Supabase configuration is required. "
                "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env, "
                "or use TEST_USER_EMAIL, TEST_USER_PASSWORD, and TEST_USER_ID for test mode."
            )
        # #region agent log
        with open('e:\\posv3\\POSv3\\.cursor\\debug.log', 'a') as f:
            f.write(json.dumps({"location":"database.py:23","message":"Creating Supabase client","data":{"url":settings.supabase_url},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"E"}) + '\n')
        # #endregion
        _supabase_client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key
        )
        # #region agent log
        with open('e:\\posv3\\POSv3\\.cursor\\debug.log', 'a') as f:
            f.write(json.dumps({"location":"database.py:27","message":"Supabase client created","data":{"clientType":str(type(_supabase_client))},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"E"}) + '\n')
        # #endregion
    
    return _supabase_client


def reset_supabase_client() -> None:
    """Reset the Supabase client (useful for testing)."""
    global _supabase_client
    _supabase_client = None

