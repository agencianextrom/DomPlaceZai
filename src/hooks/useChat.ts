'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAppStore } from '@/store/useAppStore'

// ============================================
// Tipos
// ============================================

export interface ChatMessage {
  id: string
  orderId: string
  senderId: string
  senderName: string
  receiverId: string | null
  driverId: string | null
  message: string
  attachment: string | null
  isRead: boolean
  createdAt: string
}

interface UseChatOptions {
  orderId: string
  accountId?: string
  accountName?: string
  autoConnect?: boolean
}

interface UseChatReturn {
  messages: ChatMessage[]
  sendMessage: (content: string, receiverId?: string, driverId?: string) => void
  sendTyping: (isTyping: boolean) => void
  markAsRead: () => void
  isTyping: boolean
  typingUsers: string[]
  isConnected: boolean
  reconnect: () => void
}

// ============================================
// Global singleton socket manager
// ============================================

let globalSocket: Socket | null = null
let globalUserId: string | null = null
let globalUserName: string | null = null
let globalUserRole: string = 'customer'
let connectionListeners: Set<() => void> = new Set()
let messageListeners: Set<(msg: ChatMessage) => void> = new Set()
let typingListeners: Set<(data: { orderId: string; senderId: string; senderName: string }) => void> = new Set()

function getOrCreateSocket(
  userId: string,
  userName: string,
  userRole: string,
  onConnect?: () => void,
  onDisconnect?: () => void,
): Socket {
  // If user session changed, disconnect old socket
  if (globalSocket && globalUserId !== userId) {
    console.log('[useChat] Sessão alterada, reconectando...')
    globalSocket.disconnect()
    globalSocket = null
  }

  if (globalSocket?.connected) {
    onConnect?.()
    return globalSocket
  }

  if (!globalSocket) {
    globalSocket = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 8000,
      timeout: 15000,
    })

    globalSocket.on('connect', () => {
      console.log('[useChat] Socket conectado:', globalSocket?.id)
      // Re-authenticate
      globalSocket!.emit('auth', {
        userId: globalUserId || userId,
        name: globalUserName || userName,
        role: globalUserRole || userRole,
      })
      connectionListeners.forEach((fn) => fn())
    })

    globalSocket.on('disconnect', (reason) => {
      console.log('[useChat] Socket desconectado:', reason)
      connectionListeners.forEach((fn) => fn())
    })

    globalSocket.on('connect_error', (error) => {
      console.error('[useChat] Erro de conexão:', error.message)
    })

    // Global message listener — broadcast to all subscribers
    globalSocket.on('chat:message', (msg: ChatMessage) => {
      messageListeners.forEach((fn) => fn(msg))
    })

    // Global typing listener
    globalSocket.on('chat:typing', (data: { orderId: string; senderId: string; senderName: string }) => {
      typingListeners.forEach((fn) => fn(data))
    })
  }

  globalUserId = userId
  globalUserName = userName
  globalUserRole = userRole

  return globalSocket
}

// ============================================
// useChatConnection — manages the global socket lifecycle
// Can be called from anywhere to keep the socket alive
// ============================================

export function useChatConnection(userId?: string, userName?: string, userRole: string = 'customer') {
  const setIsChatConnected = useAppStore((s) => s.setIsChatConnected)
  const isConnectedRef = useRef(false)

  useEffect(() => {
    if (!userId) return

    const onConnectionChange = () => {
      const connected = globalSocket?.connected ?? false
      isConnectedRef.current = connected
      setIsChatConnected(connected)
    }

    connectionListeners.add(onConnectionChange)
    getOrCreateSocket(userId, userName || 'Usuário', userRole, onConnectionChange)

    return () => {
      connectionListeners.delete(onConnectionChange)
      // Only disconnect when no more listeners remain
      if (connectionListeners.size === 0) {
        // Don't disconnect — keep alive for potential reconnect
      }
    }
  }, [userId, userName, userRole, setIsChatConnected])
}

// ============================================
// useChat — per-order chat hook
// ============================================

