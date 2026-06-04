// @ts-nocheck
import { createServer } from 'http'
import { Server } from 'socket.io'

// ============================================
// Servidor HTTP + Socket.IO
// ============================================

const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// ============================================
// Tipos
// ============================================

interface TrackingSession {
  orderId: string
  socketId: string
  intervalId: ReturnType<typeof setInterval> | null
}

interface DriverLocation {
  lat: number
  lng: number
  heading: number
  speed: number
  accuracy: number
}

interface OrderTrackingData {
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

type OrderStatus = 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERING' | 'DELIVERED'

const STATUS_FLOW: OrderStatus[] = ['CONFIRMED', 'PREPARING', 'READY', 'DELIVERING', 'DELIVERED']

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: 'Pedido confirmado',
  PREPARING: 'Preparando seu pedido',
  READY: 'Pronto para retirada',
  DELIVERING: 'A caminho da entrega',
  DELIVERED: 'Entregue',
}

// ============================================
// Estado em memória
// ============================================

const sessions = new Map<string, TrackingSession>() // orderId -> session
const trackingData = new Map<string, OrderTrackingData>() // orderId -> tracking data

// ============================================
// Coordenadas simuladas de Dom Eliseu, PA
// ============================================

// Centro aproximado de Dom Eliseu
const CENTER_LAT = -3.3917
const CENTER_LNG = -50.3558

// Locais simulados para lojas e destinos
function generateStoreLocation(orderId: string): { lat: number; lng: number; name: string } {
  // Lojas diferentes para pedidos diferentes
  const seed = hashCode(orderId)
  const storeNames = [
    'Açaí do Pará',
    'Mercadinho São José',
    'Farmácia Popular',
    'Padaria Nova Esperança',
    'Pet Shop Amigo Fiel',
    'Supermercado Bom Preço',
    'Restaurante Sabor da Terra',
    'Empório do Sabor',
  ]
  const storeIndex = Math.abs(seed) % storeNames.length

  return {
    lat: CENTER_LAT + (Math.abs(seed % 100) - 50) * 0.0002,
    lng: CENTER_LNG + (Math.abs((seed >> 8) % 100) - 50) * 0.0002,
    name: storeNames[storeIndex],
  }
}

function generateDestinationLocation(orderId: string): { lat: number; lng: number; address: string } {
  const seed = hashCode(orderId + 'dest')
  const addresses = [
    'Rua Sebastião Lima, 123 - Centro',
    'Av. Brasil, 456 - São Cristóvão',
    'Trav. Amazonas, 789 - Nova Esperança',
    'Rua Pará de Minas, 321 - Jardim Tropical',
    'Av. Altamira, 654 - Vila Nova',
    'Rua dos Ipês, 987 - Setor Comercial',
  ]
  const addressIndex = Math.abs(seed) % addresses.length

  return {
    lat: CENTER_LAT + (Math.abs(seed % 100) - 50) * 0.0003,
    lng: CENTER_LNG + (Math.abs((seed >> 8) % 100) - 50) * 0.0003,
    address: addresses[addressIndex],
  }
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return hash
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000 // raio da Terra em metros
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const la1 = (lat1 * Math.PI) / 180
  const la2 = (lat2 * Math.PI) / 180
  const y = Math.sin(dLng) * Math.cos(la2)
  const x = Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dLng)
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

// ============================================
// Simulação de movimento do entregador
// ============================================

