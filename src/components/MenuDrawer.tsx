import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useScrollLock } from '../hooks/useScrollLock'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Palette, PenTool, Eye, Lightbulb,
  GraduationCap, User, Phone, Bell, ShoppingBag, LogIn, LogOut, LayoutDashboard, UserCircle,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const menuItems = [
  { to: '/shop', icon: ShoppingBag, label: 'Tienda', desc: 'Arte para llevar' },
  { to: '/designer', icon: PenTool, label: 'Diseñador de Tatuajes', desc: 'Diseña tu tatuaje' },
  { to: '/visualizer', icon: Eye, label: 'Visualizador Corporal', desc: 'Visualiza en tu cuerpo' },
  { to: '/suggestions', icon: Lightbulb, label: 'Sugerencias', desc: 'Inspiración y estilos' },
  { to: '/courses', icon: GraduationCap, label: 'Cursos y Talleres', desc: 'Aprende con nosotros' },
  { to: '/reminders', icon: Bell, label: 'Recordatorios', desc: 'Tus citas y avisos' },
  { to: '/about', icon: User, label: 'La Artista', desc: 'Conoce mi historia' },
  { to: '/contact', icon: Phone, label: 'Contacto', desc: 'Hablemos' },
]

interface MenuDrawerProps {
  open: boolean
  onClose: () => void
}

export default function MenuDrawer({ open, onClose }: MenuDrawerProps) {
  const { user, profile, isArtist, signOut } = useAuth()
  const navigate = useNavigate()
  const [signOutError, setSignOutError] = useState<string | null>(null)
  useScrollLock(open)

  const drawerRef = useRef<HTMLDivElement>(null)
  useFocusTrap(drawerRef, open, onClose)

  useEffect(() => { if (open) setSignOutError(null) }, [open])

  const handleSignOut = async () => {
    try {
      await signOut()
      onClose()
      navigate('/')
    } catch (e: unknown) {
      console.warn('Error cerrando sesión:', e)
      setSignOutError('No se pudo cerrar sesión. Inténtalo de nuevo.')
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            ref={drawerRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            className="fixed bottom-0 left-0 right-0 z-50 bg-ink-light rounded-t-3xl max-h-[85dvh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <Palette size={20} className="text-gold" />
                <h2 className="font-serif text-lg text-cream">Explorar</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar menú"
                className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center text-subtle hover:text-cream transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Account section */}
            <div className="px-4 pt-4 pb-2">
              {user ? (
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gold/5 border border-gold/10">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-serif text-lg shrink-0">
                    {(profile?.full_name || user.email || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-cream truncate">{profile?.full_name || user.email}</p>
                    <p className="text-xs text-subtle truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <NavLink
                      to="/account"
                      onClick={onClose}
                      className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-lg bg-gold/10 flex items-center justify-center text-gold hover:bg-gold/20 transition-colors"
                      title="Mi Cuenta"
                      aria-label="Mi Cuenta"
                    >
                      <UserCircle size={16} />
                    </NavLink>
                    {isArtist && (
                      <NavLink
                        to="/studio"
                        onClick={onClose}
                        className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-lg bg-gold/10 flex items-center justify-center text-gold hover:bg-gold/20 transition-colors"
                        title="Estudio"
                        aria-label="Estudio"
                      >
                        <LayoutDashboard size={16} />
                      </NavLink>
                    )}
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-lg bg-white/5 flex items-center justify-center text-subtle hover:text-rose transition-colors"
                      title="Cerrar sesión"
                      aria-label="Cerrar sesión"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                  {signOutError && (
                    <p className="text-rose text-xs mt-1">{signOutError}</p>
                  )}
                </div>
              ) : (
                <NavLink
                  to="/login"
                  onClick={onClose}
                  className="flex items-center gap-4 p-3.5 rounded-2xl bg-gold/10 border border-gold/20 text-gold hover:bg-gold/15 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center shrink-0">
                    <LogIn size={18} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Iniciar Sesión / Registrarse</p>
                    <p className="text-xs text-gold/60">Para citas, chat y más</p>
                  </div>
                </NavLink>
              )}
            </div>

            <div className="p-4 pb-[max(2rem,env(safe-area-inset-bottom))] space-y-1">
              {menuItems.filter(item => item.to !== '/reminders' || isArtist).map(({ to, icon: Icon, label, desc }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gold/10 text-gold'
                        : 'text-cream hover:bg-white/5'
                    }`
                  }
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    <Icon size={18} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-subtle">{desc}</p>
                  </div>
                </NavLink>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
