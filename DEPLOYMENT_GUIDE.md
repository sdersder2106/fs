# 🚀 GUIDE DE DÉPLOIEMENT : SUPABASE + VERCEL

## 📋 Table des Matières
1. [Configuration Supabase](#1-configuration-supabase)
2. [Préparation du Projet](#2-préparation-du-projet)
3. [Déploiement sur Vercel](#3-déploiement-sur-vercel)
4. [Configuration Post-Déploiement](#4-configuration-post-déploiement)
5. [Troubleshooting](#5-troubleshooting)

---

## 1. CONFIGURATION SUPABASE 🗄️

### Étape 1.1 : Créer un compte Supabase
1. Allez sur [https://supabase.com](https://supabase.com)
2. Cliquez sur **"Start your project"**
3. Connectez-vous avec GitHub (recommandé) ou email

### Étape 1.2 : Créer un nouveau projet
1. Cliquez sur **"New project"**
2. Configurez votre projet :
   ```
   Name: base44-prod
   Database Password: [Générez un mot de passe fort]
   Region: Choisissez la plus proche (ex: eu-west-1 pour Europe)
   Pricing Plan: Free tier (pour commencer)
   ```
3. **IMPORTANT** : Sauvegardez le mot de passe de la database !
4. Cliquez sur **"Create new project"** (prend 2-3 minutes)

### Étape 1.3 : Récupérer les credentials
Une fois le projet créé :

1. Allez dans **Settings** → **Database**
2. Trouvez la section **Connection string**
3. Copiez le **Connection string** → **URI** :
   ```
   postgresql://postgres.[your-project-ref]:[your-password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

4. **IMPORTANT** : Modifiez l'URL pour Prisma :
   - Changez le port de `6543` à `5432`
   - Ajoutez `?pgbouncer=true&connection_limit=1` à la fin
   
   **URL finale pour Prisma :**
   ```
   postgresql://postgres.[your-project-ref]:[your-password]@aws-0-[region].pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1
   ```

5. Pour la **DIRECT_URL** (migrations), dans Settings → Database :
   ```
   postgresql://postgres:[your-password]@db.[your-project-ref].supabase.co:5432/postgres
   ```

### Étape 1.4 : Configurer le pooling
1. Dans Supabase, allez dans **Settings** → **Database**
2. Activez **"Connection Pooling"** si ce n'est pas déjà fait
3. Mode : **Transaction** (pour Prisma)

---

## 2. PRÉPARATION DU PROJET 📦

### Étape 2.1 : Modifier schema.prisma pour Supabase

Créez/modifiez `prisma/schema.prisma` :

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ... rest of your schema remains the same
```

### Étape 2.2 : Créer les variables d'environnement

Créez `.env.production` :

```env
# Supabase Database URLs
DATABASE_URL="postgresql://postgres.[your-project-ref]:[your-password]@aws-0-[region].pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[your-password]@db.[your-project-ref].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="https://your-app-name.vercel.app"
NEXTAUTH_SECRET="[generate-with-openssl-rand-base64-32]"

# Application
APP_URL="https://your-app-name.vercel.app"
APP_NAME="Base44 Security Platform"
APP_ENV="production"
```

### Étape 2.3 : Préparer le déploiement

1. **Installer les dépendances Vercel** :
   ```bash
   npm install -g vercel
   ```

2. **Modifier package.json** pour la production :
   ```json
   {
     "scripts": {
       "build": "prisma generate && next build",
       "vercel-build": "prisma generate && prisma db push && next build",
       "postinstall": "prisma generate"
     }
   }
   ```

3. **Créer vercel.json** à la racine :
   ```json
   {
     "buildCommand": "npm run vercel-build",
     "outputDirectory": ".next",
     "framework": "nextjs",
     "installCommand": "npm install",
     "env": {
       "DATABASE_URL": "@database_url",
       "DIRECT_URL": "@direct_url",
       "NEXTAUTH_SECRET": "@nextauth_secret"
     }
   }
   ```

### Étape 2.4 : Adapter pour Vercel (sans WebSocket)

**IMPORTANT** : Vercel ne supporte pas les WebSockets. Créez `app/api/socket/route.ts` pour polling fallback :

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Fallback to polling for notifications
  return NextResponse.json({
    message: 'WebSocket not supported on Vercel. Using polling.',
    fallback: true
  });
}
```

Modifiez `hooks/useWebSocket.tsx` pour supporter le polling :

```typescript
// Add polling fallback when WebSocket is not available
const POLLING_INTERVAL = 5000; // 5 seconds

// In useWebSocket hook, add:
useEffect(() => {
  if (!socket && session?.user) {
    // Fallback to polling
    const interval = setInterval(() => {
      loadNotifications();
    }, POLLING_INTERVAL);
    
    return () => clearInterval(interval);
  }
}, [socket, session]);
```

---

## 3. DÉPLOIEMENT SUR VERCEL 🚀

### Étape 3.1 : Préparer le repository GitHub

1. **Créez un nouveau repo GitHub** :
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Base44 Security Platform"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/base44.git
   git push -u origin main
   ```

2. **Assurez-vous que ces fichiers sont dans .gitignore** :
   ```
   .env
   .env.local
   .env.production
   node_modules/
   .next/
   ```

### Étape 3.2 : Connecter Vercel

1. Allez sur [https://vercel.com](https://vercel.com)
2. Connectez-vous avec GitHub
3. Cliquez sur **"New Project"**
4. Importez votre repository `base44`
5. **Framework Preset** : Next.js (auto-détecté)

### Étape 3.3 : Configurer les variables d'environnement

Dans Vercel, avant de déployer :

1. Dans **Environment Variables**, ajoutez :

   | Key | Value | Environment |
   |-----|-------|-------------|
   | `DATABASE_URL` | `postgresql://...` (avec pooling) | Production |
   | `DIRECT_URL` | `postgresql://...` (direct) | Production |
   | `NEXTAUTH_URL` | `https://[your-app].vercel.app` | Production |
   | `NEXTAUTH_SECRET` | `[your-secret-32-chars]` | Production |
   | `NODE_ENV` | `production` | Production |

2. **Générer NEXTAUTH_SECRET** :
   ```bash
   openssl rand -base64 32
   ```

### Étape 3.4 : Déployer

1. Cliquez sur **"Deploy"**
2. Vercel va :
   - Installer les dépendances
   - Générer Prisma Client
   - Pousser le schema vers Supabase
   - Builder l'application Next.js
   - Déployer

3. **Attendez 3-5 minutes** pour le premier déploiement

---

## 4. CONFIGURATION POST-DÉPLOIEMENT 🔧

### Étape 4.1 : Initialiser la database

1. **Via Vercel CLI** :
   ```bash
   vercel env pull .env.local
   npx prisma db push
   npx prisma db seed
   ```

2. **Ou via Supabase SQL Editor** :
   - Allez dans Supabase → SQL Editor
   - Exécutez le schema Prisma manuellement
   - Insérez les données de seed

### Étape 4.2 : Vérifier le déploiement

1. Visitez `https://[your-app].vercel.app`
2. Testez la connexion avec les comptes par défaut
3. Vérifiez la console pour les erreurs

### Étape 4.3 : Configurer le domaine personnalisé (optionnel)

1. Dans Vercel → Settings → Domains
2. Ajoutez votre domaine : `app.yourcompany.com`
3. Configurez les DNS selon les instructions Vercel
4. Mettez à jour `NEXTAUTH_URL` avec le nouveau domaine

### Étape 4.4 : Monitoring et Logs

1. **Vercel Analytics** : Activez dans le dashboard Vercel
2. **Logs** : Vercel → Functions → Logs
3. **Supabase Logs** : Supabase → Logs → API

---

## 5. TROUBLESHOOTING 🔧

### Problème : "Connection timeout" avec Supabase

**Solution** :
```env
DATABASE_URL="postgresql://...?pgbouncer=true&connection_limit=1&connect_timeout=60"
```

### Problème : "Prisma Client not generated"

**Solution** :
```json
// package.json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Problème : "Too many connections"

**Solution** :
1. Utilisez connection pooling
2. Ajoutez dans `lib/prisma.ts` :
```typescript
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
```

### Problème : "NEXTAUTH_URL mismatch"

**Solution** :
- Vérifiez que `NEXTAUTH_URL` correspond exactement à votre URL Vercel
- Incluez `https://` et pas de trailing slash

### Problème : WebSocket non supporté

**Solution** : Utilisez le polling comme fallback (déjà configuré)

---

## 6. COMMANDES UTILES 📝

### Migration de la database
```bash
# Développement local
npx prisma migrate dev

# Production (Supabase)
npx prisma db push

# Reset database
npx prisma migrate reset

# Seed database
npx prisma db seed
```

### Déploiement Vercel
```bash
# Deploy preview
vercel

# Deploy production
vercel --prod

# Check logs
vercel logs

# List environment variables
vercel env ls
```

### Monitoring Supabase
```sql
-- Check connections
SELECT count(*) FROM pg_stat_activity;

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 7. CHECKLIST DE DÉPLOIEMENT ✅

- [ ] Compte Supabase créé
- [ ] Projet Supabase configuré
- [ ] Connection string récupérée
- [ ] Variables d'environnement configurées
- [ ] Repository GitHub créé
- [ ] Code pushé sur GitHub
- [ ] Projet importé dans Vercel
- [ ] Variables d'environnement ajoutées dans Vercel
- [ ] Déploiement réussi
- [ ] Database initialisée avec seed
- [ ] Tests de connexion réussis
- [ ] Monitoring activé

---

## 8. OPTIMISATIONS PRODUCTION 🎯

### Performance
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['your-supabase-project.supabase.co'],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
}
```

### Sécurité
```env
# Additional security headers
SECURE_HEADERS_POLICY="strict"
CSP_POLICY="default-src 'self'"
```

### Cache
```typescript
// API responses
res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');
```

---

## 9. COÛTS ESTIMÉS 💰

| Service | Free Tier | Limites |
|---------|-----------|---------|
| **Supabase** | ✅ Gratuit | 500MB DB, 2GB bandwidth |
| **Vercel** | ✅ Gratuit | 100GB bandwidth, 100h functions |
| **Total** | **$0/mois** | Pour < 10 users |

Pour production scale :
- Supabase Pro : $25/mois
- Vercel Pro : $20/mois

---

## SUPPORT 🆘

- **Supabase Discord** : https://discord.supabase.com
- **Vercel Discord** : https://vercel.com/discord
- **Documentation** : 
  - Supabase : https://supabase.com/docs
  - Vercel : https://vercel.com/docs

---

**Votre application Base44 est maintenant prête pour la production !** 🎉