function createTrackingData(orderId: string): OrderTrackingData {
  const store = generateStoreLocation(orderId)
  const destination = generateDestinationLocation(orderId)
  const totalDistance = calculateDistance(store.lat, store.lng, destination.lat, destination.lng)
  const initialEta = Math.max(5, Math.round(totalDistance / 300)) // ~300m/min para moto

  const drivers = [
    { id: 'drv_carlos', name: 'Carlos Silva', phone: '(91) 99999-1234', vehicle: 'Motocicleta', plate: 'PAZ-1A23', rating: 4.8 },
    { id: 'drv_maria', name: 'Maria Souza', phone: '(91) 98888-5678', vehicle: 'Motocicleta', plate: 'PAZ-4B56', rating: 4.9 },
    { id: 'drv_pedro', name: 'Pedro Santos', phone: '(91) 97777-9012', vehicle: 'Bicicleta', plate: 'N/A', rating: 4.7 },
    { id: 'drv_ana', name: 'Ana Oliveira', phone: '(91) 96666-3456', vehicle: 'Motocicleta', plate: 'PAZ-7C89', rating: 5.0 },
  ]
  const seed = hashCode(orderId)
  const driver = drivers[Math.abs(seed) % drivers.length]

  const now = new Date().toISOString()

  return {
    orderId,
    status: 'CONFIRMED',
    driverId: driver.id,
    driverName: driver.name,
    driverPhone: driver.phone,
    driverVehicle: driver.vehicle,
    driverPlate: driver.plate,
    driverAvatar: null,
    driverRating: driver.rating,
    location: {
      lat: store.lat,
      lng: store.lng,
      heading: calculateBearing(store.lat, store.lng, destination.lat, destination.lng),
      speed: 0,
      accuracy: 10,
    },
    storeLocation: store,
    destinationLocation: destination,
    eta: initialEta,
    etaText: `${initialEta} min`,
    distanceRemaining: totalDistance,
    distanceTotal: totalDistance,
    progress: 0,
    statusHistory: [{ status: 'CONFIRMED', timestamp: now }],
    startedAt: now,
  }
}

function simulateDriverMovement(orderId: string): OrderTrackingData | null {
  const data = trackingData.get(orderId)
  if (!data) return null

  // Só mover se estiver em entrega
  if (data.status !== 'DELIVERING') return data

  const dest = data.destinationLocation
  const distToDest = calculateDistance(data.location.lat, data.location.lng, dest.lat, dest.lng)

  if (distToDest < 20) {
    // Chegou ao destino
    data.status = 'DELIVERED'
    data.location.lat = dest.lat
    data.location.lng = dest.lng
    data.location.speed = 0
    data.eta = 0
    data.etaText = 'Chegou!'
    data.distanceRemaining = 0
    data.progress = 100
    data.statusHistory.push({ status: 'DELIVERED', timestamp: new Date().toISOString() })
    return data
  }

  // Calcular direção para o destino
  const bearing = calculateBearing(data.location.lat, data.location.lng, dest.lat, dest.lng)
  const bearingRad = (bearing * Math.PI) / 180

  // Simular velocidade variável (200-400 m/min para moto)
  const speed = 3 + Math.random() * 4 // metros por update (a cada 5s)
  const jitter = (Math.random() - 0.5) * 0.00002 // pequena variação lateral

  // Mover na direção
  const newLat = data.location.lat + (speed * Math.cos(bearingRad)) / 111000
  const newLng = data.location.lng + (speed * Math.sin(bearingRad)) / (111000 * Math.cos(data.location.lat * Math.PI / 180))

  data.location.lat = newLat + jitter
  data.location.lng = newLng + jitter
  data.location.heading = bearing
  data.location.speed = speed * 12 // converter para m/min (aprox)

  const newDist = calculateDistance(newLat, newLng, dest.lat, dest.lng)
  data.distanceRemaining = newDist
  data.progress = Math.min(95, Math.round(((data.distanceTotal - newDist) / data.distanceTotal) * 100))
  data.eta = Math.max(1, Math.round(newDist / 300))
  data.etaText = `${data.eta} min`

  return data
}

function advanceStatus(orderId: string): OrderTrackingData | null {
  const data = trackingData.get(orderId)
  if (!data) return null

  const currentIndex = STATUS_FLOW.indexOf(data.status as OrderStatus)
  if (currentIndex >= STATUS_FLOW.length - 1) return null

  const nextStatus = STATUS_FLOW[currentIndex + 1]
  data.status = nextStatus
  data.statusHistory.push({ status: nextStatus, timestamp: new Date().toISOString() })

  return data
}

