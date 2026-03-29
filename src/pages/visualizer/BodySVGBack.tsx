import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { BodyZone } from './bodyConstants'
import { zoneA11y } from './bodyConstants'

interface Props {
  selectedZone: BodyZone | null
  onZoneClick: (zone: BodyZone) => void
  designImage: string | null
}

export default memo(function BodySVGBack({ selectedZone, onZoneClick, designImage }: Props) {
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
        {...zoneA11y('back', onZoneClick)}
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
})
