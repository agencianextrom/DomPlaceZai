'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, MapPin, ImagePlus, Clock, CheckCircle, Package, Truck, ChefHat,
  MessageCircle, ArrowLeft, Check, CheckCheck, X, Smile, Phone,
  Navigation, ThumbsUp, Timer, DoorOpen, ImageIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

type ParticipantType = 'customer' | 'store' | 'driver'
type MessageType = 'text' | 'image' | 'location' | 'confirmation'
type OrderStatus = 'confirmed' | 'preparing' | 'delivering' | 'delivered'

interface ChatMessage {
  id: string; orderId: string; senderType: ParticipantType; senderName: string
  senderAvatar?: string; messageType: MessageType; content: string
  locationData?: { address: string; lat: number; lng: number }
  imageUrl?: string
  confirmationData?: { status: OrderStatus; note: string }
  timestamp: Date; isRead: boolean
}

interface OrderInfo {
  id: string; orderNumber: string; storeName: string; storeAvatar: string
  status: OrderStatus; eta: string; etaMinutes: number; total: string
  items: number; driverName: string; driverAvatar: string
  lastMessagePreview: string; unreadCount: number
}

// -----------------------------------------------------------------------
// Mock Data
// -----------------------------------------------------------------------

const now = Date.now()
const min = 60000

const MOCK_ORDERS: OrderInfo[] = [
  { id: 'ord-001', orderNumber: 'DP000452', storeName: 'Mercado do Zé', storeAvatar: 'MZ',
    status: 'delivering', eta: '~12 min', etaMinutes: 12, total: 'R$ 67,80', items: 5,
    driverName: 'Carlos Silva', driverAvatar: 'CS', lastMessagePreview: 'Estou a caminho, chegando em 12 min!', unreadCount: 3 },
  { id: 'ord-002', orderNumber: 'DP000398', storeName: 'Padaria Pão Quente', storeAvatar: 'PQ',
    status: 'preparing', eta: '~25 min', etaMinutes: 25, total: 'R$ 32,50', items: 3,
    driverName: 'Ana Oliveira', driverAvatar: 'AO', lastMessagePreview: 'Seu pão está no forno! 🍞', unreadCount: 1 },
  { id: 'ord-003', orderNumber: 'DP000350', storeName: 'Farmácia Vida Saudável', storeAvatar: 'FV',
    status: 'delivered', eta: 'Entregue', etaMinutes: 0, total: 'R$ 89,90', items: 2,
    driverName: 'Roberto Lima', driverAvatar: 'RL', lastMessagePreview: 'Entrega concluída. Obrigado!', unreadCount: 0 },
  { id: 'ord-004', orderNumber: 'DP000510', storeName: 'Açougue Bom Corte', storeAvatar: 'BC',
    status: 'confirmed', eta: '~40 min', etaMinutes: 40, total: 'R$ 112,00', items: 4,
    driverName: 'Aguardando...', driverAvatar: '--', lastMessagePreview: 'Pedido recebido, vamos preparar!', unreadCount: 2 },
]

