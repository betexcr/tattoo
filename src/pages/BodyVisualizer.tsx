import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageHeader from '../components/PageHeader'
import { usePortfolio } from '../hooks/usePortfolio'
import type { PortfolioItem } from '../types'

type BodyZone =
  | 'head'
  | 'neck'
  | 'chest'
  | 'left-arm'
  | 'right-arm'
  | 'left-forearm'
  | 'right-forearm'
  | 'left-hand'
  | 'right-hand'
  | 'stomach'
  | 'left-thigh'
  | 'right-thigh'
  | 'left-calf'
  | 'right-calf'
  | 'left-foot'
  | 'right-foot'
  | 'back'

type ViewMode = 'front' | 'back'

const ZONE_LABELS: Record<BodyZone, string> = {
  head: 'Cabeza',
  neck: 'Cuello',
  chest: 'Pecho',
  'left-arm': 'Brazo izquierdo',
  'right-arm': 'Brazo derecho',
  'left-forearm': 'Antebrazo izquierdo',
  'right-forearm': 'Antebrazo derecho',
  'left-hand': 'Mano izquierda',
  'right-hand': 'Mano derecha',
  stomach: 'Estómago',
  'left-thigh': 'Muslo izquierdo',
  'right-thigh': 'Muslo derecho',
  'left-calf': 'Pantorrilla izquierda',
  'right-calf': 'Pantorrilla derecha',
  'left-foot': 'Pie izquierdo',
  'right-foot': 'Pie derecho',
  back: 'Espalda',
}

const PAIN_LEVELS: Record<BodyZone, { level: number; label: string }> = {
  head: { level: 2, label: 'Bajo - Piel fina' },
  neck: { level: 4, label: 'Alto - Zona sensible' },
  chest: { level: 3, label: 'Medio - Cerca del esternón' },
  'left-arm': { level: 2, label: 'Bajo - Buena tolerancia' },
  'right-arm': { level: 2, label: 'Bajo - Buena tolerancia' },
  'left-forearm': { level: 2, label: 'Bajo - Zona popular' },
  'right-forearm': { level: 2, label: 'Bajo - Zona popular' },
  'left-hand': { level: 4, label: 'Alto - Huesos y nervios' },
  'right-hand': { level: 4, label: 'Alto - Huesos y nervios' },
  stomach: { level: 4, label: 'Alto - Piel muy sensible' },
  'left-thigh': { level: 2, label: 'Bajo - Carnoso' },
  'right-thigh': { level: 2, label: 'Bajo - Carnoso' },
  'left-calf': { level: 3, label: 'Medio - Musculatura' },
  'right-calf': { level: 3, label: 'Medio - Musculatura' },
  'left-foot': { level: 5, label: 'Muy alto - Muy sensible' },
  'right-foot': { level: 5, label: 'Muy alto - Muy sensible' },
  back: { level: 2, label: 'Bajo - Zona amplia' },
}

const TATTOO_DOT_POSITIONS: Record<BodyZone, { cx: number; cy: number }> = {
  head: { cx: 50, cy: 18 },
  neck: { cx: 50, cy: 38 },
  chest: { cx: 50, cy: 75 },
  'left-arm': { cx: 22, cy: 55 },
  'right-arm': { cx: 78, cy: 55 },
  'left-forearm': { cx: 18, cy: 95 },
  'right-forearm': { cx: 82, cy: 95 },
  'left-hand': { cx: 12, cy: 125 },
  'right-hand': { cx: 88, cy: 125 },
  stomach: { cx: 50, cy: 130 },
  'left-thigh': { cx: 38, cy: 175 },
  'right-thigh': { cx: 62, cy: 175 },
  'left-calf': { cx: 38, cy: 235 },
  'right-calf': { cx: 62, cy: 235 },
  'left-foot': { cx: 35, cy: 278 },
  'right-foot': { cx: 65, cy: 278 },
  back: { cx: 50, cy: 100 },
}

const FRONT_ZONES: BodyZone[] = [
  'head',
  'neck',
  'chest',
  'left-arm',
  'right-arm',
  'left-forearm',
  'right-forearm',
  'left-hand',
  'right-hand',
  'stomach',
  'left-thigh',
  'right-thigh',
  'left-calf',
  'right-calf',
  'left-foot',
  'right-foot',
]

