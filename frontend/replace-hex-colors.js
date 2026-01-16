#!/usr/bin/env node

/**
 * Script to replace hex color codes with Tailwind utility classes or CSS variables
 * Usage: node replace-hex-colors.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Color mapping: hex code -> replacement
const colorMappings = {
  // Brand Colors
  '#610027': {
    className: 'brand-deep-burgundy',
    textClass: 'primary-text',
    cssVar: 'var(--primary-text)',
    description: 'Deep burgundy / Primary text'
  },
  '#912B48': {
    className: 'coffee-brown',
    cssVar: 'var(--coffee-brown)',
    description: 'Coffee brown / Primary brand'
  },
  '#912b48': {
    className: 'coffee-brown',
    cssVar: 'var(--coffee-brown)',
    description: 'Coffee brown / Primary brand'
  },
  '#B45A69': {
    className: 'brand-dusty-rose',
    cssVar: 'var(--brand-dusty-rose)',
    description: 'Dusty rose / Hover states'
  },
  '#b45a69': {
    className: 'brand-dusty-rose',
    cssVar: 'var(--brand-dusty-rose)',
    description: 'Dusty rose / Hover states'
  },
  '#FFF0F3': {
    className: 'warm-cream',
    cssVar: 'var(--warm-cream)',
    description: 'Warm cream / Light background'
  },
  '#fff0f3': {
    className: 'warm-cream',
    cssVar: 'var(--warm-cream)',
    description: 'Warm cream / Light background'
  },
  
  // Neutrals
  '#FFFFFF': {
    className: 'card-background',
    cssVar: 'var(--card-background)',
    description: 'White / Card background'
  },
  '#ffffff': {
    className: 'card-background',
    cssVar: 'var(--card-background)',
    description: 'White / Card background'
  },
  '#E5E7EB': {
    className: 'border',
    cssVar: 'var(--border)',
    description: 'Border color'
  },
  '#e5e7eb': {
    className: 'border',
    cssVar: 'var(--border)',
    description: 'Border color'
  },
  '#F9F9F9': {
    className: 'warm-cream',
    cssVar: 'var(--warm-cream)',
    description: 'Light gray background'
  },
  '#f9f9f9': {
    className: 'warm-cream',
    cssVar: 'var(--warm-cream)',
    description: 'Light gray background'
  },
  '#fdfdfd': {
    className: 'card-background',
    cssVar: 'var(--card-background)',
    description: 'Near-white background'
  },
  
  // Text Colors
  '#6B6B6B': {
    className: 'secondary-text',
    textClass: 'secondary-text',
    cssVar: 'var(--secondary-text)',
    description: 'Secondary text'
  },
  '#6b6b6b': {
    className: 'secondary-text',
    textClass: 'secondary-text',
    cssVar: 'var(--secondary-text)',
    description: 'Secondary text'
  },
  '#9CA3AF': {
    className: 'muted-text',
    textClass: 'muted-text',
    cssVar: 'var(--muted-text)',
    description: 'Muted text'
  },
  '#9ca3af': {
    className: 'muted-text',
    textClass: 'muted-text',
    cssVar: 'var(--muted-text)',
    description: 'Muted text'
  },
  '#4C1D3D': {
    className: 'primary-text',
    textClass: 'primary-text',
    cssVar: 'var(--primary-text)',
    description: 'Primary text'
  },
  '#4c1d3d': {
    className: 'primary-text',
    textClass: 'primary-text',
    cssVar: 'var(--primary-text)',
    description: 'Primary text'
  },
  
  // Accent Colors
  '#4CAF50': {
    className: 'leaf-green',
    cssVar: 'var(--leaf-green)',
    description: 'Leaf green'
  },
  '#4caf50': {
    className: 'leaf-green',
    cssVar: 'var(--leaf-green)',
    description: 'Leaf green'
  },
  
  // Status Colors
  '#22C55E': {
    className: 'success',
    cssVar: 'var(--success)',
    description: 'Success'
  },
  '#22c55e': {
    className: 'success',
    cssVar: 'var(--success)',
    description: 'Success'
  },
  '#F59E0B': {
    className: 'warning',
    cssVar: 'var(--warning)',
    description: 'Warning'
  },
  '#f59e0b': {
    className: 'warning',
    cssVar: 'var(--warning)',
    description: 'Warning'
  },
  '#EF4444': {
    className: 'error',
    cssVar: 'var(--error)',
    description: 'Error'
  },
  '#ef4444': {
    className: 'error',
    cssVar: 'var(--error)',
    description: 'Error'
  },
};

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let changes = [];

  // Replace className patterns
  for (const [hex, mapping] of Object.entries(colorMappings)) {
    const escapedHex = hex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Replace bg-[#HEX]
    const bgPattern = new RegExp(`bg-\\[${escapedHex}\\]`, 'g');
    if (content.match(bgPattern)) {
      content = content.replace(bgPattern, `bg-${mapping.className}`);
      changes.push(`bg-[${hex}] → bg-${mapping.className}`);
      modified = true;
    }
    
    // Replace text-[#HEX]
    const textPattern = new RegExp(`text-\\[${escapedHex}\\]`, 'g');
    if (content.match(textPattern)) {
      const textClass = mapping.textClass || mapping.className;
      content = content.replace(textPattern, `text-${textClass}`);
      changes.push(`text-[${hex}] → text-${textClass}`);
      modified = true;
    }
    
    // Replace border-[#HEX]
    const borderPattern = new RegExp(`border-\\[${escapedHex}\\]`, 'g');
    if (content.match(borderPattern)) {
      content = content.replace(borderPattern, `border-${mapping.className}`);
      changes.push(`border-[${hex}] → border-${mapping.className}`);
      modified = true;
    }
    
    // Replace hover:bg-[#HEX]
    const hoverBgPattern = new RegExp(`hover:bg-\\[${escapedHex}\\]`, 'g');
    if (content.match(hoverBgPattern)) {
      content = content.replace(hoverBgPattern, `hover:bg-${mapping.className}`);
      changes.push(`hover:bg-[${hex}] → hover:bg-${mapping.className}`);
      modified = true;
    }
    
    // Replace hover:text-[#HEX]
    const hoverTextPattern = new RegExp(`hover:text-\\[${escapedHex}\\]`, 'g');
    if (content.match(hoverTextPattern)) {
      const textClass = mapping.textClass || mapping.className;
      content = content.replace(hoverTextPattern, `hover:text-${textClass}`);
      changes.push(`hover:text-[${hex}] → hover:text-${textClass}`);
      modified = true;
    }
    
    // Replace focus:ring-[#HEX]
    const focusRingPattern = new RegExp(`focus:ring-\\[${escapedHex}\\]`, 'g');
    if (content.match(focusRingPattern)) {
      content = content.replace(focusRingPattern, `focus:ring-${mapping.className}`);
      changes.push(`focus:ring-[${hex}] → focus:ring-${mapping.className}`);
      modified = true;
    }
    
    // Replace focus:border-[#HEX]
    const focusBorderPattern = new RegExp(`focus:border-\\[${escapedHex}\\]`, 'g');
    if (content.match(focusBorderPattern)) {
      content = content.replace(focusBorderPattern, `focus:border-${mapping.className}`);
      changes.push(`focus:border-[${hex}] → focus:border-${mapping.className}`);
      modified = true;
    }
    
    // Replace in CSS/style tags: background: #HEX
    const cssBackgroundPattern = new RegExp(`background:\\s*${escapedHex}`, 'gi');
    if (content.match(cssBackgroundPattern)) {
      content = content.replace(cssBackgroundPattern, `background: ${mapping.cssVar}`);
      changes.push(`background: ${hex} → background: ${mapping.cssVar}`);
      modified = true;
    }
    
    // Replace in CSS/style tags: color: #HEX
    const cssColorPattern = new RegExp(`color:\\s*${escapedHex}`, 'gi');
    if (content.match(cssColorPattern)) {
      content = content.replace(cssColorPattern, `color: ${mapping.cssVar}`);
      changes.push(`color: ${hex} → color: ${mapping.cssVar}`);
      modified = true;
    }
    
    // Replace in CSS/style tags: border: 1px solid #HEX
    const cssBorderPattern = new RegExp(`border(-[a-z]+)?:\\s*([^;]*?)${escapedHex}`, 'gi');
    if (content.match(cssBorderPattern)) {
      content = content.replace(cssBorderPattern, (match, prop, prefix) => {
        return match.replace(hex, mapping.cssVar);
      });
      changes.push(`border: ... ${hex} → border: ... ${mapping.cssVar}`);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`\n✅ Updated: ${filePath}`);
    changes.forEach(change => console.log(`   - ${change}`));
    return true;
  }
  
  return false;
}

function main() {
  console.log('🎨 Starting hex color replacement...\n');
  
  // Find all TSX files
  const files = glob.sync('app/**/*.tsx', { cwd: __dirname });
  const componentFiles = glob.sync('components/**/*.tsx', { cwd: __dirname });
  const allFiles = [...files, ...componentFiles];
  
  let updatedCount = 0;
  
  allFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (replaceInFile(filePath)) {
      updatedCount++;
    }
  });
  
  console.log(`\n✨ Complete! Updated ${updatedCount} file(s).`);
  console.log('\n📝 Next steps:');
  console.log('   1. Review the changes');
  console.log('   2. Test your application');
  console.log('   3. Commit the changes\n');
}

main();
