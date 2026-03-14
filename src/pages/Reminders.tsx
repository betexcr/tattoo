import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Check } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { useReminders } from '../hooks/useReminders'
import type { Reminder } from '../types'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

function getTypeBadgeStyles(type: Reminder['type']) {
  switch (type) {
    case 'appointment':
      return 'bg-gold/20 text-gold'
    case 'followup':
      return 'bg-rose/20 text-rose'
    case 'custom':
      return 'bg-subtle/20 text-subtle'
  }
}

function getTypeLabel(type: Reminder['type']) {
  switch (type) {
    case 'appointment':
      return 'Cita'
    case 'followup':
      return 'Seguimiento'
    case 'custom':
      return 'Personalizado'
  }
}

function getDateSection(dateStr: string): 'today' | 'tomorrow' | 'upcoming' {
  const d = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  d.setHours(0, 0, 0, 0)

  if (d.getTime() === today.getTime()) return 'today'
  if (d.getTime() === tomorrow.getTime()) return 'tomorrow'
  return 'upcoming'
}

const initialFormState = {
  title: '',
  date: '',
  time: '',
  type: 'custom' as Reminder['type'],
}

export default function Reminders() {
  const { reminders, create, toggleComplete } = useReminders()
  const [showSheet, setShowSheet] = useState(false)
  const [form, setForm] = useState(initialFormState)

  const groupedReminders = useMemo(() => {
    const today: Reminder[] = []
    const tomorrow: Reminder[] = []
    const upcoming: Reminder[] = []

    const sorted = [...reminders].sort(
      (a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime()
    )

    for (const r of sorted) {
      const section = getDateSection(r.date)
      if (section === 'today') today.push(r)
      else if (section === 'tomorrow') tomorrow.push(r)
      else upcoming.push(r)
    }

    return { today, tomorrow, upcoming }
  }, [reminders])

  const handleSave = async () => {
    if (!form.title || !form.date || !form.time) return
    await create({
      title: form.title,
      date: form.date,
      time: form.time,
      type: form.type,
      completed: false,
    })
    setForm(initialFormState)
    setShowSheet(false)
  }

  const renderReminderCard = (reminder: Reminder) => {
    const badgeStyles = getTypeBadgeStyles(reminder.type)
    return (
      <motion.article
        key={reminder.id}
        variants={itemVariants}
        className={`flex items-center gap-3 p-4 rounded-xl bg-ink-light border border-white/5 ${
          reminder.completed ? 'opacity-60' : ''
        }`}
      >
        <button
          onClick={() => toggleComplete(reminder.id)}
          className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            reminder.completed
              ? 'bg-gold/30 border-gold text-gold'
              : 'border-subtle/50 hover:border-gold/50 text-transparent'
          }`}
        >
          {reminder.completed && <Check size={14} strokeWidth={2.5} />}
        </button>
        <div className="flex-1 min-w-0">
          <h3
            className={`font-medium text-cream ${
              reminder.completed ? 'line-through text-subtle' : ''
            }`}
          >
            {reminder.title}
          </h3>
          <p className="text-subtle text-sm mt-0.5">
            {new Date(reminder.date).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
            })}{' '}
            · {reminder.time}
          </p>
        </div>
        <span className={`text-[10px] px-2 py-1 rounded-full shrink-0 ${badgeStyles}`}>
          {getTypeLabel(reminder.type)}
        </span>
      </motion.article>
    )
  }

  return (
    <div className="min-h-dvh bg-ink">
      <PageHeader title="Recordatorios" subtitle="No olvides nada" />

      <div className="px-5 pt-4 pb-28">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {groupedReminders.today.length > 0 && (
            <motion.section variants={itemVariants}>
              <h2 className="font-serif text-sm text-gold uppercase tracking-wider mb-3">Hoy</h2>
              <div className="space-y-2">
                {groupedReminders.today.map(renderReminderCard)}
              </div>
            </motion.section>
          )}

          {groupedReminders.tomorrow.length > 0 && (
            <motion.section variants={itemVariants}>
              <h2 className="font-serif text-sm text-gold uppercase tracking-wider mb-3">
                Mañana
              </h2>
              <div className="space-y-2">
                {groupedReminders.tomorrow.map(renderReminderCard)}
              </div>
            </motion.section>
          )}

          {groupedReminders.upcoming.length > 0 && (
            <motion.section variants={itemVariants}>
              <h2 className="font-serif text-sm text-gold uppercase tracking-wider mb-3">
                Próximos
              </h2>
              <div className="space-y-2">
                {groupedReminders.upcoming.map(renderReminderCard)}
              </div>
            </motion.section>
          )}

          {reminders.length === 0 && (
            <motion.p variants={itemVariants} className="text-subtle text-sm py-8 text-center">
              No hay recordatorios
            </motion.p>
          )}
        </motion.div>
      </div>

      {/* FAB */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowSheet(true)}
        className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full bg-gold text-ink flex items-center justify-center shadow-lg shadow-gold/25 hover:bg-gold-light transition-colors"
      >
        <Plus size={24} strokeWidth={2.5} />
      </motion.button>

      {/* Bottom sheet form */}
      <AnimatePresence>
        {showSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSheet(false)}
              className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[75dvh] overflow-y-auto rounded-t-2xl bg-ink-light border-t border-white/10"
            >
              <div className="sticky top-0 bg-ink-light/95 backdrop-blur flex items-center justify-between px-5 py-4 border-b border-white/5">
                <h2 className="font-serif text-lg text-cream">Nuevo recordatorio</h2>
                <button
                  onClick={() => setShowSheet(false)}
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
                  <label className="block text-xs text-subtle mb-1.5">Título</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="¿Qué necesitas recordar?"
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
                  <label className="block text-xs text-subtle mb-1.5">Tipo</label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, type: e.target.value as Reminder['type'] }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-ink border border-white/5 text-cream focus:outline-none focus:border-gold/50"
                  >
                    <option value="appointment">Cita</option>
                    <option value="followup">Seguimiento</option>
                    <option value="custom">Personalizado</option>
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