export function useChat(options: UseChatOptions): UseChatReturn {
  const { orderId, accountId, accountName = 'Usuário', autoConnect = true } = options
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setIsChatConnected = useAppStore((s) => s.setIsChatConnected)
  const addChatMessage = useAppStore((s) => s.addChatMessage)

  const orderIdRef = useRef(orderId)
  const accountIdRef = useRef(accountId || 'anonymous')
  const accountNameRef = useRef(accountName)

  // Keep refs in sync
  useEffect(() => {
    orderIdRef.current = orderId
  }, [orderId])

  useEffect(() => {
    accountIdRef.current = accountId || 'anonymous'
  }, [accountId])

  useEffect(() => {
    accountNameRef.current = accountName
  }, [accountName])

  // Disconnect from current order room
  const leaveCurrentRoom = useCallback(() => {
    if (globalSocket?.connected && orderIdRef.current) {
      globalSocket.emit('leave-order', orderIdRef.current)
      console.log(`[useChat] Saiu da sala: ${orderIdRef.current}`)
    }
  }, [])

  // Join a new order room
  const joinRoom = useCallback((newOrderId: string) => {
    if (globalSocket?.connected && newOrderId) {
      globalSocket.emit('join-order', newOrderId)
      console.log(`[useChat] Entrou na sala: ${newOrderId}`)
    }
  }, [])

  // Handle incoming message for this order
  const handleMessage = useCallback(
    (msg: ChatMessage) => {
      if (msg.orderId === orderIdRef.current) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev
          return [...prev, msg]
        })
        // Also push to global store
        addChatMessage(msg)
      }
    },
    [addChatMessage],
  )

  // Handle typing for this order
  const handleTyping = useCallback(
    (data: { orderId: string; senderId: string; senderName: string }) => {
      if (data.orderId === orderIdRef.current) {
        const accId = accountIdRef.current
        if (data.senderId !== accId) {
          setTypingUsers([data.senderName])
          setIsTyping(true)

          // Clear previous timer
          if (typingTimerRef.current) {
            clearTimeout(typingTimerRef.current)
          }
          // Auto-clear typing after 3 seconds
          typingTimerRef.current = setTimeout(() => {
            setTypingUsers((prev) => prev.filter((n) => n !== data.senderName))
            setIsTyping(false)
          }, 3000)
        }
      }
    },
    [],
  )

  // Listen for connection state changes
  const handleConnectionChange = useCallback(() => {
    const connected = globalSocket?.connected ?? false
    setIsConnected(connected)
    setIsChatConnected(connected)
  }, [setIsChatConnected])

  // Main effect: manage subscriptions and room membership
  useEffect(() => {
    if (!autoConnect || !orderId) return

    const accId = accountId || 'anonymous'

    // Subscribe to global events
    connectionListeners.add(handleConnectionChange)
    messageListeners.add(handleMessage)
    typingListeners.add(handleTyping)

    // Ensure socket exists
    const socket = getOrCreateSocket(accId, accountName, 'customer', handleConnectionChange)

    // Sync connection state via microtask to avoid direct setState in effect
    queueMicrotask(() => {
      setIsConnected(socket.connected)
    })

    // Join the order room once connected
    if (socket.connected) {
      joinRoom(orderId)
    } else {
      socket.on('connect', () => {
        joinRoom(orderIdRef.current)
      })
    }

    return () => {
      // Cleanup
      connectionListeners.delete(handleConnectionChange)
      messageListeners.delete(handleMessage)
      typingListeners.delete(handleTyping)

      leaveCurrentRoom()

      // Clear typing timer
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current)
        typingTimerRef.current = null
      }
    }
  }, [orderId, autoConnect, accountId, accountName, handleConnectionChange, handleMessage, handleTyping, joinRoom, leaveCurrentRoom, setIsChatConnected])

  // Send message
  const sendMessage = useCallback(
    (content: string, receiverId?: string, driverId?: string) => {
      if (!globalSocket?.connected || !content.trim()) return

      const accId = accountIdRef.current

      // Emit via WebSocket for real-time delivery
      globalSocket.emit('chat:message', {
        orderId: orderIdRef.current,
        message: content.trim(),
        senderId: accId,
        senderName: accountNameRef.current,
        receiverId: receiverId || null,
        driverId: driverId || null,
      })

      // Optimistically add message to local state
      const optimisticMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        orderId: orderIdRef.current,
        senderId: accId,
        senderName: accountNameRef.current,
        receiverId: receiverId || null,
        driverId: driverId || null,
        message: content.trim(),
        attachment: null,
        isRead: false,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, optimisticMsg])
      addChatMessage(optimisticMsg)
    },
    [addChatMessage],
  )

  // Send typing indicator (debounced internally)
  const sendTyping = useCallback(
    (typing: boolean) => {
      if (!globalSocket?.connected) return
      const accId = accountIdRef.current
      if (typing) {
        globalSocket.emit('chat:typing', {
          orderId: orderIdRef.current,
          senderId: accId,
          senderName: accountNameRef.current,
        })
      }
    },
    [],
  )

  // Mark messages as read (local state only)
  const markAsRead = useCallback(() => {
    const accId = accountIdRef.current
    setMessages((prev) =>
      prev.map((m) => ({
        ...m,
        isRead: m.senderId !== accId ? true : m.isRead,
      })),
    )
  }, [])

  // Manual reconnect
  const reconnect = useCallback(() => {
    if (globalSocket) {
      globalSocket.disconnect()
      globalSocket = null
    }
    connectionListeners.forEach((fn) => fn())
    const accId = accountIdRef.current
    getOrCreateSocket(accId, accountNameRef.current, 'customer', handleConnectionChange)
  }, [handleConnectionChange])

  return {
    messages,
    sendMessage,
    sendTyping,
    markAsRead,
    isTyping,
    typingUsers,
    isConnected,
    reconnect,
  }
}
