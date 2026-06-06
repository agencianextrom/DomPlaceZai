'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Search, Send, Paperclip, ArrowLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useChatSellerStore } from '@/store/useChatSellerStore'
import type { SellerConversation, SellerMessage } from '@/store/useChatSellerStore'

/* ─── Animation variants (full maps for the `variants` prop) ─── */

const panelVariants = {
  closed: { opacity: 0, scale: 0.8, y: 20 },
  open: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 350, damping: 28 },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 20,
    transition: { duration: 0.2 },
  },
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const listItemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 400, damping: 25 },
  },
}

const messageVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 500, damping: 30 },
  },
}

const fabVariants = {
  closed: { scale: 0 },
  open: {
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 400, damping: 20 },
  },
}

const badgePulseVariants = {
  initial: { scale: 1 },
  pulse: {
    scale: [1, 1.25, 1],
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
  },
}

/* ─── Sub-components ─── */

function TypingIndicator() {
  return (
    <motion.div
      className="r59-chat-typing"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      <div className="r59-chat-typing-bubble">
        <span className="r59-chat-typing-label">Digitando</span>
        <span className="r59-chat-typing-dots">
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
          />
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
          />
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
          />
        </span>
      </div>
    </motion.div>
  )
}

function MessageBubble({ message }: { message: SellerMessage }) {
  const isUser = message.sender === 'user'
  return (
    <motion.div
      className={`r59-chat-msg-row ${isUser ? 'r59-chat-msg-user-row' : 'r59-chat-msg-seller-row'}`}
      variants={messageVariants}
      initial="hidden"
      animate="visible"
    >
      <div className={`r59-chat-msg ${isUser ? 'r59-chat-msg-sent' : 'r59-chat-msg-received'}`}>
        <p className="r59-chat-msg-text">{message.text}</p>
        <span className={`r59-chat-msg-time ${isUser ? 'r59-chat-msg-time-sent' : 'r59-chat-msg-time-received'}`}>
          {message.timestamp}
        </span>
      </div>
    </motion.div>
  )
}

function ConversationItem({
  conversation,
  onSelect,
}: {
  conversation: SellerConversation
  onSelect: () => void
}) {
  return (
    <motion.button
      className="r59-chat-convo-item"
      variants={listItemVariants}
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
    >
      <div className="r59-chat-convo-avatar" style={{ background: conversation.gradient }}>
        <span className="r59-chat-convo-emoji">{conversation.storeEmoji}</span>
        <span
          className={`r59-chat-convo-status ${conversation.online ? 'r59-chat-status-online' : 'r59-chat-status-offline'}`}
        />
      </div>

      <div className="r59-chat-convo-info">
        <div className="r59-chat-convo-top">
          <span className="r59-chat-convo-name">{conversation.storeName}</span>
          <span className="r59-chat-convo-time">{conversation.lastTime}</span>
        </div>
        <div className="r59-chat-convo-bottom">
          <span className="r59-chat-convo-last">{conversation.lastMessage}</span>
          {conversation.unread > 0 && (
            <motion.span
              className="r59-chat-convo-badge"
              variants={badgePulseVariants}
              initial="initial"
              animate="pulse"
            >
              {conversation.unread}
            </motion.span>
          )}
        </div>
      </div>
    </motion.button>
  )
}

