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

// Data shape from the server's tracking:init event (full OrderTrackingData)
interface ServerTrackingInit {
  orderId: string
  status: string
  driverId: string
  driverName: string
  driverPhone: string
  driverVehicle: string
  driverPlate: string
  driverAvatar: string
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

// Data shape from the server's location:update event
interface ServerLocationUpdate {
  orderId: string
  location: DriverLocation
  eta: number
  etaText: string
  distanceRemaining: number
  progress: number
}

// Data shape from the server's order:status event
interface ServerOrderStatus {
  orderId: string
  status: string
  statusLabel: string
  timestamp: string
}

// Data shape from the server's tracking:update event (response to update:request)
interface ServerTrackingUpdate {
  orderId: string
  status: string
  driverId: string
  driverName: string
  driverPhone: string
  driverVehicle: string
  driverPlate: string
  driverAvatar: string
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
  distanceRemaining: number
  distanceTotal: number
  isConnected: boolean
  isConnecting: boolean
  isDelivered: boolean
  connectionError: string | null
  startTracking: () => void
  stopTracking: () => void
  requestUpdate: () => void
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

// Map server data to our OrderTracking type
function mapServerDataToTracking(data: ServerTrackingInit | ServerTrackingUpdate): OrderTracking {
  return {
    orderId: data.orderId,
    status: data.status,
    statusLabel: getStatusLabel(data.status),
    driverId: data.driverId,
    driverName: data.driverName,
    driverPhone: data.driverPhone,
    driverVehicle: data.driverVehicle,
    driverPlate: data.driverPlate,
    driverAvatar: data.driverAvatar || null,
    driverRating: data.driverRating,
    location: data.location,
    storeLocation: data.storeLocation,
    destinationLocation: data.destinationLocation,
    eta: data.eta,
    etaText: data.etaText,
    distanceRemaining: data.distanceRemaining,
    distanceTotal: data.distanceTotal,
    progress: data.progress,
    statusHistory: data.statusHistory || [],
    startedAt: data.startedAt,
  }
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
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

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
    setIsConnecting(false)
    setConnectionError(null)
    setIsTrackingConnected(false)
  }, [setIsTrackingConnected])

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return
    const targetOrderId = orderIdRef.current
    if (!targetOrderId) return

    setIsConnecting(true)
    setConnectionError(null)

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
      setIsConnecting(false)
      setIsTrackingConnected(true)
      setConnectionError(null)
      console.log('[useDeliveryTracking] Conectado ao serviço de rastreamento')

      // Start tracking for this order (server creates session and emits tracking:init)
      socket.emit('track', { orderId: targetOrderId })
    })

    socket.on('disconnect', (reason) => {
      setIsConnected(false)
      setIsConnecting(false)
      setIsTrackingConnected(false)
      console.log('[useDeliveryTracking] Desconectado do serviço de rastreamento:', reason)
    })

    socket.on('connect_error', (error) => {
      console.error('[useDeliveryTracking] Erro de conexão:', error.message)
      setIsConnected(false)
      setIsConnecting(false)
      setConnectionError('Erro ao conectar ao rastreamento')
    })

    // -- tracking:init: full initial data load --
    socket.on('tracking:init', (data: ServerTrackingInit) => {
      if (data.orderId === orderIdRef.current) {
        const mapped = mapServerDataToTracking(data)
        setTracking(mapped)

        setTrackingData({
          orderId: mapped.orderId,
          driverLocation: mapped.location,
          eta: mapped.eta,
          etaText: mapped.etaText,
          progress: mapped.progress,
          status: mapped.status,
          statusLabel: mapped.statusLabel,
          driverName: mapped.driverName,
          driverVehicle: mapped.driverVehicle,
        })

        console.log('[useDeliveryTracking] Dados iniciais recebidos:', mapped.status, '-', mapped.driverName)
      }
    })

    // -- location:update: real-time GPS updates every 5s --
    socket.on('location:update', (data: ServerLocationUpdate) => {
      if (data.orderId === orderIdRef.current) {
        const loc = data.location

        setTracking((prev) => {
          if (!prev) return prev

          const updated: OrderTracking = {
            ...prev,
            location: loc,
            eta: data.eta,
            etaText: data.etaText,
            distanceRemaining: data.distanceRemaining,
            progress: data.progress,
          }

          setTrackingData({
            orderId: data.orderId,
            driverLocation: loc,
            eta: data.eta,
            etaText: data.etaText,
            progress: data.progress,
            status: prev.status,
            statusLabel: prev.statusLabel,
            driverName: prev.driverName,
            driverVehicle: prev.driverVehicle,
          })

          return updated
        })
      }
    })

    // -- order:status: status change events --
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
              { status: data.status, timestamp: data.timestamp || new Date().toISOString() },
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

        console.log('[useDeliveryTracking] Status alterado:', data.status, '-', statusLabel)
      }
    })

    // -- tracking:update: full data response from update:request --
    socket.on('tracking:update', (data: ServerTrackingUpdate) => {
      if (data.orderId === orderIdRef.current) {
        const mapped = mapServerDataToTracking(data)
        setTracking(mapped)

        setTrackingData({
          orderId: mapped.orderId,
          driverLocation: mapped.location,
          eta: mapped.eta,
          etaText: mapped.etaText,
          progress: mapped.progress,
          status: mapped.status,
          statusLabel: mapped.statusLabel,
          driverName: mapped.driverName,
          driverVehicle: mapped.driverVehicle,
        })

        console.log('[useDeliveryTracking] Atualização completa recebida:', mapped.status)
      }
    })
  }, [setIsTrackingConnected, setTrackingData])

  // Auto-start tracking when orderId changes
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
    }, 300)
  }, [connect, disconnect])

  const stopTracking = useCallback(() => {
    disconnect()
  }, [disconnect])

  const requestUpdate = useCallback(() => {
    if (socketRef.current?.connected && orderIdRef.current) {
      socketRef.current.emit('update:request', { orderId: orderIdRef.current })
      console.log('[useDeliveryTracking] Solicitação de atualização enviada')
    } else {
      console.warn('[useDeliveryTracking] Não é possível solicitar atualização: não conectado')
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
    distanceRemaining: tracking?.distanceRemaining || 0,
    distanceTotal: tracking?.distanceTotal || 0,
    isConnected,
    isConnecting,
    isDelivered,
    connectionError,
    startTracking,
    stopTracking,
    requestUpdate,
  }
}
