#!/bin/bash
set -e

echo "🚀 Starting LMS deployment..."

cd ~/LMS || { echo "❌ Directory ~/LMS not found"; exit 1; }

echo "📥 Pulling latest code..."
git reset --hard origin/Main
git pull origin Main

echo "📦 Installing dependencies..."
npm ci

echo "🔨 Building Next.js..."
npm run build

echo "🔄 Restarting PM2 services..."
pm2 restart nextjs-frontend
pm2 restart certificate-worker
pm2 restart ai-microservice
pm2 restart websocket-service
pm2 save

echo "✅ Deployment complete!"
pm2 status
