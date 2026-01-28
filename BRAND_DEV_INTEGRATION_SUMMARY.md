# Brand.dev Integration - Quick Start Guide

## ✅ What Was Implemented

I've successfully integrated brand.dev API to extract brand colors from websites. Here's what was created:

### 1. **API Route** (`frontend/app/api/extract-colors/route.ts`)
   - Secure server-side proxy for brand.dev API
   - Handles URL validation
   - Maps brand.dev response to your theme format
   - Includes comprehensive error handling

### 2. **Updated ThemeEditor** (`frontend/components/ui/ThemeEditor.tsx`)
   - Fully functional color extraction flow
   - Calls the API route when user clicks "Extract Colors"
   - Automatically applies extracted colors to theme
   - Switches to manual mode for review and fine-tuning

### 3. **Environment Configuration** (`frontend/.env.local`)
   - Added placeholder for brand.dev API key

## 🔑 WHERE TO PASTE YOUR BRAND.DEV API KEY

**Open this file:** `frontend/.env.local`

**Find this line:**
```env
BRAND_DEV_API_KEY=your_brand_dev_api_key_here
```

**Replace with your actual API key:**
```env
BRAND_DEV_API_KEY=sk_live_abc123xyz789...
```

## 📋 Setup Steps

### Step 1: Get Your API Key
1. Go to https://brand.dev
2. Sign up or log in
3. Navigate to your dashboard
4. Generate an API key
5. Copy the API key

### Step 2: Add API Key
1. Open `frontend/.env.local`
2. Replace `your_brand_dev_api_key_here` with your actual key
3. Save the file

### Step 3: Restart Server
```bash
cd frontend
npm run dev
```

## 🎯 How It Works

### User Flow:
1. User goes to Settings → Theme Editor
2. Clicks "Add URL" button
3. Enters website URL (e.g., https://www.starbucks.com)
4. Clicks "Extract Colors" button
5. ✨ Colors are automatically extracted and applied
6. User reviews colors in the preview
7. User can fine-tune colors manually
8. User saves the theme

### Technical Flow:
```
User Input (URL)
    ↓
ThemeEditor Component
    ↓
POST /api/extract-colors
    ↓
brand.dev API
    ↓
Colors Extracted
    ↓
Applied to Theme
    ↓
User Reviews & Saves
```

## 🔒 Security Features

- ✅ API key stored server-side only (never exposed to browser)
- ✅ API route acts as secure proxy
- ✅ URL validation prevents malicious inputs
- ✅ Comprehensive error handling

## 🧪 Testing

Try these URLs to test:
- https://www.starbucks.com
- https://www.coca-cola.com
- https://www.nike.com
- https://www.apple.com

## 📁 Files Created/Modified

### Created:
- `frontend/app/api/extract-colors/route.ts` - API endpoint
- `frontend/BRAND_COLOR_EXTRACTION.md` - Detailed documentation

### Modified:
- `frontend/components/ui/ThemeEditor.tsx` - Added extraction logic
- `frontend/.env.local` - Added API key placeholder

## 🎨 Color Mapping

The API automatically maps brand.dev colors to your theme:

| Theme Slot | Source |
|------------|--------|
| Primary | brand.dev primary color |
| Secondary | brand.dev secondary color |
| Accent | brand.dev accent color |
| Background | brand.dev background or default |
| Foreground | brand.dev foreground or default |
| Danger | Default (#ef4444) |
| Success | Default (#22c55e) |
| Warning | Default (#f59e0b) |

## 🔧 Customization

If brand.dev returns colors in a different format, you can adjust the mapping in:
`frontend/app/api/extract-colors/route.ts` (lines 50-60)

## ❓ Troubleshooting

### Error: "Color extraction service is not configured"
**Solution:** Add your API key to `.env.local` and restart the server

### Error: "Failed to extract colors from website"
**Solution:** 
- Check if the URL is valid and accessible
- Verify your brand.dev API key is correct
- Check brand.dev API status

### Colors don't look right
**Solution:** 
- Adjust the color mapping in the API route
- Check the `rawData` field in the API response for debugging
- Manually fine-tune colors after extraction

## 📚 Additional Resources

- Full Documentation: `frontend/BRAND_COLOR_EXTRACTION.md`
- brand.dev API Docs: https://brand.dev/api/docs
- brand.dev Support: https://brand.dev/support

## ✨ Features

- ✅ Fully responsive UI
- ✅ Real-time color extraction
- ✅ Automatic color application
- ✅ Manual fine-tuning after extraction
- ✅ Comprehensive error handling
- ✅ Secure API key management
- ✅ Beautiful loading states
- ✅ Success/error messages

## 🚀 Next Steps

1. Get your brand.dev API key
2. Add it to `.env.local`
3. Restart your server
4. Test with a brand URL
5. Enjoy automatic color extraction!

---

**Need Help?** Check the detailed documentation in `frontend/BRAND_COLOR_EXTRACTION.md`
