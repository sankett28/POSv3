# Design Document: Responsive Orders Page

## Overview

This design document outlines the technical approach for transforming the Orders page into a fully responsive POS system that adapts seamlessly across desktop, tablet, and mobile devices. The redesign focuses on implementing responsive layouts using TailwindCSS utilities while preserving all existing functionality, business logic, and design language.

The core challenge is adapting a desktop-centric layout with a fixed sidebar into a mobile-friendly interface where the Current Order panel becomes a bottom sheet or drawer. This requires careful consideration of state management, touch interactions, and smooth transitions while maintaining the existing React component structure and API integrations.

**Key Design Principles:**
- Mobile-first approach with progressive enhancement
- Maintain all existing functionality without backend changes
- Use TailwindCSS responsive utilities exclusively
- Preserve brand identity and design language
- Ensure accessibility across all breakpoints
- Optimize for touch interactions on mobile devices

## Architecture

### Responsive Breakpoint Strategy

The design uses three primary breakpoints aligned with TailwindCSS defaults:

- **Mobile**: `< 768px` (default, mobile-first)
- **Tablet**: `768px - 1279px` (md: breakpoint)
- **Desktop**: `≥ 1280px` (xl: breakpoint)

### Component Structure

The existing `OrdersPage` component will be refactored to support responsive layouts:

```
OrdersPage (main container)
├── Header Section (title + description)
├── CategoryFilter (responsive: wrap → horizontal scroll)
├── SearchBar (responsive: full width on mobile)
├── ProductGrid (responsive: 1 → 2 → 3 columns)
│   └── ProductCard[] (responsive: vertical → horizontal layout)
└── CurrentOrderPanel (responsive: sidebar → drawer → bottom sheet)
    ├── OrderItems List
    ├── Tax Breakdown
    ├── Payment Method Selector
    └── Complete Order Button
```

### State Management

The responsive behavior will be managed through:

1. **CSS-based responsiveness**: TailwindCSS utilities handle layout changes
2. **Component state**: New state for drawer/bottom sheet visibility
3. **Existing state**: All current state (billItems, products, etc.) remains unchanged

New state additions:
```typescript
const [isOrderPanelOpen, setIsOrderPanelOpen] = useState(false)
```

### Layout Modes

**Desktop Mode (≥1280px):**
- Two-column layout: Product grid (flex-1) + Sticky sidebar (fixed width)
- Category buttons wrap naturally
- All content visible simultaneously

**Tablet Mode (768px-1279px):**
- Full-width product grid
- Current Order panel as slide-in drawer from right
- Floating action button (FAB) to toggle drawer
- Overlay when drawer is open

**Mobile Mode (<768px):**
- Single-column product grid
- Current Order panel as bottom sheet
- FAB with item count badge
- Overlay when bottom sheet is open

## Components and Interfaces

### 1. Responsive Product Grid

**Desktop (xl:):**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
  {products.map(product => <ProductCard key={product.id} product={product} />)}
</div>
```

**Behavior:**
- Uses CSS Grid with responsive column counts
- Maintains consistent gap spacing
- Auto-adjusts on viewport resize

### 2. Responsive Category Filter

**Mobile (<768px):**
```tsx
<div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide snap-x snap-mandatory">
  {categories.map(cat => (
    <button className="flex-shrink-0 snap-start px-6 py-3 rounded-full">
      {cat.name}
    </button>
  ))}
</div>
```

**Desktop (≥768px):**
```tsx
<div className="flex flex-wrap gap-2">
  {categories.map(cat => (
    <button className="px-6 py-3 rounded-full">
      {cat.name}
    </button>
  ))}
</div>
```

**Key Features:**
- Horizontal scroll on mobile with snap points
- Hide scrollbar for cleaner appearance
- Wrap layout on larger screens
- Maintain existing button styling

### 3. Responsive Product Card

**Mobile Layout (<768px):**
```tsx
<div className="flex flex-col gap-3 p-4">
  <div className="w-full aspect-square">
    <Image src={...} className="w-full h-full object-cover" />
  </div>
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-start">
      <h3>{product.name}</h3>
      <p className="text-lg font-semibold">₹{price}</p>
    </div>
    <p className="text-sm text-muted">{description}</p>
    <div className="flex items-center justify-between">
      <QuantityControls />
      <AddToCartButton />
    </div>
  </div>
