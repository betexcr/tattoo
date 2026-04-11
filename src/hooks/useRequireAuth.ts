import { useAuth } from '../contexts/AuthContext'
import { useCallback, useState } from 'react'
import { createElement } from 'react'
import { AnimatePresence } from 'framer-motion'
import AuthPromptModal from '../components/AuthPromptModal'

export function useRequireAuth() {
  const { user } = useAuth()
  const [promptReturn, setPromptReturn] = useState<string | undefined>()
  const [showPrompt, setShowPrompt] = useState(false)

  const requireAuth = useCallback((returnTo?: string) => {
    if (!user) {
      setPromptReturn(returnTo)
      setShowPrompt(true)
      return false
    }
    return true
  }, [user])

  const closePrompt = useCallback(() => setShowPrompt(false), [])

  const authPrompt = createElement(
    AnimatePresence,
    null,
    showPrompt
      ? createElement(AuthPromptModal, {
          key: 'auth-prompt',
          returnTo: promptReturn,
          onClose: closePrompt,
        })
      : null,
  )

  return { user, requireAuth, authPrompt }
}
