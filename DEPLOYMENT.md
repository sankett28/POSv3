# GCP Cloud Run Deployment Guide

This guide covers deploying both the backend and frontend of the Retail Boss POS system to Google Cloud Platform using Cloud Run.

## Prerequisites

1. **Google Cloud Account**: Sign up at [cloud.google.com](https://cloud.google.com)
2. **Google Cloud SDK**: Install from [cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install)
3. **Docker**: Install from [docker.com](https://www.docker.com) (for local testing and manual builds)
4. **Docker Hub Account** (optional, for manual Docker builds): Sign up at [hub.docker.com](https://hub.docker.com)

## Initial Setup

### 1. Install and Configure Google Cloud SDK

```bash
# Install gcloud CLI (if not already installed)
# Windows: Download installer from Google Cloud website
# Mac: brew install google-cloud-sdk
# Linux: Follow instructions on Google Cloud website

# Authenticate
gcloud auth login

# Set your project (replace YOUR_PROJECT_ID with your actual project ID)
gcloud config set project YOUR_PROJECT_ID

# Verify configuration
gcloud config list
```

### 2. Enable Required APIs

```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com  # For secrets management
gcloud services enable artifactregistry.googleapis.com  # For container registry
```

### 3. Docker Login (for manual builds)

```bash
# Login to Docker Hub (if using manual Docker builds)
docker login

# Or login to GCP Container Registry
gcloud auth configure-docker
```

---

## Backend Deployment

### Method 1: Manual Docker Build & Push (What You Did)

#### Step 1: Build Docker Image

```powershell
# Navigate to backend directory
cd backend

# Build for linux/amd64 platform (required for Cloud Run)
docker build --platform linux/amd64 -t sankett2811/posv3:v1 .

# Or build with a specific tag
docker build --platform linux/amd64 -t sankett2811/posv3:latest .
```

#### Step 2: Push to Docker Hub

```powershell
# Push to Docker Hub
docker push sankett2811/posv3:v1

# Or push latest tag
docker push sankett2811/posv3:latest
```

#### Step 3: Deploy to Cloud Run

```bash
# Deploy from Docker Hub
gcloud run deploy pos-backend \
  --image docker.io/sankett2811/posv3:v1 \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8000 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars "SUPABASE_URL=your-supabase-url,SUPABASE_SERVICE_ROLE_KEY=your-key,CORS_ORIGINS=https://your-frontend-domain.com"
```

**Important**: Replace:
- `your-supabase-url` with your Supabase project URL
- `your-key` with your Supabase service role key
- `https://your-frontend-domain.com` with your frontend URL(s), comma-separated

### Method 2: Build and Push to GCP Container Registry

```bash
cd backend

# Build and push to GCP Container Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/pos-backend

# Deploy to Cloud Run
gcloud run deploy pos-backend \
  --image gcr.io/YOUR_PROJECT_ID/pos-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8000 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars "SUPABASE_URL=your-supabase-url,SUPABASE_SERVICE_ROLE_KEY=your-key,CORS_ORIGINS=https://your-frontend-domain.com"
```

### Method 3: Using Secrets (Recommended for Production)

#### Step 1: Create Secrets

```bash
# Create Supabase URL secret
echo -n "https://your-project.supabase.co" | gcloud secrets create supabase-url --data-file=-

# Create Supabase service role key secret
echo -n "your-service-role-key-here" | gcloud secrets create supabase-key --data-file=-

# Get your project number
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)")

# Grant Cloud Run access to secrets
gcloud secrets add-iam-policy-binding supabase-url \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding supabase-key \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

#### Step 2: Deploy with Secrets

```bash
gcloud run deploy pos-backend \
  --image gcr.io/YOUR_PROJECT_ID/pos-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8000 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --update-secrets SUPABASE_URL=supabase-url:latest,SUPABASE_SERVICE_ROLE_KEY=supabase-key:latest \
  --set-env-vars "CORS_ORIGINS=https://your-frontend-domain.com"
```

### Method 4: CI/CD with Cloud Build

#### Step 1: Update cloudbuild.yaml

The `backend/cloudbuild.yaml` file is already configured. Just ensure it has the correct project ID.

#### Step 2: Trigger Build

```bash
cd backend
gcloud builds submit --config cloudbuild.yaml
```

This will automatically:
1. Build the Docker image
2. Push to Container Registry
3. Deploy to Cloud Run

---

## Frontend Deployment

### Method 1: Manual Docker Build & Push

#### Step 1: Build Docker Image

```powershell
# Navigate to frontend directory
cd frontend

# Build for linux/amd64 platform (required for Cloud Run)
# Replace the environment variable values with your actual values
docker build --platform linux/amd64 `
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://your-backend-url `
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co `
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key `
  -t sankett2811/posv3-frontend:v1 .

# Or build with latest tag
docker build --platform linux/amd64 `
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://your-backend-url `
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co `
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key `
  -t sankett2811/posv3-frontend:latest .
```

**Important**: Replace:
- `https://your-backend-url` with your deployed backend Cloud Run URL
- `https://your-project.supabase.co` with your Supabase project URL
- `your-anon-key` with your Supabase anonymous key

#### Step 2: Push to Docker Hub

```powershell
# Push to Docker Hub
docker push sankett2811/posv3-frontend:v1

# Or push latest tag
docker push sankett2811/posv3-frontend:latest
```

#### Step 3: Deploy to Cloud Run

```bash
# Deploy from Docker Hub
gcloud run deploy pos-frontend \
  --image docker.io/sankett2811/posv3-frontend:v1 \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10
```

### Method 2: Build and Push to GCP Container Registry

```bash
cd frontend

# Build and push to GCP Container Registry (with build args)
gcloud builds submit \
  --tag gcr.io/YOUR_PROJECT_ID/pos-frontend \
  --substitutions _NEXT_PUBLIC_API_BASE_URL=https://your-backend-url,_NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co,_NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Deploy to Cloud Run
gcloud run deploy pos-frontend \
  --image gcr.io/YOUR_PROJECT_ID/pos-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10
```

**Note**: Next.js environment variables prefixed with `NEXT_PUBLIC_` need to be available at build time. Use `--build-arg` when building the Docker image, or rebuild the image when environment variables change.

---

## Complete Deployment Workflow

### Quick Deploy Script (PowerShell)

Create a `deploy.ps1` file in the root directory:

```powershell
# deploy.ps1
param(
    [string]$BackendVersion = "v1",
    [string]$FrontendVersion = "v1",
    [string]$BackendImage = "sankett2811/posv3",
    [string]$FrontendImage = "sankett2811/posv3-frontend",
    [string]$BackendUrl = "",
    [string]$SupabaseUrl = "",
    [string]$SupabaseAnonKey = ""
)

if ([string]::IsNullOrEmpty($BackendUrl) -or [string]::IsNullOrEmpty($SupabaseUrl) -or [string]::IsNullOrEmpty($SupabaseAnonKey)) {
    Write-Host "Error: BackendUrl, SupabaseUrl, and SupabaseAnonKey are required" -ForegroundColor Red
    Write-Host "Usage: .\deploy.ps1 -BackendUrl 'https://...' -SupabaseUrl 'https://...' -SupabaseAnonKey '...'" -ForegroundColor Yellow
    exit 1
}

Write-Host "Deploying Backend..." -ForegroundColor Green
cd backend
docker build --platform linux/amd64 -t "${BackendImage}:${BackendVersion}" .
docker push "${BackendImage}:${BackendVersion}"

Write-Host "Deploying Frontend..." -ForegroundColor Green
cd ../frontend
docker build --platform linux/amd64 `
  --build-arg NEXT_PUBLIC_API_BASE_URL="$BackendUrl" `
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$SupabaseUrl" `
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$SupabaseAnonKey" `
  -t "${FrontendImage}:${FrontendVersion}" .
docker push "${FrontendImage}:${FrontendVersion}"

Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "Backend Image: ${BackendImage}:${BackendVersion}" -ForegroundColor Cyan
Write-Host "Frontend Image: ${FrontendImage}:${FrontendVersion}" -ForegroundColor Cyan
```

Usage:
```powershell
.\deploy.ps1 -BackendVersion v1 -FrontendVersion v1 -BackendUrl "https://pos-backend-xxxxx.run.app" -SupabaseUrl "https://xxxxx.supabase.co" -SupabaseAnonKey "your-anon-key"
```

---

## Post-Deployment

### 1. Get Your Service URLs

```bash
# Get backend URL
BACKEND_URL=$(gcloud run services describe pos-backend \
  --region us-central1 \
  --format 'value(status.url)')
echo "Backend URL: $BACKEND_URL"

# Get frontend URL
FRONTEND_URL=$(gcloud run services describe pos-frontend \
  --region us-central1 \
  --format 'value(status.url)')
echo "Frontend URL: $FRONTEND_URL"
```

### 2. Update CORS Settings

After deploying the frontend, update the backend CORS_ORIGINS to include the frontend URL:

```bash
gcloud run services update pos-backend \
  --region us-central1 \
  --update-env-vars "CORS_ORIGINS=$FRONTEND_URL"
```

### 3. Test the Deployment

```bash
# Test backend health endpoint
curl https://YOUR-BACKEND-URL/health

# Test frontend (open in browser)
# https://YOUR-FRONTEND-URL
```

---

## Environment Variables Reference

### Backend Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SUPABASE_URL` | Yes | Supabase project URL | `https://xxxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key | `eyJhbGc...` |
| `CORS_ORIGINS` | Yes | Comma-separated allowed origins | `https://frontend.run.app` |
| `BACKEND_PORT` | No | Port number (default: 8000) | `8000` |

### Frontend Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Backend API URL | `https://pos-backend.run.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key | `eyJhbGc...` |

**Important**: `NEXT_PUBLIC_*` variables must be set at **build time** for Next.js. Use `--build-arg` when building the Docker image.

---

## Monitoring and Logging

### View Logs

```bash
# Backend logs
gcloud run services logs read pos-backend --region us-central1

# Frontend logs
gcloud run services logs read pos-frontend --region us-central1

# Stream logs (real-time)
gcloud run services logs tail pos-backend --region us-central1
gcloud run services logs tail pos-frontend --region us-central1
```

Or use the [Cloud Console](https://console.cloud.google.com/run) → Select service → Logs tab

---

## Cost Optimization

### Current Configuration

- **Memory**: 512Mi per service
- **CPU**: 1 vCPU per service
- **Min Instances**: 0 (scales to zero when not in use)
- **Max Instances**: 10 (prevents runaway costs)

### Adjust Resources

```bash
# Update backend resources
gcloud run services update pos-backend \
  --region us-central1 \
  --memory 1Gi \
  --cpu 2

# Update frontend resources
gcloud run services update pos-frontend \
  --region us-central1 \
  --memory 1Gi \
  --cpu 2
```

### Estimate Costs

Use the [Cloud Run Pricing Calculator](https://cloud.google.com/run/pricing) to estimate monthly costs.

---

## Troubleshooting

### Backend Issues

#### Service Won't Start
1. Check logs: `gcloud run services logs read pos-backend --region us-central1`
2. Verify environment variables are set correctly
3. Test Docker image locally:
   ```bash
   docker build -t pos-backend ./backend
   docker run -p 8000:8000 \
     -e SUPABASE_URL=your-url \
     -e SUPABASE_SERVICE_ROLE_KEY=your-key \
     pos-backend
   ```

#### CORS Issues
1. Verify `CORS_ORIGINS` includes your frontend URL
2. Check that URLs don't have trailing slashes
3. Ensure frontend is using HTTPS in production

### Frontend Issues

#### Build Fails
1. Ensure `output: 'standalone'` is in `next.config.js`
2. Check that all environment variables are provided as build args
3. Verify Node.js version compatibility

#### Runtime Errors
1. Check logs: `gcloud run services logs read pos-frontend --region us-central1`
2. Verify environment variables were correctly set at build time
3. Ensure backend URL is accessible from frontend

#### Environment Variables Not Working
- Remember: `NEXT_PUBLIC_*` variables must be set at **build time**, not runtime
- Use `--build-arg` when building the Docker image
- Rebuild the image when environment variables change

---

## Security Best Practices

1. ✅ Use Secret Manager for sensitive backend data
2. ✅ Never commit secrets to version control
3. ✅ Use HTTPS only in production
4. ✅ Enable Cloud Armor for DDoS protection (if needed)
5. ✅ Use IAM to restrict access
6. ✅ Regularly update dependencies
7. ✅ Monitor for security vulnerabilities

---

## Next Steps

- [ ] Set up CI/CD pipeline with Cloud Build
- [ ] Configure custom domains
- [ ] Set up monitoring alerts
- [ ] Configure backup strategy
- [ ] Set up staging environment
- [ ] Document API endpoints for team

---

## Support

For issues or questions:
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Run Troubleshooting](https://cloud.google.com/run/docs/troubleshooting)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

