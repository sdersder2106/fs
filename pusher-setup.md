# 🚀 Installation Pusher en 5 Minutes (Solution Recommandée)

## 📋 Prérequis
1. Créez un compte gratuit sur [pusher.com](https://pusher.com)
2. Créez une nouvelle app (choisissez le cluster `eu` ou `us2`)
3. Récupérez vos credentials

## 📦 Installation

```bash
npm install pusher pusher-js
# ou
yarn add pusher pusher-js
```

## 📁 Fichiers à créer/modifier

### 1️⃣ **lib/pusher.js** (Nouveau fichier)
```javascript
const Pusher = require('pusher');

let pusherInstance = null;

function getPusher() {
  if (!pusherInstance) {
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

// Remplace sendNotificationToUser de WebSocket
async function sendNotificationToUser(userId, notification) {
  try {
    const pusher = getPusher();
    await pusher.trigger(`private-user-${userId}`, 'notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
    console.log(`✅ Notification sent to user ${userId} via Pusher`);
  } catch (error) {
    console.error('❌ Error sending Pusher notification:', error);
  }
}

// Remplace broadcastToCompany de WebSocket
async function broadcastToCompany(companyId, event, data) {
  try {
    const pusher = getPusher();
    await pusher.trigger(`private-company-${companyId}`, event, {
      ...data,
      timestamp: new Date().toISOString()
    });
    console.log(`✅ Event ${event} broadcast to company ${companyId} via Pusher`);
  } catch (error) {
    console.error('❌ Error broadcasting via Pusher:', error);
  }
}

// Pour le dashboard temps réel
async function updateDashboard(companyId, stats) {
  try {
    const pusher = getPusher();
    await pusher.trigger(`private-company-${companyId}`, 'dashboard-update', stats);
  } catch (error) {
    console.error('❌ Error updating dashboard:', error);
  }
}

module.exports = {
  sendNotificationToUser,
  broadcastToCompany,
  updateDashboard
};
```

### 2️⃣ **components/providers/pusher-provider.tsx** (Nouveau fichier)
```tsx
'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import Pusher from 'pusher-js';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface PusherContextType {
  pusher: Pusher | null;
  isConnected: boolean;
}

const PusherContext = createContext<PusherContextType>({
  pusher: null,
  isConnected: false,
});

export function PusherProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [pusher, setPusher] = useState<Pusher | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!session?.user) return;

    // Initialiser Pusher
    const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
      authEndpoint: '/api/pusher/auth',
      auth: {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    });

    // S'abonner aux canaux
    const userChannel = pusherClient.subscribe(`private-user-${session.user.id}`);
    const companyChannel = pusherClient.subscribe(`private-company-${session.user.companyId}`);

    // Écouter les notifications utilisateur
    userChannel.bind('notification', (data: any) => {
      toast(data.message, {
        description: data.description,
      });
      
      // Rafraîchir les données si nécessaire
      if (data.refreshRequired) {
        window.location.reload();
      }
    });

    // Écouter les mises à jour du dashboard
    companyChannel.bind('dashboard-update', (data: any) => {
      // Mettre à jour le dashboard sans recharger la page
      const event = new CustomEvent('dashboard-update', { detail: data });
      window.dispatchEvent(event);
    });

    // Écouter les nouvelles découvertes
    companyChannel.bind('new-finding', (data: any) => {
      toast('Nouvelle découverte!', {
        description: `${data.title} - Sévérité: ${data.severity}`,
      });
    });

    // Gestion de la connexion
    pusherClient.connection.bind('connected', () => {
      setIsConnected(true);
      console.log('✅ Connected to Pusher');
    });

    pusherClient.connection.bind('disconnected', () => {
      setIsConnected(false);
      console.log('❌ Disconnected from Pusher');
    });

    setPusher(pusherClient);

    // Cleanup
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
```

### 3️⃣ **app/api/pusher/auth/route.ts** (Nouveau fichier pour l'authentification)
```typescript
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

  // Vérifier les permissions
  const userId = session.user.id;
  const companyId = session.user.companyId;

  // Autoriser seulement les canaux de l'utilisateur ou de sa compagnie
  if (
    channelName === `private-user-${userId}` ||
    channelName === `private-company-${companyId}`
  ) {
    const authResponse = pusher.authorizeChannel(socketId, channelName);
    return NextResponse.json(authResponse);
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### 4️⃣ **Modifier server.js**
```javascript
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

  // Plus besoin de WebSocket!
  console.log('> Using Pusher for real-time features');

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
    console.log('> Real-time powered by Pusher ⚡');
  });
});
```

### 5️⃣ **Modifier app/layout.tsx**
```tsx
// Remplacez WebSocketProvider par PusherProvider
import { PusherProvider } from '@/components/providers/pusher-provider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>
          <PusherProvider>
            {children}
          </PusherProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
```

## 🔧 Variables d'Environnement Railway

Ajoutez dans Railway :
```env
# Pusher (récupérez sur pusher.com)
PUSHER_APP_ID=123456
NEXT_PUBLIC_PUSHER_KEY=abcdef123456
PUSHER_SECRET=secret123456
NEXT_PUBLIC_PUSHER_CLUSTER=eu

# Les autres variables existantes
NEXTAUTH_URL=https://fs-production-c597.up.railway.app
NEXTAUTH_SECRET=vK9xH2mR5tN8qL4wP7jF3bG6yC1aZ0dE9sT5uI8oM2k=
NODE_ENV=production
```

## 📡 Utilisation dans vos APIs

Remplacez les appels WebSocket :

**Avant (WebSocket) :**
```javascript
wsServer.sendNotificationToUser(userId, {
  message: 'Nouveau commentaire'
});
```

**Après (Pusher) :**
```javascript
const { sendNotificationToUser } = require('@/lib/pusher');

await sendNotificationToUser(userId, {
  message: 'Nouveau commentaire'
});
```

## ✅ Avantages

- ✅ **Fonctionne parfaitement sur Railway**
- ✅ **200 000 messages gratuits/jour**
- ✅ **Temps réel garanti**
- ✅ **Auto-reconnexion**
- ✅ **Support mobile**
- ✅ **Analytics intégrés**

## 🚀 Déploiement

1. Commitez les changements :
```bash
git add .
git commit -m "feat: Replace WebSocket with Pusher for Railway"
git push
```

2. Railway redéploiera automatiquement

## 🎉 C'est fait !

Votre app a maintenant :
- ✅ Notifications temps réel
- ✅ Dashboard live
- ✅ Performance optimale sur Railway
- ✅ Pas d'erreurs WebSocket

---

💡 **Note :** Pusher est gratuit jusqu'à 200k messages/jour et 100 connexions simultanées, largement suffisant pour la plupart des projets !
