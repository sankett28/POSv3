# Verification script to check if Docker image was built correctly
# Run this after building the image to verify no localhost leaks

param(
    [string]$ImageTag = "sankett2811/posv3-frontend:v3"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verifying Docker Image: $ImageTag" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if image exists
$imageExists = docker images -q $ImageTag
if (-not $imageExists) {
    Write-Host "❌ ERROR: Image $ImageTag not found!" -ForegroundColor Red
    Write-Host "Build the image first using docker-build-production.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Image found" -ForegroundColor Green
Write-Host ""

# Create a temporary container to inspect files
Write-Host "Creating temporary container to inspect build output..." -ForegroundColor Yellow
$containerId = docker create $ImageTag
if (-not $containerId) {
    Write-Host "❌ ERROR: Failed to create container" -ForegroundColor Red
    exit 1
}

Write-Host "Container ID: $containerId" -ForegroundColor Gray
Write-Host ""

# Copy .next directory from container
Write-Host "Extracting build artifacts..." -ForegroundColor Yellow
$tempDir = New-Item -ItemType Directory -Path ".\temp-verify-$([guid]::NewGuid().ToString().Substring(0,8))" -Force
docker cp "${containerId}:/app/.next" "$tempDir" 2>$null

if (-not (Test-Path "$tempDir\.next")) {
    Write-Host "❌ ERROR: Could not extract .next directory" -ForegroundColor Red
    docker rm $containerId | Out-Null
    Remove-Item -Recurse -Force $tempDir
    exit 1
}

Write-Host "✅ Build artifacts extracted" -ForegroundColor Green
Write-Host ""

# Scan for localhost references
Write-Host "Scanning for localhost references..." -ForegroundColor Yellow
$localhostFound = $false
$patterns = @("localhost:8000", "127.0.0.1:8000", "http://localhost")

foreach ($pattern in $patterns) {
    $matches = Get-ChildItem -Path "$tempDir\.next\static" -Recurse -File | 
        Select-String -Pattern $pattern -SimpleMatch -ErrorAction SilentlyContinue
    
    if ($matches) {
        Write-Host "❌ Found '$pattern' in:" -ForegroundColor Red
        $matches | ForEach-Object { 
            Write-Host "   $($_.Path)" -ForegroundColor Red 
        }
        $localhostFound = $true
    }
}

if (-not $localhostFound) {
    Write-Host "✅ No localhost references found in build output" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ CRITICAL: Localhost references detected!" -ForegroundColor Red
    Write-Host "This image will NOT work in production." -ForegroundColor Red
    Write-Host "Rebuild with correct --build-arg values." -ForegroundColor Yellow
}

Write-Host ""

# Check for expected production URL
Write-Host "Checking for production backend URL..." -ForegroundColor Yellow
$prodUrlFound = Get-ChildItem -Path "$tempDir\.next\static" -Recurse -File | 
    Select-String -Pattern "posv3-614312738437.asia-southeast1.run.app" -SimpleMatch -ErrorAction SilentlyContinue

if ($prodUrlFound) {
    Write-Host "✅ Production backend URL found in build" -ForegroundColor Green
} else {
    Write-Host "⚠️  WARNING: Production backend URL not found" -ForegroundColor Yellow
    Write-Host "This might be okay if using a different backend URL" -ForegroundColor Gray
}

# Cleanup
Write-Host ""
Write-Host "Cleaning up..." -ForegroundColor Yellow
docker rm $containerId | Out-Null
Remove-Item -Recurse -Force $tempDir

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if (-not $localhostFound) {
    Write-Host "✅ Verification PASSED" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Image is safe to deploy to production." -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Verification FAILED" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "DO NOT deploy this image to production!" -ForegroundColor Red
    exit 1
}
