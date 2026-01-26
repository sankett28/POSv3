# PowerShell script to replace hex colors with Tailwind classes
# Usage: .\replace-colors.ps1

Write-Host "Starting hex color replacement..." -ForegroundColor Cyan

$updatedFiles = 0
$totalChanges = 0

# Get all TSX files
$files = Get-ChildItem -Path "app","components" -Filter "*.tsx" -Recurse -ErrorAction SilentlyContinue

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileChanges = 0
    
    # Replace Tailwind className patterns
    $replacements = @(
        @('bg-\[#610027\]', 'bg-brand-deep-burgundy'),
        @('text-\[#610027\]', 'text-primary-text'),
        @('border-\[#610027\]', 'border-brand-deep-burgundy'),
        
        @('bg-\[#912B48\]', 'bg-coffee-brown'),
        @('text-\[#912B48\]', 'text-coffee-brown'),
        @('border-\[#912B48\]', 'border-coffee-brown'),
        @('focus:ring-\[#912B48\]', 'focus:ring-coffee-brown'),
        @('focus:border-\[#912B48\]', 'focus:border-coffee-brown'),
        
        @('bg-\[#B45A69\]', 'bg-brand-dusty-rose'),
        @('hover:bg-\[#B45A69\]', 'hover:bg-brand-dusty-rose'),
        
        @('bg-\[#FFF0F3\]', 'bg-warm-cream'),
        @('hover:bg-\[#FFF0F3\]', 'hover:bg-warm-cream'),
        
        @('bg-\[#FFFFFF\]', 'bg-card-background'),
        @('border-\[#E5E7EB\]', 'border-border'),
        @('bg-\[#F9F9F9\]', 'bg-warm-cream'),
        
        @('text-\[#6B6B6B\]', 'text-secondary-text'),
        @('hover:text-\[#6B6B6B\]', 'hover:text-secondary-text'),
        
        @('text-\[#9CA3AF\]', 'text-muted-text'),
        @('placeholder-\[#9CA3AF\]', 'placeholder-muted-text'),
        
        @('text-\[#4C1D3D\]', 'text-primary-text'),
        
        @('bg-\[#4CAF50\]', 'bg-leaf-green'),
        @('text-\[#4CAF50\]', 'text-leaf-green'),
        
        @('bg-\[#22C55E\]', 'bg-success'),
        @('text-\[#22C55E\]', 'text-success'),
        
        @('bg-\[#F59E0B\]', 'bg-warning'),
        @('text-\[#F59E0B\]', 'text-warning'),
        
        @('bg-\[#EF4444\]', 'bg-error'),
        @('text-\[#EF4444\]', 'text-error')
    )
    
    foreach ($pair in $replacements) {
        $pattern = $pair[0]
        $replacement = $pair[1]
        if ($content -match $pattern) {
            $content = $content -replace $pattern, $replacement
            $fileChanges++
        }
    }
    
    # Replace CSS variable patterns in style tags
    $cssReplacements = @(
        @('background:\s*#610027', 'background: var(--primary-text)'),
        @('color:\s*#610027', 'color: var(--primary-text)'),
        @('background:\s*#912B48', 'background: var(--coffee-brown)'),
        @('color:\s*#912B48', 'color: var(--coffee-brown)'),
        @('border-top:\s*1px solid #912B48', 'border-top: 1px solid var(--coffee-brown)'),
        @('background:\s*#FFF0F3', 'background: var(--warm-cream)'),
        @('background:\s*#FFFFFF', 'background: var(--card-background)'),
        @('border:\s*1px solid #E5E7EB', 'border: 1px solid var(--border)'),
        @('border-bottom:\s*1px solid #E5E7EB', 'border-bottom: 1px solid var(--border)'),
        @('border-top:\s*1px solid #E5E7EB', 'border-top: 1px solid var(--border)'),
        @('color:\s*#6B6B6B', 'color: var(--secondary-text)'),
        @('color:\s*#9CA3AF', 'color: var(--muted-text)'),
        @('background:\s*#fdfdfd', 'background: var(--card-background)')
    )
    
    foreach ($pair in $cssReplacements) {
        $pattern = $pair[0]
        $replacement = $pair[1]
        if ($content -match $pattern) {
            $content = $content -replace $pattern, $replacement
            $fileChanges++
        }
    }
    
    # Save if modified
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.FullName)" -ForegroundColor Green
        Write-Host "   Changes: $fileChanges" -ForegroundColor Gray
        $updatedFiles++
        $totalChanges += $fileChanges
    }
}

Write-Host ""
Write-Host "Complete!" -ForegroundColor Cyan
Write-Host "Updated $updatedFiles file(s) with $totalChanges change(s)." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "   1. Review the changes with git diff" -ForegroundColor White
Write-Host "   2. Test your application" -ForegroundColor White
Write-Host "   3. Commit the changes" -ForegroundColor White
