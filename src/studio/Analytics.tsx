import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Euro } from 'lucide-react'
import { useAppointments } from '../hooks/useAppointments'
import { useOrders } from '../hooks/useOrders'
import { useStudioConfig } from '../contexts/StudioConfigContext'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

export default function Analytics() {
  const { appointments, loading: loadingAppts } = useAppointments()
  const { orders, loading: loadingOrders } = useOrders()
  const { config } = useStudioConfig()

  const loading = loadingAppts || loadingOrders

  const MONTHLY_TARGET = (config.prices as Record<string, number>).monthly_target ?? 2000

  const stats = useMemo(() => {
    const confirmedOrCompleted = appointments.filter(
      (a) => a.status === 'confirmed' || a.status === 'completed'
    )
    const tattooRevenue = confirmedOrCompleted.reduce((s, a) => s + a.deposit, 0)
    const shopRevenue = orders
      .filter(o => o.status !== 'pending')
      .reduce((s, o) => s + o.total, 0)
    const totalRevenue = tattooRevenue + shopRevenue
    const totalFromAll = totalRevenue

    const byStatus = {
      confirmed: appointments.filter((a) => a.status === 'confirmed').length,
      pending: appointments.filter((a) => a.status === 'pending').length,
      completed: appointments.filter((a) => a.status === 'completed').length,
      rejected: appointments.filter((a) => a.status === 'rejected').length,
    }
    const totalAppts = appointments.length
    const confirmedPct = totalAppts ? (byStatus.confirmed / totalAppts) * 100 : 0
    const pendingPct = totalAppts ? (byStatus.pending / totalAppts) * 100 : 0
    const completedPct = totalAppts ? (byStatus.completed / totalAppts) * 100 : 0
    const rejectedPct = totalAppts ? (byStatus.rejected / totalAppts) * 100 : 0

    const byStyle = appointments.reduce<Record<string, number>>((acc, a) => {
      acc[a.style] = (acc[a.style] ?? 0) + 1
      return acc
    }, {})
    const styleRanked = Object.entries(byStyle)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
    const maxStyleCount = Math.max(...styleRanked.map(([, c]) => c), 1)

    const byBodyPart = appointments.reduce<Record<string, number>>((acc, a) => {
      acc[a.body_part] = (acc[a.body_part] ?? 0) + 1
      return acc
    }, {})
    const bodyRanked = Object.entries(byBodyPart)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
    const maxBodyCount = Math.max(...bodyRanked.map(([, c]) => c), 1)

    const uniqueClients = new Set(appointments.map((a) => a.client_name)).size
    const avgDeposit =
      confirmedOrCompleted.length > 0
        ? totalRevenue / confirmedOrCompleted.length
        : 0
    const clientCounts = appointments.reduce<Record<string, number>>(
      (acc, a) => {
        acc[a.client_name] = (acc[a.client_name] ?? 0) + 1
        return acc
      },
      {}
    )
    const repeatClients = Object.values(clientCounts).filter((c) => c >= 2).length
    const newClients = uniqueClients - repeatClients
    const newVsReturnTotal = newClients + repeatClients
    const newPct = newVsReturnTotal ? (newClients / newVsReturnTotal) * 100 : 100
    const returnPct = newVsReturnTotal ? (repeatClients / newVsReturnTotal) * 100 : 0

    const dayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
    const dayDensity = dayLabels.map((_, i) => {
      const dayNum = i === 6 ? 0 : i + 1
      return appointments.filter((a) => {
        const d = new Date(a.date + 'T12:00:00')
        const day = d.getDay()
        return day === dayNum
      }).length
    })
    const maxDensity = Math.max(...dayDensity, 1)

    return {
      totalRevenue,
      tattooRevenue,
      shopRevenue,
      totalFromAll,
      byStatus,
      totalAppts,
      confirmedPct,
      pendingPct,
      completedPct,
      rejectedPct,
      styleRanked,
      maxStyleCount,
      bodyRanked,
      maxBodyCount,
      uniqueClients,
      avgDeposit,
      repeatClients,
      newPct,
      returnPct,
      dayDensity,
      maxDensity,
    }
  }, [appointments, orders])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 pb-24 space-y-6"
    >
      {/* Revenue Section */}
      <motion.section variants={itemVariants}>
        <h2 className="font-serif text-lg text-cream mb-3">Ingresos</h2>
        <div className="rounded-xl bg-ink-light border border-white/5 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Euro className="w-5 h-5 text-gold" />
            <span className="text-subtle text-sm">Total ingresos</span>
          </div>
          <p className="text-4xl font-serif font-bold text-gold">
            €{stats.totalRevenue}
          </p>
          <p className="text-xs text-subtle mt-1">
            Depósitos de citas confirmadas/completadas
          </p>
        </div>

        <div className="mt-4 rounded-xl bg-ink-light border border-white/5 p-4">
          <p className="text-sm text-subtle mb-2">Objetivo mensual</p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-cream font-medium">
              €{stats.totalRevenue} / €{MONTHLY_TARGET}
            </span>
          </div>
          <div className="h-2 rounded-full bg-ink overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(
                  (stats.totalRevenue / MONTHLY_TARGET) * 100,
                  100
                )}%`,
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-gold-dark to-gold"
            />
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-ink-light border border-white/5 p-4">
          <p className="text-sm text-subtle mb-3">Ingresos por fuente</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-gold shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-cream">Tatuajes</span>
                  <span className="text-gold">€{stats.tattooRevenue}</span>
                </div>
                <div className="h-2 rounded-full bg-ink overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(stats.tattooRevenue / (stats.totalFromAll || 1)) * 100}%`,
                    }}
                    transition={{ duration: 0.6 }}
                    className="h-full rounded-full bg-gold"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-rose shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-cream">Tienda (pedidos)</span>
                  <span className="text-rose">€{stats.shopRevenue}</span>
                </div>
                <div className="h-2 rounded-full bg-ink overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(stats.shopRevenue / (stats.totalFromAll || 1)) * 100}%`,
                    }}
                    transition={{ duration: 0.6 }}
                    className="h-full rounded-full bg-rose"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Appointments Analytics */}
      <motion.section variants={itemVariants}>
        <h2 className="font-serif text-lg text-cream mb-3">Citas</h2>
        <div className="rounded-xl bg-ink-light border border-white/5 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-subtle text-sm">Total citas</span>
            <span className="text-2xl font-serif font-semibold text-cream">
              {stats.totalAppts}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-gold text-sm font-medium">{stats.confirmedPct.toFixed(0)}%</p>
              <p className="text-[10px] text-subtle">Confirmadas</p>
            </div>
            <div>
              <p className="text-amber-400 text-sm font-medium">{stats.pendingPct.toFixed(0)}%</p>
              <p className="text-[10px] text-subtle">Pendientes</p>
            </div>
            <div>
              <p className="text-emerald-400 text-sm font-medium">{stats.completedPct.toFixed(0)}%</p>
              <p className="text-[10px] text-subtle">Completadas</p>
            </div>
            <div>
              <p className="text-red-400 text-sm font-medium">{stats.rejectedPct.toFixed(0)}%</p>
              <p className="text-[10px] text-subtle">Rechazadas</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-subtle">Por estado</p>
            <div className="flex gap-2 items-end h-8">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(stats.byStatus.confirmed / (stats.totalAppts || 1)) * 100}%`,
                }}
                transition={{ duration: 0.6 }}
                className="h-full rounded-l bg-gold min-w-[20px]"
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(stats.byStatus.pending / (stats.totalAppts || 1)) * 100}%`,
                }}
                transition={{ duration: 0.6 }}
                className="h-full bg-amber-400/80 min-w-[20px]"
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(stats.byStatus.completed / (stats.totalAppts || 1)) * 100}%`,
                }}
                transition={{ duration: 0.6 }}
                className="h-full bg-emerald-400/80 min-w-[20px]"
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(stats.byStatus.rejected / (stats.totalAppts || 1)) * 100}%`,
                }}
                transition={{ duration: 0.6 }}
                className="h-full rounded-r bg-red-400/80 min-w-[20px]"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-ink-light border border-white/5 p-4">
          <p className="text-sm text-subtle mb-3">Estilos más populares</p>
          <div className="space-y-3">
            {stats.styleRanked.map(([style, count], i) => (
              <div key={style} className="flex items-center gap-3">
                <span className="text-subtle text-xs w-5">{i + 1}</span>
                <span className="text-cream text-sm flex-1 truncate">{style}</span>
                <div className="flex-1 max-w-24 h-2 rounded-full bg-ink overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(count / stats.maxStyleCount) * 100}%`,
                    }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className="h-full rounded-full bg-gold"
                  />
                </div>
                <span className="text-gold text-xs w-6">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-ink-light border border-white/5 p-4">
          <p className="text-sm text-subtle mb-3">Zonas más populares</p>
          <div className="space-y-3">
            {stats.bodyRanked.map(([part, count], i) => (
              <div key={part} className="flex items-center gap-3">
                <span className="text-subtle text-xs w-5">{i + 1}</span>
                <span className="text-cream text-sm flex-1 truncate">{part}</span>
                <div className="flex-1 max-w-24 h-2 rounded-full bg-ink overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(count / stats.maxBodyCount) * 100}%`,
                    }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className="h-full rounded-full bg-rose"
                  />
                </div>
                <span className="text-rose text-xs w-6">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Client Insights */}
      <motion.section variants={itemVariants}>
        <h2 className="font-serif text-lg text-cream mb-3">Clientes</h2>
        <div className="rounded-xl bg-ink-light border border-white/5 p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-subtle text-xs">Clientes únicos</p>
              <p className="text-xl font-serif font-semibold text-cream">
                {stats.uniqueClients}
              </p>
            </div>
            <div>
              <p className="text-subtle text-xs">Depósito medio</p>
              <p className="text-xl font-serif font-semibold text-gold">
                €{stats.avgDeposit.toFixed(0)}
              </p>
            </div>
            <div>
              <p className="text-subtle text-xs">Clientes recurrentes</p>
              <p className="text-xl font-serif font-semibold text-cream">
                {stats.repeatClients}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs text-subtle mb-2">Nuevos vs recurrentes</p>
            <div className="h-3 rounded-full bg-ink overflow-hidden flex">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.newPct}%` }}
                transition={{ duration: 0.6 }}
                className="h-full bg-gold"
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.returnPct}%` }}
                transition={{ duration: 0.6 }}
                className="h-full bg-rose"
              />
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-subtle">
              <span>Nuevos {stats.newPct.toFixed(0)}%</span>
              <span>Recurrentes {stats.returnPct.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Monthly Overview */}
      <motion.section variants={itemVariants}>
        <h2 className="font-serif text-lg text-cream mb-3">Densidad semanal</h2>
        <div className="rounded-xl bg-ink-light border border-white/5 p-4">
          <div className="flex items-end justify-between gap-2 h-24">
            {stats.dayDensity.map((val, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col justify-end items-center"
              >
                <motion.div
                  initial={{ height: 0 }}
                  animate={{
                    height: val > 0 ? `${(val / stats.maxDensity) * 100}%` : '4px',
                  }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="w-full rounded-t bg-gradient-to-t from-gold-dark to-gold min-h-[4px]"
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
