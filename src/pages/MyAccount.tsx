import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Calendar, Package, Pencil, Check } from 'lucide-react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useAppointments } from '../hooks/useAppointments'
import { useOrders } from '../hooks/useOrders'
import PageHeader from '../components/PageHeader'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

type Tab = 'profile' | 'appointments' | 'orders'

export default function MyAccount() {
  const { user, profile, loading, refreshProfile } = useAuth()
  const { appointments } = useAppointments(user?.uid)
  const { orders } = useOrders(user?.uid)
  const [tab, setTab] = useState<Tab>('profile')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '' })
  const [saveError, setSaveError] = useState<string | null>(null)

  if (loading) return <div className="min-h-dvh bg-ink flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>
  if (!user) return <Navigate to="/login" replace />

  const startEdit = () => {
    setForm({ full_name: profile?.full_name ?? '', phone: profile?.phone ?? '' })
    setEditing(true)
  }

  const saveEdit = async () => {
    try {
      await setDoc(doc(db, 'profiles', user.uid), { full_name: form.full_name, phone: form.phone }, { merge: true })
      await refreshProfile()
      setSaveError(null)
      setEditing(false)
    } catch (e) {
      setSaveError((e as Error).message)
    }
  }

  const tabs: { key: Tab; label: string; icon: typeof User }[] = [
    { key: 'profile', label: 'Perfil', icon: User },
    { key: 'appointments', label: 'Citas', icon: Calendar },
    { key: 'orders', label: 'Pedidos', icon: Package },
  ]

  const sortedAppts = [...appointments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="min-h-dvh bg-ink">
      <PageHeader title="Mi Cuenta" subtitle={profile?.full_name ?? user.email ?? ''} />

      <div className="px-5 pt-4 pb-28">
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
          {/* Tab pills */}
          <motion.div variants={itemVariants} className="flex gap-2">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  tab === t.key ? 'bg-gold text-ink' : 'bg-ink-medium text-subtle hover:text-cream-dark'
                }`}
              >
                <t.icon size={14} />
                {t.label}
              </button>
            ))}
          </motion.div>

          {tab === 'profile' && (
            <motion.section variants={itemVariants} className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
                  <span className="text-ink font-serif font-bold text-2xl">
                    {(profile?.full_name || user.email || '?')[0].toUpperCase()}
                  </span>
                </div>
              </div>

              {editing ? (
                <div className="space-y-3">
                  <input
                    type="text" placeholder="Nombre completo" value={form.full_name}
                    onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-ink-light border border-white/10 text-cream text-sm"
                  />
                  <input
                    type="tel" placeholder="Teléfono" value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-ink-light border border-white/10 text-cream text-sm"
                  />
                  {saveError && <p className="text-rose text-sm text-center mb-2">{saveError}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-subtle text-sm">Cancelar</button>
                    <button onClick={saveEdit} className="flex-1 py-2.5 rounded-xl bg-gold text-ink text-sm font-medium flex items-center justify-center gap-1.5"><Check size={14} /> Guardar</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-4 rounded-xl bg-ink-light border border-white/5">
                    <p className="text-xs text-subtle mb-1">Nombre</p>
                    <p className="text-cream text-sm">{profile?.full_name ?? '—'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-ink-light border border-white/5">
                    <p className="text-xs text-subtle mb-1">Email</p>
                    <p className="text-cream text-sm">{user.email}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-ink-light border border-white/5">
                    <p className="text-xs text-subtle mb-1">Teléfono</p>
                    <p className="text-cream text-sm">{profile?.phone || '—'}</p>
                  </div>
                  <button onClick={startEdit} className="w-full py-2.5 rounded-xl bg-gold/10 text-gold text-sm font-medium flex items-center justify-center gap-1.5"><Pencil size={14} /> Editar perfil</button>
                </div>
              )}
            </motion.section>
          )}

          {tab === 'appointments' && (
            <motion.section variants={itemVariants} className="space-y-3">
              {sortedAppts.length === 0 ? (
                <div className="p-8 rounded-xl bg-ink-light border border-white/5 text-center">
                  <p className="text-subtle text-sm mb-3">No tienes citas aún</p>
                  <Link to="/book" className="text-gold text-sm font-medium hover:underline">Reservar una cita</Link>
                </div>
              ) : sortedAppts.map(apt => {
                const statusCfg: Record<string, string> = { confirmed: 'bg-emerald-500/20 text-emerald-400', pending: 'bg-amber-500/20 text-amber-400', completed: 'bg-subtle/20 text-subtle', rejected: 'bg-red-500/20 text-red-400' }
                const statusLabel: Record<string, string> = { confirmed: 'Confirmada', pending: 'Pendiente', completed: 'Completada', rejected: 'Rechazada' }
                return (
                  <div key={apt.id} className="p-4 rounded-xl bg-ink-light border border-white/5">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div>
                        <p className="text-cream text-sm font-medium">{formatDate(apt.date)} · {apt.time}</p>
                        <p className="text-xs text-subtle">{apt.style} · {apt.body_part}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-full shrink-0 ${statusCfg[apt.status]}`}>{statusLabel[apt.status]}</span>
                    </div>
                    {apt.description && <p className="text-cream-dark text-xs mt-1 line-clamp-2">{apt.description}</p>}
                  </div>
                )
              })}
            </motion.section>
          )}

          {tab === 'orders' && (
            <motion.section variants={itemVariants} className="space-y-3">
              {orders.length === 0 ? (
                <div className="p-8 rounded-xl bg-ink-light border border-white/5 text-center">
                  <p className="text-subtle text-sm mb-3">No tienes pedidos aún</p>
                  <Link to="/shop" className="text-gold text-sm font-medium hover:underline">Ir a la tienda</Link>
                </div>
              ) : orders.map(order => {
                const statusLabel: Record<string, string> = { pending: 'Pendiente', confirmed: 'Confirmado', shipped: 'Enviado', delivered: 'Entregado' }
                return (
                  <div key={order.id} className="p-4 rounded-xl bg-ink-light border border-white/5">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <p className="text-cream text-sm font-medium">€{order.total}</p>
                      <span className="text-[10px] px-2 py-1 rounded-full bg-gold/20 text-gold">{statusLabel[order.status] ?? order.status}</span>
                    </div>
                    <p className="text-xs text-subtle">{formatDate(order.created_at)}</p>
                    {order.items && order.items.length > 0 && (
                      <p className="text-xs text-cream-dark mt-1">{order.items.length} artículo{order.items.length > 1 ? 's' : ''}</p>
                    )}
                  </div>
                )
              })}
            </motion.section>
          )}
        </motion.div>
      </div>
    </div>
  )
}
