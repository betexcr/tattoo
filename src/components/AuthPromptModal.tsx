import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn, X } from 'lucide-react'
import { useScrollLock } from '../hooks/useScrollLock'
import { useFocusTrap } from '../hooks/useFocusTrap'

interface Props {
  returnTo?: string
  onClose: () => void
}

export default function AuthPromptModal({ returnTo, onClose }: Props) {
  const { t } = useTranslation()
  const panelRef = useRef<HTMLDivElement>(null)
  useScrollLock(true)
  useFocusTrap(panelRef, true, onClose)

  useEffect(() => {
    panelRef.current?.focus()
  }, [])

  const qs = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-ink/90 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
    >
      <motion.div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={t('auth.loginOrRegister')}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-ink-light rounded-2xl border border-white/10 shadow-2xl p-6 focus:outline-none"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl text-cream">{t('auth.accessAccount')}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-white/5 text-subtle hover:text-cream transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-cream-dark/70 text-sm mb-6 leading-relaxed">
          {t('auth.loginPrompt')}
        </p>

        <Link
          to={`/login${qs}`}
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gold text-ink font-medium text-sm hover:bg-gold-light transition-colors active:scale-[0.98]"
        >
          <LogIn size={16} />
          {t('auth.login')}
        </Link>
      </motion.div>
    </motion.div>
  )
}
