# Deployment Guide - AI Med Patient Portal

Comprehensive guide for deploying the AI Med Patient Portal to various platforms.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Build Configuration](#build-configuration)
3. [Environment Variables](#environment-variables)
4. [Deployment Platforms](#deployment-platforms)
   - [Vercel](#vercel)
   - [AWS Amplify](#aws-amplify)
   - [Docker](#docker)
   - [Self-Hosted](#self-hosted)
5. [Post-Deployment](#post-deployment)
6. [Monitoring & Maintenance](#monitoring--maintenance)

## Prerequisites

Before deploying, ensure you have:

- ✅ Node.js 18+ installed
- ✅ Backend API deployed and accessible
- ✅ Environment variables configured
- ✅ Domain name (for production)
- ✅ SSL certificate (for HTTPS)
- ✅ CI/CD pipeline configured (optional but recommended)

## Build Configuration

### Local Build Test

Always test the production build locally before deploying:

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Test the production build
npm run start
```

Verify:
- ✅ Build completes without errors
- ✅ Application starts successfully
- ✅ All pages load correctly
- ✅ API connections work
- ✅ No console errors

### Build Optimization

The Next.js build process automatically:
- ✅ Optimizes images
- ✅ Minifies JavaScript and CSS
- ✅ Tree-shakes unused code
- ✅ Generates static pages where possible
- ✅ Creates optimized bundles

## Environment Variables

### Required Variables

Set these in your deployment platform:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.aimed.example.com
NEXT_PUBLIC_WS_BASE_URL=wss://api.aimed.example.com
NEXT_PUBLIC_DEMO_MODE=false
NODE_ENV=production
```

### Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Use environment variables** in your deployment platform
3. **Rotate secrets** regularly
4. **Use different values** for staging and production
5. **Validate environment** on application startup

### Environment Validation

The application validates environment variables on startup. If validation fails:
- The app will log warnings in development
- The app will use safe defaults in production
- Check browser console for validation errors

## Deployment Platforms

### Vercel

Vercel is the recommended platform for Next.js applications.

#### Setup Steps

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Production Deploy:**
   ```bash
   vercel --prod
   ```

#### Vercel Configuration

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_API_BASE_URL": "@api-base-url",
    "NEXT_PUBLIC_WS_BASE_URL": "@ws-base-url",
    "NEXT_PUBLIC_DEMO_MODE": "false"
  }
}
```

#### Environment Variables in Vercel

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable:
   - `NEXT_PUBLIC_API_BASE_URL`
   - `NEXT_PUBLIC_WS_BASE_URL`
   - `NEXT_PUBLIC_DEMO_MODE`

#### Vercel Features

- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic deployments from Git
- ✅ Preview deployments for PRs
- ✅ Analytics and monitoring
- ✅ Edge functions support

### AWS Amplify

AWS Amplify provides full-stack deployment for Next.js.

#### Setup Steps

1. **Install AWS CLI:**
   ```bash
   # Follow AWS CLI installation guide
   ```

2. **Configure Amplify:**
   ```bash
   amplify init
   ```

3. **Add hosting:**
   ```bash
   amplify add hosting
   ```

4. **Deploy:**
   ```bash
   amplify publish
   ```

#### Amplify Configuration

Create `amplify.yml`:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

#### Environment Variables in Amplify

1. Go to Amplify Console
2. Select your app
3. Go to "Environment variables"
4. Add variables for each environment (dev, staging, prod)

### Docker

Deploy using Docker for containerized environments.

#### Dockerfile

Create `Dockerfile`:

```dockerfile
# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  patient-portal:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_BASE_URL=${API_BASE_URL}
      - NEXT_PUBLIC_WS_BASE_URL=${WS_BASE_URL}
      - NEXT_PUBLIC_DEMO_MODE=false
      - NODE_ENV=production
    restart: unless-stopped
```

#### Build and Run

```bash
# Build image
docker build -t ai-med-patient-portal .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=https://api.aimed.example.com \
  -e NEXT_PUBLIC_WS_BASE_URL=wss://api.aimed.example.com \
  -e NEXT_PUBLIC_DEMO_MODE=false \
  ai-med-patient-portal
```

### Self-Hosted

Deploy on your own server (VPS, dedicated server, etc.).

#### Prerequisites

- Node.js 18+ installed
- PM2 or similar process manager
- Nginx or Apache for reverse proxy
- SSL certificate (Let's Encrypt recommended)

#### Setup Steps

1. **Clone repository:**
   ```bash
   git clone https://github.com/AI-Empower-360/ai-med-frontend-patient.git
   cd ai-med-frontend-patient
   ```

2. **Install dependencies:**
   ```bash
   npm ci --production
   ```

3. **Build application:**
   ```bash
   npm run build
   ```

4. **Set environment variables:**
   ```bash
   export NEXT_PUBLIC_API_BASE_URL=https://api.aimed.example.com
   export NEXT_PUBLIC_WS_BASE_URL=wss://api.aimed.example.com
   export NEXT_PUBLIC_DEMO_MODE=false
   export NODE_ENV=production
   ```

5. **Start with PM2:**
   ```bash
   npm install -g pm2
   pm2 start npm --name "patient-portal" -- start
   pm2 save
   pm2 startup
   ```

#### Nginx Configuration

Create `/etc/nginx/sites-available/patient-portal`:

```nginx
server {
    listen 80;
    server_name patient.aimed.example.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name patient.aimed.example.com;

    ssl_certificate /etc/letsencrypt/live/patient.aimed.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/patient.aimed.example.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/patient-portal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Post-Deployment

### Verification Checklist

- [ ] Application loads at production URL
- [ ] All pages are accessible
- [ ] API connections work
- [ ] Authentication flow works
- [ ] PDF export works
- [ ] Print functionality works
- [ ] Mobile responsiveness verified
- [ ] HTTPS is enabled
- [ ] Environment variables are set correctly
- [ ] Error handling works
- [ ] No console errors

### Health Checks

Set up health check endpoints:

```bash
# Check if application is running
curl https://patient.aimed.example.com

# Check API connectivity (from server)
curl https://api.aimed.example.com/health
```

### Performance Testing

Test performance after deployment:

1. **Lighthouse Audit:**
   - Run Lighthouse in Chrome DevTools
   - Target: 90+ Performance score
   - Target: 90+ Accessibility score
   - Target: 90+ Best Practices score
   - Target: 90+ SEO score

2. **Load Testing:**
   - Use tools like k6 or Apache Bench
   - Test concurrent user scenarios
   - Monitor response times

## Monitoring & Maintenance

### Monitoring Tools

Recommended monitoring:

1. **Application Monitoring:**
   - Vercel Analytics (if using Vercel)
   - Sentry for error tracking
   - LogRocket for session replay

2. **Performance Monitoring:**
   - Web Vitals tracking
   - Real User Monitoring (RUM)
   - API response time monitoring

3. **Uptime Monitoring:**
   - UptimeRobot
   - Pingdom
   - StatusCake

### Logging

Configure logging:

```typescript
// In production, use structured logging
if (process.env.NODE_ENV === 'production') {
  // Send logs to logging service (e.g., Datadog, CloudWatch)
}
```

### Updates and Maintenance

1. **Regular Updates:**
   ```bash
   # Check for updates
   npm outdated
   
   # Update dependencies
   npm update
   
   # Test after updates
   npm test
   npm run build
   ```

2. **Security Updates:**
   ```bash
   # Check for security vulnerabilities
   npm audit
   
   # Fix vulnerabilities
   npm audit fix
   ```

3. **Backup Strategy:**
   - Backup environment variables
   - Backup configuration files
   - Document deployment process

### Rollback Procedure

If deployment fails:

1. **Vercel:**
   - Go to Deployments
   - Select previous successful deployment
   - Click "Promote to Production"

2. **Docker:**
   ```bash
   docker tag ai-med-patient-portal:previous ai-med-patient-portal:latest
   docker-compose up -d
   ```

3. **Self-Hosted:**
   ```bash
   git checkout previous-commit
   npm run build
   pm2 restart patient-portal
   ```

## Troubleshooting

Common deployment issues:

### Build Failures

**Issue:** Build fails with TypeScript errors
- **Solution:** Run `npm run type-check` locally first
- **Solution:** Ensure all dependencies are installed

**Issue:** Build fails with memory errors
- **Solution:** Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=4096 npm run build`

### Runtime Errors

**Issue:** Environment variables not loading
- **Solution:** Verify variables are set in deployment platform
- **Solution:** Check variable names (must start with `NEXT_PUBLIC_` for client-side)

**Issue:** API connection failures
- **Solution:** Verify `NEXT_PUBLIC_API_BASE_URL` is correct
- **Solution:** Check CORS settings on backend
- **Solution:** Verify backend is accessible from deployment environment

### Performance Issues

**Issue:** Slow page loads
- **Solution:** Enable CDN caching
- **Solution:** Optimize images
- **Solution:** Enable compression (gzip/brotli)

## Security Checklist

Before going to production:

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] No hardcoded secrets
- [ ] CORS properly configured
- [ ] Security headers set
- [ ] Dependencies up to date
- [ ] No known vulnerabilities (`npm audit`)
- [ ] Error messages don't expose PHI
- [ ] Authentication tokens secure
- [ ] Rate limiting configured (if applicable)

## Support

For deployment issues:
1. Check this guide
2. Review [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
3. Check application logs
4. Open an issue in the repository

---

**Last Updated:** January 2026
