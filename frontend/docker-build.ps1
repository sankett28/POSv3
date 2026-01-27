# Docker build script for POSv3 Frontend
# Reads environment variables from .env.local and passes them as build args

Write-Host "Building POSv3 Frontend Docker Image..." -ForegroundColor Green

# Read environment variables from .env.local
$envFile = Get-Content .env.local
$apiBaseUrl = ($envFile | Select-String "NEXT_PUBLIC_API_BASE_URL=").ToString().Split("=")[1]
$supabaseUrl = ($envFile | Select-String "NEXT_PUBLIC_SUPABASE_URL=").ToString().Split("=")[1]
$supabaseAnonKey = ($envFile | Select-String "NEXT_PUBLIC_SUPABASE_ANON_KEY=").ToString().Split("=")[1]

Write-Host "API Base URL: $apiBaseUrl" -ForegroundColor Cyan
Write-Host "Supabase URL: $supabaseUrl" -ForegroundColor Cyan
Write-Host "Supabase Anon Key: ${supabaseAnonKey.Substring(0, 20)}..." -ForegroundColor Cyan

# Build Docker image
docker build -t sankett2811/posv3-frontend:v2 `
  --build-arg NEXT_PUBLIC_API_BASE_URL=$apiBaseUrl `
  --build-arg NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl `
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabaseAnonKey `
  .

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Docker image built successfully!" -ForegroundColor Green
    Write-Host "Image: sankett2811/posv3-frontend:v2" -ForegroundColor Cyan
    Write-Host "`nTo run the container:" -ForegroundColor Yellow
    Write-Host "docker run -p 3000:3000 sankett2811/posv3-frontend:v2" -ForegroundColor White
} else {
    Write-Host "`n❌ Docker build failed!" -ForegroundColor Red
    exit 1
}
