# 📝 Référence Rapide : WebSocket → Pusher

## 🔄 Changements Côte à Côte

### 1️⃣ **server.js**

#### ❌ AVANT (WebSocket)
```javascript
const { wsServer } = require('./lib/websocket');
// ...
wsServer.initialize(server);
console.log('> WebSocket server initialized');
```

#### ✅ APRÈS (Pusher)
```javascript
// Plus de require WebSocket !
// ...
console.log('> Real-time features powered by Pusher');
```

---

### 2️⃣ **Variables Railway**

#### ❌ AVANT
```env
DISABLE_WEBSOCKET=true
NEXT_PUBLIC_DISABLE_WEBSOCKET=true
```

#### ✅ APRÈS
```env
PUSHER_APP_ID=2072966
NEXT_PUBLIC_PUSHER_KEY=0ad42094e8713af8969b
PUSHER_SECRET=9c3e8d55a6c9ade97ee7
NEXT_PUBLIC_PUSHER_CLUSTER=eu
```

---

### 3️⃣ **Layout (app/layout.tsx)**

#### ❌ AVANT
```tsx
import { WebSocketProvider } from '@/components/providers/websocket-provider';

<WebSocketProvider>
  {children}
</WebSocketProvider>
```

#### ✅ APRÈS
```tsx
import { PusherProvider } from '@/components/providers/pusher-provider';

<PusherProvider>
  {children}
</PusherProvider>
```

---

### 4️⃣ **Dans vos APIs**

#### ❌ AVANT
```javascript
// Import
const { wsServer } = require('@/lib/websocket');

// Utilisation
wsServer.sendNotificationToUser(userId, {
  message: 'Nouvelle notification'
});

wsServer.broadcastToCompany(companyId, 'new-comment', data);
```

#### ✅ APRÈS
```javascript
// Import
const { 
  sendNotificationToUser, 
  broadcastToCompany 
} = require('@/lib/pusher');

// Utilisation (avec await !)
await sendNotificationToUser(userId, {
  message: 'Nouvelle notification'
});

await broadcastToCompany(companyId, 'new-comment', data);
```

---

### 5️⃣ **Dans les composants React**

#### ❌ AVANT
```tsx
import { useWebSocket } from '@/hooks/useWebSocket';

const { isConnected, sendMessage } = useWebSocket();
```

#### ✅ APRÈS
```tsx
import { usePusher } from '@/components/providers/pusher-provider';

const { isConnected, pusher } = usePusher();

// Bonus : hooks spécialisés
import { 
  useDashboardUpdates,
  useCommentUpdates 
} from '@/components/providers/pusher-provider';

useDashboardUpdates((data) => {
  // Rafraîchir le dashboard
});
```

---

## 📂 Structure des Fichiers

### ❌ ANCIENNE Structure
```
lib/
  └── websocket.js
components/providers/
  └── websocket-provider.tsx
```

### ✅ NOUVELLE Structure
```
lib/
  └── pusher.js              # Remplace websocket.js
app/api/pusher/
  └── auth/
      └── route.ts          # NOUVEAU - Auth Pusher
components/providers/
  └── pusher-provider.tsx   # Remplace websocket-provider
```

---

## 🔍 Commandes de Recherche/Remplacement

### Rechercher tous les fichiers à modifier :
```bash
# Trouver les imports WebSocket
grep -r "websocket\|wsServer\|WebSocket" \
  --include="*.ts" \
  --include="*.tsx" \
  --include="*.js" \
  --exclude-dir=node_modules

# Trouver les usages
grep -r "sendNotificationToUser\|broadcastToCompany" \
  --include="*.ts" \
  --include="*.tsx" \
  --exclude-dir=node_modules
```

### Remplacements automatiques (VS Code) :
1. **Ctrl+Shift+H** (Rechercher/Remplacer dans tous les fichiers)
2. Remplacer :
   - `wsServer.` → `` (vide, puis ajouter await)
   - `lib/websocket` → `lib/pusher`
   - `WebSocketProvider` → `PusherProvider`
   - `websocket-provider` → `pusher-provider`

---

## ✅ Checklist Finale

- [ ] Pusher account créé
- [ ] Packages installés (`pusher` et `pusher-js`)
- [ ] Variables ajoutées dans Railway
- [ ] `server.js` modifié
- [ ] `lib/pusher.js` créé
- [ ] `pusher-provider.tsx` créé
- [ ] `app/api/pusher/auth/route.ts` créé
- [ ] Layout modifié (PusherProvider)
- [ ] APIs modifiées (await + import pusher)
- [ ] Anciens fichiers WebSocket supprimés
- [ ] Commit et push effectués
- [ ] Déploiement Railway réussi

---

## 🎯 Test Rapide

Après déploiement, ouvrez la console du navigateur :

### ✅ Vous devriez voir :
```
🚀 Initialisation de Pusher...
✅ Connecté à Pusher
✅ Abonné au canal utilisateur: private-user-xxx
✅ Abonné au canal compagnie: private-company-xxx
```

### ❌ Vous ne devriez PAS voir :
```
Initializing WebSocket connection...
WebSocket connection error
GET wss://... 404
```

---

🎉 **C'est fait !** Votre app utilise maintenant Pusher pour le temps réel !