function msg(overrides: Partial<ChatMessage> & Pick<ChatMessage, 'id' | 'orderId'>): ChatMessage {
  return { senderType: 'customer', senderName: 'Você', messageType: 'text', timestamp: new Date(), isRead: true, content: '', ...overrides }
}

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'ord-001': [
    msg({ id: 'm1', orderId: 'ord-001', senderType: 'store', senderName: 'Mercado do Zé', senderAvatar: 'MZ', content: 'Olá! Recebemos seu pedido e já começamos a separar os itens. 🛒', timestamp: new Date(now - 45*min) }),
    msg({ id: 'm2', orderId: 'ord-001', senderType: 'store', senderName: 'Mercado do Zé', senderAvatar: 'MZ', messageType: 'confirmation', content: 'Pedido confirmado!', confirmationData: { status: 'confirmed', note: 'Itens sendo separados' }, timestamp: new Date(now - 43*min) }),
    msg({ id: 'm3', orderId: 'ord-001', senderType: 'customer', content: 'Pode trocar a manteiga por margarina?', timestamp: new Date(now - 40*min) }),
    msg({ id: 'm4', orderId: 'ord-001', senderType: 'store', senderName: 'Mercado do Zé', senderAvatar: 'MZ', content: 'Claro! Trocamos sem problema. Sua sacola está quase pronta! ✅', timestamp: new Date(now - 38*min) }),
    msg({ id: 'm5', orderId: 'ord-001', senderType: 'store', senderName: 'Mercado do Zé', senderAvatar: 'MZ', messageType: 'confirmation', content: 'Pedido pronto!', confirmationData: { status: 'preparing', note: 'Entregador a caminho' }, timestamp: new Date(now - 30*min) }),
    msg({ id: 'm6', orderId: 'ord-001', senderType: 'driver', senderName: 'Carlos Silva', senderAvatar: 'CS', messageType: 'location', content: 'Estou na loja buscando seu pedido!', locationData: { address: 'Av. Brasil, 1234 - Centro', lat: -1.4558, lng: -48.5024 }, timestamp: new Date(now - 20*min) }),
    msg({ id: 'm7', orderId: 'ord-001', senderType: 'driver', senderName: 'Carlos Silva', senderAvatar: 'CS', content: 'Estou a caminho, chegando em 12 min!', timestamp: new Date(now - 8*min), isRead: false }),
    msg({ id: 'm8', orderId: 'ord-001', senderType: 'driver', senderName: 'Carlos Silva', senderAvatar: 'CS', messageType: 'image', content: 'Foto do pedido:', imageUrl: '📦🧴🍞🥛🧈', timestamp: new Date(now - 5*min), isRead: false }),
  ],
  'ord-002': [
    msg({ id: 'm20', orderId: 'ord-002', senderType: 'store', senderName: 'Padaria Pão Quente', senderAvatar: 'PQ', content: 'Bom dia! Seu pedido de pães foi recebido. 🥐', timestamp: new Date(now - 20*min) }),
    msg({ id: 'm21', orderId: 'ord-002', senderType: 'store', senderName: 'Padaria Pão Quente', senderAvatar: 'PQ', messageType: 'image', content: 'Seus pães saindo do forno:', imageUrl: '🍞🔥🥖', timestamp: new Date(now - 10*min), isRead: false }),
  ],
  'ord-003': [
    msg({ id: 'm30', orderId: 'ord-003', senderType: 'driver', senderName: 'Roberto Lima', senderAvatar: 'RL', messageType: 'confirmation', content: 'Entrega realizada!', confirmationData: { status: 'delivered', note: 'Deixado na portaria' }, timestamp: new Date(now - 180*min) }),
    msg({ id: 'm31', orderId: 'ord-003', senderType: 'customer', content: 'Obrigado! Recebi tudo certinho.', timestamp: new Date(now - 175*min) }),
    msg({ id: 'm32', orderId: 'ord-003', senderType: 'driver', senderName: 'Roberto Lima', senderAvatar: 'RL', content: 'Entrega concluída. Obrigado!', timestamp: new Date(now - 170*min) }),
  ],
  'ord-004': [
    msg({ id: 'm40', orderId: 'ord-004', senderType: 'store', senderName: 'Açougue Bom Corte', senderAvatar: 'BC', content: 'Pedido recebido, vamos preparar! Cortaremos na hora. 🥩', timestamp: new Date(now - 5*min), isRead: false }),
    msg({ id: 'm41', orderId: 'ord-004', senderType: 'store', senderName: 'Açougue Bom Corte', senderAvatar: 'BC', content: 'Pergunta rápida: picanha fina ou grossa?', timestamp: new Date(now - 2*min), isRead: false }),
  ],
}

// -----------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------

const QUICK_REPLIES = [
  { label: 'Obrigado!', icon: ThumbsUp },
  { label: 'Quanto tempo?', icon: Timer },
  { label: 'Pode deixar na porta', icon: DoorOpen },
]

const STORE_AUTO_REPLIES = [
  'Claro! Vamos verificar isso para você.',
  'Entendido! Preparando seu pedido com carinho.',
  'Sem problemas! Faremos a substituição.',
  'Seu pedido está indo bem! Quase pronto.',
  'Obrigado por comprar conosco! Qualquer dúvida é só falar.',
]

