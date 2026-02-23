# 🚀 Deployment Guide

## Local Development Setup

### 1. Project Setup
```bash
git clone <repository>
cd super-lig-analytics
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_FOOTBALL_API_KEY=your_rapidapi_key
VITE_API_BASE_URL=http://localhost:3000/api
NODE_ENV=development
PORT=3000
```

### 3. Development Servers

**Terminal 1 - Frontend (Vite):**
```bash
npm run dev
# Açılır: http://localhost:5173
```

**Terminal 2 - Backend (Express):**
```bash
npm run backend:dev
# Açılır: http://localhost:3000
```

## Production Build

### Frontend Build
```bash
npm run build
# Output: dist/
```

### Backend Build
```bash
npm run backend:build
# Output: dist/backend/
```

## Vercel Deployment (Frontend)

### 1. Vercel Account
- https://vercel.com'a git
- GitHub repo'yu bağla

### 2. Project Settings
```
Framework: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Environment Variables:
  - VITE_FOOTBALL_API_KEY
  - VITE_API_BASE_URL (production backend URL)
```

### 3. Deployment
```bash
# Vercel CLI
npm i -g vercel
vercel --prod
```

**Preview URL**: `https://super-lig-analytics.vercel.app`

## Railway/Render Deployment (Backend)

### Railway

#### 1. Setup
- https://railway.app'a git
- GitHub repo bağla

#### 2. Configuration
```yaml
# railway.toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm run backend"
restartPolicyMaxRetries = 3
```

#### 3. Environment Variables
```env
NODE_ENV=production
PORT=3000 (Railway auto-assigns)
FOOTBALL_API_KEY=your_key
DATABASE_URL=your_postgres_url
REDIS_URL=your_redis_url
```

#### 4. Deploy
```bash
railway login
railway link
railway up
```

**API URL**: `https://your-app.up.railway.app`

### Render

#### 1. Create Service
- https://render.com
- "New" → "Web Service"
- GitHub repo seç

#### 2. Settings
```
Name: super-lig-api
Environment: Node
Build Command: npm install
Start Command: npm run backend
```

#### 3. Environment
```env
NODE_ENV=production
FOOTBALL_API_KEY=your_key
```

#### 4. Deploy
Deploy düğmesine tıkla. Render otomatik deploy eder.

**API URL**: `https://super-lig-api.onrender.com`

## Docker Deployment

### 1. Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Cache layer
COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Build
RUN npm run build
RUN npm run backend:build

EXPOSE 3000

CMD ["node", "dist/backend/server.js"]
```

### 2. .dockerignore
```
node_modules
.git
.env
dist
build
.next
out
```

### 3. Build & Run
```bash
# Build
docker build -t super-lig-analytics .

# Run locally
docker run -p 3000:3000 \
  -e FOOTBALL_API_KEY=your_key \
  super-lig-analytics

# Run production version
docker run -p 80:3000 \
  -e NODE_ENV=production \
  -e FOOTBALL_API_KEY=your_key \
  super-lig-analytics
```

### 4. Docker Compose (Local Full Stack)
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      FOOTBALL_API_KEY: ${FOOTBALL_API_KEY}
      REDIS_URL: redis://redis:6379
    depends_on:
      - redis
      - postgres

  frontend:
    image: node:18-alpine
    working_dir: /app
    command: npm run dev
    volumes:
      - .:/app
    ports:
      - "5173:5173"
    environment:
      VITE_API_BASE_URL: http://localhost:3000/api

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: superlig
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Çalıştır:
```bash
docker-compose up
```

## Kubernetes Deployment

### 1. Deployment YAML
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: super-lig-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: super-lig-api
  template:
    metadata:
      labels:
        app: super-lig-api
    spec:
      containers:
      - name: api
        image: your-registry/super-lig-api:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: FOOTBALL_API_KEY
          valueFrom:
            secretKeyRef:
              name: api-secrets
              key: football-api-key
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 10
```

### 2. Service
```yaml
apiVersion: v1
kind: Service
metadata:
  name: super-lig-api-service
spec:
  selector:
    app: super-lig-api
  type: LoadBalancer
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
```

### 3. Deploy
```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl get pods
kubectl logs <pod-name>
```

## CI/CD Pipeline (GitHub Actions)

### .github/workflows/deploy.yml
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Lint
      run: npm run lint --if-present
    
    - name: Build frontend
      run: npm run build
    
    - name: Build backend
      run: npm run backend:build
    
    - name: Deploy to Vercel
      uses: vercel/action@main
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
    
    - name: Deploy to Railway
      run: |
        npm install -g @railway/cli
        railway up
      env:
        RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## Monitoring & Logging

### Sentry (Error Tracking)
```bash
npm install @sentry/react @sentry/tracing
```

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://your-sentry-dsn",
  environment: "production",
  tracesSampleRate: 0.1,
});
```

### Datadog (Monitoring)
```typescript
import { datadog } from "@datadog/browser-rum"

datadog.init({
  applicationId: 'YOUR_APPLICATION_ID',
  clientToken: 'YOUR_CLIENT_TOKEN',
  site: 'datadoghq.com',
  service: 'super-lig-analytics',
  env: 'production',
})
```

### LogRocket (Session Recording)
```typescript
import LogRocket from 'logrocket';

LogRocket.init('YOUR_APP_ID');
```

## Performance Optimization

### 1. Code Splitting
```typescript
// React.lazy + Suspense
const HomePage = lazy(() => import('@/pages/HomePage'))
const TeamsPage = lazy(() => import('@/pages/TeamsPage'))
```

### 2. Image Optimization
```typescript
// Next-gen formats
<img src="logo.webp" alt="..." />

// Lazy loading
<img loading="lazy" src="..." />
```

### 3. Asset Compression
```javascript
// vite.config.ts
import compression from 'vite-plugin-compression'

export default {
  plugins: [compression()]
}
```

## Security Checklist

- [ ] HTTPS sertifikası
- [ ] API anahtarları environment variables'da
- [ ] CORS konfigürasyonu
- [ ] Rate limiting
- [ ] Input validation
- [ ] SQL injection protection
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] Security headers (CSP, X-Frame-Options vb.)

## Backup & Recovery

### Database Backup
```bash
# PostgreSQL
pg_dump superlig > backup.sql

# Restore
psql superlig < backup.sql
```

### Redis Backup
```bash
redis-cli BGSAVE
```

## Rollback Plan

1. **Docker**: Önceki image'ye dön
   ```bash
   docker pull registry/app:v1.0.0
   docker run ... registry/app:v1.0.0
   ```

2. **Vercel**: Previous deployment'ı restore et
   - Vercel Dashboard → Deployments → Promote previous

3. **Railway**: Güncello'yi geri al
   ```bash
   railway rollback
   ```

## Troubleshooting

### Frontend boş sayfası
```bash
# Cache temizle
npm run build
rm -rf dist
npm run build
```

### API 503 hatası
```bash
# Backend logs'ı kontrol et
docker logs <container-id>

# Health check
curl http://localhost:3000/api/health
```

### Yavaş veri fetching
```bash
# Cache TTL artır .env
CACHE_TTL=7200

# Database indexes ekle
CREATE INDEX idx_match_date ON matches(date DESC)
```

---

**For support**: Dokümante tüm steps, logs tut, monitoring dashboard'u kontrol et.
