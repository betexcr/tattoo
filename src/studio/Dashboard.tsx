import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Calendar,
  Clock,
  MessageCircle,
  Euro,
  Check,
  X,
  ImagePlus,
  CalendarPlus,
  BarChart3,
  Settings,
} from 'lucide-react'
import { useStudioConfig } from '../contexts/StudioConfigContext'
import { useAppointments } from '../hooks/useAppointments'
import { useOrders } from '../hooks/useOrders'
import { useChatConversations } from '../hooks/useChat'

const TODAY = new Date().toISOString().slice(0, 10)

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

function formatDateSpanish(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

export default function Dashboard() {
  const { config } = useStudioConfig()
  const { appointments: localAppointments, updateStatus } = useAppointments()
  const { orders } = useOrders()
  const { conversations: chatConvs } = useChatConversations()

  const artistFirstName = config.artist_name.split(' ')[0] || config.artist_name
  const artistInitials = config.chat_config.artist_initials || getInitials(config.artist_name)

  const pendingAppointments = useMemo(
    () => localAppointments.filter((a) => a.status === 'pending'),
    [localAppointments]
  )

  const todayAppointments = useMemo(
    () =>
      localAppointments.filter(
        (a) => a.date === TODAY && a.status === 'confirmed'
      ),
    [localAppointments]
  )

  const upcomingAppointments = useMemo(() => {
    const confirmed = localAppointments.filter(
      (a) => a.status === 'confirmed' && a.date >= TODAY
    )
    return confirmed.sort(
      (a, b) =>
        new Date(a.date + 'T' + a.time).getTime() -
        new Date(b.date + 'T' + b.time).getTime()
    )
  }, [localAppointments])

  const displaySchedule = todayAppointments.length > 0 ? todayAppointments : upcomingAppointments.slice(0, 3)

  const totalUnread = chatConvs.reduce((sum, c) => sum + c.unread, 0)
  const unreadConversations = chatConvs.filter((c) => c.unread > 0)

  const monthlyRevenue = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const apptRevenue = localAppointments
      .filter((a) => {
        if (a.status !== 'confirmed' && a.status !== 'completed') return false
        const d = new Date(a.date + 'T12:00:00')
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      })
      .reduce((sum, a) => sum + a.deposit, 0)
    const orderRevenue = orders
      .filter((o) => {
        if (o.status === 'pending') return false
        const d = new Date(o.created_at)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      })
      .reduce((sum, o) => sum + o.total, 0)
    return apptRevenue + orderRevenue
  }, [localAppointments, orders])

  const dailyRevenue = useMemo(() => {
    const result: number[] = []
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      const dayTotal = localAppointments
        .filter((a) => {
          if (a.status !== 'confirmed' && a.status !== 'completed') return false
          return a.date === dateStr
        })
        .reduce((sum, a) => sum + a.deposit, 0)
      result.push(dayTotal)
    }
    return result
  }, [localAppointments])

  const maxRevenue = Math.max(...dailyRevenue, 1)

  const handleConfirm = (id: string) => {
    updateStatus(id, 'confirmed')
  }

  const handleReject = (id: string) => {
    updateStatus(id, 'rejected')
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 pb-24 space-y-6"
    >
      {/* 1. Greeting header */}
      <motion.header variants={itemVariants} className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shrink-0">
          <span className="text-ink font-serif font-bold text-sm">{artistInitials}</span>
        </div>
        <div>
          <h1 className="font-serif text-xl text-cream">
            {getGreeting()}, {artistFirstName}
          </h1>
          <p className="text-subtle text-sm capitalize">
            {formatDateSpanish(TODAY)}
          </p>
        </div>
      </motion.header>

      {/* 2. Quick Stats */}
      <motion.section variants={itemVariants} className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-ink-light border border-white/5 p-4 relative overflow-hidden">
          <Calendar className="absolute top-3 right-3 w-5 h-5 text-gold/60" />
          <p className="text-2xl font-serif font-semibold text-cream">
            {localAppointments.filter((a) => a.date === TODAY).length}
          </p>
          <p className="text-xs text-subtle mt-0.5">Citas Hoy</p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold/40" />
        </div>
        <div className="rounded-xl bg-ink-light border border-white/5 p-4 relative overflow-hidden">
          <Clock className="absolute top-3 right-3 w-5 h-5 text-amber-400/70" />
          <p className="text-2xl font-serif font-semibold text-cream">
            {pendingAppointments.length}
          </p>
          <p className="text-xs text-subtle mt-0.5">Pendientes</p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400/40" />
        </div>
        <div className="rounded-xl bg-ink-light border border-white/5 p-4 relative overflow-hidden">
          <MessageCircle className="absolute top-3 right-3 w-5 h-5 text-rose/60" />
          <p className="text-2xl font-serif font-semibold text-cream">
            {totalUnread}
          </p>
          <p className="text-xs text-subtle mt-0.5">Mensajes</p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose/40" />
        </div>
        <div className="rounded-xl bg-ink-light border border-white/5 p-4 relative overflow-hidden">
          <Euro className="absolute top-3 right-3 w-5 h-5 text-emerald-400/70" />
          <p className="text-2xl font-serif font-semibold text-cream">
            €{monthlyRevenue}
          </p>
          <p className="text-xs text-subtle mt-0.5">Ingresos Mes</p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400/40" />
        </div>
      </motion.section>

      {/* 3. Pending Appointments */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-lg text-cream">
            Solicitudes Pendientes
          </h2>
          <Link
            to="/studio/appointments"
            className="text-xs text-gold hover:text-gold-light transition-colors"
          >
            Ver todas
          </Link>
        </div>
        {pendingAppointments.length === 0 ? (
          <div className="rounded-xl bg-ink-light border border-white/5 p-6 text-center">
            <p className="text-cream-dark text-sm">
              No hay solicitudes pendientes
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingAppointments.map((apt) => (
              <div
                key={apt.id}
                className="rounded-xl bg-ink-light border border-white/5 p-4 flex flex-col gap-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-cream">{apt.client_name}</p>
                    <p className="text-xs text-subtle">
                      {apt.date} · {apt.time} · {apt.style} · {apt.body_part}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleConfirm(apt.id)}
                      className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/30 transition-colors"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => handleReject(apt.id)}
                      className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/30 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.section>

      {/* 4. Today's Schedule */}
      <motion.section variants={itemVariants}>
        <h2 className="font-serif text-lg text-cream mb-3">Agenda de Hoy</h2>
        {displaySchedule.length === 0 ? (
          <div className="rounded-xl bg-ink-light border border-white/5 p-6 text-center">
            <p className="text-cream-dark text-sm">Día libre</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displaySchedule.map((apt) => (
              <div
                key={apt.id}
                className="rounded-xl bg-ink-light border border-white/5 p-4 flex gap-4"
              >
                <div className="shrink-0 w-14 text-center">
                  <p className="text-lg font-serif font-semibold text-gold">
                    {apt.time.slice(0, 5)}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-cream">{apt.client_name}</p>
                  <p className="text-xs text-subtle truncate mt-0.5">
                    {apt.description}
                  </p>
                  <span className="inline-block mt-2 px-2.5 py-1 rounded-lg bg-white/5 text-subtle text-xs">
                    {apt.body_part}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.section>

      {/* 5. Unread Messages */}
      <motion.section variants={itemVariants}>
        <h2 className="font-serif text-lg text-cream mb-3">
          Mensajes sin leer
        </h2>
        {unreadConversations.length === 0 ? (
          <div className="rounded-xl bg-ink-light border border-white/5 p-4 text-center">
            <p className="text-cream-dark text-sm">Todo al día</p>
          </div>
        ) : (
          <div className="space-y-2">
            {unreadConversations.map((conv) => (
              <Link
                key={conv.client_id}
                to="/studio/messages"
                className="flex items-center gap-3 p-3 rounded-xl bg-ink-light border border-white/5 hover:border-rose/20 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-rose/20 flex items-center justify-center shrink-0">
                  <span className="text-rose-dark text-sm font-medium">
                    {getInitials(conv.client_name)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-cream truncate">{conv.client_name}</p>
                  <p className="text-xs text-subtle truncate">
                    {conv.last_message}
                  </p>
                </div>
                <span className="shrink-0 w-6 h-6 rounded-full bg-rose text-ink text-xs font-bold flex items-center justify-center">
                  {conv.unread}
                </span>
              </Link>
            ))}
          </div>
        )}
      </motion.section>

      {/* 6. Quick Actions */}
      <motion.section variants={itemVariants}>
        <h2 className="font-serif text-lg text-cream mb-3">Acciones rápidas</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/studio/portfolio"
            className="flex items-center gap-3 p-4 rounded-xl bg-ink-light border border-white/5 hover:border-gold/20 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
              <ImagePlus className="w-5 h-5 text-gold" />
            </div>
            <span className="text-sm font-medium text-cream">
              Agregar al Portfolio
            </span>
          </Link>
          <Link
            to="/studio/appointments"
            className="flex items-center gap-3 p-4 rounded-xl bg-ink-light border border-white/5 hover:border-gold/20 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
              <CalendarPlus className="w-5 h-5 text-gold" />
            </div>
            <span className="text-sm font-medium text-cream">
              Nueva Cita Manual
            </span>
          </Link>
          <Link
            to="/studio/analytics"
            className="flex items-center gap-3 p-4 rounded-xl bg-ink-light border border-white/5 hover:border-gold/20 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5 text-gold" />
            </div>
            <span className="text-sm font-medium text-cream">
              Ver Analíticas
            </span>
          </Link>
          <Link
            to="/studio/settings"
            className="flex items-center gap-3 p-4 rounded-xl bg-ink-light border border-white/5 hover:border-gold/20 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
              <Settings className="w-5 h-5 text-gold" />
            </div>
            <span className="text-sm font-medium text-cream">
              Configuración
            </span>
          </Link>
        </div>
      </motion.section>

      {/* 7. Revenue mini chart */}
      <motion.section variants={itemVariants}>
        <h2 className="font-serif text-lg text-cream mb-3">Ingresos (7 días)</h2>
        <div className="rounded-xl bg-ink-light border border-white/5 p-4">
          <div className="flex items-end justify-between gap-2 h-20">
            {dailyRevenue.map((val, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col justify-end items-center h-full"
              >
                <div
                  className="w-full rounded-t bg-gradient-to-t from-gold-dark to-gold transition-all duration-500"
                  style={{
                    height:
                      val > 0 ? `${(val / maxRevenue) * 100}%` : '4px',
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-subtle">
            <span>L</span>
            <span>M</span>
            <span>X</span>
            <span>J</span>
            <span>V</span>
            <span>S</span>
            <span>D</span>
          </div>
        </div>
      </motion.section>
    </motion.div>
  )
}
