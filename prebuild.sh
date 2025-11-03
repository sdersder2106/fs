#!/bin/bash

# Script de nettoyage pré-build pour Vercel
# Supprime les fichiers qui causent des erreurs de build

echo "🧹 Nettoyage des fichiers problématiques..."

# Supprimer les fichiers .backup et .old
find . -name "*.backup" -delete 2>/dev/null
find . -name "*.old" -delete 2>/dev/null
find . -name "*-old.*" -delete 2>/dev/null
find . -name "route-old.ts" -delete 2>/dev/null

# Supprimer les fichiers temporaires
find . -name "*.tmp" -delete 2>/dev/null
find . -name "*.temp" -delete 2>/dev/null

# Supprimer les fichiers de développement
rm -f deploy-optimized.sh 2>/dev/null
rm -f start-optimized.sh 2>/dev/null
rm -f monitor.js 2>/dev/null
rm -f check-setup.js 2>/dev/null

# Supprimer les fichiers spécifiques problématiques
rm -f app/api/dashboard/route-old.ts 2>/dev/null
rm -f app/api/dashboard/route.optimized.ts 2>/dev/null
rm -f middleware.optimized.ts 2>/dev/null
rm -f next.config.optimized.js 2>/dev/null

echo "✅ Nettoyage terminé"
