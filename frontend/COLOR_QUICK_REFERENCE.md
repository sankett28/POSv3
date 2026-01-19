# Color Quick Reference Card

## 🎨 Most Used Colors

### Backgrounds
```tsx
bg-coffee-brown       // Primary brand (#912B48)
bg-warm-cream         // Light background (#FFF0F3)
bg-card-background    // White cards (#FFFFFF)
bg-accent-pink        // Marketing features (#DC586D)
```

### Text
```tsx
text-primary-text     // Main text (#610027)
text-secondary-text   // Secondary text (#6B6B6B)
text-muted-text       // Muted text (#9CA3AF)
text-text-dark        // Very dark text (#1F1F1F)
```

### Borders
```tsx
border-border         // Default border (#E5E7EB)
border-border-light   // Light border (#f1ece6)
```

### Accent Colors
```tsx
bg-accent-pink        // Marketing pink (#DC586D)
bg-accent-gold        // Gold/Bronze (#C89B63)
bg-accent-orange      // Orange/Peach (#F4A261)
bg-dark-brown         // Dark brown (#3E2C24)
```

### Hover States
```tsx
hover:bg-brand-dusty-rose      // Hover background (#B45A69)
hover:bg-accent-pink-dark      // Dark pink hover (#A33757)
hover:bg-brand-dusty-rose/10   // Light hover (10% opacity)
```

### Status
```tsx
bg-success / text-success    // Green (#22C55E)
bg-warning / text-warning    // Orange (#F59E0B)
bg-error / text-error        // Red (#EF4444)
```

## 📝 Common Patterns

### Button (Primary)
```tsx
className="bg-coffee-brown text-white hover:bg-brand-dusty-rose"
```

### Button (Marketing/Accent)
```tsx
className="bg-accent-pink text-white hover:bg-accent-pink-dark"
```

### Button (Secondary)
```tsx
className="bg-warm-cream text-primary-text border border-border hover:bg-brand-dusty-rose/10"
```

### Card
```tsx
className="bg-card-background border border-border rounded-lg p-4"
```

### Gradient Backgrounds
```tsx
// Gold to Orange
className="bg-linear-to-br from-accent-gold to-accent-orange"

// Dark to Gold
className="bg-linear-to-r from-dark-brown to-accent-gold"

// Dusty Rose gradient
className="bg-linear-to-r from-brand-dusty-rose/25 to-brand-dusty-rose/15"
```

### Table Headers
```tsx
className="bg-linear-to-r from-brand-dusty-rose/25 to-brand-dusty-rose/15 border-b-2 border-brand-dusty-rose/30"
```

### Table Rows (Hover)
```tsx
className="hover:bg-linear-to-r hover:from-warm-cream/30 hover:to-warm-cream/10"
```

### Input
```tsx
className="border border-border focus:ring-coffee-brown focus:border-coffee-brown"
```

### Heading
```tsx
className="text-primary-text font-bold"
// or for very dark text
className="text-text-dark font-bold"
```

### Paragraph
```tsx
className="text-secondary-text"
```

### Muted Text
```tsx
className="text-muted-text text-sm"
```

## 🔧 CSS Variables (for style prop)

```tsx
style={{
  background: 'var(--warm-cream)',
  color: 'var(--primary-text)',
  border: '1px solid var(--border)'
}}

// Gradients
style={{
  background: 'linear-gradient(to right, var(--accent-gold), var(--accent-orange))'
}}
```

## 💡 Tips

1. **Always use color classes** instead of hex codes
2. **Use opacity modifiers** for lighter shades: `bg-coffee-brown/50`
3. **Semantic names** make code more readable
4. **IntelliSense** will show available colors as you type
5. **Gradients** use `from-` and `to-` prefixes with color names

## 🚀 Quick Copy-Paste

```tsx
// Primary Button
<button className="bg-coffee-brown text-white px-4 py-2 rounded-lg hover:bg-brand-dusty-rose">

// Marketing Button
<button className="bg-accent-pink text-white px-4 py-2 rounded-lg hover:bg-accent-pink-dark">

// Card
<div className="bg-card-background border border-border rounded-lg p-6">

// Gradient Card
<div className="bg-linear-to-br from-accent-gold to-accent-orange rounded-lg p-6">

// Input
<input className="border border-border rounded-lg px-4 py-2 focus:ring-coffee-brown" />

// Heading
<h1 className="text-primary-text font-bold text-2xl">

// Dark Heading
<h1 className="text-text-dark font-bold text-2xl">

// Text
<p className="text-secondary-text">

// Muted
<span className="text-muted-text text-sm">

// Table Header
<thead className="bg-linear-to-r from-brand-dusty-rose/25 to-brand-dusty-rose/15">

// Icon Background
<div className="w-12 h-12 bg-accent-pink rounded-xl flex items-center justify-center">
  <Icon className="w-6 h-6 text-white" />
</div>
```

## 🎨 Color Combinations

### Marketing/Customer Pages
```tsx
// Icon + Button combo
<div className="w-14 h-14 bg-accent-pink rounded-xl">
  <Icon className="text-white" />
</div>
<button className="bg-accent-pink hover:bg-accent-pink-dark">
```

### Product Cards
```tsx
// Gradient placeholder
<div className="bg-linear-to-br from-accent-gold/30 to-accent-orange/30">
```

### Coming Soon Features
```tsx
// Gold icon background
<div className="w-10 h-10 bg-accent-gold/20 rounded-lg">
  <Icon className="text-accent-gold" />
</div>
```

### Premium Features
```tsx
// Dark to gold gradient
<div className="bg-linear-to-r from-dark-brown to-accent-gold">
```
