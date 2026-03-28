import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Rose,
  Flower2,
  Sun,
  Bird,
  Fish,
  Cat,
  Triangle,
  Circle,
  Diamond,
  Moon,
  Star,
  Heart,
  X,
  CheckCircle,
  Share2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '../lib/firebase'
import PageHeader from '../components/PageHeader'
import { useStudioConfig } from '../contexts/StudioConfigContext'
import { useRequireAuth } from '../hooks/useRequireAuth'

type SizeOption = 'small' | 'medium' | 'large'
type ColorMode = 'negro' | 'color'

interface DesignElement {
  id: string
  name: string
  icon: LucideIcon
  category: string
}

const designElements: DesignElement[] = [
  { id: 'rose', name: 'Rosa', icon: Rose, category: 'Flores' },
  { id: 'lotus', name: 'Loto', icon: Flower2, category: 'Flores' },
  { id: 'sunflower', name: 'Girasol', icon: Sun, category: 'Flores' },
  { id: 'bird', name: 'Pájaro', icon: Bird, category: 'Animales' },
  { id: 'fish', name: 'Pez', icon: Fish, category: 'Animales' },
  { id: 'cat', name: 'Gato', icon: Cat, category: 'Animales' },
  { id: 'triangle', name: 'Triángulo', icon: Triangle, category: 'Geometría' },
  { id: 'circle', name: 'Círculo', icon: Circle, category: 'Geometría' },
  { id: 'diamond', name: 'Diamante', icon: Diamond, category: 'Geometría' },
  { id: 'moon', name: 'Luna', icon: Moon, category: 'Símbolos' },
  { id: 'star', name: 'Estrella', icon: Star, category: 'Símbolos' },
  { id: 'heart', name: 'Corazón', icon: Heart, category: 'Símbolos' },
]

const colorPalette = [
  { id: 'black', hex: '#0a0a0a', label: 'Negro' },
  { id: 'gold', hex: '#c9956b', label: 'Oro' },
  { id: 'rose', hex: '#e8a0bf', label: 'Rosa' },
  { id: 'blue', hex: '#5b8def', label: 'Azul' },
  { id: 'green', hex: '#5bc98a', label: 'Verde' },
  { id: 'red', hex: '#e85b5b', label: 'Rojo' },
]

const sizeConfig = {
  small: { label: 'Pequeño', size: 24 },
  medium: { label: 'Mediano', size: 36 },
  large: { label: 'Grande', size: 48 },
}

function getStyleBorderClass(style: string | null): string {
  if (!style) return 'border-cream-dark/30'
  const styleMap: Record<string, string> = {
    'Fine Line': 'border-cream-dark/50 border-2',
    Blackwork: 'border-ink border-4',
    Traditional: 'border-gold border-2',
    'Neo Traditional': 'border-gold border-2 border-double',
    Japanese: 'border-ink border-2',
    Geometric: 'border-gold/60 border-2',
    Dotwork: 'border-cream-dark/40 border-2 border-dashed',
    Watercolor: 'border-rose/40 border-2',
    Realism: 'border-cream-dark/60 border-2',
    Tribal: 'border-gold-dark border-2',
    Lettering: 'border-cream-dark/50 border-2',
    Mandala: 'border-gold/50 border-2',
    Minimalist: 'border-cream-dark/30 border',
    Ornamental: 'border-gold border-2',
    Sketch: 'border-cream-dark/50 border-2 border-dashed',
    Surrealism: 'border-rose/30 border-2',
  }
  return styleMap[style] ?? 'border-cream-dark/30'
}