const DRIVER_AUTO_REPLIES = [
  'Tô a caminho! Mais uns minutinhos.',
  'Boa! Vou chegar em breve.',
  'Entendido, farei isso quando chegar.',
  'Vou verificar e te aviso!',
  'Pode ficar tranquilo, já estou com seu pedido.',
]

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: typeof CheckCircle }> = {
  confirmed: { label: 'Confirmado', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30', icon: CheckCircle },
  preparing: { label: 'Preparando', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/30', icon: ChefHat },
  delivering: { label: 'Em Entrega', color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30', icon: Truck },
  delivered: { label: 'Entregue', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30', icon: Package },
}

const PARTICIPANT_COLORS: Record<ParticipantType, { bg: string; text: string; avatarBg: string; nameColor: string }> = {
  customer: { bg: 'bg-blue-500', text: 'text-blue-50', avatarBg: 'bg-blue-600', nameColor: 'text-blue-600 dark:text-blue-400' },
  store: { bg: 'bg-emerald-500', text: 'text-emerald-50', avatarBg: 'bg-emerald-600', nameColor: 'text-emerald-600 dark:text-emerald-400' },
  driver: { bg: 'bg-orange-500', text: 'text-orange-50', avatarBg: 'bg-orange-600', nameColor: 'text-orange-600 dark:text-orange-400' },
}

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

function formatMessageTime(date: Date): string {
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / min)
  if (minutes < 1) return 'Agora'
  if (minutes < 60) return `${minutes}min atrás`
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h atrás`
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// -----------------------------------------------------------------------
// Sub-components
// -----------------------------------------------------------------------

function TypingIndicator() {
  return (
    <motion.div
      className="r51-chat-typing flex items-end gap-2 px-4 py-1"
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25 }}
    >
      <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center shrink-0">
        <div className="h-2 w-2 rounded-full bg-muted-foreground" />
      </div>
      <div className="r51-chat-typing-bubble bg-secondary rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-2 w-2 rounded-full bg-muted-foreground/50"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function DeliveryConfirmationBadge({ status, note }: { status: OrderStatus; note: string }) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon
  return (
    <motion.div
      className="r51-chat-confirmation flex items-center gap-3 rounded-xl p-3"
      style={{ background: 'rgba(16,185,129,0.08)' }}
      initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring' as const, stiffness: 350, damping: 22 }}
    >
      <motion.div
        className="r51-chat-confirmation-icon h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0"
        initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 20, delay: 0.1 }}
      >
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 500, damping: 25, delay: 0.3 }}>
          <Icon className="h-5 w-5 text-white" />
        </motion.div>
      </motion.div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{config.label}</p>
        <p className="text-xs text-emerald-600/70 dark:text-emerald-500/70 mt-0.5">{note}</p>
      </div>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: 'spring' as const, stiffness: 600, damping: 15, delay: 0.2 }}>
        <Check className="h-5 w-5 text-emerald-500" />
      </motion.div>
    </motion.div>
  )
}

function LocationShareMessage({ address }: { address: string }) {
  return (
    <motion.div
      className="r51-chat-location rounded-xl overflow-hidden"
      style={{ background: 'rgba(37,99,235,0.06)' }}
      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring' as const, stiffness: 350, damping: 22 }}
    >
      <div className="r51-chat-location-map relative h-28 bg-gradient-to-br from-blue-100 via-emerald-50 to-cyan-100 dark:from-blue-900/20 dark:via-emerald-900/10 dark:to-cyan-900/20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-blue-200/50 dark:bg-blue-700/30" />
          <div className="absolute top-0 bottom-0 left-1/3 w-px bg-blue-200/50 dark:bg-blue-700/30" />
          <div className="absolute top-0 bottom-0 left-2/3 w-px bg-blue-200/50 dark:bg-blue-700/30" />
          <div className="absolute top-1/4 left-0 right-0 h-px bg-blue-200/50 dark:bg-blue-700/30" />
          <div className="absolute top-3/4 left-0 right-0 h-px bg-blue-200/50 dark:bg-blue-700/30" />
        </div>
        <motion.div
          className="absolute top-1/2 left-1/2"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transform: 'translate(-50%, -100%)' }}
        >
          <div className="r51-chat-location-pin relative flex flex-col items-center">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center shadow-lg border-2 border-white">
              <Navigation className="h-4 w-4 text-white" />
            </div>
            <motion.div
              className="absolute -bottom-1 left-1/2 w-3 h-3 bg-blue-500 rotate-45"
              style={{ transformOrigin: 'center', marginLeft: '-6px' }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
        <motion.div
          className="absolute top-1/2 left-1/2 h-6 w-6 rounded-full border-2 border-blue-400/40"
          style={{ transform: 'translate(-50%, -50%)' }}
          animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
      <div className="px-3 py-2 flex items-center gap-2">
        <MapPin className="h-3.5 w-3.5 text-blue-500 shrink-0" />
        <p className="text-xs text-blue-700 dark:text-blue-300 truncate">{address}</p>
      </div>
    </motion.div>
  )
}

function ImagePreviewOverlay({ imageUrl, onClose }: { imageUrl: string; onClose: () => void }) {
  return (
    <motion.div
      className="r51-chat-image-overlay fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.8)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="r51-chat-image-preview relative rounded-2xl p-8"
        style={{ background: 'rgba(30,30,30,0.95)' }}
        initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.button
          className="r51-chat-image-close absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.15)' }}
          onClick={onClose}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="h-4 w-4 text-white" />
        </motion.button>
        <div className="r51-chat-image-content text-6xl text-center select-none">{imageUrl}</div>
        <p className="r51-chat-image-label text-xs text-white/50 text-center mt-3">Pré-visualização da imagem</p>
      </motion.div>
    </motion.div>
  )
}

function EmptyState() {
  return (
    <motion.div
      className="r51-chat-empty flex flex-col items-center justify-center py-16 px-4"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
    >
      <motion.div
        className="r51-chat-empty-icon h-20 w-20 rounded-full bg-secondary flex items-center justify-center mb-4"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <MessageCircle className="h-10 w-10 text-muted-foreground" />
      </motion.div>
      <p className="r51-chat-empty-title font-semibold text-sm text-muted-foreground">Nenhuma mensagem ainda</p>
      <p className="r51-chat-empty-desc text-xs text-muted-foreground/70 mt-1 text-center max-w-[200px]">
        Selecione um pedido para ver a conversa ou comece uma nova
      </p>
    </motion.div>
  )
}

function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <motion.div
      className="r51-chat-unread-badge relative flex items-center justify-center"
      initial={{ scale: 0 }} animate={{ scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 500, damping: 20 }}
    >
      <motion.div
        className="absolute inset-0 rounded-full bg-red-500"
        animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <span className="relative h-5 min-w-[20px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
        {count > 99 ? '99+' : count}
      </span>
    </motion.div>
  )
}

// -----------------------------------------------------------------------
// Message Bubble
// -----------------------------------------------------------------------

function MessageBubble({ message, onImageClick }: { message: ChatMessage; onImageClick: (url: string) => void }) {
  const isCustomer = message.senderType === 'customer'
  const colors = PARTICIPANT_COLORS[message.senderType]

  return (
    <motion.div
      className={`r51-chat-message r51-chat-message-${message.senderType} flex gap-2 ${isCustomer ? 'flex-row-reverse' : ''}`}
      initial={{ opacity: 0, y: 16, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
      layout
    >
      <motion.div
        className={`r51-chat-avatar r51-chat-avatar-${message.senderType} h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold text-white ${colors.avatarBg}`}
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: 'spring' as const, stiffness: 500, damping: 20, delay: 0.05 }}
      >
        {message.senderAvatar || '??'}
      </motion.div>
      <div className={`r51-chat-bubble r51-chat-bubble-${message.senderType} max-w-[75%] flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}>
        {!isCustomer && (
          <motion.p
            className={`r51-chat-sender-name text-[10px] font-medium mb-0.5 px-1 ${colors.nameColor}`}
            initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15, duration: 0.2 }}
          >
            {message.senderName}
          </motion.p>
        )}
        <div className="flex flex-col gap-1">
          {message.messageType === 'text' && (
            <motion.div
              className={`r51-chat-text-bubble r51-chat-text-${message.senderType} rounded-2xl px-3.5 py-2.5 ${
                isCustomer ? `${colors.bg} ${colors.text} rounded-tr-md` : 'bg-secondary text-foreground rounded-tl-md'
              }`}
              style={{ boxShadow: isCustomer ? '0 2px 8px rgba(37,99,235,0.15)' : '0 2px 8px rgba(0,0,0,0.06)' }}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
            </motion.div>
          )}
          {message.messageType === 'image' && message.imageUrl && (
            <motion.div
              className="r51-chat-image-bubble rounded-2xl overflow-hidden cursor-pointer"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}
              whileHover={{ scale: 1.02 }}
              onClick={() => onImageClick(message.imageUrl!)}
            >
              <div className="r51-chat-image-placeholder bg-secondary rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{message.content}</span>
                </div>
                <p className="text-4xl text-center py-2">{message.imageUrl}</p>
              </div>
            </motion.div>
          )}
          {message.messageType === 'location' && message.locationData && (
            <LocationShareMessage address={message.locationData.address} />
          )}
          {message.messageType === 'confirmation' && message.confirmationData && (
            <DeliveryConfirmationBadge status={message.confirmationData.status} note={message.confirmationData.note} />
          )}
        </div>
        <motion.div
          className={`r51-chat-timestamp flex items-center gap-1 mt-1 px-1 ${isCustomer ? 'flex-row-reverse' : ''}`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.3 }}
        >
          <span className="text-[10px] text-muted-foreground/60">{formatMessageTime(message.timestamp)}</span>
          {isCustomer && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' as const, stiffness: 500, damping: 20 }}>
              {message.isRead
                ? <CheckCheck className="h-3 w-3 text-blue-500" />
                : <Check className="h-3 w-3 text-muted-foreground/40" />}
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

// -----------------------------------------------------------------------
// Order Selector Item
// -----------------------------------------------------------------------

function OrderSelectorItem({ order, isSelected, onClick }: { order: OrderInfo; isSelected: boolean; onClick: () => void }) {
  const sc = STATUS_CONFIG[order.status]
  return (
    <motion.div
      className={`r51-chat-order-item relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
        isSelected ? 'bg-primary/10 border border-primary/20' : 'hover:bg-secondary/50 border border-transparent'
      }`}
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
    >
      <div className="r51-chat-order-avatar h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
        {order.storeAvatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold truncate">{order.storeName}</p>
          <span className={`r51-chat-order-status text-[9px] font-medium px-1.5 py-0.5 rounded-full ${sc.bgColor} ${sc.color}`}>{sc.label}</span>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          #{order.orderNumber} · {order.items} itens · {order.total}
        </p>
        <p className="text-[11px] text-muted-foreground/60 truncate mt-0.5">{order.lastMessagePreview}</p>
      </div>
      <div className="shrink-0 flex flex-col items-end gap-1">
        <UnreadBadge count={order.unreadCount} />
        {order.status !== 'delivered' && (
          <div className={`r51-chat-order-eta text-[9px] font-medium flex items-center gap-0.5 ${sc.color}`}>
            <Clock className="h-2.5 w-2.5" />{order.eta}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// -----------------------------------------------------------------------
// Order Info Header
// -----------------------------------------------------------------------

function OrderInfoHeader({ order }: { order: OrderInfo }) {
  const sc = STATUS_CONFIG[order.status]
  const StatusIcon = sc.icon
  const progressWidth = order.status === 'confirmed' ? '25%' : order.status === 'preparing' ? '50%' : order.status === 'delivering' ? '80%' : '100%'

  return (
    <motion.div className="r51-chat-header border-b border-border" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="r51-chat-header-avatar h-11 w-11 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ boxShadow: '0 2px 8px rgba(16,185,129,0.3)' }}
              whileHover={{ scale: 1.05 }}
            >
              {order.storeAvatar}
            </motion.div>
            <div>
              <p className="font-bold text-sm">{order.storeName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-muted-foreground">#{order.orderNumber}</span>
                <span className="text-border">·</span>
                <span className={`r51-chat-header-status text-[10px] font-semibold flex items-center gap-0.5 ${sc.color}`}>
                  <StatusIcon className="h-3 w-3" />{sc.label}
                </span>
              </div>
            </div>
          </div>
          {order.status !== 'delivered' && (
            <motion.div
              className={`r51-chat-header-eta text-right px-3 py-2 rounded-xl ${sc.bgColor}`}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />Previsão</p>
              <p className={`text-sm font-bold ${sc.color}`}>{order.eta}</p>
            </motion.div>
          )}
        </div>

        {/* Driver row */}
        {order.driverName !== 'Aguardando...' && (
          <motion.div
            className="r51-chat-header-driver flex items-center gap-2 mt-2.5 p-2 rounded-lg bg-secondary/50"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="r51-chat-driver-avatar h-7 w-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
              {order.driverAvatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium">{order.driverName}</p>
              <p className="text-[10px] text-muted-foreground">Entregador</p>
            </div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button size="icon" variant="ghost" className="r51-chat-driver-phone h-7 w-7 min-h-[44px] min-w-[44px] active:scale-95 transition-transform text-orange-500">
                <Phone className="h-3.5 w-3.5" />
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Progress bar */}
        {order.status !== 'delivered' && (
          <motion.div className="r51-chat-header-progress mt-2.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #10b981, #06b6d4)' }}
                initial={{ width: '0%' }}
                animate={{ width: progressWidth }}
                transition={{ duration: 1, ease: 'easeInOut' }}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[9px] text-muted-foreground">Pedido feito</span>
              <span className="text-[9px] text-muted-foreground">{order.total}</span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// -----------------------------------------------------------------------
// Quick Reply Button
// -----------------------------------------------------------------------

function QuickReplyButton({ label, icon: Icon, onClick }: { label: string; icon: typeof ThumbsUp; onClick: () => void }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button variant="outline" size="sm"
        className="r51-chat-quick-reply h-8 text-xs rounded-full border-primary/20 text-primary hover:bg-primary/5 gap-1.5 shrink-0"
        onClick={onClick}
      >
        <Icon className="h-3 w-3" />{label}
      </Button>
    </motion.div>
  )
}

// -----------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------

export function LiveOrderChat() {
  const [orders, setOrders] = useState<OrderInfo[]>(MOCK_ORDERS)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES)
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [showOrderList, setShowOrderList] = useState(true)
  const [showQuickReplies, setShowQuickReplies] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) ?? null
  const currentMessages = selectedOrderId ? (messagesMap[selectedOrderId] ?? []) : []

  // Scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [currentMessages.length, isTyping, scrollToBottom])

  // Select first unread order on mount
  useEffect(() => {
    const first = orders.find((o) => o.unreadCount > 0)
    if (first) setSelectedOrderId(first.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Mark as read when order selected
  useEffect(() => {
    if (!selectedOrderId) return
    setMessagesMap((prev) => {
      const msgs = prev[selectedOrderId]
      if (!msgs) return prev
      return { ...prev, [selectedOrderId]: msgs.map((m) => ({ ...m, isRead: true })) }
    })
    setOrders((prev) => prev.map((o) => o.id === selectedOrderId ? { ...o, unreadCount: 0 } : o))
  }, [selectedOrderId])

  // Hide quick replies after 3 customer messages
  useEffect(() => {
    if (!selectedOrderId) return
    const msgs = messagesMap[selectedOrderId] ?? []
    setShowQuickReplies(msgs.filter((m) => m.senderType === 'customer').length < 4)
  }, [selectedOrderId, messagesMap])

  // Simulate auto-reply
  const simulateAutoReply = useCallback((orderId: string) => {
    setIsTyping(true)
    const delay = 1500 + Math.random() * 2000
    setTimeout(() => {
      const isStore = Math.random() > 0.4
      const senderType: ParticipantType = isStore ? 'store' : 'driver'
      const order = orders.find((o) => o.id === orderId)
      const replies = isStore ? STORE_AUTO_REPLIES : DRIVER_AUTO_REPLIES
      const replyText = replies[Math.floor(Math.random() * replies.length)]
      const replyMessage: ChatMessage = {
        id: generateId(), orderId, senderType,
        senderName: isStore ? (order?.storeName ?? 'Loja') : (order?.driverName ?? 'Entregador'),
        senderAvatar: isStore ? (order?.storeAvatar ?? '??') : (order?.driverAvatar ?? '??'),
        messageType: 'text', content: replyText, timestamp: new Date(), isRead: false,
      }
      setMessagesMap((prev) => ({ ...prev, [orderId]: [...(prev[orderId] ?? []), replyMessage] }))
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o
          if (o.id === selectedOrderId) return { ...o, lastMessagePreview: replyText.slice(0, 50) }
          return { ...o, lastMessagePreview: replyText.slice(0, 50), unreadCount: o.unreadCount + 1 }
        })
      )
      setIsTyping(false)
    }, delay)
  }, [orders, selectedOrderId])

  // Send message
  const sendMessage = useCallback((text: string, messageType: MessageType = 'text', extra?: Partial<ChatMessage>) => {
    if (!selectedOrderId || !text.trim()) return
    const newMessage: ChatMessage = {
      id: generateId(), orderId: selectedOrderId, senderType: 'customer', senderName: 'Você',
      messageType, content: text.trim(), timestamp: new Date(), isRead: false, ...extra,
    }
    setMessagesMap((prev) => ({ ...prev, [selectedOrderId]: [...(prev[selectedOrderId] ?? []), newMessage] }))
    setOrders((prev) => prev.map((o) => o.id === selectedOrderId ? { ...o, lastMessagePreview: text.trim().slice(0, 50) } : o))
    setInputText('')
    inputRef.current?.focus()
    simulateAutoReply(selectedOrderId)
  }, [selectedOrderId, simulateAutoReply])

  // Send location
  const sendLocation = useCallback(() => {
    if (!selectedOrderId) return
    sendMessage('📍 Minha localização atual', 'location', {
      locationData: { address: 'Rua das Flores, 123 - Centro, Dom Eliseu - PA', lat: -1.4558, lng: -48.5024 },
    })
  }, [selectedOrderId, sendMessage])

  // Send image
  const sendImage = useCallback(() => {
    if (!selectedOrderId) return
    const emojis = ['📦🛍️', '🎉🛒', '🍕🍔', '🥩🥦', '🍰☕', '🧴💊', '🍎🥛']
    sendMessage('📷 Foto enviada', 'image', { imageUrl: emojis[Math.floor(Math.random() * emojis.length)] })
  }, [selectedOrderId, sendMessage])

  const handleSubmit = useCallback((e: React.FormEvent) => { e.preventDefault(); sendMessage(inputText) }, [inputText, sendMessage])
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(inputText) } }, [inputText, sendMessage])
  const handleSelectOrder = useCallback((id: string) => { setSelectedOrderId(id); setShowOrderList(false) }, [])
  const handleBackToList = useCallback(() => setShowOrderList(true), [])

  return (
    <Card className="r51-chat-container border-border/50 overflow-hidden">
      <CardContent className="r51-chat-inner p-0">
        <div className="r51-chat-layout flex h-[560px] flex-col sm:flex-row">
          {/* Sidebar: Order list */}
          <AnimatePresence mode="wait">
            {(showOrderList || !selectedOrderId) && (
              <motion.div
                className="r51-chat-sidebar w-full sm:w-72 border-r border-border flex flex-col shrink-0"
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
              >
                <div className="r51-chat-sidebar-header px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <h2 className="font-bold text-sm">Chat do Pedido</h2>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {orders.length} pedidos · {orders.reduce((s, o) => s + o.unreadCount, 0)} não lidas
                  </p>
                </div>
                <ScrollArea className="r51-chat-order-list flex-1">
                  <div className="p-2 space-y-1">
                    {orders.map((order) => (
                      <OrderSelectorItem key={order.id} order={order} isSelected={order.id === selectedOrderId} onClick={() => handleSelectOrder(order.id)} />
                    ))}
                  </div>
                </ScrollArea>
                <div className="r51-chat-sidebar-footer px-4 py-2 border-t border-border">
                  <p className="text-[10px] text-muted-foreground/60 text-center">Selecione um pedido para conversar</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Chat Area */}
          <div className="r51-chat-main flex-1 flex flex-col min-w-0">
            {!selectedOrderId && <EmptyState />}

            {selectedOrder && (
              <>
                {/* Top bar */}
                <div className="r51-chat-top-bar">
                  <motion.div className="r51-chat-back sm:hidden px-2 py-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <motion.div whileTap={{ scale: 0.9 }}>
                      <Button variant="ghost" size="sm" className="min-h-[44px] min-w-[44px] r51-chat-back-btn h-8 gap-1 text-muted-foreground active:scale-95 transition-transform" onClick={handleBackToList}>
                        <ArrowLeft className="h-4 w-4" />Voltar
                      </Button>
                    </motion.div>
                  </motion.div>
                  <OrderInfoHeader order={selectedOrder} />
                </div>

                {/* Messages */}
                <div className="r51-chat-messages flex-1 overflow-y-auto px-4 py-3">
                  <div className="r51-chat-messages-list space-y-3">
                    <motion.div className="r51-chat-start-marker flex items-center justify-center py-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                      <span className="text-[10px] text-muted-foreground/60 bg-secondary/80 px-3 py-1 rounded-full">
                        Início da conversa · #{selectedOrder.orderNumber}
                      </span>
                    </motion.div>
                    <AnimatePresence mode="popLayout">
                      {currentMessages.map((m, idx) => (
                        <motion.div key={m.id}
                          initial={{ opacity: 0, y: 16, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ type: 'spring' as const, stiffness: 400, damping: 25, delay: Math.min(idx * 0.04, 0.3) }}
                          layout
                        >
                          <MessageBubble message={m} onImageClick={setPreviewImage} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <AnimatePresence>{isTyping && <TypingIndicator />}</AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Quick replies */}
                <AnimatePresence>
                  {showQuickReplies && currentMessages.length > 0 && !isTyping && (
                    <motion.div
                      className="r51-chat-quick-replies px-4 py-2 border-t border-border/50"
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ScrollArea className="w-full">
                        <div className="flex gap-2 pb-1">
                          {QUICK_REPLIES.map((qr) => (
                            <QuickReplyButton key={qr.label} label={qr.label} icon={qr.icon} onClick={() => sendMessage(qr.label)} />
                          ))}
                        </div>
                      </ScrollArea>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Input area */}
                <motion.div className="r51-chat-input-area px-4 py-3 border-t border-border" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <div className="r51-chat-actions flex items-center gap-1 mb-2">
                    <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                      <Button variant="ghost" size="sm"
                        className="r51-chat-location-btn h-7 w-7 p-0 min-h-[44px] min-w-[44px] active:scale-95 transition-transform text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        onClick={sendLocation} title="Enviar localização"
                      >
                        <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
                          <MapPin className="h-4 w-4" />
                        </motion.div>
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                      <Button variant="ghost" size="sm"
                        className="r51-chat-image-btn h-7 w-7 p-0 min-h-[44px] min-w-[44px] active:scale-95 transition-transform text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        onClick={sendImage} title="Enviar imagem"
                      >
                        <ImagePlus className="h-4 w-4" />
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                      <Button variant="ghost" size="sm"
                        className="r51-chat-emoji-btn h-7 w-7 p-0 min-h-[44px] min-w-[44px] active:scale-95 transition-transform text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                        title="Emoji"
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                  <form onSubmit={handleSubmit} className="r51-chat-form flex gap-2">
                    <Input
                      ref={inputRef} value={inputText} onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown} placeholder="Digite sua mensagem..."
                      className="r51-chat-input flex-1 h-10 text-sm rounded-xl" disabled={isTyping}
                    />
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}>
                      <Button type="submit" size="icon"
                        className="r51-chat-send-btn h-10 w-10 min-h-[44px] min-w-[44px] rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                        disabled={!inputText.trim() || isTyping}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </form>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </CardContent>

      {/* Image preview overlay */}
      <AnimatePresence>
        {previewImage && <ImagePreviewOverlay imageUrl={previewImage} onClose={() => setPreviewImage(null)} />}
      </AnimatePresence>
    </Card>
  )
}

export default LiveOrderChat
