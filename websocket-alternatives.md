# 🔄 Impact des WebSockets & Solutions Alternatives

## 📊 Fonctionnalités affectées par la désactivation

### ✅ **Fonctionnalités qui CONTINUENT de marcher :**
- ✅ Authentification/Login
- ✅ Création/Modification de données
- ✅ Visualisation des rapports
- ✅ Gestion des pentests
- ✅ Dashboard (données statiques)
- ✅ CRUD complet sur toutes les entités

### ❌ **Fonctionnalités désactivées :**
- ❌ **Notifications en temps réel** (nouvelles alertes instantanées)
- ❌ **Mises à jour live du dashboard** (refresh automatique)
- ❌ **Synchronisation multi-utilisateurs** (voir les changements des autres en direct)

## 🎯 SOLUTIONS ALTERNATIVES (Gardez les fonctionnalités temps réel)

---

## Solution 1: 🚀 **Pusher (Recommandé - 5 min)**

### Pourquoi Pusher ?
- ✅ Gratuit jusqu'à 200k messages/jour
- ✅ Fonctionne parfaitement sur Railway
- ✅ Installation rapide

### Installation :
```bash
npm install pusher pusher-js
```

### Configuration Backend (`lib/pusher.js`) :
```javascript
const Pusher = require('pusher');

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true
});

// Remplacer les WebSockets
export const sendNotification = async (userId, notification) => {
  await pusher.trigger(`user-${userId}`, 'notification', notification);
};

export const broadcastToCompany = async (companyId, event, data) => {
  await pusher.trigger(`company-${companyId}`, event, data);
};
```

### Configuration Frontend (`components/providers/pusher-provider.tsx`) :
```tsx
'use client';

import Pusher from 'pusher-js';
import { useEffect, useState } from 'react';

export function PusherProvider({ children }) {
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`user-${userId}`);
    
    channel.bind('notification', (data: any) => {
      // Gérer la notification
      console.log('Nouvelle notification:', data);
      // Afficher toast/alert
    });

    return () => {
      pusher.unsubscribe(`user-${userId}`);
    };
  }, [userId]);

  return <>{children}</>;
}
```

### Variables Railway :
```env
PUSHER_APP_ID=your_app_id
PUSHER_SECRET=your_secret
NEXT_PUBLIC_PUSHER_KEY=your_key
NEXT_PUBLIC_PUSHER_CLUSTER=eu
```

---

## Solution 2: 📡 **Supabase Realtime (Gratuit)**

### Installation :
```bash
npm install @supabase/supabase-js
```

### Configuration :
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Écouter les changements
supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications'
  }, (payload) => {
    console.log('Nouvelle notification!', payload);
  })
  .subscribe();
```

---

## Solution 3: 🔄 **Polling Intelligent (Simple, 2 min)**

### Pas de service externe, juste du code :

```tsx
// hooks/useAutoRefresh.ts
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAutoRefresh(interval = 30000) { // 30 secondes
  const router = useRouter();
  
  useEffect(() => {
    const timer = setInterval(() => {
      router.refresh();
    }, interval);
    
    return () => clearInterval(timer);
  }, [interval, router]);
}

// Dans vos composants
function Dashboard() {
  useAutoRefresh(15000); // Refresh toutes les 15 secondes
  
  return <YourDashboard />;
}
```

### Version optimisée avec SWR :
```bash
npm install swr
```

```tsx
import useSWR from 'swr';

function Dashboard() {
  const { data, error, mutate } = useSWR('/api/dashboard', fetcher, {
    refreshInterval: 10000, // Auto-refresh toutes les 10 secondes
    revalidateOnFocus: true,
    revalidateOnReconnect: true
  });
  
  return <YourDashboard data={data} />;
}
```

---

## Solution 4: ⚡ **Server-Sent Events (SSE)**

### Backend (`app/api/sse/route.ts`) :
```typescript
export async function GET(request: Request) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      const interval = setInterval(async () => {
        const data = await getLatestNotifications();
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      }, 5000);
      
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### Frontend :
```tsx
useEffect(() => {
  const eventSource = new EventSource('/api/sse');
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    // Mettre à jour l'UI
  };
  
  return () => eventSource.close();
}, []);
```

---

## Solution 5: 🚄 **Upgrade Railway (Garder WebSockets)**

### Plan Pro Railway (20$/mois) :
- ✅ Support WebSocket complet
- ✅ Plus de timeouts
- ✅ Meilleure performance

### Variables pour Plan Pro :
```env
# Retirer ces variables
# DISABLE_WEBSOCKET=true
# NEXT_PUBLIC_DISABLE_WEBSOCKET=true
```

---

## 📊 Tableau Comparatif

| Solution | Coût | Complexité | Temps Réel | Setup |
|----------|------|------------|------------|-------|
| **Pusher** | Gratuit* | ⭐⭐ | ✅ Excellent | 5 min |
| **Supabase** | Gratuit | ⭐⭐⭐ | ✅ Excellent | 10 min |
| **Polling** | Gratuit | ⭐ | ⚡ Bon | 2 min |
| **SSE** | Gratuit | ⭐⭐ | ✅ Très bon | 5 min |
| **Railway Pro** | 20$/mois | ⭐ | ✅ Excellent | 0 min |

*Gratuit jusqu'à 200k messages/jour

---

## 🎯 RECOMMANDATION

### Pour commencer rapidement :
1. **Désactivez les WebSockets** (votre app marche à 95%)
2. **Ajoutez le Polling intelligent** (2 min, refresh auto)

### Pour une solution complète :
1. **Intégrez Pusher** (gratuit, 5 min setup)
2. **Gardez l'expérience temps réel complète**

### Si budget disponible :
1. **Railway Pro** à 20$/mois
2. **Tout fonctionne sans modification**

---

## 💡 Code Prêt à l'Emploi

### Option A: Polling Simple (Copiez-collez)

```typescript
// app/hooks/useNotifications.ts
import { useEffect, useState } from 'react';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    // Charger immédiatement
    fetch('/api/notifications').then(r => r.json()).then(setNotifications);
    
    // Puis toutes les 30 secondes
    const interval = setInterval(() => {
      fetch('/api/notifications').then(r => r.json()).then(setNotifications);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  return notifications;
}
```

C'est tout ! Votre app reste fonctionnelle à 100% avec juste un petit délai pour les notifications.
