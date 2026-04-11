import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, Share2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { mapFirestoreError } from '../utils/mapFirestoreError'
import PageHeader from '../components/PageHeader'
import { useStudioConfig } from '../contexts/StudioConfigContext'
import { useRequireAuth } from '../hooks/useRequireAuth'
import { designElements, colorPalette, sizeConfig, type SizeOption, type ColorMode, type DesignElement } from './designer/designerConstants'
import DesignCanvas from './designer/DesignCanvas'

export default function TattooDesigner() {
  const navigate = useNavigate()
  const { config } = useStudioConfig()
  const { user, requireAuth, authPrompt } = useRequireAuth()
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<SizeOption>('medium')
  const [selectedElements, setSelectedElements] = useState<DesignElement[]>([])
  const [colorMode, setColorMode] = useState<ColorMode>('negro')
  const [selectedColors, setSelectedColors] = useState<string[]>(['black'])
  const [notes, setNotes] = useState('')
  const [showSaved, setShowSaved] = useState(false)
  const [showShared, setShowShared] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const trackTimer = useCallback((id: ReturnType<typeof setTimeout>) => { timersRef.current.push(id) }, [])
  useEffect(() => () => { timersRef.current.forEach(clearTimeout) }, [])

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

  return (
    <div className="min-h-dvh bg-ink pb-24">
      {authPrompt}
      <PageHeader title="Diseñador de Tatuajes" subtitle="Diseña tu tatuaje" />

      <div className="px-5 py-6 space-y-6">
        {/* Canvas */}
        <DesignCanvas
          selectedElements={selectedElements}
          selectedStyle={selectedStyle}
          colorMode={colorMode}
          selectedColors={selectedColors}
          selectedSize={selectedSize}
        />

        {/* Style selector */}
        <div>
          <p className="text-subtle text-xs uppercase tracking-wider mb-2 font-sans">Estilo</p>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {config.tattoo_styles.map((style) => (
              <button
                type="button"
                key={style}
                onClick={() => setSelectedStyle(style)}
                aria-pressed={selectedStyle === style}
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
                type="button"
                key={size}
                onClick={() => setSelectedSize(size)}
                aria-pressed={selectedSize === size}
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
                  type="button"
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
                      type="button"
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
              type="button"
              onClick={() => {
                setColorMode('negro')
                setSelectedColors(['black'])
              }}
              aria-pressed={colorMode === 'negro'}
              className={`flex-1 py-2.5 rounded-xl text-sm font-sans transition-all ${
                colorMode === 'negro'
                  ? 'bg-ink-medium border-gold text-gold border'
                  : 'bg-ink-medium/40 border-white/5 text-cream border hover:border-gold/20'
              }`}
            >
              Negro
            </button>
            <button
              type="button"
              onClick={() => setColorMode('color')}
              aria-pressed={colorMode === 'color'}
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
                  type="button"
                  key={c.id}
                  onClick={() => toggleColor(c.id)}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    selectedColors.includes(c.id)
                      ? 'border-gold ring-2 ring-gold/30'
                      : 'border-white/10 hover:border-gold/40'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                  aria-label={c.label}
                  aria-pressed={selectedColors.includes(c.id)}
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
            aria-label="Notas sobre el diseño"
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
            type="button"
            whileTap={{ scale: 0.98 }}
            disabled={actionLoading}
            onClick={async () => {
              if (!requireAuth('/designer') || actionLoading) return
              setActionLoading(true)
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
                trackTimer(setTimeout(() => setShowSaved(false), 3000))
              } catch (e: unknown) {
                setSaveError(mapFirestoreError(e))
              } finally {
                setActionLoading(false)
              }
            }}
            className="flex-1 py-3.5 rounded-xl bg-gold text-ink font-serif font-medium text-sm disabled:opacity-50"
          >
            {actionLoading ? 'Guardando...' : 'Guardar Diseño'}
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            disabled={actionLoading}
            onClick={async () => {
              if (!requireAuth('/designer') || actionLoading) return
              setActionLoading(true)
              setShowShared(true)
              const design = {
                style: selectedStyle,
                size: selectedSize,
                elements: selectedElements.map((e) => e.name),
                colorMode,
                colors: selectedColors,
                notes,
                client_id: user?.uid ?? null,
                status: 'shared' as const,
                created_at: new Date().toISOString(),
              }
              try {
                const ref = await addDoc(collection(db, 'design_shares'), design)
                trackTimer(setTimeout(() => { setShowShared(false); navigate(`/chat?design=${ref.id}`) }, 1500))
              } catch (e: unknown) {
                setShowShared(false)
                setSaveError(mapFirestoreError(e))
              } finally {
                setActionLoading(false)
              }
            }}
            className="flex-1 py-3.5 rounded-xl border border-gold text-gold font-serif font-medium text-sm hover:bg-gold/10 transition-colors disabled:opacity-50"
          >
            Compartir con Artista
          </motion.button>
        </div>
      </div>
    </div>
  )
}
