import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageHeader from '../components/PageHeader'
import { useCourses } from '../hooks/useCourses'
import type { Course } from '../types'

const LEVEL_STYLES: Record<Course['level'], string> = {
  beginner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  intermediate: 'bg-gold/20 text-gold border-gold/30',
  advanced: 'bg-rose/20 text-rose border-rose/30',
}

const LEVEL_LABELS: Record<Course['level'], string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const INITIAL_FORM = { name: '', email: '', phone: '' }

export default function Courses() {
  const { courses, reservedIds, reserve } = useCourses()
  const [reservingCourse, setReservingCourse] = useState<Course | null>(null)
  const [reservationForm, setReservationForm] = useState(INITIAL_FORM)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (!showSuccess) return
    const t = setTimeout(() => {
      setShowSuccess(false)
      setReservingCourse(null)
      setReservationForm(INITIAL_FORM)
    }, 2000)
    return () => clearTimeout(t)
  }, [showSuccess])

  const handleConfirmReserva = async () => {
    if (!reservingCourse) return
    const { error } = await reserve(
      reservingCourse.id,
      reservationForm.name,
      reservationForm.email,
      reservationForm.phone
    )
    if (!error) {
      setShowSuccess(true)
    }
  }

  return (
    <div className="min-h-dvh pb-6">
      <PageHeader
        title="Cursos y Talleres"
        subtitle="Aprende con nosotros"
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="px-5 space-y-6"
      >
        {/* Intro text */}
        <motion.p
          variants={cardVariants}
          className="text-cream-dark text-sm leading-relaxed"
        >
          Sumérgete en el mundo del arte del tatuaje con nuestros talleres
          exclusivos, diseñados tanto para principiantes como para artistas
          experimentados.
        </motion.p>

        {/* Course cards */}
        <div className="space-y-5">
          {courses.map((course) => (
            <motion.article
              key={course.id}
              variants={cardVariants}
              className="w-full rounded-2xl overflow-hidden border border-white/5 bg-ink-light hover:border-gold/20 transition-colors"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={course.image_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-70" />
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${LEVEL_STYLES[course.level]}`}
                  >
                    {LEVEL_LABELS[course.level]}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h2 className="font-serif text-xl text-cream mb-2">
                  {course.title}
                </h2>
                <p className="text-cream-dark text-sm leading-relaxed mb-4">
                  {course.description}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-subtle mb-4">
                  <span>{formatDate(course.date)}</span>
                  <span>•</span>
                  <span>{course.duration}</span>
                  <span>•</span>
                  <span>{course.spots} plazas disponibles</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gold font-semibold text-lg">
                    €{course.price}
                  </span>
                  {reservedIds.has(course.id) ? (
                    <button
                      disabled
                      className="px-6 py-2.5 rounded-full bg-emerald-500/30 text-emerald-400 font-medium text-sm cursor-not-allowed"
                    >
                      Reservado
                    </button>
                  ) : (
                    <button
                      onClick={() => setReservingCourse(course)}
                      className="px-6 py-2.5 rounded-full bg-gold text-ink font-medium text-sm hover:bg-gold-light active:scale-[0.98] transition-all"
                    >
                      Reservar Plaza
                    </button>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {reservingCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end"
            onClick={() => {
              if (!showSuccess) {
                setReservingCourse(null)
                setReservationForm(INITIAL_FORM)
              }
            }}
          >
            <div
              className="absolute inset-0 bg-ink/60"
              aria-hidden
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full rounded-t-3xl bg-ink-light border-t border-white/10 p-6 pb-safe"
              onClick={(e) => e.stopPropagation()}
            >
              {showSuccess ? (
                <div className="py-8 text-center">
                  <p className="font-serif text-xl text-cream mb-2">¡Reserva confirmada!</p>
                  <p className="text-cream-dark text-sm">Te hemos enviado un correo de confirmación.</p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="font-serif text-xl text-cream mb-1">{reservingCourse.title}</h3>
                    <p className="text-gold font-semibold text-lg">€{reservingCourse.price}</p>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleConfirmReserva()
                    }}
                    className="space-y-4"
                  >
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={reservationForm.name}
                      onChange={(e) => setReservationForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-ink border border-white/10 text-cream placeholder:text-subtle text-sm focus:outline-none focus:border-gold/50"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={reservationForm.email}
                      onChange={(e) => setReservationForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-ink border border-white/10 text-cream placeholder:text-subtle text-sm focus:outline-none focus:border-gold/50"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Teléfono"
                      value={reservationForm.phone}
                      onChange={(e) => setReservationForm((f) => ({ ...f, phone: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-ink border border-white/10 text-cream placeholder:text-subtle text-sm focus:outline-none focus:border-gold/50"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-full bg-gold text-ink font-medium text-sm hover:bg-gold-light active:scale-[0.98] transition-all"
                    >
                      Confirmar Reserva
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
