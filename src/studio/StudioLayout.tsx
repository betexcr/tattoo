import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { useScrollLock } from '../hooks/useScrollLock'
import { useStudioConfig } from '../contexts/StudioConfigContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  MessageCircle,
  Package,
  Image,
  BarChart3,
  Settings,
  X,
  Menu,
  ExternalLink,
} from 'lucide-react'

export default function StudioLayout() {
  const { t } = useTranslation('studio')

  const navItems = [
    { to: '/studio', icon: LayoutDashboard, label: t('nav.dashboard'), end: true },
    { to: '/studio/appointments', icon: CalendarDays, label: t('nav.appointments') },
    { to: '/studio/clients', icon: Users, label: t('nav.clients') },
    { to: '/studio/messages', icon: MessageCircle, label: t('nav.messages') },
  ]

  const moreItems = [
    { to: '/studio/orders', icon: Package, label: t('nav.orders'), desc: t('nav.ordersDesc') },
    { to: '/studio/portfolio', icon: Image, label: t('nav.portfolio'), desc: t('nav.portfolioDesc') },
    { to: '/studio/analytics', icon: BarChart3, label: t('nav.analytics'), desc: t('nav.analyticsDesc') },
    { to: '/studio/settings', icon: Settings, label: t('nav.settings'), desc: t('nav.settingsDesc') },
    { to: '/', icon: ExternalLink, label: t('nav.viewPublicSite', 'Ver sitio público'), desc: t('nav.viewPublicSiteDesc', 'Vista del cliente') },
  ]
  const [drawerOpen, setDrawerOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])
  useFocusTrap(drawerRef, drawerOpen, closeDrawer)
  useScrollLock(drawerOpen)
  const location = useLocation()
  const { config } = useStudioConfig()
  const initials = config.studio_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const pageTitle = () => {
    const path = location.pathname
    if (path === '/studio') return t('pageTitle.dashboard')
    if (path.includes('appointments')) return t('pageTitle.appointments')
    if (path.includes('clients')) return t('pageTitle.clients')
    if (path.includes('messages')) return t('pageTitle.messages')
    if (path.includes('orders')) return t('pageTitle.orders')
    if (path.includes('portfolio')) return t('pageTitle.portfolio')
    if (path.includes('analytics')) return t('pageTitle.analytics')
    if (path.includes('settings')) return t('pageTitle.settings')
    return t('pageTitle.default')
  }

  return (
    <div className="flex flex-col min-h-dvh bg-ink">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-gold focus:text-ink focus:rounded-lg focus:text-sm focus:font-medium">{t('layout.skipToContent')}</a>
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-ink-light/95 backdrop-blur-lg border-b border-white/5 pt-[env(safe-area-inset-top,0px)]">
        <div className="flex items-center justify-between px-4 h-12">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
              <span className="text-ink text-xs font-bold">{initials}</span>
            </div>
            <div>
              <p className="text-cream text-sm font-medium leading-none">{pageTitle()}</p>
              <p className="text-subtle text-[9px] tracking-widest uppercase">{t('layout.subtitle')}</p>
            </div>
          </div>
          <button
            type="button"
            aria-label={t('layout.openMenu')}
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
            className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center text-subtle hover:text-cream transition-colors"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      <main id="main-content" className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-ink-light/95 backdrop-blur-lg border-t border-gold/10 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around max-w-lg mx-auto h-16 px-2">
          {navItems.map(({ to, icon: Icon, label, ...rest }) => (
            <NavLink
              key={to}
              to={to}
              end={'end' in rest}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 min-h-[44px] rounded-xl transition-all duration-300 ${
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
            aria-label={t('layout.moreOptions')}
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 min-h-[44px] rounded-xl text-subtle hover:text-cream-dark transition-all duration-300"
          >
            <Settings size={20} strokeWidth={1.5} />
            <span className="text-[10px] font-medium tracking-wide">{t('layout.more')}</span>
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
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label={t('layout.studioMenu')}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-ink-light rounded-t-3xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <h2 className="font-serif text-lg text-cream">{t('layout.drawerTitle')}</h2>
                <button
                  type="button"
                  aria-label={t('layout.closeMenu')}
                  onClick={() => setDrawerOpen(false)}
                  className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center text-subtle hover:text-cream transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="px-4 pt-3 flex justify-end">
                <LanguageSwitcher />
              </div>
              <div className="p-4 pb-[max(2rem,env(safe-area-inset-bottom))] space-y-1">
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
