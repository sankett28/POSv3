# Theming System - Deployment Checklist

## Pre-Deployment Checklist

### ✅ Database Setup

- [ ] Supabase connection configured in `.env`
- [ ] Migration file reviewed: `010_add_business_theme_system.sql`
- [ ] Migration executed successfully
- [ ] Tables created: `businesses`, `business_themes`, `theme_audit_log`
- [ ] RLS policies enabled and verified
- [ ] Default business seeded with ID: `00000000-0000-0000-0000-000000000001`
- [ ] Default theme created with existing brand colors

**Verification:**
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('businesses', 'business_themes', 'theme_audit_log');

-- Check default business
SELECT * FROM businesses WHERE id = '00000000-0000-0000-0000-000000000001';

-- Check default theme
SELECT * FROM business_themes WHERE business_id = '00000000-0000-0000-0000-000000000001';

-- Check RLS enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('businesses', 'business_themes', 'theme_audit_log');
```

### ✅ Backend Setup

- [ ] Python dependencies installed: `pip install -r requirements.txt`
- [ ] Environment variables configured:
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `CORS_ORIGINS` (includes frontend URL)
- [ ] Backend starts without errors: `uvicorn app.main:app --reload`
- [ ] Health check passes: `curl http://localhost:8000/health`
- [ ] API docs accessible: `http://localhost:8000/docs`
- [ ] Theme endpoints registered in router

**Verification:**
```bash
# Health check
curl http://localhost:8000/health

# Get theme endpoint
curl http://localhost:8000/api/v1/themes

# Check API docs
open http://localhost:8000/docs
```

### ✅ Frontend Setup

- [ ] Node dependencies installed: `npm install`
- [ ] Environment variables configured:
  - [ ] `NEXT_PUBLIC_API_URL` (backend URL)
- [ ] Frontend builds without errors: `npm run build`
- [ ] Frontend starts without errors: `npm run dev`
- [ ] Theme utilities imported correctly
- [ ] Theme initialization in root layout
- [ ] Theme editor component created
- [ ] Settings page accessible: `/settings/theme`

**Verification:**
```bash
# Build check
npm run build

# Start dev server
npm run dev

# Access theme editor
open http://localhost:3000/settings/theme
```

### ✅ Integration Testing

- [ ] Theme API returns default theme
- [ ] Theme editor loads without errors
- [ ] Color pickers work
- [ ] Live preview updates in real-time
- [ ] Validation endpoint works
- [ ] Save theme succeeds
- [ ] Theme persists after page refresh
- [ ] Theme applies across all pages
- [ ] Audit logs record changes
- [ ] Invalid colors show validation errors
- [ ] Reset to defaults works

**Test Script:**
```bash
# 1. Get current theme
curl http://localhost:8000/api/v1/themes

# 2. Validate a theme
curl -X POST http://localhost:8000/api/v1/themes/validate \
  -H "Content-Type: application/json" \
  -d '{
    "primary_color": "#912b48",
    "secondary_color": "#ffffff",
    "background_color": "#fff0f3",
    "foreground_color": "#610027",
    "source": "manual"
  }'

# 3. Save a theme
curl -X PUT http://localhost:8000/api/v1/themes \
  -H "Content-Type: application/json" \
  -d '{
    "primary_color": "#FF5733",
    "secondary_color": "#ffffff",
    "background_color": "#fff0f3",
    "foreground_color": "#000000",
    "accent_color": "#b45a69",
    "danger_color": "#ef4444",
    "success_color": "#22c55e",
    "warning_color": "#f59e0b",
    "source": "manual"
  }'

# 4. Get audit logs
curl http://localhost:8000/api/v1/themes/audit

# 5. Test invalid theme (should fail)
curl -X POST http://localhost:8000/api/v1/themes/validate \
  -H "Content-Type: application/json" \
  -d '{
    "primary_color": "invalid",
    "secondary_color": "#ffffff",
    "background_color": "#fff0f3",
    "foreground_color": "#610027",
    "source": "manual"
  }'
```

### ✅ Security Verification

- [ ] RLS policies prevent direct database writes
- [ ] Only service role can modify themes
- [ ] Audit logs capture all changes
- [ ] IP addresses logged
- [ ] User emails captured
- [ ] CORS configured correctly
- [ ] No sensitive data in frontend code
- [ ] Environment variables not committed

**Security Test:**
```sql
-- Try to write directly (should fail for non-service-role)
-- This should be blocked by RLS
INSERT INTO business_themes (business_id, primary_color, secondary_color, background_color, foreground_color)
VALUES ('00000000-0000-0000-0000-000000000001', '#000000', '#ffffff', '#ffffff', '#000000');
```

### ✅ Accessibility Verification

- [ ] Foreground/background contrast ≥ 4.5:1
- [ ] Primary/background contrast ≥ 3.0:1
- [ ] Validation enforces WCAG 2.0 AA
- [ ] Error messages are clear
- [ ] Theme editor is keyboard accessible
- [ ] Color pickers have labels
- [ ] Contrast ratios displayed to user

