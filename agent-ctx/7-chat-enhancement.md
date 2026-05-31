# Task 7: Enhanced Chat Hooks and Socket.IO Integration

## Files Modified

### 1. `/src/hooks/useChat.ts` — Complete rewrite

**What changed:**
- **Fixed port**: Changed from `XTransformPort=3004` to `XTransformPort=3003` (matching the actual chat service)
- **Global singleton socket manager**: Introduced a module-level singleton socket (`globalSocket`) that persists across component lifecycle. This avoids creating multiple WebSocket connections when multiple components use `useChat` simultaneously
- **Session change reconnection**: When the user ID changes (login/logout), the old socket is automatically disconnected and a new one created
- **Event broadcast system**: Added `connectionListeners`, `messageListeners`, and `typingListeners` sets that allow the global socket to broadcast events to all subscribed hooks
- **New `useChatConnection` hook**: A lightweight hook that keeps the global socket alive based on user session. Can be called from anywhere (e.g., the main layout or chat component) to maintain connection
- **Enhanced `useChat` hook**: Now subscribes to global events instead of creating its own socket. Properly joins/leaves order rooms on mount/unmount and orderId changes
- **Optimistic message updates**: Messages are pushed to both local state and the global Zustand store (`addChatMessage`)
- **Typing indicator with timer**: Uses `setTimeout` with cleanup to auto-clear typing after 3 seconds, properly managed via `typingTimerRef`

### 2. `/src/components/chat/AIChatBot.tsx` — Major enhancement

**What changed:**
- **Tab system**: Added two tabs — "Assistente" (AI bot) and "Pedidos" (order-based real-time chat)
- **Real-time order chat rooms**: When the "Pedidos" tab is selected, users see a list of active orders. Selecting an order opens a real-time chat room connected via Socket.IO
- **Room switching**: Users can tap an order to enter its chat room, and tap the back arrow to return to the order list. The socket joins/leaves rooms automatically
- **Real-time messages**: Displays messages from Socket.IO with sender name, timestamps, and own-message highlighting
- **Typing indicators**: Shows "X está digitando..." when another user in the room is typing (from `chat:typing` event)
- **Connection status**: Shows a red "Desconectado" banner when the Socket.IO connection drops, plus a disabled input field
- **AI bot preserved**: The AI assistant tab works exactly as before — sends to `/api/chat`, shows typing animation, quick action chips
- **Order info banner**: Shows store name, order number, and status badge at the top of each order chat
- **Quick action chips for order chat**: Suggested messages like "Qual o status do meu pedido?"
- **Smart order list**: Uses `selectedOrder` from the store if available, otherwise shows mock orders for demo
- **All text in Brazilian Portuguese**

## Architecture

```
AIChatBot (Sheet)
├── Tab: Assistente
│   ├── AI messages + BotTypingIndicator
│   ├── Quick action chips
│   └── Input → /api/chat (AI bot)
│
├── Tab: Pedidos
│   ├── No room selected → Order list (clickable cards)
│   └── Room selected
│       ├── Order info banner (store, status badge)
│       ├── Real-time messages (from useChat → Socket.IO)
│       ├── Typing indicator (from chat:typing event)
│       └── Input → Socket.IO (chat:message event)
│
└── ConnectionStatusBar (shown when disconnected)

Global Socket (singleton):
├── useChatConnection(userId, name, role) — keeps socket alive
├── useChat({orderId, ...}) — joins room, listens for messages
└── Module-level listeners broadcast to all hooks
```

## Lint Status
No new lint errors introduced. Pre-existing errors in `DeliveryTracker.tsx` and `OrderMap.tsx` are unrelated.
