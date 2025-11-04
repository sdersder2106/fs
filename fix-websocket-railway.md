# 🔥 SOLUTION URGENTE - Erreurs WebSocket sur Railway

## ⚡ Le Problème
- ✅ Login fonctionne 
- ❌ Dashboard très lent
- ❌ Erreur "client-side exception" sur /targets
- ❌ Console pleine d'erreurs WebSocket (404)

## 🎯 SOLUTION RAPIDE (2 minutes)

### Option 1: DÉSACTIVER LES WEBSOCKETS (Recommandé)

#### Dans Railway → Variables, ajoutez :
```env
DISABLE_WEBSOCKET=true
```

Puis **redéployez**. C'est tout !

### Option 2: Si Option 1 ne marche pas

#### Modifiez ces fichiers dans votre code :

**1. Dans `app/layout.tsx` ou `app/(dashboard)/layout.tsx`**, commentez/supprimez :
```tsx
// COMMENTEZ ou SUPPRIMEZ cette ligne :
// import { WebSocketProvider } from '@/components/providers/websocket-provider';

// Et supprimez le wrapper :
// <WebSocketProvider>
//   {children}
// </WebSocketProvider>
```

**2. Dans `server.js`**, ajoutez au début :
```javascript
// Désactiver WebSocket si sur Railway
if (process.env.RAILWAY_ENVIRONMENT || process.env.DISABLE_WEBSOCKET) {
  console.log('WebSocket disabled for Railway deployment');
  process.env.DISABLE_WEBSOCKET = 'true';
}
```

## 🔧 SOLUTION COMPLÈTE (5 minutes)

### Étape 1: Variables d'environnement Railway

Ajoutez TOUTES ces variables :
```env
NEXTAUTH_URL=https://fs-production-c597.up.railway.app
NEXTAUTH_SECRET=vK9xH2mR5tN8qL4wP7jF3bG6yC1aZ0dE9sT5uI8oM2k=
NODE_ENV=production
DISABLE_WEBSOCKET=true
NEXT_PUBLIC_DISABLE_WEBSOCKET=true
```

### Étape 2: Nettoyer le cache du navigateur

1. Ouvrez les DevTools (F12)
2. Clic droit sur le bouton Refresh 
3. Choisir "Empty Cache and Hard Reload"

### Étape 3: Si l'erreur persiste sur /targets

Le problème peut être lié aux données manquantes. Dans PostgreSQL :

```sql
-- Vérifier si des "targets" existent
SELECT COUNT(*) FROM "Target";

-- Si vide, créer des données test
INSERT INTO "Target" (id, name, description, "companyId", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Target Test',
  'Description test',
  (SELECT id FROM "Company" LIMIT 1),
  NOW(),
  NOW()
);
```

## 📊 Pourquoi ça arrive ?

Railway ne supporte pas bien les WebSockets sur leur plan gratuit/starter. L'application essaie de :
1. Se connecter au WebSocket → Échoue (404)
2. Réessayer toutes les secondes → Ralentit tout
3. Accumule les erreurs → Crash sur certaines pages

## ✅ Vérification

Après avoir appliqué la solution :
- ✅ Dashboard charge rapidement
- ✅ Navigation fluide
- ✅ Plus d'erreurs dans la console
- ✅ /targets fonctionne

## 🚀 Alternative : Déployer sur Vercel

Si vous avez besoin des WebSockets, considérez Vercel qui les supporte mieux :
1. Connectez votre repo GitHub à Vercel
2. Ajoutez les mêmes variables d'environnement
3. Déployez

---

⚠️ **ACTION IMMÉDIATE** : Ajoutez `DISABLE_WEBSOCKET=true` dans Railway maintenant !
