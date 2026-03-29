import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { BodyZone } from './bodyConstants'
import { FRONT_ZONES, TATTOO_DOT_POSITIONS, zoneA11y } from './bodyConstants'

interface Props {
  selectedZone: BodyZone | null
  onZoneClick: (zone: BodyZone) => void
  designImage: string | null
}

export default memo(function BodySVGFront({ selectedZone, onZoneClick, designImage }: Props) {
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
        {...zoneA11y('head', onZoneClick)}
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
        {...zoneA11y('neck', onZoneClick)}
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
        {...zoneA11y('chest', onZoneClick)}
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
        {...zoneA11y('left-arm', onZoneClick)}
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
        {...zoneA11y('right-arm', onZoneClick)}
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
        {...zoneA11y('left-forearm', onZoneClick)}
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
        {...zoneA11y('right-forearm', onZoneClick)}
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
        {...zoneA11y('left-hand', onZoneClick)}
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
        {...zoneA11y('right-hand', onZoneClick)}
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
        {...zoneA11y('stomach', onZoneClick)}
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
        {...zoneA11y('left-thigh', onZoneClick)}
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
        {...zoneA11y('right-thigh', onZoneClick)}
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
        {...zoneA11y('left-calf', onZoneClick)}
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
        {...zoneA11y('right-calf', onZoneClick)}
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
        {...zoneA11y('left-foot', onZoneClick)}
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
        {...zoneA11y('right-foot', onZoneClick)}
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
})
