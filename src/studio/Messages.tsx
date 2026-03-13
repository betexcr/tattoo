import { useState, useRef, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send, Bot } from 'lucide-react'
import {
  chatConversations,
  appointments,
  type ChatMessage,
  type ChatConversation,
} from '../data/mock'

const QUICK_REPLIES = [
  'Tu cita está confirmada',
  'Enviaré el boceto pronto',
  'Recuerda los cuidados post-tattoo',
  '¿Podemos reagendar?',
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'ahora'
  if (diffMins < 60) return `hace ${diffMins}m`
  if (diffHours < 24) return `hace ${diffHours}h`
  if (diffDays < 7) return `hace ${diffDays}d`
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

function getPhoneForClient(clientName: string): string {
  const apt = appointments.find((a) => a.client === clientName)
  return apt?.phone ?? ''
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
}

export default function Messages() {
  const [conversations, setConversations] = useState<ChatConversation[]>(
    () => [...chatConversations]
  )
  const [activeId, setActiveId] = useState<string | null>(null)
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const sortedConversations = useMemo(
    () =>
      [...conversations].sort(
        (a, b) =>
          new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime()
      ),
    [conversations]
  )

  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + c.unread, 0),
    [conversations]
  )

  const activeConversation = activeId
    ? conversations.find((c) => c.id === activeId)
    : null

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConversation?.messages])

  const handleSend = () => {
    const text = inputText.trim()
    if (!text || !activeId) return

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      from: 'artist',
      text,
      timestamp: new Date().toISOString(),
      read: true,
    }

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeId) return c
        return {
          ...c,
          lastMessage: text,
          lastTimestamp: newMsg.timestamp,
          unread: 0,
          messages: [...c.messages, newMsg],
        }
      })
    )
    setInputText('')
  }

  const handleQuickReply = (text: string) => {
    setInputText((prev) => (prev ? `${prev} ${text}` : text))
  }

  const handleOpenConversation = (id: string) => {
    setActiveId(id)
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, unread: 0 } : c
      )
    )
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-3rem)] pb-16">
      <AnimatePresence mode="wait">
        {activeConversation ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col flex-1 min-h-0"
          >
            <header className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-ink-light/95 shrink-0">
              <button
                onClick={() => setActiveId(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-subtle hover:text-cream transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-cream truncate">
                  {activeConversation.userName}
                </p>
                {getPhoneForClient(activeConversation.userName) && (
                  <p className="text-xs text-subtle truncate">
                    {getPhoneForClient(activeConversation.userName)}
                  </p>
                )}
              </div>
              <Link
                to="/studio/clients"
                className="text-xs text-gold hover:text-gold-light font-medium shrink-0"
              >
                Ver perfil
              </Link>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeConversation.messages.map((msg, i) => {
                const prev = activeConversation.messages[i - 1]
                const showTimestamp =
                  !prev ||
                  new Date(msg.timestamp).getTime() -
                    new Date(prev.timestamp).getTime() >
                    5 * 60 * 1000

                return (
                  <div key={msg.id}>
                    {showTimestamp && (
                      <p className="text-center text-[10px] text-subtle mb-2">
                        {formatRelativeTime(msg.timestamp)}
                      </p>
                    )}
                    <div
                      className={`flex ${msg.from === 'artist' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] px-4 py-2 rounded-2xl ${
                          msg.from === 'user'
                            ? 'bg-ink-medium text-cream rounded-tl-md'
                            : msg.from === 'artist'
                              ? 'bg-gold/20 text-cream rounded-tr-md'
                              : 'bg-ink-medium text-cream rounded-tl-md'
                        }`}
                      >
                        {msg.from === 'bot' && (
                          <div className="flex items-center gap-1.5 mb-1">
                            <Bot size={12} className="text-subtle" />
                            <span className="text-[10px] text-subtle">Bot</span>
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {msg.text}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-white/5 bg-ink shrink-0 space-y-2">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {QUICK_REPLIES.map((text) => (
                  <button
                    key={text}
                    onClick={() => handleQuickReply(text)}
                    className="shrink-0 px-3 py-1.5 rounded-full bg-ink-light border border-white/5 text-subtle text-xs hover:text-cream hover:border-gold/30 transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-ink-light border border-white/5 text-cream placeholder:text-subtle text-sm focus:outline-none focus:border-gold/40 transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="w-10 h-10 rounded-xl bg-gold text-ink flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gold-light transition-colors"
                >
                  <Send size={18} strokeWidth={2} />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="p-4 space-y-4 overflow-y-auto"
          >
            {totalUnread > 0 && (
              <p className="text-sm text-subtle">
                {totalUnread} mensaje{totalUnread !== 1 ? 's' : ''} sin leer
              </p>
            )}

            <div className="space-y-2">
              {sortedConversations.map((conv: ChatConversation) => (
                <motion.button
                  key={conv.id}
                  variants={itemVariants}
                  onClick={() => handleOpenConversation(conv.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-ink-light border border-white/5 hover:border-gold/20 transition-colors text-left"
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gold/30 to-gold-dark/30 flex items-center justify-center shrink-0">
                    <span className="text-gold font-serif font-semibold text-sm">
                      {getInitials(conv.userName)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-cream truncate">{conv.userName}</p>
                    <p className="text-xs text-subtle truncate">{conv.lastMessage}</p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span className="text-[10px] text-subtle">
                      {formatRelativeTime(conv.lastTimestamp)}
                    </span>
                    {conv.unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-gold text-ink text-[10px] font-bold flex items-center justify-center">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
