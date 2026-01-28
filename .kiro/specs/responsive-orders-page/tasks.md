# Implementation Plan: Responsive Orders Page

## Overview

This implementation plan breaks down the responsive Orders page redesign into incremental, testable steps. Each task builds on previous work, ensuring the page remains functional throughout development. The approach follows a mobile-first strategy, implementing responsive layouts using TailwindCSS utilities while preserving all existing functionality.

## Tasks

- [ ] 1. Set up testing infrastructure and utilities
  - Install @fast-check/vitest for property-based testing
  - Create viewport testing utilities (setViewport helper)
  - Create touch event simulation utilities
  - Set up @axe-core/react for accessibility testing
  - Configure Vitest for responsive component testing
  - _Requirements: All (testing foundation)_

- [ ] 2. Implement responsive product grid layout
  - [ ] 2.1 Update product grid container with responsive column classes
    - Replace fixed grid with `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3`
    - Ensure consistent gap spacing across breakpoints
    - Test grid renders correctly at each breakpoint
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ] 2.2 Write property test for responsive grid column count
    - **Property 1: Responsive Grid Column Count**
    - **Validates: Requirements 1.1, 1.2, 1.3**

  - [ ] 2.3 Write unit tests for grid rendering at specific breakpoints
    - Test 1 column at 375px (mobile)
    - Test 2 columns at 1024px (tablet)
    - Test 3 columns at 1280px (desktop)
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 3. Implement responsive category filter
  - [ ] 3.1 Add responsive classes to category filter container
    - Mobile: `flex overflow-x-auto gap-2 pb-2 scrollbar-hide snap-x snap-mandatory`
    - Desktop: `md:flex-wrap md:overflow-x-visible`
    - Add `flex-shrink-0 snap-start` to category buttons for mobile
    - _Requirements: 2.1, 2.2_

  - [ ] 3.2 Install and configure tailwind-scrollbar-hide plugin
    - Add plugin to tailwind.config.js
    - Verify scrollbar is hidden on mobile category filter
    - _Requirements: 2.2_

  - [ ] 3.3 Write property test for category filter active state preservation
    - **Property 2: Category Filter Active State Preservation**
    - **Validates: Requirements 2.4**

  - [ ] 3.4 Write unit tests for category filter layout
    - Test horizontal scroll on mobile (767px)
    - Test flex wrap on desktop (1280px)
    - _Requirements: 2.1, 2.2_

- [ ] 4. Implement responsive search bar
  - [ ] 4.1 Update search bar with responsive width classes
    - Add `w-full` for all breakpoints (already full width)
    - Ensure consistent padding with `px-4 py-3`
    - Verify no horizontal overflow on focus
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ] 4.2 Write property test for search bar consistent styling
    - **Property 3: Search Bar Consistent Styling**
    - **Validates: Requirements 3.3**

  - [ ] 4.3 Write unit test for search bar focus behavior on mobile
    - Test no horizontal overflow when focused at 375px
    - _Requirements: 3.4_

- [ ] 5. Extract OrderPanelContent component
  - [ ] 5.1 Create new component file: components/OrderPanelContent.tsx
    - Extract current order panel JSX into reusable component
    - Accept `onClose?: () => void` prop for drawer/bottom sheet mode
    - Include header, items list, tax breakdown, payment selector, complete button
    - Maintain all existing functionality and state management
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ] 5.2 Write unit tests for OrderPanelContent component
    - Test renders with empty cart
    - Test renders with items in cart
    - Test clear button functionality
    - Test complete order button
    - _Requirements: 9.3, 9.6_

- [ ] 6. Implement desktop sticky sidebar (existing behavior)
  - [ ] 6.1 Wrap OrderPanelContent in desktop-only container
    - Add `hidden xl:block w-150 sticky top-4` wrapper
    - Render OrderPanelContent without onClose prop
    - Verify sidebar is visible only on desktop (≥1280px)
    - _Requirements: 4.1_

  - [ ] 6.2 Write unit test for desktop sidebar visibility
    - Test sidebar visible at 1280px
    - Test sidebar hidden at 1024px
    - _Requirements: 4.1_

