import { createServer } from 'http'
import { Server } from 'socket.io'
import { createClient, type Client } from '@libsql/client'

// ============================================
// Configuração do banco Turso
// ============================================

const TURSO_URL = process.env.TURSO_DATABASE_URL || 'libsql://domplace-agencianextrom.aws-us-east-1.turso.io'
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || ''

const tursoDb: Client = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN,
})

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

interface ChatParticipant {
  socketId: string
  accountId: string
  orderId: string
}

interface ChatMessage {
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

// ============================================
// Estado em memória
// ============================================

const rooms = new Map<string, Set<ChatParticipant>>() // orderId -> participants
const typingUsers = new Map<string, Set<string>>() // orderId -> typing accountIds

function getRoomParticipants(orderId: string): Set<ChatParticipant> {
  if (!rooms.has(orderId)) {
    rooms.set(orderId, new Set())
  }
  return rooms.get(orderId)!
}

function getTypingUsers(orderId: string): Set<string> {
  if (!typingUsers.has(orderId)) {
    typingUsers.set(orderId, new Set())
  }
  return typingUsers.get(orderId)!
}

// ============================================
// Helpers de banco
// ============================================

async function saveMessage(msg: {
  orderId: string
  senderId: string
  receiverId: string | null
  driverId: string | null
  message: string
  attachment: string | null
}): Promise<ChatMessage> {
  const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  const now = new Date().toISOString()

  try {
    await tursoDb.execute({
      sql: `INSERT INTO ChatMessage (id, orderId, senderId, receiverId, driverId, message, attachment, isRead, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, msg.orderId, msg.senderId, msg.receiverId, msg.driverId, msg.message, msg.attachment, 0, now],
    })
  } catch (err) {
    console.error('Erro ao salvar mensagem no banco:', err)
  }

  return {
    id,
    orderId: msg.orderId,
    senderId: msg.senderId,
    receiverId: msg.receiverId,
    driverId: msg.driverId,
    message: msg.message,
    attachment: msg.attachment,
    isRead: false,
    createdAt: now,
  }
}

async function getMessages(orderId: string, limit = 50): Promise<ChatMessage[]> {
  try {
    const result = await tursoDb.execute({
      sql: `SELECT id, orderId, senderId, receiverId, driverId, message, attachment, isRead, createdAt
            FROM ChatMessage
            WHERE orderId = ?
            ORDER BY createdAt DESC
            LIMIT ?`,
      args: [orderId, String(limit)],
    })

    return result.rows.map((row) => ({
      id: row.id as string,
      orderId: (row.orderId as string) || '',
      senderId: row.senderId as string,
      receiverId: (row.receiverId as string) || null,
      driverId: (row.driverId as string) || null,
      message: row.message as string,
      attachment: (row.attachment as string) || null,
      isRead: Boolean(row.isRead),
      createdAt: row.createdAt as string,
    })).reverse()
  } catch (err) {
    console.error('Erro ao buscar mensagens:', err)
    return []
  }
}

async function markMessagesAsRead(orderId: string, receiverId: string): Promise<number> {
  try {
    await tursoDb.execute({
      sql: `UPDATE ChatMessage SET isRead = 1 WHERE orderId = ? AND senderId != ? AND isRead = 0`,
      args: [orderId, receiverId],
    })
    return 0 // turso doesn't return rows affected easily
  } catch (err) {
    console.error('Erro ao marcar mensagens como lidas:', err)
    return 0
  }
}

// ============================================
// Eventos Socket.IO
// ============================================

io.on('connection', (socket) => {
  console.log(`[Chat] Cliente conectado: ${socket.id}`)

  let currentOrderId: string | null = null
  let currentAccountId: string | null = null

  // Entrar na sala do pedido
  socket.on('join', async (data: { orderId: string; accountId: string }) => {
    const { orderId, accountId } = data
    currentOrderId = orderId
    currentAccountId = accountId

    // Adicionar à sala
    socket.join(orderId)
    const participants = getRoomParticipants(orderId)
    participants.add({ socketId: socket.id, accountId, orderId })

    console.log(`[Chat] ${accountId} entrou na sala do pedido ${orderId} (${participants.size} participantes)`)

    // Enviar histórico de mensagens
    const messages = await getMessages(orderId)
    socket.emit('messages:history', { messages, orderId })

    // Notificar outros na sala
    socket.to(orderId).emit('user:joined', {
      orderId,
      accountId,
      participantsCount: participants.size,
    })
  })

  // Enviar mensagem
  socket.on('message', async (data: {
    orderId: string
    message: string
    senderId: string
    receiverId?: string
    driverId?: string
    attachment?: string
  }) => {
    if (!data.message?.trim()) return

    const savedMessage = await saveMessage({
      orderId: data.orderId,
      senderId: data.senderId,
      receiverId: data.receiverId || null,
      driverId: data.driverId || null,
      message: data.message.trim(),
      attachment: data.attachment || null,
    })

    // Broadcast para todos na sala
    io.to(data.orderId).emit('message', savedMessage)
    console.log(`[Chat] Mensagem de ${data.senderId} no pedido ${data.orderId}: ${data.message.substring(0, 50)}...`)
  })

  // Indicador de digitação
  socket.on('typing', (data: { orderId: string; accountId: string; isTyping: boolean }) => {
    const { orderId, accountId, isTyping } = data
    const typing = getTypingUsers(orderId)

    if (isTyping) {
      typing.add(accountId)
    } else {
      typing.delete(accountId)
    }

    // Notificar outros (exceto quem está digitando)
    socket.to(orderId).emit('typing', {
      orderId,
      accountId,
      isTyping,
      typingUsers: Array.from(typing),
    })
  })

  // Marcar mensagens como lidas
  socket.on('read', async (data: { orderId: string; accountId: string }) => {
    const { orderId, accountId } = data

    await markMessagesAsRead(orderId, accountId)

    // Notificar remetentes que as mensagens foram lidas
    io.to(orderId).emit('messages:read', {
      orderId,
      readBy: accountId,
      timestamp: new Date().toISOString(),
    })
  })

  // Desconexão
  socket.on('disconnect', () => {
    if (currentOrderId && currentAccountId) {
      const participants = getRoomParticipants(currentOrderId)
      participants.forEach((p) => {
        if (p.socketId === socket.id) {
          participants.delete(p)
        }
      })

      // Remover dos typing
      const typing = getTypingUsers(currentOrderId)
      typing.delete(currentAccountId)

      // Notificar saída
      socket.to(currentOrderId).emit('user:left', {
        orderId: currentOrderId,
        accountId: currentAccountId,
        participantsCount: participants.size,
      })

      // Limpar sala vazia
      if (participants.size === 0) {
        rooms.delete(currentOrderId)
        typingUsers.delete(currentOrderId)
      }

      console.log(`[Chat] ${currentAccountId} desconectou da sala ${currentOrderId}`)
    } else {
      console.log(`[Chat] Cliente desconectado: ${socket.id}`)
    }
  })

  socket.on('error', (error) => {
    console.error(`[Chat] Erro no socket ${socket.id}:`, error)
  })
})

// ============================================
// Iniciar servidor
// ============================================

const PORT = 3003
httpServer.listen(PORT, () => {
  console.log(`[Chat] Serviço de chat rodando na porta ${PORT}`)
  console.log(`[Chat] Turso URL: ${TURSO_URL.replace(/:[^@]+@/, ':***@')}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Chat] Recebido SIGTERM, encerrando servidor...')
  httpServer.close(() => {
    console.log('[Chat] Servidor encerrado')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('[Chat] Recebido SIGINT, encerrando servidor...')
  httpServer.close(() => {
    console.log('[Chat] Servidor encerrado')
    process.exit(0)
  })
})
