# Production Deployment Checklist

Use this checklist every time you deploy to production to ensure no localhost bugs.

## Pre-Deployment

- [ ] All code changes committed to git
- [ ] Run `.\check-localhost-leaks.ps1` - confirms no dangerous fallbacks in code
- [ ] Backend is deployed and accessible at: `https://posv3-614312738437.asia-southeast1.run.app/health`
- [ ] Backend CORS includes frontend URL

## Build Phase

- [ ] Run `.\docker-build-production.ps1` (or manual build with --build-arg)
- [ ] Build completes successfully (no errors)
- [ ] Build logs show correct env vars:
  - `NEXT_PUBLIC_API_BASE_URL: https://posv3-614312738437.asia-southeast1.run.app`
  - `NEXT_PUBLIC_SUPABASE_URL: https://jegyibzpezsielknpejv.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY: eyJ...` (first 20 chars)
- [ ] Build logs show: "✅ No localhost leaks detected in build output"

## Verification Phase

- [ ] Run `.\verify-build.ps1`
- [ ] Verification passes with: "✅ Verification PASSED"
- [ ] No localhost references found in build output
- [ ] Production backend URL found in build

## Push Phase

- [ ] Run `docker push sankett2811/posv3-frontend:v3`
- [ ] Push completes successfully
- [ ] Image visible in Docker Hub

## Deployment Phase

- [ ] Go to GCP Cloud Run Console
- [ ] Select frontend service
- [ ] Click "EDIT & DEPLOY NEW REVISION"
- [ ] Update container image to: `sankett2811/posv3-frontend:v3`
- [ ] Click "DEPLOY"
- [ ] Wait for deployment to complete (green checkmark)
- [ ] Note the new revision URL

## Post-Deployment Testing

### Basic Functionality
- [ ] Open frontend URL in browser
- [ ] Page loads without errors
- [ ] No console errors in browser DevTools
- [ ] No "local network" permission popup

### Network Validation
- [ ] Open browser DevTools > Network tab
- [ ] Clear network log
- [ ] Refresh page or trigger API call
- [ ] Verify ALL requests go to: `posv3-614312738437.asia-southeast1.run.app`
- [ ] Verify NO requests to `localhost:8000`
- [ ] Verify NO requests to `127.0.0.1:8000`

### Authentication Flow
- [ ] Login page loads
- [ ] Can submit login form
- [ ] Login request goes to correct backend
- [ ] Successful login redirects correctly
- [ ] Token stored in localStorage
- [ ] Authenticated requests include Bearer token

### Full User Flow
- [ ] Signup works
- [ ] Onboarding flow works
- [ ] Dashboard loads
- [ ] Theme customization works
- [ ] Product management works
- [ ] Billing works

### Error Scenarios
- [ ] Invalid login shows error message
- [ ] Network errors handled gracefully
- [ ] Token expiry triggers refresh
- [ ] Logout works correctly

## Rollback Plan (If Issues Found)

1. [ ] Identify the issue (check logs, network tab, console)
2. [ ] Revert to previous working revision in Cloud Run
3. [ ] Verify rollback successful
4. [ ] Fix the issue locally
5. [ ] Rebuild and redeploy following this checklist

## Common Issues & Solutions

### Issue: Requests still going to localhost
**Solution**: Image was built without --build-arg. Rebuild using `docker-build-production.ps1`

### Issue: CORS errors
**Solution**: Add frontend URL to backend CORS_ORIGINS env var

### Issue: 401 Unauthorized
**Solution**: Check Supabase credentials are correct in build args

### Issue: 404 on API calls
**Solution**: Verify backend URL is correct and backend is deployed

### Issue: "local network" permission popup
**Solution**: Localhost is leaking. Run `verify-build.ps1` to confirm, then rebuild

## Success Criteria

✅ All checklist items completed
✅ No localhost references in network tab
✅ No browser permission popups
✅ Login works end-to-end
✅ All API calls reach backend
✅ No console errors
✅ Theme loads correctly
✅ Full user flow functional

## Notes

- Cloud Run env vars are NOT used for `NEXT_PUBLIC_*` variables
- Env vars are baked into the image at build time
- To change backend URL, rebuild image with new --build-arg
- Always use `docker-build-production.ps1` for production builds
- Run `check-localhost-leaks.ps1` before committing code changes

## Emergency Contacts

- Backend URL: https://posv3-614312738437.asia-southeast1.run.app
- Backend Health: https://posv3-614312738437.asia-southeast1.run.app/health
- Supabase Dashboard: https://supabase.com/dashboard/project/jegyibzpezsielknpejv
- Docker Hub: https://hub.docker.com/r/sankett2811/posv3-frontend
- GCP Console: https://console.cloud.google.com/run

---

**Last Updated**: After localhost bug fix
**Next Review**: Before next production deployment
