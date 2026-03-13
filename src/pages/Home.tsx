import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Image,
  CalendarPlus,
  PenTool,
  User,
  ShoppingBag,
  GraduationCap,
  ChevronRight,
  Sparkles,
  Lock,
} from 'lucide-react'
import { appointments, suggestions } from '../data/mock'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

const lineVariants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: {
    scaleX: 1,
    originX: 0,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] as const },
  },
}

const upcomingAppointments = appointments
  .filter((a) => a.status !== 'completed')
  .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime())
  .slice(0, 2)

const trendingSuggestions = suggestions.slice(0, 3)

const quickActions = [
  { to: '/portfolio', label: 'Portfolio', icon: Image },
  { to: '/book', label: 'Reservar Cita', icon: CalendarPlus },
  { to: '/designer', label: 'Tattoo Designer', icon: PenTool },
  { to: '/visualizer', label: 'Body Visualizer', icon: User },
  { to: '/shop', label: 'Tienda', icon: ShoppingBag },
  { to: '/courses', label: 'Cursos', icon: GraduationCap },
]

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function Home() {
  return (
    <div className="min-h-dvh">
      {/* Hero */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative overflow-hidden px-5 pt-12 pb-16"
        style={{
          background: 'linear-gradient(180deg, var(--color-ink) 0%, var(--color-ink-light) 40%, var(--color-gold-dark) 100%)',
        }}
      >
        <motion.div variants={itemVariants} className="space-y-4">
          <h1 className="font-serif text-4xl tracking-[0.2em] text-cream drop-shadow-lg">
            INK & SOUL
          </h1>
          <p className="text-gold-light/90 text-sm tracking-widest uppercase font-sans">
            Arte que vive en tu piel
          </p>
          <motion.div
            variants={lineVariants}
            className="h-px w-24 bg-gradient-to-r from-gold to-gold-light/50 rounded-full"
          />
          <motion.div variants={itemVariants}>
            <Link
              to="/book"
              className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-full bg-gold text-ink text-sm font-medium hover:bg-gold-light transition-colors active:scale-[0.97]"
            >
              <Sparkles size={16} />
              Reservar mi cita
            </Link>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Próximas Citas */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={containerVariants}
        className="px-5 py-8"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl text-cream">Próximas Citas</h2>
          <Link
            to="/agenda"
            className="text-xs text-gold hover:text-gold-light transition-colors flex items-center gap-1"
          >
            Ver todas
            <ChevronRight size={14} />
          </Link>
        </motion.div>
        <div className="space-y-3">
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((apt) => (
              <motion.div
                key={apt.id}
                variants={itemVariants}
                className="flex items-center gap-4 p-4 rounded-xl bg-ink-medium/60 border border-white/5 hover:border-gold/20 transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gold/10 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-gold uppercase font-medium">
                    {formatDate(apt.date).split(' ')[0]}
                  </span>
                  <span className="text-gold font-serif text-lg leading-none">
                    {new Date(apt.date).getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-cream font-medium truncate">{apt.client}</p>
                  <p className="text-subtle text-sm truncate">{apt.description}</p>
                  <p className="text-gold/80 text-xs mt-0.5">{apt.time} · {apt.bodyPart}</p>
                </div>
                <span
                  className={`text-[10px] px-2 py-1 rounded-full ${
                    apt.status === 'confirmed'
                      ? 'bg-gold/20 text-gold'
                      : 'bg-rose/20 text-rose'
                  }`}
                >
                  {apt.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                </span>
              </motion.div>
            ))
          ) : (
            <motion.p variants={itemVariants} className="text-subtle text-sm py-4">
              No hay citas próximas
            </motion.p>
          )}
        </div>
      </motion.section>

      {/* Quick Actions */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={containerVariants}
        className="px-5 py-8"
      >
        <motion.h2 variants={itemVariants} className="font-serif text-xl text-cream mb-4">
          Accesos rápidos
        </motion.h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map(({ to, label, icon: Icon }) => (
            <motion.div key={to} variants={itemVariants}>
              <Link
                to={to}
                className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl bg-ink-medium/40 border border-white/5 hover:border-gold/30 hover:bg-ink-medium/60 transition-all active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                  <Icon size={20} strokeWidth={1.5} />
                </div>
                <span className="text-cream text-sm font-medium text-center">{label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Trending */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={containerVariants}
        className="px-5 pb-12"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl text-cream">Trending</h2>
          <Link
            to="/suggestions"
            className="text-xs text-gold hover:text-gold-light transition-colors flex items-center gap-1"
          >
            Ver más
            <ChevronRight size={14} />
          </Link>
        </motion.div>
        <div className="space-y-3">
          {trendingSuggestions.map((s) => (
            <motion.div
              key={s.id}
              variants={itemVariants}
              className="p-4 rounded-xl bg-ink-medium/40 border border-white/5 hover:border-gold/20 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-cream font-medium">{s.title}</p>
                  <p className="text-subtle text-sm mt-0.5">{s.description}</p>
                  <span className="inline-block mt-2 text-[10px] text-gold/80 px-2 py-0.5 rounded bg-gold/10">
                    {s.style}
                  </span>
                </div>
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                  <span className="text-gold text-xs font-medium">{s.popularity}%</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Artist Access */}
      <div className="px-5 pb-12">
        <Link
          to="/studio"
          className="flex items-center justify-center gap-2 py-3 rounded-xl border border-white/5 bg-ink-medium/30 text-subtle text-xs hover:text-cream-dark hover:border-gold/20 transition-all"
        >
          <Lock size={12} />
          Acceso Artista
        </Link>
      </div>
    </div>
  )
}
