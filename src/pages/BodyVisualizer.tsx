import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageHeader from '../components/PageHeader'
import { usePortfolio } from '../hooks/usePortfolio'
import type { PortfolioItem } from '../types'
import type { BodyZone, ViewMode } from './visualizer/bodyConstants'
import { ZONE_LABELS, PAIN_LEVELS } from './visualizer/bodyConstants'
import BodySVGFront from './visualizer/BodySVGFront'
import BodySVGBack from './visualizer/BodySVGBack'

export default function BodyVisualizer() {
  const { items: portfolioItems, loading, error } = usePortfolio()
  const [selectedZone, setSelectedZone] = useState<BodyZone | null>(null)
  const [selectedView, setSelectedView] = useState<ViewMode>('front')
  const [selectedDesign, setSelectedDesign] = useState<PortfolioItem | null>(null)

  const previewItems = portfolioItems.slice(0, 4)
  const painInfo = selectedZone ? PAIN_LEVELS[selectedZone] : null

  const handleZoneClick = (zone: BodyZone) => {
    setSelectedZone((prev) => (prev === zone ? null : zone))
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-ink flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-ink">
      {error && (
        <div className="mx-5 mt-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm">{error}</div>
      )}
      <PageHeader title="Visualizador Corporal" subtitle="Visualiza tu tatuaje" />

      <div className="px-5 pt-4 pb-28">
        {/* View toggle */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 mb-6 justify-center"
        >
          {(['front', 'back'] as const).map((view) => (
            <button
              type="button"
              key={view}
              onClick={() => setSelectedView(view)}
              aria-pressed={selectedView === view}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                selectedView === view
                  ? 'bg-gold text-ink'
                  : 'bg-ink-medium text-subtle hover:text-cream-dark'
              }`}
            >
              {view === 'front' ? 'Frente' : 'Espalda'}
            </button>
          ))}
        </motion.div>

        {/* Body SVG */}
        <motion.div
          key={selectedView}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl bg-ink-light/50 border border-white/5 p-6 mb-6"
        >
          {selectedView === 'front' ? (
            <BodySVGFront selectedZone={selectedZone} onZoneClick={handleZoneClick} designImage={selectedDesign?.image_url ?? null} />
          ) : (
            <BodySVGBack selectedZone={selectedZone} onZoneClick={handleZoneClick} designImage={selectedDesign?.image_url ?? null} />
          )}
        </motion.div>

        {/* Selected zone display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <p className="text-sm text-subtle">
            Zona seleccionada:{' '}
            <span className="text-gold font-medium">
              {selectedZone ? ZONE_LABELS[selectedZone] : '—'}
            </span>
          </p>
        </motion.div>

        {/* Tattoo style gallery */}
        <div className="mb-6">
          <h3 className="text-xs text-subtle uppercase tracking-wider mb-3">Estilos de referencia</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1">
            {previewItems.map((item) => (
              <motion.button
                type="button"
                key={item.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDesign(item)}
                aria-pressed={selectedDesign?.id === item.id}
                className={`shrink-0 w-14 h-14 rounded-full overflow-hidden border-2 transition-all ${
                  selectedDesign?.id === item.id
                    ? 'border-gold ring-2 ring-gold/30'
                    : 'border-white/10 hover:border-gold/50'
                }`}
              >
                <img
                  src={item.image_url}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Pain level */}
        {painInfo && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-ink-light border border-white/5"
          >
            <h3 className="text-xs text-subtle uppercase tracking-wider mb-2">Nivel de dolor</h3>
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-6 rounded-sm transition-colors ${
                    i <= painInfo.level ? 'bg-gold' : 'bg-ink-medium'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-cream-dark">{painInfo.label}</p>
          </motion.div>
        )}

        {/* Agendar Cita button */}
        <Link
          to="/book"
          className="block w-full py-3.5 rounded-full bg-gold text-ink font-medium hover:bg-gold-light transition-colors text-center active:scale-[0.98]"
        >
          Agendar Cita
        </Link>
      </div>
    </div>
  )
}
