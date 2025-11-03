'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { toast } from '@/components/ui/toast';

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

interface EntityUpdate {
  type: string;
  id: string;
  update: any;
  timestamp: Date;
}

interface Comment {
  id: string;
  text: string;
  author: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  createdAt: Date;
}

interface UseWebSocketOptions {
  onNotification?: (notification: Notification) => void;
  onEntityUpdate?: (update: EntityUpdate) => void;
  onComment?: (comment: Comment, entityType: string, entityId: string) => void;
  onUserTyping?: (data: { userId: string; entityType: string; entityId: string; isTyping: boolean }) => void;
  autoConnect?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, Set<string>>>(new Map());
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize socket connection
  const connect = useCallback(() => {
    if (socketRef.current?.connected || !session?.user) return;

    console.log('Initializing WebSocket connection...');

    const socketInstance = io({
      path: '/socket.io',
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socketInstance;

    // Connection events
    socketInstance.on('connect', () => {
      console.log('WebSocket connected');
      setConnected(true);
      
      // Get initial unread count
      socketInstance.emit('getUnreadCount');
    });

    socketInstance.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnected(false);
    });

    // Notification events
    socketInstance.on('notification', (notification: Notification) => {
      console.log('Received notification:', notification);
      
      // Add to notifications list
      setNotifications(prev => [notification, ...prev]);
      
      // Increment unread count
      setUnreadCount(prev => prev + 1);
      
      // Show toast notification
      showNotificationToast(notification);
      
      // Call custom handler if provided
      options.onNotification?.(notification);
    });

    socketInstance.on('unreadCount', (count: number) => {
      setUnreadCount(count);
    });

    socketInstance.on('notificationRead', ({ id }: { id: string }) => {
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    });

    socketInstance.on('allNotificationsRead', () => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    });

    // Entity update events
    socketInstance.on('entityUpdate', (update: EntityUpdate) => {
      console.log('Entity update:', update);
      options.onEntityUpdate?.(update);
    });

    // Comment events
    socketInstance.on('newComment', ({ comment, entityType, entityId }: any) => {
      console.log('New comment:', comment);
      options.onComment?.(comment, entityType, entityId);
    });

    // Typing indicators
    socketInstance.on('userTyping', (data: any) => {
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        const key = `${data.entityType}:${data.entityId}`;
        
        if (!newMap.has(key)) {
          newMap.set(key, new Set());
        }
        
        const users = newMap.get(key)!;
        if (data.isTyping) {
          users.add(data.userId);
        } else {
          users.delete(data.userId);
        }
        
        return newMap;
      });
      
      options.onUserTyping?.(data);
    });

    // Online users
    socketInstance.on('onlineUsers', (users: string[]) => {
      setOnlineUsers(users);
    });

    setSocket(socketInstance);
  }, [session, options]);

  // Disconnect socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
    }
  }, []);

  // Subscribe to entity updates
  const subscribe = useCallback((type: string, id: string) => {
    socketRef.current?.emit('subscribe', { type, id });
  }, []);

  // Unsubscribe from entity updates
  const unsubscribe = useCallback((type: string, id: string) => {
    socketRef.current?.emit('unsubscribe', { type, id });
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    socketRef.current?.emit('markAsRead', notificationId);
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    socketRef.current?.emit('markAllAsRead');
  }, []);

  // Send typing indicator
  const sendTyping = useCallback((entityType: string, entityId: string, isTyping: boolean) => {
    socketRef.current?.emit('typing', { entityType, entityId, isTyping });
  }, []);

  // Get typing users for entity
  const getTypingUsers = useCallback((entityType: string, entityId: string): Set<string> => {
    return typingUsers.get(`${entityType}:${entityId}`) || new Set();
  }, [typingUsers]);

  // Check if user is online
  const isUserOnline = useCallback((userId: string): boolean => {
    return onlineUsers.includes(userId);
  }, [onlineUsers]);

  // Auto-connect when session is available
  useEffect(() => {
    if (session?.user && options.autoConnect !== false) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      disconnect();
    };
  }, [session, connect, disconnect, options.autoConnect]);

  // Load initial notifications
  useEffect(() => {
    if (session?.user) {
      loadNotifications();
    }
  }, [session]);

  async function loadNotifications() {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.data.items);
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }

  return {
    socket,
    connected,
    notifications,
    unreadCount,
    onlineUsers,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    markAsRead,
    markAllAsRead,
    sendTyping,
    getTypingUsers,
    isUserOnline,
  };
}

// Helper function to show toast notifications
function showNotificationToast(notification: Notification) {
  const { title, message, type, link } = notification;
  
  // Map notification type to toast variant
  const variant = type === 'error' ? 'destructive' : 
                  type === 'warning' ? 'warning' :
                  type === 'success' ? 'success' : 
                  'default';

  // Show toast with action if link is provided
  toast({
    title,
    description: message,
    variant,
    action: link ? {
      label: 'View',
      onClick: () => {
        window.location.href = link;
      },
    } : undefined,
  });
}

// Export notification types for use in components
export type { Notification, EntityUpdate, Comment };