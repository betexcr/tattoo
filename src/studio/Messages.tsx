import { useState, useRef, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send } from 'lucide-react'
import { useChatConversations, useChat } from '../hooks/useChat'
import { useStudioConfig } from '../contexts/StudioConfigContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatRelativeTime } from '../utils/formatRelativeTime'

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
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
  const { config } = useStudioConfig()
  const quickReplies = config.chat_config.canned_responses.slice(0, 6)
  const { conversations, loading: conversationsLoading, error: conversationsError } = useChatConversations()
  const [activeClientId, setActiveClientId] = useState<string | null>(null)
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, send, markRead, subscribe, unsubscribe, loading: chatLoading, error: chatError } = useChat(
    activeClientId ?? undefined
  )

  const sortedConversations = useMemo(
    () =>
      [...conversations].sort(
        (a, b) =>
          new Date(b.last_timestamp).getTime() - new Date(a.last_timestamp).getTime()
      ),
    [conversations]
  )

  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + c.unread, 0),
    [conversations]
  )

  const activeConversation = activeClientId
    ? conversations.find((c) => c.client_id === activeClientId)
    : null

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (activeClientId) {
      subscribe()
      markRead()
      return () => unsubscribe()
    }
  }, [activeClientId, subscribe, unsubscribe, markRead])

  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const handleSend = async () => {
    const text = inputText.trim()
    if (!text || !activeClientId || sending) return
    setSending(true)
    setSendError(null)
    setInputText('')
    try {
      const result = await send(text, 'artist')
      if (result?.error) {
        setSendError(result.error)
        setInputText(text)
      }
    } finally {
      setSending(false)
    }
  }

  const handleQuickReply = (text: string) => {
    setInputText((prev) => (prev ? `${prev} ${text}` : text))
  }

  const handleOpenConversation = (clientId: string) => {
    setActiveClientId(clientId)
  }

  if (!activeClientId && conversationsLoading) return <LoadingSpinner />
  if (!activeClientId && conversationsError) return (
    <div className="p-4">
      <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">{conversationsError}</div>
    </div>
  )

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
                type="button"
                onClick={() => setActiveClientId(null)}
                aria-label="Volver a conversaciones"
                className="w-10 h-10 rounded-full flex items-center justify-center text-subtle hover:text-cream transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-cream truncate">
                  {activeConversation.client_name}
                </p>
              </div>
              <Link
                to="/studio/clients"
                className="text-xs text-gold hover:text-gold-light font-medium shrink-0"
              >
                Ver perfil
              </Link>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatError && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm mb-2">{chatError}</div>
              )}
              {chatLoading && messages.length === 0 ? (
                <LoadingSpinner />
              ) : messages.map((msg, i) => {
                const prev = messages[i - 1]
                const showTimestamp =
                  !prev ||
                  new Date(msg.created_at).getTime() -
                    new Date(prev.created_at).getTime() >
                    5 * 60 * 1000

                return (
                  <div key={msg.id}>
                    {showTimestamp && (
                      <p className="text-center text-[10px] text-subtle mb-2">
                        {formatRelativeTime(msg.created_at)}
                      </p>
                    )}
                    <div
                      className={`flex ${msg.sender_role === 'artist' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] px-4 py-2 rounded-2xl ${
                          msg.sender_role === 'client'
                            ? 'bg-ink-medium text-cream rounded-tl-md'
                            : 'bg-gold/20 text-cream rounded-tr-md'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {msg.text}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
              {!(chatLoading && messages.length === 0) && <div ref={messagesEndRef} />}
            </div>

            <div className="p-4 border-t border-white/5 bg-ink shrink-0 space-y-2">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {quickReplies.map((text) => (
                  <button
                    type="button"
                    key={text}
                    onClick={() => handleQuickReply(text)}
                    className="shrink-0 px-3 py-1.5 rounded-full bg-ink-light border border-white/5 text-subtle text-xs hover:text-cream hover:border-gold/30 transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>
              {sendError && <p className="text-rose text-xs mb-1 px-1">{sendError}</p>}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Escribe un mensaje..."
                  aria-label="Mensaje"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-ink-light border border-white/5 text-cream placeholder:text-subtle text-sm focus:outline-none focus:border-gold/40 transition-colors"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!inputText.trim() || sending}
                  aria-label="Enviar mensaje"
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
              {sortedConversations.length === 0 && (
                <p className="text-subtle text-sm py-8 text-center">No hay conversaciones</p>
              )}
              {sortedConversations.map((conv) => (
                <motion.button
                  type="button"
                  key={conv.client_id}
                  variants={itemVariants}
                  onClick={() => handleOpenConversation(conv.client_id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-ink-light border border-white/5 hover:border-gold/20 transition-colors text-left"
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gold/30 to-gold-dark/30 flex items-center justify-center shrink-0">
                    <span className="text-gold font-serif font-semibold text-sm">
                      {getInitials(conv.client_name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-cream truncate">{conv.client_name}</p>
                    <p className="text-xs text-subtle truncate">{conv.last_message}</p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span className="text-[10px] text-subtle">
                      {formatRelativeTime(conv.last_timestamp)}
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
