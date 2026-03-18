import { useState, useMemo, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Flame, ChevronRight } from 'lucide-react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import PageHeader from '../components/PageHeader'
import { useStudioConfig } from '../contexts/StudioConfigContext'
import { useAuth } from '../contexts/AuthContext'

function getStyleRecommendation(
  answers: string[],
  styleRecommendations: Record<string, { style: string; description: string }>
): { style: string; description: string } {
  const key = `${answers[0]}-${answers[2]}`
  return styleRecommendations[key] ?? {
    style: 'Fine Line',
    description: 'Líneas delicadas y elegantes para cualquier diseño',
  }
}

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

export default function Suggestions() {
  const { config } = useStudioConfig()
  const { user } = useAuth()
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [quizOpen, setQuizOpen] = useState(false)
  const [quizStep, setQuizStep] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<string[]>([])

  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'user_likes', user.uid)).then(snap => {
      if (snap.exists()) {
        const data = snap.data()
        if (Array.isArray(data.liked_ids)) setLikedIds(new Set(data.liked_ids))
      }
    }).catch(() => {})
  }, [user])

  const persistLikes = useCallback((ids: Set<string>) => {
    if (!user) return
    setDoc(doc(db, 'user_likes', user.uid), { user_id: user.uid, liked_ids: [...ids] }, { merge: true }).catch(() => {})
  }, [user])

  const quizQuestions = config.quiz_config.questions
  const styleRecommendations = config.quiz_config.style_recommendations
  const trendingThreshold = config.quiz_config.trending_threshold

  const sortedSuggestions = useMemo(
    () => [...config.suggestions].sort((a, b) => b.popularity - a.popularity),
    [config.suggestions]
  )

  const trendingStyles = useMemo(
    () =>
      [...new Set(sortedSuggestions.filter((s) => s.popularity >= trendingThreshold).map((s) => s.style))],
    [sortedSuggestions, trendingThreshold]
  )

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      persistLikes(next)
      return next
    })
  }

  const handleQuizAnswer = (answer: string) => {
    const newAnswers = [...quizAnswers, answer]
    setQuizAnswers(newAnswers)
    if (quizStep < quizQuestions.length - 1) {
      setQuizStep((s) => s + 1)
    }
  }

  const handleCloseQuiz = () => {
    setQuizOpen(false)
    setQuizStep(0)
    setQuizAnswers([])
  }

  const quizResult = quizAnswers.length === 3 ? getStyleRecommendation(quizAnswers, styleRecommendations) : null

  return (
    <div className="min-h-dvh pb-6">
      <PageHeader title="Sugerencias" subtitle="Encuentra tu inspiración" />

      <div className="px-5 pt-6 space-y-6">
        {/* Intro */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-3"
        >
          <p className="text-cream-dark text-sm leading-relaxed">
            Explora nuestras sugerencias personalizadas basadas en las tendencias más populares y los estilos más
            solicitados.
          </p>

          {/* Trending indicator */}
          {trendingStyles.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs text-gold font-medium">
                <Flame size={14} className="text-gold" />
                Trending ahora
              </span>
              <div className="flex gap-2 flex-wrap">
                {trendingStyles.map((style) => (
                  <span
                    key={style}
                    className="px-2.5 py-1 rounded-full text-[11px] bg-gold/15 text-gold-light border border-gold/30"
                  >
                    {style}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.section>

        {/* Suggestion cards */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-4"
        >
          {sortedSuggestions.map((suggestion) => (
            <motion.article
              key={suggestion.id}
              variants={itemVariants}
              className="rounded-xl bg-ink-light border border-white/5 overflow-hidden"
            >
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-cream text-base font-medium">{suggestion.title}</h3>
                    <p className="text-cream-dark text-sm mt-1 leading-relaxed">{suggestion.description}</p>
                  </div>
                  <button
                    onClick={() => toggleLike(suggestion.id)}
                    className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                    style={{
                      backgroundColor: likedIds.has(suggestion.id) ? 'var(--color-rose)' : 'rgba(255,255,255,0.05)',
                      color: likedIds.has(suggestion.id) ? 'white' : 'var(--color-subtle)',
                    }}
                  >
                    <Heart
                      size={18}
                      fill={likedIds.has(suggestion.id) ? 'currentColor' : 'none'}
                      strokeWidth={2}
                    />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-gold/15 text-gold border border-gold/25">
                    {suggestion.style}
                  </span>
                </div>

                {/* Popularity bar */}
                <div className="space-y-1">
                  <div className="h-1.5 rounded-full bg-ink-medium overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${suggestion.popularity}%` }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="h-full rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, var(--color-gold-dark), var(--color-gold))',
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-subtle">{suggestion.popularity}% popularidad</p>
                </div>

                <Link
                  to="/portfolio"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-gold/50 text-gold text-sm font-medium hover:bg-gold/10 transition-colors"
                >
                  Ver Diseños
                  <ChevronRight size={16} />
                </Link>
              </div>
            </motion.article>
          ))}
        </motion.section>

        {/* Quiz section */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-xl bg-ink-light border border-white/5 p-5 space-y-4"
        >
          <h3 className="font-serif text-cream text-lg">¿No sabes qué estilo elegir?</h3>
          <p className="text-cream-dark text-sm leading-relaxed">
            Responde unas preguntas y te ayudaremos a encontrar tu estilo ideal
          </p>
          <button
            onClick={() => setQuizOpen(true)}
            className="w-full py-3 rounded-lg border-2 border-gold text-gold font-medium text-sm hover:bg-gold/10 transition-colors"
          >
            Comenzar Quiz
          </button>
        </motion.section>
      </div>

      {/* Quiz modal */}
      <AnimatePresence>
        {quizOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseQuiz}
            className="fixed inset-0 z-50 bg-ink/95 backdrop-blur-sm flex items-center justify-center p-5"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-ink-light rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            >
              <div className="p-6">
                {!quizResult ? (
                  <>
                    <div className="flex gap-1 mb-6">
                      {quizQuestions.map((_, i) => (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full"
                          style={{
                            backgroundColor: i <= quizStep ? 'var(--color-gold)' : 'var(--color-ink-medium)',
                          }}
                        />
                      ))}
                    </div>
                    <h3 className="font-serif text-cream text-lg mb-4">
                      {quizQuestions[quizStep].question}
                    </h3>
                    <div className="space-y-2">
                      {quizQuestions[quizStep].options.map((opt) => (
                        <motion.button
                          key={opt}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleQuizAnswer(opt)}
                          className="w-full py-3 px-4 rounded-lg border border-white/10 text-cream text-sm text-left hover:border-gold/40 hover:bg-gold/5 transition-colors"
                        >
                          {opt}
                        </motion.button>
                      ))}
                    </div>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                  >
                    <h3 className="font-serif text-cream text-xl">Tu estilo ideal</h3>
                    <div className="py-4 px-5 rounded-xl bg-gold/10 border border-gold/30">
                      <p className="font-serif text-gold text-lg font-medium">{quizResult.style}</p>
                      <p className="text-cream-dark text-sm mt-1">{quizResult.description}</p>
                    </div>
                    <Link
                      to="/portfolio"
                      onClick={handleCloseQuiz}
                      className="block w-full py-3 rounded-lg bg-gold text-ink font-medium text-sm hover:bg-gold-light transition-colors"
                    >
                      Ver diseños {quizResult.style}
                    </Link>
                    <button
                      onClick={handleCloseQuiz}
                      className="w-full py-2.5 text-subtle text-sm hover:text-cream transition-colors"
                    >
                      Cerrar
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
