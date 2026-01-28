# Troubleshooting Brand.dev Integration

## Current Error: "Failed to extract colors from website"

### Step 1: Test Your API Configuration

Visit this URL in your browser while your dev server is running:
```
http://localhost:3000/api/test-brand-dev
```

This will test your brand.dev API key and show you detailed information about what's happening.

### Step 2: Check Your API Key

1. Open `frontend/.env.local`
2. Verify your API key is correct: `BRAND_DEV_API_KEY=brand_824b25f76c2143129cffa7955fa7dc3d`
3. Make sure there are no extra spaces or quotes around the key

### Step 3: Restart Your Server

After adding or changing the API key, you MUST restart your Next.js server:

```bash
# Stop the server (Ctrl+C)
# Then restart:
cd frontend
npm run dev
```

### Step 4: Check Server Logs

When you click "Extract Colors", check your terminal/console for detailed logs:
- Look for lines starting with 🔍, 🔑, 📡, 📊, ✅, or ❌
- These will tell you exactly what's happening

### Step 5: Verify brand.dev API Endpoint

The brand.dev API endpoint might be different. Common possibilities:

1. `https://api.brand.dev/v1/colors?url=...` (currently using)
2. `https://api.brand.dev/colors?url=...`
3. `https://brand.dev/api/v1/colors?url=...`
4. `https://api.brand.dev/v1/extract?url=...`

Check the brand.dev documentation for the correct endpoint.

### Step 6: Check API Key Format

Brand.dev API keys might have different formats:
- `brand_xxxxx` (your current format)
- `sk_live_xxxxx`
- `pk_xxxxx`
- Just the key without prefix

### Step 7: Test with curl

Test the API directly from your terminal:

```bash
curl -X GET "https://api.brand.dev/v1/colors?url=https://www.starbucks.com" \
  -H "Authorization: Bearer brand_824b25f76c2143129cffa7955fa7dc3d" \
  -H "Content-Type: application/json"
```

This will show you the exact response from brand.dev.

### Step 8: Check brand.dev Dashboard

1. Log in to https://brand.dev
2. Check your API key is active
3. Check if there are any usage limits or restrictions
4. Verify the API documentation for the correct endpoint

### Common Issues

#### Issue: "Color extraction service is not configured"
**Solution:** API key is missing or has placeholder value. Add your real API key to `.env.local`

#### Issue: "Invalid brand.dev API key"
**Solution:** API key is incorrect. Get a new one from brand.dev dashboard

#### Issue: "Rate limit exceeded"
**Solution:** You've made too many requests. Wait a few minutes and try again

#### Issue: "Could not find brand colors for this website"
**Solution:** The website might not have clear branding. Try a different URL like:
- https://www.starbucks.com
- https://www.coca-cola.com
- https://www.nike.com

### Debug Mode

To see detailed logs:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Click "Extract Colors"
4. Look for logs starting with 🎨, 📊, ✅, or ❌

Also check your terminal where Next.js is running for server-side logs.

### Alternative: Manual Color Input

If brand.dev integration isn't working, you can always use the "Add Manually" option to pick colors manually.

### Need More Help?

1. Check the test endpoint: http://localhost:3000/api/test-brand-dev
2. Look at server logs in your terminal
3. Check browser console for client-side errors
4. Verify brand.dev API documentation
5. Contact brand.dev support if the API key isn't working

### Expected Response Format

The brand.dev API should return something like:

```json
{
  "colors": {
    "primary": "#00704A",
    "secondary": "#FFFFFF",
    "accent": "#D4AF37"
  },
  "palette": ["#00704A", "#FFFFFF", "#D4AF37", "#000000"]
}
```

If the format is different, you'll need to update the mapping in `frontend/app/api/extract-colors/route.ts`
