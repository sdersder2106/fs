'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import { useSession } from 'next-auth/react';

interface PusherContextType {
  isConnected: boolean;
  pusher: Pusher | null;
  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
}

const PusherContext = createContext<PusherContextType>({
  isConnected: false,
  pusher: null,
  subscribe: () => {},
  unsubscribe: () => {},
});

export function PusherProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [pusher, setPusher] = useState<Pusher | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!session?.user) return;

    // Initialize Pusher
    const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: '/api/pusher/auth',
    });

    pusherClient.connection.bind('connected', () => {
      console.log('✅ Pusher connected');
      setIsConnected(true);
    });

    pusherClient.connection.bind('disconnected', () => {
      console.log('❌ Pusher disconnected');
      setIsConnected(false);
    });

    pusherClient.connection.bind('error', (err: any) => {
      console.error('Pusher error:', err);
    });

    const userId = (session.user as any).id;
    const companyId = (session.user as any).companyId;

    // Subscribe to user channel for personal notifications
    const userChannel = pusherClient.subscribe(`private-user-${userId}`);
    
    userChannel.bind('notification', (data: any) => {
      console.log('📬 Notification received:', data);
      // Handle notification (show toast, update UI, etc.)
    });

    // Subscribe to company channel for company-wide updates
    const companyChannel = pusherClient.subscribe(`private-company-${companyId}`);
    
    companyChannel.bind('update', (data: any) => {
      console.log('🔄 Company update:', data);
      // Handle company updates
    });

    companyChannel.bind('finding-created', (data: any) => {
      console.log('🐛 New finding:', data);
      // Handle new finding notification
    });

    companyChannel.bind('pentest-updated', (data: any) => {
      console.log('📝 Pentest updated:', data);
      // Handle pentest update
    });

    setPusher(pusherClient);

    return () => {
      pusherClient.unsubscribe(`private-user-${userId}`);
      pusherClient.unsubscribe(`private-company-${companyId}`);
      pusherClient.disconnect();
    };
  }, [session]);

  const subscribe = (channel: string) => {
    if (pusher) {
      pusher.subscribe(channel);
    }
  };

  const unsubscribe = (channel: string) => {
    if (pusher) {
      pusher.unsubscribe(channel);
    }
  };

  return (
    <PusherContext.Provider value={{ isConnected, pusher, subscribe, unsubscribe }}>
      {children}
    </PusherContext.Provider>
  );
}

export const usePusher = () => useContext(PusherContext);
