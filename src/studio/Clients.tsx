import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ArrowLeft, MessageCircle, CalendarPlus, Phone, Mail, UserCheck, Users } from 'lucide-react'
import { useAppointments } from '../hooks/useAppointments'
import { useClients } from '../hooks/useClients'
import type { Appointment } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'

type SortKey = 'nombre' | 'visitas' | 'gasto'
type ViewTab = 'all' | 'registered'

interface ClientEntry {
  id?: string
  name: string
  phone: string
  email: string
  visits: number
  totalSpent: number
  lastVisit: string
  firstVisit: string
  registered: boolean
  registeredAt?: string
  appointments: Appointment[]
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function formatDateSpanish(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function buildClientList(appointmentsList: Appointment[], registeredProfiles: { id: string; full_name: string; phone: string; created_at: string }[]): ClientEntry[] {
  const byName = new Map<string, ClientEntry>()

  for (const apt of appointmentsList) {
    const existing = byName.get(apt.client_name)
    const deposit = apt.deposit ?? 0
    if (!existing) {
      byName.set(apt.client_name, {
        name: apt.client_name,
        phone: apt.phone ?? '',
        email: apt.email ?? '',
        visits: 1,
        totalSpent: deposit,
        lastVisit: apt.date,
        firstVisit: apt.date,
        registered: false,
        appointments: [apt],
      })
    } else {
      existing.visits += 1
      existing.totalSpent += deposit
      existing.appointments.push(apt)
      if (apt.phone) existing.phone = apt.phone
      if (apt.email) existing.email = apt.email
      if (apt.date > existing.lastVisit) existing.lastVisit = apt.date
      if (apt.date < existing.firstVisit) existing.firstVisit = apt.date
    }
  }

  for (const profile of registeredProfiles) {
    const match = byName.get(profile.full_name)
    if (match) {
      match.registered = true
      match.id = profile.id
      match.registeredAt = profile.created_at
      if (profile.phone && !match.phone) match.phone = profile.phone
    } else {
      byName.set(profile.full_name, {
        id: profile.id,
        name: profile.full_name,
        phone: profile.phone || '',
        email: '',
        visits: 0,
        totalSpent: 0,
        lastVisit: '',
        firstVisit: '',
        registered: true,
        registeredAt: profile.created_at,
        appointments: [],
      })
    }
  }

  return Array.from(byName.values())
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

export default function Clients() {
  const { appointments } = useAppointments()
  const { clients: registeredClients, loading: clientsLoading } = useClients()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('nombre')
  const [viewTab, setViewTab] = useState<ViewTab>('all')
  const [selectedClient, setSelectedClient] = useState<ClientEntry | null>(null)
  const [clientNotes, setClientNotes] = useState<Record<string, string>>({})

  const currentNotes = selectedClient ? (clientNotes[selectedClient.name] ?? '') : ''
  const setCurrentNotes = (value: string) => {
    if (!selectedClient) return
    setClientNotes((prev) => ({ ...prev, [selectedClient.name]: value }))
  }

  const clientList = useMemo(() => buildClientList(appointments, registeredClients), [appointments, registeredClients])

  const filteredAndSorted = useMemo(() => {
    let list = clientList.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase().trim())
    )
    if (viewTab === 'registered') list = list.filter(c => c.registered)
    if (sort === 'nombre') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    } else if (sort === 'visitas') {
      list = [...list].sort((a, b) => b.visits - a.visits)
    } else {
      list = [...list].sort((a, b) => b.totalSpent - a.totalSpent)
    }
    return list
  }, [clientList, search, sort, viewTab])

