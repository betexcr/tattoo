import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Check, CheckCheck } from 'lucide-react'
import { formatRelativeTime } from '../../utils/formatRelativeTime'
import type { ArtistDisplayMessage } from './chatUtils'

interface Props {
  displayMessages: ArtistDisplayMessage[]
  artistFirstName: string
  artistInitials: string
  artistName: string
  responseTimeText: string
  chatError: string | null
  chatLoading: boolean
  sendError: string | null
  inputText: string
  onInputChange: (text: string) => void
  onSend: () => void
  sending: boolean
  artistTyping: boolean
  isGuest: boolean
}

export default function ArtistChatPanel({
  displayMessages, artistFirstName, artistInitials, artistName, responseTimeText,
  chatError, chatLoading, sendError, inputText, onInputChange, onSend, sending,
  artistTyping, isGuest,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [displayMessages, artistTyping])

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {chatError && (
        <div className="mx-4 mt-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm">{chatError}</div>
      )}
      {chatLoading && (
        <div className="flex items-center justify-center py-4">
          <p className="text-subtle text-sm">Cargando mensajes...</p>
        </div>
      )}
      <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shrink-0">
          <span className="text-ink text-xs font-bold">{artistInitials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-cream text-sm font-medium">{artistName}</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-subtle">{responseTimeText}</span>
          </div>
        </div>
      </div>

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
        {isGuest && artistTyping && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gold/60">{artistFirstName}</span>
              <div className="bg-ink-medium rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gold/60 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-gold/60 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-gold/60 animate-bounce" />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="sticky bottom-0 bg-ink/95 backdrop-blur-lg border-t border-white/5 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {sendError && <p className="text-rose text-xs mb-2 px-1">{sendError}</p>}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                onSend()
              }
            }}
            placeholder={`Escribe un mensaje a ${artistFirstName}...`}
            aria-label="Mensaje"
            className="flex-1 px-4 py-3 rounded-xl bg-ink-light border border-white/5 text-cream placeholder:text-subtle/60 focus:outline-none focus:border-gold/50"
          />
          <button
            type="button"
            onClick={onSend}
            disabled={!inputText.trim() || sending}
            aria-label="Enviar mensaje"
            className="w-12 h-12 rounded-xl bg-gold text-ink flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gold-light transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
