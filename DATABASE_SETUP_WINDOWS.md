# 🗄️ CONFIGURATION BASE DE DONNÉES - BASE44

## Option 1: PostgreSQL Local (RECOMMANDÉ POUR DEV)

### 1. Installer PostgreSQL sur Windows

1. **Télécharger PostgreSQL** :
   - Allez sur : https://www.postgresql.org/download/windows/
   - Téléchargez l'installateur (version 14 ou 15 recommandée)
   - Lancez l'installation

2. **Pendant l'installation** :
   - Port : 5432 (par défaut)
   - Password : Choisissez un mot de passe pour 'postgres' (NOTEZ-LE!)
   - Locale : French_France

3. **Après installation, créer la database** :

```powershell
# Ouvrez PowerShell en tant qu'administrateur

# Se connecter à PostgreSQL
psql -U postgres

# Entrez votre mot de passe postgres

# Créer la database
CREATE DATABASE base44;

# Sortir
\q
```

### 2. Configurer .env.local

Créez/éditez `.env.local` :

```env
# PostgreSQL Local
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/base44"
DIRECT_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/base44"

# NextAuth (gardez ces valeurs pour le dev local)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-key-change-in-production"

# Application
APP_URL="http://localhost:3000"
APP_NAME="Base44 Security Platform"
APP_ENV="development"
```

### 3. Commandes pour initialiser

```powershell
# 1. Push le schema
npx prisma db push

# 2. Seeder la database
npx prisma db seed

# 3. Vérifier avec Prisma Studio
npx prisma studio
```

---

## Option 2: Supabase (GRATUIT - Pour production)

### 1. Créer un compte Supabase

1. Allez sur https://supabase.com
2. Créez un compte (gratuit)
3. Créez un nouveau projet
   - **Project name** : base44
   - **Database Password** : Générez et SAUVEGARDEZ!
   - **Region** : Choisissez la plus proche

### 2. Récupérer les URLs de connexion

Dans Supabase Dashboard → Settings → Database :

1. **Connection string** → URI (pour DATABASE_URL)
2. **Connection string** → Direct (pour DIRECT_URL)

### 3. Configurer .env.local

```env
# Supabase (remplacez les placeholders)
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-key-change-in-production"
```

### 4. Initialiser Supabase

```powershell
# Push le schema
npx prisma db push

# Seeder (optionnel)
npx prisma db seed
```

---

## Option 3: Docker (Alternative simple)

### 1. Installer Docker Desktop
- Téléchargez depuis : https://www.docker.com/products/docker-desktop/

### 2. Lancer PostgreSQL avec Docker

```powershell
# Créer et lancer PostgreSQL
docker run --name base44-db -e POSTGRES_PASSWORD=base44pass -e POSTGRES_DB=base44 -p 5432:5432 -d postgres:15

# Vérifier qu'il tourne
docker ps
```

### 3. Configurer .env.local

```env
DATABASE_URL="postgresql://postgres:base44pass@localhost:5432/base44"
DIRECT_URL="postgresql://postgres:base44pass@localhost:5432/base44"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-key"
```

---

## 🔍 RÉSOLUTION DE VOTRE ERREUR ACTUELLE

Votre erreur indique que :
1. ❌ `DIRECT_URL` n'est pas définie dans `.env.local`
2. ❌ La database Supabase n'est pas accessible

### Solution immédiate :

```powershell
# 1. Créez/éditez .env.local
notepad .env.local
```

Ajoutez (pour PostgreSQL local) :

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/base44"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/base44"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-key"
```

```powershell
# 2. Si vous n'avez pas PostgreSQL, installez-le d'abord
# Ou utilisez cette version simplifiée pour dev :

# Créez un fichier .env.local minimal
@"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/base44"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/base44"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-key"
"@ | Out-File -FilePath .env.local -Encoding UTF8

# 3. Testez la connexion
npx prisma db push
```

---

## 📝 CHECKLIST DE DÉPANNAGE

- [ ] PostgreSQL est installé et démarre
- [ ] Le service PostgreSQL est actif
- [ ] La database 'base44' existe
- [ ] .env.local contient DATABASE_URL et DIRECT_URL
- [ ] Les credentials sont corrects
- [ ] Le port 5432 est libre

### Vérifier PostgreSQL sur Windows :

```powershell
# Vérifier si PostgreSQL est installé
Get-Service -Name postgresql*

# Vérifier le port 5432
netstat -an | findstr :5432

# Si PostgreSQL est installé, démarrer le service
Start-Service postgresql-x64-15  # Ajustez la version
```

---

## 🚀 SOLUTION RAPIDE SANS DATABASE

Si vous voulez juste tester l'interface sans database :

1. Commentez les appels Prisma dans le code
2. Utilisez des données mockées
3. Ou utilisez SQLite temporairement :

```env
# SQLite pour test rapide (dans .env.local)
DATABASE_URL="file:./dev.db"
DIRECT_URL="file:./dev.db"
```

```powershell
# Changez le provider dans schema.prisma temporairement
# provider = "sqlite" au lieu de "postgresql"

# Puis
npx prisma db push
npx prisma db seed
```

---

## ✅ ÉTAPES RECOMMANDÉES

1. **Installez PostgreSQL localement** (Option 1)
2. **Créez la database base44**
3. **Configurez .env.local avec les bonnes URLs**
4. **Exécutez npx prisma db push**
5. **Lancez npm run dev**

Le projet fonctionnera alors parfaitement en local!