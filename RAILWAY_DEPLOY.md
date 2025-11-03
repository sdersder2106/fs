# 🚂 Base44 - Version Railway Ready

## ✅ Cette version est prête pour Railway !

Tous les problèmes de compatibilité ont été corrigés :
- ✅ CommonJS au lieu d'ES6 modules
- ✅ WebSocket configuré pour Railway
- ✅ Scripts de déploiement inclus
- ✅ Configuration optimisée

## 🚀 Déploiement sur Railway

### 1. Préparer le code

```bash
# Installer les dépendances et générer package-lock.json
npm install

# Vérifier que tout fonctionne
npm run prisma:generate
```

### 2. Pousser sur GitHub

```bash
git init
git add .
git commit -m "Initial commit - Railway ready"
git branch -M main
git remote add origin YOUR_GITHUB_REPO
git push -u origin main
```

### 3. Déployer sur Railway

1. Aller sur [railway.app](https://railway.app)
2. Créer un nouveau projet
3. Choisir "Deploy from GitHub repo"
4. Sélectionner votre repo
5. Ajouter PostgreSQL au projet

### 4. Configurer les variables d'environnement

Dans Railway Dashboard → Variables, ajouter :

```env
# Database (fourni automatiquement par Railway PostgreSQL)
DATABASE_URL=${{DATABASE_URL}}
DIRECT_URL=${{DATABASE_URL}}

# NextAuth
NEXTAUTH_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
NEXTAUTH_SECRET=your-generated-secret-here

# Node
NODE_ENV=production
PORT=3000

# Optional: Désactiver WebSocket si problème
# DISABLE_WEBSOCKET=true
```

Pour générer NEXTAUTH_SECRET :
```bash
openssl rand -base64 32
```

### 5. Lancer le déploiement

Railway va automatiquement :
1. Détecter le projet Next.js
2. Installer les dépendances
3. Générer Prisma Client
4. Créer les tables dans la DB
5. Builder l'application
6. Démarrer le serveur

## 📁 Fichiers importants

- `server.js` : Serveur Node.js (CommonJS)
- `lib/websocket.js` : WebSocket handler (CommonJS)
- `lib/prisma.js` : Client Prisma (CommonJS)
- `railway.json` : Configuration Railway
- `.env.example` : Variables d'environnement requises

## 🔧 Scripts disponibles

```bash
npm run dev        # Développement local
npm run build      # Build production
npm run start      # Démarrer en production
npm run prisma:push    # Synchroniser DB
npm run prisma:seed    # Seed DB
npm run prisma:studio  # Interface DB
```

## ⚠️ Troubleshooting

### Erreur de build
- Vérifier que `package-lock.json` est committé
- Supprimer `node_modules` et réinstaller

### Erreur de DB
- Vérifier que PostgreSQL est ajouté au projet Railway
- Vérifier les variables DATABASE_URL et DIRECT_URL

### WebSocket ne fonctionne pas
- Ajouter `DISABLE_WEBSOCKET=true` dans les variables
- Railway supporte les WebSockets mais peut nécessiter configuration

## 🆘 Support

Si vous avez des problèmes :
1. Vérifier les logs dans Railway Dashboard
2. Vérifier que toutes les variables sont configurées
3. Essayer avec `DISABLE_WEBSOCKET=true` d'abord

## ✅ Checklist de déploiement

- [ ] Code pushé sur GitHub
- [ ] Projet créé sur Railway
- [ ] PostgreSQL ajouté
- [ ] Variables d'environnement configurées
- [ ] NEXTAUTH_SECRET généré et ajouté
- [ ] Déploiement lancé
- [ ] Application accessible

## 🎉 Success!

Une fois déployé, votre application sera accessible à :
`https://your-app-name.railway.app`

Bonne chance avec votre déploiement ! 🚀
