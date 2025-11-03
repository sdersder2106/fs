#!/bin/bash

# Script de déploiement optimisé pour Base44
# Corrige les problèmes de WebSocket, performance et erreurs 404

echo "🚀 Démarrage du processus de déploiement optimisé..."

# 1. Backup des fichiers originaux
echo "📦 Sauvegarde des fichiers originaux..."
cp next.config.js next.config.js.backup 2>/dev/null
cp middleware.ts middleware.ts.backup 2>/dev/null
cp app/api/dashboard/route.ts app/api/dashboard/route.ts.backup 2>/dev/null

# 2. Application des optimisations
echo "⚡ Application des optimisations..."

# Remplacer les fichiers par les versions optimisées
cp next.config.optimized.js next.config.js
cp middleware.optimized.ts middleware.ts
cp app/api/dashboard/route.optimized.ts app/api/dashboard/route.ts

# 3. Nettoyer les dépendances inutilisées
echo "🧹 Nettoyage des dépendances..."
npm uninstall socket.io-client --save

# 4. Installer les dépendances de production uniquement
echo "📥 Installation des dépendances de production..."
npm ci --production

# 5. Générer Prisma Client
echo "🔧 Génération du client Prisma..."
npx prisma generate

# 6. Construire l'application avec optimisations
echo "🏗️ Construction de l'application..."
NODE_ENV=production npm run build

# 7. Analyser la taille du bundle
echo "📊 Analyse du bundle..."
if [ -f ".next/analyze/client.html" ]; then
  echo "Bundle analysis disponible dans .next/analyze/"
fi

# 8. Variables d'environnement recommandées
echo "📝 Configuration des variables d'environnement..."
cat > .env.production.local << EOF
# Performance optimizations
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Database connection pooling
DATABASE_CONNECTION_LIMIT=10
DATABASE_POOL_TIMEOUT=20

# API optimizations
API_RATE_LIMIT=100
API_RATE_WINDOW=60000
API_TIMEOUT=10000

# Cache settings
CACHE_CONTROL_MAX_AGE=300
CACHE_TTL_DASHBOARD=300
EOF

# 9. Script de démarrage optimisé
cat > start-optimized.sh << 'EOF'
#!/bin/bash

# Définir les variables d'environnement
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=2048"

# Démarrer l'application avec PM2
if command -v pm2 &> /dev/null; then
  pm2 start npm --name base44 -- start -- -p 3000
  pm2 save
else
  # Fallback vers le démarrage normal
  npm start -- -p 3000
fi
EOF

chmod +x start-optimized.sh

# 10. Créer un fichier de monitoring
cat > monitor.js << 'EOF'
const http = require('http');
const https = require('https');

// Configuration
const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const CHECK_INTERVAL = 60000; // 1 minute

// Endpoints à vérifier
const endpoints = [
  '/api/status',
  '/api/dashboard',
  '/api/auth/session'
];

// Fonction de vérification
async function checkEndpoint(endpoint) {
  const url = new URL(APP_URL + endpoint);
  const protocol = url.protocol === 'https:' ? https : http;
  
  return new Promise((resolve) => {
    const start = Date.now();
    protocol.get(url, (res) => {
      const duration = Date.now() - start;
      const status = res.statusCode;
      
      console.log(`[${new Date().toISOString()}] ${endpoint}: ${status} (${duration}ms)`);
      
      if (status >= 400) {
        console.error(`⚠️ Erreur détectée sur ${endpoint}`);
      }
      
      if (duration > 1000) {
        console.warn(`⚠️ Endpoint lent: ${endpoint} (${duration}ms)`);
      }
      
      resolve({ endpoint, status, duration });
    }).on('error', (err) => {
      console.error(`❌ Erreur sur ${endpoint}:`, err.message);
      resolve({ endpoint, status: 0, duration: 0, error: err.message });
    });
  });
}

// Boucle de monitoring
async function monitor() {
  console.log('🔍 Démarrage du monitoring...');
  
  setInterval(async () => {
    const results = await Promise.all(endpoints.map(checkEndpoint));
    
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
    const avgDuration = Math.round(totalDuration / results.length);
    const errors = results.filter(r => r.status >= 400 || r.error);
    
    console.log(`📊 Moyenne: ${avgDuration}ms | Erreurs: ${errors.length}`);
    
    if (errors.length > 0) {
      console.error('⚠️ Des erreurs ont été détectées!');
      // Ici vous pouvez ajouter une notification (email, Slack, etc.)
    }
  }, CHECK_INTERVAL);
}

// Démarrer le monitoring
monitor();
EOF

echo "✅ Optimisations appliquées avec succès!"
echo ""
echo "📋 Résumé des améliorations:"
echo "  ✓ Suppression de socket.io-client (économie ~200KB)"
echo "  ✓ Configuration Next.js optimisée avec cache et compression"
echo "  ✓ Middleware avec rate limiting et gestion des erreurs 404"
echo "  ✓ API Dashboard optimisée avec cache et requêtes SQL optimisées"
echo "  ✓ Hook React avec cache côté client"
echo "  ✓ Gestion des requêtes de polling WebSocket"
echo ""
echo "🎯 Performances attendues:"
echo "  • Réduction du temps de réponse API: 300-400ms → 50-150ms"
echo "  • Réduction de la taille des données: 43MB → <5MB"
echo "  • Élimination des erreurs 404 WebSocket"
echo "  • Cache intelligent sur 5 minutes"
echo ""
echo "🚀 Pour démarrer l'application:"
echo "  ./start-optimized.sh"
echo ""
echo "📊 Pour monitorer l'application:"
echo "  node monitor.js"
