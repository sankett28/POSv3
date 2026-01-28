# GCP Cloud Run Deployment Script for Frontend (PowerShell)
# Usage: .\deploy.ps1 [PROJECT_ID] [REGION]

param(
    [string]$ProjectId = $env:GOOGLE_CLOUD_PROJECT,
    [string]$Region = "asia-southeast1",
    [string]$ServiceName = "posv3-frontend"
)

if (-not $ProjectId) {
    Write-Host "Error: Please provide your GCP Project ID" -ForegroundColor Red
    Write-Host "Usage: .\deploy.ps1 -ProjectId YOUR_PROJECT_ID [-Region asia-southeast1]" -ForegroundColor Yellow
    exit 1
}

Write-Host "🚀 Deploying Frontend to GCP Cloud Run..." -ForegroundColor Green
Write-Host "Project ID: $ProjectId" -ForegroundColor Cyan
Write-Host "Region: $Region" -ForegroundColor Cyan
Write-Host "Service: $ServiceName" -ForegroundColor Cyan
Write-Host ""

# Set project
Write-Host "📋 Setting GCP project..." -ForegroundColor Yellow
gcloud config set project $ProjectId

# Deploy from source with build env vars
Write-Host ""
Write-Host "🚀 Deploying from source with build environment variables..." -ForegroundColor Yellow
Write-Host ""

gcloud run deploy $ServiceName `
  --source . `
  --region $Region `
  --allow-unauthenticated `
  --port 3000 `
  --memory 512Mi `
  --cpu 1 `
  --min-instances 0 `
  --max-instances 10 `
  --build-env-vars "NEXT_PUBLIC_API_BASE_URL=https://posv3-614312738437.asia-southeast1.run.app,NEXT_PUBLIC_SUPABASE_URL=https://jegyibzpezsielknpejv.supabase.co,NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplZ3lpYnpwZXpzaWVsa25wZWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4Mzc2NjYsImV4cCI6MjA4MzQxMzY2Nn0.tBLkbqWPe77usiAedLy6JjZBBhWRUgU2OKRDeA90JJ4"

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
Write-Host "✅ Frontend Deployment Complete!" -ForegroundColor Green
Write-Host "Service URL: $serviceUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "🧪 Testing deployment..." -ForegroundColor Yellow

# Test homepage
try {
    $response = Invoke-WebRequest -Uri $serviceUrl -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Homepage loaded successfully!" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Homepage check failed. Service may still be starting..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open: $serviceUrl/login" -ForegroundColor White
Write-Host "2. Open DevTools (F12) → Console tab" -ForegroundColor White
Write-Host "3. Look for: 🔧 API Configuration" -ForegroundColor White
Write-Host "4. Verify envVar shows production URL (not undefined)" -ForegroundColor White
Write-Host "5. Try to login and check Network tab" -ForegroundColor White
Write-Host ""
