import { create } from 'zustand'

export interface SellerMessage {
  id: string
  text: string
  sender: 'user' | 'seller'
  timestamp: string
}

export interface SellerConversation {
  id: string
  storeName: string
  storeEmoji: string
  category: string
  gradient: string
  online: boolean
  unread: number
  lastMessage: string
  lastTime: string
  messages: SellerMessage[]
  quickReplies: string[]
}

interface ChatSellerState {
  isOpen: boolean
  activeConversation: string | null
  searchQuery: string
  isTyping: boolean
  conversations: SellerConversation[]
  filteredConversations: SellerConversation[]

  // Actions
  toggleChat: () => void
  openChat: () => void
  closeChat: () => void
  selectConversation: (id: string) => void
  goBackToList: () => void
  setSearchQuery: (q: string) => void
  sendMessage: (conversationId: string, text: string) => void
  setTyping: (v: boolean) => void
}

const autoReplies: Record<string, string[]> = {
  padaria: [
    'Olá! Temos pão francês fresquinho saindo agora 😊',
    'O bolo de chocolate está em promoção hoje!',
    'Posso reservar para você? É só me dizer a quantidade.',
  ],
  mercadinho: [
    'Temos frutas orgânicas novinhas! 🍎🍊',
    'A entrega é grátis acima de R$50!',
    'Posso verificar o estoque para você.',
  ],
  farmacia: [
    'Esse remédio temos sim! Posso separar.',
    'Hoje temos 10% de desconto em vitaminas 💊',
    'Precisa de receita? Posso ajudar.',
  ],
  pet: [
    'O ração Premium está em promoção! 🐕',
    'Temos banho e tosa disponível hoje.',
    'A vacina pode ser agendada para amanhã.',
  ],
  adega: [
    'O vinho tinto secou está imperdível! 🍷',
    'Tem cerveja artesanal gelada pra você!',
    'Entregamos em até 30 minutos.',
  ],
}

const conversations: SellerConversation[] = [
  {
    id: 'padaria',
    storeName: 'Padaria Pão Dourado',
    storeEmoji: '🥖',
    category: 'Padaria',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    online: true,
    unread: 3,
    lastMessage: 'Pão de queijo saindo do forno!',
    lastTime: 'agora',
    messages: [
      { id: 'p1', text: 'Oi! Vocês têm pão de queijo hoje?', sender: 'user', timestamp: '10:30' },
      { id: 'p2', text: 'Temos sim! Saindo do forno agora 🧀', sender: 'seller', timestamp: '10:31' },
      { id: 'p3', text: 'Quanto fica uma porção de 10?', sender: 'user', timestamp: '10:32' },
      { id: 'p4', text: 'R$ 12,00. Entregamos na sua casa!', sender: 'seller', timestamp: '10:32' },
      { id: 'p5', text: 'Pão de queijo saindo do forno!', sender: 'seller', timestamp: '10:45' },
    ],
    quickReplies: ['Quero pedir!', 'Tem bolo?', 'Horário de entrega', 'Cardápio'],
  },
  {
    id: 'mercadinho',
    storeName: 'Mercadinho da Esquina',
    storeEmoji: '🛒',
    category: 'Mercado',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    online: true,
    unread: 1,
    lastMessage: 'Frutas orgânicas chegaram!',
    lastTime: '2 min atrás',
    messages: [
      { id: 'm1', text: 'Bom dia! Têm manga hoje?', sender: 'user', timestamp: '09:00' },
      { id: 'm2', text: 'Bom dia! Temos manga Palmer e Tommy 💛', sender: 'seller', timestamp: '09:02' },
      { id: 'm3', text: 'Frutas orgânicas chegaram!', sender: 'seller', timestamp: '09:30' },
    ],
    quickReplies: ['Lista completa', 'Preços', 'Entrega grátis?', 'Ofertas do dia'],
  },
  {
    id: 'farmacia',
    storeName: 'Farmácia Saúde+',
    storeEmoji: '💊',
    category: 'Farmácia',
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
    online: false,
    unread: 0,
    lastMessage: 'Ok, vamos preparar seu pedido',
    lastTime: '1h atrás',
    messages: [
      { id: 'f1', text: 'Preciso de paracetamol 750mg', sender: 'user', timestamp: '08:00' },
      { id: 'f2', text: 'Temos! Caixa com 10 comprimidos por R$18,90', sender: 'seller', timestamp: '08:05' },
      { id: 'f3', text: 'Pode ser, quero 2 caixas', sender: 'user', timestamp: '08:10' },
      { id: 'f4', text: 'Ok, vamos preparar seu pedido', sender: 'seller', timestamp: '08:12' },
    ],
    quickReplies: ['Outros remedios', 'Vitaminas', 'Cosméticos', 'Precisa de receita?'],
  },
  {
    id: 'pet',
    storeName: 'Pet Shop Amigo Fiel',
    storeEmoji: '🐕',
    category: 'Pet Shop',
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    online: true,
    unread: 2,
    lastMessage: 'A vacinação está disponível!',
    lastTime: '30 min atrás',
    messages: [
      { id: 'pt1', text: 'Vocês fazem banho e tosa?', sender: 'user', timestamp: '11:00' },
      { id: 'pt2', text: 'Sim! Banho a partir de R$45 e tosa R$55 🐩', sender: 'seller', timestamp: '11:02' },
      { id: 'pt3', text: 'A vacinação está disponível!', sender: 'seller', timestamp: '11:30' },
    ],
    quickReplies: ['Agendar banho', 'Ração Premium', 'Vacinação', 'Brinquedos'],
  },
  {
    id: 'adega',
    storeName: 'Adegas do Sabor',
    storeEmoji: '🍷',
    category: 'Bebidas',
    gradient: 'linear-gradient(135deg, #78350f, #92400e)',
    online: false,
    unread: 0,
    lastMessage: 'Vinho selecionado separado ✓',
    lastTime: '3h atrás',
    messages: [
      { id: 'a1', text: 'Tem vinho tinto seco?', sender: 'user', timestamp: '07:00' },
      { id: 'a2', text: 'Temos Malbec e Carménère! Ambos excelentes 🍷', sender: 'seller', timestamp: '07:05' },
      { id: 'a3', text: 'Leva o Malbec, R$89,90', sender: 'user', timestamp: '07:10' },
      { id: 'a4', text: 'Vinho selecionado separado ✓', sender: 'seller', timestamp: '07:12' },
    ],
    quickReplies: ['Carta de vinhos', 'Cervejas', 'Promoção', 'Entrega rápida'],
  },
]

