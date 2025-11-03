# 📦 Base44 - Installation Guide

Complete step-by-step installation guide for Base44.

---

## 📋 Prerequisites

### Required Software

1. **Node.js** (v18.0.0 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **npm** (comes with Node.js) or **yarn** or **pnpm**
   - Verify: `npm --version`

3. **PostgreSQL** (v14.0 or higher)
   - Download: https://www.postgresql.org/download/
   - Verify: `psql --version`

4. **Git**
   - Download: https://git-scm.com/
   - Verify: `git --version`

---

## 🚀 Installation Steps

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/base44.git
cd base44
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

This will install all required packages (~300 MB).

### Step 3: Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Example for local development:
DATABASE_URL="postgresql://postgres:password@localhost:5432/base44"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-min-32-characters"

# Generate secret with:
# openssl rand -base64 32
```

### Step 4: Create PostgreSQL Database

#### Option A: Using psql

```bash
psql -U postgres

CREATE DATABASE base44;
\q
```

#### Option B: Using GUI (pgAdmin, TablePlus, etc.)

Create a new database named `base44`.

### Step 5: Set Up Prisma

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

### Step 6: Seed the Database

```bash
npx prisma db seed
```

This will create:
- 3 test companies
- 9 test users (3 per company)
- Sample pentests, targets, findings
- Templates (ADMIN only)

### Step 7: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Test Accounts

After seeding, you can login with:

### Company 1: TechCorp

**ADMIN:**
- Email: `admin@base44.com`
- Password: `admin123`

**PENTESTER:**
- Email: `pentester@base44.com`
- Password: `pentester123`

**CLIENT:**
- Email: `client@base44.com`
- Password: `client123`

### Company 2: SecureNet

**ADMIN:**
- Email: `admin@securenet.com`
- Password: `admin123`

**PENTESTER:**
- Email: `pentester@securenet.com`
- Password: `pentester123`

**CLIENT:**
- Email: `client@securenet.com`
- Password: `client123`

---

## 🔧 Troubleshooting

### Database Connection Issues

**Error**: `Can't reach database server`

**Solutions**:
1. Check PostgreSQL is running:
   ```bash
   # macOS/Linux
   sudo service postgresql status
   
   # Windows
   # Check Services app
   ```

2. Verify DATABASE_URL in `.env`
3. Check PostgreSQL port (default: 5432)
4. Verify credentials

### Prisma Issues

**Error**: `Environment variable not found: DATABASE_URL`

**Solution**: Make sure `.env` exists and contains DATABASE_URL

**Error**: `Prisma schema validation failed`

**Solution**: 
```bash
npx prisma format
npx prisma validate
```

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solutions**:
1. Kill process:
   ```bash
   # Find process
   lsof -i :3000
   
   # Kill it
   kill -9 <PID>
   ```

2. Or use different port:
   ```bash
   PORT=3001 npm run dev
   ```

### Module Not Found

**Error**: `Cannot find module...`

**Solution**:
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

---

## 📦 Additional Setup

### File Uploads (Optional)

Base44 supports file uploads for evidence/screenshots.

**Option 1: Local Storage** (Default)
- Files stored in `/public/uploads`
- Not recommended for production

**Option 2: Cloud Storage**
- Uploadcare (recommended)
- Cloudinary
- AWS S3

Add to `.env`:
```env
UPLOADCARE_PUBLIC_KEY="your_public_key"
UPLOADCARE_SECRET_KEY="your_secret_key"
```

### Email Notifications (Optional)

For email notifications, add SMTP configuration:

```env
EMAIL_SERVER="smtp://user:password@smtp.provider.com:587"
EMAIL_FROM="noreply@base44.com"
```

---

## 🔄 Database Migrations

### Reset Database

```bash
# WARNING: This will delete all data
npx prisma migrate reset
```

### Update Schema

```bash
# After modifying schema.prisma
npx prisma db push

# Or create migration
npx prisma migrate dev --name your_migration_name
```

---

## ✅ Verification

After installation, verify everything works:

1. ✅ Visit http://localhost:3000
2. ✅ Login with test account
3. ✅ View dashboard
4. ✅ Create a pentest
5. ✅ Create a finding
6. ✅ Add a comment
7. ✅ Generate a report

---

## 📚 Next Steps

- [Deployment Guide](DEPLOYMENT.md)
- [API Documentation](API_DOCUMENTATION.md)
- [Architecture Overview](ARCHITECTURE.md)

---

## 🆘 Support

If you encounter issues:

1. Check [Troubleshooting](#troubleshooting) section
2. Search [GitHub Issues](https://github.com/your-username/base44/issues)
3. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details

---

**Installation Time**: ~10-15 minutes  
**Date**: November 2, 2025  
**Version**: 1.0.0
