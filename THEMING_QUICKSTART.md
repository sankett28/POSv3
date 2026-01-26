# Theming System - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Run the Migration

```bash
# Connect to your Supabase database
psql -h <your-supabase-host> -U postgres -d postgres \
  -f POSv3/backend/supabase/migrations/010_add_business_theme_system.sql
```

**What this does:**
- Creates `businesses`, `business_themes`, `theme_audit_log` tables
- Sets up Row-Level Security (RLS)
- Seeds default business with your existing brand colors

### Step 2: Start the Backend

```bash
cd POSv3/backend
uvicorn app.main:app --reload
```

Backend will be available at: `http://localhost:8000`

### Step 3: Start the Frontend

```bash
cd POSv3/frontend
npm run dev
```

Frontend will be available at: `http://localhost:3000`

### Step 4: Access Theme Editor

Open your browser and navigate to:
```
http://localhost:3000/settings/theme
```

### Step 5: Customize Your Theme

1. **Pick colors** using the color pickers
2. **See live preview** as you change colors
3. **Click "Validate"** to check contrast ratios
4. **Click "Save Theme"** to persist changes
5. **Done!** Theme applies across entire app

---

## 🎨 Quick Example

### Change Primary Color

1. Go to `/settings/theme`
2. Click the "Primary" color picker
3. Select a new color (e.g., `#FF5733`)
4. See buttons and CTAs update in real-time
5. Click "Validate" to ensure accessibility
6. Click "Save Theme"

### Use Theme in Components

```tsx
// Your components automatically use the theme
<button className="bg-primary text-white hover:bg-accent">
  Click me
</button>

<div className="bg-background text-foreground">
  Content with proper contrast
</div>
```

---

## 🔍 Verify It's Working

### Check API

```bash
# Get current theme
curl http://localhost:8000/api/v1/themes
```

**Expected response:**
```json
{
  "primary": "#912b48",
  "secondary": "#ffffff",
  "background": "#fff0f3",
  "foreground": "#610027",
  "accent": "#b45a69",
  "danger": "#ef4444",
  "success": "#22c55e",
  "warning": "#f59e0b"
}
```

### Check Database

```sql
-- View current theme
SELECT * FROM business_themes;

-- View audit logs
SELECT * FROM theme_audit_log ORDER BY created_at DESC LIMIT 5;
```

### Check Browser

1. Open DevTools (F12)
2. Go to Elements tab
3. Inspect `<html>` element
4. Look for CSS variables in `style` attribute:
   ```
   --theme-primary: #912b48;
   --theme-background: #fff0f3;
   ...
   ```

---

## 🎯 Common Tasks

### Reset to Defaults

In Theme Editor:
1. Click "Reset to Defaults"
2. Click "Save Theme"

### Test Validation

Try setting invalid colors:
- Foreground = `#FFFFFF`, Background = `#FFFFFF` (no contrast)
- Invalid hex: `#FFF` or `invalid`

You'll see validation errors explaining the issue.

### View Change History

```bash
curl http://localhost:8000/api/v1/themes/audit
```

Shows all theme changes with timestamps, user, and old/new values.

---

## 🐛 Troubleshooting

### Theme not applying?

1. Check browser console for errors
2. Verify API is running: `curl http://localhost:8000/health`
3. Check theme exists: `curl http://localhost:8000/api/v1/themes`
4. Hard refresh browser (Ctrl+Shift+R)

### Validation errors?

- Ensure foreground/background have ≥4.5:1 contrast
- Use 6-digit hex codes (e.g., `#FF5733`)
- Check error messages in Theme Editor

### Migration failed?

- Verify Supabase connection
- Check if tables already exist: `\dt` in psql
- Review migration file for syntax errors

---

## 📚 Next Steps

- **Read full docs:** `POSv3/THEMING_SYSTEM.md`
- **Explore API:** `http://localhost:8000/docs` (FastAPI auto-docs)
- **Customize components:** Use semantic utilities (`bg-primary`, etc.)
- **Plan Phase 3:** LLM-assisted theme generation

---

## 💡 Pro Tips

1. **Always validate** before saving (checks accessibility)
2. **Use semantic names** in components (not hardcoded colors)
3. **Check audit logs** to track changes
4. **Test on real devices** to verify contrast
5. **Document color purpose** for your team

---

## ✅ Success Checklist

- [ ] Migration ran successfully
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access `/settings/theme`
- [ ] Can change colors and see live preview
- [ ] Can save theme successfully
- [ ] Theme persists after page refresh
- [ ] Validation works (try invalid colors)
- [ ] Audit logs show changes

---

**You're all set! 🎉**

Your multi-tenant theming system is now live and ready for production use.

For detailed documentation, see: `POSv3/THEMING_SYSTEM.md`
