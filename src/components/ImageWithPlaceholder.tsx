import { useMemo, useState, useCallback } from 'react'
import {
  resolvePortfolioImageUrl,
  resolveShopImageUrl,
  pickPortfolioPlaceholder,
  pickShopPlaceholder,
} from '../utils/placeholderImages'

type Variant = 'shop' | 'portfolio'

interface Props {
  id: string
  src: string | undefined | null
  variant: Variant
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
  decoding?: 'async' | 'auto' | 'sync'
}

const MAX_FALLBACK_STEP = 7

/**
 * Uses curated placeholders when `src` is empty, and cycles placeholders when the image fails to load.
 */
export default function ImageWithPlaceholder({
  id,
  src,
  variant,
  alt,
  className,
  loading = 'lazy',
  decoding = 'async',
}: Props) {
  const primary = useMemo(
    () => (variant === 'shop' ? resolveShopImageUrl(id, src) : resolvePortfolioImageUrl(id, src)),
    [id, src, variant],
  )
  const [stage, setStage] = useState(0)

  const url = useMemo(() => {
    if (stage === 0) return primary
    return variant === 'shop' ? pickShopPlaceholder(id, stage) : pickPortfolioPlaceholder(id, stage)
  }, [stage, primary, id, variant])

  const onError = useCallback(() => {
    setStage((s) => (s < MAX_FALLBACK_STEP ? s + 1 : s))
  }, [])

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      onError={onError}
    />
  )
}
