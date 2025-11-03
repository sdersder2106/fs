# 📋 BASE44 - GUIDE DE DÉMARRAGE COMPLET

## ✅ CHECKLIST DE CONFIGURATION

### 1. 🔧 **Prérequis Système**
- [ ] Node.js 18+ installé
- [ ] PostgreSQL 14+ installé et démarré
- [ ] Git installé
- [ ] Un éditeur de code (VS Code recommandé)

### 2. 📦 **Installation**

```bash
# Cloner le projet (ou extraire l'archive)
cd base44

# Installer les dépendances
npm install

# Si erreurs, forcer la résolution
npm install --force
```

### 3. 🗄️ **Configuration Base de Données**

#### Option A : PostgreSQL Local
```bash
# Sur macOS avec Homebrew
brew install postgresql
brew services start postgresql

# Sur Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Sur Windows
# Télécharger depuis https://www.postgresql.org/download/windows/
```

#### Créer la base de données
```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE base44;
CREATE USER base44user WITH PASSWORD 'base44pass';
GRANT ALL PRIVILEGES ON DATABASE base44 TO base44user;
\q
```

### 4. 🔐 **Configuration Environnement**

```bash
# Copier le fichier d'exemple
cp .env.local.example .env.local

# Éditer .env.local
nano .env.local  # ou vim, code, etc.
```

**Configuration minimale requise dans `.env.local`:**
```env
# Base de données (OBLIGATOIRE)
DATABASE_URL="postgresql://base44user:base44pass@localhost:5432/base44?schema=public"

# NextAuth (OBLIGATOIRE)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="changeme-32-caracteres-minimum-ici"

# Email (optionnel pour démarrer)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_FROM="noreply@base44.local"
```

**Générer NEXTAUTH_SECRET:**
```bash
# Linux/Mac
openssl rand -base64 32

# Ou avec Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 5. 🗂️ **Initialisation Base de Données**

```bash
# Générer le client Prisma
npx prisma generate

# Pousser le schéma vers la base
npx prisma db push

# Lancer le seed avec les données de test
npx prisma db seed

# Vérifier avec Prisma Studio (optionnel)
npx prisma studio
```

### 6. 🚀 **Démarrage de l'Application**

```bash
# Mode développement
npm run dev

# L'application sera disponible sur
# http://localhost:3000
```

## 👤 **COMPTES DE TEST**

Après le seed, ces comptes sont disponibles :

### Company: TechCorp Solutions

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **ADMIN** | admin@techcorp.com | Admin123! | Accès total |
| **PENTESTER** | pentester@techcorp.com | Pentester123! | Créer/éditer pentests |
| **AUDITOR** | auditor@techcorp.com | Auditor123! | Lecture + commentaires |
| **CLIENT** | client@techcorp.com | Client123! | Lecture seule |

### Company: CyberSec Inc

| Role | Email | Password |
|------|-------|----------|
| **ADMIN** | admin@cybersec.com | Admin123! |
| **PENTESTER** | pentester@cybersec.com | Pentester123! |

## 🧪 **VÉRIFICATION DE L'INSTALLATION**

### Test 1 : Page de connexion
1. Ouvrir http://localhost:3000
2. Vous devez voir la page de login

### Test 2 : Connexion
1. Utiliser admin@techcorp.com / Admin123!
2. Vous devez arriver sur le dashboard

### Test 3 : Navigation
- Dashboard : http://localhost:3000/dashboard
- Pentests : http://localhost:3000/dashboard/pentests
- Targets : http://localhost:3000/dashboard/targets
- Findings : http://localhost:3000/dashboard/findings

## ❌ **TROUBLESHOOTING**

### Erreur : "Cannot find module '@prisma/client'"
```bash
npx prisma generate
npm install
```

### Erreur : "Database connection failed"
```bash
# Vérifier PostgreSQL
pg_isready

# Vérifier les credentials
psql -U base44user -d base44 -h localhost
```

### Erreur : "NEXTAUTH_SECRET is not set"
```bash
# Générer et ajouter dans .env.local
openssl rand -base64 32
```

### Erreur : Port 3000 déjà utilisé
```bash
# Changer le port
PORT=3001 npm run dev
```

### Erreur Prisma : "The table does not exist"
```bash
npx prisma db push --force-reset
npx prisma db seed
```

## 📊 **STRUCTURE DES DONNÉES DE TEST**

Le seed crée automatiquement :

### TechCorp Solutions
- **4 utilisateurs** (1 par rôle)
- **5 targets** (2 web apps, 1 API, 1 mobile, 1 network)
- **3 pentests** (1 complété, 1 en cours, 1 planifié)
- **15 findings** de sévérités variées
- **2 templates** (OWASP Top 10, Custom)
- **2 reports** générés
- **10 commentaires** sur les findings

### CyberSec Inc
- **2 utilisateurs** (admin + pentester)
- **2 targets**
- **1 pentest**
- **5 findings**

## 🎯 **FONCTIONNALITÉS À TESTER**

1. **Dashboard**
   - Statistiques en temps réel
   - Graphiques (distribution sévérité, timeline)
   - Activités récentes

2. **Pentests**
   - Créer un nouveau pentest
   - Modifier le statut
   - Voir les findings associés

3. **Targets**
   - Ajouter un nouveau target
   - Calculer le risk score
   - Gérer le scope

4. **Findings**
   - Créer un finding
   - Assigner à un utilisateur
   - Ajouter des commentaires

5. **Reports**
   - Générer un rapport PDF
   - Choisir le type (Executive, Technical)
   - Prévisualiser avant téléchargement

6. **Search** (Cmd+K ou bouton recherche)
   - Recherche globale
   - Filtres par type
   - Filtres avancés

## 🔒 **SÉCURITÉ**

- Les mots de passe sont hashés avec bcrypt
- Les sessions utilisent JWT sécurisé
- L'accès aux API est protégé par authentification
- Les données sont isolées par company
- Les rôles limitent les permissions

## 📝 **NOTES IMPORTANTES**

1. **Données de test** : Ne pas utiliser en production
2. **Mots de passe** : Changer tous les mots de passe par défaut
3. **NEXTAUTH_SECRET** : Utiliser une vraie clé aléatoire
4. **Database** : Sécuriser PostgreSQL en production
5. **CORS** : Configurer pour votre domaine en production

## 🚀 **PROCHAINES ÉTAPES**

1. Explorer l'interface avec le compte admin
2. Créer vos propres pentests et findings
3. Générer des rapports
4. Personnaliser les templates
5. Inviter d'autres utilisateurs

## 💡 **TIPS**

- Utilisez Prisma Studio pour explorer la DB : `npx prisma studio`
- Les logs API sont dans la console du navigateur
- Le hot-reload est actif, les changements sont instantanés
- Cmd+K ouvre la recherche rapide

## 📞 **SUPPORT**

Si vous rencontrez des problèmes :
1. Vérifier les logs console
2. Vérifier les logs serveur (terminal npm)
3. Vérifier la connexion DB avec `npx prisma studio`
4. Réinitialiser avec `npx prisma db push --force-reset`

---

**Base44 est maintenant prêt à l'emploi ! 🎉**
