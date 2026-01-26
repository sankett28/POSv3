# How to Add Images to the Landing Page

## Images Needed

The landing page is set up to display two main images:

### 1. Hero Section - POS Preview Image
**Location:** Right side of the hero section (top of the page)
**File path:** `frontend/public/images/pos-preview.png`
**Recommended size:** 1200x800px or similar aspect ratio
**What to show:** A screenshot or mockup of your POS system interface

### 2. Why Choose Section - Business Image
**Location:** Right side of the "Focus on Your Food, Not Your Software" section
**File path:** `frontend/public/images/business-image.jpg`
**Recommended size:** 1000x1000px or similar
**What to show:** A photo of a business owner, team, or restaurant/cafe environment

## How to Add Images

### Step 1: Prepare Your Images
1. Get your POS screenshot or mockup
2. Get a business/team photo
3. Optimize them for web (compress to reduce file size)

### Step 2: Add Images to the Project
1. Navigate to `frontend/public/images/` folder
2. Add your images with these exact names:
   - `pos-preview.png` (or .jpg)
   - `business-image.jpg` (or .png)

### Step 3: Update File Extensions (if needed)
If you use different file extensions, update the code in `frontend/app/page.tsx`:

For POS preview image (around line 20):
```tsx
<Image 
  src="/images/pos-preview.jpg"  // Change .png to .jpg if needed
  alt="POS System Preview"
  ...
/>
```

For business image (around line 250):
```tsx
<Image 
  src="/images/business-image.png"  // Change .jpg to .png if needed
  alt="Business Management"
  ...
/>
```

## Fallback Behavior

If images are not found, the page will show placeholder text:
- "POS Preview" with dark gradient background
- "Business Image" with light gradient background

This ensures the page looks good even without images!

## Image Optimization Tips

1. **Format:** Use WebP for best compression, or PNG/JPG
2. **Size:** Keep file size under 500KB for fast loading
3. **Dimensions:** Use 2x resolution for retina displays
4. **Compression:** Use tools like TinyPNG or Squoosh to compress

## Example Image Sources

If you need placeholder images while developing:
- **POS Screenshots:** Take screenshots from your actual POS system
- **Business Photos:** Use stock photos from Unsplash or Pexels
- **Mockups:** Create mockups using Figma or similar tools
