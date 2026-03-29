import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Lock,
  ChevronRight,
  ArrowRight,
  MessageCircle,
} from 'lucide-react'
import { useStudioConfig } from '../contexts/StudioConfigContext'
import { usePortfolio } from '../hooks/usePortfolio'
import { useShop } from '../hooks/useShop'
import { useCourses } from '../hooks/useCourses'
import { containerVariants, itemVariants, lineVariants, quickActions } from './home/constants'
import FeaturedWorkRow from './home/FeaturedWorkRow'
import ShopPreviewRow from './home/ShopPreviewRow'
import HomeReviewsSection from './home/HomeReviewsSection'

export default function Home() {
  const { config } = useStudioConfig()
  const { items: allPortfolioItems, loading: loadingPortfolio } = usePortfolio()
  const { items: allShopItems, loading: loadingShop } = useShop()
  const { courses: allCourses, loading: loadingCourses } = useCourses()

  const topSuggestions = useMemo(
    () => [...config.suggestions].sort((a, b) => b.popularity - a.popularity).slice(0, 3),
    [config.suggestions]
  )

  const featuredWork = allPortfolioItems.slice(0, 6)
  const featuredProducts = allShopItems.filter((s) => s.in_stock).slice(0, 4)
  const nextCourse = allCourses[0]

  return (
    <div className="min-h-dvh">
      {/* Hero */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative overflow-hidden px-5 pt-14 pb-20"
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, var(--color-ink) 0%, var(--color-ink-light) 50%, var(--color-gold-dark) 100%)',
          }}
        />
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute bottom-8 left-0 w-32 h-32 rounded-full bg-gold/3 blur-2xl" />

        <div className="relative z-10 space-y-4">
          <motion.div variants={itemVariants}>
            <p className="text-gold/70 text-[10px] tracking-[0.35em] uppercase font-sans mb-2">{config.home_content.subtitle}</p>
            <h1 className="font-serif text-4xl tracking-[0.15em] text-cream drop-shadow-lg">
              {config.studio_name}
            </h1>
          </motion.div>
          <motion.p variants={itemVariants} className="text-cream-dark/80 text-sm leading-relaxed max-w-[280px]">
            {config.home_content.tagline}
          </motion.p>
          <motion.div
            variants={lineVariants}
            className="h-px w-24 bg-gradient-to-r from-gold to-gold-light/50 rounded-full"
          />
          <motion.div variants={itemVariants} className="flex gap-3 pt-2">
            <Link
              to="/book"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold text-ink text-sm font-medium hover:bg-gold-light transition-colors active:scale-[0.97]"
            >
              <Sparkles size={15} />
              Reservar cita
            </Link>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-gold/30 text-gold text-sm font-medium hover:bg-gold/5 transition-colors"
            >
              Ver portafolio
            </Link>
          </motion.div>
        </div>
      </motion.section>

      <FeaturedWorkRow items={featuredWork} loading={loadingPortfolio} />

      {/* Quick Actions */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={containerVariants}
        className="px-5 py-6"
      >
        <motion.h2 variants={itemVariants} className="font-serif text-xl text-cream mb-4">
          Explora
        </motion.h2>
        <div className="grid grid-cols-3 gap-2.5">
          {quickActions.map(({ to, label, icon: Icon, desc }) => (
            <motion.div key={to} variants={itemVariants}>
              <Link
                to={to}
                className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-ink-medium/40 border border-white/5 hover:border-gold/30 hover:bg-ink-medium/60 transition-all active:scale-[0.98]"
              >
                <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                  <Icon size={18} strokeWidth={1.5} />
                </div>
                <span className="text-cream text-xs font-medium">{label}</span>
                <span className="text-subtle text-[10px]">{desc}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Banner - Book */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={containerVariants}
        className="px-5 py-4"
      >
        <motion.div variants={itemVariants}>
          <Link
            to="/book"
            className="block relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-r from-ink-light to-ink-medium/80 p-5"
          >
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-gold/10 blur-2xl" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="font-serif text-cream text-lg">¿Listo para tu tatuaje?</p>
                <p className="text-subtle text-xs mt-1">Reserva online en minutos. Respuesta en 24h.</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold shrink-0">
                <ArrowRight size={18} />
              </div>
            </div>
          </Link>
        </motion.div>
      </motion.section>

      <ShopPreviewRow items={featuredProducts} loading={loadingShop} />

      <HomeReviewsSection tattooStyles={config.tattoo_styles} staticReviews={config.home_content.reviews} />

      {/* Trending Styles */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={containerVariants}
        className="px-5 py-6"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl text-cream">Estilos Populares</h2>
          <Link
            to="/suggestions"
            className="text-xs text-gold hover:text-gold-light transition-colors flex items-center gap-1"
          >
            Ver más
            <ChevronRight size={14} />
          </Link>
        </motion.div>
        <div className="flex gap-2 flex-wrap">
          {topSuggestions.map((s) => (
            <motion.div key={s.id} variants={itemVariants}>
              <Link
                to="/suggestions"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-ink-medium/40 border border-white/5 hover:border-gold/30 transition-all"
              >
                <span className="text-cream text-sm">{s.title}</span>
                <span className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center text-gold text-[10px] font-bold">
                  {s.popularity}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Next Course */}
      {loadingCourses ? (
        <div className="px-5 py-6">
          <div className="h-40 rounded-2xl bg-ink-medium/40 animate-pulse" />
        </div>
      ) : null}
      {!loadingCourses && nextCourse && (
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={containerVariants}
          className="px-5 py-6"
        >
          <motion.div variants={itemVariants} className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl text-cream">Próximo Curso</h2>
            <Link
              to="/courses"
              className="text-xs text-gold hover:text-gold-light transition-colors flex items-center gap-1"
            >
              Todos los cursos
              <ChevronRight size={14} />
            </Link>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Link to="/courses" className="block group">
              <div className="relative rounded-2xl overflow-hidden border border-white/5 group-hover:border-gold/20 transition-all">
                <img
                  src={nextCourse.image_url}
                  alt={nextCourse.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-serif text-cream text-lg">{nextCourse.title}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-subtle">
                    <span>{new Date(nextCourse.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</span>
                    <span>·</span>
                    <span>{nextCourse.duration}</span>
                    <span>·</span>
                    <span className="text-gold font-medium">€{nextCourse.price}</span>
                  </div>
                  <p className="text-cream-dark/70 text-xs mt-1.5">{nextCourse.spots} plazas disponibles</p>
                </div>
              </div>
            </Link>
          </motion.div>
        </motion.section>
      )}

      {/* Contact CTA */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={containerVariants}
        className="px-5 py-6"
      >
        <motion.div variants={itemVariants} className="flex gap-3">
          <Link
            to="/chat"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-ink-medium/40 border border-white/5 text-cream text-sm font-medium hover:border-gold/20 transition-all"
          >
            <MessageCircle size={16} className="text-gold" />
            Mensajes
          </Link>
          <Link
            to="/contact"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gold/10 border border-gold/20 text-gold text-sm font-medium hover:bg-gold/20 transition-colors"
          >
            Contactar
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      </motion.section>

      {/* Artist Access */}
      <div className="px-5 pb-12 pt-4">
        <Link
          to="/studio"
          className="flex items-center justify-center gap-2 py-3 rounded-xl border border-white/5 bg-ink-medium/20 text-subtle text-xs hover:text-cream-dark hover:border-gold/20 transition-all"
        >
          <Lock size={12} />
          Acceso Artista
        </Link>
      </div>
    </div>
  )
}
