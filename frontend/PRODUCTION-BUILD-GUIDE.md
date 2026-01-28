# Production Build Guide - Frontend

## Critical Information

**IMPORTANT**: Next.js bakes environment variables into the JavaScript bundle at **BUILD TIME**, not runtime. This means:

- Environment variables set in Cloud Run console are **IGNORED** for `NEXT_PUBLIC_*` variables
- You **MUST** pass env vars during `docker build` using `--build-arg`
- If you don't, the app will fail or fall back to localhost (which is now blocked)

## Quick Start - Build & Deploy

### 1. Build Production Image

Use the provided script (recommended):

```powershell
cd POSv3/frontend
.\docker-build-production.ps1
```

Or manually:

```powershell
docker build --no-cache `
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://posv3-614312738437.asia-southeast1.run.app `
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://jegyibzpezsielknpejv.supabase.co `
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key `
  -t sankett2811/posv3-frontend:v3 `
  .
```

### 2. Verify Build (Optional but Recommended)

```powershell
.\verify-build.ps1
```

This will scan the build output for localhost references and confirm the production URL is baked in.

### 3. Push to Docker Hub

```powershell
docker push sankett2811/posv3-frontend:v3
```

### 4. Deploy to Cloud Run

Update your Cloud Run service to use the new image: `sankett2811/posv3-frontend:v3`

## What Changed

### Before (Broken)
- Fallback to `localhost:8000` if env var missing
- Silent failures in production
- Browser asking for local network permissions

### After (Fixed)
- **No fallback** - build fails if env vars missing
- **Strict validation** at build time and runtime
- **Localhost scanning** in Dockerfile to catch leaks
- **Explicit errors** instead of silent failures

## Build Validation

The Dockerfile now includes:

1. **Pre-build validation**: Checks all env vars are set
2. **Build-time logging**: Prints env vars for visibility
3. **Post-build scanning**: Scans `.next/static` for localhost references
4. **Fail-fast**: Build fails immediately if anything is wrong

## Troubleshooting

### Build fails with "NEXT_PUBLIC_API_BASE_URL is not set"

**Cause**: You didn't pass `--build-arg` during docker build.

**Fix**: Use the `docker-build-production.ps1` script or add `--build-arg` flags manually.

### Build fails with "Found localhost:8000 in build output"

**Cause**: Env vars were not properly injected, so code fell back to localhost.

**Fix**: Ensure you're passing `--build-arg` correctly. Check for typos in variable names.

### App works locally but not in production

**Cause**: Local dev uses `.env.local` which has localhost. Production needs build-time args.

**Fix**: Always build production images with `--build-arg` flags.

### Browser asks for "local network" permission

**Cause**: App is trying to connect to localhost:8000.

**Fix**: Rebuild image with correct `--build-arg` values. The new code blocks this.

## Environment Variables Reference

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | ✅ Yes | Backend API URL (Cloud Run) |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anonymous key |

## Development vs Production

### Development (localhost)
- Uses `.env.local` file
- Allows localhost fallback
- No strict validation

### Production (Cloud Run)
- Uses `--build-arg` during docker build
- **No fallback** - fails if missing
- Strict validation at build and runtime

## Safety Features

1. **Build-time validation**: Won't build without env vars
2. **Runtime validation**: Won't start if env vars missing (production only)
3. **Localhost scanning**: Detects leaks in build output
4. **Explicit errors**: Clear error messages instead of silent failures
5. **Verification script**: Post-build validation tool

## Files Modified

- `lib/api.ts` - Removed localhost fallback, added strict validation
- `lib/theme.ts` - Removed localhost fallback
- `lib/supabase.ts` - Added production validation
- `next.config.js` - Added webpack validation hook
- `Dockerfile` - Added validation and scanning steps
- `docker-build-production.ps1` - Safe build script
- `verify-build.ps1` - Post-build verification

## Next Steps After Deployment

1. Test login on production URL
2. Verify network requests go to Cloud Run backend (check browser DevTools)
3. Confirm no CORS errors
4. Confirm no "local network" permission popup
5. Test full user flow (signup, onboarding, theme, etc.)

## Emergency Rollback

If something goes wrong:

1. Revert to previous working image in Cloud Run
2. Check Cloud Run logs for errors
3. Verify backend is accessible: `https://posv3-614312738437.asia-southeast1.run.app/health`
4. Rebuild frontend with correct env vars

## Support

If you encounter issues:

1. Check build logs for validation errors
2. Run `verify-build.ps1` to scan for localhost leaks
3. Verify backend URL is correct and accessible
4. Check browser console for error messages
