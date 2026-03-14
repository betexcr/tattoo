import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Phone,
  Check,
  CheckCheck,
  AlertTriangle,
} from 'lucide-react'
import { bodyParts, tattooStyles } from '../data/constants'
import { useAppointments } from '../hooks/useAppointments'
import type { Appointment } from '../types'

const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function formatDateKey(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${year}-${m}-${d}`
}

function getDayOfWeek(date: Date): number {
  return (date.getDay() + 6) % 7
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getStatusStyles(status: Appointment['status']) {
  switch (status) {
    case 'confirmed':
      return { badge: 'bg-emerald-500/20 text-emerald-400', label: 'Confirmada' }
    case 'pending':
      return { badge: 'bg-amber-500/20 text-amber-400', label: 'Pendiente' }
    case 'completed':
      return { badge: 'bg-subtle/20 text-subtle', label: 'Completada' }
    case 'rejected':
      return { badge: 'bg-red-500/20 text-red-400', label: 'Rechazada' }
  }
}

type ViewMode = 'calendar' | 'list'
type FilterKey = 'all' | 'pending' | 'confirmed' | 'completed' | 'rejected'

const initialFormState = {
  client: '',
  phone: '',
  email: '',
  date: '',
  time: '',
  description: '',
  bodyPart: '',
  style: '',
  deposit: '',
  status: 'pending' as 'pending' | 'confirmed',
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.03 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

export default function Appointments() {
  const { appointments, create, updateStatus: hookUpdateStatus } = useAppointments()
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [calendarView, setCalendarView] = useState({ year: 2026, month: 2 })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(initialFormState)
  const [rejectConfirmId, setRejectConfirmId] = useState<string | null>(null)
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null)

  const today = useMemo(() => {
    const t = new Date()
    return formatDateKey(t.getFullYear(), t.getMonth(), t.getDate())
  }, [])

  const filteredAppointments = useMemo(() => {
    let list = appointments
    if (activeFilter === 'pending') list = list.filter((a) => a.status === 'pending')
    else if (activeFilter === 'confirmed') list = list.filter((a) => a.status === 'confirmed')
    else if (activeFilter === 'completed') list = list.filter((a) => a.status === 'completed')
    else if (activeFilter === 'rejected') list = list.filter((a) => a.status === 'rejected')
    return list.sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime())
  }, [appointments, activeFilter])

  const filterCounts = useMemo(
    () => ({
      all: appointments.length,
      pending: appointments.filter((a) => a.status === 'pending').length,
      confirmed: appointments.filter((a) => a.status === 'confirmed').length,
      completed: appointments.filter((a) => a.status === 'completed').length,
      rejected: appointments.filter((a) => a.status === 'rejected').length,
    }),
    [appointments]
  )

  const datesWithAppointments = useMemo(() => {
    const set = new Set<string>()
    filteredAppointments.forEach((a) => set.add(a.date))
    return set
  }, [filteredAppointments])

  const calendarDays = useMemo(() => {
    const { year, month } = calendarView
    const first = new Date(year, month, 1)
    const last = new Date(year, month + 1, 0)
    const daysInMonth = last.getDate()
    const startOffset = getDayOfWeek(first)
    const cells: {
      date: string
      day: number
      isCurrentMonth: boolean
      isSunday: boolean
      hasAppointments: boolean
    }[] = []

    for (let i = 0; i < startOffset; i++) {
      const prevMonth = new Date(year, month, -startOffset + i + 1)
      const d = prevMonth.getDate()
      const dateKey = formatDateKey(prevMonth.getFullYear(), prevMonth.getMonth(), d)
      cells.push({
        date: dateKey,
        day: d,
        isCurrentMonth: false,
        isSunday: prevMonth.getDay() === 0,
        hasAppointments: datesWithAppointments.has(dateKey),
      })
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = formatDateKey(year, month, d)
      const dateObj = new Date(year, month, d)
      cells.push({
        date: dateKey,
        day: d,
        isCurrentMonth: true,
        isSunday: dateObj.getDay() === 0,
        hasAppointments: datesWithAppointments.has(dateKey),
      })
    }

    const remaining = 42 - cells.length
    for (let i = 0; i < remaining; i++) {
      const nextMonth = new Date(year, month + 1, i + 1)
      const d = nextMonth.getDate()
      const dateKey = formatDateKey(nextMonth.getFullYear(), nextMonth.getMonth(), d)
      cells.push({
        date: dateKey,
        day: d,
        isCurrentMonth: false,
        isSunday: nextMonth.getDay() === 0,
        hasAppointments: datesWithAppointments.has(dateKey),
      })
    }

    return cells
  }, [calendarView, datesWithAppointments])

  const selectedDateAppointments = useMemo(() => {
    if (!selectedDate) return []
    return filteredAppointments.filter((a) => a.date === selectedDate)
  }, [selectedDate, filteredAppointments])

  const listGroupedByDate = useMemo(() => {
    const groups: Record<string, Appointment[]> = {}
    filteredAppointments.forEach((apt) => {
      if (!groups[apt.date]) groups[apt.date] = []
      groups[apt.date].push(apt)
    })
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [filteredAppointments])

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ]

  const handleUpdateStatus = async (id: string, status: Appointment['status']) => {
    await hookUpdateStatus(id, status)
    setRejectConfirmId(null)
    setCancelConfirmId(null)
  }

  const handleSave = async () => {
    if (!form.client.trim() || !form.date || !form.time) return
    await create({
      client_id: null,
      client_name: form.client.trim(),
      phone: form.phone || '',
      email: form.email || '',
      date: form.date,
      time: form.time,
      description: form.description.trim(),
      body_part: form.bodyPart || '',
      style: form.style || '',
      status: form.status,
      deposit: Number(form.deposit) || 0,
      reference_images: [],
      size: '',
      notes: '',
    })
    setForm(initialFormState)
    setModalOpen(false)
  }

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'pending', label: 'Pendientes' },
    { key: 'confirmed', label: 'Confirmadas' },
    { key: 'completed', label: 'Completadas' },
    { key: 'rejected', label: 'Rechazadas' },
  ]

  function AppointmentCard({ apt }: { apt: Appointment }) {
    const styles = getStatusStyles(apt.status)
    const hasActions = apt.status === 'pending' || apt.status === 'confirmed'

    return (
      <motion.article
        variants={itemVariants}
        className="rounded-xl bg-ink-light border border-white/5 overflow-hidden"
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-serif text-cream font-medium">{apt.client_name}</h3>
            <span className={`text-[10px] px-2 py-1 rounded-full shrink-0 ${styles.badge}`}>
              {styles.label}
            </span>
          </div>
          {apt.phone && (
            <div className="flex items-center gap-1.5 text-subtle text-sm mb-1.5">
              <Phone size={14} />
              <span>{apt.phone}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-subtle mb-2">
            <span>{formatDate(apt.date)}</span>
            <span>·</span>
            <span>{apt.time}</span>
            <span>·</span>
            <span>{apt.body_part}</span>
          </div>
          <span className="inline-block text-[10px] text-gold/90 px-2 py-0.5 rounded bg-gold/10 mb-2">
            {apt.style}
          </span>
          <p className="text-cream-dark text-sm mb-2">{apt.description}</p>
          <p className="text-gold text-xs font-medium">Depósito: €{apt.deposit}</p>

          {hasActions && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/5">
              {apt.status === 'pending' && (
                <div className="flex items-center gap-2 ml-auto">
                  <AnimatePresence mode="wait">
                    {rejectConfirmId === apt.id ? (
                      <motion.div
                        key="confirm-reject"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center gap-1.5"
                      >
                        <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                        <span className="text-xs text-subtle">¿Seguro?</span>
                        <button
                          onClick={() => handleUpdateStatus(apt.id, 'rejected')}
                          className="px-2 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs border border-red-500/30 hover:bg-red-500/30"
                        >
                          Sí, rechazar
                        </button>
                        <button
                          onClick={() => setRejectConfirmId(null)}
                          className="px-2 py-1 rounded-lg bg-white/5 text-subtle text-xs hover:bg-white/10"
                        >
                          Cancelar
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="buttons"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <button
                          onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium hover:bg-emerald-500/30"
                        >
                          <Check size={14} />
                          Confirmar
                        </button>
                        <button
                          onClick={() => setRejectConfirmId(apt.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium hover:bg-red-500/20"
                        >
                          <X size={14} />
                          Rechazar
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {apt.status === 'confirmed' && (
                <div className="flex items-center gap-2 ml-auto">
                  <AnimatePresence mode="wait">
                    {cancelConfirmId === apt.id ? (
                      <motion.div
                        key="confirm-cancel"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center gap-1.5"
                      >
                        <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                        <span className="text-xs text-subtle">¿Cancelar cita?</span>
                        <button
                          onClick={() => handleUpdateStatus(apt.id, 'rejected')}
                          className="px-2 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs border border-red-500/30 hover:bg-red-500/30"
                        >
                          Sí
                        </button>
                        <button
                          onClick={() => setCancelConfirmId(null)}
                          className="px-2 py-1 rounded-lg bg-white/5 text-subtle text-xs hover:bg-white/10"
                        >
                          No
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="buttons"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <button
                          onClick={() => handleUpdateStatus(apt.id, 'completed')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gold/50 text-gold text-xs font-medium hover:bg-gold/10"
                        >
                          <CheckCheck size={14} />
                          Completar
                        </button>
                        <button
                          onClick={() => setCancelConfirmId(apt.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/10"
                        >
                          <X size={14} />
                          Cancelar
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.article>
    )
  }

  return (
    <div className="min-h-dvh bg-ink">
      <div className="px-4 pt-4 pb-28">
        {/* View toggle */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 mb-4"
        >
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              viewMode === 'calendar'
                ? 'bg-gold text-ink'
                : 'bg-ink-medium text-subtle hover:text-cream-dark'
            }`}
          >
            Calendario
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              viewMode === 'list'
                ? 'bg-gold text-ink'
                : 'bg-ink-medium text-subtle hover:text-cream-dark'
            }`}
          >
            Lista
          </button>
        </motion.div>

        {/* Filter pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1"
        >
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`relative shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeFilter === f.key
                  ? 'bg-gold/20 text-gold border border-gold/40'
                  : 'bg-ink-medium text-subtle hover:text-cream-dark border border-transparent'
              }`}
            >
              {f.label}
              <span
                className={`ml-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold inline-flex items-center justify-center ${
                  activeFilter === f.key ? 'bg-gold/30 text-gold' : 'bg-white/10 text-subtle'
                }`}
              >
                {filterCounts[f.key]}
              </span>
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {viewMode === 'calendar' ? (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Calendar */}
              <div className="rounded-2xl bg-ink-light border border-white/5 p-4">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() =>
                      setCalendarView((v) =>
                        v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 }
                      )
                    }
                    className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-subtle hover:text-cream"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="font-serif text-cream font-medium">
                    {monthNames[calendarView.month]} {calendarView.year}
                  </span>
                  <button
                    onClick={() =>
                      setCalendarView((v) =>
                        v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 }
                      )
                    }
                    className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-subtle hover:text-cream"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-1">
                  {WEEKDAY_LABELS.map((label) => (
                    <div
                      key={label}
                      className="text-center text-[10px] text-subtle font-medium py-1"
                    >
                      {label}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((cell) => {
                    const isToday = cell.date === today
                    const isSelected = cell.date === selectedDate

                    return (
                      <button
                        key={cell.date}
                        type="button"
                        onClick={() => setSelectedDate(cell.date)}
                        className={`
                          aspect-square rounded-lg text-sm font-medium transition-all flex flex-col items-center justify-center gap-0.5
                          ${!cell.isCurrentMonth ? 'text-subtle/40' : 'text-cream'}
                          ${cell.isSunday ? 'opacity-40' : ''}
                          ${isSelected ? 'border-2 border-gold bg-gold/20 text-gold' : ''}
                          ${!isSelected ? 'border border-white/5 bg-ink' : ''}
                          ${isToday && !isSelected ? 'ring-1 ring-gold/50' : ''}
                        `}
                      >
                        {cell.day}
                        {cell.hasAppointments && (
                          <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Selected day appointments */}
              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3"
                >
                  <h3 className="text-sm font-medium text-subtle">
                    Citas del {formatDate(selectedDate)}
                  </h3>
                  {selectedDateAppointments.length > 0 ? (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-3"
                    >
                      {selectedDateAppointments.map((apt) => (
                        <AppointmentCard key={apt.id} apt={apt} />
                      ))}
                    </motion.div>
                  ) : (
                    <p className="text-subtle text-sm py-4 text-center">
                      No hay citas para este día
                    </p>
                  )}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {filteredAppointments.length > 0 ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6"
                >
                  {listGroupedByDate.map(([date, apts]) => (
                    <div key={date}>
                      <h3 className="text-sm font-medium text-subtle mb-3 sticky top-14 bg-ink py-1">
                        {formatDate(date)}
                      </h3>
                      <div className="space-y-3">
                        {apts.map((apt) => (
                          <AppointmentCard key={apt.id} apt={apt} />
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-subtle text-sm py-12 text-center"
                >
                  No hay citas
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FAB */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setModalOpen(true)}
        className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full bg-gold text-ink flex items-center justify-center shadow-lg shadow-gold/25 hover:bg-gold-light transition-colors"
      >
        <Plus size={24} strokeWidth={2.5} />
      </motion.button>

      {/* Add appointment modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-2xl bg-ink-light border-t border-white/10"
            >
              <div className="sticky top-0 bg-ink-light/95 backdrop-blur flex items-center justify-between px-5 py-4 border-b border-white/5">
                <h2 className="font-serif text-lg text-cream">Nueva cita</h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-subtle hover:text-cream"
                >
                  <X size={18} />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSave()
                }}
                className="p-5 space-y-4"
              >
                <div>
                  <label className="block text-xs text-subtle mb-1.5">Cliente</label>
                  <input
                    type="text"
                    value={form.client}
                    onChange={(e) => setForm((f) => ({ ...f, client: e.target.value }))}
                    placeholder="Nombre del cliente"
                    className="w-full px-4 py-3 rounded-xl bg-ink border border-white/5 text-cream placeholder:text-subtle/60 focus:outline-none focus:border-gold/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-subtle mb-1.5">Teléfono</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+34 600 000 000"
                    className="w-full px-4 py-3 rounded-xl bg-ink border border-white/5 text-cream placeholder:text-subtle/60 focus:outline-none focus:border-gold/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-subtle mb-1.5">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="cliente@email.com"
                    className="w-full px-4 py-3 rounded-xl bg-ink border border-white/5 text-cream placeholder:text-subtle/60 focus:outline-none focus:border-gold/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-subtle mb-1.5">Fecha</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-ink border border-white/5 text-cream focus:outline-none focus:border-gold/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-subtle mb-1.5">Hora</label>
                    <input
                      type="time"
                      value={form.time}
                      onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-ink border border-white/5 text-cream focus:outline-none focus:border-gold/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-subtle mb-1.5">Descripción</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Describe el diseño..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-ink border border-white/5 text-cream placeholder:text-subtle/60 focus:outline-none focus:border-gold/50 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-subtle mb-1.5">Parte del cuerpo</label>
                  <select
                    value={form.bodyPart}
                    onChange={(e) => setForm((f) => ({ ...f, bodyPart: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-ink border border-white/5 text-cream focus:outline-none focus:border-gold/50"
                  >
                    <option value="">Seleccionar</option>
                    {bodyParts.map((part) => (
                      <option key={part} value={part}>
                        {part}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-subtle mb-1.5">Estilo</label>
                  <select
                    value={form.style}
                    onChange={(e) => setForm((f) => ({ ...f, style: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-ink border border-white/5 text-cream focus:outline-none focus:border-gold/50"
                  >
                    <option value="">Seleccionar</option>
                    {tattooStyles.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-subtle mb-1.5">Depósito (€)</label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={form.deposit}
                    onChange={(e) => setForm((f) => ({ ...f, deposit: e.target.value }))}
                    placeholder="0"
                    className="w-full px-4 py-3 rounded-xl bg-ink border border-white/5 text-cream placeholder:text-subtle/60 focus:outline-none focus:border-gold/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-subtle mb-1.5">Estado</label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        status: e.target.value as 'pending' | 'confirmed',
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-ink border border-white/5 text-cream focus:outline-none focus:border-gold/50"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="confirmed">Confirmada</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gold text-ink font-medium hover:bg-gold-light transition-colors"
                >
                  Guardar
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
