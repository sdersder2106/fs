# 🚀 GUIDE DE DÉPLOIEMENT RAILWAY - BASE44

## 📋 Vue d'ensemble

Ce guide vous accompagne pas à pas pour déployer BASE44 sur Railway en production.

---

## 🎯 Prérequis

- [ ] Compte GitHub
- [ ] Compte Railway (gratuit)
- [ ] Compte Pusher (gratuit)
- [ ] Code BASE44 prêt

---

## 📦 ÉTAPE 1 : Préparation du Code

### 1.1 Initialiser Git Repository

```bash
cd base44

# Initialiser git
git init

# Créer .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnpm-store/

# Next.js
.next/
out/
build/
dist/

# Environment variables
.env
.env*.local
.env.production

# Database
*.db
*.db-journal

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Testing
coverage/
.nyc_output/

# Misc
.vercel
.turbo
EOF

# Premier commit
git add .
git commit -m "Initial commit - BASE44 Security Audit Platform"
```

### 1.2 Créer Repository GitHub

1. Aller sur https://github.com/new
2. Nom du repo : `base44`
3. Description : `Professional Security Audit Platform`
4. Visibilité : Private (recommandé)
5. Cliquer "Create repository"

### 1.3 Push vers GitHub

```bash
# Remplacer YOUR_USERNAME par votre username GitHub
git remote add origin https://github.com/YOUR_USERNAME/base44.git
git branch -M main
git push -u origin main
```

✅ **Votre code est maintenant sur GitHub !**

---

## 🔧 ÉTAPE 2 : Configuration Pusher

### 2.1 Créer compte Pusher

1. Aller sur https://pusher.com
2. Cliquer "Sign up" (gratuit)
3. Créer un compte avec votre email

### 2.2 Créer une App Channels

1. Dans le dashboard, cliquer "Create app"
2. Nom : `base44-production`
3. Cluster : **Choisir le plus proche** (eu, us-east-1, ap-southeast-1, etc.)
4. Tech stack : 
   - Frontend : React
   - Backend : Node
5. Cliquer "Create app"

### 2.3 Récupérer les Credentials

Dans votre app Pusher, aller dans "App Keys" :

```
App ID: 123456
Key: 1a2b3c4d5e6f7g8h9i0j
Secret: a1b2c3d4e5f6g7h8i9j0
Cluster: eu
```

**⚠️ Notez ces valeurs, vous en aurez besoin !**

### 2.4 Tester Pusher (Optionnel)

Dans l'onglet "Debug Console" de Pusher, vous pourrez voir les événements en temps réel.

---

## 🚂 ÉTAPE 3 : Déploiement sur Railway

### 3.1 Créer compte Railway

1. Aller sur https://railway.app
2. Cliquer "Login" puis "Login with GitHub"
3. Autoriser Railway à accéder à vos repos

### 3.2 Créer un nouveau Projet

1. Dans Railway, cliquer "New Project"
2. Sélectionner "Deploy from GitHub repo"
3. Choisir votre repo `base44`
4. Railway va détecter automatiquement Next.js ✅

### 3.3 Ajouter PostgreSQL Database

1. Dans votre projet Railway, cliquer "+ New"
2. Sélectionner "Database" → "Add PostgreSQL"
3. Railway va créer automatiquement la database
4. ✅ La variable `DATABASE_URL` sera configurée automatiquement !

### 3.4 Configurer les Variables d'Environnement

Dans votre projet Railway :

1. Cliquer sur votre service Next.js
2. Aller dans l'onglet "Variables"
3. Ajouter les variables suivantes :

#### **Variables Obligatoires :**

```bash
# Database (déjà configurée automatiquement par Railway)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# NextAuth
NEXTAUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}
NEXTAUTH_SECRET=<générer-un-secret>

# Pusher (récupéré de l'étape 2.3)
PUSHER_APP_ID=123456
NEXT_PUBLIC_PUSHER_KEY=1a2b3c4d5e6f7g8h9i0j
PUSHER_SECRET=a1b2c3d4e5f6g7h8i9j0
NEXT_PUBLIC_PUSHER_CLUSTER=eu

# Node Environment
NODE_ENV=production
```

#### **Comment générer NEXTAUTH_SECRET :**

Option 1 - OpenSSL (sur votre machine) :
```bash
openssl rand -base64 32
```

