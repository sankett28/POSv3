# GCP Cloud Run Deployment Script for PowerShell
# Usage: .\deploy.ps1 [PROJECT_ID] [REGION]

param(
    [string]$ProjectId = $env:GOOGLE_CLOUD_PROJECT,
    [string]$Region = "us-central1"
)

if (-not $ProjectId) {
    Write-Host "Error: Please provide your GCP Project ID" -ForegroundColor Red
    Write-Host "Usage: .\deploy.ps1 -ProjectId YOUR_PROJECT_ID [-Region us-central1]" -ForegroundColor Yellow
    Write-Host "Or set GOOGLE_CLOUD_PROJECT environment variable" -ForegroundColor Yellow
    exit 1
}

Write-Host "🚀 Deploying to GCP Cloud Run..." -ForegroundColor Green
Write-Host "Project ID: $ProjectId" -ForegroundColor Cyan
Write-Host "Region: $Region" -ForegroundColor Cyan
Write-Host ""

# Set project
Write-Host "📋 Setting GCP project..." -ForegroundColor Yellow
gcloud config set project $ProjectId

# Build and push image
Write-Host "📦 Building and pushing Docker image..." -ForegroundColor Yellow
gcloud builds submit --tag "gcr.io/$ProjectId/pos-backend"

# Deploy to Cloud Run
Write-Host "🚀 Deploying to Cloud Run..." -ForegroundColor Yellow
Write-Host "⚠️  Note: You'll need to set environment variables manually or use secrets" -ForegroundColor Yellow
Write-Host ""
gcloud run deploy pos-backend `
  --image "gcr.io/$ProjectId/pos-backend" `
  --platform managed `
  --region $Region `
  --allow-unauthenticated `
  --port 8000 `
  --memory 512Mi `
  --cpu 1 `
  --min-instances 0 `
  --max-instances 10

# Get service URL
Write-Host "🔍 Getting service URL..." -ForegroundColor Yellow
$serviceUrl = gcloud run services describe pos-backend `
  --region $Region `
  --format 'value(status.url)'

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "Service URL: $serviceUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Set environment variables:"
Write-Host "   gcloud run services update pos-backend --region $Region --set-env-vars 'SUPABASE_URL=...,SUPABASE_SERVICE_ROLE_KEY=...,CORS_ORIGINS=...'"
Write-Host ""
Write-Host "2. Or use secrets (recommended):"
Write-Host "   See DEPLOYMENT.md for instructions"
Write-Host ""
Write-Host "3. Test your deployment:"
Write-Host "   curl $serviceUrl/health"

