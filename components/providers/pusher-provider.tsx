'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Pusher from 'pusher-js';
import { useSession } from 'next-auth/react';

// Configuration Pusher
const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY || '0ad42094e8713af8969b';
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu';

interface PusherContextType {
  isConnected: boolean;
  pusher: Pusher | null;
  sendMessage: (channel: string, event: string, data: any) => void;
}

const PusherContext = createContext<PusherContextType>({
  isConnected: false,
  pusher: null,
  sendMessage: () => {},
});

export function PusherProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [pusher, setPusher] = useState<Pusher | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Si pas de session, pas de connexion
    if (!session?.user) {
      console.log('⏳ En attente de la session utilisateur...');
      return;
    }

    console.log('🚀 Initialisation de Pusher...');

    // Créer l'instance Pusher
    const pusherClient = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      authEndpoint: '/api/pusher/auth',
      auth: {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    });

    // Écouter l'état de connexion
    pusherClient.connection.bind('connected', () => {
      console.log('✅ Connecté à Pusher');
      setIsConnected(true);
    });

    pusherClient.connection.bind('disconnected', () => {
      console.log('❌ Déconnecté de Pusher');
      setIsConnected(false);
    });

    pusherClient.connection.bind('error', (err: any) => {
      console.error('❌ Erreur Pusher:', err);
    });

    // S'abonner aux canaux de l'utilisateur et de la compagnie
    const userId = session.user.id;
    const companyId = session.user.companyId;

    // Canal utilisateur privé
    const userChannel = pusherClient.subscribe(`private-user-${userId}`);
    
    userChannel.bind('pusher:subscription_succeeded', () => {
      console.log(`✅ Abonné au canal utilisateur: private-user-${userId}`);
    });

    userChannel.bind('notification', (data: any) => {
      console.log('📬 Notification utilisateur reçue:', data);
      // Afficher une notification toast
      if (typeof window !== 'undefined' && data.message) {
        // Si vous avez un système de toast, utilisez-le ici
        alert(`Notification: ${data.message}`);
      }
    });

    // Canal compagnie privé
    if (companyId) {
      const companyChannel = pusherClient.subscribe(`private-company-${companyId}`);
      
      companyChannel.bind('pusher:subscription_succeeded', () => {
        console.log(`✅ Abonné au canal compagnie: private-company-${companyId}`);
      });

      companyChannel.bind('notification', (data: any) => {
        console.log('📢 Notification compagnie reçue:', data);
      });

      companyChannel.bind('dashboard-update', (data: any) => {
        console.log('📊 Mise à jour dashboard:', data);
        // Déclencher un événement pour rafraîchir le dashboard
        window.dispatchEvent(new CustomEvent('dashboard-update', { detail: data }));
      });

      companyChannel.bind('new-comment', (data: any) => {
        console.log('💬 Nouveau commentaire:', data);
        window.dispatchEvent(new CustomEvent('new-comment', { detail: data }));
      });

      companyChannel.bind('new-finding', (data: any) => {
        console.log('🔍 Nouvelle découverte:', data);
        window.dispatchEvent(new CustomEvent('new-finding', { detail: data }));
      });
    }

    setPusher(pusherClient);

    // Nettoyage à la déconnexion
    return () => {
      console.log('🧹 Nettoyage Pusher...');
      pusherClient.unsubscribe(`private-user-${userId}`);
      if (companyId) {
        pusherClient.unsubscribe(`private-company-${companyId}`);
      }
      pusherClient.disconnect();
    };
  }, [session]);

  // Fonction pour envoyer des messages (si nécessaire)
  const sendMessage = (channel: string, event: string, data: any) => {
    if (pusher) {
      // Note: Pusher client ne peut pas trigger directement
      // Les messages doivent être envoyés via votre API backend
      console.log('📤 Envoi via API:', { channel, event, data });
      fetch('/api/pusher/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, event, data })
      });
    }
  };

  return (
    <PusherContext.Provider value={{ isConnected, pusher, sendMessage }}>
      {children}
    </PusherContext.Provider>
  );
}

// Hook pour utiliser Pusher
export const usePusher = () => useContext(PusherContext);

// Hook pour écouter les mises à jour du dashboard
export const useDashboardUpdates = (callback: (data: any) => void) => {
  useEffect(() => {
    const handler = (event: CustomEvent) => callback(event.detail);
    window.addEventListener('dashboard-update' as any, handler);
    return () => window.removeEventListener('dashboard-update' as any, handler);
  }, [callback]);
};

// Hook pour écouter les nouveaux commentaires
export const useCommentUpdates = (callback: (data: any) => void) => {
  useEffect(() => {
    const handler = (event: CustomEvent) => callback(event.detail);
    window.addEventListener('new-comment' as any, handler);
    return () => window.removeEventListener('new-comment' as any, handler);
  }, [callback]);
};

// Hook pour écouter les nouvelles découvertes
export const useFindingUpdates = (callback: (data: any) => void) => {
  useEffect(() => {
    const handler = (event: CustomEvent) => callback(event.detail);
    window.addEventListener('new-finding' as any, handler);
    return () => window.removeEventListener('new-finding' as any, handler);
  }, [callback]);
};
