import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from '../i18n'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, ChevronDown, ChevronUp } from 'lucide-react'
import { useOrders } from '../hooks/useOrders'
import { useNotifications } from '../hooks/useNotifications'
import LoadingSpinner from '../components/LoadingSpinner'
import type { Order } from '../types'

type StatusFilter = '' | Order['status']

function getStatusConfig(t: (key: string) => string): Record<Order['status'], { label: string; badge: string; next?: Order['status']; nextLabel?: string }> {
  return {
    pending: { label: t('orders.status.pending.label'), badge: 'bg-amber-500/20 text-amber-400', next: 'confirmed', nextLabel: t('orders.status.pending.nextLabel') },
    confirmed: { label: t('orders.status.confirmed.label'), badge: 'bg-emerald-500/20 text-emerald-400', next: 'shipped', nextLabel: t('orders.status.confirmed.nextLabel') },
    shipped: { label: t('orders.status.shipped.label'), badge: 'bg-blue-500/20 text-blue-400', next: 'delivered', nextLabel: t('orders.status.shipped.nextLabel') },
    delivered: { label: t('orders.status.delivered.label'), badge: 'bg-subtle/20 text-subtle' },
    cancelled: { label: t('orders.status.unknown.label'), badge: 'bg-red-500/20 text-red-400' },
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' })
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

export default function Orders() {
  const { t } = useTranslation('studio')
  const { orders, loading, error, updateStatus: hookUpdateStatus } = useOrders()
  const { create: createNotification } = useNotifications()
  const STATUS_CONFIG = useMemo(() => getStatusConfig(t), [t])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

  const filtered = useMemo(
    () => statusFilter ? orders.filter(o => o.status === statusFilter) : orders,
    [orders, statusFilter],
  )

  const filters: { value: StatusFilter; label: string }[] = [
    { value: '', label: t('orders.filters.all') },
    { value: 'pending', label: t('orders.filters.pending') },
    { value: 'confirmed', label: t('orders.filters.confirmed') },
    { value: 'shipped', label: t('orders.filters.shipped') },
    { value: 'delivered', label: t('orders.filters.delivered') },
  ]

  if (loading) return <LoadingSpinner />
  if (error) return (
    <div className="p-4">
      <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">{error}</div>
    </div>
  )

  return (
    <div className="p-4 pb-24 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-xl text-cream">{t('orders.title')}</h1>
        <span className="text-xs text-subtle">{t('orders.totalCount', { count: orders.length })}</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map(f => (
          <button
            type="button"
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            aria-pressed={statusFilter === f.value}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              statusFilter === f.value ? 'bg-gold text-ink' : 'bg-ink-medium text-subtle hover:text-cream-dark'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
        {filtered.length === 0 ? (
          <motion.div variants={itemVariants} className="text-center py-12">
            <Package className="w-10 h-10 text-subtle mx-auto mb-3" />
            <p className="text-subtle text-sm">{t('orders.empty')}</p>
          </motion.div>
        ) : (
          filtered.map(order => {
            const cfg = STATUS_CONFIG[order.status] ?? { label: t('orders.status.unknown.label'), badge: 'bg-white/10 text-subtle' }
            const expanded = expandedId === order.id
            return (
              <motion.article key={order.id} variants={itemVariants} className="rounded-xl bg-ink-light border border-white/5 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : order.id)}
                  aria-expanded={expanded}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div>
                      <p className="font-medium text-cream">{order.client_name}</p>
                      <p className="text-xs text-subtle">{order.client_email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] px-2 py-1 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                      {expanded ? <ChevronUp size={14} className="text-subtle" /> : <ChevronDown size={14} className="text-subtle" />}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-subtle">
                    <span>{formatDate(order.created_at)}</span>
                    <span>·</span>
                    <span className="text-gold font-medium">€{order.total}</span>
                  </div>
                </button>

                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                        {order.client_phone && (
                          <p className="text-xs text-subtle">{t('orders.phone')} {order.client_phone}</p>
                        )}
                        {order.client_address && (
                          <p className="text-xs text-subtle">{t('orders.address')} {order.client_address}</p>
                        )}
                        {order.items && order.items.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs text-subtle uppercase tracking-wider">{t('orders.items')}</p>
                            {order.items.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-cream-dark">{item.quantity}x — {item.size} / {item.color}</span>
                                <span className="text-gold">€{item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {updateError && expandedId === order.id && (
                          <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                            {updateError}
                          </p>
                        )}
                        {cfg.next && (
                          <button
                            type="button"
                            onClick={async () => {
                              if (updatingOrderId) return
                              setUpdatingOrderId(order.id)
                              setUpdateError(null)
                              try {
                                const result = await hookUpdateStatus(order.id, cfg.next!)
                                if (result?.error) {
                                  setUpdateError(t('orders.updateError'))
                                  return
                                }
                                if (order.client_id) {
                                  const nextCfg = STATUS_CONFIG[cfg.next!]
                                  await createNotification({
                                    user_id: order.client_id,
                                    title: t('orders.notification.title'),
                                    body: t('orders.notification.body', { label: nextCfg.label }),
                                    type: 'order',
                                    link: '/account',
                                  })
                                }
                              } finally {
                                setUpdatingOrderId(null)
                              }
                            }}
                            disabled={updatingOrderId === order.id}
                            className="w-full py-2.5 rounded-xl bg-gold/10 text-gold text-sm font-medium hover:bg-gold/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingOrderId === order.id ? t('orders.updating') : cfg.nextLabel}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            )
          })
        )}
      </motion.div>
    </div>
  )
}
