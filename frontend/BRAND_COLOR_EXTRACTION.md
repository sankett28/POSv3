# Brand Color Extraction Integration

This document explains how the brand.dev API integration works for extracting brand colors from websites.

## Overview

The color extraction feature allows users to automatically extract brand colors from any website URL using the brand.dev API.

## Architecture

```
User Input (URL) 
    ↓
ThemeEditor Component (frontend/components/ui/ThemeEditor.tsx)
    ↓
Next.js API Route (frontend/app/api/extract-colors/route.ts)
    ↓
brand.dev API (https://api.brand.dev)
    ↓
Colors Applied to Theme
```

## Setup Instructions

### 1. Get Your brand.dev API Key

1. Visit [brand.dev](https://brand.dev)
2. Sign up or log in to your account
3. Navigate to your dashboard
4. Generate an API key

### 2. Add API Key to Environment Variables

**WHERE TO PASTE YOUR API KEY:**

Open `frontend/.env.local` and replace `your_brand_dev_api_key_here` with your actual API key:

```env
BRAND_DEV_API_KEY=your_actual_api_key_here
```

**Important:** 
- Never commit your actual API key to version control
- The API key is kept secure on the server side (not exposed to the browser)
- Add `.env.local` to your `.gitignore` file

### 3. Restart Your Development Server

After adding the API key, restart your Next.js development server:

```bash
cd frontend
npm run dev
```

## How It Works

### User Flow

1. User navigates to Settings → Theme Editor
2. Clicks "Add URL" button
3. Enters a website URL (e.g., https://www.starbucks.com)
4. Clicks "Extract Colors"
5. System fetches brand colors from brand.dev API
6. Colors are automatically applied to the theme
7. User can review and fine-tune the colors
8. User saves the theme

### Technical Flow

1. **Frontend (ThemeEditor.tsx)**
   - User enters URL and clicks "Extract Colors"
   - `handleExtractFromUrl()` function is called
   - Validates URL format
   - Sends POST request to `/api/extract-colors`

2. **API Route (app/api/extract-colors/route.ts)**
   - Receives the URL from frontend
   - Validates the request
   - Calls brand.dev API with the URL
   - Maps brand.dev response to our theme format
   - Returns extracted colors to frontend

3. **Frontend (ThemeEditor.tsx)**
   - Receives extracted colors
   - Applies colors to theme state
   - Switches to manual mode to show color pickers
   - User can review and adjust colors
   - User saves the theme

## API Response Mapping

The brand.dev API response is mapped to our theme format:

```typescript
{
  primary: brandData.colors?.primary || brandData.palette?.[0],
  secondary: brandData.colors?.secondary || brandData.palette?.[1],
  accent: brandData.colors?.accent || brandData.palette?.[2],
  background: brandData.colors?.background,
  foreground: brandData.colors?.foreground,
  danger: '#ef4444',    // Default
  success: '#22c55e',   // Default
  warning: '#f59e0b',   // Default
}
```

## Customization

### Adjusting Color Mapping

If brand.dev returns colors in a different format, update the mapping in `frontend/app/api/extract-colors/route.ts`:

```typescript
const extractedColors = {
  primary: brandData.yourPrimaryColorField,
  secondary: brandData.yourSecondaryColorField,
  // ... adjust as needed
}
```

### Adding More Color Sources

You can add fallback color extraction services by modifying the API route to try multiple services:

```typescript
// Try brand.dev first
let colors = await extractFromBrandDev(url)

// If that fails, try another service
if (!colors) {
  colors = await extractFromAnotherService(url)
}
```

## Error Handling

The integration includes comprehensive error handling:

- **Invalid URL**: User-friendly error message
- **API Key Missing**: Server-side error logged
- **API Request Failed**: Graceful fallback with error message
- **Network Issues**: Timeout and retry logic

## Security

- API key is stored server-side only (not exposed to browser)
- API route acts as a secure proxy
- URL validation prevents malicious inputs
- CORS and rate limiting can be added as needed

## Testing

To test the integration:

1. Enter a well-known brand URL (e.g., https://www.coca-cola.com)
2. Click "Extract Colors"
3. Verify colors are extracted and applied
4. Check browser console for any errors
5. Review the color preview blocks

## Troubleshooting

### "Color extraction service is not configured"
- Check that `BRAND_DEV_API_KEY` is set in `.env.local`
- Restart your development server

### "Failed to extract colors from website"
- Verify the URL is accessible
- Check brand.dev API status
- Review server logs for detailed error messages

### Colors don't look right
- Adjust the color mapping in the API route
- Check brand.dev API documentation for response format
- Use the `rawData` field in the response for debugging

## API Documentation

For more information about the brand.dev API:
- Documentation: https://brand.dev/api/docs
- Support: https://brand.dev/support

## Files Modified

- `frontend/components/ui/ThemeEditor.tsx` - UI and color extraction logic
- `frontend/app/api/extract-colors/route.ts` - API proxy endpoint
- `frontend/.env.local` - Environment variables
