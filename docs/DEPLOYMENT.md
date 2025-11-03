# 🚀 Base44 - Deployment Guide

Deploy Base44 to production in minutes.

---

## 🎯 Recommended Stack

- **Hosting**: Vercel (recommended) or Netlify
- **Database**: Supabase or Railway
- **File Storage**: Uploadcare or Cloudinary
- **Monitoring**: Sentry (optional)

---

## 🚀 Option 1: Deploy to Vercel (Recommended)

### Prerequisites

- GitHub account
- Vercel account (free)
- PostgreSQL database (Supabase/Railway)

### Step 1: Prepare Database

#### Using Supabase (Recommended)

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get your connection string:
   - Go to Settings > Database
   - Copy Connection String (Transaction mode)
   - Example: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`

#### Using Railway

1. Go to [railway.app](https://railway.app)
2. New Project > PostgreSQL
3. Copy DATABASE_URL from Variables tab

### Step 2: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/base44.git
git push -u origin main
```

### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Import from GitHub
4. Select your repository
5. Configure:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next

### Step 4: Add Environment Variables

In Vercel dashboard > Settings > Environment Variables:

```env
DATABASE_URL=your_database_url
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_secret_key_32_chars_min
```

Generate secret:
```bash
openssl rand -base64 32
```

### Step 5: Deploy

Click "Deploy" - Vercel will:
1. Build your app
2. Run migrations
3. Deploy to production

### Step 6: Seed Database

After first deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Run seed command
vercel env pull .env.local
npx prisma db seed
```

### Step 7: Configure Custom Domain (Optional)

1. Vercel Dashboard > Settings > Domains
2. Add your domain
3. Update DNS records

---

## 🔄 Option 2: Deploy to Netlify

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

### Step 2: Build for Netlify

```bash
npm run build
```

### Step 3: Deploy

```bash
netlify deploy --prod
```

---

## 🐳 Option 3: Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/base44
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=your-secret
    depends_on:
      - db

  db:
    image: postgres:14
    environment:
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=base44
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Deploy

```bash
docker-compose up -d
```

---

## ✅ Post-Deployment Checklist

### 1. Verify Deployment

- [ ] App loads at production URL
- [ ] Login works
- [ ] Dashboard displays
- [ ] Database connected

### 2. Security

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] CORS configured
- [ ] Rate limiting enabled

### 3. Performance

- [ ] Images optimized
- [ ] Caching configured
- [ ] Database indexes created
- [ ] CDN enabled (Vercel does this automatically)

### 4. Monitoring

- [ ] Error tracking (Sentry)
- [ ] Analytics (Google Analytics)
- [ ] Uptime monitoring
- [ ] Performance monitoring

### 5. Backup

- [ ] Database backups configured
- [ ] File storage backups
- [ ] Disaster recovery plan

---

## 🔧 Configuration

### Environment Variables for Production

```env
# Database (required)
DATABASE_URL="postgresql://..."

# Auth (required)
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret"

# Email (optional)
EMAIL_SERVER="smtp://..."
EMAIL_FROM="noreply@your-domain.com"

# File Upload (optional)
UPLOADCARE_PUBLIC_KEY="..."
UPLOADCARE_SECRET_KEY="..."

# Analytics (optional)
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"

# Error Tracking (optional)
SENTRY_DSN="https://..."
```

### Database Configuration

For production, add connection pooling:

```env
DATABASE_URL="postgresql://user:password@host:5432/db?pgbouncer=true&connection_limit=10"
```

---

## 🚦 CI/CD Pipeline

### GitHub Actions Example

`.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 📊 Monitoring

### Vercel Analytics

Automatically enabled for Vercel deployments.

### Sentry Setup

```bash
npm install @sentry/nextjs
```

Add to `.env.production`:
```env
SENTRY_DSN="your-dsn"
```

---

## 🔄 Updates & Maintenance

### Update Dependencies

```bash
npm update
npm audit fix
```

### Database Migrations

```bash
npx prisma migrate deploy
```

### Rollback

Vercel keeps all deployments - instant rollback in dashboard.

---

## 🆘 Troubleshooting

### Build Fails

**Check**:
- Node.js version (must be 18+)
- Environment variables set
- Database accessible

### Database Connection Issues

**Check**:
- DATABASE_URL correct
- Database accessible from deployment
- Connection pooling configured

### 404 on Routes

**Solution**: Ensure Next.js routing is correct and rebuild.

---

## 📚 Additional Resources

- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**Deployment Time**: ~15 minutes  
**Downtime**: Zero (with Vercel)  
**Date**: November 2, 2025
