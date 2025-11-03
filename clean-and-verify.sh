#!/bin/bash

echo "🧹 Nettoyage et préparation pour Vercel..."

# 1. Supprimer tous les fichiers temporaires et de backup
echo "→ Suppression des fichiers temporaires..."
find . -name "*-old.*" -delete 2>/dev/null
find . -name "*.backup" -delete 2>/dev/null
find . -name "*.DELETE" -delete 2>/dev/null
find . -name "*.optimized.*" -delete 2>/dev/null

# 2. Vérifier s'il y a des fichiers route-old.ts
echo "→ Recherche de fichiers problématiques..."
OLDFILES=$(find ./app/api -name "*-old.ts" 2>/dev/null)
if [ ! -z "$OLDFILES" ]; then
  echo "  Fichiers trouvés et supprimés:"
  echo "$OLDFILES"
  rm -f $OLDFILES
fi

# 3. Nettoyer le cache npm
echo "→ Nettoyage du cache npm..."
rm -rf node_modules package-lock.json .next

# 4. Réinstaller les dépendances
echo "→ Réinstallation des dépendances..."
npm install --legacy-peer-deps

# 5. Générer Prisma Client
echo "→ Génération du client Prisma..."
npx prisma generate

# 6. Vérifier la structure des fichiers
echo "→ Vérification de la structure..."

# Vérifier que les fichiers critiques existent
FILES_TO_CHECK=(
  "lib/pdf-generator.ts"
  "lib/auth-helpers.ts"
  "lib/notifications.ts"
  "lib/api-response.ts"
  "app/api/status/route.ts"
  "vercel.json"
  ".vercelignore"
)

for file in "${FILES_TO_CHECK[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✓ $file"
  else
    echo "  ✗ $file MANQUANT!"
  fi
done

# 7. Build de test
echo "→ Test de build..."
npm run vercel-build

if [ $? -eq 0 ]; then
  echo "✅ Build réussi! Prêt pour Vercel."
else
  echo "❌ Le build a échoué. Vérifiez les erreurs ci-dessus."
  exit 1
fi