function ConversationView({
  conversation,
  onBack,
}: {
  conversation: SellerConversation
  onBack: () => void
}) {
  const [inputValue, setInputValue] = useState('')
  const { sendMessage, isTyping } = useChatSellerStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation.messages, isTyping])

  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    sendMessage(conversation.id, trimmed)
    setInputValue('')
    inputRef.current?.focus()
  }, [inputValue, conversation.id, sendMessage])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const handleQuickReply = useCallback(
    (reply: string) => {
      sendMessage(conversation.id, reply)
    },
    [conversation.id, sendMessage]
  )

  const totalUnread = useChatSellerStore((s) =>
    s.conversations.reduce((acc, c) => acc + c.unread, 0)
  )

  return (
    <div className="r59-chat-view">
      {/* Header */}
      <div className="r59-chat-view-header" style={{ background: conversation.gradient }}>
        <motion.div
          className="r59-chat-view-back"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
        >
          <ArrowLeft className="r59-chat-icon" />
        </motion.div>
        <div className="r59-chat-view-seller">
          <span className="r59-chat-view-emoji">{conversation.storeEmoji}</span>
          <div className="r59-chat-view-meta">
            <span className="r59-chat-view-name">{conversation.storeName}</span>
            <span className="r59-chat-view-status">
              {conversation.online ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="r59-chat-messages custom-scrollbar">
        {conversation.messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <AnimatePresence>
          {isTyping && <TypingIndicator />}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies */}
      <div className="r59-chat-quick-replies">
        {conversation.quickReplies.map((reply) => (
          <motion.button
            key={reply}
            className="r59-chat-quick-chip"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleQuickReply(reply)}
          >
            {reply}
          </motion.button>
        ))}
      </div>

      {/* Input bar */}
      <div className="r59-chat-input-bar">
        <motion.div className="r59-chat-attach" whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
          <Paperclip className="r59-chat-attach-icon" />
        </motion.div>
        <input
          ref={inputRef}
          className="r59-chat-input"
          placeholder="Digite sua mensagem..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <motion.div
          className="r59-chat-send"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSend}
        >
          <Send className="r59-chat-send-icon" />
        </motion.div>
      </div>
    </div>
  )
}

/* ─── Main Component ─── */

export function ChatWithSeller() {
  const {
    isOpen,
    activeConversation,
    searchQuery,
    isTyping,
    conversations,
    filteredConversations,
    toggleChat,
    selectConversation,
    goBackToList,
    setSearchQuery,
  } = useChatSellerStore()

  const totalUnread = conversations.reduce((acc, c) => acc + c.unread, 0)
  const activeConvo = conversations.find((c) => c.id === activeConversation)

  return (
    <div className="r59-chat-widget" aria-label="Chat com Vendedor">
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            className="r59-chat-fab"
            variants={fabVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={toggleChat}
              className="r59-chat-fab-inner"
            >
              <MessageCircle className="r59-chat-fab-icon" />
              {totalUnread > 0 && (
                <motion.span
                  className="r59-chat-fab-badge"
                  variants={badgePulseVariants}
                  initial="initial"
                  animate="pulse"
                >
                  {totalUnread}
                </motion.span>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="r59-chat-panel"
            variants={panelVariants}
            initial="closed"
            animate="open"
            exit="exit"
          >
            {/* Close button */}
            <motion.div
              className="r59-chat-close"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleChat}
            >
              <X className="r59-chat-close-icon" />
            </motion.div>

            {activeConvo ? (
              <ConversationView
                conversation={activeConvo}
                onBack={goBackToList}
              />
            ) : (
              <div className="r59-chat-list-view">
                {/* List header */}
                <div className="r59-chat-list-header">
                  <div className="r59-chat-list-title-row">
                    <MessageCircle className="r59-chat-list-icon" />
                    <h2 className="r59-chat-list-title">Chat com Vendedor</h2>
                  </div>
                  <div className="r59-chat-search-bar">
                    <Search className="r59-chat-search-icon" />
                    <input
                      className="r59-chat-search-input"
                      placeholder="Buscar lojas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Conversation list */}
                <div className="r59-chat-list custom-scrollbar">
                  {filteredConversations.length === 0 ? (
                    <div className="r59-chat-empty">
                      <MessageCircle className="r59-chat-empty-icon" />
                      <p>Nenhuma conversa encontrada</p>
                    </div>
                  ) : (
                    <motion.div
                      className="r59-chat-list-items"
                      variants={listVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {filteredConversations.map((c) => (
                        <ConversationItem
                          key={c.id}
                          conversation={c}
                          onSelect={() => selectConversation(c.id)}
                        />
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
