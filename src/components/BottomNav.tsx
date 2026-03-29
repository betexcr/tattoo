import { NavLink } from 'react-router-dom'
import { Home, Image, CalendarDays, MessageCircle, Menu } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: 'Inicio' },
  { to: '/portfolio', icon: Image, label: 'Portafolio' },
  { to: '/agenda', icon: CalendarDays, label: 'Agenda' },
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
]

interface BottomNavProps {
  onMenuToggle: () => void
  menuOpen: boolean
}

export default function BottomNav({ onMenuToggle, menuOpen }: BottomNavProps) {
  return (
    <nav aria-label="Navegación principal" className="fixed bottom-0 left-0 right-0 z-50 bg-ink-light/95 backdrop-blur-lg border-t border-white/5 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16 px-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
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
          type="button"
          onClick={onMenuToggle}
          aria-label="Más opciones"
          aria-expanded={menuOpen}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-subtle hover:text-cream-dark transition-all duration-300"
        >
          <Menu size={20} strokeWidth={1.5} />
          <span className="text-[10px] font-medium tracking-wide">Más</span>
        </button>
      </div>
    </nav>
  )
}