// ============================================
// Eventos Socket.IO
// ============================================

io.on('connection', (socket) => {
  console.log(`[Tracking] Cliente conectado: ${socket.id}`)

  let currentOrderId: string | null = null
  let trackingInterval: ReturnType<typeof setInterval> | null = null

  // Iniciar rastreamento
  socket.on('track', (data: { orderId: string }) => {
    const { orderId } = data
    currentOrderId = orderId

    socket.join(orderId)

    // Criar ou obter dados de rastreamento
    if (!trackingData.has(orderId)) {
      trackingData.set(orderId, createTrackingData(orderId))
    }

    const data_ = trackingData.get(orderId)!

    // Enviar estado atual
    socket.emit('tracking:init', data_)
    console.log(`[Tracking] Rastreamento iniciado para pedido ${orderId} - Status: ${data_.status}`)

    // Timer de atualização de posição (a cada 5 segundos)
    if (trackingInterval) clearInterval(trackingInterval)

    trackingInterval = setInterval(() => {
      const updated = simulateDriverMovement(orderId)
      if (updated) {
        trackingData.set(orderId, updated)
        io.to(orderId).emit('location:update', {
          orderId,
          location: updated.location,
          eta: updated.eta,
          etaText: updated.etaText,
          distanceRemaining: updated.distanceRemaining,
          progress: updated.progress,
        })

        // Se entregue, parar o timer
        if (updated.status === 'DELIVERED') {
          io.to(orderId).emit('order:status', {
            orderId,
            status: updated.status,
            statusLabel: STATUS_LABELS[updated.status],
            timestamp: new Date().toISOString(),
          })
          if (trackingInterval) {
            clearInterval(trackingInterval)
            trackingInterval = null
          }
        }
      }
    }, 5000)

    // Simular progressão de status (a cada 30 segundos)
    const statusInterval = setInterval(() => {
      if (currentOrderId !== orderId) {
        clearInterval(statusInterval)
        return
      }
      const updated = advanceStatus(orderId)
      if (updated) {
        trackingData.set(orderId, updated)
        io.to(orderId).emit('order:status', {
          orderId,
          status: updated.status,
          statusLabel: STATUS_LABELS[updated.status],
          timestamp: new Date().toISOString(),
        })
        console.log(`[Tracking] Pedido ${orderId} -> ${updated.status} (${STATUS_LABELS[updated.status]})`)
      } else {
        clearInterval(statusInterval)
      }
    }, 30000)
  })

  // Solicitar atualização manual
  socket.on('update:request', (data: { orderId: string }) => {
    const tData = trackingData.get(data.orderId)
    if (tData) {
      socket.emit('tracking:update', tData)
    }
  })

  // Desconexão
  socket.on('disconnect', () => {
    if (currentOrderId) {
      // Limpar sessão
      sessions.delete(currentOrderId)

      if (trackingInterval) {
        clearInterval(trackingInterval)
        trackingInterval = null
      }

      console.log(`[Tracking] Cliente desconectou do rastreamento do pedido ${currentOrderId}`)
    } else {
      console.log(`[Tracking] Cliente desconectado: ${socket.id}`)
    }
  })

  socket.on('error', (error) => {
    console.error(`[Tracking] Erro no socket ${socket.id}:`, error)
  })
})

// ============================================
// Iniciar servidor
// ============================================

const PORT = 3004
httpServer.listen(PORT, () => {
  console.log(`[Tracking] Serviço de rastreamento rodando na porta ${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Tracking] Recebido SIGTERM, encerrando servidor...')
  // Limpar todos os intervals
  sessions.forEach((session) => {
    if (session.intervalId) clearInterval(session.intervalId)
  })
  httpServer.close(() => {
    console.log('[Tracking] Servidor encerrado')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('[Tracking] Recebido SIGINT, encerrando servidor...')
  sessions.forEach((session) => {
    if (session.intervalId) clearInterval(session.intervalId)
  })
  httpServer.close(() => {
    console.log('[Tracking] Servidor encerrado')
    process.exit(0)
  })
})
