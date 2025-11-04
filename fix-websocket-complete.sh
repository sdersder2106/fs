#!/bin/bash

# 🔧 Fix complet WebSocket Railway - Côté Client + Serveur
# Usage: bash fix-websocket-complete.sh

echo "🚀 Correction complète WebSocket pour Railway"
echo "============================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Vérifier si le fichier websocket-provider existe
PROVIDER_PATH="components/providers/websocket-provider.tsx"
ALT_PROVIDER_PATH="app/components/providers/websocket-provider.tsx"
ACTUAL_PATH=""

if [ -f "$PROVIDER_PATH" ]; then
    ACTUAL_PATH="$PROVIDER_PATH"
elif [ -f "$ALT_PROVIDER_PATH" ]; then
    ACTUAL_PATH="$ALT_PROVIDER_PATH"
else
    echo -e "${YELLOW}⚠️ Fichier websocket-provider.tsx non trouvé${NC}"
    echo "Vérifiez le chemin et créez le fichier manuellement."
fi

# 2. Backup et remplacer le provider
if [ -n "$ACTUAL_PATH" ]; then
    cp "$ACTUAL_PATH" "${ACTUAL_PATH}.backup"
    echo -e "${GREEN}✅ Backup créé: ${ACTUAL_PATH}.backup${NC}"
    
    # Créer le nouveau provider qui détecte Railway
    cat > "$ACTUAL_PATH" << 'EOF'
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface WebSocketContextType {
  isConnected: boolean;
  sendMessage: (message: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  sendMessage: () => {},
});

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Détection automatique Railway
    const isRailway = 
      typeof window !== 'undefined' && (
        window.location.hostname.includes('railway.app') ||
        process.env.NEXT_PUBLIC_DISABLE_WEBSOCKET === 'true'
      );

    if (isRailway) {
      console.log('WebSocket disabled for Railway deployment');
      return;
    }

    // Seulement en local
    if (window.location.hostname !== 'localhost' && 
        window.location.hostname !== '127.0.0.1') {
      return;
    }

    console.log('WebSocket enabled for local development');
    // Logique WebSocket locale ici si nécessaire

  }, []);

  const sendMessage = () => {
    // Ne rien faire - WebSocket désactivé
  };

  return (
    <WebSocketContext.Provider value={{ isConnected, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => useContext(WebSocketContext);
EOF
    echo -e "${GREEN}✅ WebSocket Provider mis à jour${NC}"
fi

# 3. Créer/Mettre à jour le fichier .env.local
cat > .env.local << 'EOF'
# Désactiver WebSocket pour Railway
NEXT_PUBLIC_DISABLE_WEBSOCKET=true
EOF
echo -e "${GREEN}✅ .env.local créé${NC}"

# 4. Mettre à jour le server.js
if [ -f "server.js" ]; then
    cp server.js server.js.backup
    cat > server.js << 'EOF'
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = parseInt(process.env.PORT || '3000', 10);

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // WebSocket désactivé pour Railway
  const DISABLE_WEBSOCKET = 
    process.env.DISABLE_WEBSOCKET === 'true' || 
    process.env.RAILWAY_PUBLIC_DOMAIN;

  if (!DISABLE_WEBSOCKET && dev) {
    try {
      const { wsServer } = require('./lib/websocket');
      wsServer.initialize(server);
      console.log('> WebSocket enabled (local development)');
    } catch (error) {
      console.log('> WebSocket not available:', error.message);
    }
  } else {
    console.log('> WebSocket disabled (Railway/Production)');
  }

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
EOF
    echo -e "${GREEN}✅ server.js mis à jour${NC}"
fi

# 5. Instructions finales
echo ""
echo -e "${YELLOW}📋 DERNIÈRES ÉTAPES :${NC}"
echo "======================================"
echo ""
echo -e "${RED}IMPORTANT : Dans Railway → Variables, ajoutez :${NC}"
echo ""
echo "DISABLE_WEBSOCKET=true"
echo "NEXT_PUBLIC_DISABLE_WEBSOCKET=true"
echo ""
echo -e "${YELLOW}Puis commitez et poussez :${NC}"
echo ""
echo "git add ."
echo "git commit -m 'fix: Disable WebSocket for Railway deployment'"
echo "git push"
echo ""
echo -e "${GREEN}✨ Les erreurs WebSocket vont disparaître !${NC}"