export const useChatSellerStore = create<ChatSellerState>((set, get) => ({
  isOpen: false,
  activeConversation: null,
  searchQuery: '',
  isTyping: false,
  conversations,
  filteredConversations: conversations,

  toggleChat: () => set((s) => ({ isOpen: !s.isOpen, activeConversation: s.isOpen ? null : s.activeConversation })),
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false, activeConversation: null }),
  selectConversation: (id) => {
    set((s) => ({
      activeConversation: id,
      conversations: s.conversations.map((c) =>
        c.id === id ? { ...c, unread: 0 } : c
      ),
      filteredConversations: s.conversations.map((c) =>
        c.id === id ? { ...c, unread: 0 } : c
      ),
    }))
  },
  goBackToList: () => set({ activeConversation: null }),

  setSearchQuery: (q) => {
    const lower = q.toLowerCase()
    set((s) => ({
      searchQuery: q,
      filteredConversations: lower
        ? s.conversations.filter(
            (c) =>
              c.storeName.toLowerCase().includes(lower) ||
              c.category.toLowerCase().includes(lower)
          )
        : s.conversations,
    }))
  },

  sendMessage: (conversationId, text) => {
    const msgId = `msg-${Date.now()}`
    const now = new Date()
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`

    set((s) => ({
      conversations: s.conversations.map((c) => {
        if (c.id !== conversationId) return c
        return {
          ...c,
          messages: [
            ...c.messages,
            { id: msgId, text, sender: 'user' as const, timestamp: timeStr },
          ],
          lastMessage: text,
          lastTime: 'agora',
        }
      }),
      filteredConversations: s.filteredConversations.map((c) => {
        if (c.id !== conversationId) return c
        return {
          ...c,
          messages: [
            ...c.messages,
            { id: msgId, text, sender: 'user' as const, timestamp: timeStr },
          ],
          lastMessage: text,
          lastTime: 'agora',
        }
      }),
      isTyping: true,
    }))

    // Auto-reply after 2 seconds
    const replies = autoReplies[conversationId] || [
      'Obrigado pelo contato! Responderei em breve.',
      'Entendi sua mensagem!',
      'Posso ajudar com mais algo?',
    ]

    setTimeout(() => {
      const reply = replies[Math.floor(Math.random() * replies.length)]
      const replyId = `reply-${Date.now()}`
      const replyNow = new Date()
      const replyTime = `${replyNow.getHours()}:${String(replyNow.getMinutes()).padStart(2, '0')}`

      set((s) => ({
        conversations: s.conversations.map((c) => {
          if (c.id !== conversationId) return c
          return {
            ...c,
            messages: [
              ...c.messages,
              { id: replyId, text: reply, sender: 'seller' as const, timestamp: replyTime },
            ],
            lastMessage: reply,
            lastTime: 'agora',
          }
        }),
        filteredConversations: s.filteredConversations.map((c) => {
          if (c.id !== conversationId) return c
          return {
            ...c,
            messages: [
              ...c.messages,
              { id: replyId, text: reply, sender: 'seller' as const, timestamp: replyTime },
            ],
            lastMessage: reply,
            lastTime: 'agora',
          }
        }),
        isTyping: false,
      }))
    }, 2000)
  },

  setTyping: (v) => set({ isTyping: v }),
}))
