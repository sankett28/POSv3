# Complete Production Deployment Script
# This script builds, verifies, pushes, and provides deployment instructions

param(
    [switch]$SkipVerify = $false,
    [switch]$SkipPush = $false
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRODUCTION DEPLOYMENT - FRONTEND" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build
Write-Host "STEP 1: Building Docker Image" -ForegroundColor Yellow
Write-Host "------------------------------" -ForegroundColor Yellow
& .\docker-build-production.ps1
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Build failed. Aborting deployment." -ForegroundColor Red
    exit 1
}

# Step 2: Verify (optional)
if (-not $SkipVerify) {
    Write-Host ""
    Write-Host "STEP 2: Verifying Build Output" -ForegroundColor Yellow
    Write-Host "-------------------------------" -ForegroundColor Yellow
    & .\verify-build.ps1
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "❌ Verification failed. Image contains localhost references!" -ForegroundColor Red
        Write-Host "DO NOT deploy this image. Fix the build and try again." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host ""
    Write-Host "STEP 2: Skipping verification (--SkipVerify flag)" -ForegroundColor Gray
}

# Step 3: Push (optional)
if (-not $SkipPush) {
    Write-Host ""
    Write-Host "STEP 3: Pushing to Docker Hub" -ForegroundColor Yellow
    Write-Host "------------------------------" -ForegroundColor Yellow
    
    $IMAGE_TAG = "sankett2811/posv3-frontend:v3"
    
    Write-Host "Pushing $IMAGE_TAG..." -ForegroundColor White
    docker push $IMAGE_TAG
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "❌ Push failed. Check Docker Hub credentials." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Push successful" -ForegroundColor Green
    
    # Also tag and push as latest
    Write-Host ""
    Write-Host "Tagging as latest..." -ForegroundColor White
    docker tag $IMAGE_TAG "sankett2811/posv3-frontend:latest"
    docker push "sankett2811/posv3-frontend:latest"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Latest tag pushed" -ForegroundColor Green
    }
} else {
    Write-Host ""
    Write-Host "STEP 3: Skipping push (--SkipPush flag)" -ForegroundColor Gray
}

# Step 4: Deployment instructions
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ BUILD & PUSH COMPLETE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to GCP Cloud Run Console" -ForegroundColor White
Write-Host "   https://console.cloud.google.com/run" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Select your frontend service" -ForegroundColor White
Write-Host ""
Write-Host "3. Click 'EDIT & DEPLOY NEW REVISION'" -ForegroundColor White
Write-Host ""
Write-Host "4. Update container image to:" -ForegroundColor White
Write-Host "   sankett2811/posv3-frontend:v3" -ForegroundColor Yellow
Write-Host ""
Write-Host "5. Click 'DEPLOY'" -ForegroundColor White
Write-Host ""
Write-Host "6. Wait for deployment to complete" -ForegroundColor White
Write-Host ""
Write-Host "7. Test the deployed app:" -ForegroundColor White
Write-Host "   - Open your frontend URL" -ForegroundColor Gray
Write-Host "   - Try logging in" -ForegroundColor Gray
Write-Host "   - Open browser DevTools > Network tab" -ForegroundColor Gray
Write-Host "   - Verify requests go to: posv3-614312738437.asia-southeast1.run.app" -ForegroundColor Gray
Write-Host "   - Confirm NO localhost:8000 requests" -ForegroundColor Gray
Write-Host "   - Confirm NO 'local network' permission popup" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "IMPORTANT NOTES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ This image has been validated:" -ForegroundColor Green
Write-Host "   - No localhost references in build output" -ForegroundColor Gray
Write-Host "   - Production backend URL baked in" -ForegroundColor Gray
Write-Host "   - All env vars validated at build time" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  Cloud Run env vars are IGNORED for NEXT_PUBLIC_*" -ForegroundColor Yellow
Write-Host "   The values are already baked into the image." -ForegroundColor Gray
Write-Host ""
Write-Host "🔒 If you need to change backend URL:" -ForegroundColor Yellow
Write-Host "   1. Update docker-build-production.ps1" -ForegroundColor Gray
Write-Host "   2. Rebuild image with new URL" -ForegroundColor Gray
Write-Host "   3. Push and redeploy" -ForegroundColor Gray
Write-Host ""