</div>
```

**Desktop Layout (≥768px):**
```tsx
<div className="flex gap-5 p-5">
  <div className="flex flex-col items-center gap-3">
    <div className="w-32 h-32">
      <Image src={...} />
    </div>
    <QuantityControls />
  </div>
  <div className="flex-1 flex flex-col gap-3">
    <div className="flex justify-between">
      <h3>{product.name}</h3>
      <p>₹{price}</p>
    </div>
    <p className="text-sm">{description}</p>
    <AddToCartButton />
  </div>
</div>
```

### 4. Current Order Panel - Adaptive Component

**Desktop Implementation (≥1280px):**
```tsx
<div className="hidden xl:block w-150 sticky top-4">
  <OrderPanelContent />
</div>
```

**Tablet/Mobile Implementation (<1280px):**
```tsx
{/* Floating Action Button */}
<button 
  onClick={() => setIsOrderPanelOpen(true)}
  className="xl:hidden fixed bottom-6 right-6 z-40 bg-primary text-white rounded-full p-4 shadow-lg"
>
  <ShoppingCart className="w-6 h-6" />
  {billItems.length > 0 && (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
      {billItems.length}
    </span>
  )}
</button>

{/* Overlay */}
{isOrderPanelOpen && (
  <div 
    className="xl:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
    onClick={() => setIsOrderPanelOpen(false)}
  />
)}

{/* Drawer (Tablet) */}
<div className={`
  hidden md:block xl:hidden
  fixed top-0 right-0 h-full w-96 bg-white z-50
  transform transition-transform duration-300 ease-in-out
  ${isOrderPanelOpen ? 'translate-x-0' : 'translate-x-full'}
  shadow-2xl overflow-y-auto
`}>
  <OrderPanelContent onClose={() => setIsOrderPanelOpen(false)} />
</div>

{/* Bottom Sheet (Mobile) */}
<div className={`
  md:hidden
  fixed bottom-0 left-0 right-0 bg-white z-50
  transform transition-transform duration-300 ease-in-out
  ${isOrderPanelOpen ? 'translate-y-0' : 'translate-y-full'}
  rounded-t-3xl shadow-2xl
  max-h-[85vh] overflow-y-auto
`}>
  <div className="sticky top-0 bg-white pt-4 pb-2 px-6 border-b">
    <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
    <div className="flex justify-between items-center">
      <h3 className="text-xl font-bold">Current Order</h3>
      <button onClick={() => setIsOrderPanelOpen(false)}>
        <X className="w-6 h-6" />
      </button>
    </div>
  </div>
  <OrderPanelContent onClose={() => setIsOrderPanelOpen(false)} />
</div>
```

**Key Features:**
- Conditional rendering based on breakpoint
- Smooth slide-in/out transitions
- Backdrop overlay for modal context
- Drag handle indicator on bottom sheet
- Close button and overlay click to dismiss
- Scroll lock on body when open

### 5. Order Panel Content Component

Extract the current order panel content into a reusable component:

```tsx
interface OrderPanelContentProps {
  onClose?: () => void
}

function OrderPanelContent({ onClose }: OrderPanelContentProps) {
  return (
    <div className="p-6 flex flex-col h-full">
      {/* Header with Clear button */}
      <div className="flex justify-between items-center mb-4 pb-4 border-b">
        <h3 className="text-xl font-bold">Current Order</h3>
        <button onClick={() => setBillItems([])} className="text-sm">
          Clear
        </button>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto mb-4">
        {billItems.length === 0 ? (
          <EmptyState />
        ) : (
          <ItemsList items={billItems} />
        )}
      </div>

      {/* Tax Breakdown */}
      <TaxBreakdown 
        subtotal={subtotal}
        totalTax={totalTax}
        totalCGST={totalCGST}
        totalSGST={totalSGST}
        grandTotal={grandTotal}
      />

      {/* Payment Method Selector */}
      <PaymentMethodSelector 
        selected={paymentMethod}
        onChange={setPaymentMethod}
      />

      {/* Complete Order Button */}
      <button
        onClick={handleCompleteBill}
        disabled={billItems.length === 0}
        className="w-full bg-primary text-white py-3 px-4 rounded-xl font-semibold"
      >
        <CheckCircle className="w-5 h-5 inline mr-2" />
        Complete Order
      </button>
    </div>
  )
}
```

### 6. Touch-Friendly Controls

**Quantity Controls (Mobile):**
```tsx
<div className="flex items-center gap-3 md:gap-4">
  <button className="p-3 md:p-2 rounded-full min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0">
    <Minus className="w-5 h-5" />
  </button>
  <span className="font-semibold text-base md:text-sm min-w-8 text-center">
    {quantity}
  </span>
  <button className="p-3 md:p-2 rounded-full min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0">
    <Plus className="w-5 h-5" />
  </button>
