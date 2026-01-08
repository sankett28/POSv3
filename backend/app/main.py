"""FastAPI application entrypoint."""
from fastapi import FastAPI
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

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    if settings.supabase_url:
        logger.info(f"Supabase URL: {settings.supabase_url}")
    if settings.test_user_email:
        logger.info(f"Test user enabled: {settings.test_user_email}")


@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event."""
    logger.info("Shutting down Retail Boss POS API...")

