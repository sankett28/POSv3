# Deployment Diagnostic Script
# This script helps diagnose why the deployed site is still calling localhost

Write-Host "🔍 Diagnosing Deployment Issue..." -ForegroundColor Green
Write-Host ""

# Check 1: Local .env.local file
Write-Host "1️⃣ Checking local .env.local file..." -ForegroundColor Yellow
if (Test-Path .env.local) {
    $envContent = Get-Content .env.local
    $apiUrl = ($envContent | Select-String "NEXT_PUBLIC_API_BASE_URL=").ToString()
    
    if ($apiUrl) {
        Write-Host "   ✅ Found: $apiUrl" -ForegroundColor Green
        
        if ($apiUrl -match "localhost") {
            Write-Host "   ⚠️  WARNING: Contains localhost!" -ForegroundColor Red
        }
        if ($apiUrl -match "/$") {
            Write-Host "   ⚠️  WARNING: Has trailing slash!" -ForegroundColor Red
        }
    } else {
        Write-Host "   ❌ NEXT_PUBLIC_API_BASE_URL not found in .env.local" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ .env.local file not found" -ForegroundColor Red
}

Write-Host ""

# Check 2: Code files
Write-Host "2️⃣ Checking code files for hardcoded localhost..." -ForegroundColor Yellow

$files = @(
    "lib/api.ts",
    "lib/theme.ts",
    "lib/api/onboarding.ts"
)

$foundIssues = $false

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Check for wrong variable names
        if ($content -match "NEXT_PUBLIC_API_BASE_URL_NEW") {
            Write-Host "   ❌ $file uses NEXT_PUBLIC_API_BASE_URL_NEW (wrong!)" -ForegroundColor Red
            $foundIssues = $true
        }
        if ($content -match "NEXT_PUBLIC_API_URL[^_]") {
            Write-Host "   ❌ $file uses NEXT_PUBLIC_API_URL (wrong!)" -ForegroundColor Red
            $foundIssues = $true
        }
        
        # Check for hardcoded localhost (not as fallback)
        if ($content -match "http://localhost:8000" -and $content -notmatch "\|\| 'http://localhost:8000'") {
            Write-Host "   ❌ $file has hardcoded localhost (not as fallback)" -ForegroundColor Red
            $foundIssues = $true
        }
    }
}

if (-not $foundIssues) {
    Write-Host "   ✅ No issues found in code files" -ForegroundColor Green
}

Write-Host ""

# Check 3: Dockerfile
Write-Host "3️⃣ Checking Dockerfile..." -ForegroundColor Yellow
if (Test-Path Dockerfile) {
    $dockerContent = Get-Content Dockerfile -Raw
    
    if ($dockerContent -match "NEXT_PUBLIC_API_BASE_URL_NEW") {
        Write-Host "   ❌ Dockerfile uses NEXT_PUBLIC_API_BASE_URL_NEW (wrong!)" -ForegroundColor Red
    } elseif ($dockerContent -match "ARG NEXT_PUBLIC_API_BASE_URL") {
        Write-Host "   ✅ Dockerfile uses correct variable name" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Dockerfile doesn't declare NEXT_PUBLIC_API_BASE_URL" -ForegroundColor Yellow
    }
}

Write-Host ""

# Check 4: Build output
Write-Host "4️⃣ Checking if .next build exists..." -ForegroundColor Yellow
if (Test-Path .next) {
    Write-Host "   ⚠️  .next directory exists (old build)" -ForegroundColor Yellow
    Write-Host "   💡 Consider deleting it: Remove-Item -Recurse -Force .next" -ForegroundColor Cyan
} else {
    Write-Host "   ✅ No local build found" -ForegroundColor Green
}

Write-Host ""
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "📋 DIAGNOSIS SUMMARY" -ForegroundColor Green
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host ""

Write-Host "If your deployed site is still calling localhost:8000, it means:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. The deployed build was created WITHOUT the environment variables" -ForegroundColor White
Write-Host "2. You need to REDEPLOY with build environment variables set in GCP" -ForegroundColor White
Write-Host ""
Write-Host "🎯 SOLUTION:" -ForegroundColor Green
Write-Host ""
Write-Host "Go to GCP Cloud Run Console:" -ForegroundColor Cyan
Write-Host "  https://console.cloud.google.com/run" -ForegroundColor White
Write-Host ""
Write-Host "1. Find your frontend service" -ForegroundColor White
Write-Host "2. Click 'EDIT & DEPLOY NEW REVISION'" -ForegroundColor White
Write-Host "3. Scroll to 'Build configuration' section" -ForegroundColor White
Write-Host "4. Add these BUILD ENVIRONMENT VARIABLES:" -ForegroundColor White
Write-Host ""
Write-Host "   NEXT_PUBLIC_API_BASE_URL=https://posv3-614312738437.asia-southeast1.run.app" -ForegroundColor Yellow
Write-Host "   NEXT_PUBLIC_SUPABASE_URL=https://jegyibzpezsielknpejv.supabase.co" -ForegroundColor Yellow
Write-Host "   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplZ3lpYnpwZXpzaWVsa25wZWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4Mzc2NjYsImV4cCI6MjA4MzQxMzY2Nn0.tBLkbqWPe77usiAedLy6JjZBBhWRUgU2OKRDeA90JJ4" -ForegroundColor Yellow
Write-Host ""
Write-Host "5. Click 'DEPLOY'" -ForegroundColor White
Write-Host "6. Wait 10 minutes for build" -ForegroundColor White
Write-Host "7. Clear browser cache and test" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANT: These must be BUILD environment variables, not runtime!" -ForegroundColor Red
Write-Host ""
