'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

// WEBSOCKET DISABLED FOR PERFORMANCE
// The WebSocket connection was causing infinite reconnection loops
// Enable only when a proper WebSocket server is configured

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'finding' | 'pentest' | 'report' | 'comment';
  title: string;
  message: string;
  link?: string;
  metadata?: any;
  createdAt: Date;
  read?: boolean;
}

interface UseWebSocketOptions {
  onNotification?: (notification: Notification) => void;
  onEntityUpdate?: (update: any) => void;
  onComment?: (comment: any, entityType: string, entityId: string) => void;
  onUserTyping?: (data: any) => void;
  autoConnect?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { data: session } = useSession();
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock implementation - WebSocket disabled
  const connect = useCallback(() => {
    console.log('WebSocket disabled for performance');
  }, []);

  const disconnect = useCallback(() => {
    console.log('WebSocket disabled');
  }, []);

  const sendMessage = useCallback((event: string, data: any) => {
    console.log('WebSocket disabled - message not sent:', event);
  }, []);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Return mock implementation
  return {
    socket: null,
    connected: false,
    connect,
    disconnect,
    sendMessage,
    notifications,
    unreadCount,
    markNotificationAsRead,
    clearNotifications,
    typingUsers: new Set(),
    startTyping: () => {},
    stopTyping: () => {},
    joinRoom: () => {},
    leaveRoom: () => {},
    subscribeToEntity: () => {},
    unsubscribeFromEntity: () => {},
  };
}