</div>
```

**Payment Method Buttons (Mobile):**
```tsx
<div className="grid grid-cols-3 md:grid-cols-3 gap-3">
  <button className="flex flex-col items-center justify-center p-4 min-h-[60px] rounded-xl">
    <Wallet className="w-6 h-6 mb-2" />
    <span className="text-sm font-medium">Cash</span>
  </button>
  {/* UPI and Card buttons */}
</div>
```

## Data Models

No changes to existing data models. All interfaces remain the same:

- `Product`
- `Category`
- `TaxGroup`
- `BillItem`
- `BillDetails`

The responsive design is purely presentational and doesn't affect data structures or API contracts.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Responsive Grid Column Count

*For any* viewport width, the Product_Grid should display the correct number of columns: 1 column when width ≤ 767px, 2 columns when 768px ≤ width ≤ 1279px, and 3 columns when width ≥ 1280px.

**Validates: Requirements 1.1, 1.2, 1.3, 12.1, 12.2, 12.3, 12.4**

### Property 2: Category Filter Active State Preservation

*For any* selected category and any viewport width, the active state styling should be preserved and correctly applied to the selected category button.

**Validates: Requirements 2.4**

### Property 3: Search Bar Consistent Styling

*For any* viewport width, the Search_Bar should maintain consistent padding and font-size values across all breakpoints.

**Validates: Requirements 3.3**

### Property 4: Overlay Closes Panel

*For any* viewport width below 1280px where the Current_Order_Panel is open, clicking the overlay should close the panel and hide the overlay.

**Validates: Requirements 4.5, 4.6**

### Property 5: FAB Badge Shows Item Count

*For any* number of items in the cart greater than zero, the floating action button badge should display the correct item count.

**Validates: Requirements 4.7**

### Property 6: Product Card Image Aspect Ratio

*For any* product card and any viewport width, images should maintain their aspect ratio without distortion (object-fit: cover should be applied).

**Validates: Requirements 5.4**

### Property 7: Touch Target Minimum Size

*For any* interactive element (button, input, link) when viewport width ≤ 767px, the element should have a minimum touch target size of 44x44 pixels.

**Validates: Requirements 6.1**

### Property 8: No Horizontal Overflow

*For any* viewport width, the document body scrollWidth should equal the viewport width (no horizontal scrolling required).

**Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

### Property 9: Consistent Animation Duration

*For all* CSS transitions (drawer slide, bottom sheet slide, overlay fade), the animation duration should be consistent (300ms).

**Validates: Requirements 8.4**

### Property 10: Product Filtering Preservation

*For any* category selection, only products belonging to that category (or all products if "All" is selected) should be displayed in the grid.

**Validates: Requirements 9.1**

### Property 11: Search Functionality Preservation

*For any* search term, only products whose names contain that term (case-insensitive) should be displayed in the grid.

**Validates: Requirements 9.2**

### Property 12: Cart Operations Preservation

*For any* product, the operations of adding to cart, removing from cart, and updating quantity should work correctly and update the billItems state appropriately.

**Validates: Requirements 9.3**

### Property 13: Tax Calculation Preservation

*For any* set of bill items with tax groups, the calculated subtotal, tax amounts (CGST/SGST), and grand total should match the expected values based on the tax calculation logic.

**Validates: Requirements 9.4**

### Property 14: API Integration Preservation

*For any* order completion, the API should be called with the correct payload structure (items, payment_method) and the same endpoint as before the redesign.

**Validates: Requirements 9.6, 9.8**

### Property 15: Design Token Preservation

*For any* element using brand colors, typography, border radius, or shadows, the computed CSS values should match the existing design system tokens (coffee-brown, warm-cream, dusty-rose, etc.).

**Validates: Requirements 10.1, 10.2, 10.3**

### Property 16: TailwindCSS Responsive Utilities Usage

*For all* responsive styling, TailwindCSS breakpoint utilities (sm:, md:, lg:, xl:) should be used instead of custom media queries.

**Validates: Requirements 10.5**

### Property 17: Keyboard Navigation Preservation

*For any* interactive element, it should be keyboard accessible (reachable via Tab, activatable via Enter/Space).

**Validates: Requirements 11.1**

### Property 18: Focus Trap in Modal State

*For any* viewport width below 1280px when the Current_Order_Panel is open, pressing Tab should cycle focus only through elements within the panel (focus trap).

**Validates: Requirements 11.2**

### Property 19: Accessibility Attributes

*For any* interactive element, it should have appropriate accessibility attributes (aria-label, aria-labelledby, or descriptive text content).

**Validates: Requirements 11.4**

### Property 20: Color Contrast Compliance

*For any* text element, the color contrast ratio between text and background should meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text).

**Validates: Requirements 11.5**

### Property 21: Skeleton Loader Grid Matching

*For any* viewport width during loading state, skeleton loaders should use the same grid column classes as the actual product grid.

**Validates: Requirements 12.1, 12.5**


## Error Handling

The responsive redesign maintains all existing error handling patterns:

### 1. API Errors

**Existing Behavior (Preserved):**
- Failed product/category/tax group loading: Logged to console, loading state cleared
- Failed bill creation: Alert displayed with error message from API response
- Network errors: Caught and logged

**No Changes Required:** All API error handling remains unchanged as the redesign is purely presentational.

### 2. UI State Errors

**New Error Scenarios:**

**Panel State Conflicts:**
- **Scenario**: User rapidly toggles drawer/bottom sheet
- **Handling**: Debounce state changes or use transition end events to prevent conflicts
- **Implementation**: Add `pointer-events: none` during transitions

**Viewport Resize During Panel Open:**
- **Scenario**: User resizes browser while drawer/bottom sheet is open
- **Handling**: Close panel on breakpoint change or adapt panel mode
- **Implementation**: Add resize listener that closes panel when crossing 1280px threshold

**Focus Management Errors:**
- **Scenario**: Focus trap fails or focus is lost
- **Handling**: Fallback to panel container if target element is not found
- **Implementation**: Use try-catch in focus management code

### 3. Touch Interaction Errors

**Accidental Touches:**
- **Mitigation**: Adequate spacing between touch targets (minimum 8px gap)
- **Mitigation**: Minimum 44x44px touch target sizes
- **Mitigation**: Visual feedback on touch (active states)

**Scroll Conflicts:**
- **Scenario**: Horizontal scroll on category filter conflicts with page scroll
- **Handling**: Use `overscroll-behavior-x: contain` on category filter
- **Implementation**: Prevent scroll propagation to parent

### 4. Accessibility Errors

**Screen Reader Announcements:**
- **Scenario**: State changes not announced
- **Handling**: Use `aria-live` regions for dynamic content
- **Implementation**: Add `aria-live="polite"` to cart item count

**Keyboard Trap Escape:**
- **Scenario**: User cannot exit focus trap
- **Handling**: Always provide Escape key handler to close panel
- **Implementation**: Add `onKeyDown` listener for Escape key

## Testing Strategy

The testing strategy employs a dual approach combining unit tests for specific scenarios and property-based tests for universal behaviors.

### Unit Testing Approach

Unit tests focus on:
- **Specific breakpoint examples**: Testing exact behavior at 767px, 768px, 1280px
- **Component rendering**: Verifying correct components render at each breakpoint
- **User interactions**: Testing button clicks, form inputs, panel toggles
- **Edge cases**: Empty cart, single item, many items
- **Integration points**: API calls, state updates, event handlers

**Key Unit Test Scenarios:**

1. **Breakpoint-Specific Rendering**
   - Desktop (1280px): Verify sticky sidebar is visible, FAB is hidden
   - Tablet (1024px): Verify drawer implementation, FAB is visible
   - Mobile (375px): Verify bottom sheet implementation, FAB is visible

2. **Panel Toggle Interactions**
   - Click FAB → Panel opens
   - Click overlay → Panel closes
   - Click close button → Panel closes
   - Press Escape → Panel closes

3. **Responsive Grid Rendering**
   - Mobile: Single column grid
   - Tablet: Two column grid
   - Desktop: Three column grid

4. **Category Filter Behavior**
   - Mobile: Horizontal scroll enabled
   - Desktop: Flex wrap enabled

5. **Existing Functionality**
   - Add to cart works at all breakpoints
   - Search filters products at all breakpoints
   - Category filter works at all breakpoints
   - Tax calculations are correct
   - Order completion works
   - Invoice printing works

### Property-Based Testing Approach

Property tests verify universal behaviors across many generated inputs. Each property test should run a minimum of 100 iterations.

**Testing Library:** Use `@fast-check/vitest` for property-based testing in the Vitest environment.

**Property Test Configuration:**
```typescript
import fc from 'fast-check'
import { describe, it, expect } from 'vitest'

