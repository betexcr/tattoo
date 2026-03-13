import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  MessageCircle,
  Image,
  BarChart3,
  Settings,
  X,
  Menu,
  ExternalLink,
} from 'lucide-react'

const navItems = [
  { to: '/studio', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/studio/appointments', icon: CalendarDays, label: 'Citas' },
  { to: '/studio/clients', icon: Users, label: 'Clientes' },
  { to: '/studio/messages', icon: MessageCircle, label: 'Mensajes' },
]

const moreItems = [
  { to: '/studio/portfolio', icon: Image, label: 'Portfolio', desc: 'Gestionar trabajos' },
  { to: '/studio/analytics', icon: BarChart3, label: 'Analíticas', desc: 'Métricas del negocio' },
  { to: '/studio/settings', icon: Settings, label: 'Configuración', desc: 'Ajustes del estudio' },
  { to: '/', icon: ExternalLink, label: 'Ver sitio público', desc: 'Vista del cliente' },
]

export default function StudioLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()

  const pageTitle = () => {
    const path = location.pathname
    if (path === '/studio') return 'Dashboard'
    if (path.includes('appointments')) return 'Citas'
    if (path.includes('clients')) return 'Clientes'
    if (path.includes('messages')) return 'Mensajes'
    if (path.includes('portfolio')) return 'Portfolio'
    if (path.includes('analytics')) return 'Analíticas'
    if (path.includes('settings')) return 'Configuración'
    return 'Studio'
  }

  return (
    <div className="flex flex-col min-h-dvh bg-ink">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-ink-light/95 backdrop-blur-lg border-b border-white/5">
        <div className="flex items-center justify-between px-4 h-12">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
              <span className="text-ink text-xs font-bold">IS</span>
            </div>
            <div>
              <p className="text-cream text-sm font-medium leading-none">{pageTitle()}</p>
              <p className="text-subtle text-[9px] tracking-widest uppercase">Studio</p>
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-subtle hover:text-cream transition-colors"
          >
            <Menu size={16} />
          </button>
        </div>
      </header>

      <main className="flex-1 pb-20 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-ink-light/95 backdrop-blur-lg border-t border-gold/10">
        <div className="flex items-center justify-around max-w-lg mx-auto h-16 px-2">
          {navItems.map(({ to, icon: Icon, label, ...rest }) => (
            <NavLink
              key={to}
              to={to}
              end={'end' in rest}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'text-gold scale-105'
                    : 'text-subtle hover:text-cream-dark'
                }`
              }
            >
              <Icon size={20} strokeWidth={1.5} />
              <span className="text-[10px] font-medium tracking-wide">{label}</span>
            </NavLink>
          ))}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-subtle hover:text-cream-dark transition-all duration-300"
          >
            <Settings size={20} strokeWidth={1.5} />
            <span className="text-[10px] font-medium tracking-wide">Más</span>
          </button>
        </div>
      </nav>

      {/* More drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-ink-light rounded-t-3xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <h2 className="font-serif text-lg text-cream">Studio</h2>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-subtle hover:text-cream transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-4 pb-8 space-y-1">
                {moreItems.map(({ to, icon: Icon, label, desc }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setDrawerOpen(false)}
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
    </div>
  )
}