  return (
    <div className="p-4 pb-24">
      <AnimatePresence mode="wait">
        {selectedClient ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <button
              onClick={() => setSelectedClient(null)}
              className="flex items-center gap-2 text-subtle hover:text-cream transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Volver</span>
            </button>

            <header className="flex flex-col items-center gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shrink-0">
                <span className="text-ink font-serif font-bold text-2xl">
                  {getInitials(selectedClient.name)}
                </span>
              </div>
              <div>
                <h1 className="font-serif text-xl text-cream">{selectedClient.name}</h1>
                {selectedClient.phone && (
                  <div className="flex items-center justify-center gap-1.5 mt-1 text-subtle text-sm">
                    <Phone size={14} />
                    <span>{selectedClient.phone}</span>
                  </div>
                )}
                {selectedClient.email && (
                  <div className="flex items-center justify-center gap-1.5 mt-0.5 text-subtle text-sm">
                    <Mail size={14} />
                    <span>{selectedClient.email}</span>
                  </div>
                )}
              </div>
            </header>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-ink-light border border-white/5 p-3 text-center">
                <p className="text-lg font-serif font-semibold text-cream">
                  {selectedClient.visits}
                </p>
                <p className="text-[10px] text-subtle uppercase tracking-wider">Citas</p>
              </div>
              <div className="rounded-xl bg-ink-light border border-white/5 p-3 text-center">
                <p className="text-lg font-serif font-semibold text-gold">
                  €{selectedClient.totalSpent}
                </p>
                <p className="text-[10px] text-subtle uppercase tracking-wider">Gastado</p>
              </div>
              <div className="rounded-xl bg-ink-light border border-white/5 p-3 text-center">
                <p className="text-sm font-serif font-semibold text-cream">
                  {formatDateSpanish(selectedClient.firstVisit)}
                </p>
                <p className="text-[10px] text-subtle uppercase tracking-wider">
                  Primera visita
                </p>
              </div>
            </div>

            <section>
              <h2 className="font-serif text-base text-cream mb-3">Historial de Citas</h2>
              <div className="space-y-2">
                {[...selectedClient.appointments]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((apt) => (
                    <div
                      key={apt.id}
                      className="rounded-xl bg-ink-light border border-white/5 p-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-cream">
                            {formatDateSpanish(apt.date)} · {apt.time}
                          </p>
                          <p className="text-xs text-subtle mt-0.5">
                            {apt.style} · {apt.body_part}
                          </p>
                          <p className="text-xs text-cream-dark mt-1 line-clamp-2">
                            {apt.description}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 px-2 py-0.5 rounded-lg text-[10px] font-medium ${
                            apt.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : apt.status === 'confirmed'
                                ? 'bg-gold/20 text-gold'
                                : apt.status === 'pending'
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {apt.status === 'completed'
                            ? 'Completada'
                            : apt.status === 'confirmed'
                              ? 'Confirmada'
                              : apt.status === 'pending'
                                ? 'Pendiente'
                                : 'Rechazada'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </section>

            <section>
              <h2 className="font-serif text-base text-cream mb-2">Notas</h2>
              <textarea
                value={currentNotes}
                onChange={(e) => setCurrentNotes(e.target.value)}
                placeholder="Notas privadas sobre el cliente..."
                className="w-full h-24 px-4 py-3 rounded-xl bg-ink-light border border-white/5 text-cream placeholder:text-subtle text-sm resize-none focus:outline-none focus:border-gold/40 transition-colors"
              />
            </section>

            <div className="flex gap-3">
              <Link
                to="/studio/messages"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gold/20 text-gold font-medium text-sm hover:bg-gold/30 transition-colors"
              >
                <MessageCircle size={18} />
                Enviar Mensaje
              </Link>
              <Link
                to="/studio/appointments"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gold text-ink font-medium text-sm hover:bg-gold-light transition-colors"
              >
                <CalendarPlus size={18} />
                Nueva Cita
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {clientsLoading && <LoadingSpinner message="Cargando clientes..." />}

            <div className="flex gap-2">
              <button
                onClick={() => setViewTab('all')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewTab === 'all' ? 'bg-gold text-ink' : 'bg-ink-light text-subtle hover:text-cream border border-white/5'
                }`}
              >
                <Users size={14} />
                Todos ({clientList.length})
              </button>
              <button
                onClick={() => setViewTab('registered')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewTab === 'registered' ? 'bg-gold text-ink' : 'bg-ink-light text-subtle hover:text-cream border border-white/5'
                }`}
              >
                <UserCheck size={14} />
                Registrados ({clientList.filter(c => c.registered).length})
              </button>
            </div>

            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle"
                strokeWidth={1.5}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-ink-light border border-white/5 text-cream placeholder:text-subtle text-sm focus:outline-none focus:border-gold/40 transition-colors"
              />
            </div>

            <div className="flex gap-2">
              {(['nombre', 'visitas', 'gasto'] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setSort(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    sort === key
                      ? 'bg-gold text-ink'
                      : 'bg-ink-light text-subtle hover:text-cream border border-white/5'
                  }`}
                >
                  {key === 'nombre' ? 'Nombre' : key === 'visitas' ? 'Visitas' : 'Gasto'}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredAndSorted.map((client) => (
                <motion.button
                  key={client.name}
                  variants={itemVariants}
                  onClick={() => setSelectedClient(client)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-ink-light border border-white/5 hover:border-gold/20 transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold/30 to-gold-dark/30 flex items-center justify-center shrink-0">
                    <span className="text-gold font-serif font-semibold text-sm">
                      {getInitials(client.name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-cream truncate">{client.name}</p>
                      {client.registered && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-500/20 text-emerald-400">
                          Registrado
                        </span>
                      )}
                    </div>
                    {client.phone && (
                      <p className="text-xs text-subtle truncate">{client.phone}</p>
                    )}
                    <div className="flex gap-3 mt-1 text-[11px] text-subtle">
                      {client.visits > 0 ? (
                        <>
                          <span>{client.visits} visitas</span>
                          <span>€{client.totalSpent} gastado</span>
                          <span>{formatDateSpanish(client.lastVisit)}</span>
                        </>
                      ) : (
                        <span>Sin citas aún{client.registeredAt ? ` · Registrado ${formatDateSpanish(client.registeredAt.slice(0, 10))}` : ''}</span>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {filteredAndSorted.length === 0 && (
              <div className="rounded-xl bg-ink-light border border-white/5 p-8 text-center">
                <p className="text-cream-dark text-sm">
                  {search.trim() ? 'No se encontraron clientes' : 'No hay clientes'}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
