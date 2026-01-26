# PowerShell script to replace remaining hex colors with Tailwind classes
# Usage: .\replace-remaining-colors.ps1

Write-Host "Starting remaining hex color replacement..." -ForegroundColor Cyan

$updatedFiles = 0
$totalChanges = 0

# Get all TSX files
$files = Get-ChildItem -Path "app","components" -Filter "*.tsx" -Recurse -ErrorAction SilentlyContinue

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileChanges = 0
    
    # Replace new hex codes found
    $replacements = @(
        # Accent Pink
        @('bg-\[#DC586D\]', 'bg-accent-pink'),
        @('text-\[#DC586D\]', 'text-accent-pink'),
        @('hover:bg-\[#A33757\]', 'hover:bg-accent-pink-dark'),
        
        # Text Dark
        @('text-\[#1F1F1F\]', 'text-text-dark'),
        
        # Gold/Bronze
        @('from-\[#C89B63\]', 'from-accent-gold'),
        @('to-\[#C89B63\]', 'to-accent-gold'),
        @('bg-\[#C89B63\]/20', 'bg-accent-gold/20'),
        @('bg-\[#C89B63\]/30', 'bg-accent-gold/30'),
        @('text-\[#C89B63\]', 'text-accent-gold'),
        
        # Orange/Peach
        @('to-\[#F4A261\]', 'to-accent-orange'),
        @('from-\[#F4A261\]', 'from-accent-orange'),
        @('bg-\[#F4A261\]/20', 'bg-accent-orange/20'),
        @('bg-\[#F4A261\]/30', 'bg-accent-orange/30'),
        @('text-\[#F4A261\]', 'text-accent-orange'),
        
        # Dark Brown
        @('from-\[#3E2C24\]', 'from-dark-brown'),
        @('to-\[#3E2C24\]', 'to-dark-brown'),
        
        # Light border
        @('border-\[#f1ece6\]', 'border-border-light'),
        
        # Already defined colors (gradients and opacity)
        @('from-\[#B45A69\]/25', 'from-brand-dusty-rose/25'),
        @('to-\[#B45A69\]/15', 'to-brand-dusty-rose/15'),
        @('from-\[#B45A69\]/30', 'from-brand-dusty-rose/30'),
        @('border-\[#B45A69\]/30', 'border-brand-dusty-rose/30'),
        @('border-\[#B45A69\]/20', 'border-brand-dusty-rose/20'),
        @('hover:border-\[#B45A69\]/20', 'hover:border-brand-dusty-rose/20'),
        
        @('from-\[#FFF0F3\]/30', 'from-warm-cream/30'),
        @('to-\[#FFF0F3\]/10', 'to-warm-cream/10'),
        @('from-\[#FFF0F3\]/40', 'from-warm-cream/40'),
        @('to-\[#FFF0F3\]/20', 'to-warm-cream/20'),
        @('to-\[#FFF0F3\]/10', 'to-warm-cream/10'),
        @('hover:from-\[#FFF0F3\]/30', 'hover:from-warm-cream/30'),
        @('hover:to-\[#FFF0F3\]/10', 'hover:to-warm-cream/10')
    )
    
    foreach ($pair in $replacements) {
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
