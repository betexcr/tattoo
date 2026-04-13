import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useStudioConfig } from '../contexts/StudioConfigContext'

export default function Login() {
  const { t } = useTranslation('login')
  const { signIn, resetPassword } = useAuth()
  const { config } = useStudioConfig()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState<'login' | 'reset'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const getSafeReturnTo = () => {
    const raw = searchParams.get('returnTo')
    if (raw && raw.startsWith('/') && !raw.startsWith('//')) return raw
    return '/'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      if (mode === 'reset') {
        const { error: err } = await resetPassword(email)
        if (err) {
          setError(err)
        } else {
          setSuccess(t('resetSent'))
        }
        return
      }
      const { error: err } = await signIn(email, password)
      if (err) {
        setError(err)
      } else {
        navigate(getSafeReturnTo())
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-ink flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-gold/70 hover:text-gold mb-8 text-sm">
          <ArrowLeft size={16} />
          {t('backHome')}
        </Link>

        <h1 className="font-serif text-3xl text-cream mb-2">
          {mode === 'login' ? t('title') : t('recoverTitle')}
        </h1>
        <p className="text-cream/50 mb-8 text-sm">
          {mode === 'login'
            ? t('subtitle', { name: config.studio_name })
            : t('recoverSubtitle')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="text-cream/60 text-xs block mb-1">{t('emailLabel')}</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-ink-light border border-gold/20 rounded-xl px-4 py-3 text-cream focus:border-gold/60 outline-none transition-colors"
              placeholder={t('emailPlaceholder')}
            />
          </div>

          {mode !== 'reset' && (
            <div>
              <label htmlFor="login-password" className="text-cream/60 text-xs block mb-1">{t('passwordLabel')}</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-ink-light border border-gold/20 rounded-xl px-4 py-3 pr-14 text-cream focus:border-gold/60 outline-none transition-colors"
                  placeholder={t('passwordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? t('hidePassword') : t('showPassword')}
                  className="absolute right-1 top-1/2 -translate-y-1/2 min-w-11 min-h-11 flex items-center justify-center text-cream/40 hover:text-cream/70"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-rose text-sm"
              >
                {error}
              </motion.p>
            )}
            {success && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-green-400 text-sm"
              >
                {success}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-ink font-semibold py-3 rounded-xl hover:bg-gold/90 transition-colors disabled:opacity-50"
          >
            {loading
              ? mode === 'login' ? t('loggingIn') : t('sendingLink')
              : mode === 'login' ? t('loginButton') : t('sendLink')}
          </button>
        </form>

        <div className="text-cream/40 text-sm text-center mt-6 space-y-2">
          {mode === 'login' && (
            <p>
              <button type="button" onClick={() => { setMode('reset'); setError(''); setSuccess('') }} className="text-gold/70 hover:text-gold hover:underline">{t('forgotPassword')}</button>
            </p>
          )}
          {mode === 'reset' && (
            <p>
              <button type="button" onClick={() => { setMode('login'); setError(''); setSuccess('') }} className="text-gold hover:underline">{t('backToLogin')}</button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
