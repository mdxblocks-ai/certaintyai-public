$ErrorActionPreference = "Stop"

# 1. Submit Backend to Cloud Build
Write-Output "Submitting backend to Google Cloud Build..."
gcloud builds submit --tag us-central1-docker.pkg.dev/certaintyai-prod/certaintyai/backend:latest backend --project certaintyai-prod --timeout=900s

# 2. Deploy Backend to Cloud Run
Write-Output "Deploying backend to Cloud Run..."
gcloud run deploy certaintyai-backend --image us-central1-docker.pkg.dev/certaintyai-prod/certaintyai/backend:latest --region us-central1 --project certaintyai-prod --set-env-vars="LLM_PROVIDER=vertex,GCP_PROJECT_ID=certaintyai-prod,GCP_LOCATION=us-central1,VERTEX_MODEL=gemini-2.0-flash" --allow-unauthenticated

# 3. Submit Frontend to Cloud Build
Write-Output "Submitting frontend to Google Cloud Build..."
gcloud builds submit --config frontend/cloudbuild.yaml frontend --project certaintyai-prod --timeout=900s

# 4. Deploy Frontend to Cloud Run
Write-Output "Deploying frontend to Cloud Run..."
gcloud run deploy certaintyai-frontend --image us-central1-docker.pkg.dev/certaintyai-prod/certaintyai/frontend:latest --region us-central1 --project certaintyai-prod --allow-unauthenticated

Write-Output "DEPLOYMENT COMPLETE!"
