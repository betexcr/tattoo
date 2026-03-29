import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot } from 'lucide-react'
import type { ChatbotMessage } from './chatUtils'

interface Props {
  studioName: string
  quickReplies: Array<{ label: string; key: string }>
  chatbotMessages: ChatbotMessage[]
  isTyping: boolean
  inputText: string
  onInputChange: (text: string) => void
  onSendMessage: (question: string) => void
  onQuickReply: (label: string, key: string) => void
}

export default function AssistantChatPanel({
  studioName, quickReplies, chatbotMessages, isTyping,
  inputText, onInputChange, onSendMessage, onQuickReply,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatbotMessages])

  return (
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
              ¡Hola! Soy el asistente virtual de {studioName}. Puedo ayudarte
              con preguntas frecuentes. Elige un tema o escríbeme:
            </p>
          </div>
        </motion.div>

        <div className="flex flex-wrap gap-2 mb-6">
          {quickReplies.map(({ label, key }) => (
            <motion.button
              type="button"
              key={key}
              whileTap={{ scale: 0.96 }}
              onClick={() => onQuickReply(label, key)}
              disabled={isTyping}
              className="px-3 py-2 rounded-full bg-ink-medium border border-white/5 text-cream text-xs hover:border-gold/30 hover:bg-ink-medium/80 transition-colors disabled:opacity-50"
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
          <div ref={scrollRef} />
        </div>
      </div>

      <div className="sticky bottom-0 bg-ink/95 backdrop-blur-lg border-t border-white/5 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (inputText.trim()) onSendMessage(inputText.trim())
              }
            }}
            placeholder="Escribe tu pregunta..."
            aria-label="Mensaje"
            className="flex-1 px-4 py-3 rounded-xl bg-ink-light border border-white/5 text-cream placeholder:text-subtle/60 focus:outline-none focus:border-gold/50"
          />
          <button
            type="button"
            onClick={() => inputText.trim() && onSendMessage(inputText.trim())}
            disabled={!inputText.trim() || isTyping}
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
