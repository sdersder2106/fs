# 🔄 Guide de Migration : WebSocket → Pusher

## 📋 Checklist de Migration

### ✅ Étape 1 : Installation des packages
```bash
npm install pusher pusher-js
# ou
yarn add pusher pusher-js
```

### ✅ Étape 2 : Variables d'environnement Railway

Ajoutez dans **Railway → Variables → RAW Editor** :

```env
# Pusher (vos credentials)
PUSHER_APP_ID=2072966
NEXT_PUBLIC_PUSHER_KEY=0ad42094e8713af8969b
PUSHER_SECRET=9c3e8d55a6c9ade97ee7
NEXT_PUBLIC_PUSHER_CLUSTER=eu

# NextAuth (existant)
NEXTAUTH_URL=https://fs-production-c597.up.railway.app
NEXTAUTH_SECRET=vK9xH2mR5tN8qL4wP7jF3bG6yC1aZ0dE9sT5uI8oM2k=

# Environment
NODE_ENV=production
```

### ✅ Étape 3 : Remplacer les fichiers

#### 1. **server.js** → [server-pusher.js](computer:///mnt/user-data/outputs/server-pusher.js)
```javascript
// Supprimer toute référence à WebSocket
// Plus de wsServer.initialize()
```

#### 2. **lib/websocket.js** → [lib/pusher.js](computer:///mnt/user-data/outputs/lib/pusher.js)
```javascript
// Remplacer complètement par le nouveau fichier Pusher
```

#### 3. **components/providers/websocket-provider.tsx** → [pusher-provider.tsx](computer:///mnt/user-data/outputs/components/providers/pusher-provider.tsx)
```javascript
// Remplacer complètement par le provider Pusher
```

#### 4. Créer **app/api/pusher/auth/route.ts** → [route.ts](computer:///mnt/user-data/outputs/app/api/pusher/auth/route.ts)
```javascript
// Nouveau fichier pour l'authentification Pusher
```

#### 5. **app/layout.tsx** → [layout.tsx](computer:///mnt/user-data/outputs/app/layout.tsx)
```tsx
// Avant :
import { WebSocketProvider } from '@/components/providers/websocket-provider';

// Après :
import { PusherProvider } from '@/components/providers/pusher-provider';

// Dans le JSX, remplacer :
<WebSocketProvider>{children}</WebSocketProvider>
// Par :
<PusherProvider>{children}</PusherProvider>
```

### ✅ Étape 4 : Modifier vos APIs

Dans **TOUS** vos fichiers API qui utilisaient WebSocket :

#### Avant (WebSocket) :
```javascript
import { wsServer } from '@/lib/websocket';

// Dans votre code :
wsServer.sendNotificationToUser(userId, notification);
wsServer.broadcastToCompany(companyId, 'event', data);
```

#### Après (Pusher) :
```javascript
import { sendNotificationToUser, broadcastToCompany } from '@/lib/pusher';

// Dans votre code :
await sendNotificationToUser(userId, notification);
await broadcastToCompany(companyId, 'event', data);
```

### ✅ Étape 5 : Fichiers à modifier

Recherchez et modifiez ces fichiers :

```bash
# Trouvez tous les fichiers qui importent WebSocket
grep -r "websocket" --include="*.ts" --include="*.tsx" --include="*.js"

# Fichiers typiques à modifier :
- app/api/comments/route.ts
- app/api/findings/route.ts
- app/api/notifications/route.ts
- app/api/dashboard/route.ts
```

### ✅ Étape 6 : Nettoyage

Supprimez/archivez les anciens fichiers :
```bash
# Archiver les anciens fichiers
mv lib/websocket.js lib/websocket.js.old
mv components/providers/websocket-provider.tsx components/providers/websocket-provider.tsx.old

# Supprimer les packages inutiles
npm uninstall socket.io socket.io-client
```

### ✅ Étape 7 : Commit et déploiement

```bash
git add .
git commit -m "feat: Replace WebSocket with Pusher for real-time features"
git push
```

## 📊 Tableau de Conversion

| Fonction WebSocket | Fonction Pusher | Fichier |
|-------------------|-----------------|---------|
| `wsServer.initialize()` | ❌ Supprimer | server.js |
| `wsServer.sendNotificationToUser()` | `sendNotificationToUser()` | lib/pusher.js |
| `wsServer.sendNotificationToCompany()` | `sendNotificationToCompany()` | lib/pusher.js |
| `wsServer.broadcastToCompany()` | `broadcastToCompany()` | lib/pusher.js |
| `WebSocketProvider` | `PusherProvider` | layout.tsx |
| `useWebSocket()` | `usePusher()` | Components |

## 🔍 Vérification

Après déploiement, vérifiez :

1. **Console Pusher** : https://dashboard.pusher.com
   - Voyez les connexions actives
   - Monitorer les messages

2. **Console navigateur** :
   - ✅ "Connecté à Pusher"
   - ❌ Plus d'erreurs WebSocket

3. **Fonctionnalités** :
   - Notifications temps réel
   - Mise à jour dashboard
   - Commentaires live

## ⚠️ Troubleshooting

| Problème | Solution |
|----------|----------|
| "Pusher not defined" | Vérifiez l'installation : `npm install pusher-js` |
| "Unauthorized" | Vérifiez les credentials Pusher |
| "Cannot connect" | Vérifiez le cluster (eu, us2, etc.) |
| Pas de temps réel | Vérifiez que PusherProvider est dans layout.tsx |

## 🎉 Avantages après migration

- ✅ **Fonctionne sur Railway** sans problème
- ✅ **200k messages gratuits/jour**
- ✅ **Auto-reconnexion** intégrée
- ✅ **Debug console** sur dashboard.pusher.com
- ✅ **Support mobile** natif
- ✅ **Performance** optimisée

---

## 📁 Fichiers de référence

Tous les fichiers modifiés sont disponibles dans `/mnt/user-data/outputs/` :

- [server-pusher.js](computer:///mnt/user-data/outputs/server-pusher.js)
- [lib/pusher.js](computer:///mnt/user-data/outputs/lib/pusher.js)
- [pusher-provider.tsx](computer:///mnt/user-data/outputs/components/providers/pusher-provider.tsx)
- [auth/route.ts](computer:///mnt/user-data/outputs/app/api/pusher/auth/route.ts)
- [layout.tsx](computer:///mnt/user-data/outputs/app/layout.tsx)
- [.env.railway](computer:///mnt/user-data/outputs/.env.railway)

---

💡 **Support** : Si vous avez des questions, consultez la [documentation Pusher](https://pusher.com/docs) ou demandez de l'aide !
