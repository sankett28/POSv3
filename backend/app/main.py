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

# Configure CORS - MUST be added before routers and other middleware
# Allow requests ONLY from frontend on port 3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Explicitly allow only frontend origin
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],  # All required methods
    allow_headers=["*"],  # Allow all headers including Authorization
    expose_headers=["*"],  # Expose all headers to frontend
)

# Add request logging middleware
@app.middleware("http")
async def log_requests(request, call_next):
    # #region agent log
    import json
    with open('e:\\posv3\\POSv3\\.cursor\\debug.log', 'a') as f:
        f.write(json.dumps({"location":"main.py:19","message":"Request received","data":{"method":request.method,"url":str(request.url),"path":request.url.path},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"G"}) + '\n')
    # #endregion
    try:
        response = await call_next(request)
        # #region agent log
        with open('e:\\posv3\\POSv3\\.cursor\\debug.log', 'a') as f:
            f.write(json.dumps({"location":"main.py:25","message":"Request processed","data":{"method":request.method,"path":request.url.path,"status":response.status_code},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"G"}) + '\n')
        # #endregion
        return response
    except Exception as e:
        # #region agent log
        with open('e:\\posv3\\POSv3\\.cursor\\debug.log', 'a') as f:
            f.write(json.dumps({"location":"main.py:30","message":"Request error","data":{"method":request.method,"path":request.url.path,"error":str(e)},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"G"}) + '\n')
        # #endregion
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
    # #region agent log
    import json
    with open('e:\\posv3\\POSv3\\.cursor\\debug.log', 'a') as f:
        f.write(json.dumps({"location":"main.py:38","message":"Backend startup event","data":{"supabaseUrl":bool(settings.supabase_url)},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"F"}) + '\n')
    # #endregion
    logger.info("Starting Retail Boss POS API...")
    if settings.supabase_url:
        logger.info(f"Supabase URL: {settings.supabase_url}")
    if settings.test_user_email:
        logger.info(f"Test user enabled: {settings.test_user_email}")


@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event."""
    logger.info("Shutting down Retail Boss POS API...")

