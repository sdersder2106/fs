# 🔧 MAINTENANCE & TROUBLESHOOTING GUIDE

## 📋 Table des Matières

1. [Commandes Utiles](#commandes-utiles)
2. [Logs & Monitoring](#logs--monitoring)
3. [Database Management](#database-management)
4. [Common Issues](#common-issues)
5. [Performance Optimization](#performance-optimization)
6. [Security Checklist](#security-checklist)

---

## 🛠️ Commandes Utiles

### Railway CLI Commands

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# View logs in real-time
railway logs

# Run commands in Railway environment
railway run <command>

# Open Railway dashboard
railway open

# Check service status
railway status
```

### Database Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name <migration-name>

# Apply migrations (production)
railway run npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
railway run npx prisma migrate reset

# Seed database
railway run npm run prisma:seed

# Open Prisma Studio
railway run npx prisma studio
```

### Build & Deploy

```bash
# Build locally
npm run build

# Start production server locally
npm start

# Lint code
npm run lint

# Type check
npx tsc --noEmit

# Force rebuild on Railway
git commit --allow-empty -m "Force rebuild"
git push
```

---

## 📊 Logs & Monitoring

### View Application Logs

**Railway Dashboard:**
1. Go to your project
2. Click on your service
3. Navigate to "Deployments"
4. Click on latest deployment
5. View logs in real-time

**CLI:**
```bash
railway logs --tail
```

### Health Check Endpoint

Check if app is healthy:
```bash
curl https://your-app.railway.app/api/health
```

Response (healthy):
```json
{
  "status": "healthy",
  "timestamp": "2024-11-04T10:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "database": "connected",
    "nextauth": "configured",
    "pusher": "configured"
  }
}
```

### Monitor Pusher

1. Go to https://dashboard.pusher.com
2. Select your app
3. View "Overview" for connection stats
4. Use "Debug Console" to see live events

### Database Metrics

**Railway Dashboard:**
1. Click on PostgreSQL service
2. Navigate to "Metrics"
3. Monitor:
   - CPU usage
   - Memory usage
   - Disk usage
   - Active connections

---

## 🗄️ Database Management

### Backup Database

```bash
# Backup to file
railway run pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Backup specific tables
railway run pg_dump $DATABASE_URL -t users -t pentests > backup.sql
```

### Restore Database

```bash
# Restore from backup
railway run psql $DATABASE_URL < backup.sql

# Restore specific database
railway run psql $DATABASE_URL -f backup.sql
```

### Database Queries

```bash
# Connect to database
railway run psql $DATABASE_URL

# Common queries:
# Count users
SELECT COUNT(*) FROM "User";

# Count pentests
SELECT COUNT(*) FROM "Pentest";

# Count findings by severity
SELECT severity, COUNT(*) FROM "Finding" GROUP BY severity;

# Recent activity
SELECT * FROM "ActivityLog" ORDER BY "createdAt" DESC LIMIT 10;
```

### Clean Up Old Data

```bash
# Delete old notifications (older than 30 days)
DELETE FROM "Notification" 
WHERE "createdAt" < NOW() - INTERVAL '30 days';

# Delete old activity logs (older than 90 days)
DELETE FROM "ActivityLog" 
WHERE "createdAt" < NOW() - INTERVAL '90 days';
```

---

## 🐛 Common Issues

### Issue: Build Fails

**Symptoms:**
- Railway build shows errors
- Deployment fails

**Solutions:**

1. **Check logs:**
```bash
railway logs
```

2. **Verify Node version:**
Add to `package.json`:
```json
"engines": {
  "node": ">=18.0.0",
  "npm": ">=9.0.0"
}
```

3. **Clear build cache:**
```bash
git commit --allow-empty -m "Clear cache"
git push
```

4. **Check dependencies:**
```bash
npm install
npm run build
```

### Issue: Database Connection Error

**Symptoms:**
- "Error: P1001: Can't reach database server"
- 500 errors on API routes

**Solutions:**

1. **Verify DATABASE_URL:**
- Check in Railway variables
- Should be automatically set by Railway

2. **Check PostgreSQL service:**
- Is it running?
- Check metrics for issues

3. **Regenerate Prisma Client:**
```bash
railway run npx prisma generate
railway run npx prisma migrate deploy
```

### Issue: Pusher Not Connecting

**Symptoms:**
- Real-time features not working
- Console errors about Pusher

**Solutions:**

1. **Verify Pusher credentials:**
- Check PUSHER_APP_ID
- Check NEXT_PUBLIC_PUSHER_KEY
- Check PUSHER_SECRET
- Check NEXT_PUBLIC_PUSHER_CLUSTER

2. **Check Pusher dashboard:**
- Are there active connections?
- Any errors in Debug Console?

3. **Verify environment variables:**
```bash
railway variables
```

### Issue: Authentication Errors

**Symptoms:**
- Can't log in
- Session expired immediately
- Infinite redirects

**Solutions:**

1. **Verify NEXTAUTH_URL:**
Must match your Railway domain:
```
NEXTAUTH_URL=https://your-app.railway.app
```

2. **Verify NEXTAUTH_SECRET:**
Must be set and not empty:
```bash
openssl rand -base64 32
```

3. **Clear browser cookies:**
- Open DevTools → Application → Cookies
- Clear all cookies for your domain

4. **Check database:**
```sql
SELECT * FROM "User" WHERE email = 'your-email@example.com';
```

### Issue: 404 on Pages

**Symptoms:**
- Pages return 404
- Routes not found

**Solutions:**

1. **Verify file structure:**
```
app/(dashboard)/page.tsx  ✓
app/dashboard/page.tsx    ✗ (wrong)
```

2. **Check middleware:**
- Verify middleware.ts is correct
- Check route matching patterns

3. **Rebuild:**
```bash
npm run build
```

### Issue: Slow Performance

**Symptoms:**
- Pages load slowly
- API responses slow

**Solutions:**

1. **Check database queries:**
- Add indexes if needed
- Optimize N+1 queries
- Use `select` to limit fields

2. **Monitor Railway metrics:**
- CPU usage high?
- Memory usage high?
- Upgrade plan if needed

3. **Enable caching:**
- API route caching
- Static page caching

---

## ⚡ Performance Optimization

### Database Optimization

```prisma
// Add indexes to frequently queried fields
@@index([companyId])
@@index([status])
@@index([createdAt])
@@index([email])
```

### API Route Caching

```typescript
// Add to API routes
export const revalidate = 60; // Cache for 60 seconds
```

### Image Optimization

```tsx
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={500}
  height={300}
  priority // For above-the-fold images
/>
```

### Code Splitting

```tsx
// Lazy load heavy components
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});
```

---

## 🔒 Security Checklist

### Regular Security Tasks

- [ ] **Weekly:**
  - Review activity logs for suspicious activity
  - Check failed login attempts
  - Monitor database connections

- [ ] **Monthly:**
  - Update dependencies: `npm update`
  - Review user access levels
  - Rotate API keys
  - Review and update passwords

- [ ] **Quarterly:**
  - Security audit
  - Penetration testing (dogfooding!)
  - Backup verification
  - Disaster recovery drill

### Security Best Practices

1. **Never commit secrets:**
```bash
# Always in .gitignore
.env
.env.local
.env.production
```

2. **Use strong passwords:**
- Minimum 12 characters
- Mix of letters, numbers, symbols
- Use password manager

3. **Keep dependencies updated:**
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

4. **Monitor failed logins:**
```sql
SELECT * FROM "ActivityLog" 
WHERE action LIKE '%failed%' 
ORDER BY "createdAt" DESC 
LIMIT 50;
```

5. **Regular backups:**
```bash
# Automated weekly backup script
0 0 * * 0 railway run pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

---

## 📞 Support Resources

### Railway
- Dashboard: https://railway.app
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway

### Pusher
- Dashboard: https://dashboard.pusher.com
- Docs: https://pusher.com/docs
- Support: https://support.pusher.com

### Next.js
- Docs: https://nextjs.org/docs
- GitHub: https://github.com/vercel/next.js

### Prisma
- Docs: https://www.prisma.io/docs
- Discord: https://discord.gg/prisma

---

## 🆘 Emergency Procedures

### Critical Error - Site Down

1. **Check Railway status:**
   - https://railway.app/status

2. **View logs immediately:**
```bash
railway logs --tail
```

3. **Rollback if needed:**
   - Railway Dashboard → Deployments
   - Click on last working deployment
   - Click "Redeploy"

4. **Database issues:**
```bash
# Check database status
railway run psql $DATABASE_URL -c "SELECT 1;"
```

### Data Loss - Restore from Backup

1. **Stop writes:**
   - Put site in maintenance mode if possible

2. **Restore database:**
```bash
railway run psql $DATABASE_URL < backup.sql
```

3. **Verify restoration:**
```bash
railway run psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"User\";"
```

4. **Test critical paths:**
   - Login
   - Create target
   - Create finding

### Security Breach

1. **Immediate actions:**
   - Rotate all secrets (NEXTAUTH_SECRET, PUSHER_SECRET)
   - Change all admin passwords
   - Review activity logs
   - Check for unauthorized access

2. **Investigation:**
   - Review all ActivityLogs
   - Check database for unauthorized changes
   - Review user accounts

3. **Communication:**
   - Notify affected users
   - Document incident
   - Update security measures

---

**🛡️ Keep your BASE44 instance secure and running smoothly!**
