import { useState, useMemo, useEffect, useRef, useCallback, memo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { useScrollLock } from '../hooks/useScrollLock'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import ImageWithPlaceholder from '../components/ImageWithPlaceholder'
import { useStudioConfig } from '../contexts/StudioConfigContext'
import { usePortfolio } from '../hooks/usePortfolio'
import type { PortfolioItem } from '../types'
import { tf } from '../utils/translate'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

const PortfolioCard = memo(function PortfolioCard({ item, lang, onClick }: { item: PortfolioItem; lang: string; onClick: (item: PortfolioItem) => void }) {
  const title = tf(item._translations, lang, 'title', item.title)
  return (
    <motion.article
      variants={cardVariants}
      role="button"
      tabIndex={0}
      onClick={() => onClick(item)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(item) } }}
      aria-label={`${title} — ${item.style}`}
      className="cursor-pointer group"
    >
      <div className="relative h-full overflow-hidden rounded-xl border border-white/5 hover:border-gold/30 transition-colors">
        <ImageWithPlaceholder
          id={item.id}
          src={item.image_url}
          variant="portfolio"
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-80" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="font-serif text-cream text-sm font-medium">{title}</h3>
          <span className="text-[10px] text-gold/90 uppercase tracking-wider">
            {item.style}
          </span>
        </div>
      </div>
    </motion.article>
  )
})

export default function Portfolio() {
  const { t, i18n } = useTranslation('portfolio')
  const { t: tc } = useTranslation()
  const { config } = useStudioConfig()
  const { items: portfolioItems, loading, error } = usePortfolio()
  const [searchParams] = useSearchParams()
  const styleFromUrl = searchParams.get('style')
  const [selectedStyle, setSelectedStyle] = useState('Todos')
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const detailPanelRef = useRef<HTMLDivElement>(null)
  const closeDetail = useCallback(() => setSelectedItem(null), [])
  const handleCardClick = useCallback((item: PortfolioItem) => setSelectedItem(item), [])
  useScrollLock(selectedItem !== null)

  useFocusTrap(detailPanelRef, selectedItem !== null, closeDetail)

  useEffect(() => {
    if (styleFromUrl && config.tattoo_styles.includes(styleFromUrl)) {
      setSelectedStyle(styleFromUrl)
    }
  }, [styleFromUrl, config.tattoo_styles])

  const styleFilters = useMemo(
    () => ['Todos', ...config.tattoo_styles],
    [config.tattoo_styles],
  )

  const filteredItems = useMemo(() => {
    let items = selectedStyle === 'Todos' ? portfolioItems : portfolioItems.filter(item => item.style === selectedStyle)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      items = items.filter(item => item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.style.toLowerCase().includes(q))
    }
    return items
  }, [portfolioItems, selectedStyle, searchQuery])

  if (loading) {
    return (
      <div className="min-h-dvh pb-6">
        <div className="h-20 bg-ink-light/50 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 px-5 pt-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-ink-medium/40 animate-pulse aspect-[3/4]" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh pb-6">
      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      {error && (
        <div className="mx-5 mt-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm">{error}</div>
      )}

      {/* Search */}
      <div className="px-5 pt-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            aria-label={t('searchAria')}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-ink-light border border-white/5 text-cream placeholder:text-subtle text-sm focus:outline-none focus:border-gold/40 transition-colors"
          />
        </div>
      </div>

      {/* Filter chips */}
      <div className="px-5 py-2 overflow-x-auto -mx-5">
        <div className="flex gap-2 min-w-max pr-5">
          {styleFilters.map((style) => (
            <button
              type="button"
              key={style}
              onClick={() => setSelectedStyle(style)}
              aria-pressed={selectedStyle === style}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedStyle === style
                  ? 'bg-gold text-ink'
                  : 'bg-ink-medium/60 text-cream-dark border border-white/5 hover:border-gold/30'
              }`}
            >
              {style === 'Todos' ? t('all') : style}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 px-5 auto-rows-[minmax(0,calc(100dvh-14rem))]"
      >
        {filteredItems.map((item) => (
          <PortfolioCard key={item.id} item={item} lang={i18n.language} onClick={handleCardClick} />
        ))}
      </motion.div>

      {filteredItems.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 px-5">
          <p className="text-subtle text-sm">{t('noResults')}</p>
        </div>
      )}

      {/* Detail modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 z-[60] bg-ink/95 backdrop-blur-sm flex items-center justify-center p-5"
          >
            <motion.div
              ref={detailPanelRef}
              tabIndex={-1}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={t('detailAria')}
              className="w-full max-w-md bg-ink-light rounded-2xl overflow-hidden overflow-y-auto overscroll-contain border border-white/10 shadow-2xl focus:outline-none"
            >
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  aria-label={tc('close')}
                  className="absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-ink/80 text-cream backdrop-blur-sm transition-colors hover:bg-ink hover:text-cream"
                >
                  <X size={20} strokeWidth={2} />
                </button>
                <ImageWithPlaceholder
                  id={selectedItem.id}
                  src={selectedItem.image_url}
                  variant="portfolio"
                  alt={selectedItem.title}
                  className="w-full aspect-[4/5] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h2 className="font-serif text-xl text-cream">{tf(selectedItem._translations, i18n.language, 'title', selectedItem.title)}</h2>
                  <span className="text-xs text-gold uppercase tracking-wider">
                    {selectedItem.style}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <p className="text-cream-dark text-sm leading-relaxed">
                  {tf(selectedItem._translations, i18n.language, 'description', selectedItem.description)}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