- [ ] 7. Checkpoint - Verify desktop layout works correctly
  - Ensure all tests pass
  - Manually test at desktop breakpoint (≥1280px)
  - Verify existing functionality preserved
  - Ask the user if questions arise

- [ ] 8. Implement floating action button (FAB)
  - [ ] 8.1 Create FloatingActionButton component
    - Create components/FloatingActionButton.tsx
    - Render button with `xl:hidden fixed bottom-6 right-6 z-40`
    - Add ShoppingCart icon
    - Display item count badge when billItems.length > 0
    - Accept onClick prop to open panel
    - _Requirements: 4.4, 4.7_

  - [ ] 8.2 Add FAB to OrdersPage
    - Import and render FloatingActionButton
    - Pass onClick handler to set isOrderPanelOpen to true
    - Pass billItems.length for badge count
    - _Requirements: 4.4, 4.7_

  - [ ] 8.3 Write property test for FAB badge item count
    - **Property 5: FAB Badge Shows Item Count**
    - **Validates: Requirements 4.7**

  - [ ] 8.4 Write unit tests for FAB
    - Test FAB hidden on desktop (1280px)
    - Test FAB visible on tablet (1024px)
    - Test FAB visible on mobile (375px)
    - Test badge shows correct count
    - Test badge hidden when cart is empty
    - _Requirements: 4.4, 4.7_

- [ ] 9. Implement overlay component
  - [ ] 9.1 Create Overlay component
    - Create components/Overlay.tsx
    - Render div with `xl:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm`
    - Accept onClick prop to close panel
    - Accept isOpen prop for conditional rendering
    - Add fade-in/out transition
    - _Requirements: 4.5, 4.6_

  - [ ] 9.2 Add overlay to OrdersPage
    - Import and render Overlay
    - Pass isOrderPanelOpen state
    - Pass onClick handler to set isOrderPanelOpen to false
    - _Requirements: 4.5, 4.6_

  - [ ] 9.3 Write property test for overlay closes panel
    - **Property 4: Overlay Closes Panel**
    - **Validates: Requirements 4.5, 4.6**

  - [ ] 9.4 Write unit tests for overlay
    - Test overlay visible when panel open on tablet
    - Test overlay visible when panel open on mobile
    - Test overlay hidden when panel closed
    - Test clicking overlay closes panel
    - _Requirements: 4.5, 4.6_

- [ ] 10. Implement tablet drawer
  - [ ] 10.1 Create drawer container for tablet breakpoint
    - Add container with `hidden md:block xl:hidden fixed top-0 right-0 h-full w-96 bg-white z-50`
    - Add transform transition: `transform transition-transform duration-300 ease-in-out`
    - Conditionally apply `translate-x-0` or `translate-x-full` based on isOrderPanelOpen
    - Add `shadow-2xl overflow-y-auto`
    - Render OrderPanelContent with onClose prop
    - _Requirements: 4.2_

  - [ ] 10.2 Add close button to OrderPanelContent for drawer/bottom sheet mode
    - Conditionally render close button when onClose prop is provided
    - Position close button in header
    - Call onClose when clicked
    - _Requirements: 4.2_

  - [ ] 10.3 Write unit tests for tablet drawer
    - Test drawer hidden by default at 1024px
    - Test drawer slides in when FAB clicked
    - Test drawer slides out when overlay clicked
    - Test drawer slides out when close button clicked
    - _Requirements: 4.2_

- [ ] 11. Implement mobile bottom sheet
  - [ ] 11.1 Create bottom sheet container for mobile breakpoint
    - Add container with `md:hidden fixed bottom-0 left-0 right-0 bg-white z-50`
    - Add transform transition: `transform transition-transform duration-300 ease-in-out`
    - Conditionally apply `translate-y-0` or `translate-y-full` based on isOrderPanelOpen
    - Add `rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto`
    - _Requirements: 4.3_

  - [ ] 11.2 Add drag handle to bottom sheet
    - Add sticky header with drag handle indicator
    - Render `w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4`
    - Add header with title and close button
    - _Requirements: 4.3_

  - [ ] 11.3 Render OrderPanelContent in bottom sheet
    - Render OrderPanelContent with onClose prop
    - Ensure content scrolls within bottom sheet
    - _Requirements: 4.3_

  - [ ] 11.4 Write unit tests for mobile bottom sheet
    - Test bottom sheet hidden by default at 375px
    - Test bottom sheet slides up when FAB clicked
    - Test bottom sheet slides down when overlay clicked
    - Test bottom sheet slides down when close button clicked
    - _Requirements: 4.3_

