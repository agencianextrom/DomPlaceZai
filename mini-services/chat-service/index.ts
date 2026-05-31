import { Server } from 'socket.io'

const PORT = 3004

const io = new Server(PORT, {
  cors: {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
})

console.log(`[DomPlace Chat] WebSocket service running on port ${PORT}`)

// In-memory stores (would be connected to Turso DB in production)
const connectedUsers = new Map<string, { socketId: string; name: string; role: string }>()
const orderRooms = new Map<string, Set<string>>()

// Helper: get user info from connected users
function getUserInfo(socketId: string) {
  for (const [userId, info] of connectedUsers) {
    if (info.socketId === socketId) return { userId, ...info }
  }
  return null
}

io.on('connection', (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`)

  // Authenticate user
  socket.on('auth', (data: { userId: string; name: string; role: string }) => {
    connectedUsers.set(data.userId, {
      socketId: socket.id,
      name: data.name,
      role: data.role,
    })
    console.log(`[Socket] Auth: ${data.name} (${data.role})`)
  })

  // Join order room for real-time tracking
  socket.on('join-order', (orderId: string) => {
    socket.join(`order:${orderId}`)
    const room = orderRooms.get(orderId) || new Set()
    room.add(socket.id)
    orderRooms.set(orderId, room)
    console.log(`[Socket] Joined order room: ${orderId}`)
  })

  // Leave order room
  socket.on('leave-order', (orderId: string) => {
    socket.leave(`order:${orderId}`)
    const room = orderRooms.get(orderId)
    if (room) {
      room.delete(socket.id)
      if (room.size === 0) orderRooms.delete(orderId)
    }
  })

  // Chat message
  socket.on('chat:message', (data: { orderId: string; message: string; senderId: string; senderName: string }) => {
    const messageData = {
      id: `msg-${Date.now()}`,
      orderId: data.orderId,
      senderId: data.senderId,
      senderName: data.senderName,
      message: data.message,
      attachment: null,
      isRead: false,
      createdAt: new Date().toISOString(),
    }
    io.to(`order:${data.orderId}`).emit('chat:message', messageData)
  })

  // Typing indicator
  socket.on('chat:typing', (data: { orderId: string; senderId: string; senderName: string }) => {
    socket.to(`order:${data.orderId}`).emit('chat:typing', data)
  })

  // Delivery location update (from driver)
  socket.on('location:update', (data: { orderId: string; lat: number; lng: number; heading?: number; speed?: number; accuracy?: number }) => {
    io.to(`order:${data.orderId}`).emit('location:update', {
      orderId: data.orderId,
      driverLocation: {
        lat: data.lat,
        lng: data.lng,
        heading: data.heading || 0,
        speed: data.speed || 0,
        accuracy: data.accuracy || 10,
      },
      eta: Math.floor(Math.random() * 15) + 5, // Mock ETA
      etaText: `${Math.floor(Math.random() * 15) + 5} min`,
      progress: Math.random() * 0.6 + 0.2, // Random progress between 20-80%
      status: 'delivering',
      statusLabel: 'A caminho',
    })
  })

  // Order status update
  socket.on('order:status', (data: { orderId: string; status: string; note?: string }) => {
    io.to(`order:${data.orderId}`).emit('order:status', data)
  })

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`[Socket] Disconnected: ${socket.id}`)
    // Clean up user mapping
    for (const [userId, info] of connectedUsers) {
      if (info.socketId === socket.id) {
        connectedUsers.delete(userId)
        break
      }
    }
  })
})

// Health check endpoint (via custom event)
io.on('connection', (socket) => {
  socket.on('ping', () => socket.emit('pong', { timestamp: Date.now() }))
})

// Periodic stats logging
setInterval(() => {
  console.log(`[Stats] Connected users: ${connectedUsers.size}, Order rooms: ${orderRooms.size}`)
}, 60000)
