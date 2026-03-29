import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { DesignElement, ColorMode, SizeOption } from './designerConstants'
import { colorPalette, sizeConfig, getStyleBorderClass } from './designerConstants'

interface Props {
  selectedElements: DesignElement[]
  selectedStyle: string | null
  colorMode: ColorMode
  selectedColors: string[]
  selectedSize: SizeOption
}

export default memo(function DesignCanvas({ selectedElements, selectedStyle, colorMode, selectedColors, selectedSize }: Props) {
  const canvasSize = sizeConfig[selectedSize].size

  return (
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
  )
})