- [ ] 12. Add state management for panel visibility
  - [ ] 12.1 Add isOrderPanelOpen state to OrdersPage
    - Add `const [isOrderPanelOpen, setIsOrderPanelOpen] = useState(false)`
    - Wire up FAB onClick to set state to true
    - Wire up overlay onClick to set state to false
    - Wire up OrderPanelContent onClose to set state to false
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ] 12.2 Write integration tests for panel state management
    - Test opening panel via FAB
    - Test closing panel via overlay
    - Test closing panel via close button
    - Test panel state at different breakpoints
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ] 13. Checkpoint - Verify responsive panel behavior
  - Ensure all tests pass
  - Manually test panel at all breakpoints
  - Verify smooth transitions
  - Verify overlay behavior
  - Ask the user if questions arise

- [ ] 14. Implement responsive product card layout
  - [ ] 14.1 Update ProductCard component structure
    - Add responsive flex direction: `flex flex-col md:flex-row`
    - Mobile: Stack image, content vertically
    - Desktop: Horizontal layout with image on left
    - Adjust image sizing: `w-full aspect-square md:w-32 md:h-32`
    - Update spacing and gaps for each breakpoint
    - _Requirements: 5.1, 5.2_

  - [ ] 14.2 Ensure product card images maintain aspect ratio
    - Verify `object-cover` is applied to all product images
    - Test images don't distort at any breakpoint
    - _Requirements: 5.4_

  - [ ] 14.3 Write property test for product card image aspect ratio
    - **Property 6: Product Card Image Aspect Ratio**
    - **Validates: Requirements 5.4**

  - [ ] 14.4 Write unit tests for product card layout
    - Test vertical layout at 375px
    - Test horizontal layout at 1024px
    - _Requirements: 5.1, 5.2_

- [ ] 15. Implement touch-friendly controls
  - [ ] 15.1 Update quantity controls for touch targets
    - Add responsive sizing: `p-3 md:p-2 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0`
    - Ensure adequate spacing between buttons: `gap-3 md:gap-4`
    - Apply to both product card and order panel quantity controls
    - _Requirements: 6.1, 6.2_

  - [ ] 15.2 Update "Add to Cart" button for touch targets
    - Ensure button has adequate height: `py-3 px-4`
    - Verify button is easily tappable on mobile
    - _Requirements: 6.3_

  - [ ] 15.3 Update payment method buttons for touch targets
    - Ensure buttons have minimum height: `min-h-[60px]`
    - Maintain grid layout: `grid grid-cols-3 gap-3`
    - Verify adequate touch target size
    - _Requirements: 6.5_

  - [ ] 15.4 Write property test for touch target minimum size
    - **Property 7: Touch Target Minimum Size**
    - **Validates: Requirements 6.1**

  - [ ] 15.5 Write unit tests for touch-friendly controls
    - Test quantity button sizes on mobile
    - Test payment button sizes on mobile
    - Test adequate spacing between buttons
    - _Requirements: 6.1, 6.2, 6.5_

- [ ] 16. Prevent horizontal overflow
  - [ ] 16.1 Add overflow prevention classes to main container
    - Add `overflow-x-hidden` to main page container
    - Ensure all child elements respect container width
    - Test with long product names and descriptions
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ] 16.2 Ensure text content wraps appropriately
    - Add `break-words` to product names and descriptions
    - Ensure no fixed widths that exceed viewport
    - Test with very long text content
    - _Requirements: 7.3_

  - [ ] 16.3 Ensure images scale within containers
    - Verify all images have `max-w-full` or similar constraint
    - Test with various image sizes
    - _Requirements: 7.4_

  - [ ] 16.4 Write property test for no horizontal overflow
    - **Property 8: No Horizontal Overflow**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

  - [ ] 16.5 Write unit tests for overflow prevention
    - Test no horizontal scroll at 375px with long content
    - Test no horizontal scroll at 1024px with long content
    - Test panel doesn't cause overflow
    - _Requirements: 7.1, 7.5_

