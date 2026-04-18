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
  const { orderId, accountId, autoConnect = true } = options
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
      socketRef.current.disconnect()
      socketRef.current = null
    }
    setIsConnected(false)
    setIsChatConnected(false)
  }, [setIsChatConnected])

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return
    const targetOrderId = orderIdRef.current
    if (!targetOrderId) return

    const socket = io('/?XTransformPort=3003', {
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

      // Entrar na sala do pedido
      const accId = accountId || 'anonymous'
      socket.emit('join', { orderId: targetOrderId, accountId: accId })
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

    // Histórico de mensagens — this callback replaces state naturally
    socket.on('messages:history', (data: { messages: ChatMessage[]; orderId: string }) => {
      if (data.orderId === orderIdRef.current) {
        setMessages(data.messages)
      }
    })

    // Nova mensagem recebida
    socket.on('message', (msg: ChatMessage) => {
      if (msg.orderId === orderIdRef.current) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev
          return [...prev, msg]
        })
      }
    })

    // Indicador de digitação
    socket.on('typing', (data: { orderId: string; accountId: string; isTyping: boolean; typingUsers: string[] }) => {
      if (data.orderId === orderIdRef.current) {
        const accId = accountId || 'anonymous'
        const otherTyping = data.typingUsers.filter((id) => id !== accId)
        setTypingUsers(otherTyping)
        setIsTyping(otherTyping.length > 0)
      }
    })

    // Mensagens lidas
    socket.on('messages:read', (data: { orderId: string; readBy: string }) => {
      if (data.orderId === orderIdRef.current) {
        setMessages((prev) =>
          prev.map((m) => ({
            ...m,
            isRead: m.senderId !== (accountId || 'anonymous') ? true : m.isRead,
          }))
        )
      }
    })
  }, [accountId, setIsChatConnected])

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

      socketRef.current.emit('message', {
        orderId: orderIdRef.current,
        message: content.trim(),
        senderId: accId,
        receiverId: receiverId || null,
        driverId: driverId || null,
      })
    },
    [accountId]
  )

  // Indicador de digitação
  const sendTyping = useCallback(
    (typing: boolean) => {
      if (!socketRef.current?.connected) return
      const accId = accountId || 'anonymous'
      socketRef.current.emit('typing', { orderId: orderIdRef.current, accountId: accId, isTyping: typing })
    },
    [accountId]
  )

  // Marcar mensagens como lidas
  const markAsRead = useCallback(() => {
    if (!socketRef.current?.connected) return
    const accId = accountId || 'anonymous'
    socketRef.current.emit('read', { orderId: orderIdRef.current, accountId: accId })
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
