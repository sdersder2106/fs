#!/bin/bash

# 🔧 Script de correction automatique des problèmes Railway
# Usage: bash fix-railway-deploy.sh

echo "🚀 Correction des problèmes Railway..."
echo "======================================"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Backup du server.js original
if [ -f "server.js" ]; then
    cp server.js server.js.backup
    echo -e "${GREEN}✅ Backup du server.js créé${NC}"
fi

# 2. Créer le nouveau server.js
cat > server.js << 'EOF'
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = parseInt(process.env.PORT || '3000', 10);

// Auto-detect Railway and disable WebSocket
const DISABLE_WEBSOCKET = process.env.DISABLE_WEBSOCKET === 'true' || 
                          process.env.RAILWAY_ENVIRONMENT || 
                          process.env.RAILWAY_PUBLIC_DOMAIN;

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Initialize WebSocket only if not on Railway
  if (!DISABLE_WEBSOCKET) {
    try {
      const { wsServer } = require('./lib/websocket');
      wsServer.initialize(server);
      console.log('> WebSocket server initialized');
    } catch (error) {
      console.log('> WebSocket skipped:', error.message);
    }
  } else {
    console.log('> WebSocket disabled (Railway deployment detected)');
  }

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
    console.log(`> Environment: ${process.env.NODE_ENV || 'development'}`);
    if (DISABLE_WEBSOCKET) {
      console.log('> Running without WebSocket (optimized for Railway)');
    }
  });
});
EOF

echo -e "${GREEN}✅ server.js modifié pour Railway${NC}"

# 3. Créer un fichier .env.railway
cat > .env.railway << 'EOF'
# Railway Environment Variables
DISABLE_WEBSOCKET=true
NEXT_PUBLIC_DISABLE_WEBSOCKET=true
NODE_ENV=production
EOF

echo -e "${GREEN}✅ .env.railway créé${NC}"

# 4. Modifier package.json pour Railway
if [ -f "package.json" ]; then
    # Ajouter un script railway-build si nécessaire
    node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Ajouter le script railway
    pkg.scripts['railway-build'] = 'prisma generate && prisma db push && next build';
    pkg.scripts['railway-start'] = 'NODE_ENV=production node server.js';
    
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    console.log('Package.json mis à jour');
    "
    echo -e "${GREEN}✅ package.json mis à jour${NC}"
fi

# 5. Instructions finales
echo ""
echo -e "${YELLOW}📋 ÉTAPES FINALES :${NC}"
echo "=================================="
echo ""
echo "1. Commitez les changements :"
echo "   git add ."
echo "   git commit -m 'Fix: Disable WebSocket for Railway deployment'"
echo "   git push"
echo ""
echo "2. Dans Railway, ajoutez ces variables :"
echo "   DISABLE_WEBSOCKET=true"
echo "   NEXT_PUBLIC_DISABLE_WEBSOCKET=true"
echo "   NEXTAUTH_URL=https://fs-production-c597.up.railway.app"
echo "   NEXTAUTH_SECRET=vK9xH2mR5tN8qL4wP7jF3bG6yC1aZ0dE9sT5uI8oM2k="
echo ""
echo "3. Railway va automatiquement redéployer"
echo ""
echo -e "${GREEN}✨ Terminé ! Votre app devrait maintenant fonctionner rapidement sur Railway.${NC}"
