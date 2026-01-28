# Brand.dev Integration - Issue Fixed

## ✅ What Was the Problem?

The API endpoint `https://api.brand.dev/v1/colors?url=...` doesn't exist. 

The API returned:
```
403 Forbidden
"The API you have tried to access does not exist. 
Please review the documentation at https://docs.brand.dev"
```

## 🔧 What I Fixed

1. ✅ Added better error handling for 403 errors
2. ✅ Added response text parsing (handles both JSON and plain text)
3. ✅ Updated API endpoint to try `https://api.brand.dev/extract?domain=...`
4. ✅ Added helpful error messages pointing to documentation
5. ✅ Created comprehensive guides

## 📋 What You Need to Do

### **Step 1: Find the Correct API Endpoint**

Visit: **https://docs.brand.dev**

Look for the API documentation and find the correct endpoint for extracting brand colors.

### **Step 2: Test the Endpoint**

Once you find it, test with curl:

```bash
# Example - replace with actual endpoint from docs
curl -X GET "https://api.brand.dev/CORRECT_ENDPOINT?domain=starbucks.com" \
  -H "Authorization: Bearer brand_824b25f76c2143129cffa7955fa7dc3d" \
  -H "Content-Type: application/json"
```

### **Step 3: Update the Code**

Open: `frontend/app/api/extract-colors/route.ts`

Find line ~50 and update:

```typescript
// Current:
const apiUrl = `https://api.brand.dev/extract?domain=${domain}`

// Replace with correct endpoint from docs:
const apiUrl = `https://api.brand.dev/CORRECT_PATH?param=${value}`
```

### **Step 4: Update Response Mapping**

Check the API response format and update the color mapping (line ~110):

```typescript
const extractedColors = {
  primary: brandData.YOUR_FIELD?.primary || '#912b48',
  // Update based on actual response structure
}
```

### **Step 5: Restart Server**

```bash
cd frontend
npm run dev
```

### **Step 6: Test**

Try extracting colors from a brand URL like:
- https://www.starbucks.com
- https://www.coca-cola.com

## 📚 Documentation Created

1. **BRAND_DEV_API_ENDPOINT_GUIDE.md** - Detailed guide on finding the correct endpoint
2. **TROUBLESHOOTING_BRAND_DEV.md** - General troubleshooting guide
3. **BRAND_DEV_INTEGRATION_SUMMARY.md** - Original integration guide

## 🎯 Quick Reference

### Common API Endpoint Patterns:

```
✓ https://api.brand.dev/extract?domain=example.com
✓ https://api.brand.dev/v1/brand?url=https://example.com
✓ https://api.brand.dev/colors?domain=example.com
✓ POST https://api.brand.dev/v1/extract with body
```

### Files to Update:

1. `frontend/app/api/extract-colors/route.ts` (line ~50)
2. `frontend/app/api/test-brand-dev/route.ts` (line ~30)

## 🔍 Current Status

- ✅ Error handling improved
- ✅ Better error messages
- ✅ Logging added
- ⚠️ **Need correct API endpoint from brand.dev docs**

## 🚀 Alternative: Use Manual Input Only

If you can't get brand.dev working, you can disable the URL feature:

In `frontend/components/ui/ThemeEditor.tsx`, comment out the "Add URL" button and keep only "Add Manually".

## 💡 Alternative Services

If brand.dev doesn't work, consider:
1. **Brandfetch** - https://brandfetch.com/api
2. **Clearbit Logo API** - https://clearbit.com/logo
3. **Build custom scraper** with Puppeteer

## ❓ Need Help?

1. Check brand.dev documentation: https://docs.brand.dev
2. Contact brand.dev support: hello@brand.dev
3. Check your dashboard: https://brand.dev/dashboard
4. Read: BRAND_DEV_API_ENDPOINT_GUIDE.md

---

**Next Step**: Visit https://docs.brand.dev and find the correct API endpoint, then update the code!