export default function TattooDesigner() {
  const navigate = useNavigate()
  const { config } = useStudioConfig()
  const { user, requireAuth } = useRequireAuth()
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<SizeOption>('medium')
  const [selectedElements, setSelectedElements] = useState<DesignElement[]>([])
  const [colorMode, setColorMode] = useState<ColorMode>('negro')
  const [selectedColors, setSelectedColors] = useState<string[]>(['black'])
  const [notes, setNotes] = useState('')
  const [showSaved, setShowSaved] = useState(false)
  const [showShared, setShowShared] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const addElement = (el: DesignElement) => {
    if (selectedElements.some((e) => e.id === el.id)) return
    setSelectedElements((prev) => [...prev, el])
  }

  const removeElement = (id: string) => {
    setSelectedElements((prev) => prev.filter((e) => e.id !== id))
  }

  const toggleColor = (colorId: string) => {
    if (colorMode === 'negro') return
    setSelectedColors((prev) =>
      prev.includes(colorId)
        ? prev.filter((c) => c !== colorId)
        : [...prev, colorId]
    )
  }

  const canvasSize = sizeConfig[selectedSize].size

  return (
    <div className="min-h-dvh bg-ink pb-24">
      <PageHeader title="Tattoo Designer" subtitle="Diseña tu tatuaje" />

      <div className="px-5 py-6 space-y-6">
        {/* Canvas */}
        <motion.div
          layout
          className={`aspect-square max-w-sm mx-auto rounded-2xl bg-cream overflow-hidden ${getStyleBorderClass(selectedStyle)} transition-colors duration-300`}
        >
          <div className="w-full h-full relative flex items-center justify-center p-8">
            {selectedElements.length === 0 ? (
              <p className="text-subtle text-sm font-sans">Selecciona elementos para tu diseño</p>
            ) : (
              <div
                className="flex flex-wrap items-center justify-center gap-3"
                style={{ gap: canvasSize * 0.3 }}
              >
                <AnimatePresence mode="popLayout">
                  {selectedElements.map((el, i) => {
                    const Icon = el.icon
                    const colorHex =
                      colorMode === 'negro'
                        ? '#0a0a0a'
                        : colorPalette.find((c) => c.id === selectedColors[i % selectedColors.length])
                            ?.hex ?? '#0a0a0a'
                    return (
                      <motion.div
                        key={el.id}
                        layoutId={`canvas-${el.id}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="flex-shrink-0"
                        style={{ width: canvasSize, height: canvasSize }}
                      >
                        <Icon
                          size={canvasSize * 0.7}
                          strokeWidth={1.5}
                          className="mx-auto"
                          style={{ color: colorHex }}
                        />
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>

        {/* Style selector */}
        <div>
          <p className="text-subtle text-xs uppercase tracking-wider mb-2 font-sans">Estilo</p>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {config.tattoo_styles.map((style) => (
              <button
                key={style}
                onClick={() => setSelectedStyle(style)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-sans transition-all ${
                  selectedStyle === style
                    ? 'bg-gold text-ink'
                    : 'bg-ink-medium text-cream border border-white/10 hover:border-gold/30'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Size selector */}
        <div>
          <p className="text-subtle text-xs uppercase tracking-wider mb-2 font-sans">Tamaño</p>
          <div className="flex gap-3">
            {(Object.keys(sizeConfig) as SizeOption[]).map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                  selectedSize === size
                    ? 'bg-gold/20 border-gold text-gold'
                    : 'bg-ink-medium/40 border-white/5 text-cream hover:border-gold/20'
                }`}
              >
                <div
                  className="rounded-full bg-cream-dark/50"
                  style={{
                    width: sizeConfig[size].size * 0.5,
                    height: sizeConfig[size].size * 0.5,
                  }}
                />
                <span className="text-xs font-sans">{sizeConfig[size].label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Element picker */}
        <div>
          <p className="text-subtle text-xs uppercase tracking-wider mb-2 font-sans">
            Elementos de diseño
          </p>
          <div className="grid grid-cols-3 gap-2">
            {designElements.map((el) => {
              const Icon = el.icon
              const isSelected = selectedElements.some((e) => e.id === el.id)
              return (
                <button
                  key={el.id}
                  onClick={() => addElement(el)}
                  disabled={isSelected}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-gold/10 border-gold/40 text-gold opacity-60 cursor-default'
                      : 'bg-ink-medium/40 border-white/5 text-cream hover:border-gold/30 hover:bg-ink-medium/60 active:scale-[0.98]'
                  }`}
                >
                  <Icon size={24} strokeWidth={1.5} />
                  <span className="text-[10px] font-sans truncate w-full text-center">
                    {el.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected elements display */}
        {selectedElements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-2"
          >
            <p className="text-subtle text-xs uppercase tracking-wider font-sans">
              Elementos seleccionados
            </p>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence mode="popLayout">
                {selectedElements.map((el) => {
                  const Icon = el.icon
                  return (
                    <motion.button
                      key={el.id}
                      layoutId={`chip-${el.id}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => removeElement(el.id)}
                      className="flex items-center gap-2 pl-3 pr-1 py-1.5 rounded-full bg-ink-medium border border-white/10 hover:border-rose/30 group"
                    >
                      <Icon size={14} strokeWidth={1.5} className="text-gold" />
                      <span className="text-xs font-sans text-cream">{el.name}</span>
                      <span className="p-1 rounded-full hover:bg-rose/20 text-subtle group-hover:text-rose transition-colors">
                        <X size={12} />
                      </span>
                    </motion.button>
                  )
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Color mode toggle */}
        <div>
          <p className="text-subtle text-xs uppercase tracking-wider mb-2 font-sans">
            Modo de color
          </p>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => {
                setColorMode('negro')
                setSelectedColors(['black'])
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-sans transition-all ${
                colorMode === 'negro'
                  ? 'bg-ink-medium border-gold text-gold border'
                  : 'bg-ink-medium/40 border-white/5 text-cream border hover:border-gold/20'
              }`}
            >
              Negro
            </button>
            <button
              onClick={() => setColorMode('color')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-sans transition-all ${
                colorMode === 'color'
                  ? 'bg-ink-medium border-gold text-gold border'
                  : 'bg-ink-medium/40 border-white/5 text-cream border hover:border-gold/20'
              }`}
            >
              Color
            </button>
          </div>
          {colorMode === 'color' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 flex-wrap"
            >
              {colorPalette.map((c) => (
                <button
                  key={c.id}
                  onClick={() => toggleColor(c.id)}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    selectedColors.includes(c.id)
                      ? 'border-gold ring-2 ring-gold/30'
                      : 'border-white/10 hover:border-gold/40'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                />
              ))}
            </motion.div>
          )}
        </div>

        {/* Notes */}
        <div>
          <p className="text-subtle text-xs uppercase tracking-wider mb-2 font-sans">Notas</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe tu idea..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-ink-medium border border-white/5 text-cream placeholder:text-subtle/60 focus:outline-none focus:border-gold/40 resize-none font-sans text-sm"
          />
        </div>

        {/* Feedback banners */}
        <AnimatePresence>
          {showSaved && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2"
            >
              <CheckCircle size={16} className="text-emerald-400" />
              <p className="text-emerald-400 text-sm">Diseño guardado correctamente</p>
            </motion.div>
          )}
          {showShared && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3 rounded-xl bg-gold/10 border border-gold/20 flex items-center gap-2"
            >
              <Share2 size={16} className="text-gold" />
              <p className="text-gold text-sm">Redirigiendo al chat con la artista...</p>
            </motion.div>
          )}
        </AnimatePresence>
        {saveError && <p className="text-rose text-sm text-center">{saveError}</p>}

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={async () => {
              if (!requireAuth('/designer')) return
              const design = {
                style: selectedStyle,
                size: selectedSize,
                elements: selectedElements.map((e) => e.name),
                colorMode,
                colors: selectedColors,
                notes,
                client_id: user?.uid ?? null,
                status: 'draft',
                created_at: new Date().toISOString(),
              }
              try {
                await addDoc(collection(db, 'design_shares'), design)
                setShowSaved(true)
                setSaveError(null)
                setTimeout(() => setShowSaved(false), 3000)
              } catch (e: unknown) {
                setSaveError((e as Error).message)
              }
            }}
            className="flex-1 py-3.5 rounded-xl bg-gold text-ink font-serif font-medium text-sm"
          >
            Guardar Diseño
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={async () => {
              if (!requireAuth('/designer')) return
              setShowShared(true)
              const design = {
                style: selectedStyle,
                size: selectedSize,
                elements: selectedElements.map((e) => e.name),
                colorMode,
                colors: selectedColors,
                notes,
                client_id: user?.uid ?? null,
                created_at: new Date().toISOString(),
              }
              try {
                const ref = await addDoc(collection(db, 'design_shares'), design)
                setTimeout(() => { setShowShared(false); navigate(`/chat?design=${ref.id}`) }, 1500)
              } catch (e: unknown) {
                setShowShared(false)
                setSaveError((e as Error).message)
              }
            }}
            className="flex-1 py-3.5 rounded-xl border border-gold text-gold font-serif font-medium text-sm hover:bg-gold/10 transition-colors"
          >
            Compartir con Artista
          </motion.button>
        </div>
      </div>
    </div>
  )
}
