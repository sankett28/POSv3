# GCP Cloud Run Deployment Script for PowerShell
# Usage: .\deploy.ps1 [PROJECT_ID] [REGION]
# Environment variables should be pre-configured in GCP Cloud Run Console

param(
    [string]$ProjectId = $env:GOOGLE_CLOUD_PROJECT,
    [string]$Region = "asia-southeast1",
    [string]$ServiceName = "posv3"
)

if (-not $ProjectId) {
    Write-Host "Error: Please provide your GCP Project ID" -ForegroundColor Red
    Write-Host "Usage: .\deploy.ps1 -ProjectId YOUR_PROJECT_ID [-Region asia-southeast1]" -ForegroundColor Yellow
    Write-Host "Or set GOOGLE_CLOUD_PROJECT environment variable" -ForegroundColor Yellow
    exit 1
}

Write-Host "🚀 Deploying Backend to GCP Cloud Run..." -ForegroundColor Green
Write-Host "Project ID: $ProjectId" -ForegroundColor Cyan
Write-Host "Region: $Region" -ForegroundColor Cyan
Write-Host "Service: $ServiceName" -ForegroundColor Cyan
Write-Host ""

# Set project
Write-Host "📋 Setting GCP project..." -ForegroundColor Yellow
gcloud config set project $ProjectId

# Build and push image
Write-Host "📦 Building and pushing Docker image..." -ForegroundColor Yellow
gcloud builds submit --tag "gcr.io/$ProjectId/$ServiceName-backend"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Deploy to Cloud Run (uses existing environment variables from GCP)
Write-Host "🚀 Deploying to Cloud Run..." -ForegroundColor Yellow
Write-Host "ℹ️  Using environment variables already configured in GCP Cloud Run" -ForegroundColor Cyan
Write-Host ""

gcloud run deploy $ServiceName `
  --image "gcr.io/$ProjectId/$ServiceName-backend" `
  --platform managed `
  --region $Region `
  --allow-unauthenticated `
  --port 8000 `
  --memory 512Mi `
  --cpu 1 `
  --min-instances 0 `
  --max-instances 10

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}

# Get service URL
Write-Host ""
Write-Host "🔍 Getting service URL..." -ForegroundColor Yellow
$serviceUrl = gcloud run services describe $ServiceName `
  --region $Region `
  --format 'value(status.url)'

Write-Host ""
Write-Host "✅ Backend Deployment Complete!" -ForegroundColor Green
Write-Host "Service URL: $serviceUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "🧪 Testing deployment..." -ForegroundColor Yellow
Write-Host "Health check: $serviceUrl/health" -ForegroundColor Cyan

# Test health endpoint
try {
    $response = Invoke-WebRequest -Uri "$serviceUrl/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Health check passed!" -ForegroundColor Green
        Write-Host "Response: $($response.Content)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "⚠️  Health check failed. Service may still be starting..." -ForegroundColor Yellow
    Write-Host "Please check: $serviceUrl/health" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "📝 Notes:" -ForegroundColor Yellow
Write-Host "- Environment variables are managed in GCP Cloud Run Console" -ForegroundColor White
Write-Host "- To update env vars: Go to Cloud Run Console → Select service → Edit & Deploy New Revision" -ForegroundColor White
Write-Host "- API Documentation: $serviceUrl/docs" -ForegroundColor White
Write-Host ""

