# Production Docker Build Script for Frontend
# This script ensures all required environment variables are passed at build time

# CRITICAL: Set your production backend URL here
$BACKEND_URL = "https://posv3-614312738437.asia-southeast1.run.app"
$SUPABASE_URL = "https://jegyibzpezsielknpejv.supabase.co"
$SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplZ3lpYnpwZXpzaWVsa25wZWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4Mzc2NjYsImV4cCI6MjA4MzQxMzY2Nn0.tBLkbqWPe77usiAedLy6JjZBBhWRUgU2OKRDeA90JJ4"

# Docker image tag
$IMAGE_TAG = "sankett2811/posv3-frontend:v3"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Building Production Frontend Docker Image" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend URL: $BACKEND_URL" -ForegroundColor Yellow
Write-Host "Supabase URL: $SUPABASE_URL" -ForegroundColor Yellow
Write-Host "Image Tag: $IMAGE_TAG" -ForegroundColor Yellow
Write-Host ""

# Validate URLs
if ($BACKEND_URL -like "*localhost*") {
    Write-Host "❌ ERROR: BACKEND_URL contains 'localhost'!" -ForegroundColor Red
    Write-Host "Production builds must use the actual Cloud Run URL." -ForegroundColor Red
    exit 1
}

if (-not $BACKEND_URL.StartsWith("https://")) {
    Write-Host "⚠️  WARNING: BACKEND_URL should use HTTPS in production" -ForegroundColor Yellow
}

Write-Host "Starting Docker build..." -ForegroundColor Green
Write-Host ""

# Build with all required args
docker build --no-cache `
  --build-arg NEXT_PUBLIC_API_BASE_URL=$BACKEND_URL `
  --build-arg NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL `
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY `
  -t $IMAGE_TAG `
  .

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ Build successful!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Push image: docker push $IMAGE_TAG" -ForegroundColor White
    Write-Host "2. Deploy to Cloud Run with this image" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "❌ Build failed!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check the error messages above." -ForegroundColor Yellow
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "- Missing environment variables" -ForegroundColor White
    Write-Host "- Localhost detected in build output" -ForegroundColor White
    Write-Host "- Build errors in Next.js code" -ForegroundColor White
    exit 1
}
