# 🚀 CI/CD Setup Guide

This document describes the GitHub Actions CI/CD pipeline for the LMS project.

## 📋 Overview

The pipeline automatically builds, validates, and deploys the LMS application to AWS EC2 on every push to the `Main` branch.

### Pipeline Stages

1. **Build & Validate** — Runs on every push
   - Install dependencies
   - Run ESLint
   - Run TypeScript type checking
   - Build Next.js application

2. **Deploy to EC2** — Runs only on pushes to `Main`
   - SSH into EC2 instance
   - Pull latest code from GitHub
   - Install dependencies
   - Build application
   - Restart all PM2 services
   - Run health checks

## 🔐 Required GitHub Secrets

Navigate to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.

Add the following secrets:

### EC2 Connection
| Secret | Description | Example |
|--------|-------------|---------|
| `EC2_HOST` | EC2 public IP or domain | `learnportal.duckdns.org` |
| `EC2_USER` | SSH username | `ec2-user` |
| `EC2_SSH_KEY` | Private SSH key for EC2 access | `-----BEGIN RSA PRIVATE KEY-----...` |
| `EC2_PORT` | SSH port (optional, default 22) | `22` |

### Application Environment Variables
| Secret | Description |
|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `GROQ_API_KEY` | Groq LLM API key |
| `REDIS_URL` | Redis connection URL |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 secret key |
| `R2_BUCKET_NAME` | R2 bucket name |
| `NEXT_PUBLIC_APP_URL` | Public app URL |

## 🛠️ EC2 Prerequisites

Before using this CI/CD pipeline, ensure your EC2 instance has:

1. **SSH access configured** — Your public SSH key added to `~/.ssh/authorized_keys`
2. **Git repository cloned** — Code present at `~/LMS`
3. **PM2 installed globally** — `sudo npm install -g pm2`
4. **PM2 services configured** — All 4 services saved with `pm2 save`
5. **SSH agent / key-based auth** — No password prompts on SSH

## 🔧 Local Development

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript compiler check |
| `npm run start` | Start production server |

## 🔄 Manual Deployment

You can also trigger a deployment manually from the GitHub Actions tab using **"Run workflow"**.
