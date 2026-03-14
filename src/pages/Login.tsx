import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (mode === 'login') {
      const { error: err } = await signIn(email, password)
      if (err) {
        setError(err)
      } else {
        navigate('/')
      }
    } else {
      if (!fullName.trim()) {
        setError('Ingresa tu nombre completo')
        setLoading(false)
        return
      }
      const { error: err } = await signUp(email, password, fullName)
      if (err) {
        setError(err)
      } else {
        setSuccess('Cuenta creada. Revisa tu email para confirmar.')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
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
          {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </h1>
        <p className="text-cream/50 mb-8 text-sm">
          {mode === 'login'
            ? 'Accede a tu cuenta de Ink & Soul'
            : 'Únete para reservar citas y más'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="text-cream/60 text-xs block mb-1">Nombre completo</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-ink-light border border-gold/20 rounded-xl px-4 py-3 text-cream focus:border-gold/60 outline-none transition-colors"
                placeholder="Tu nombre"
              />
            </div>
          )}

          <div>
            <label className="text-cream/60 text-xs block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-ink-light border border-gold/20 rounded-xl px-4 py-3 text-cream focus:border-gold/60 outline-none transition-colors"
              placeholder="tu@email.com"
            />
          </div>

          <div className="relative">
            <label className="text-cream/60 text-xs block mb-1">Contraseña</label>
            <input
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
              className="absolute right-3 top-8 text-cream/40 hover:text-cream/70"
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

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
            {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-cream/40 text-sm text-center mt-6">
          {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess('') }}
            className="text-gold hover:underline"
          >
            {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </motion.div>
    </div>
  )
}
