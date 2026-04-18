'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAppStore } from '@/store/useAppStore'

// ============================================
// Tipos
// ============================================

export interface DriverLocation {
  lat: number
  lng: number
  heading: number
  speed: number
  accuracy: number
}

export interface TrackingStatus {
  status: string
  statusLabel: string
  timestamp: string
}

export interface OrderTracking {
  orderId: string
  status: string
  driverId: string
  driverName: string
  driverPhone: string
  driverVehicle: string
  driverPlate: string
  driverAvatar: string | null
  driverRating: number
  location: DriverLocation
  storeLocation: { lat: number; lng: number; name: string }
  destinationLocation: { lat: number; lng: number; address: string }
  eta: number
  etaText: string
  distanceRemaining: number
  distanceTotal: number
  progress: number
  statusHistory: { status: string; timestamp: string }[]
  startedAt: string
}

interface LocationUpdate {
  orderId: string
  location: DriverLocation
  eta: number
  etaText: string
  distanceRemaining: number
  progress: number
}

interface UseDeliveryTrackingOptions {
  orderId: string
  autoStart?: boolean
}

interface UseDeliveryTrackingReturn {
  tracking: OrderTracking | null
  driverLocation: DriverLocation | null
  orderStatus: string
  orderStatusLabel: string
  eta: number
  etaText: string
  progress: number
  isConnected: boolean
  isDelivered: boolean
  startTracking: () => void
  stopTracking: () => void
  requestUpdate: () => void
}

// ============================================
// Hook principal
// ============================================

export function useDeliveryTracking(options: UseDeliveryTrackingOptions): UseDeliveryTrackingReturn {
  const { orderId, autoStart = false } = options
  const socketRef = useRef<Socket | null>(null)
  const orderIdRef = useRef(orderId)
  const [tracking, setTracking] = useState<OrderTracking | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const setIsTrackingConnected = useAppStore((s) => s.setIsTrackingConnected)
  const setTrackingData = useAppStore((s) => s.setTrackingData)

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
    setIsTrackingConnected(false)
  }, [setIsTrackingConnected])

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
      setIsTrackingConnected(true)
      console.log('[useDeliveryTracking] Conectado ao serviço de rastreamento')

      // Iniciar rastreamento
      socket.emit('track', { orderId: targetOrderId })
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
      setIsTrackingConnected(false)
      console.log('[useDeliveryTracking] Desconectado do serviço de rastreamento')
    })

    socket.on('connect_error', (error) => {
      console.error('[useDeliveryTracking] Erro de conexão:', error.message)
      setIsConnected(false)
    })

    // Dados iniciais — naturally replaces previous state via callback
    socket.on('tracking:init', (data: OrderTracking) => {
      if (data.orderId === orderIdRef.current) {
        setTracking(data)
        setTrackingData({
          orderId: data.orderId,
          driverLocation: data.location,
          eta: data.eta,
          etaText: data.etaText,
          progress: data.progress,
          status: data.status,
          statusLabel: getStatusLabel(data.status),
          driverName: data.driverName,
          driverVehicle: data.driverVehicle,
        })
      }
    })

    // Atualização de localização
    socket.on('location:update', (data: LocationUpdate) => {
      if (data.orderId === orderIdRef.current) {
        setTracking((prev) => {
          if (!prev) return prev
          const updated = {
            ...prev,
            location: data.location,
            eta: data.eta,
            etaText: data.etaText,
            distanceRemaining: data.distanceRemaining,
            progress: data.progress,
          }
          setTrackingData({
            orderId: prev.orderId,
            driverLocation: data.location,
            eta: data.eta,
            etaText: data.etaText,
            progress: data.progress,
            status: prev.status,
            statusLabel: getStatusLabel(prev.status),
            driverName: prev.driverName,
            driverVehicle: prev.driverVehicle,
          })
          return updated
        })
      }
    })

    // Mudança de status
    socket.on('order:status', (data: TrackingStatus) => {
      if (data.orderId === orderIdRef.current) {
        setTracking((prev) => {
          if (!prev) return prev
          const updated = {
            ...prev,
            status: data.status,
            statusHistory: [
              ...prev.statusHistory,
              { status: data.status, timestamp: data.timestamp },
            ],
          }
          setTrackingData({
            orderId: prev.orderId,
            driverLocation: prev.location,
            eta: prev.eta,
            etaText: prev.etaText,
            progress: prev.progress,
            status: data.status,
            statusLabel: data.statusLabel,
            driverName: prev.driverName,
            driverVehicle: prev.driverVehicle,
          })
          return updated
        })
      }
    })

    // Atualização manual
    socket.on('tracking:update', (data: OrderTracking) => {
      if (data.orderId === orderIdRef.current) {
        setTracking(data)
        setTrackingData({
          orderId: data.orderId,
          driverLocation: data.location,
          eta: data.eta,
          etaText: data.etaText,
          progress: data.progress,
          status: data.status,
          statusLabel: getStatusLabel(data.status),
          driverName: data.driverName,
          driverVehicle: data.driverVehicle,
        })
      }
    })
  }, [setIsTrackingConnected, setTrackingData])

  // Auto-start
  useEffect(() => {
    if (autoStart && orderId) {
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
  }, [orderId, autoStart, connect, disconnect])

  const startTracking = useCallback(() => {
    disconnect()
    setTimeout(() => {
      connect()
    }, 500)
  }, [connect, disconnect])

  const stopTracking = useCallback(() => {
    disconnect()
  }, [disconnect])

  const requestUpdate = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('update:request', { orderId: orderIdRef.current })
    }
  }, [])

  const isDelivered = tracking?.status === 'DELIVERED'

  return {
    tracking,
    driverLocation: tracking?.location || null,
    orderStatus: tracking?.status || '',
    orderStatusLabel: tracking ? getStatusLabel(tracking.status) : '',
    eta: tracking?.eta || 0,
    etaText: tracking?.etaText || '--',
    progress: tracking?.progress || 0,
    isConnected,
    isDelivered,
    startTracking,
    stopTracking,
    requestUpdate,
  }
}

// ============================================
// Helpers
// ============================================

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: 'Pedido confirmado',
  PREPARING: 'Preparando seu pedido',
  READY: 'Pronto para retirada',
  DELIVERING: 'A caminho da entrega',
  DELIVERED: 'Entregue',
}

function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] || status
}
