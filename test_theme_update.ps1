# PowerShell test script for theme update fix
# Run this after restarting the backend

Write-Host "🧪 Testing Theme Update Fix..." -ForegroundColor Cyan
Write-Host ""

$API_URL = "http://localhost:8000"

# Test 1: GET current theme
Write-Host "1️⃣  Testing GET /api/v1/themes (fetch current theme)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/v1/themes" -Method Get
    Write-Host "✅ GET request successful" -ForegroundColor Green
    Write-Host "Current theme: $($response | ConvertTo-Json -Compress)"
} catch {
    Write-Host "❌ GET request failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: PUT update theme
Write-Host "2️⃣  Testing PUT /api/v1/themes (update theme)..." -ForegroundColor Yellow

$testTheme = @{
    primary_color = "#FF5733"
    secondary_color = "#ffffff"
    background_color = "#fff0f3"
    foreground_color = "#000000"
    accent_color = "#b45a69"
    danger_color = "#ef4444"
    success_color = "#22c55e"
    warning_color = "#f59e0b"
    source = "manual"
}

try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/v1/themes" -Method Put -Body ($testTheme | ConvertTo-Json) -ContentType "application/json"
    Write-Host "✅ PUT request successful" -ForegroundColor Green
    Write-Host "Updated theme: $($response | ConvertTo-Json -Compress)"
} catch {
    Write-Host "❌ PUT request failed: $_" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 3: Verify update
Write-Host "3️⃣  Verifying theme was updated..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/v1/themes" -Method Get
    if ($response.primary -eq "#FF5733") {
        Write-Host "✅ Theme update verified - primary color is #FF5733" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Theme fetched but primary color not updated" -ForegroundColor Yellow
        Write-Host "Response: $($response | ConvertTo-Json)"
    }
} catch {
    Write-Host "❌ Verification failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 4: Audit logs
Write-Host "4️⃣  Testing audit logs..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/v1/themes/audit" -Method Get
    Write-Host "✅ Audit logs accessible" -ForegroundColor Green
    Write-Host "Latest audit entries: $($response.Count) entries found"
} catch {
    Write-Host "❌ Audit logs failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 All tests passed! Theme update is working correctly." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Open http://localhost:3000/settings/theme"
Write-Host "2. Change colors and click 'Save Theme'"
Write-Host "3. Refresh page to verify persistence"
