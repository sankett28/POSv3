/**
 * Theme Preview Demo Component
 * 
 * Demonstrates real-time theme updates across the UI.
 * Shows all semantic color slots in action.
 */
'use client'

export default function ThemePreviewDemo() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card-background rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold text-primary mb-2">
          Real-Time Theme Preview
        </h3>
        <p className="text-secondary-text">
          This preview updates instantly when you save theme changes.
        </p>
      </div>

      {/* Buttons Section */}
      <div className="bg-card-background rounded-lg shadow-sm p-6">
        <h4 className="text-lg font-semibold text-foreground mb-4">Buttons</h4>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 rounded bg-primary text-white hover:opacity-90 transition-opacity">
            Primary Button
          </button>
          <button className="px-4 py-2 rounded bg-secondary text-foreground border border-border hover:bg-gray-50 transition-colors">
            Secondary Button
          </button>
          <button className="px-4 py-2 rounded bg-accent text-white hover:opacity-90 transition-opacity">
            Accent Button
          </button>
        </div>
      </div>

      {/* Status Messages */}
      <div className="bg-card-background rounded-lg shadow-sm p-6">
        <h4 className="text-lg font-semibold text-foreground mb-4">Status Messages</h4>
        <div className="space-y-3">
          <div className="p-3 rounded bg-success text-white">
            ✓ Success: Operation completed successfully
          </div>
          <div className="p-3 rounded bg-warning text-white">
            ⚠ Warning: Please review your changes
          </div>
          <div className="p-3 rounded bg-danger text-white">
            ✕ Error: Something went wrong
          </div>
        </div>
      </div>

      {/* Text Contrast */}
      <div className="bg-background rounded-lg shadow-sm p-6 border border-border">
        <h4 className="text-lg font-semibold text-foreground mb-4">
          Text Contrast (Background/Foreground)
        </h4>
        <p className="text-foreground mb-2">
          This is primary text on the background color. It should have at least 4.5:1 contrast ratio.
        </p>
        <p className="text-secondary-text mb-2">
          This is secondary text for less important information.
        </p>
        <p className="text-muted-text">
          This is muted text for hints and placeholders.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card-background rounded-lg shadow-sm p-4 border border-border">
          <div className="w-12 h-12 rounded-full bg-primary mb-3"></div>
          <h5 className="font-semibold text-foreground mb-1">Primary Card</h5>
          <p className="text-sm text-secondary-text">Uses primary color accent</p>
        </div>
        
        <div className="bg-card-background rounded-lg shadow-sm p-4 border border-border">
          <div className="w-12 h-12 rounded-full bg-accent mb-3"></div>
          <h5 className="font-semibold text-foreground mb-1">Accent Card</h5>
          <p className="text-sm text-secondary-text">Uses accent color</p>
        </div>
        
        <div className="bg-card-background rounded-lg shadow-sm p-4 border border-border">
          <div className="w-12 h-12 rounded-full bg-success mb-3"></div>
          <h5 className="font-semibold text-foreground mb-1">Success Card</h5>
          <p className="text-sm text-secondary-text">Uses success color</p>
        </div>
      </div>

      {/* Interactive Elements */}
      <div className="bg-card-background rounded-lg shadow-sm p-6">
        <h4 className="text-lg font-semibold text-foreground mb-4">Interactive Elements</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Input Field
            </label>
            <input
              type="text"
              placeholder="Type something..."
              className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select Dropdown
            </label>
            <select className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground">
              <option>Option 1</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </select>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-card-background rounded-lg shadow-sm p-6">
        <h4 className="text-lg font-semibold text-foreground mb-4">Badges & Tags</h4>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full bg-primary text-white text-sm">
            Primary
          </span>
          <span className="px-3 py-1 rounded-full bg-accent text-white text-sm">
            Accent
          </span>
          <span className="px-3 py-1 rounded-full bg-success text-white text-sm">
            Success
          </span>
          <span className="px-3 py-1 rounded-full bg-warning text-white text-sm">
            Warning
          </span>
          <span className="px-3 py-1 rounded-full bg-danger text-white text-sm">
            Danger
          </span>
          <span className="px-3 py-1 rounded-full bg-secondary text-foreground border border-border text-sm">
            Secondary
          </span>
        </div>
      </div>

      {/* Live Update Indicator */}
      <div className="bg-card-background rounded-lg shadow-sm p-6 border-2 border-primary">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-success animate-pulse"></div>
          <div>
            <h4 className="font-semibold text-foreground">Live Theme Active</h4>
            <p className="text-sm text-secondary-text">
              Changes apply instantly when you save in the Theme Editor
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