- [ ] 17. Implement smooth transitions and animations
  - [ ] 17.1 Standardize animation durations
    - Set all transitions to 300ms: `duration-300`
    - Apply to drawer slide: `transition-transform duration-300 ease-in-out`
    - Apply to bottom sheet slide: `transition-transform duration-300 ease-in-out`
    - Apply to overlay fade: `transition-opacity duration-300 ease-in-out`
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ] 17.2 Add pointer-events-none during transitions
    - Prevent interaction conflicts during animations
    - Add/remove class based on transition state
    - _Requirements: 8.5_

  - [ ] 17.3 Write property test for consistent animation duration
    - **Property 9: Consistent Animation Duration**
    - **Validates: Requirements 8.4**

  - [ ] 17.4 Write unit tests for transitions
    - Test drawer transition classes applied
    - Test bottom sheet transition classes applied
    - Test overlay transition classes applied
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 18. Checkpoint - Verify responsive behavior and animations
  - Ensure all tests pass
  - Manually test all breakpoints
  - Verify smooth transitions
  - Verify no horizontal overflow
  - Verify touch targets are adequate
  - Ask the user if questions arise

- [ ] 19. Verify existing functionality preservation
  - [ ] 19.1 Write property test for product filtering preservation
    - **Property 10: Product Filtering Preservation**
    - **Validates: Requirements 9.1**

  - [ ] 19.2 Write property test for search functionality preservation
    - **Property 11: Search Functionality Preservation**
    - **Validates: Requirements 9.2**

  - [ ] 19.3 Write property test for cart operations preservation
    - **Property 12: Cart Operations Preservation**
    - **Validates: Requirements 9.3**

  - [ ] 19.4 Write property test for tax calculation preservation
    - **Property 13: Tax Calculation Preservation**
    - **Validates: Requirements 9.4**

  - [ ] 19.5 Write unit test for payment method selection
    - Test selecting Cash updates state
    - Test selecting UPI updates state
    - Test selecting Card updates state
    - _Requirements: 9.5_

  - [ ] 19.6 Write property test for API integration preservation
    - **Property 14: API Integration Preservation**
    - **Validates: Requirements 9.6, 9.8**

  - [ ] 19.7 Write unit test for invoice printing
    - Test print window opens with correct content
    - Test invoice contains all bill details
    - _Requirements: 9.7_

- [ ] 20. Verify design language preservation
  - [ ] 20.1 Write property test for design token preservation
    - **Property 15: Design Token Preservation**
    - **Validates: Requirements 10.1, 10.2, 10.3**

  - [ ] 20.2 Write property test for TailwindCSS utilities usage
    - **Property 16: TailwindCSS Responsive Utilities Usage**
    - **Validates: Requirements 10.5**

  - [ ] 20.3 Write unit tests for design consistency
    - Test brand colors are applied correctly
    - Test typography is consistent
    - Test border radius and shadows are preserved
    - _Requirements: 10.1, 10.2, 10.3_

