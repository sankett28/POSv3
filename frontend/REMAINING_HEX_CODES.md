# Remaining Hex Codes Found

## List of Hex Codes to Add

### New Colors Found:
1. **#DC586D** - Pink/Rose color (used in marketing, customers pages)
2. **#A33757** - Darker pink (hover state)
3. **#1F1F1F** - Very dark gray/black (text)
4. **#C89B63** - Gold/Bronze color (gradients)
5. **#F4A261** - Orange/Peach color (gradients)
6. **#3E2C24** - Dark brown (gradients)
7. **#f1ece6** - Very light cream (borders)

### Already Defined (can be reused):
- **#B45A69** - brand-dusty-rose ✓
- **#FFF0F3** - warm-cream ✓

## Usage Patterns

### #DC586D (Pink/Rose)
- Marketing page icons and buttons
- Customer page icons and buttons
- Should be named: `accent-pink` or `marketing-pink`

### #A33757 (Dark Pink)
- Hover state for #DC586D buttons
- Should be named: `accent-pink-dark` or `marketing-pink-dark`

### #1F1F1F (Very Dark Gray)
- Product names and important text
- Should be named: `text-dark` or `text-black`

### #C89B63 (Gold/Bronze)
- Gradient backgrounds
- Icon backgrounds
- Should be named: `accent-gold` or `bronze`

### #F4A261 (Orange/Peach)
- Gradient backgrounds
- Icon backgrounds
- Should be named: `accent-orange` or `peach`

### #3E2C24 (Dark Brown)
- Gradient backgrounds
- Should be named: `dark-brown` or `chocolate`

### #f1ece6 (Very Light Cream)
- Subtle borders in modals
- Should be named: `border-light` or `cream-border`

## Recommended Color Names

```css
:root {
  /* Existing colors... */
  
  /* New Accent Colors */
  --accent-pink: #DC586D;
  --accent-pink-dark: #A33757;
  --accent-gold: #C89B63;
  --accent-orange: #F4A261;
  --dark-brown: #3E2C24;
  
  /* Additional Text */
  --text-dark: #1F1F1F;
  
  /* Additional Borders */
  --border-light: #f1ece6;
}
```
