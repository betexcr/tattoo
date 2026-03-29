import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Bot } from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import PageHeader from '../components/PageHeader'
import { useStudioConfig } from '../contexts/StudioConfigContext'
import { useChat } from '../hooks/useChat'
import { useAuth } from '../contexts/AuthContext'
import { dbToDisplay, findChatbotMatch, type ArtistDisplayMessage, type ChatbotMessage } from './chat/chatUtils'
import ArtistChatPanel from './chat/ArtistChatPanel'
import AssistantChatPanel from './chat/AssistantChatPanel'

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
    loading: chatLoading,
    error: chatError,
  } = useChat(clientId)
  const [activeTab, setActiveTab] = useState<'artist' | 'assistant'>('artist')
  const [chatbotMessages, setChatbotMessages] = useState<ChatbotMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [artistTyping, setArtistTyping] = useState(false)
  const responseIndexRef = useRef(0)
  const userRef = useRef(user)
  userRef.current = user
  const sendRef = useRef(send)
  sendRef.current = send
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const trackTimer = useCallback((id: ReturnType<typeof setTimeout>) => {
    timersRef.current.push(id)
  }, [])

  useEffect(() => () => { timersRef.current.forEach(clearTimeout) }, [])

  const artistFirstName = config.chat_config.artist_name.split(' ')[0] || config.chat_config.artist_name

  const initialMessages = useMemo<ArtistDisplayMessage[]>(() => [
    {
      id: 'welcome-1',
      from: 'artist',
      text: config.chat_config.welcome_message,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      read: true,
    },
  ], [config.chat_config.welcome_message])

  const [messages, setMessages] = useState<ArtistDisplayMessage[]>(initialMessages)

  useEffect(() => {
    if (activeTab === 'artist' && clientId) {
      subscribe()
      markRead()
      return () => unsubscribe()
    }
  }, [activeTab, clientId, subscribe, unsubscribe, markRead]) // all stable via useCallback

  const designProcessedRef = useRef(false)
  useEffect(() => {
    if (designProcessedRef.current) return
    const designId = searchParams.get('design')
    if (!designId) return
    designProcessedRef.current = true
    setSearchParams({}, { replace: true })
    setActiveTab('artist')
    ;(async () => {
      try {
        const snap = await getDoc(doc(db, 'design_shares', designId))
        if (!snap.exists()) return
        const d = snap.data()
        const parts: string[] = []
        if (d.style) parts.push(`Estilo: ${d.style}`)
        const sizeLabels: Record<string, string> = { tiny: 'Diminuto', small: 'Pequeño', medium: 'Mediano', large: 'Grande', 'extra-large': 'Extra grande' }
        if (d.size) parts.push(`Tamaño: ${sizeLabels[d.size] ?? d.size}`)
        if (d.elements?.length) parts.push(`Elementos: ${d.elements.join(', ')}`)
        if (d.colorMode) parts.push(`Color: ${d.colorMode === 'negro' ? 'Negro' : 'Color'}`)
        if (d.notes) parts.push(`Notas: ${d.notes}`)
        const text = `🎨 Mi diseño de tatuaje:\n${parts.join('\n')}`
        if (userRef.current) {
          await sendRef.current(text, 'client')
        } else {
          const msg = { id: `design-${Date.now()}`, from: 'user' as const, text, timestamp: new Date().toISOString(), read: false }
          setMessages((prev) => [...prev, msg])
        }
      } catch { /* design not found, ignore */ }
    })()
  }, [searchParams, setSearchParams, setActiveTab])

  const handleSendToArtist = async () => {
    if (!inputText.trim() || sending) return
    const text = inputText.trim()

    if (user) {
      setSending(true)
      setSendError(null)
      setInputText('')
      try {
        const result = await send(text, 'client')
        if (result?.error) {
          setSendError(result.error)
          setInputText(text)
        }
      } finally {
        setSending(false)
      }
    } else {
      setInputText('')
      const newMsg: ArtistDisplayMessage = {
        id: `m-${Date.now()}`,
        from: 'user',
        text,
        timestamp: new Date().toISOString(),
        read: false,
      }
      setMessages((prev) => [...prev, newMsg])

      trackTimer(setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === newMsg.id ? { ...m, read: true } : m))
        )
      }, 1500))

      const cannedResponses = config.chat_config.canned_responses
      if (cannedResponses.length > 0) {
        setArtistTyping(true)
        const delay = 2000 + Math.random() * 2000
        trackTimer(setTimeout(() => {
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
        }, delay))
      }
    }
  }

  const handleSendChatbotMessage = (question: string, responseKey?: string) => {
    if (isTyping) return
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

    trackTimer(setTimeout(() => {
      setIsTyping(false)
      const botMsg: ChatbotMessage = {
        id: `cb-b-${Date.now()}`,
        from: 'bot',
        text: responseText,
        timestamp: new Date().toISOString(),
      }
      setChatbotMessages((prev) => [...prev, botMsg])
    }, 500))
  }

  const handleQuickReply = (label: string, key: string) => {
    handleSendChatbotMessage(label, key)
  }

  const displayMessages = useMemo(
    () => user ? dbMessages.map(dbToDisplay) : messages.length > 0 ? messages : initialMessages,
    [user, dbMessages, messages, initialMessages],
  )

  return (
    <div className="min-h-dvh bg-ink flex flex-col">
      <PageHeader title="Mensajes" subtitle="Mensajes directos" showBack={false} />

      {/* Tab toggle */}
      <div className="px-4 pt-1 pb-2">
        <div className="flex rounded-xl bg-ink-light p-1 border border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab('artist')}
            aria-pressed={activeTab === 'artist'}
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
            type="button"
            onClick={() => setActiveTab('assistant')}
            aria-pressed={activeTab === 'assistant'}
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
        <ArtistChatPanel
          displayMessages={displayMessages}
          artistFirstName={artistFirstName}
          artistInitials={config.chat_config.artist_initials}
          artistName={config.chat_config.artist_name}
          responseTimeText={config.chat_config.response_time_text}
          chatError={chatError}
          chatLoading={chatLoading}
          sendError={sendError}
          inputText={inputText}
          onInputChange={setInputText}
          onSend={handleSendToArtist}
          sending={sending}
          artistTyping={artistTyping}
          isGuest={!user}
        />
      ) : (
        <AssistantChatPanel
          studioName={config.studio_name}
          quickReplies={config.chat_config.quick_replies}
          chatbotMessages={chatbotMessages}
          isTyping={isTyping}
          inputText={inputText}
          onInputChange={setInputText}
          onSendMessage={handleSendChatbotMessage}
          onQuickReply={handleQuickReply}
        />
      )}
    </div>
  )
}
