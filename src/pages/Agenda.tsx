import { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, CalendarPlus, Check, Phone, MessageCircle, CheckCheck, AlertTriangle, LogIn } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { useStudioConfig } from '../contexts/StudioConfigContext'
import { useAppointments } from '../hooks/useAppointments'
import { useAuth } from '../contexts/AuthContext'
import i18n from '../i18n'
import type { Appointment } from '../types'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' })
}

function getStatusStyles(status: Appointment['status']) {
  switch (status) {
    case 'confirmed':
      return { border: 'border-l-gold', badge: 'bg-emerald-500/20 text-emerald-400' }
    case 'pending':
      return { border: 'border-l-amber-500', badge: 'bg-amber-500/20 text-amber-400' }
    case 'completed':
      return { border: 'border-l-subtle', badge: 'bg-subtle/20 text-subtle' }
    case 'rejected':
      return { border: 'border-l-red-500', badge: 'bg-red-500/20 text-red-400' }
  }
}

const initialFormState = {
  client: '',
  date: '',
  time: '',
  description: '',
  bodyPart: '',
  style: '',
  deposit: '',
}

type TabKey = 'pending' | 'confirmed' | 'completed'

export default function Agenda() {
  const { t } = useTranslation('agenda')
  const { t: tc } = useTranslation()
  const { config } = useStudioConfig()
  const { user, isArtist, loading: authLoading } = useAuth()
  const { appointments, create, updateStatus, loading, error } = useAppointments(
    isArtist ? undefined : user?.uid,
    { skip: !authLoading && !user },
  )
  const [activeTab, setActiveTab] = useState<TabKey>('pending')
  const [statusError, setStatusError] = useState<string | null>(null)
  const [updatingApptId, setUpdatingApptId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(initialFormState)
  const [rejectConfirmId, setRejectConfirmId] = useState<string | null>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const closeModal = useCallback(() => setShowModal(false), [])

  useFocusTrap(sheetRef, showModal, closeModal)

  const pendingAppointments = appointments
    .filter((a) => a.status === 'pending')
    .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime())

  const confirmedAppointments = appointments
    .filter((a) => a.status === 'confirmed')
    .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime())

  const completedAppointments = appointments
    .filter((a) => a.status === 'completed' || a.status === 'rejected')
    .sort((a, b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime())

  const tabCounts = {
    pending: pendingAppointments.length,
    confirmed: confirmedAppointments.length,
    completed: completedAppointments.length,
  }

  const displayedAppointments =
    activeTab === 'pending'
      ? pendingAppointments
      : activeTab === 'confirmed'
        ? confirmedAppointments
        : completedAppointments

  const handleStatusUpdate = async (id: string, status: Appointment['status']) => {
    if (updatingApptId) return
    setStatusError(null)
    setUpdatingApptId(id)
    try {
      const result = await updateStatus(id, status)
      if (result?.error) setStatusError(result.error)
      setRejectConfirmId(null)
    } finally {
      setUpdatingApptId(null)
    }
  }

  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (saving) return
    if (!form.client || !form.date || !form.time) {
      setSaveError(tc('errors.requiredFields'))
      return
    }
    setSaving(true)
    try {
      const result = await create({
        client_id: null,
        client_name: form.client,
        date: form.date,
        time: form.time,
        description: form.description,
        body_part: form.bodyPart,
        style: form.style,
        status: 'pending',
        deposit: Number(form.deposit) || 0,
        phone: '',
        email: '',
        reference_images: [],
        size: '',
        notes: '',
      })
      if (result?.error) {
        setSaveError(result.error)
        return
      }
      setSaveError(null)
      setForm(initialFormState)
      setShowModal(false)
    } finally {
      setSaving(false)
    }
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'pending', label: t('tabs.pending') },
    { key: 'confirmed', label: t('tabs.confirmed') },
    { key: 'completed', label: t('tabs.completed') },
  ]

  if (!authLoading && !user) {
    return (
      <div className="min-h-dvh bg-ink">
        <PageHeader title={t('title')} subtitle={t('subtitle')} />
        <div className="px-5 pt-8 pb-28 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mb-5">
            <CalendarPlus className="w-8 h-8 text-gold" />
          </div>
          <h2 className="font-serif text-xl text-cream mb-2">{t('guest.title')}</h2>
          <p className="text-cream-dark text-sm leading-relaxed max-w-xs mb-8">
            {t('guest.description')}
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Link
              to={`/login?returnTo=${encodeURIComponent('/agenda')}`}
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
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-ink-medium/40 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-ink">
      {(error || statusError) && (
        <div className="mx-4 mt-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm">{error || statusError}</div>
      )}
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        action={
          <Link
            to="/book"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold/10 text-gold text-xs font-medium hover:bg-gold/20 transition-colors"
          >
            <CalendarPlus size={13} />
            {t('book')}
          </Link>
        }
      />

      <div className="px-5 pt-4 pb-28">
        {/* Tab pills */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 mb-6"
        >
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              aria-pressed={activeTab === tab.key}
              className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-gold text-ink'
                  : 'bg-ink-medium text-subtle hover:text-cream-dark'
              }`}
            >
              {tab.label}
              <span
                className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold flex items-center justify-center ${
                  activeTab === tab.key ? 'bg-ink/40 text-ink' : 'bg-white/10 text-subtle'
                }`}
              >
                {tabCounts[tab.key]}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Appointment list */}
        <motion.div
          key={activeTab}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {displayedAppointments.length > 0 ? (
            displayedAppointments.map((apt) => {
              const styles = getStatusStyles(apt.status)
              const isRejected = apt.status === 'rejected'
              return (
                <motion.article
                  key={apt.id}
                  variants={itemVariants}
                  className={`rounded-xl bg-ink-light border border-white/5 overflow-hidden border-l-4 ${styles.border} ${
                    isRejected ? 'opacity-60' : ''
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-serif text-cream font-medium">{apt.client_name}</h3>
                      <span className={`text-[10px] px-2 py-1 rounded-full shrink-0 ${styles.badge}`}>
                        {t(`status.${apt.status}`)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-subtle">
                      <span>{formatDate(apt.date)}</span>
                      <span>·</span>
                      <span>{apt.time}</span>
                      <span>·</span>
                      <span>{apt.body_part}</span>
                    </div>
                    {apt.phone && (
                      <div className="flex items-center gap-1.5 mt-2 text-subtle text-xs">
                        <Phone size={12} />
                        <span>{apt.phone}</span>
                      </div>
                    )}
                    <span className="inline-block mt-2 text-[10px] text-gold/90 px-2 py-0.5 rounded bg-gold/10">
                      {apt.style}
                    </span>
                    <p className="text-cream-dark text-sm mt-2 line-clamp-2">{apt.description}</p>
                    <p className="text-gold text-xs font-medium mt-2">{tc('deposit')}: €{apt.deposit}</p>

                    {/* Actions row */}
                    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/5">
                      <Link
                        to="/chat"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 text-subtle text-xs hover:bg-white/10 hover:text-cream transition-colors"
                      >
                        <MessageCircle size={14} />
                        {t('actions.messages')}
                      </Link>

                      {isArtist && apt.status === 'pending' && (
                        <div className="flex items-center gap-2 ml-auto">
                          <AnimatePresence mode="wait">
                            {rejectConfirmId === apt.id ? (
                              <motion.div
                                key="confirm"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex items-center gap-1.5"
                              >
                                <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                                <span className="text-xs text-subtle">{t('actions.areYouSure')}</span>
                                <button
                                  type="button"
                                  onClick={() => handleStatusUpdate(apt.id, 'rejected')}
                                  disabled={updatingApptId === apt.id}
                                  className="inline-flex items-center justify-center gap-1 min-h-[44px] px-3 py-2 rounded-lg bg-red-500/20 text-red-400 text-xs border border-red-500/30 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                >
                                  {updatingApptId === apt.id ? t('actions.rejecting') : t('actions.yesReject')}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRejectConfirmId(null)}
                                  className="inline-flex items-center justify-center gap-1 min-h-[44px] px-3 py-2 rounded-lg bg-white/5 text-subtle text-xs hover:bg-white/10 transition-colors"
                                >
                                  {tc('cancel')}
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
                                  type="button"
                                  onClick={() => handleStatusUpdate(apt.id, 'confirmed')}
                                  disabled={updatingApptId === apt.id}
                                  className="inline-flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                                >
                                  <Check size={14} />
                                  {updatingApptId === apt.id ? t('actions.confirming') : tc('confirm')}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRejectConfirmId(apt.id)}
                                  className="inline-flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium hover:bg-red-500/20 transition-colors"
                                >
                                  <X size={14} />
                                  {t('actions.reject')}
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      {isArtist && apt.status === 'confirmed' && (
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(apt.id, 'completed')}
                          disabled={updatingApptId === apt.id}
                          className="ml-auto inline-flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-lg bg-white/5 text-subtle text-xs hover:bg-white/10 hover:text-cream transition-colors disabled:opacity-50"
                        >
                          <CheckCheck size={14} />
                          {t('actions.markCompleted')}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.article>
              )
            })
          ) : (
            <motion.p variants={itemVariants} className="text-subtle text-sm py-8 text-center">
              {t(`empty.${activeTab}`)}
            </motion.p>
          )}
        </motion.div>
      </div>

      {/* FAB (artist only) */}
      {isArtist && (
        <motion.button
          type="button"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          aria-label={t('newAppointment')}
          className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full bg-gold text-ink flex items-center justify-center shadow-lg shadow-gold/25 hover:bg-gold-light transition-colors"
        >
          <Plus size={24} strokeWidth={2.5} />
        </motion.button>
      )}

      {/* Modal / Sheet */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 z-[60] bg-ink/80 backdrop-blur-sm"
            />
            <motion.div
              ref={sheetRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label={t('newAppointment')}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[60] max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-ink-light border-t border-white/10 outline-none"
            >
              <div className="sticky top-0 bg-ink-light/95 backdrop-blur flex items-center justify-between px-5 py-4 border-b border-white/5">
                <h2 className="font-serif text-lg text-cream">{t('newAppointment')}</h2>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  aria-label={tc('close')}
                  className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center text-subtle hover:text-cream"
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-5 space-y-4">
                <div>
                  <label htmlFor="agenda-client" className="block text-xs text-subtle mb-1.5">{t('form.client')}</label>
                  <input
                    id="agenda-client"
                    type="text"
                    value={form.client}
                    onChange={(e) => setForm((f) => ({ ...f, client: e.target.value }))}
                    placeholder={t('form.clientPlaceholder')}
                    className="w-full px-4 py-3 rounded-xl bg-ink border border-white/5 text-cream placeholder:text-subtle/60 focus:outline-none focus:border-gold/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="agenda-date" className="block text-xs text-subtle mb-1.5">{t('form.date')}</label>
                    <input
                      id="agenda-date"
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-ink border border-white/5 text-cream focus:outline-none focus:border-gold/50"
                    />
                  </div>
                  <div>
                    <label htmlFor="agenda-time" className="block text-xs text-subtle mb-1.5">{t('form.time')}</label>
                    <input
                      id="agenda-time"
                      type="time"
                      value={form.time}
                      onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-ink border border-white/5 text-cream focus:outline-none focus:border-gold/50"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="agenda-description" className="block text-xs text-subtle mb-1.5">{t('form.description')}</label>
                  <textarea
                    id="agenda-description"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder={t('form.descriptionPlaceholder')}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-ink border border-white/5 text-cream placeholder:text-subtle/60 focus:outline-none focus:border-gold/50 resize-none"
                  />
                </div>
                <div>
                  <label htmlFor="agenda-bodypart" className="block text-xs text-subtle mb-1.5">{t('form.bodyPart')}</label>
                  <select
                    id="agenda-bodypart"
                    value={form.bodyPart}
                    onChange={(e) => setForm((f) => ({ ...f, bodyPart: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-ink border border-white/5 text-cream focus:outline-none focus:border-gold/50"
                  >
                    <option value="">{tc('select')}</option>
                    {config.body_parts.map((part) => (
                      <option key={part} value={part}>{part}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="agenda-style" className="block text-xs text-subtle mb-1.5">{t('form.style')}</label>
                  <select
                    id="agenda-style"
                    value={form.style}
                    onChange={(e) => setForm((f) => ({ ...f, style: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-ink border border-white/5 text-cream focus:outline-none focus:border-gold/50"
                  >
                    <option value="">{tc('select')}</option>
                    {config.tattoo_styles.map((style) => (
                      <option key={style} value={style}>{style}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="agenda-deposit" className="block text-xs text-subtle mb-1.5">{t('form.deposit')}</label>
                  <input
                    id="agenda-deposit"
                    type="number"
                    min="0"
                    step="5"
                    value={form.deposit}
                    onChange={(e) => setForm((f) => ({ ...f, deposit: e.target.value }))}
                    placeholder={t('form.depositPlaceholder')}
                    className="w-full px-4 py-3 rounded-xl bg-ink border border-white/5 text-cream placeholder:text-subtle/60 focus:outline-none focus:border-gold/50"
                  />
                </div>
                {saveError && (
                  <p className="text-rose text-xs">{saveError}</p>
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
