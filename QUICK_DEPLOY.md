# 🚀 DÉPLOIEMENT RAPIDE : BASE44 SUR SUPABASE + VERCEL

## COPIER-COLLER LES COMMANDES

### 1️⃣ SUPABASE - Configuration Database (5 min)

```bash
# Après avoir créé votre projet Supabase...

# 1. Cloner et entrer dans le projet
git clone [YOUR-REPO-URL]
cd base44

# 2. Installer les dépendances
npm install

# 3. Copier et configurer les variables
cp .env.production.example .env.production
nano .env.production  # ou code .env.production

# 4. Exporter les variables
source .env.production

# 5. Pousser le schema vers Supabase
npx prisma db push

# 6. Seeder la database (optionnel)
npx prisma db seed
```

### 2️⃣ VERCEL - Déploiement (3 min)

```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Login à Vercel
vercel login

# 3. Lier le projet
vercel link

# 4. Ajouter les variables d'environnement
vercel env add DATABASE_URL production
vercel env add DIRECT_URL production
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production

# 5. Déployer en production
vercel --prod
```

### 3️⃣ VARIABLES À CONFIGURER

#### Dans Supabase Dashboard → Settings → Database :

```env
# Connection pooler (Transaction mode)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1"

# Direct connection
DIRECT_URL="postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres"
```

#### Générer le secret NextAuth :

```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### 4️⃣ VÉRIFICATION POST-DÉPLOIEMENT

```bash
# 1. Vérifier le déploiement
open https://[your-app].vercel.app

# 2. Tester la connexion
# Email: admin@techcorp.com
# Password: Admin123!

# 3. Vérifier les logs
vercel logs --follow

# 4. Monitorer la database
npx prisma studio
```

---

## 🎯 CHECKLIST RAPIDE

- [ ] **Supabase**
  - [ ] Projet créé
  - [ ] Password sauvegardé
  - [ ] Connection pooling activé
  - [ ] URLs copiées

- [ ] **Variables (.env.production)**
  - [ ] DATABASE_URL configurée
  - [ ] DIRECT_URL configurée
  - [ ] NEXTAUTH_URL = https://[app].vercel.app
  - [ ] NEXTAUTH_SECRET généré (32 chars)

- [ ] **GitHub**
  - [ ] Repository créé
  - [ ] Code pushé
  - [ ] .env files dans .gitignore

- [ ] **Vercel**
  - [ ] Projet importé
  - [ ] Variables ajoutées
  - [ ] Déploiement réussi
  - [ ] Domaine personnalisé (optionnel)

- [ ] **Tests**
  - [ ] Page login accessible
  - [ ] Connexion fonctionnelle
  - [ ] Dashboard chargé
  - [ ] CRUD operations OK

---

## 🔧 COMMANDES UTILES

```bash
# Database
npx prisma studio          # GUI pour la DB
npx prisma db push         # Update schema
npx prisma migrate reset   # Reset complet

# Vercel
vercel --prod             # Deploy production
vercel env ls            # Lister les variables
vercel logs --follow     # Voir les logs
vercel domains add       # Ajouter domaine

# Monitoring
npm run build           # Test build local
npm run type-check     # Check TypeScript
```

---

## ⚠️ ERREURS COMMUNES

### "Too many database connections"
```env
DATABASE_URL="...?pgbouncer=true&connection_limit=1"
```

### "NEXTAUTH_URL Mismatch"
```env
NEXTAUTH_URL="https://exact-vercel-url.vercel.app"  # Sans / à la fin
```

### "Prisma Client not generated"
```json
// package.json
"postinstall": "prisma generate"
```

### "Build failed on Vercel"
```json
// package.json
"vercel-build": "prisma generate && prisma db push && next build"
```

---

## 📞 SUPPORT

- 💬 **Supabase Discord** : https://discord.supabase.com
- 💬 **Vercel Discord** : https://vercel.com/discord
- 📖 **Prisma Docs** : https://www.prisma.io/docs
- 🐛 **Debug** : `vercel logs` + Supabase Logs

---

**Temps total de déploiement : ~10 minutes** ⏱️