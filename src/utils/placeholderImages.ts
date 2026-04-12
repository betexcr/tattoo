/** Stable example images when Firestore items have no URL or the URL fails to load. */

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0
  return Math.abs(h)
}

/** Tattoo / studio work — for portfolio & “Trabajos recientes”. */
const PORTFOLIO_PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1611501275019-9b5cda994e1d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1590246814883-57c511a3a89b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1565053390228-cec9b503f2c1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1570172619643-d17603f6e235?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1598371689637-3e2776b72233?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1503342394128-c104d54ba01e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1621619856624-42fd193a0661?auto=format&fit=crop&w=800&q=80',
]

/** Art, apparel, objects — for tienda / product cards. */
const SHOP_PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1549887534-1541e9326642?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1523381210438-271e8be1f52b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1558171813-4c088753af8f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
]

export function pickPortfolioPlaceholder(id: string, salt = 0): string {
  const i = (hashString(`pf-${id}`) + salt) % PORTFOLIO_PLACEHOLDERS.length
  return PORTFOLIO_PLACEHOLDERS[i]
}

export function pickShopPlaceholder(id: string, salt = 0): string {
  const i = (hashString(`shop-${id}`) + salt) % SHOP_PLACEHOLDERS.length
  return SHOP_PLACEHOLDERS[i]
}

export function resolvePortfolioImageUrl(id: string, imageUrl?: string | null): string {
  const t = imageUrl?.trim()
  if (t) return t
  return pickPortfolioPlaceholder(id)
}

export function resolveShopImageUrl(id: string, imageUrl?: string | null): string {
  const t = imageUrl?.trim()
  if (t) return t
  return pickShopPlaceholder(id)
}
