"""Health check endpoints."""
from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from app.core.database import get_supabase
from app.core.config import settings
from typing import Dict, Any
import time

router = APIRouter()


@router.get("/health", tags=["health"])
async def health_check() -> Dict[str, Any]:
    """
    Health check endpoint.
    
    Returns the health status of the API and its dependencies.
    """
    health_status: Dict[str, Any] = {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": int(time.time()),
        "checks": {}
    }
    
    overall_healthy = True
    
    # Check database connectivity
    try:
        supabase = get_supabase()
        # Perform a simple query to verify database connection
        supabase.table("products").select("id").limit(1).execute()
        health_status["checks"]["database"] = {
            "status": "healthy",
            "message": "Database connection successful"
        }
    except ValueError as e:
        # Configuration missing
        health_status["checks"]["database"] = {
            "status": "warning",
            "message": f"Database not configured: {str(e)}"
        }
    except Exception as e:
        overall_healthy = False
        health_status["checks"]["database"] = {
            "status": "unhealthy",
            "message": f"Database connection failed: {str(e)}"
        }
    
    # Check configuration
    config_healthy = bool(settings.supabase_url and settings.supabase_service_role_key)
    health_status["checks"]["configuration"] = {
        "status": "healthy" if config_healthy else "warning",
        "message": "Configuration loaded" if config_healthy else "Missing Supabase configuration"
    }
    if not config_healthy:
        overall_healthy = False
    
    # Set overall status
    health_status["status"] = "healthy" if overall_healthy else "degraded"
    
    # Return appropriate status code
    status_code = status.HTTP_200_OK if overall_healthy else status.HTTP_503_SERVICE_UNAVAILABLE
    
    return JSONResponse(
        content=health_status,
        status_code=status_code
    )


@router.get("/health/live", tags=["health"])
async def liveness_check() -> Dict[str, str]:
    """
    Liveness probe endpoint.
    
    Simple endpoint to check if the service is running.
    Used by Kubernetes and other orchestration tools.
    """
    return {
        "status": "alive",
        "timestamp": int(time.time())
    }


@router.get("/health/ready", tags=["health"])
async def readiness_check() -> Dict[str, Any]:
    """
    Readiness probe endpoint.
    
    Checks if the service is ready to accept traffic.
    Verifies critical dependencies like database connectivity.
    """
    try:
        supabase = get_supabase()
        # Perform a simple query to verify database connection
        supabase.table("products").select("id").limit(1).execute()
        return {
            "status": "ready",
            "timestamp": int(time.time())
        }
    except ValueError as e:
        # Configuration missing - service might still be ready for test mode
        return {
            "status": "ready",
            "message": "Service ready (test mode - database not configured)",
            "timestamp": int(time.time())
        }
    except Exception as e:
        return JSONResponse(
            content={
                "status": "not_ready",
                "message": f"Service not ready: {str(e)}",
                "timestamp": int(time.time())
            },
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE
        )

