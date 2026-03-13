import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Palette, PenTool, Eye, Lightbulb,
  GraduationCap, User, Phone, Bell, ShoppingBag,
} from 'lucide-react'

const menuItems = [
  { to: '/shop', icon: ShoppingBag, label: 'Tienda', desc: 'Arte para llevar' },
  { to: '/designer', icon: PenTool, label: 'Tattoo Designer', desc: 'Diseña tu tatuaje' },
  { to: '/visualizer', icon: Eye, label: 'Body Visualizer', desc: 'Visualiza en tu cuerpo' },
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
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-ink-light rounded-t-3xl max-h-[85dvh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <Palette size={20} className="text-gold" />
                <h2 className="font-serif text-lg text-cream">Explorar</h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-subtle hover:text-cream transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 pb-8 space-y-1">
              {menuItems.map(({ to, icon: Icon, label, desc }) => (
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
