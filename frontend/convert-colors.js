// Helper script to convert hex colors to OKLCH format
// Run with: node convert-colors.js

const colors = {
  'brand-deep-burgundy': '#610027',
  'brand-medium-red': '#912b48',
  'brand-dusty-rose': '#b45a69',
  'brand-light-pink': '#fff0f3',
  'laalhai': '#ff0000',
  'coffee-brown': '#912b48',
  'warm-cream': '#fff0f3',
  'card-background': '#ffffff',
  'caramel': '#b45a69',
  'leaf-green': '#4caf50',
  'soft-orange': '#912b48',
  'border': '#e5e7eb',
  'primary-text': '#610027',
  'secondary-text': '#6b6b6b',
  'muted-text': '#9ca3af',
  'success': '#22c55e',
  'warning': '#f59e0b',
  'error': '#ef4444',
  'gray-200': '#e5e7eb',
  'gray-300': '#d1d5db',
  'gray-500': '#6b6b6b',
  'gray-600': '#4b5563',
};

// Simple hex to RGB conversion
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : null;
}

// RGB to OKLCH (simplified - for accurate conversion use a proper library)
function rgbToOklch(r, g, b) {
  // This is a simplified approximation
  // For production, use a library like culori or color.js
  const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const c = Math.sqrt(Math.pow(r - l, 2) + Math.pow(g - l, 2) + Math.pow(b - l, 2));
  const h = Math.atan2(b - l, r - l) * 180 / Math.PI;
  
  return `oklch(${l.toFixed(4)} ${c.toFixed(4)} ${h.toFixed(2)})`;
}

console.log('/* Converted OKLCH Colors */\n');
for (const [name, hex] of Object.entries(colors)) {
  const rgb = hexToRgb(hex);
  if (rgb) {
    const oklch = rgbToOklch(rgb.r, rgb.g, rgb.b);
    console.log(`--${name}: ${oklch}; /* ${hex} */`);
  }
}

console.log('\n/* Note: For accurate OKLCH conversion, use: https://oklch.com/ */');
