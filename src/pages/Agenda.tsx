import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, CalendarPlus, Check, Phone, MessageCircle, CheckCheck, AlertTriangle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { bodyParts, tattooStyles } from '../data/constants'
import { useAppointments } from '../hooks/useAppointments'
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
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getStatusStyles(status: Appointment['status']) {
  switch (status) {
    case 'confirmed':
      return {
        border: 'border-l-gold',
        badge: 'bg-emerald-500/20 text-emerald-400',
        label: 'Confirmada',
      }
    case 'pending':
      return {
        border: 'border-l-amber-500',
        badge: 'bg-amber-500/20 text-amber-400',
        label: 'Pendiente',
      }
    case 'completed':
      return {
        border: 'border-l-subtle',
        badge: 'bg-subtle/20 text-subtle',
        label: 'Completada',
      }
    case 'rejected':
      return {
        border: 'border-l-red-500',
        badge: 'bg-red-500/20 text-red-400',
        label: 'Rechazada',
      }
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
  const { appointments, create, updateStatus } = useAppointments()
  const [activeTab, setActiveTab] = useState<TabKey>('pending')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(initialFormState)
  const [rejectConfirmId, setRejectConfirmId] = useState<string | null>(null)

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

  const handleStatusUpdate = (id: string, status: Appointment['status']) => {
    updateStatus(id, status)
    setRejectConfirmId(null)
  }

  const handleSave = async () => {
    if (!form.client || !form.date || !form.time) return
    await create({
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
    setForm(initialFormState)
    setShowModal(false)
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'pending', label: 'Pendientes' },
    { key: 'confirmed', label: 'Confirmadas' },
    { key: 'completed', label: 'Completadas' },
  ]

  return (
    <div className="min-h-dvh bg-ink">
      <PageHeader
        title="Agenda"
        subtitle="Gestiona tus citas"
        action={
          <Link
            to="/book"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold/10 text-gold text-xs font-medium hover:bg-gold/20 transition-colors"
          >
            <CalendarPlus size={13} />
            Reservar
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
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
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
                        {styles.label}
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
                    <p className="text-gold text-xs font-medium mt-2">Depósito: €{apt.deposit}</p>

                    {/* Actions row */}
                    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/5">
                      <Link
                        to="/chat"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 text-subtle text-xs hover:bg-white/10 hover:text-cream transition-colors"
                      >
                        <MessageCircle size={14} />
                        Chat
                      </Link>

                      {apt.status === 'pending' && (
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
                                <span className="text-xs text-subtle">¿Seguro?</span>
                                <button
                                  onClick={() => handleStatusUpdate(apt.id, 'rejected')}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs border border-red-500/30 hover:bg-red-500/30 transition-colors"
                                >
                                  Sí, rechazar
                                </button>
                                <button
                                  onClick={() => setRejectConfirmId(null)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 text-subtle text-xs hover:bg-white/10 transition-colors"
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
                                  onClick={() => handleStatusUpdate(apt.id, 'confirmed')}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium hover:bg-emerald-500/30 transition-colors"
                                >
                                  <Check size={14} />
                                  Confirmar
                                </button>
                                <button
                                  onClick={() => setRejectConfirmId(apt.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium hover:bg-red-500/20 transition-colors"
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
                        <button
                          onClick={() => handleStatusUpdate(apt.id, 'completed')}
                          className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 text-subtle text-xs hover:bg-white/10 hover:text-cream transition-colors"
                        >
                          <CheckCheck size={14} />
                          Marcar como completada
                        </button>
                      )}
                    </div>
                  </div>
                </motion.article>
              )
            })
          ) : (
            <motion.p variants={itemVariants} className="text-subtle text-sm py-8 text-center">
              {activeTab === 'pending' && 'No hay citas pendientes'}
              {activeTab === 'confirmed' && 'No hay citas confirmadas'}
              {activeTab === 'completed' && 'No hay citas completadas'}
            </motion.p>
          )}
        </motion.div>
      </div>

      {/* FAB */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full bg-gold text-ink flex items-center justify-center shadow-lg shadow-gold/25 hover:bg-gold-light transition-colors"
      >
        <Plus size={24} strokeWidth={2.5} />
      </motion.button>

      {/* Modal / Sheet */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-ink-light border-t border-white/10"
            >
              <div className="sticky top-0 bg-ink-light/95 backdrop-blur flex items-center justify-between px-5 py-4 border-b border-white/5">
                <h2 className="font-serif text-lg text-cream">Nueva cita</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-subtle hover:text-cream"
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-5 space-y-4">
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
                  <label className="block text-xs text-subtle mb-1.5">Descripción del tatuaje</label>
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
                      <option key={part} value={part}>{part}</option>
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
                      <option key={style} value={style}>{style}</option>
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
