"""FastAPI application entrypoint."""
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.api.v1.router import api_router

# Setup logging
setup_logging()

# Create FastAPI app
app = FastAPI(
    title="Retail Boss POS API",
    description="V1 POS System API for Indian Kirana Stores",
    version="1.0.0"
)

# Configure CORS - MUST be added before routers and other middleware
# Origins are configurable via CORS_ORIGINS environment variable (comma-separated)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],  # All required methods
    allow_headers=["*"],  # Allow all headers including Authorization
    expose_headers=["*"],  # Expose all headers to frontend
)

# Add validation exception handler for better error messages
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors and return detailed error messages."""
    logger.error(f"Validation error on {request.method} {request.url}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors(), "body": exc.body}
    )

# Add request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    try:
        # Log request info for debugging
        if "bulk-update-by-category" in str(request.url):
            logger.info(f"Bulk update request: {request.method} {request.url}")
        response = await call_next(request)
        return response
    except Exception as e:
        raise

# Include API router
app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": "1.0.0"}


@app.on_event("startup")
async def startup_event():
    """Application startup event."""
    logger.info("Starting Retail Boss POS API...")
    
    # Validate Supabase configuration
    if settings.supabase_url:
        logger.info(f"Supabase URL: {settings.supabase_url}")
    
    logger.info(f"CORS origins: {settings.cors_origins}")
    
    # Validate Redis connection
    try:
        from app.core.redis import redis_client
        redis_client.ping()
        logger.info(f"✅ Redis connection successful: {settings.redis_url}")
    except Exception as e:
        logger.error(f"❌ Redis connection failed: {e}")
        logger.error("Application cannot start without Redis. Please check REDIS_URL in .env")
        raise RuntimeError(f"Redis connection failed: {e}")


@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event."""
    logger.info("Shutting down Retail Boss POS API...")

