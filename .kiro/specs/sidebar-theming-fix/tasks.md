# Implementation Plan: Unified Theming System

## Overview

This implementation plan converts the application to use a unified theming system with 6-7 core CSS variables defined in `globals.css`. All components will reference only these core variables, eliminating hardcoded colors and enabling theme changes by editing only the `:root` and `@theme inline` sections of `globals.css`.

## Tasks

- [ ] 1. Define core color system in globals.css
  - Create 6-7 core CSS variables in `:root` selector
  - Map core variables to Tailwind utilities in `@theme inline`
  - Remove or consolidate redundant color variables
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 2. Update Sidebar component to use core colors
  - [ ] 2.1 Replace sidebar container background colors with core variables
    - Replace `bg-gradient-to-b from-card-background to-warm-cream/95` with `bg-app-surface`
    - Replace border colors with `border-app-border`
    - _Requirements: 2.1, 2.3_
  
  - [ ] 2.2 Update sidebar header colors
    - Replace header background with `bg-app-surface`
    - Replace border with `border-app-border`
    - Update text colors to use `text-app-text`
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [ ] 2.3 Update navigation item colors
    - Replace active state `bg-coffee-brown` with `bg-app-primary`
    - Replace inactive state colors with `text-app-text hover:bg-app-accent/10`
    - Update icon container backgrounds to use core variables
    - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3, 3.4_
  
  - [ ] 2.4 Update logout button colors
    - Replace button colors with `text-app-text hover:bg-app-accent/10`
    - Update icon colors to inherit from parent
    - _Requirements: 2.1, 2.2_

- [ ] 3. Update Mobile Header component to use core colors
  - [ ] 3.1 Replace mobile header background colors
    - Replace `bg-card-background/95` with `bg-app-surface/95`
    - Replace border with `border-app-border`
    - _Requirements: 6.1, 6.2_
  
  - [ ] 3.2 Update mobile menu button colors
    - Replace `text-coffee-brown` with `text-app-text`
    - Replace hover state `hover:bg-warm-cream/50` with `hover:bg-app-accent/10`
    - _Requirements: 6.2_
  
  - [ ] 3.3 Update mobile backdrop colors
    - Replace backdrop color with `bg-app-text/50`
    - _Requirements: 6.3_

- [ ] 4. Update Dashboard Layout to use core colors
  - Replace `bg-warm-cream` with `bg-app-background`
  - _Requirements: 4.1_

- [ ] 5. Checkpoint - Verify theme changes propagate
  - Test changing core color values in globals.css
  - Verify entire UI updates to reflect new colors
  - Ensure no hardcoded colors remain
  - Ask the user if questions arise
  - _Requirements: 4.2, 5.1_

- [ ]* 6. Write unit tests for component styling
  - [ ]* 6.1 Test sidebar renders with correct core variable classes
    - Verify sidebar container uses `bg-app-surface`
    - Verify active navigation item uses `bg-app-primary`
    - _Requirements: 2.1, 3.1_
  
  - [ ]* 6.2 Test mobile header renders with correct classes
    - Verify mobile header uses `bg-app-surface/95`
    - Verify menu button uses `text-app-text`
    - _Requirements: 6.1, 6.2_
  
  - [ ]* 6.3 Test no hardcoded colors remain
    - Scan component files for hardcoded color classes
    - Verify all colors reference core variables
    - _Requirements: 2.4, 4.3_

- [ ]* 7. Write property-based tests for theming system
  - [ ]* 7.1 Property test: CSS variable propagation
    - **Property 1: CSS Variable Propagation**
    - Generate random color values and verify they propagate to components
    - **Validates: Requirements 4.2, 5.1**
  
  - [ ]* 7.2 Property test: Active navigation styling
    - **Property 2: Active Navigation Styling**
    - Verify active items always use --app-primary
    - **Validates: Requirements 3.1**
  
  - [ ]* 7.3 Property test: Hover state styling
    - **Property 3: Hover State Styling**
    - Verify hover states use --app-accent
    - **Validates: Requirements 3.2**
  
  - [ ]* 7.4 Property test: Icon color inheritance
    - **Property 4: Icon Color Inheritance**
    - Verify icons inherit parent text color
    - **Validates: Requirements 3.3**
  
  - [ ]* 7.5 Property test: Text color consistency
    - **Property 5: Text Color Consistency**
    - Verify all text uses core text variables
    - **Validates: Requirements 3.4**
  
  - [ ]* 7.6 Property test: Mobile-desktop consistency
    - **Property 6: Mobile-Desktop Consistency**
    - Verify colors match across viewports
    - **Validates: Requirements 6.4**

- [ ] 8. Final checkpoint - Ensure all tests pass
  - Run all unit and property tests
  - Verify theme changes work as expected
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster implementation
- The core implementation is in tasks 1-5
- Testing tasks (6-7) validate the implementation but are not required for functionality
- Each task references specific requirements for traceability
- Minimum 100 iterations per property test
