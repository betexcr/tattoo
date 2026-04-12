type Variant = 'default' | 'hero'

interface Props {
  className?: string
  /** `hero` = fuller flash-style pattern for the main landing hero */
  variant?: Variant
}

/** Tattoo-flash style ornaments for dark UI backgrounds (hero / cards). */
export default function TattooFlashBackdrop({ className = '', variant = 'default' }: Props) {
  const isHero = variant === 'hero'

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {/* Halftone / stipple — stronger on hero */}
      <div
        className={`absolute inset-0 ${isHero ? 'opacity-[0.07]' : 'opacity-[0.04]'}`}
        style={{
          backgroundImage: `radial-gradient(circle at center, rgba(201, 149, 107, 0.45) 0.5px, transparent 0.6px)`,
          backgroundSize: isHero ? '10px 10px' : '14px 14px',
        }}
      />

      {/* Diagonal hatch */}
      <div
        className={`absolute inset-0 ${isHero ? 'opacity-[0.06]' : 'opacity-[0.04]'}`}
        style={{
          backgroundImage: `repeating-linear-gradient(
            -18deg,
            transparent,
            transparent 11px,
            rgba(212, 175, 55, 0.35) 11px,
            rgba(212, 175, 55, 0.35) 12px
          )`,
        }}
      />

      {/* Large mandala / compass — hero right */}
      {isHero && (
        <svg
          className="absolute -right-[8%] top-1/2 h-[min(95vw,560px)] w-[min(95vw,560px)] -translate-y-1/2 text-gold opacity-[0.11]"
          viewBox="0 0 400 400"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.65"
          strokeLinecap="round"
        >
          <circle cx="200" cy="200" r="168" />
          <circle cx="200" cy="200" r="142" />
          <circle cx="200" cy="200" r="118" />
          <circle cx="200" cy="200" r="88" />
          <path d="M200 32v336M32 200h336M200 32l118 118M200 32L82 150M200 368l118-118M200 368L82 250M32 200l118 118M32 200l118-118M368 200l-118 118M368 200l-118-118" />
          {Array.from({ length: 16 }).map((_, i) => {
            const a = (i * Math.PI) / 8
            const x1 = 200 + Math.cos(a) * 40
            const y1 = 200 + Math.sin(a) * 40
            const x2 = 200 + Math.cos(a) * 165
            const y2 = 200 + Math.sin(a) * 165
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
          })}
        </svg>
      )}

      {/* Classic rose + banner — shared, scaled by variant */}
      <svg
        className={`absolute ${isHero ? '-right-[5%] top-[8%] h-[min(70%,440px)] opacity-[0.14]' : '-right-[10%] top-1/2 h-[min(120%,520px)] -translate-y-1/2 opacity-[0.09]'}`}
        viewBox="0 0 200 280"
        fill="none"
        stroke="currentColor"
        strokeWidth={isHero ? 0.75 : 0.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: 'auto' }}
      >
        <path d="M100 8c-12 18-8 38 4 52 10-14 8-36-4-52z" />
        <path d="M100 60c-28 8-44 32-40 58 4 22 22 38 40 48 18-10 36-26 40-48 4-26-12-50-40-58z" />
        <path d="M100 118c-6 28-2 56 8 78M100 118c6 28 2 56-8 78" />
        <path d="M72 168c-16 8-24 24-20 44 4 18 20 30 38 32M128 168c16 8 24 24 20 44-4 18-20 30-38 32" />
        <circle cx="100" cy="248" r="3" fill="currentColor" stroke="none" />
        <path d="M100 252v20M88 262h24M40 200l-12 8M160 200l12 8" />
        {isHero && (
          <>
            <path d="M28 88c20-8 40-4 52 8M172 88c-20-8-40-4-52 8" />
            <path d="M100 20h40c8 0 12 6 10 14l-4 14h-92l-4-14c-2-8 2-14 10-14h40z" />
          </>
        )}
      </svg>

      {/* Secondary dagger + heart — left, hero only */}
      {isHero && (
        <svg
          className="absolute -left-[6%] bottom-[5%] h-[min(55%,300px)] w-auto text-cream opacity-[0.09]"
          viewBox="0 0 180 220"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeLinecap="round"
        >
          <path d="M90 12 L90 52 M72 32h36M90 52c-22 14-36 38-32 66 3 22 16 40 32 50 16-10 29-28 32-50 4-28-10-52-32-66z" />
          <path d="M90 120 L90 198 M58 152c10-8 26-8 36 0M90 168l-16 26M90 168l16 26" />
          <path d="M48 40l6 10M126 40l-6 10M90 24v8" />
        </svg>
      )}

      {/* Nautical stars — corners, hero */}
      {isHero && (
        <>
          <svg className="absolute top-6 right-[28%] w-10 h-10 text-gold opacity-[0.12]" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="0.9">
            <path d="M16 2l3.5 10h10l-8 6 3 10-8.5-6-8.5 6 3-10-8-6h10z" />
          </svg>
          <svg className="absolute bottom-24 left-[12%] w-8 h-8 text-gold opacity-[0.1]" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="0.9">
            <path d="M16 2l3.5 10h10l-8 6 3 10-8.5-6-8.5 6 3-10-8-6h10z" />
          </svg>
        </>
      )}

      {!isHero && (
        <svg
          className="absolute -left-[5%] bottom-0 h-[min(70%,320px)] w-auto text-cream opacity-[0.06]"
          viewBox="0 0 180 200"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.85"
          strokeLinecap="round"
        >
          <path d="M90 12 L90 48 M72 30h36M90 48c-24 12-38 36-34 62 3 20 18 36 34 44 16-8 31-24 34-44 4-26-10-50-34-62z" />
          <path d="M90 110 L90 188 M62 140c8-6 20-6 28 0M90 154l-14 22M90 154l14 22" />
          <circle cx="90" cy="32" r="2.5" fill="currentColor" stroke="none" />
        </svg>
      )}
    </div>
  )
}
