#!/bin/bash

# 🔄 Script de Migration WebSocket → Pusher
# Usage: bash migrate-to-pusher.sh

echo "🚀 Migration WebSocket vers Pusher"
echo "=================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Installation des packages
echo -e "${BLUE}📦 Installation des packages Pusher...${NC}"
npm install pusher pusher-js sonner
echo -e "${GREEN}✅ Packages installés${NC}"
echo ""

# 2. Créer la structure des dossiers
mkdir -p lib
mkdir -p app/api/pusher/auth
mkdir -p components/providers

# 3. Créer lib/pusher.js
cat > lib/pusher.js << 'EOF'
const Pusher = require('pusher');

let pusherInstance = null;

function getPusher() {
  if (!pusherInstance && process.env.PUSHER_APP_ID) {
    pusherInstance = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
      useTLS: true
    });
  }
  return pusherInstance;
}

async function sendNotificationToUser(userId, notification) {
  const pusher = getPusher();
  if (!pusher) {
    console.log('Pusher not configured, skipping notification');
    return;
  }
  
  try {
    await pusher.trigger(`private-user-${userId}`, 'notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
    console.log(`✅ Notification sent to user ${userId}`);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

async function broadcastToCompany(companyId, event, data) {
  const pusher = getPusher();
  if (!pusher) {
    console.log('Pusher not configured, skipping broadcast');
    return;
  }
  
  try {
    await pusher.trigger(`private-company-${companyId}`, event, {
      ...data,
      timestamp: new Date().toISOString()
    });
    console.log(`✅ Event ${event} broadcast to company ${companyId}`);
  } catch (error) {
    console.error('Error broadcasting:', error);
  }
}

module.exports = {
  sendNotificationToUser,
  broadcastToCompany
};
EOF
echo -e "${GREEN}✅ lib/pusher.js créé${NC}"

# 4. Créer l'endpoint d'authentification Pusher
cat > app/api/pusher/auth/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';
import Pusher from 'pusher';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
  useTLS: true,
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.formData();
  const socketId = data.get('socket_id') as string;
  const channelName = data.get('channel_name') as string;

  const userId = session.user.id;
  const companyId = session.user.companyId;

  if (
    channelName === `private-user-${userId}` ||
    channelName === `private-company-${companyId}`
  ) {
    const authResponse = pusher.authorizeChannel(socketId, channelName);
    return NextResponse.json(authResponse);
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
EOF
echo -e "${GREEN}✅ API d'authentification Pusher créée${NC}"

# 5. Créer le Provider Pusher
cat > components/providers/pusher-provider.tsx << 'EOF'
'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import Pusher from 'pusher-js';
import { useSession } from 'next-auth/react';

const PusherContext = createContext<{ pusher: Pusher | null; isConnected: boolean }>({
  pusher: null,
  isConnected: false,
});

export function PusherProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [pusher, setPusher] = useState<Pusher | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!session?.user || !process.env.NEXT_PUBLIC_PUSHER_KEY) {
      console.log('Pusher not configured or user not authenticated');
      return;
    }

    const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
      authEndpoint: '/api/pusher/auth',
    });

    const userChannel = pusherClient.subscribe(`private-user-${session.user.id}`);
    const companyChannel = pusherClient.subscribe(`private-company-${session.user.companyId}`);

    userChannel.bind('notification', (data: any) => {
      console.log('Notification received:', data);
      // Gérer les notifications ici
    });

    companyChannel.bind('dashboard-update', (data: any) => {
      console.log('Dashboard update:', data);
      // Mettre à jour le dashboard
    });

    pusherClient.connection.bind('connected', () => {
      setIsConnected(true);
      console.log('Connected to Pusher');
    });

    pusherClient.connection.bind('disconnected', () => {
      setIsConnected(false);
    });

    setPusher(pusherClient);

    return () => {
      userChannel.unbind_all();
      companyChannel.unbind_all();
      pusherClient.unsubscribe(`private-user-${session.user.id}`);
      pusherClient.unsubscribe(`private-company-${session.user.companyId}`);
      pusherClient.disconnect();
    };
  }, [session]);

  return (
    <PusherContext.Provider value={{ pusher, isConnected }}>
      {children}
    </PusherContext.Provider>
  );
}

export const usePusher = () => useContext(PusherContext);
EOF
echo -e "${GREEN}✅ Provider Pusher créé${NC}"

# 6. Créer un fichier .env.pusher.example
cat > .env.pusher.example << 'EOF'
# Pusher Configuration (get from pusher.com)
PUSHER_APP_ID=your_app_id
NEXT_PUBLIC_PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
NEXT_PUBLIC_PUSHER_CLUSTER=eu

# Railway Configuration
NEXTAUTH_URL=https://fs-production-c597.up.railway.app
NEXTAUTH_SECRET=your_nextauth_secret
NODE_ENV=production
EOF
echo -e "${GREEN}✅ .env.pusher.example créé${NC}"

# 7. Instructions finales
echo ""
echo -e "${YELLOW}📋 PROCHAINES ÉTAPES :${NC}"
echo "======================================"
echo ""
echo -e "${BLUE}1. Créez un compte Pusher :${NC}"
echo "   → https://dashboard.pusher.com/accounts/sign_up"
echo ""
echo -e "${BLUE}2. Créez une nouvelle app Pusher :${NC}"
echo "   → Choisissez le cluster 'eu' ou 'us2'"
echo "   → Récupérez vos credentials"
echo ""
echo -e "${BLUE}3. Dans Railway, ajoutez ces variables :${NC}"
echo "   PUSHER_APP_ID=votre_app_id"
echo "   NEXT_PUBLIC_PUSHER_KEY=votre_key"
echo "   PUSHER_SECRET=votre_secret"
echo "   NEXT_PUBLIC_PUSHER_CLUSTER=eu"
echo ""
echo -e "${BLUE}4. Modifiez votre layout.tsx :${NC}"
echo "   Remplacez <WebSocketProvider> par <PusherProvider>"
echo ""
echo -e "${BLUE}5. Commitez et déployez :${NC}"
echo "   git add ."
echo "   git commit -m 'feat: Add Pusher for real-time features'"
echo "   git push"
echo ""
echo -e "${GREEN}✨ Migration préparée avec succès !${NC}"
echo ""
echo -e "${YELLOW}💡 Note : Les fichiers WebSocket existants ne sont pas supprimés.${NC}"
echo -e "${YELLOW}   Vous pouvez les garder pour le développement local.${NC}"
