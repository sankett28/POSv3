// Example: How to use the new color system in your components

import React from 'react';

// ============================================
// EXAMPLE 1: Button Components
// ============================================
export function ButtonExamples() {
  return (
    <div className="space-y-4">
      {/* Primary Button - Using coffee-brown */}
      <button className="bg-coffee-brown text-white px-4 py-2 rounded-lg hover:bg-brand-dusty-rose transition-colors">
        Primary Action
      </button>

      {/* Secondary Button - Using warm-cream */}
      <button className="bg-warm-cream text-primary-text px-4 py-2 rounded-lg border border-border hover:bg-brand-light-pink">
        Secondary Action
      </button>

      {/* Success Button */}
      <button className="bg-success text-white px-4 py-2 rounded-lg hover:bg-success/90">
        Save Changes
      </button>

      {/* Danger Button */}
      <button className="bg-error text-white px-4 py-2 rounded-lg hover:bg-error/90">
        Delete
      </button>

      {/* Special Red Button - Using laalhai */}
      <button className="bg-laalhai text-white px-4 py-2 rounded-lg hover:bg-laalhai/90">
        Emergency Action
      </button>
    </div>
  );
}

// ============================================
// EXAMPLE 2: Card Components
// ============================================
export function CardExamples() {
  return (
    <div className="space-y-4">
      {/* Product Card */}
      <div className="bg-card-background border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-primary-text font-bold text-lg mb-2">Product Name</h3>
        <p className="text-secondary-text mb-4">Product description goes here</p>
        <div className="flex items-center justify-between">
          <span className="text-coffee-brown font-bold text-xl">₹299</span>
          <span className="bg-leaf-green text-white px-3 py-1 rounded-full text-sm">In Stock</span>
        </div>
      </div>

      {/* Category Card with Brand Colors */}
      <div className="bg-brand-light-pink border border-brand-dusty-rose rounded-lg p-4">
        <h4 className="text-brand-deep-burgundy font-semibold">Category Name</h4>
        <p className="text-muted-text text-sm">12 items</p>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 3: Status Badges
// ============================================
export function StatusBadges() {
  return (
    <div className="flex gap-2">
      <span className="bg-success text-white px-3 py-1 rounded-full text-sm font-medium">
        Active
      </span>
      <span className="bg-warning text-white px-3 py-1 rounded-full text-sm font-medium">
        Pending
      </span>
      <span className="bg-error text-white px-3 py-1 rounded-full text-sm font-medium">
        Inactive
      </span>
      <span className="bg-caramel text-white px-3 py-1 rounded-full text-sm font-medium">
        Featured
      </span>
    </div>
  );
}

// ============================================
// EXAMPLE 4: Form Inputs
// ============================================
export function FormExamples() {
  return (
    <div className="space-y-4">
      {/* Text Input */}
      <div>
        <label className="block text-primary-text font-medium mb-2">
          Product Name
        </label>
        <input
          type="text"
          className="w-full px-4 py-2 border border-border rounded-lg bg-card-background text-primary-text placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-coffee-brown"
          placeholder="Enter product name"
        />
      </div>

      {/* Select Dropdown */}
      <div>
        <label className="block text-primary-text font-medium mb-2">
          Category
        </label>
        <select className="w-full px-4 py-2 border border-border rounded-lg bg-card-background text-primary-text focus:outline-none focus:ring-2 focus:ring-coffee-brown">
          <option>Select category</option>
          <option>Beverages</option>
          <option>Snacks</option>
        </select>
      </div>

      {/* Textarea */}
      <div>
        <label className="block text-primary-text font-medium mb-2">
          Description
        </label>
        <textarea
          className="w-full px-4 py-2 border border-border rounded-lg bg-card-background text-primary-text placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-coffee-brown"
          placeholder="Enter description"
          rows={4}
        />
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 5: Navigation/Sidebar
// ============================================
export function NavigationExample() {
  return (
    <nav className="bg-coffee-brown text-white p-4">
      <div className="space-y-2">
        {/* Active nav item */}
        <a href="#" className="block px-4 py-2 bg-brand-dusty-rose rounded-lg font-medium">
          Dashboard
        </a>
        
        {/* Inactive nav items */}
        <a href="#" className="block px-4 py-2 hover:bg-brand-medium-red rounded-lg transition-colors">
          Products
        </a>
        <a href="#" className="block px-4 py-2 hover:bg-brand-medium-red rounded-lg transition-colors">
          Orders
        </a>
        <a href="#" className="block px-4 py-2 hover:bg-brand-medium-red rounded-lg transition-colors">
          Reports
        </a>
      </div>
    </nav>
  );
}

// ============================================
// EXAMPLE 6: Table
// ============================================
export function TableExample() {
  return (
    <div className="bg-card-background rounded-lg border border-border overflow-hidden">
      <table className="w-full">
        <thead className="bg-warm-cream">
          <tr>
            <th className="px-6 py-3 text-left text-primary-text font-semibold">Product</th>
            <th className="px-6 py-3 text-left text-primary-text font-semibold">Price</th>
            <th className="px-6 py-3 text-left text-primary-text font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-border hover:bg-warm-cream/50 transition-colors">
            <td className="px-6 py-4 text-primary-text">Coffee</td>
            <td className="px-6 py-4 text-secondary-text">₹120</td>
            <td className="px-6 py-4">
              <span className="bg-success text-white px-2 py-1 rounded text-sm">Active</span>
            </td>
          </tr>
          <tr className="border-t border-border hover:bg-warm-cream/50 transition-colors">
            <td className="px-6 py-4 text-primary-text">Tea</td>
            <td className="px-6 py-4 text-secondary-text">₹80</td>
            <td className="px-6 py-4">
              <span className="bg-error text-white px-2 py-1 rounded text-sm">Inactive</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// EXAMPLE 7: Modal/Dialog
// ============================================
export function ModalExample() {
  return (
    <div className="fixed inset-0 bg-primary-text/50 flex items-center justify-center p-4">
      <div className="bg-card-background rounded-lg shadow-xl max-w-md w-full">
        {/* Modal Header */}
        <div className="bg-coffee-brown text-white px-6 py-4 rounded-t-lg">
          <h2 className="text-xl font-bold">Add New Product</h2>
        </div>
        
        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <p className="text-secondary-text">
            Fill in the details to add a new product to your menu.
          </p>
          
          {/* Form fields would go here */}
        </div>
        
        {/* Modal Footer */}
        <div className="bg-warm-cream px-6 py-4 rounded-b-lg flex justify-end gap-3">
          <button className="px-4 py-2 border border-border rounded-lg text-secondary-text hover:bg-gray-100">
            Cancel
          </button>
          <button className="px-4 py-2 bg-coffee-brown text-white rounded-lg hover:bg-brand-dusty-rose">
            Save Product
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 8: Alert/Notification
// ============================================
export function AlertExamples() {
  return (
    <div className="space-y-4">
      {/* Success Alert */}
      <div className="bg-success/10 border border-success rounded-lg p-4 flex items-start gap-3">
        <div className="text-success">✓</div>
        <div>
          <h4 className="text-success font-semibold">Success!</h4>
          <p className="text-secondary-text text-sm">Product added successfully.</p>
        </div>
      </div>

      {/* Warning Alert */}
      <div className="bg-warning/10 border border-warning rounded-lg p-4 flex items-start gap-3">
        <div className="text-warning">⚠</div>
        <div>
          <h4 className="text-warning font-semibold">Warning</h4>
          <p className="text-secondary-text text-sm">Low stock alert for this item.</p>
        </div>
      </div>

      {/* Error Alert */}
      <div className="bg-error/10 border border-error rounded-lg p-4 flex items-start gap-3">
        <div className="text-error">✕</div>
        <div>
          <h4 className="text-error font-semibold">Error</h4>
          <p className="text-secondary-text text-sm">Failed to save changes.</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 9: Using CSS Variables (Custom Styles)
// ============================================
export function CustomStyledComponent() {
  return (
    <div 
      style={{
        background: 'var(--warm-cream)',
        border: '2px solid var(--border)',
        borderRadius: '12px',
        padding: '24px',
      }}
    >
      <h3 style={{ color: 'var(--primary-text)' }}>
        Custom Styled Component
      </h3>
      <p style={{ color: 'var(--secondary-text)' }}>
        This uses CSS variables directly when you need more control.
      </p>
    </div>
  );
}

// ============================================
// QUICK REFERENCE
// ============================================
/*

BACKGROUND COLORS:
- bg-coffee-brown (Primary brand color)
- bg-warm-cream (Light background)
- bg-card-background (White cards)
- bg-laalhai (Special red)
- bg-brand-dusty-rose (Hover states)
- bg-leaf-green (Success/green accent)

TEXT COLORS:
- text-primary-text (Main text - dark burgundy)
- text-secondary-text (Secondary text - gray)
- text-muted-text (Muted/placeholder text)

BORDER COLORS:
- border-border (Default border color)
- border-brand-dusty-rose (Brand border)

STATUS COLORS:
- bg-success / text-success (Green)
- bg-warning / text-warning (Orange)
- bg-error / text-error (Red)

OPACITY MODIFIERS:
- bg-coffee-brown/50 (50% opacity)
- bg-success/10 (10% opacity for backgrounds)

*/
