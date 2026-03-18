import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, Check, CheckCheck } from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import PageHeader from '../components/PageHeader'
import { useStudioConfig } from '../contexts/StudioConfigContext'
import { useChat } from '../hooks/useChat'
import { useAuth } from '../contexts/AuthContext'
import type { ChatMessage } from '../types'

interface ArtistDisplayMessage {
  id: string
  from: 'user' | 'artist'
  text: string
  timestamp: string
  read: boolean
}

function dbToDisplay(msg: ChatMessage): ArtistDisplayMessage {
  return {
    id: msg.id,
    from: msg.sender_role === 'client' ? 'user' : 'artist',
    text: msg.text,
    timestamp: msg.created_at,
    read: msg.read,
  }
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

function findChatbotMatch(text: string, chatbotResponses: Record<string, string>): string | null {
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  const keys = Object.keys(chatbotResponses)
  for (const key of keys) {
    const keyNorm = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    if (normalized.includes(keyNorm)) return key
  }
  return null
}

interface ChatbotMessage {
  id: string
  from: 'user' | 'bot'
  text: string
  timestamp: string
}

export default function Chat() {
  const { config } = useStudioConfig()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const clientId = user?.uid
  const {
    messages: dbMessages,
    send,
    markRead,
    subscribe,
    unsubscribe,
  } = useChat(clientId)
  const [activeTab, setActiveTab] = useState<'artist' | 'assistant'>('artist')
  const [chatbotMessages, setChatbotMessages] = useState<ChatbotMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [artistTyping, setArtistTyping] = useState(false)
  const artistScrollRef = useRef<HTMLDivElement>(null)
  const botScrollRef = useRef<HTMLDivElement>(null)
  const responseIndexRef = useRef(0)

  const artistFirstName = config.chat_config.artist_name.split(' ')[0] || config.chat_config.artist_name

  const initialMessages: ArtistDisplayMessage[] = [
    {
      id: 'welcome-1',
      from: 'artist',
      text: config.chat_config.welcome_message,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      read: true,
    },
  ]

  const [messages, setMessages] = useState<ArtistDisplayMessage[]>(initialMessages)

  useEffect(() => {
    if (activeTab === 'artist' && clientId) {
      subscribe()
      markRead()
      return () => unsubscribe()
    }
  }, [activeTab, clientId, subscribe, unsubscribe, markRead])

  useEffect(() => {
    artistScrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, artistTyping, dbMessages])

  useEffect(() => {
    botScrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatbotMessages])

  useEffect(() => {
    const designId = searchParams.get('design')
    if (!designId) return
    setSearchParams({}, { replace: true })
    setActiveTab('artist')
    ;(async () => {
      try {
        const snap = await getDoc(doc(db, 'design_shares', designId))
        if (!snap.exists()) return
        const d = snap.data()
        const parts: string[] = []
        if (d.style) parts.push(`Estilo: ${d.style}`)
        if (d.size) parts.push(`Tamaño: ${d.size}`)
        if (d.elements?.length) parts.push(`Elementos: ${d.elements.join(', ')}`)
        if (d.colorMode) parts.push(`Color: ${d.colorMode === 'negro' ? 'Negro' : 'Color'}`)
        if (d.notes) parts.push(`Notas: ${d.notes}`)
        const text = `🎨 Mi diseño de tatuaje:\n${parts.join('\n')}`
        if (user) {
          await send(text, 'client')
        } else {
          const msg = { id: `design-${Date.now()}`, from: 'user' as const, text, timestamp: new Date().toISOString(), read: false }
          setMessages((prev) => [...prev, msg])
        }
      } catch { /* design not found, ignore */ }
    })()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSendToArtist = async () => {
    if (!inputText.trim()) return
    const text = inputText.trim()
    setInputText('')

    if (user) {
      await send(text, 'client')
    } else {
      const newMsg: ArtistDisplayMessage = {
        id: `m-${Date.now()}`,
        from: 'user',
        text,
        timestamp: new Date().toISOString(),
        read: false,
      }
      setMessages((prev) => [...prev, newMsg])

      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === newMsg.id ? { ...m, read: true } : m))
        )
      }, 1500)

      setArtistTyping(true)
      const cannedResponses = config.chat_config.canned_responses
      const delay = 2000 + Math.random() * 2000
      setTimeout(() => {
        setArtistTyping(false)
        const replyText = cannedResponses[responseIndexRef.current % cannedResponses.length]
        responseIndexRef.current += 1
        const reply: ArtistDisplayMessage = {
          id: `ar-${Date.now()}`,
          from: 'artist',
          text: replyText,
          timestamp: new Date().toISOString(),
          read: true,
        }
        setMessages((prev) => [...prev, reply])
      }, delay)
    }
  }

  const handleSendChatbotMessage = (question: string, responseKey?: string) => {
    const userMsg: ChatbotMessage = {
      id: `cb-u-${Date.now()}`,
      from: 'user',
      text: question,
      timestamp: new Date().toISOString(),
    }
    setChatbotMessages((prev) => [...prev, userMsg])
    setInputText('')
    setIsTyping(true)

    const key = responseKey ?? findChatbotMatch(question, config.chatbot_responses)
    const responseText = key ? config.chatbot_responses[key] : config.chat_config.fallback_response

    setTimeout(() => {
      setIsTyping(false)
      const botMsg: ChatbotMessage = {
        id: `cb-b-${Date.now()}`,
        from: 'bot',
        text: responseText,
        timestamp: new Date().toISOString(),
      }
      setChatbotMessages((prev) => [...prev, botMsg])
    }, 500)
  }

  const handleQuickReply = (label: string, key: string) => {
    handleSendChatbotMessage(label, key)
  }

  const displayMessages = user ? dbMessages.map(dbToDisplay) : messages.length > 0 ? messages : initialMessages

  return (
    <div className="min-h-dvh bg-ink flex flex-col">
      <PageHeader title="Chat" subtitle="Mensajes" showBack={false} />

      {/* Tab toggle */}
      <div className="px-4 pt-1 pb-2">
        <div className="flex rounded-xl bg-ink-light p-1 border border-white/5">
          <button
            onClick={() => setActiveTab('artist')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'artist'
                ? 'bg-gold text-ink'
                : 'text-subtle hover:text-cream'
            }`}
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${
              activeTab === 'artist' ? 'bg-ink/20 text-ink' : 'bg-gold/20 text-gold'
            }`}>
              {config.chat_config.artist_initials}
            </div>
            Artista
          </button>
          <button
            onClick={() => setActiveTab('assistant')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'assistant'
                ? 'bg-gold text-ink'
                : 'text-subtle hover:text-cream'
            }`}
          >
            <Bot size={14} />
            Asistente Virtual
          </button>
        </div>
      </div>

      {activeTab === 'artist' ? (
        /* Direct chat with the artist */
        <div className="flex-1 flex flex-col min-h-0">
          {/* Artist info bar */}
          <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shrink-0">
              <span className="text-ink text-xs font-bold">{config.chat_config.artist_initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-cream text-sm font-medium">{config.chat_config.artist_name}</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-subtle">{config.chat_config.response_time_text}</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            <AnimatePresence initial={false}>
              {displayMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] flex flex-col ${msg.from === 'user' ? 'items-end' : 'items-start'}`}>
                    {msg.from === 'artist' && (
                      <span className="text-[10px] text-gold/60 mb-1 ml-1">{artistFirstName}</span>
                    )}
                    <div
                      className={`px-4 py-2.5 rounded-2xl ${
                        msg.from === 'user'
                          ? 'bg-gold/20 text-cream rounded-br-md'
                          : 'bg-ink-medium text-cream rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] text-subtle">
                        {formatRelativeTime(msg.timestamp)}
                      </span>
                      {msg.from === 'user' && (
                        <span className="text-gold">
                          {msg.read ? <CheckCheck size={12} /> : <Check size={12} />}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {!user && artistTyping && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gold/60">{artistFirstName}</span>
                </div>
              </motion.div>
            )}
            {!user && artistTyping && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-ink-medium rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-gold/60 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-gold/60 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-gold/60 animate-bounce" />
                </div>
              </motion.div>
            )}
            <div ref={artistScrollRef} />
          </div>

          {/* Input */}
          <div className="sticky bottom-0 bg-ink/95 backdrop-blur-lg border-t border-white/5 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendToArtist()
                  }
                }}
                placeholder={`Escribe un mensaje a ${artistFirstName}...`}
                className="flex-1 px-4 py-3 rounded-xl bg-ink-light border border-white/5 text-cream placeholder:text-subtle/60 focus:outline-none focus:border-gold/50"
              />
              <button
                onClick={handleSendToArtist}
                disabled={!inputText.trim()}
                className="w-12 h-12 rounded-xl bg-gold text-ink flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gold-light transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Chatbot / Virtual Assistant */
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 rounded-2xl rounded-bl-md bg-ink-medium border border-white/5"
            >
              <div className="flex items-start gap-2">
                <Bot size={16} className="text-gold shrink-0 mt-0.5" />
                <p className="text-cream text-sm leading-relaxed">
                  ¡Hola! Soy el asistente virtual de {config.studio_name}. Puedo ayudarte
                  con preguntas frecuentes. Elige un tema o escríbeme:
                </p>
              </div>
            </motion.div>

            <div className="flex flex-wrap gap-2 mb-6">
              {config.chat_config.quick_replies.map(({ label, key }) => (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleQuickReply(label, key)}
                  className="px-3 py-2 rounded-full bg-ink-medium border border-white/5 text-cream text-xs hover:border-gold/30 hover:bg-ink-medium/80 transition-colors"
                >
                  {label}
                </motion.button>
              ))}
            </div>

            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {chatbotMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] ${
                        msg.from === 'user'
                          ? 'bg-gold/20 text-cream rounded-2xl rounded-br-md px-4 py-2.5'
                          : 'bg-ink-medium text-cream rounded-2xl rounded-bl-md px-4 py-2.5 flex items-start gap-2'
                      }`}
                    >
                      {msg.from === 'bot' && (
                        <Bot size={14} className="text-gold shrink-0 mt-0.5" />
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-ink-medium rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-gold/60 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 rounded-full bg-gold/60 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-gold/60 animate-bounce" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={botScrollRef} />
            </div>
          </div>

          <div className="sticky bottom-0 bg-ink/95 backdrop-blur-lg border-t border-white/5 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    if (inputText.trim())
                      handleSendChatbotMessage(inputText.trim())
                  }
                }}
                placeholder="Escribe tu pregunta..."
                className="flex-1 px-4 py-3 rounded-xl bg-ink-light border border-white/5 text-cream placeholder:text-subtle/60 focus:outline-none focus:border-gold/50"
              />
              <button
                onClick={() =>
                  inputText.trim() && handleSendChatbotMessage(inputText.trim())
                }
                disabled={!inputText.trim()}
                className="w-12 h-12 rounded-xl bg-gold text-ink flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gold-light transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
