import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Plus } from 'lucide-react'
import { useReviews } from '../../hooks/useReviews'
import { useAuth } from '../../contexts/AuthContext'
import { mapFirestoreError } from '../../utils/mapFirestoreError'
import { containerVariants, itemVariants } from './constants'

interface Props {
  tattooStyles: string[]
  staticReviews: Array<{ name: string; text: string; rating: number; style: string }>
}

export default function HomeReviewsSection({ tattooStyles, staticReviews }: Props) {
  const navigate = useNavigate()
  const { reviews: dbReviews, create: createReview, loading: loadingReviews, error: reviewsError } = useReviews()
  const { profile, user, loading: authLoading } = useAuth()
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({ name: '', text: '', rating: 5, style: '' })
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const reviewTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => { clearTimeout(reviewTimerRef.current) }, [])

  const allReviews = useMemo(() => {
    const fromDb = dbReviews.map(r => ({ id: r.id, name: r.name, text: r.text, rating: r.rating, style: r.style }))
    const staticOnes = staticReviews.map((r, i) => ({ id: undefined as string | undefined, ...r, _staticIdx: i }))
    return [...fromDb, ...staticOnes]
  }, [dbReviews, staticReviews])
  const reviews = allReviews.slice(0, 6)

  const handleReviewSubmit = async () => {
    if (!user) {
      navigate(`/login?returnTo=${encodeURIComponent('/')}`)
      return
    }
    if (!reviewForm.text.trim() || !reviewForm.name.trim() || reviewSubmitting) return
    setReviewSubmitting(true)
    try {
      const { error } = await createReview(reviewForm)
      if (error) {
        setReviewError(error)
        return
      }
      setReviewError(null)
      setReviewSubmitted(true)
      setReviewForm({ name: '', text: '', rating: 5, style: '' })
      reviewTimerRef.current = setTimeout(() => { setShowReviewForm(false); setReviewSubmitted(false) }, 2000)
    } catch (e: unknown) {
      setReviewError(mapFirestoreError(e))
    } finally {
      setReviewSubmitting(false)
    }
  }

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={containerVariants}
      className="px-5 py-8"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl text-cream">Lo que dicen nuestros clientes</h2>
        <button
          type="button"
          onClick={() => {
            if (authLoading) return
            if (!user) {
              navigate(`/login?returnTo=${encodeURIComponent('/')}`)
              return
            }
            setShowReviewForm(true)
            if (profile) setReviewForm(f => ({ ...f, name: profile.full_name }))
          }}
          className="flex items-center gap-1 text-xs text-gold hover:text-gold-light transition-colors"
        >
          <Plus size={14} />
          Dejar reseña
        </button>
      </motion.div>

      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            {reviewSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-emerald-400 text-sm font-medium">Gracias por tu reseña</p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-ink-medium/40 border border-white/5 space-y-3">
                <input
                  type="text"
                  placeholder="Tu nombre"
                  aria-label="Tu nombre"
                  value={reviewForm.name}
                  onChange={e => setReviewForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-ink border border-white/10 text-cream placeholder:text-subtle text-sm"
                />
                <textarea
                  placeholder="Tu experiencia..."
                  aria-label="Tu experiencia"
                  value={reviewForm.text}
                  onChange={e => setReviewForm(f => ({ ...f, text: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-ink border border-white/10 text-cream placeholder:text-subtle text-sm resize-none"
                />
                <div className="flex items-center gap-4">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button type="button" key={n} onClick={() => setReviewForm(f => ({ ...f, rating: n }))} aria-label={`Valorar ${n} estrella${n > 1 ? 's' : ''}`}>
                        <Star size={18} className={n <= reviewForm.rating ? 'text-gold fill-gold' : 'text-subtle'} />
                      </button>
                    ))}
                  </div>
                  <select
                    value={reviewForm.style}
                    onChange={e => setReviewForm(f => ({ ...f, style: e.target.value }))}
                    aria-label="Estilo de la reseña"
                    className="flex-1 px-2 py-1 rounded-lg bg-ink border border-white/10 text-cream text-xs"
                  >
                    <option value="">Estilo</option>
                    {tattooStyles.slice(0, 8).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowReviewForm(false)} className="flex-1 py-2 rounded-lg border border-white/10 text-subtle text-sm">Cancelar</button>
                  <button type="button" onClick={handleReviewSubmit} disabled={reviewSubmitting} className="flex-1 py-2 rounded-lg bg-gold text-ink text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">{reviewSubmitting ? 'Enviando...' : 'Enviar'}</button>
                </div>
                {reviewError && <p className="text-rose text-xs mt-2">{reviewError}</p>}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {reviewsError && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm">{reviewsError}</div>
        )}
        {loadingReviews ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-ink-medium/40 animate-pulse" />
          ))
        ) : reviews.map((review, i) => (
          <motion.div
            key={review.id ?? `static-${i}`}
            variants={itemVariants}
            className="p-4 rounded-xl bg-ink-medium/40 border border-white/5"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="flex gap-0.5">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <Star key={j} size={12} className="text-gold fill-gold" />
                ))}
              </div>
              {review.style && <span className="text-[10px] text-subtle px-1.5 py-0.5 rounded bg-white/5">{review.style}</span>}
            </div>
            <p className="text-cream-dark text-sm leading-relaxed italic">"{review.text}"</p>
            <p className="text-subtle text-xs mt-2">— {review.name}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
