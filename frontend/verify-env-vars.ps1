# Environment Variable Verification Script
# Run this after deploying to verify env vars are working

Write-Host "🔍 Environment Variable Verification" -ForegroundColor Green
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Instructions:" -ForegroundColor Yellow
Write-Host "1. Deploy your frontend to GCP with build env vars" -ForegroundColor White
Write-Host "2. Open https://lichi.he2.site in your browser" -ForegroundColor White
Write-Host "3. Open DevTools (F12) → Console tab" -ForegroundColor White
Write-Host "4. Look for this message:" -ForegroundColor White
Write-Host ""
Write-Host "   🔧 API Configuration: {" -ForegroundColor Cyan
Write-Host "     envVar: 'https://posv3-614312738437.asia-southeast1.run.app'," -ForegroundColor Cyan
Write-Host "     finalUrl: 'https://posv3-614312738437.asia-southeast1.run.app'," -ForegroundColor Cyan
Write-Host "     hostname: 'lichi.he2.site'" -ForegroundColor Cyan
Write-Host "   }" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ If you see the above with production URL:" -ForegroundColor Green
Write-Host "   → Environment variables are set correctly!" -ForegroundColor White
Write-Host "   → Your app will work!" -ForegroundColor White
Write-Host ""

Write-Host "❌ If you see an error like:" -ForegroundColor Red
Write-Host "   '❌ NEXT_PUBLIC_API_BASE_URL is not set!'" -ForegroundColor Red
Write-Host "   → Build environment variables are NOT set in GCP" -ForegroundColor White
Write-Host "   → Go to Cloud Run Console and set them" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  If you see localhost:8000:" -ForegroundColor Yellow
Write-Host "   → You're still running the OLD build" -ForegroundColor White
Write-Host "   → Clear browser cache and hard refresh (Ctrl+Shift+R)" -ForegroundColor White
Write-Host ""

Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host ""

Write-Host "🔗 Quick Links:" -ForegroundColor Yellow
Write-Host "   Cloud Run Console: https://console.cloud.google.com/run" -ForegroundColor Cyan
Write-Host "   Your Frontend: https://lichi.he2.site" -ForegroundColor Cyan
Write-Host "   Your Backend: https://posv3-614312738437.asia-southeast1.run.app" -ForegroundColor Cyan
Write-Host ""

Write-Host "📝 Build Environment Variables to Set:" -ForegroundColor Yellow
Write-Host ""
Write-Host "NEXT_PUBLIC_API_BASE_URL=https://posv3-614312738437.asia-southeast1.run.app" -ForegroundColor White
Write-Host "NEXT_PUBLIC_SUPABASE_URL=https://jegyibzpezsielknpejv.supabase.co" -ForegroundColor White
Write-Host "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplZ3lpYnpwZXpzaWVsa25wZWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4Mzc2NjYsImV4cCI6MjA4MzQxMzY2Nn0.tBLkbqWPe77usiAedLy6JjZBBhWRUgU2OKRDeA90JJ4" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Remember: These go in 'Build configuration' → 'Build environment variables'" -ForegroundColor Green
Write-Host "   NOT in 'Container' → 'Variables & Secrets'!" -ForegroundColor Red
Write-Host ""
