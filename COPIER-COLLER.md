# ⚡ COPIER-COLLER RAPIDE - Fix WebSocket

## 1️⃣ Dans Railway → Variables → RAW Editor
```env
DISABLE_WEBSOCKET=true
NEXT_PUBLIC_DISABLE_WEBSOCKET=true
```

## 2️⃣ Remplacez TOUT le contenu de `components/providers/websocket-provider.tsx`
```tsx
'use client';

import { createContext, useContext } from 'react';

const WebSocketContext = createContext({
  isConnected: false,
  sendMessage: () => {},
});

export function WebSocketProvider({ children }) {
  console.log('WebSocket disabled for Railway');
  return (
    <WebSocketContext.Provider value={{ isConnected: false, sendMessage: () => {} }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => useContext(WebSocketContext);
```

## 3️⃣ Dans le terminal
```bash
git add .
git commit -m "fix: Disable WebSocket client"
git push
```

## ✅ C'EST FAIT !

Attendez 2 minutes que Railway redéploie. Les erreurs vont disparaître.