Option 2 - Online :
```
Aller sur : https://generate-secret.vercel.app/32
```

Copier le résultat et le coller dans `NEXTAUTH_SECRET`

### 3.5 Configuration Build

Railway devrait détecter automatiquement, mais vérifiez :

**Build Command :**
```bash
npm run build
```

**Start Command :**
```bash
npm start
```

**Install Command :**
```bash
npm install
```

---

## 🗄️ ÉTAPE 4 : Initialiser la Database

### 4.1 Générer et Appliquer les Migrations

Railway va build automatiquement. Après le premier deploy :

1. Dans Railway, cliquer sur votre service
2. Aller dans l'onglet "Deployments"
3. Attendre que le build soit vert ✅
4. Copier l'URL de votre app (ex: `base44-production.up.railway.app`)

### 4.2 Accéder à la Console Railway

Dans votre projet Railway :

1. Cliquer sur le service PostgreSQL
2. Aller dans "Data" → "PostgreSQL Shell" (ou utiliser le CLI)

Ou installer Railway CLI sur votre machine :

```bash
# Installer Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link vers votre projet
railway link

# Exécuter les migrations
railway run npx prisma migrate deploy

# Seed la database (données de test)
railway run npm run prisma:seed
```

### 4.3 Alternative - Variables d'environnement locales

Si vous voulez exécuter depuis votre machine :

1. Dans Railway, service PostgreSQL, copier la `DATABASE_URL`
2. Sur votre machine :

```bash
# Créer .env.production
DATABASE_URL="postgresql://postgres:..."

# Exécuter migrations
npx prisma migrate deploy --schema=./prisma/schema.prisma

# Seed
npm run prisma:seed
```

---

## ✅ ÉTAPE 5 : Vérification du Déploiement

### 5.1 Tester l'Application

1. Ouvrir votre URL Railway : `https://base44-production.up.railway.app`
2. La page de login devrait s'afficher ✅

### 5.2 Se Connecter

Utiliser les credentials de test (créés par le seed) :

```
Admin:
📧 admin@base44.com
🔑 Admin123!

Auditor:
📧 auditor@base44.com
🔑 Admin123!

Client:
📧 client@base44.com
🔑 Admin123!
```

### 5.3 Checklist de Vérification

- [ ] Login fonctionne
- [ ] Dashboard affiche les données
- [ ] Peut créer un target
- [ ] Peut créer un pentest
- [ ] Peut créer un finding
- [ ] Comments fonctionnent
- [ ] Pusher connecté (check console)
- [ ] Dark/Light mode fonctionne
- [ ] Responsive sur mobile

---

## 🔧 ÉTAPE 6 : Configuration Post-Déploiement

### 6.1 Configurer un Domaine Personnalisé (Optionnel)

Dans Railway :

1. Service Next.js → "Settings"
2. Section "Domains"
3. Cliquer "Add Domain"
4. Option 1 : Utiliser `*.up.railway.app` (gratuit)
5. Option 2 : Ajouter votre propre domaine
   - Ajouter `yourdomain.com`
   - Configurer CNAME chez votre registrar
   - Pointer vers Railway

### 6.2 Activer HTTPS

✅ Railway active automatiquement HTTPS avec certificat SSL gratuit !

### 6.3 Configurer les Notifications Email (Optionnel)

Pour envoyer des emails (invitations, reset password) :

1. Créer compte sur SendGrid / Resend / Mailgun
2. Ajouter variables dans Railway :

```bash
EMAIL_SERVER_HOST=smtp.sendgrid.net
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=apikey
EMAIL_SERVER_PASSWORD=<votre-api-key>
EMAIL_FROM=noreply@yourdomain.com
```

3. Décommenter le code email dans `lib/email.ts`

---

## 📊 ÉTAPE 7 : Monitoring & Maintenance

### 7.1 Logs Railway

Voir les logs en temps réel :

1. Railway → Votre service → "Deployments"
2. Cliquer sur "View Logs"
3. Voir les erreurs et requêtes

Ou avec CLI :
```bash
railway logs
```

### 7.2 Monitoring Database

1. Railway → PostgreSQL → "Metrics"
2. Voir l'utilisation :
   - Connexions
   - Storage
   - CPU
   - Memory

### 7.3 Pusher Monitoring

1. Dashboard Pusher → Votre app
2. "Overview" : voir les connexions actives
3. "Debug Console" : voir les événements en temps réel