- [ ] 21. Implement accessibility features
  - [ ] 21.1 Add keyboard navigation support
    - Ensure all interactive elements are keyboard accessible
    - Add proper tabindex where needed
    - Test Tab navigation through all elements
    - _Requirements: 11.1_

  - [ ] 21.2 Implement focus trap for drawer/bottom sheet
    - Create useFocusTrap hook
    - Apply focus trap when panel is open
    - Ensure Tab cycles only through panel elements
    - _Requirements: 11.2_

  - [ ] 21.3 Add Escape key handler to close panel
    - Listen for Escape key when panel is open
    - Close panel and return focus to FAB
    - _Requirements: 11.3_

  - [ ] 21.4 Add ARIA labels to interactive elements
    - Add aria-label to FAB: "Open current order"
    - Add aria-label to close button: "Close current order"
    - Add aria-label to overlay: "Close current order"
    - Add aria-label to quantity buttons
    - Add aria-label to payment method buttons
    - _Requirements: 11.4_

  - [ ] 21.5 Add aria-live region for cart updates
    - Add aria-live="polite" to cart item count
    - Announce when items are added/removed
    - _Requirements: 11.6_

  - [ ] 21.6 Write property test for keyboard navigation
    - **Property 17: Keyboard Navigation Preservation**
    - **Validates: Requirements 11.1**

  - [ ] 21.7 Write property test for focus trap
    - **Property 18: Focus Trap in Modal State**
    - **Validates: Requirements 11.2**

  - [ ] 21.8 Write unit test for focus restoration
    - Test focus returns to FAB after closing panel with Escape
    - _Requirements: 11.3_

  - [ ] 21.9 Write property test for accessibility attributes
    - **Property 19: Accessibility Attributes**
    - **Validates: Requirements 11.4**

  - [ ] 21.10 Write property test for color contrast compliance
    - **Property 20: Color Contrast Compliance**
    - **Validates: Requirements 11.5**

  - [ ] 21.11 Run axe-core accessibility tests
    - Test for accessibility violations at all breakpoints
    - Fix any violations found
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 22. Update loading skeleton states
  - [ ] 22.1 Update product grid skeleton loaders
    - Apply same responsive grid classes to skeleton container
    - Ensure skeletons match product card layout at each breakpoint
    - _Requirements: 12.1_

  - [ ] 22.2 Update category filter skeleton loaders
    - Apply same responsive classes to category skeleton buttons
    - Ensure skeletons match category button layout
    - _Requirements: 12.5_

  - [ ] 22.3 Write property test for skeleton loader grid matching
    - **Property 21: Skeleton Loader Grid Matching**
    - **Validates: Requirements 12.1, 12.5**

  - [ ] 22.4 Write unit tests for skeleton loaders
    - Test skeleton grid has 1 column at 375px
    - Test skeleton grid has 2 columns at 1024px
    - Test skeleton grid has 3 columns at 1280px
    - _Requirements: 12.2, 12.3, 12.4_

- [ ] 23. Final checkpoint - Comprehensive testing
  - Run all unit tests and verify 100% pass
  - Run all property tests and verify 100% pass
  - Run accessibility tests and verify zero violations
  - Manually test at all breakpoints (375px, 768px, 1024px, 1280px, 1920px)
  - Test with empty cart, partial cart, full cart
  - Test all user flows (add to cart, remove, update quantity, complete order)
  - Test keyboard navigation
  - Test touch interactions on mobile device
  - Verify no horizontal overflow at any breakpoint
  - Verify smooth transitions
  - Ask the user if questions arise

- [ ] 24. Code cleanup and optimization
  - [ ] 24.1 Extract reusable components
    - Consider extracting ProductCard if not already separate
    - Consider extracting CategoryFilter if not already separate
    - Ensure components are properly typed
    - _Requirements: All_

  - [ ] 24.2 Add performance optimizations
    - Add React.memo to expensive components
    - Use useMemo for filtered products
    - Optimize re-renders
    - _Requirements: All_

  - [ ] 24.3 Add code comments and documentation
    - Document responsive breakpoints
    - Document component props
    - Add JSDoc comments to functions
    - _Requirements: All_

  - [ ] 24.4 Remove any console.logs and debug code
    - Clean up development artifacts
    - Ensure production-ready code
    - _Requirements: All_

## Notes

- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout development
- Property tests validate universal correctness properties with minimum 100 iterations
- Unit tests validate specific examples and edge cases
- All existing functionality must be preserved - no backend changes required
- Use TailwindCSS responsive utilities exclusively (sm:, md:, lg:, xl:)
- Maintain existing design language and brand colors throughout
- Focus on accessibility and touch-friendly interactions for mobile users