function BodySVGFront({
  selectedZone,
  onZoneClick,
  designImage,
}: {
  selectedZone: BodyZone | null
  onZoneClick: (zone: BodyZone) => void
  designImage: string | null
}) {
  const isSelected = (zone: BodyZone) => selectedZone === zone

  return (
    <svg
      viewBox="0 0 100 300"
      className="w-full max-w-[200px] h-[300px] mx-auto"
      style={{ touchAction: 'manipulation' }}
    >
      <defs>
        <filter id="gold-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feFlood floodColor="#c9956b" floodOpacity="0.6" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Body outline stroke */}
      <path
        d="M50 8 C30 8 18 25 18 45 L18 55 C18 70 12 85 8 100 L8 130 C8 145 15 160 20 175 L22 210 C24 235 30 255 35 275 L35 292 L50 300 L65 292 L65 275 C70 255 76 235 78 210 L80 175 C85 160 92 145 92 130 L92 100 C88 85 82 70 82 55 L82 45 C82 25 70 8 50 8 Z"
        fill="none"
        stroke="var(--color-subtle)"
        strokeWidth="0.8"
        opacity="0.6"
      />
      {/* Clickable zones */}
      <path
        id="head"
        d="M50 8 C30 8 18 25 18 45 C18 55 30 55 50 55 C70 55 82 55 82 45 C82 25 70 8 50 8 Z"
        fill={isSelected('head') ? 'rgba(201,149,107,0.4)' : 'transparent'}
        stroke={isSelected('head') ? 'var(--color-gold)' : 'transparent'}
        strokeWidth="1.5"
        filter={isSelected('head') ? 'url(#gold-glow)' : undefined}
        className="cursor-pointer transition-all duration-200"
        onClick={() => onZoneClick('head')}
      />
      <path
        id="neck"
        d="M35 55 L35 70 L65 70 L65 55 L50 55 Z"
        fill={isSelected('neck') ? 'rgba(201,149,107,0.4)' : 'transparent'}
        stroke={isSelected('neck') ? 'var(--color-gold)' : 'transparent'}
        strokeWidth="1.5"
        filter={isSelected('neck') ? 'url(#gold-glow)' : undefined}
        className="cursor-pointer"
        onClick={() => onZoneClick('neck')}
      />
      <path
        id="chest"
        d="M35 70 L30 90 L32 120 L40 130 L60 130 L68 120 L70 90 L65 70 Z"
        fill={isSelected('chest') ? 'rgba(201,149,107,0.4)' : 'transparent'}
        stroke={isSelected('chest') ? 'var(--color-gold)' : 'transparent'}
        strokeWidth="1.5"
        filter={isSelected('chest') ? 'url(#gold-glow)' : undefined}
        className="cursor-pointer"
        onClick={() => onZoneClick('chest')}
      />
      <path
        id="left-arm"
        d="M30 75 L12 85 L8 100 L10 115 L18 120 L32 95 Z"
        fill={isSelected('left-arm') ? 'rgba(201,149,107,0.4)' : 'transparent'}
        stroke={isSelected('left-arm') ? 'var(--color-gold)' : 'transparent'}
        strokeWidth="1.5"
        filter={isSelected('left-arm') ? 'url(#gold-glow)' : undefined}
        className="cursor-pointer"
        onClick={() => onZoneClick('left-arm')}
      />
      <path
        id="right-arm"
        d="M70 75 L88 85 L92 100 L90 115 L82 120 L68 95 Z"
        fill={isSelected('right-arm') ? 'rgba(201,149,107,0.4)' : 'transparent'}
        stroke={isSelected('right-arm') ? 'var(--color-gold)' : 'transparent'}
        strokeWidth="1.5"
        filter={isSelected('right-arm') ? 'url(#gold-glow)' : undefined}
        className="cursor-pointer"
        onClick={() => onZoneClick('right-arm')}
      />
      <path
        id="left-forearm"
        d="M18 120 L8 135 L6 150 L10 160 L22 145 Z"
        fill={isSelected('left-forearm') ? 'rgba(201,149,107,0.4)' : 'transparent'}
        stroke={isSelected('left-forearm') ? 'var(--color-gold)' : 'transparent'}
        strokeWidth="1.5"
        filter={isSelected('left-forearm') ? 'url(#gold-glow)' : undefined}
        className="cursor-pointer"
        onClick={() => onZoneClick('left-forearm')}
      />
      <path
        id="right-forearm"
        d="M82 120 L92 135 L94 150 L90 160 L78 145 Z"
        fill={isSelected('right-forearm') ? 'rgba(201,149,107,0.4)' : 'transparent'}
        stroke={isSelected('right-forearm') ? 'var(--color-gold)' : 'transparent'}
        strokeWidth="1.5"
        filter={isSelected('right-forearm') ? 'url(#gold-glow)' : undefined}
        className="cursor-pointer"
        onClick={() => onZoneClick('right-forearm')}
      />
      <path
        id="left-hand"
        d="M6 155 L2 170 L8 175 L18 168 L16 155 Z"
        fill={isSelected('left-hand') ? 'rgba(201,149,107,0.4)' : 'transparent'}
        stroke={isSelected('left-hand') ? 'var(--color-gold)' : 'transparent'}
        strokeWidth="1.5"
        filter={isSelected('left-hand') ? 'url(#gold-glow)' : undefined}
        className="cursor-pointer"
        onClick={() => onZoneClick('left-hand')}
      />
      <path
        id="right-hand"
        d="M94 155 L98 170 L92 175 L82 168 L84 155 Z"
        fill={isSelected('right-hand') ? 'rgba(201,149,107,0.4)' : 'transparent'}
        stroke={isSelected('right-hand') ? 'var(--color-gold)' : 'transparent'}
        strokeWidth="1.5"
        filter={isSelected('right-hand') ? 'url(#gold-glow)' : undefined}
        className="cursor-pointer"
        onClick={() => onZoneClick('right-hand')}
      />
      <path
        id="stomach"
        d="M40 130 L38 160 L42 195 L58 195 L62 160 L60 130 Z"
        fill={isSelected('stomach') ? 'rgba(201,149,107,0.4)' : 'transparent'}
        stroke={isSelected('stomach') ? 'var(--color-gold)' : 'transparent'}
        strokeWidth="1.5"
        filter={isSelected('stomach') ? 'url(#gold-glow)' : undefined}
        className="cursor-pointer"
        onClick={() => onZoneClick('stomach')}
      />
      <path
        id="left-thigh"
        d="M38 195 L32 220 L30 250 L38 255 L42 220 Z"
        fill={isSelected('left-thigh') ? 'rgba(201,149,107,0.4)' : 'transparent'}
        stroke={isSelected('left-thigh') ? 'var(--color-gold)' : 'transparent'}
        strokeWidth="1.5"
        filter={isSelected('left-thigh') ? 'url(#gold-glow)' : undefined}
        className="cursor-pointer"
        onClick={() => onZoneClick('left-thigh')}
      />
      <path
        id="right-thigh"
        d="M62 195 L68 220 L70 250 L62 255 L58 220 Z"
        fill={isSelected('right-thigh') ? 'rgba(201,149,107,0.4)' : 'transparent'}
        stroke={isSelected('right-thigh') ? 'var(--color-gold)' : 'transparent'}
        strokeWidth="1.5"
        filter={isSelected('right-thigh') ? 'url(#gold-glow)' : undefined}
        className="cursor-pointer"
        onClick={() => onZoneClick('right-thigh')}
      />
      <path
        id="left-calf"
        d="M30 255 L28 275 L32 290 L38 285 L36 260 Z"
        fill={isSelected('left-calf') ? 'rgba(201,149,107,0.4)' : 'transparent'}
        stroke={isSelected('left-calf') ? 'var(--color-gold)' : 'transparent'}
        strokeWidth="1.5"
        filter={isSelected('left-calf') ? 'url(#gold-glow)' : undefined}
        className="cursor-pointer"
        onClick={() => onZoneClick('left-calf')}
      />
      <path
        id="right-calf"
        d="M70 255 L72 275 L68 290 L62 285 L64 260 Z"
        fill={isSelected('right-calf') ? 'rgba(201,149,107,0.4)' : 'transparent'}
        stroke={isSelected('right-calf') ? 'var(--color-gold)' : 'transparent'}
        strokeWidth="1.5"
        filter={isSelected('right-calf') ? 'url(#gold-glow)' : undefined}
        className="cursor-pointer"
        onClick={() => onZoneClick('right-calf')}
      />
      <path
        id="left-foot"
        d="M28 288 L25 298 L35 300 L38 292 Z"
        fill={isSelected('left-foot') ? 'rgba(201,149,107,0.4)' : 'transparent'}
        stroke={isSelected('left-foot') ? 'var(--color-gold)' : 'transparent'}
        strokeWidth="1.5"
        filter={isSelected('left-foot') ? 'url(#gold-glow)' : undefined}
        className="cursor-pointer"
        onClick={() => onZoneClick('left-foot')}
      />
      <path
        id="right-foot"
        d="M72 288 L75 298 L65 300 L62 292 Z"
        fill={isSelected('right-foot') ? 'rgba(201,149,107,0.4)' : 'transparent'}
        stroke={isSelected('right-foot') ? 'var(--color-gold)' : 'transparent'}
        strokeWidth="1.5"
        filter={isSelected('right-foot') ? 'url(#gold-glow)' : undefined}
        className="cursor-pointer"
        onClick={() => onZoneClick('right-foot')}
      />
      {/* Tattoo design overlay or indicator dot */}
      <AnimatePresence>
        {selectedZone && FRONT_ZONES.includes(selectedZone) && (
          designImage ? (
            <motion.g
              key={`design-${selectedZone}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <defs>
                <clipPath id="design-clip">
                  <circle cx={TATTOO_DOT_POSITIONS[selectedZone].cx} cy={TATTOO_DOT_POSITIONS[selectedZone].cy} r="8" />
                </clipPath>
              </defs>
              <image
                href={designImage}
                x={TATTOO_DOT_POSITIONS[selectedZone].cx - 8}
                y={TATTOO_DOT_POSITIONS[selectedZone].cy - 8}
                width="16"
                height="16"
                clipPath="url(#design-clip)"
                preserveAspectRatio="xMidYMid slice"
              />
              <circle
                cx={TATTOO_DOT_POSITIONS[selectedZone].cx}
                cy={TATTOO_DOT_POSITIONS[selectedZone].cy}
                r="8"
                fill="none"
                stroke="var(--color-gold)"
                strokeWidth="1"
              />
            </motion.g>
          ) : (
            <motion.circle
              key={selectedZone}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              r="4"
              fill="var(--color-gold)"
              stroke="var(--color-cream)"
              strokeWidth="1"
              {...TATTOO_DOT_POSITIONS[selectedZone]}
            />
          )
        )}
      </AnimatePresence>
    </svg>
  )
}

function BodySVGBack({
  selectedZone,
  onZoneClick,
  designImage,
}: {
  selectedZone: BodyZone | null
  onZoneClick: (zone: BodyZone) => void
  designImage: string | null
}) {
  const isSelected = (zone: BodyZone) => selectedZone === zone

  return (
    <svg
      viewBox="0 0 100 300"
      className="w-full max-w-[200px] h-[300px] mx-auto"
      style={{ touchAction: 'manipulation' }}
    >
      <defs>
        <filter id="gold-glow-back" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feFlood floodColor="#c9956b" floodOpacity="0.6" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Back body outline */}
      <path
        d="M50 8 C30 8 18 25 18 45 L18 55 C18 70 12 85 8 100 L8 130 C8 145 15 160 20 175 L22 210 C24 235 30 255 35 275 L35 292 L50 300 L65 292 L65 275 C70 255 76 235 78 210 L80 175 C85 160 92 145 92 130 L92 100 C88 85 82 70 82 55 L82 45 C82 25 70 8 50 8 Z"
        fill="none"
        stroke="var(--color-subtle)"
        strokeWidth="0.8"
        opacity="0.6"
      />
      {/* Back zone - main torso/back area */}
      <path
        id="back"
        d="M35 55 L32 75 L30 100 L32 130 L38 195 L42 255 L58 255 L62 195 L68 130 L70 100 L68 75 L65 55 Z"
        fill={isSelected('back') ? 'rgba(201,149,107,0.4)' : 'transparent'}
        stroke={isSelected('back') ? 'var(--color-gold)' : 'transparent'}
        strokeWidth="1.5"
        filter={isSelected('back') ? 'url(#gold-glow-back)' : undefined}
        className="cursor-pointer"
        onClick={() => onZoneClick('back')}
      />
      {/* Tattoo design overlay or indicator dot for back */}
      <AnimatePresence>
        {selectedZone === 'back' && (
          designImage ? (
            <motion.g
              key="design-back"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <defs>
                <clipPath id="design-clip-back">
                  <circle cx={50} cy={100} r="8" />
                </clipPath>
              </defs>
              <image
                href={designImage}
                x={42}
                y={92}
                width="16"
                height="16"
                clipPath="url(#design-clip-back)"
                preserveAspectRatio="xMidYMid slice"
              />
              <circle cx={50} cy={100} r="8" fill="none" stroke="var(--color-gold)" strokeWidth="1" />
            </motion.g>
          ) : (
            <motion.circle
              key="back"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              r="4"
              fill="var(--color-gold)"
              stroke="var(--color-cream)"
              strokeWidth="1"
              cx={50}
              cy={100}
            />
          )
        )}
      </AnimatePresence>
    </svg>
  )
}

export default function BodyVisualizer() {
  const { items: portfolioItems, loading } = usePortfolio()
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
      <PageHeader title="Body Visualizer" subtitle="Visualiza tu tatuaje" />

      <div className="px-5 pt-4 pb-28">
        {/* View toggle */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 mb-6 justify-center"
        >
          {(['front', 'back'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setSelectedView(view)}
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
                key={item.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDesign(item)}
                className={`shrink-0 w-14 h-14 rounded-full overflow-hidden border-2 transition-all ${
                  selectedDesign?.id === item.id
                    ? 'border-gold ring-2 ring-gold/30'
                    : 'border-white/10 hover:border-gold/50'
                }`}
              >
                <img
                  src={item.image_url}
                  alt={item.title}
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
        <Link to="/book">
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 rounded-full bg-gold text-ink font-medium hover:bg-gold-light transition-colors"
          >
            Agendar Cita
          </motion.button>
        </Link>
      </div>
    </div>
  )
}
