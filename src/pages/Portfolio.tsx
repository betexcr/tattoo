import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { useStudioConfig } from '../contexts/StudioConfigContext'
import { usePortfolio } from '../hooks/usePortfolio'
import type { PortfolioItem } from '../types'

const FILTER_STYLES = ['Fine Line', 'Blackwork', 'Geometric', 'Dotwork', 'Watercolor', 'Mandala', 'Neo Traditional']

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

export default function Portfolio() {
  const { config } = useStudioConfig()
  const { items: portfolioItems, loading } = usePortfolio()
  const [searchParams] = useSearchParams()
  const styleFromUrl = searchParams.get('style')
  const [selectedStyle, setSelectedStyle] = useState('Todos')
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (styleFromUrl && config.tattoo_styles.includes(styleFromUrl)) {
      setSelectedStyle(styleFromUrl)
    }
  }, [styleFromUrl, config.tattoo_styles])

  const styleFilters = useMemo(
    () => ['Todos', ...config.tattoo_styles.filter((s) => FILTER_STYLES.includes(s))],
    [config.tattoo_styles]
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
      <div className="min-h-dvh pb-6 flex items-center justify-center">
        <p className="text-subtle text-sm">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh pb-6">
      <PageHeader title="Portfolio" subtitle="Mi trabajo" />

      {/* Search */}
      <div className="px-5 pt-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar diseños..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-ink-light border border-white/5 text-cream placeholder:text-subtle text-sm focus:outline-none focus:border-gold/40 transition-colors"
          />
        </div>
      </div>

      {/* Filter chips */}
      <div className="px-5 py-2 overflow-x-auto -mx-5">
        <div className="flex gap-2 min-w-max pr-5">
          {styleFilters.map((style) => (
            <button
              key={style}
              onClick={() => setSelectedStyle(style)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedStyle === style
                  ? 'bg-gold text-ink'
                  : 'bg-ink-medium/60 text-cream-dark border border-white/5 hover:border-gold/30'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Masonry grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="columns-2 gap-3 px-5"
      >
        {filteredItems.map((item) => (
          <motion.article
            key={item.id}
            variants={cardVariants}
            onClick={() => setSelectedItem(item)}
            className="break-inside-avoid mb-3 cursor-pointer group"
          >
            <div className="relative overflow-hidden rounded-xl border border-white/5 hover:border-gold/30 transition-colors">
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full aspect-[4/5] object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="font-serif text-cream text-sm font-medium">{item.title}</h3>
                <span className="text-[10px] text-gold/90 uppercase tracking-wider">
                  {item.style}
                </span>
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>

      {filteredItems.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 px-5">
          <p className="text-subtle text-sm">No se encontraron resultados</p>
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
              <div className="relative">
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.title}
                  className="w-full aspect-[4/5] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h2 className="font-serif text-xl text-cream">{selectedItem.title}</h2>
                  <span className="text-xs text-gold uppercase tracking-wider">
                    {selectedItem.style}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <p className="text-cream-dark text-sm leading-relaxed">
                  {selectedItem.description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
