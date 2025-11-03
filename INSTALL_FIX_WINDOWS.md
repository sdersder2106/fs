# 🔧 FIX INSTALLATION - BASE44

## ❌ PROBLÈME IDENTIFIÉ
Conflit de dépendances avec `nodemailer`. NextAuth nécessite une version spécifique qui entre en conflit.

## ✅ SOLUTIONS

### Solution 1: Installation avec --legacy-peer-deps (RECOMMANDÉ)

```powershell
# Dans PowerShell, exécutez :
npm install --legacy-peer-deps
```

### Solution 2: Installation avec --force

```powershell
# Si la solution 1 ne fonctionne pas :
npm install --force
```

### Solution 3: Installation manuelle sans nodemailer

```powershell
# 1. Nettoyer le cache npm
npm cache clean --force

# 2. Supprimer node_modules et package-lock
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# 3. Installer avec legacy-peer-deps
npm install --legacy-peer-deps
```

### Solution 4: Utiliser Yarn (Alternative)

```powershell
# Installer Yarn si pas déjà fait
npm install -g yarn

# Installer les dépendances avec Yarn
yarn install
```

## 📧 CONFIGURATION EMAIL (OPTIONNEL)

Comme `nodemailer` pose problème et n'est pas essentiel pour le fonctionnement de base, vous pouvez :

### Option A: Désactiver les emails temporairement
Dans `.env.local` :
```env
# Laisser vide pour désactiver
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASSWORD=""
```

### Option B: Utiliser un service d'email moderne
Après l'installation de base, vous pouvez ajouter Resend ou SendGrid :

```powershell
# Pour Resend (recommandé)
npm install resend --legacy-peer-deps

# Pour SendGrid
npm install @sendgrid/mail --legacy-peer-deps
```

## 🚀 ÉTAPES COMPLÈTES D'INSTALLATION

```powershell
# 1. Nettoyer (si nécessaire)
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# 2. Installer
npm install --legacy-peer-deps

# 3. Générer Prisma Client
npx prisma generate

# 4. Configurer .env.local
Copy-Item .env.local.example .env.local
notepad .env.local

# 5. Configurer la base de données
npx prisma db push

# 6. Seeder la base (optionnel)
npx prisma db seed

# 7. Lancer l'application
npm run dev
```

## 🎯 VÉRIFICATION

Après l'installation :

```powershell
# Vérifier que tout est installé
npm list --depth=0

# Vérifier Prisma
npx prisma --version

# Lancer en dev
npm run dev
```

L'application devrait être accessible sur : http://localhost:3000

## ⚠️ NOTES IMPORTANTES

1. **`--legacy-peer-deps`** : Utilise l'ancien algorithme de résolution des dépendances, compatible avec plus de configurations.

2. **Email non critique** : Le système fonctionne sans service email. Les notifications utilisent WebSocket/polling en temps réel.

3. **Windows Defender** : Peut ralentir l'installation. Ajoutez une exception pour le dossier du projet si nécessaire.

## 📝 COMMANDES UTILES WINDOWS

```powershell
# Voir les logs npm
Get-Content $env:APPDATA\npm-cache\_logs\*-debug-0.log -Tail 50

# Nettoyer le cache npm
npm cache clean --force

# Vérifier les ports utilisés
netstat -an | findstr :3000
netstat -an | findstr :5432

# Tuer un process sur le port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

## 🆘 SI TOUJOURS DES PROBLÈMES

1. **Essayez avec npm 8.x** :
```powershell
npm install -g npm@8
```

2. **Utilisez nvm-windows** pour gérer les versions Node :
- Téléchargez depuis : https://github.com/coreybutler/nvm-windows
- Installez Node 18 LTS : `nvm install 18.19.0`
- Utilisez : `nvm use 18.19.0`

3. **Dernier recours** - Installation minimale :
```powershell
# Installer seulement les dépendances critiques
npm install next react react-dom --save
npm install @prisma/client prisma --save
npm install next-auth @next-auth/prisma-adapter --save --legacy-peer-deps
# Puis le reste une par une...
```

---

**L'erreur est normale et peut être contournée avec `--legacy-peer-deps` !** ✅