### 7.4 Sauvegardes Database

Railway fait des backups automatiques, mais vous pouvez aussi :

```bash
# Backup manuel
railway run pg_dump $DATABASE_URL > backup.sql

# Restore
railway run psql $DATABASE_URL < backup.sql
```

---

## 🚀 ÉTAPE 8 : Scaling & Performance

### 8.1 Scaling Railway

Railway scale automatiquement, mais vous pouvez :

1. Service → "Settings" → "Resource Limits"
2. Ajuster :
   - CPU
   - Memory
   - Storage

### 8.2 Optimisations Next.js

Déjà implémentées dans BASE44 :
- ✅ Server Components
- ✅ Code splitting
- ✅ Image optimization (ready)
- ✅ Font optimization
- ✅ API route caching (ready)

### 8.3 Database Optimizations

Déjà implémentées :
- ✅ Indexes sur colonnes clés
- ✅ Relations optimisées
- ✅ Queries sélectives (select specific fields)
- ✅ Pagination

---

## 🔒 ÉTAPE 9 : Sécurité Production

### 9.1 Checklist Sécurité

- [x] HTTPS activé (automatique Railway)
- [x] Environment variables sécurisées
- [x] NEXTAUTH_SECRET unique et fort
- [x] Database password fort (automatique Railway)
- [x] CORS configuré
- [x] Rate limiting (à implémenter si besoin)
- [x] Input validation (Zod partout)
- [x] XSS protection (Next.js automatique)
- [x] SQL injection protection (Prisma)

### 9.2 Headers de Sécurité

Ajouter dans `next.config.js` :

```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

### 9.3 Changer les Passwords par Défaut

**IMPORTANT** : Après le premier déploiement :

1. Se connecter avec admin@base44.com
2. Aller dans Settings → Security
3. Changer le password
4. Faire de même pour les autres comptes
5. Ou supprimer les comptes de test et créer de vrais utilisateurs

---

## 📈 ÉTAPE 10 : Analytics (Optionnel)

### 10.1 Google Analytics

1. Créer compte Google Analytics
2. Ajouter tracking ID dans Railway variables :

```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

3. Créer `lib/analytics.ts` (voir code d'exemple)

### 10.2 Sentry (Error Tracking)

Pour tracker les erreurs en production :

1. Créer compte sur sentry.io
2. Installer :
```bash
npm install @sentry/nextjs
```

3. Ajouter DSN dans variables Railway
4. Configurer `sentry.client.config.js`

---

## 🎉 FÉLICITATIONS !

Votre application BASE44 est maintenant **LIVE en PRODUCTION** ! 🚀

### ✅ Ce qui fonctionne :

- ✅ Application accessible publiquement
- ✅ HTTPS activé automatiquement
- ✅ Database PostgreSQL configurée
- ✅ Real-time avec Pusher
- ✅ Authentication fonctionnelle
- ✅ Toutes les features opérationnelles
- ✅ Monitoring actif
- ✅ Backups automatiques

### 🔗 Liens Utiles :

- **Application** : https://base44-production.up.railway.app
- **Railway Dashboard** : https://railway.app/project/your-project
- **Pusher Dashboard** : https://dashboard.pusher.com
- **GitHub Repo** : https://github.com/YOUR_USERNAME/base44

---

## 🆘 Troubleshooting

### Build échoue ?

```bash
# Vérifier les logs
railway logs

# Problème commun : node version
# Ajouter dans package.json :
"engines": {
  "node": ">=18.0.0"
}
```

### Database connection error ?

- Vérifier que `DATABASE_URL` est bien configurée
- Railway devrait la configurer automatiquement
- Vérifier dans "Variables" du service

### Pusher ne se connecte pas ?

- Vérifier PUSHER_APP_ID, KEY, SECRET, CLUSTER
- Vérifier dans console browser (F12) les erreurs
- Tester dans Pusher Debug Console

### Page blanche après déploiement ?

- Vérifier les logs : `railway logs`
- Vérifier que `NEXTAUTH_URL` = votre domain Railway
- Vérifier que migrations sont appliquées

---

## 📞 Support

- **Railway** : https://railway.app/help
- **Pusher** : https://support.pusher.com
- **Next.js** : https://nextjs.org/docs

---

**🎊 Votre application BASE44 est maintenant en production ! Bon succès ! 🚀**
