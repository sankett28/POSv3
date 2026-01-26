#!/bin/bash

# GCP Cloud Run Deployment Script
# Usage: ./deploy.sh [PROJECT_ID] [REGION]

set -e

PROJECT_ID=${1:-${GOOGLE_CLOUD_PROJECT:-"YOUR_PROJECT_ID"}}
REGION=${2:-"us-central1"}

if [ "$PROJECT_ID" == "YOUR_PROJECT_ID" ]; then
    echo "Error: Please provide your GCP Project ID"
    echo "Usage: ./deploy.sh PROJECT_ID [REGION]"
    echo "Or set GOOGLE_CLOUD_PROJECT environment variable"
    exit 1
fi

echo "🚀 Deploying to GCP Cloud Run..."
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Set project
gcloud config set project $PROJECT_ID

# Build and push image
echo "📦 Building and pushing Docker image..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/pos-backend

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
echo "⚠️  Note: You'll need to set environment variables manually or use secrets"
echo ""
gcloud run deploy pos-backend \
  --image gcr.io/$PROJECT_ID/pos-backend \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8000 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10

# Get service URL
SERVICE_URL=$(gcloud run services describe pos-backend \
  --region $REGION \
  --format 'value(status.url)')

echo ""
echo "✅ Deployment complete!"
echo "Service URL: $SERVICE_URL"
echo ""
echo "📝 Next steps:"
echo "1. Set environment variables:"
echo "   gcloud run services update pos-backend --region $REGION --set-env-vars 'SUPABASE_URL=...,SUPABASE_SERVICE_ROLE_KEY=...,CORS_ORIGINS=...'"
echo ""
echo "2. Or use secrets (recommended):"
echo "   See DEPLOYMENT.md for instructions"
echo ""
echo "3. Test your deployment:"
echo "   curl $SERVICE_URL/health"