describe('Property Tests', () => {
  it('should pass property test', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }), // viewport widths
        (viewportWidth) => {
          // Test property
        }
      ),
      { numRuns: 100 } // Minimum 100 iterations
    )
  })
})
```

**Key Property Tests:**

1. **Property 1: Responsive Grid Column Count**
   - **Tag**: `Feature: responsive-orders-page, Property 1: Responsive Grid Column Count`
   - **Generator**: Random viewport widths (320px - 2560px)
   - **Assertion**: Verify correct column count based on width

2. **Property 8: No Horizontal Overflow**
   - **Tag**: `Feature: responsive-orders-page, Property 8: No Horizontal Overflow`
   - **Generator**: Random viewport widths, random product counts
   - **Assertion**: `document.body.scrollWidth === window.innerWidth`

3. **Property 10: Product Filtering Preservation**
   - **Tag**: `Feature: responsive-orders-page, Property 10: Product Filtering Preservation`
   - **Generator**: Random category selections, random product lists
   - **Assertion**: Filtered products match selected category

4. **Property 11: Search Functionality Preservation**
   - **Tag**: `Feature: responsive-orders-page, Property 11: Search Functionality Preservation`
   - **Generator**: Random search terms, random product lists
   - **Assertion**: Filtered products contain search term

5. **Property 12: Cart Operations Preservation**
   - **Tag**: `Feature: responsive-orders-page, Property 12: Cart Operations Preservation`
   - **Generator**: Random sequences of add/remove/update operations
   - **Assertion**: Final cart state matches expected state

6. **Property 13: Tax Calculation Preservation**
   - **Tag**: `Feature: responsive-orders-page, Property 13: Tax Calculation Preservation`
   - **Generator**: Random bill items with various tax groups
   - **Assertion**: Calculated totals match expected values

7. **Property 7: Touch Target Minimum Size**
   - **Tag**: `Feature: responsive-orders-page, Property 7: Touch Target Minimum Size`
   - **Generator**: All interactive elements on mobile viewport
   - **Assertion**: Each element has min 44x44px touch target

8. **Property 15: Design Token Preservation**
   - **Tag**: `Feature: responsive-orders-page, Property 15: Design Token Preservation`
   - **Generator**: Random elements using brand colors
   - **Assertion**: Computed colors match design system

9. **Property 17: Keyboard Navigation Preservation**
   - **Tag**: `Feature: responsive-orders-page, Property 17: Keyboard Navigation Preservation`
   - **Generator**: All interactive elements
   - **Assertion**: Each element is keyboard accessible

10. **Property 20: Color Contrast Compliance**
    - **Tag**: `Feature: responsive-orders-page, Property 20: Color Contrast Compliance`
    - **Generator**: All text elements
    - **Assertion**: Contrast ratio meets WCAG AA standards

### Visual Regression Testing

While not property-based, visual regression tests are valuable for responsive design:

**Tool**: Playwright with screenshot comparison

**Test Scenarios:**
- Capture screenshots at key breakpoints (375px, 768px, 1024px, 1280px, 1920px)
- Compare against baseline images
- Test with empty cart, partial cart, full cart
- Test with panel open and closed
- Test loading states

### Testing Environment Setup

**Viewport Testing:**
```typescript
// Helper to set viewport size
function setViewport(width: number, height: number = 800) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  })
  window.dispatchEvent(new Event('resize'))
}
```

**Touch Event Simulation:**
```typescript
// Helper to simulate touch events
function simulateTouch(element: HTMLElement, eventType: string) {
  const touchEvent = new TouchEvent(eventType, {
    bubbles: true,
    cancelable: true,
    touches: [{ clientX: 0, clientY: 0 }],
  })
  element.dispatchEvent(touchEvent)
}
```

**Accessibility Testing:**
```typescript
// Use @axe-core/react for automated accessibility testing
import { axe } from 'jest-axe'

