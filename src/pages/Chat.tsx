import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, ArrowLeft, Check, CheckCheck } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import {
  chatConversations,
  chatbotResponses,
  type ChatMessage,
  type ChatConversation,
} from '../data/mock'

const QUICK_REPLIES: { label: string; key: keyof typeof chatbotResponses }[] = [
  { label: 'Precios', key: 'precio' },
  { label: 'Cuidados', key: 'cuidados' },
  { label: 'Depósito', key: 'deposito' },
  { label: 'Duración', key: 'duracion' },
  { label: 'Dolor', key: 'dolor' },
  { label: 'Horario', key: 'horario' },
  { label: 'Estilos', key: 'estilos' },
  { label: 'Cancelación', key: 'cancelar' },
  { label: 'Preparación', key: 'preparacion' },
]

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

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function findChatbotMatch(text: string): string | null {
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

const FALLBACK_BOT_RESPONSE =
  'No tengo una respuesta específica para eso. ¿Te gustaría hablar directamente con la artista? Puedes contactarla en la sección de Contacto o iniciar una conversación.'

interface ChatbotMessage {
  id: string
  from: 'user' | 'bot'
  text: string
  timestamp: string
}

export default function Chat() {
  const [conversations, setConversations] = useState<ChatConversation[]>(
    () => [...chatConversations]
  )
  const [activeConversation, setActiveConversation] = useState<string | null>(
    null
  )
  const [activeTab, setActiveTab] = useState<'conversations' | 'assistant'>(
    'conversations'
  )
  const [chatbotMessages, setChatbotMessages] = useState<ChatbotMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)

  const sortedConversations = [...conversations].sort(
    (a, b) =>
      new Date(b.lastTimestamp).getTime() -
      new Date(a.lastTimestamp).getTime()
  )

  const activeConv = conversations.find((c) => c.id === activeConversation)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatbotMessages])

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConv?.messages])

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

    const key = responseKey ?? findChatbotMatch(question)
    const responseText = key ? chatbotResponses[key] : FALLBACK_BOT_RESPONSE

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

  const handleSendConversationMessage = () => {
    if (!activeConversation || !inputText.trim()) return
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      from: 'user',
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    }
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeConversation) return c
        return {
          ...c,
          lastMessage: newMsg.text,
          lastTimestamp: newMsg.timestamp,
          messages: [...c.messages, newMsg],
        }
      })
    )
    setInputText('')
  }

  if (activeConversation && activeConv) {
    return (
      <div className="min-h-dvh bg-ink flex flex-col">
        <motion.header
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="sticky top-0 z-40 bg-ink/90 backdrop-blur-lg border-b border-white/5"
        >
          <div className="flex items-center gap-3 px-4 h-14">
            <button
              onClick={() => setActiveConversation(null)}
              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-subtle hover:text-cream transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex-1 flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                <span className="text-gold text-sm font-medium">
                  {getInitials(activeConv.userName)}
                </span>
              </div>
              <div className="min-w-0">
                <h1 className="font-serif text-cream truncate">
                  {activeConv.userName}
                </h1>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[11px] text-subtle">En línea</span>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <AnimatePresence initial={false}>
            {activeConv.messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] flex flex-col items-${msg.from === 'user' ? 'end' : 'start'}`}
                >
                  <div
                    className={`px-4 py-2.5 rounded-2xl ${
                      msg.from === 'user'
                        ? 'bg-gold/20 text-cream rounded-br-md'
                        : msg.from === 'bot'
                          ? 'bg-ink-medium text-cream rounded-bl-md flex items-start gap-2'
                          : 'bg-ink-medium text-cream rounded-bl-md'
                    }`}
                  >
                    {msg.from === 'bot' && (
                      <Bot size={14} className="text-gold shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {msg.text}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] text-subtle">
                      {formatRelativeTime(msg.timestamp)}
                    </span>
                    {msg.from === 'user' && (
                      <span className="text-gold">
                        {msg.read ? (
                          <CheckCheck size={12} />
                        ) : (
                          <Check size={12} />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={chatScrollRef} />
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
                  handleSendConversationMessage()
                }
              }}
              placeholder="Escribe un mensaje..."
              className="flex-1 px-4 py-3 rounded-xl bg-ink-light border border-white/5 text-cream placeholder:text-subtle/60 focus:outline-none focus:border-gold/50"
            />
            <button
              onClick={handleSendConversationMessage}
              disabled={!inputText.trim()}
              className="w-12 h-12 rounded-xl bg-gold text-ink flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gold-light transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-ink">
      <PageHeader title="Chat" subtitle="Mensajes" showBack={false} />

      <div className="px-4 pt-2">
        <div className="flex rounded-xl bg-ink-light p-1 border border-white/5">
          <button
            onClick={() => setActiveTab('conversations')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'conversations'
                ? 'bg-gold text-ink'
                : 'text-subtle hover:text-cream'
            }`}
          >
            Conversaciones
          </button>
          <button
            onClick={() => setActiveTab('assistant')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'assistant'
                ? 'bg-gold text-ink'
                : 'text-subtle hover:text-cream'
            }`}
          >
            Asistente Virtual
          </button>
        </div>
      </div>

      {activeTab === 'conversations' ? (
        <div className="px-4 py-4 space-y-2">
          <AnimatePresence mode="popLayout">
            {sortedConversations.map((conv, i) => (
              <motion.button
                key={conv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => {
                  setActiveConversation(conv.id)
                  setConversations((prev) =>
                    prev.map((c) =>
                      c.id === conv.id
                        ? {
                            ...c,
                            unread: 0,
                            messages: c.messages.map((m) => ({ ...m, read: true })),
                          }
                        : c
                    )
                  )
                }}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-ink-light border border-white/5 hover:border-gold/20 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                  <span className="text-gold font-medium">
                    {getInitials(conv.userName)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-cream truncate">
                    {conv.userName}
                  </p>
                  <p className="text-sm text-subtle truncate">
                    {conv.lastMessage}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[11px] text-subtle">
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
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col h-[calc(100dvh-12rem)]">
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 rounded-2xl rounded-bl-md bg-ink-medium border border-white/5"
            >
              <div className="flex items-start gap-2">
                <Bot size={16} className="text-gold shrink-0 mt-0.5" />
                <p className="text-cream text-sm leading-relaxed">
                  ¡Hola! Soy el asistente virtual de INK & SOUL. Puedo ayudarte
                  con preguntas frecuentes. Elige un tema o escríbeme:
                </p>
              </div>
            </motion.div>

            <div className="flex flex-wrap gap-2 mb-6">
              {QUICK_REPLIES.map(({ label, key }) => (
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
                        <Bot
                          size={14}
                          className="text-gold shrink-0 mt-0.5"
                        />
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.text}
                      </p>
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
              <div ref={scrollRef} />
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
