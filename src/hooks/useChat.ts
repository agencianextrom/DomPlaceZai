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
// Hook principal
// ============================================

export function useChat(options: UseChatOptions): UseChatReturn {
  const { orderId, accountId, accountName = 'Usuário', autoConnect = true } = options
  const socketRef = useRef<Socket | null>(null)
  const orderIdRef = useRef(orderId)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isConnected, setIsConnected] = useState(false)

  const setIsChatConnected = useAppStore((s) => s.setIsChatConnected)

  // Keep orderIdRef in sync
  useEffect(() => {
    orderIdRef.current = orderId
  }, [orderId])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      const accId = accountId || 'anonymous'
      socketRef.current.emit('leave-order', orderIdRef.current)
      socketRef.current.disconnect()
      socketRef.current = null
    }
    setIsConnected(false)
    setIsChatConnected(false)
  }, [accountId, setIsChatConnected])

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return
    const targetOrderId = orderIdRef.current
    if (!targetOrderId) return

    const socket = io('/?XTransformPort=3004', {
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 15000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setIsConnected(true)
      setIsChatConnected(true)
      console.log('[useChat] Conectado ao serviço de chat')

      const accId = accountId || 'anonymous'

      // Authenticate user
      socket.emit('auth', {
        userId: accId,
        name: accountName,
        role: 'customer',
      })

      // Join order room
      socket.emit('join-order', targetOrderId)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
      setIsChatConnected(false)
      console.log('[useChat] Desconectado do serviço de chat')
    })

    socket.on('connect_error', (error) => {
      console.error('[useChat] Erro de conexão:', error.message)
      setIsConnected(false)
    })

    // New message received from server
    socket.on('chat:message', (msg: ChatMessage) => {
      if (msg.orderId === orderIdRef.current) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev
          return [...prev, msg]
        })
      }
    })

    // Typing indicator from server
    socket.on('chat:typing', (data: { orderId: string; senderId: string; senderName: string }) => {
      if (data.orderId === orderIdRef.current) {
        const accId = accountId || 'anonymous'
        if (data.senderId !== accId) {
          setTypingUsers([data.senderName])
          setIsTyping(true)
          // Auto-clear typing after 3 seconds
          setTimeout(() => {
            setTypingUsers((prev) => prev.filter((n) => n !== data.senderName))
            setIsTyping(false)
          }, 3000)
        }
      }
    })
  }, [accountId, accountName, setIsChatConnected])

  // Auto-conectar quando orderId muda
  useEffect(() => {
    if (autoConnect && orderId) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      // Use requestAnimationFrame to avoid synchronous setState in effect
      requestAnimationFrame(() => {
        connect()
      })
    }

    return () => {
      disconnect()
    }
  }, [orderId, autoConnect, connect, disconnect])

  // Enviar mensagem
  const sendMessage = useCallback(
    (content: string, receiverId?: string, driverId?: string) => {
      if (!socketRef.current?.connected || !content.trim()) return

      const accId = accountId || 'anonymous'

      // Emit via WebSocket for real-time delivery
      socketRef.current.emit('chat:message', {
        orderId: orderIdRef.current,
        message: content.trim(),
        senderId: accId,
        senderName: accountName,
        receiverId: receiverId || null,
        driverId: driverId || null,
      })

      // Optimistically add message to local state
      const optimisticMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        orderId: orderIdRef.current,
        senderId: accId,
        senderName: accountName,
        receiverId: receiverId || null,
        driverId: driverId || null,
        message: content.trim(),
        attachment: null,
        isRead: false,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, optimisticMsg])
    },
    [accountId, accountName]
  )

  // Indicador de digitação
  const sendTyping = useCallback(
    (typing: boolean) => {
      if (!socketRef.current?.connected) return
      const accId = accountId || 'anonymous'
      if (typing) {
        socketRef.current.emit('chat:typing', {
          orderId: orderIdRef.current,
          senderId: accId,
          senderName: accountName,
        })
      }
    },
    [accountId, accountName]
  )

  // Marcar mensagens como lidas (local state only — server persists in production)
  const markAsRead = useCallback(() => {
    const accId = accountId || 'anonymous'
    setMessages((prev) =>
      prev.map((m) => ({
        ...m,
        isRead: m.senderId !== accId ? true : m.isRead,
      }))
    )
  }, [accountId])

  const reconnect = useCallback(() => {
    disconnect()
    setTimeout(() => {
      connect()
    }, 500)
  }, [connect, disconnect])

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
