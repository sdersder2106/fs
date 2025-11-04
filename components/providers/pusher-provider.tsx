'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import { useSession } from 'next-auth/react';

const PusherContext = createContext({
  isConnected: false,
  pusher: null,
  sendMessage: () => {},
});

export function PusherProvider({ children }) {
  const { data: session } = useSession();
  const [pusher, setPusher] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!session?.user) return;

    const pusherClient = new Pusher('0ad42094e8713af8969b', {
      cluster: 'eu',
      authEndpoint: '/api/pusher/auth',
    });

    pusherClient.connection.bind('connected', () => {
      console.log('✅ Connected to Pusher');
      setIsConnected(true);
    });

    pusherClient.connection.bind('disconnected', () => {
      setIsConnected(false);
    });

    const userId = session.user.id;
    const companyId = session.user.companyId;

    if (userId) {
      const userChannel = pusherClient.subscribe(`private-user-${userId}`);
      userChannel.bind('notification', (data) => {
        console.log('Notification:', data);
      });
    }

    if (companyId) {
      const companyChannel = pusherClient.subscribe(`private-company-${companyId}`);
      companyChannel.bind('dashboard-update', (data) => {
        window.dispatchEvent(new CustomEvent('dashboard-update', { detail: data }));
      });
    }

    setPusher(pusherClient);

    return () => {
      pusherClient.disconnect();
    };
  }, [session]);

  const sendMessage = () => {};

  return (
    <PusherContext.Provider value={{ isConnected, pusher, sendMessage }}>
      {children}
    </PusherContext.Provider>
  );
}

export const usePusher = () => useContext(PusherContext);