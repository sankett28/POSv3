# Hardcoded Colors Audit

## Overview
This document lists all hardcoded hex colors found in component files that need to be replaced with semantic tokens during the theming system refactor.

## Files with Hardcoded Colors

### POSv3/frontend/app/settings/taxes/page.tsx
- Line 152: `border-[#B45A69]` - Border color for warning banner
- Line 224: `divide-[#E5E7EB]/50` - Table row divider
- Line 387: `accent-[#912B48]` - Checkbox accent color
- Line 406: `accent-[#912B48]` - Checkbox accent color

**Replacement Strategy:**
- `#B45A69` → `--theme-accent` or `--color-border-emphasis`
- `#E5E7EB` → `--color-border-subtle`
- `#912B48` → `--theme-primary`

### POSv3/frontend/app/page.tsx (Landing Page)
- Line 32: `linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)` - Hero background
- Lines 196-212: Multiple color swatches (`#1a1a1a`, `#2a2a2a`, `#4a4a4a`, `#6a6a6a`, `#8a8a8a`)
- Line 376: `linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)` - Section background

**Replacement Strategy:**
- Keep as-is (marketing/demo content, not part of app theming)
- Or move to component-scoped styles

### POSv3/frontend/app/reports/page.tsx
- Line 418: `fill="#610027"` - Chart label color
- Line 433: `fill="#8884d8"` - Chart outer radius
- Lines 441-452: Payment method colors (`#912B48`, `#B45A69`, `#610027`, `#FFF0F3`)
- Lines 462-465: Tooltip styles (`#FFF0F3`, `#E5E7EB`, `#610027`)
- Line 512: `stroke="#E5E7EB"` - Grid stroke
- Lines 518-521: Axis tick colors (`#6B6B6B`)
- Lines 527-530: Tooltip styles
- Line 535: `fill="#912B48"` - Bar chart fill
- Line 545: Category colors array

**Replacement Strategy:**
- `#610027` → `--theme-foreground`
- `#912B48` → `--theme-primary`
- `#B45A69` → `--theme-accent`
- `#FFF0F3` → `--theme-background`
- `#E5E7EB` → `--color-border-subtle`
- `#6B6B6B` → `--color-text-muted`
- `#8884d8` → Keep (chart library default) or map to theme

### POSv3/frontend/app/orders/page.tsx
- Line 386: `background: #FFBB94` - Status indicator dot
- Line 396: `color: #FB9590` - Icon color
- Line 440: `border: 1px solid #eee` - Card border
- Line 448: `border-left: 1px solid #ddd` - Detail item border
- Line 483: `color: #555` - Table header text
- Line 548: `border-bottom: 1px dashed #E5E7EB` - Total row divider
- Line 589: `background: linear-gradient(to right, transparent, #E5E7EB, transparent)` - Divider

**Replacement Strategy:**
- `#FFBB94`, `#FB9590` → Status color tokens or keep as accent
- `#eee`, `#ddd` → `--color-border-subtle`
- `#555` → `--color-text-secondary`
- `#E5E7EB` → `--color-border-subtle`

### POSv3/frontend/app/products/page.tsx
- Line 146: `bg-[#F5F3EE]` - Page background
- Line 149: `bg-[#FAF7F2]` - Header card background
- Line 152: `bg-[#3E2C24]` - Icon container background
- Line 156: `text-[#3E2C24]` - Heading text color

**Replacement Strategy:**
- `#F5F3EE`, `#FAF7F2` → `--color-bg-page` or `--color-bg-surface`
- `#3E2C24` → `--theme-foreground` or `--color-text-primary`

## Summary

**Total Files with Hardcoded Colors:** 5
**Total Hardcoded Color Instances:** ~40+

**Priority for Refactor:**
1. High: taxes/page.tsx, products/page.tsx (app functionality)
2. Medium: reports/page.tsx, orders/page.tsx (charts and tables)
3. Low: page.tsx (landing page - marketing content)

**Next Steps:**
1. Complete globals.css refactor with 3-layer token system
2. Replace hardcoded colors in high-priority files
3. Test visual regression
4. Replace medium-priority files
5. Decide on landing page approach (keep or refactor)
