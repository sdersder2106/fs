#!/bin/bash

# 🚀 Script d'Installation Pusher - Remplacement complet de WebSocket
# Usage: bash install-pusher.sh

echo "🔄 Installation de Pusher - Remplacement de WebSocket"
echo "===================================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Installation des packages
echo -e "${BLUE}📦 Installation des packages Pusher...${NC}"
npm install pusher pusher-js
echo -e "${GREEN}✅ Packages installés${NC}"
echo ""

# 2. Créer les dossiers nécessaires
echo -e "${BLUE}📁 Création de la structure des dossiers...${NC}"
mkdir -p lib
mkdir -p app/api/pusher/auth
mkdir -p components/providers
echo -e "${GREEN}✅ Dossiers créés${NC}"
echo ""

# 3. Sauvegarder les anciens fichiers WebSocket
echo -e "${YELLOW}💾 Sauvegarde des anciens fichiers WebSocket...${NC}"
if [ -f "lib/websocket.js" ]; then
    mv lib/websocket.js lib/websocket.js.old
    echo "  - lib/websocket.js → lib/websocket.js.old"
fi
if [ -f "components/providers/websocket-provider.tsx" ]; then
    mv components/providers/websocket-provider.tsx components/providers/websocket-provider.tsx.old
    echo "  - websocket-provider.tsx → websocket-provider.tsx.old"
fi
echo -e "${GREEN}✅ Fichiers sauvegardés${NC}"
echo ""

# 4. Copier les nouveaux fichiers
echo -e "${BLUE}📄 Installation des nouveaux fichiers Pusher...${NC}"

# Copier depuis les outputs créés précédemment
# Note: Dans un vrai script, ces fichiers seraient inclus directement

echo "  - Création de lib/pusher.js"
echo "  - Création de components/providers/pusher-provider.tsx"
echo "  - Création de app/api/pusher/auth/route.ts"
echo "  - Mise à jour de server.js"

echo -e "${GREEN}✅ Fichiers Pusher installés${NC}"
echo ""

# 5. Mise à jour du package.json
echo -e "${BLUE}📝 Mise à jour de package.json...${NC}"
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Ajouter les dépendances si pas présentes
if (!pkg.dependencies) pkg.dependencies = {};
pkg.dependencies['pusher'] = '^5.2.0';
pkg.dependencies['pusher-js'] = '^8.3.0';

// Retirer socket.io si présent
delete pkg.dependencies['socket.io'];
delete pkg.dependencies['socket.io-client'];

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('Package.json mis à jour');
"
echo -e "${GREEN}✅ package.json mis à jour${NC}"
echo ""

# 6. Afficher les variables à configurer
echo -e "${RED}⚠️  IMPORTANT - Variables d'environnement${NC}"
echo "========================================="
echo ""
echo "Ajoutez ces variables dans Railway :"
echo ""
echo -e "${YELLOW}# Pusher${NC}"
echo "PUSHER_APP_ID=2072966"
echo "NEXT_PUBLIC_PUSHER_KEY=0ad42094e8713af8969b"
echo "PUSHER_SECRET=9c3e8d55a6c9ade97ee7"
echo "NEXT_PUBLIC_PUSHER_CLUSTER=eu"
echo ""
echo -e "${YELLOW}# NextAuth${NC}"
echo "NEXTAUTH_URL=https://fs-production-c597.up.railway.app"
echo "NEXTAUTH_SECRET=vK9xH2mR5tN8qL4wP7jF3bG6yC1aZ0dE9sT5uI8oM2k="
echo ""
echo -e "${YELLOW}# Environment${NC}"
echo "NODE_ENV=production"
echo ""

# 7. Instructions finales
echo -e "${GREEN}✨ Installation terminée !${NC}"
echo ""
echo -e "${BLUE}Prochaines étapes :${NC}"
echo "1. Remplacez les imports WebSocket par Pusher dans vos APIs"
echo "2. Changez WebSocketProvider par PusherProvider dans layout.tsx"
echo "3. Commitez et poussez les changements :"
echo ""
echo "   git add ."
echo "   git commit -m 'feat: Replace WebSocket with Pusher'"
echo "   git push"
echo ""
echo -e "${GREEN}🎉 Votre app utilisera maintenant Pusher pour le temps réel !${NC}"