**Accessibility Test:**
```bash
# Test with low contrast (should fail)
curl -X POST http://localhost:8000/api/v1/themes/validate \
  -H "Content-Type: application/json" \
  -d '{
    "primary_color": "#ffffff",
    "secondary_color": "#ffffff",
    "background_color": "#ffffff",
    "foreground_color": "#eeeeee",
    "source": "manual"
  }'
```

### ✅ Performance Verification

- [ ] Theme loads on app bootstrap
- [ ] No FOUC (Flash of Unstyled Content)
- [ ] CSS variables apply instantly
- [ ] No Tailwind rebuilds required
- [ ] API response time < 200ms
- [ ] Frontend bundle size acceptable
- [ ] No memory leaks in theme application

**Performance Test:**
```bash
# Measure API response time
time curl http://localhost:8000/api/v1/themes

# Check bundle size
npm run build
# Review .next/static output
```

### ✅ Documentation

- [ ] `THEMING_SYSTEM.md` - Complete documentation
- [ ] `THEMING_QUICKSTART.md` - Quick start guide
- [ ] `THEMING_IMPLEMENTATION_SUMMARY.md` - Implementation details
- [ ] `THEMING_README.md` - Overview
- [ ] `THEMING_DEPLOYMENT_CHECKLIST.md` - This file
- [ ] Code comments in all files
- [ ] API endpoints documented
- [ ] Database schema documented

---

## Deployment Steps

### 1. Production Database

```bash
# Connect to production Supabase
psql -h <production-supabase-host> -U postgres -d postgres

# Run migration
\i POSv3/backend/supabase/migrations/010_add_business_theme_system.sql

# Verify
SELECT * FROM businesses;
SELECT * FROM business_themes;
```

### 2. Production Backend

```bash
# Set environment variables
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
export CORS_ORIGINS="https://your-frontend.com"

# Deploy backend (example with Docker)
docker build -t pos-backend .
docker run -p 8000:8000 pos-backend
```

### 3. Production Frontend

```bash
# Set environment variables
export NEXT_PUBLIC_API_URL="https://your-backend.com"

# Build and deploy
npm run build
npm start
# Or deploy to Vercel/Netlify
```

### 4. Post-Deployment Verification

```bash
# Test production API
curl https://your-backend.com/api/v1/themes

# Test production frontend
open https://your-frontend.com/settings/theme

# Check logs
# - Backend logs for errors
# - Frontend console for errors
# - Database audit logs for changes
```

---

## Rollback Plan

### If Issues Occur

1. **Database Rollback:**
   ```sql
   -- Drop tables (WARNING: Destructive)
   DROP TABLE IF EXISTS theme_audit_log CASCADE;
   DROP TABLE IF EXISTS business_themes CASCADE;
   DROP TABLE IF EXISTS businesses CASCADE;
   ```

2. **Backend Rollback:**
   - Remove theme router from `app/api/v1/router.py`
   - Restart backend

3. **Frontend Rollback:**
   - Remove theme initialization from `app/layout.tsx`
   - Remove theme editor page
   - Rebuild and redeploy

---

## Post-Deployment Monitoring

### Metrics to Monitor

- [ ] API response times for theme endpoints
- [ ] Database query performance
- [ ] Frontend bundle size
- [ ] Error rates in logs
- [ ] Theme change frequency (audit logs)
- [ ] User adoption of theme customization

### Logs to Review

- [ ] Backend application logs
- [ ] Database query logs
- [ ] Frontend console errors
- [ ] Audit log entries
- [ ] RLS policy violations

---

## Success Criteria

### System is Ready When:

- ✅ All checklist items completed
- ✅ All tests passing
- ✅ No errors in logs
- ✅ Theme applies correctly
- ✅ Validation works
- ✅ Audit trail captures changes
- ✅ Documentation complete
- ✅ Team trained on usage

---

## Support Contacts

- **Database Issues**: Check Supabase dashboard and logs
- **Backend Issues**: Review FastAPI logs and `/docs` endpoint
- **Frontend Issues**: Check browser console and network tab
- **Documentation**: See `THEMING_SYSTEM.md`

---

## Final Sign-Off

- [ ] Database migration verified by: _________________ Date: _______
- [ ] Backend deployment verified by: _________________ Date: _______
- [ ] Frontend deployment verified by: _________________ Date: _______
- [ ] Integration testing completed by: _________________ Date: _______
- [ ] Security review completed by: _________________ Date: _______
- [ ] Documentation reviewed by: _________________ Date: _______
- [ ] Production deployment approved by: _________________ Date: _______

---

**Deployment Status:** ⬜ Not Started | ⬜ In Progress | ⬜ Complete

**Version:** 1.0.0  
**Last Updated:** 2026-01-19
