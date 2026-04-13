import { useState, useMemo, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Check, Bell, LogIn } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { useReminders } from '../hooks/useReminders'
import { useAuth } from '../contexts/AuthContext'
import i18n from '../i18n'
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
  const { t } = useTranslation('reminders')
  const { t: tc } = useTranslation()
  const { user, loading: authLoading } = useAuth()
  const { reminders, create, toggleComplete, loading, error } = useReminders(user?.uid)
  const [showSheet, setShowSheet] = useState(false)
  const [form, setForm] = useState(initialFormState)
  const [mutationError, setMutationError] = useState<string | null>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const closeSheet = useCallback(() => setShowSheet(false), [])

  useFocusTrap(sheetRef, showSheet, closeSheet)

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

  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.title || !form.date || !form.time) {
      setMutationError(tc('errors.requiredFields'))
      return
    }
    if (saving) return
    setSaving(true)
    setMutationError(null)
    try {
      const result = await create({
        user_id: user?.uid ?? '',
        title: form.title,
        date: form.date,
        time: form.time,
        type: form.type,
        completed: false,
      })
      if (result?.error) {
        setMutationError(result.error)
        return
      }
      setForm(initialFormState)
      setShowSheet(false)
    } finally {
      setSaving(false)
    }
  }

  const [togglingId, setTogglingId] = useState<string | null>(null)

  const handleToggle = async (id: string) => {
    if (togglingId) return
    setTogglingId(id)
    setMutationError(null)
    try {
      const result = await toggleComplete(id)
      if (result?.error) setMutationError(result.error)
    } finally {
      setTogglingId(null)
    }
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
          type="button"
          onClick={() => handleToggle(reminder.id)}
          disabled={togglingId === reminder.id}
          aria-label={reminder.completed ? t('markPending') : t('markCompleted')}
          className={`shrink-0 w-9 h-9 rounded-full border-2 flex items-center justify-center transition-colors disabled:opacity-50 ${
            reminder.completed
              ? 'bg-gold/30 border-gold text-gold'
              : 'border-subtle/50 hover:border-gold/50 text-transparent'
          }`}
        >
          {reminder.completed && <Check size={18} strokeWidth={2.5} />}
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
            {new Date(reminder.date).toLocaleDateString(i18n.language, {
              day: 'numeric',
              month: 'short',
            })}{' '}
            · {reminder.time}
          </p>
        </div>
        <span className={`text-[10px] px-2 py-1 rounded-full shrink-0 ${badgeStyles}`}>
          {t(`type.${reminder.type}`)}
        </span>
      </motion.article>
    )
  }

  if (!authLoading && !user) {
    return (
      <div className="min-h-dvh bg-ink">
        <PageHeader title={t('title')} subtitle={t('subtitle')} />
        <div className="px-5 pt-8 pb-28 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mb-5">
            <Bell className="w-8 h-8 text-gold" />
          </div>
          <h2 className="font-serif text-xl text-cream mb-2">{t('guest.title')}</h2>
          <p className="text-cream-dark text-sm leading-relaxed max-w-xs mb-8">
            {t('guest.description')}
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Link
              to={`/login?returnTo=${encodeURIComponent('/reminders')}`}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gold text-ink font-medium text-sm hover:bg-gold-light transition-colors"
            >
              <LogIn size={16} />
              {tc('auth.login')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-ink">
        <div className="space-y-3 px-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-ink-medium/40 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-ink">
      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      {error && (
        <div className="mx-5 mt-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm">{error}</div>
      )}

      <div className="px-5 pt-4 pb-28">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {groupedReminders.today.length > 0 && (
            <motion.section variants={itemVariants}>
              <h2 className="font-serif text-sm text-gold uppercase tracking-wider mb-3">{t('sections.today')}</h2>
              <div className="space-y-2">
                {groupedReminders.today.map(renderReminderCard)}
              </div>
            </motion.section>
          )}

          {groupedReminders.tomorrow.length > 0 && (
            <motion.section variants={itemVariants}>
              <h2 className="font-serif text-sm text-gold uppercase tracking-wider mb-3">
                {t('sections.tomorrow')}
              </h2>
              <div className="space-y-2">
                {groupedReminders.tomorrow.map(renderReminderCard)}
              </div>
            </motion.section>
          )}

          {groupedReminders.upcoming.length > 0 && (
            <motion.section variants={itemVariants}>
              <h2 className="font-serif text-sm text-gold uppercase tracking-wider mb-3">
                {t('sections.upcoming')}
              </h2>
              <div className="space-y-2">
                {groupedReminders.upcoming.map(renderReminderCard)}
              </div>
            </motion.section>
          )}

          {reminders.length === 0 && (
            <motion.p variants={itemVariants} className="text-subtle text-sm py-8 text-center">
              {t('empty')}
            </motion.p>
          )}
        </motion.div>
      </div>

      {/* FAB */}
      <motion.button
        type="button"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowSheet(true)}
        aria-label={t('newReminder')}
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
              className="fixed inset-0 z-[60] bg-ink/80 backdrop-blur-sm"
            />
            <motion.div
              ref={sheetRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label={t('newReminder')}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[60] max-h-[75dvh] overflow-y-auto rounded-t-2xl bg-ink-light border-t border-white/10 outline-none"
            >
              <div className="sticky top-0 bg-ink-light/95 backdrop-blur flex items-center justify-between px-5 py-4 border-b border-white/5">
                <h2 className="font-serif text-lg text-cream">{t('newReminder')}</h2>
                <button
                  type="button"
                  onClick={() => setShowSheet(false)}
                  aria-label={tc('close')}
                  className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center text-subtle hover:text-cream"
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
                  <label htmlFor="reminder-title" className="block text-xs text-subtle mb-1.5">{t('form.titleLabel')}</label>
                  <input
                    id="reminder-title"
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder={t('form.titlePlaceholder')}
                    className="w-full px-4 py-3 rounded-xl bg-ink border border-white/5 text-cream placeholder:text-subtle/60 focus:outline-none focus:border-gold/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="reminder-date" className="block text-xs text-subtle mb-1.5">{t('form.date')}</label>
                    <input
                      id="reminder-date"
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-ink border border-white/5 text-cream focus:outline-none focus:border-gold/50"
                    />
                  </div>
                  <div>
                    <label htmlFor="reminder-time" className="block text-xs text-subtle mb-1.5">{t('form.time')}</label>
                    <input
                      id="reminder-time"
                      type="time"
                      value={form.time}
                      onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-ink border border-white/5 text-cream focus:outline-none focus:border-gold/50"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="reminder-type" className="block text-xs text-subtle mb-1.5">{t('form.type')}</label>
                  <select
                    id="reminder-type"
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, type: e.target.value as Reminder['type'] }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-ink border border-white/5 text-cream focus:outline-none focus:border-gold/50"
                  >
                    <option value="appointment">{t('type.appointment')}</option>
                    <option value="followup">{t('type.followup')}</option>
                    <option value="custom">{t('type.custom')}</option>
                  </select>
                </div>
                {mutationError && (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm">{mutationError}</div>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3.5 rounded-xl bg-gold text-ink font-medium hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? tc('saving') : tc('save')}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
