# GCP Cloud Run Deployment Guide

This guide walks you through deploying the Retail Boss POS backend to Google Cloud Platform using Cloud Run.

## Prerequisites

1. **Google Cloud Account**: Sign up at [cloud.google.com](https://cloud.google.com)
2. **Google Cloud SDK**: Install from [cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install)
3. **Docker** (optional, for local testing): Install from [docker.com](https://www.docker.com)

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
```

## Deployment Methods

### Method 1: Quick Deploy (Manual)

#### Step 1: Build and Push Image

```bash
cd backend

# Build and push to Container Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/pos-backend
```

#### Step 2: Deploy to Cloud Run

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
  --set-env-vars "SUPABASE_URL=your-supabase-url,SUPABASE_SERVICE_ROLE_KEY=your-key,CORS_ORIGINS=https://your-frontend-domain.com"
```

**Important**: Replace:
- `YOUR_PROJECT_ID` with your GCP project ID
- `your-supabase-url` with your Supabase project URL
- `your-key` with your Supabase service role key
- `https://your-frontend-domain.com` with your frontend URL(s), comma-separated

### Method 2: Using Secrets (Recommended for Production)

#### Step 1: Create Secrets

```bash
# Create Supabase URL secret
echo -n "https://your-project.supabase.co" | gcloud secrets create supabase-url --data-file=-

# Create Supabase service role key secret
echo -n "your-service-role-key-here" | gcloud secrets create supabase-key --data-file=-

# Grant Cloud Run access to secrets
gcloud secrets add-iam-policy-binding supabase-url \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding supabase-key \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

**Note**: Replace `YOUR_PROJECT_NUMBER` with your project number (find it with `gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)"`)

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

### Method 3: CI/CD with Cloud Build

#### Step 1: Update cloudbuild.yaml

Edit `cloudbuild.yaml` and replace any hardcoded values if needed.

#### Step 2: Trigger Build

```bash
gcloud builds submit --config cloudbuild.yaml
```

This will automatically:
1. Build the Docker image
2. Push to Container Registry
3. Deploy to Cloud Run

#### Step 3: Set Up Automatic Deployments

Connect your GitHub repository to Cloud Build:

1. Go to [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Click "Create Trigger"
3. Connect your repository
4. Configure trigger settings:
   - **Name**: `deploy-pos-backend`
   - **Event**: Push to branch (e.g., `main` or `master`)
   - **Configuration**: Cloud Build configuration file
   - **Location**: `backend/cloudbuild.yaml`
5. Save the trigger

Now, every push to your main branch will automatically deploy!

## Post-Deployment

### 1. Get Your Service URL

```bash
gcloud run services describe pos-backend \
  --region us-central1 \
  --format 'value(status.url)'
```

### 2. Test the Deployment

```bash
# Test health endpoint
curl https://YOUR-SERVICE-URL/health

# Test API docs
# Open in browser: https://YOUR-SERVICE-URL/docs
```

### 3. Update Frontend Configuration

Update your frontend API configuration to use the Cloud Run URL:

```typescript
// In frontend/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://YOUR-SERVICE-URL';
```

### 4. Set Up Custom Domain (Optional)

1. Go to [Cloud Run Console](https://console.cloud.google.com/run)
2. Click on your service
3. Go to "Manage Custom Domains"
4. Map your domain to the service
5. Follow DNS configuration instructions

## Environment Variables

### Required Variables

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `CORS_ORIGINS`: Comma-separated list of allowed origins (e.g., `https://example.com,https://www.example.com`)

### Optional Variables

- `BACKEND_PORT`: Port number (default: 8000, Cloud Run overrides this)
- `DEFAULT_SERVICE_CHARGE_ENABLED`: Enable service charge by default (default: true)
- `DEFAULT_SERVICE_CHARGE_RATE`: Default service charge rate (default: 10.0)

## Monitoring and Logging

### View Logs

```bash
# View recent logs
gcloud run services logs read pos-backend --region us-central1

# Stream logs
gcloud run services logs tail pos-backend --region us-central1
```

Or use the [Cloud Console](https://console.cloud.google.com/run) → Select service → Logs tab

### Set Up Alerts

1. Go to [Cloud Monitoring](https://console.cloud.google.com/monitoring)
2. Create alerting policies for:
   - High error rates
   - High latency
   - Service unavailability

## Cost Optimization

### Current Configuration

- **Memory**: 512Mi (adjust based on usage)
- **CPU**: 1 vCPU
- **Min Instances**: 0 (scales to zero when not in use)
- **Max Instances**: 10 (prevents runaway costs)

### Adjust Resources

```bash
# Update memory and CPU
gcloud run services update pos-backend \
  --region us-central1 \
  --memory 1Gi \
  --cpu 2

# Adjust scaling
gcloud run services update pos-backend \
  --region us-central1 \
  --min-instances 1 \
  --max-instances 20
```

### Estimate Costs

Use the [Cloud Run Pricing Calculator](https://cloud.google.com/run/pricing) to estimate monthly costs.

## Troubleshooting

### Service Won't Start

1. Check logs: `gcloud run services logs read pos-backend --region us-central1`
2. Verify environment variables are set correctly
3. Test Docker image locally:
   ```bash
   docker build -t pos-backend .
   docker run -p 8000:8000 \
     -e SUPABASE_URL=your-url \
     -e SUPABASE_SERVICE_ROLE_KEY=your-key \
     pos-backend
   ```

### CORS Issues

1. Verify `CORS_ORIGINS` includes your frontend URL
2. Check that URLs don't have trailing slashes
3. Ensure frontend is using HTTPS in production

### High Latency

1. Increase memory/CPU allocation
2. Set `--min-instances 1` to avoid cold starts
3. Consider using a region closer to your users

## Local Testing

Before deploying, test the Docker image locally:

```bash
# Build image
docker build -t pos-backend .

# Run container
docker run -p 8000:8000 \
  -e SUPABASE_URL=your-supabase-url \
  -e SUPABASE_SERVICE_ROLE_KEY=your-key \
  -e CORS_ORIGINS=http://localhost:3000 \
  pos-backend

# Test
curl http://localhost:8000/health
```

## Security Best Practices

1. ✅ Use Secret Manager for sensitive data (not environment variables)
2. ✅ Enable Cloud Armor for DDoS protection (if needed)
3. ✅ Use IAM to restrict access
4. ✅ Enable VPC connector if accessing private resources
5. ✅ Regularly update dependencies
6. ✅ Monitor for security vulnerabilities

## Next Steps

- [ ] Set up CI/CD pipeline
- [ ] Configure custom domain
- [ ] Set up monitoring alerts
- [ ] Configure backup strategy
- [ ] Set up staging environment
- [ ] Document API endpoints for team

## Support

For issues or questions:
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Run Troubleshooting](https://cloud.google.com/run/docs/troubleshooting)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)