it('should have no accessibility violations', async () => {
  const { container } = render(<OrdersPage />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### Test Coverage Goals

- **Unit Test Coverage**: Minimum 80% code coverage
- **Property Test Coverage**: All 21 correctness properties implemented
- **Visual Regression**: Key breakpoints and states covered
- **Accessibility**: Zero violations in axe-core tests
- **Integration**: All existing functionality verified at each breakpoint

### Continuous Integration

Tests should run on:
- Every pull request
- Multiple viewport sizes (mobile, tablet, desktop)
- Multiple browsers (Chrome, Firefox, Safari)
- Both light and dark modes (if applicable)

## Implementation Notes

### TailwindCSS Configuration

Ensure the following utilities are available in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      width: {
        '150': '37.5rem', // 600px for sidebar
      },
      maxHeight: {
        '150': '37.5rem', // For order items list
      },
      spacing: {
        '150': '37.5rem',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'), // For hiding scrollbars
  ],
}
```

### Performance Considerations

1. **Avoid Layout Thrashing**: Batch DOM reads and writes
2. **Use CSS Transforms**: For animations (translate, not left/right)
3. **Debounce Resize Events**: Prevent excessive re-renders
4. **Lazy Load Images**: Use Next.js Image component with priority flags
5. **Memoize Expensive Calculations**: Use React.useMemo for filtered products

### Browser Compatibility

- **Target**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **Fallbacks**: Provide basic layout for older browsers
- **Feature Detection**: Use `@supports` for CSS features
- **Polyfills**: Not required for target browsers

### Migration Strategy

1. **Phase 1**: Implement responsive grid and category filter
2. **Phase 2**: Implement drawer/bottom sheet for Current Order panel
3. **Phase 3**: Implement FAB and overlay
4. **Phase 4**: Refine touch targets and accessibility
5. **Phase 5**: Testing and refinement

### Code Organization

Suggested file structure:
```
frontend/app/orders/
├── page.tsx (main component)
├── components/
│   ├── OrderPanelContent.tsx (extracted panel content)
│   ├── ProductCard.tsx (responsive product card)
│   ├── CategoryFilter.tsx (responsive category filter)
│   ├── FloatingActionButton.tsx (FAB component)
│   └── Overlay.tsx (modal overlay)
├── hooks/
│   ├── useResponsive.ts (viewport detection hook)
│   └── useFocusTrap.ts (focus management hook)
└── __tests__/
    ├── OrdersPage.test.tsx (unit tests)
    ├── OrdersPage.property.test.tsx (property tests)
    └── OrdersPage.visual.test.tsx (visual regression)
```

### Accessibility Checklist

- [ ] All interactive elements have visible focus indicators
- [ ] Focus trap works correctly in drawer/bottom sheet
- [ ] Escape key closes drawer/bottom sheet
- [ ] Focus returns to FAB after closing panel
- [ ] ARIA labels present on all buttons
- [ ] Color contrast meets WCAG AA standards
- [ ] Touch targets meet 44x44px minimum
- [ ] Screen reader announcements for state changes
- [ ] Keyboard navigation works at all breakpoints
- [ ] No keyboard traps (except intentional focus trap in panel)

## References

- [Responsive Web Design Best Practices](https://www.uxpin.com/studio/blog/best-practices-examples-of-excellent-responsive-design/) - Overview of fluid grids, flexible images, and CSS breakpoints for responsive design
- [Mobile Design Patterns](https://designmodo.com/mobile-design-patterns/) - Examples of responsive patterns including bottom sheets and drawers
- [TailwindCSS Responsive Design](https://tailwindcss.com/docs/responsive-design) - Official documentation for TailwindCSS breakpoints
- [React Bottom Sheet Patterns](https://oneuptime.com/blog/post/2026-01-15-react-native-bottom-sheet/view) - Guide to implementing bottom sheet UI patterns in React applications
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Web Content Accessibility Guidelines for color contrast and touch targets
