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
  statusLabel: string
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

// Data shape from the WebSocket server's location:update event
interface ServerLocationUpdate {
  orderId: string
  driverLocation: DriverLocation
  eta: number
  etaText: string
  progress: number
  status: string
  statusLabel: string
}

// Data shape from the WebSocket server's order:status event
interface ServerOrderStatus {
  orderId: string
  status: string
  note?: string
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
      socketRef.current.emit('leave-order', orderIdRef.current)
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

      // Join order room to receive tracking updates
      socket.emit('join-order', targetOrderId)
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

    // Location update from server (driver position, ETA, progress)
    socket.on('location:update', (data: ServerLocationUpdate) => {
      if (data.orderId === orderIdRef.current) {
        const loc = data.driverLocation

        setTracking((prev) => {
          // Initialize tracking data on first location update if not yet set
          const base = prev || {
            orderId: data.orderId,
            driverId: 'driver-1',
            driverName: 'Carlos Entregas',
            driverPhone: '(91) 99999-1234',
            driverVehicle: 'Honda CG 160',
            driverPlate: 'PAZ-1A23',
            driverAvatar: null,
            driverRating: 4.8,
            storeLocation: { lat: -3.4025, lng: -49.8253, name: 'Dom Eliseu Centro' },
            destinationLocation: { lat: -3.4058, lng: -49.8301, address: 'Rua Principal, 123' },
            distanceRemaining: 2.5,
            distanceTotal: 5.0,
            statusHistory: [{ status: data.status, timestamp: new Date().toISOString() }],
            startedAt: new Date().toISOString(),
          }

          const updated: OrderTracking = {
            ...base,
            location: loc,
            eta: data.eta,
            etaText: data.etaText,
            progress: data.progress,
            status: data.status || base.status,
            statusLabel: data.statusLabel || base.statusLabel,
          }

          setTrackingData({
            orderId: data.orderId,
            driverLocation: loc,
            eta: data.eta,
            etaText: data.etaText,
            progress: data.progress,
            status: data.status || base.status,
            statusLabel: data.statusLabel || getStatusLabel(data.status || base.status),
            driverName: base.driverName,
            driverVehicle: base.driverVehicle,
          })

          return updated
        })
      }
    })

    // Order status change from server
    socket.on('order:status', (data: ServerOrderStatus) => {
      if (data.orderId === orderIdRef.current) {
        const statusLabel = getStatusLabel(data.status)

        setTracking((prev) => {
          if (!prev) return prev
          const updated: OrderTracking = {
            ...prev,
            status: data.status,
            statusLabel,
            statusHistory: [
              ...prev.statusHistory,
              { status: data.status, timestamp: new Date().toISOString() },
            ],
          }

          setTrackingData({
            orderId: prev.orderId,
            driverLocation: prev.location,
            eta: prev.eta,
            etaText: prev.etaText,
            progress: prev.progress,
            status: data.status,
            statusLabel,
            driverName: prev.driverName,
            driverVehicle: prev.driverVehicle,
          })

          return updated
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
    // Server doesn't have a manual update endpoint;
    // location updates are broadcast in real-time by the driver
    console.log('[useDeliveryTracking] Updates are broadcast in real-time; no manual request needed.')
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
  delivering: 'A caminho',
  DELIVERED: 'Entregue',
}

function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] || status
}
