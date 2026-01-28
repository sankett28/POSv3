# Test Docker Build Script
# This script tests the Docker build locally with proper environment variables

Write-Host "🧪 Testing Docker Build..." -ForegroundColor Green
Write-Host ""

# Read environment variables from .env.local
$envFile = Get-Content .env.local
$apiBaseUrl = ($envFile | Select-String "NEXT_PUBLIC_API_BASE_URL=").ToString().Split("=")[1]
$supabaseUrl = ($envFile | Select-String "NEXT_PUBLIC_SUPABASE_URL=").ToString().Split("=")[1]
$supabaseAnonKey = ($envFile | Select-String "NEXT_PUBLIC_SUPABASE_ANON_KEY=").ToString().Split("=")[1]

Write-Host "📋 Build Arguments:" -ForegroundColor Cyan
Write-Host "  NEXT_PUBLIC_API_BASE_URL: $apiBaseUrl" -ForegroundColor White
Write-Host "  NEXT_PUBLIC_SUPABASE_URL: $supabaseUrl" -ForegroundColor White
Write-Host "  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey.Substring(0, 20)}..." -ForegroundColor White
Write-Host ""

# Verify all variables are set
if (-not $apiBaseUrl -or -not $supabaseUrl -or -not $supabaseAnonKey) {
    Write-Host "❌ Error: Missing environment variables in .env.local" -ForegroundColor Red
    Write-Host "Please ensure .env.local contains:" -ForegroundColor Yellow
    Write-Host "  - NEXT_PUBLIC_API_BASE_URL" -ForegroundColor Yellow
    Write-Host "  - NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Yellow
    Write-Host "  - NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Yellow
    exit 1
}

Write-Host "🔨 Building Docker image..." -ForegroundColor Yellow
Write-Host ""

# Build Docker image with build args
docker build -t posv3-frontend-test:latest `
  --build-arg NEXT_PUBLIC_API_BASE_URL=$apiBaseUrl `
  --build-arg NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl `
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabaseAnonKey `
  .

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Docker build successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 To run the container:" -ForegroundColor Yellow
    Write-Host "  docker run -p 3000:3000 posv3-frontend-test:latest" -ForegroundColor White
    Write-Host ""
    Write-Host "🧪 To test:" -ForegroundColor Yellow
    Write-Host "  1. Run the container" -ForegroundColor White
    Write-Host "  2. Open http://localhost:3000" -ForegroundColor White
    Write-Host "  3. Check if API calls go to: $apiBaseUrl" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Docker build failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Check that .env.local has all required variables" -ForegroundColor White
    Write-Host "  2. Verify Docker is running" -ForegroundColor White
    Write-Host "  3. Check the error messages above" -ForegroundColor White
    Write-Host ""
    exit 1
}
