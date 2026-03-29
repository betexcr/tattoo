import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useStudioConfig } from '../contexts/StudioConfigContext'

export default function Login() {
  const { signIn, signUp, resetPassword } = useAuth()
  const { config } = useStudioConfig()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
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
          setSuccess('Te hemos enviado un correo para restablecer tu contraseña.')
        }
        return
      }
      if (mode === 'login') {
        const { error: err } = await signIn(email, password)
        if (err) {
          setError(err)
        } else {
          navigate(getSafeReturnTo())
        }
      } else {
        if (!fullName.trim()) {
          setError('Ingresa tu nombre completo')
          return
        }
        const { error: err } = await signUp(email, password, fullName)
        if (err) {
          setError(err)
        } else {
          navigate(getSafeReturnTo())
        }
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
          Volver al inicio
        </Link>

        <h1 className="font-serif text-3xl text-cream mb-2">
          {mode === 'login' ? 'Iniciar Sesión' : mode === 'signup' ? 'Crear Cuenta' : 'Recuperar Contraseña'}
        </h1>
        <p className="text-cream/50 mb-8 text-sm">
          {mode === 'login'
            ? `Accede a tu cuenta de ${config.studio_name}`
            : mode === 'signup'
              ? 'Únete para reservar citas y más'
              : 'Ingresa tu correo y te enviaremos un enlace'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label htmlFor="login-fullname" className="text-cream/60 text-xs block mb-1">Nombre completo</label>
              <input
                id="login-fullname"
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-ink-light border border-gold/20 rounded-xl px-4 py-3 text-cream focus:border-gold/60 outline-none transition-colors"
                placeholder="Tu nombre"
              />
            </div>
          )}

          <div>
            <label htmlFor="login-email" className="text-cream/60 text-xs block mb-1">Correo electrónico</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-ink-light border border-gold/20 rounded-xl px-4 py-3 text-cream focus:border-gold/60 outline-none transition-colors"
              placeholder="tu@correo.com"
            />
          </div>

          {mode !== 'reset' && (
            <div className="relative">
              <label htmlFor="login-password" className="text-cream/60 text-xs block mb-1">Contraseña</label>
              <input
                id="login-password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-ink-light border border-gold/20 rounded-xl px-4 py-3 pr-12 text-cream focus:border-gold/60 outline-none transition-colors"
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute right-3 top-8 text-cream/40 hover:text-cream/70"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
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
            {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Crear cuenta' : 'Enviar enlace'}
          </button>
        </form>

        <div className="text-cream/40 text-sm text-center mt-6 space-y-2">
          {mode === 'login' && (
            <>
              <p>
                ¿No tienes cuenta?{' '}
                <button type="button" onClick={() => { setMode('signup'); setError(''); setSuccess('') }} className="text-gold hover:underline">Regístrate</button>
              </p>
              <p>
                <button type="button" onClick={() => { setMode('reset'); setError(''); setSuccess('') }} className="text-gold/70 hover:text-gold hover:underline">¿Olvidaste tu contraseña?</button>
              </p>
            </>
          )}
          {mode === 'signup' && (
            <p>
              ¿Ya tienes cuenta?{' '}
              <button type="button" onClick={() => { setMode('login'); setError(''); setSuccess('') }} className="text-gold hover:underline">Inicia sesión</button>
            </p>
          )}
          {mode === 'reset' && (
            <p>
              <button type="button" onClick={() => { setMode('login'); setError(''); setSuccess('') }} className="text-gold hover:underline">Volver al inicio de sesión</button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
