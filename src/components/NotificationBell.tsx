import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, CheckCheck } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../hooks/useNotifications'

function formatRelativeTime(iso: string) {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  return `${days}d`
}

export default function NotificationBell() {
  const { user } = useAuth()
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(user?.uid)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  if (!user) return null

  const handleClick = (n: typeof notifications[0]) => {
    markRead(n.id)
    if (n.link) {
      navigate(n.link)
      setOpen(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Notificaciones"
        className="relative w-11 h-11 rounded-full bg-white/5 flex items-center justify-center text-subtle hover:text-cream transition-colors"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-gold text-ink text-[9px] font-bold flex items-center justify-center px-1"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-80 max-h-96 bg-ink-light border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
            >
              <div className="flex items-center justify-between p-3 border-b border-white/5">
                <h3 className="text-sm font-medium text-cream">Notificaciones</h3>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="w-10 h-10 rounded-lg text-subtle hover:text-gold hover:bg-gold/10 transition-colors flex items-center justify-center"
                      title="Marcar todo como leído"
                      aria-label="Marcar todas como leídas"
                    >
                      <CheckCheck size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    aria-label="Cerrar notificaciones"
                    className="w-10 h-10 rounded-lg text-subtle hover:text-cream hover:bg-white/5 transition-colors flex items-center justify-center"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-72">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bell className="w-8 h-8 text-subtle mx-auto mb-2 opacity-50" />
                    <p className="text-subtle text-xs">Sin notificaciones</p>
                  </div>
                ) : (
                  notifications.slice(0, 20).map(n => (
                    <button
                      key={n.id}
                      onClick={() => handleClick(n)}
                      className={`w-full text-left px-3 py-2.5 flex gap-3 hover:bg-white/5 transition-colors border-b border-white/[0.03] ${
                        !n.read ? 'bg-gold/[0.03]' : ''
                      }`}
                    >
                      {!n.read && <span className="w-2 h-2 rounded-full bg-gold shrink-0 mt-1.5" />}
                      <div className={`flex-1 min-w-0 ${n.read ? 'ml-5' : ''}`}>
                        <p className="text-xs font-medium text-cream truncate">{n.title}</p>
                        <p className="text-[11px] text-subtle line-clamp-2">{n.body}</p>
                      </div>
                      <span className="text-[10px] text-subtle shrink-0">{formatRelativeTime(n.created_at)}</span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
