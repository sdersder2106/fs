# 🔔 REAL-TIME NOTIFICATIONS WITH WEBSOCKET

## Overview

Base44 now includes a complete real-time notification system using Socket.io WebSocket for instant updates across the platform.

## Features

### Real-Time Notifications
- **Instant Delivery**: Notifications appear immediately without page refresh
- **Toast Notifications**: Non-intrusive pop-ups for new events
- **Notification Center**: Dropdown with all notifications
- **Unread Count Badge**: Visual indicator of unread messages
- **Connection Status**: Live indicator showing WebSocket connection

### Event Types
- **Finding Events**: New findings, status changes, assignments
- **Pentest Events**: Status updates, completion notifications
- **Report Events**: Generation complete, ready for download
- **Comment Events**: New comments on findings/pentests
- **System Events**: Important system-wide announcements

### Real-Time Features
- **Entity Updates**: Live updates when viewing findings/pentests
- **Typing Indicators**: See who's typing in comments
- **Online Users**: Track who's currently online
- **Broadcast Updates**: Company-wide notifications

## Technical Implementation

### WebSocket Server (`lib/websocket.ts`)
- **Authentication**: JWT-based auth via cookies
- **Rooms**: User, company, and entity-specific rooms
- **Event Handlers**: Subscribe, unsubscribe, mark as read
- **Broadcasting**: Company-wide and role-based notifications

### Client Hook (`hooks/useWebSocket.tsx`)
- **Auto-connect**: Connects automatically when logged in
- **Reconnection**: Auto-reconnect with exponential backoff
- **State Management**: Notifications, unread count, online users
- **Event Subscriptions**: Subscribe to specific entities

### Components
- **NotificationDropdown**: Header notification bell with dropdown
- **Toast System**: Floating notifications with actions
- **Connection Indicator**: Shows real-time connection status

## Usage

### Starting the Server

```bash
# Development mode with WebSocket
npm run dev

# Production mode
npm run build
npm start
```

The custom server (`server.js`) initializes both Next.js and the WebSocket server.

### Using in Components

```tsx
import { useWebSocket } from '@/hooks/useWebSocket';

function MyComponent() {
  const { 
    notifications, 
    unreadCount, 
    connected,
    subscribe,
    markAsRead 
  } = useWebSocket({
    onNotification: (notification) => {
      console.log('New notification:', notification);
    },
    onEntityUpdate: (update) => {
      console.log('Entity updated:', update);
    }
  });

  // Subscribe to a specific finding
  useEffect(() => {
    subscribe('finding', findingId);
    return () => unsubscribe('finding', findingId);
  }, [findingId]);

  return (
    <div>
      {connected ? 'Connected' : 'Disconnected'}
      <span>Unread: {unreadCount}</span>
    </div>
  );
}
```

### Sending Notifications (Server-side)

```typescript
import { notificationHelpers } from '@/lib/websocket';

// When a new finding is created
await notificationHelpers.notifyNewFinding(finding);

// When pentest status changes
await notificationHelpers.notifyPentestStatusChange(
  pentest, 
  oldStatus, 
  newStatus
);

// When report is generated
await notificationHelpers.notifyReportGenerated(report);
```

### Typing Indicators

```tsx
const { sendTyping, getTypingUsers } = useWebSocket();

// Send typing indicator
const handleTyping = () => {
  sendTyping('finding', findingId, true);
  
  // Stop typing after 2 seconds
  setTimeout(() => {
    sendTyping('finding', findingId, false);
  }, 2000);
};

// Get typing users
const typingUsers = getTypingUsers('finding', findingId);
```

## WebSocket Events

### Client → Server Events
- `subscribe`: Subscribe to entity updates
- `unsubscribe`: Unsubscribe from entity
- `markAsRead`: Mark notification as read
- `markAllAsRead`: Mark all as read
- `getUnreadCount`: Request unread count
- `typing`: Send typing indicator

### Server → Client Events
- `notification`: New notification received
- `entityUpdate`: Entity data updated
- `newComment`: New comment posted
- `userTyping`: User typing indicator
- `onlineUsers`: List of online users
- `unreadCount`: Updated unread count

## Database Schema

The notification system uses the existing Notification model:

```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  type      String
  title     String
  message   String
  link      String?
  metadata  Json?
  read      Boolean  @default(false)
  readAt    DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Security

- **JWT Authentication**: All WebSocket connections are authenticated
- **Company Isolation**: Users only receive notifications for their company
- **Entity Access Control**: Subscription verified against user permissions
- **Rate Limiting**: Connection limits per user
- **CORS Configuration**: Restricted to application domain

## Performance

- **Connection Pooling**: Reuses socket connections
- **Room-based Broadcasting**: Efficient message routing
- **Lazy Loading**: Notifications loaded on demand
- **Debounced Updates**: Prevents notification spam
- **Optimistic UI**: Immediate visual feedback

## Configuration

Add to `.env.local`:

```env
# WebSocket Configuration (optional)
WS_PORT=3001  # If different from main app
WS_PING_INTERVAL=30000  # Ping interval in ms
WS_PING_TIMEOUT=5000    # Ping timeout in ms
WS_MAX_CONNECTIONS=1000  # Max concurrent connections
```

## Troubleshooting

### Connection Issues
1. Check browser console for WebSocket errors
2. Verify server.js is running (not next dev directly)
3. Check authentication cookies are present
4. Verify NEXTAUTH_SECRET is set

### Notifications Not Appearing
1. Check connection status indicator
2. Verify user permissions
3. Check browser notification permissions
4. Look for errors in server console

### Performance Issues
1. Reduce notification frequency
2. Implement pagination for notification list
3. Clear old notifications periodically
4. Monitor WebSocket connection count

## Best Practices

1. **Batch Notifications**: Group related notifications
2. **Priority Levels**: Implement urgency levels
3. **User Preferences**: Allow notification settings
4. **Cleanup**: Remove old notifications periodically
5. **Fallback**: Store critical notifications in DB
6. **Testing**: Test with multiple concurrent users

## Future Enhancements

- Push notifications (PWA)
- Email notification digests
- Notification categories/filters
- Do Not Disturb mode
- Notification sounds
- Read receipts
- Notification templates
- Mobile app support

---

The real-time notification system is now fully integrated and ready for use!