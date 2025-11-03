#!/bin/bash
# deploy-to-railway.sh

echo "🚂 Préparation pour Railway"
echo "=========================="
echo ""

# 1. Nettoyer
echo "🧹 Nettoyage..."
rm -rf node_modules
rm -rf .next
rm -rf .npm
rm -f package-lock.json

# 2. Installer
echo "📦 Installation des dépendances..."
npm install

# 3. Générer Prisma
echo "🔧 Génération du client Prisma..."
npx prisma generate

# 4. Test de build (optionnel)
echo "🔨 Test du build local (optionnel)..."
echo "Voulez-vous tester le build localement? (y/n)"
read -r response
if [[ "$response" =~ ^([yY])$ ]]; then
    npm run build
fi

# 5. Git
echo "📤 Préparation Git..."
git add .
git status

echo ""
echo "✅ Prêt pour Railway!"
echo ""
echo "Prochaines étapes:"
echo "1. git commit -m 'fix: prepare for Railway deployment'"
echo "2. git push"
echo ""
echo "Variables d'environnement à configurer dans Railway:"
echo "- DATABASE_URL (depuis PostgreSQL Railway)"
echo "- DIRECT_URL (même valeur que DATABASE_URL)"
echo "- NEXTAUTH_URL (https://your-app.railway.app)"
echo "- NEXTAUTH_SECRET (générer avec: openssl rand -base64 32)"
