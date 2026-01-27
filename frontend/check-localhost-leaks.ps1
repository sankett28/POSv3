# Pre-commit check: Scan source code for dangerous localhost fallbacks
# Run this before committing changes to prevent regressions

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Checking for Localhost Fallback Patterns" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$foundIssues = $false

# Patterns to search for
$dangerousPatterns = @(
    @{
        Pattern = '\|\| [''"]http://localhost'
        Description = "Fallback to localhost URL"
        Severity = "CRITICAL"
    },
    @{
        Pattern = '\?\? [''"]http://localhost'
        Description = "Nullish coalescing to localhost"
        Severity = "CRITICAL"
    },
    @{
        Pattern = 'process\.env\.\w+ \|\| [''"]http://'
        Description = "Env var with URL fallback"
        Severity = "WARNING"
    }
)

# Directories to scan
$dirsToScan = @("app", "lib", "components", "hooks")

foreach ($pattern in $dangerousPatterns) {
    Write-Host "Checking for: $($pattern.Description)" -ForegroundColor Yellow
    
    $matches = @()
    foreach ($dir in $dirsToScan) {
        if (Test-Path $dir) {
            $matches += Get-ChildItem -Path $dir -Recurse -Include *.ts,*.tsx,*.js,*.jsx -File | 
                Select-String -Pattern $pattern.Pattern -ErrorAction SilentlyContinue
        }
    }
    
    if ($matches.Count -gt 0) {
        $foundIssues = $true
        $color = if ($pattern.Severity -eq "CRITICAL") { "Red" } else { "Yellow" }
        
        Write-Host ""
        Write-Host "[$($pattern.Severity)] Found $($matches.Count) occurrence(s):" -ForegroundColor $color
        
        foreach ($match in $matches) {
            Write-Host "  File: $($match.Path)" -ForegroundColor $color
            Write-Host "  Line $($match.LineNumber): $($match.Line.Trim())" -ForegroundColor Gray
            Write-Host ""
        }
    } else {
        Write-Host "  ✅ None found" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($foundIssues) {
    Write-Host "❌ ISSUES FOUND" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Dangerous localhost fallback patterns detected!" -ForegroundColor Red
    Write-Host ""
    Write-Host "These patterns will cause production bugs:" -ForegroundColor Yellow
    Write-Host "- Frontend calling localhost in production" -ForegroundColor White
    Write-Host "- Silent failures with no error messages" -ForegroundColor White
    Write-Host "- Browser asking for local network permissions" -ForegroundColor White
    Write-Host ""
    Write-Host "Fix these issues before committing:" -ForegroundColor Yellow
    Write-Host "1. Remove || 'http://localhost' fallbacks" -ForegroundColor White
    Write-Host "2. Add strict validation: throw error if missing" -ForegroundColor White
    Write-Host "3. Only allow localhost in NODE_ENV=development" -ForegroundColor White
    Write-Host ""
    exit 1
} else {
    Write-Host "✅ NO ISSUES FOUND" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Source code is clean. No dangerous localhost fallbacks detected." -ForegroundColor Green
    Write-Host ""
    exit 0
}
