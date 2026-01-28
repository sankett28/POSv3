# Finding the Correct brand.dev API Endpoint

## Current Issue

The API endpoint `https://api.brand.dev/v1/colors?url=...` returns a 403 Forbidden error with the message:
> "The API you have tried to access does not exist. Please review the documentation at https://docs.brand.dev"

## Action Required

You need to find the correct API endpoint from brand.dev documentation.

### Step 1: Check brand.dev Documentation

Visit: **https://docs.brand.dev**

Look for:
- API Reference
- Endpoints section
- Color extraction endpoint
- Brand extraction endpoint

### Step 2: Common API Endpoint Patterns

Brand APIs typically use one of these patterns:

```
Option 1: Domain-based
https://api.brand.dev/extract?domain=starbucks.com

Option 2: URL-based
https://api.brand.dev/v1/brand?url=https://www.starbucks.com

Option 3: Different path
https://api.brand.dev/colors/extract?url=https://www.starbucks.com

Option 4: Different subdomain
https://brand.dev/api/v1/extract?domain=starbucks.com

Option 5: POST request
POST https://api.brand.dev/v1/extract
Body: { "url": "https://www.starbucks.com" }
```

### Step 3: Test with curl

Once you find the correct endpoint from the docs, test it:

```bash
# Replace with the correct endpoint
curl -X GET "https://api.brand.dev/CORRECT_ENDPOINT?domain=starbucks.com" \
  -H "Authorization: Bearer brand_824b25f76c2143129cffa7955fa7dc3d" \
  -H "Content-Type: application/json"
```

### Step 4: Update the Code

Once you find the correct endpoint, update this file:
**`frontend/app/api/extract-colors/route.ts`**

Find this section (around line 50):

```typescript
// Current (INCORRECT):
const apiUrl = `https://api.brand.dev/extract?domain=${domain}`

// Replace with the correct endpoint from docs:
const apiUrl = `https://api.brand.dev/CORRECT_PATH?param=${value}`
```

### Step 5: Check API Response Format

The brand.dev API might return colors in different formats:

**Format 1: Nested colors object**
```json
{
  "colors": {
    "primary": "#00704A",
    "secondary": "#FFFFFF"
  }
}
```

**Format 2: Flat palette array**
```json
{
  "palette": ["#00704A", "#FFFFFF", "#D4AF37"]
}
```

**Format 3: Detailed brand object**
```json
{
  "brand": {
    "name": "Starbucks",
    "colors": {
      "primary": "#00704A"
    }
  }
}
```

### Step 6: Update Color Mapping

After finding the correct response format, update the mapping in `frontend/app/api/extract-colors/route.ts` (around line 90):

```typescript
const extractedColors = {
  // Update these based on actual API response structure
  primary: brandData.colors?.primary || brandData.palette?.[0] || '#912b48',
  secondary: brandData.colors?.secondary || brandData.palette?.[1] || '#ffffff',
  // ... etc
}
```

## Alternative Solutions

### Option A: Use a Different Color Extraction Service

If brand.dev doesn't work, consider these alternatives:

1. **Brandfetch API** - https://brandfetch.com/api
2. **Clearbit Logo API** - https://clearbit.com/logo
3. **ColorHexa** - https://www.colorhexa.com/
4. **Custom scraper** - Build your own using Puppeteer

### Option B: Manual Color Input Only

If you can't get the API working, you can:
1. Remove the "Add URL" button
2. Keep only "Add Manually" option
3. Users pick colors manually

To do this, update `frontend/components/ui/ThemeEditor.tsx`:
- Remove the URL input mode
- Keep only the manual color picker mode

## Need Help?

1. **Check brand.dev docs**: https://docs.brand.dev
2. **Contact brand.dev support**: hello@brand.dev
3. **Check your dashboard**: https://brand.dev/dashboard
4. **Look for API examples** in their documentation

## Testing Checklist

- [ ] Found correct API endpoint in docs
- [ ] Tested endpoint with curl
- [ ] Got successful response (200 OK)
- [ ] Verified response format
- [ ] Updated code with correct endpoint
- [ ] Updated color mapping for response format
- [ ] Restarted Next.js server
- [ ] Tested in browser
- [ ] Colors extracted successfully

## Current Code Location

Files to update:
1. `frontend/app/api/extract-colors/route.ts` - Main API route (line ~50 for endpoint, line ~90 for mapping)
2. `frontend/app/api/test-brand-dev/route.ts` - Test endpoint (line ~30)

## Example: If the correct endpoint is different

Let's say the docs show the endpoint is:
```
POST https://api.brand.dev/v2/extract
Body: { "domain": "starbucks.com" }
```

Then update the code to:

```typescript
const urlObj = new URL(url)
const domain = urlObj.hostname.replace('www.', '')

const brandDevResponse = await fetch('https://api.brand.dev/v2/extract', {
  method: 'POST',  // Changed from GET
  headers: {
    'Authorization': `Bearer ${brandDevApiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ domain })  // Added body
})
```

---

**Next Step**: Visit https://docs.brand.dev and find the correct API endpoint!
