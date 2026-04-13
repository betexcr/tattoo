import { useState, useEffect, useMemo, useRef, useCallback, memo } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useScrollLock } from '../hooks/useScrollLock'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, X, Frame, Shirt, Footprints, Watch, Trash2, Search, ChevronLeft } from 'lucide-react'
import { collection, addDoc, query, where, getDocs, limit } from 'firebase/firestore'
import { db } from '../lib/firebase'
import PageHeader from '../components/PageHeader'
import ImageWithPlaceholder from '../components/ImageWithPlaceholder'
import { useShop } from '../hooks/useShop'
import { useOrders } from '../hooks/useOrders'
import { useRequireAuth } from '../hooks/useRequireAuth'
import type { ShopItem } from '../types'
import { tf } from '../utils/translate'

type Category = ShopItem['category'] | ''
type CartLine = { item: ShopItem; size: string; color: string; qty: number }

const CATEGORY_ICONS: { value: Category; icon: typeof Frame }[] = [
  { value: '', icon: ShoppingCart },
  { value: 'cuadros', icon: Frame },
  { value: 'ropa', icon: Shirt },
  { value: 'zapatos', icon: Footprints },
  { value: 'accesorios', icon: Watch },
]

const CATEGORY_COLORS: Record<ShopItem['category'], string> = {
  cuadros: 'bg-gold/15 text-gold',
  ropa: 'bg-rose/15 text-rose',
  zapatos: 'bg-emerald-500/15 text-emerald-400',
  accesorios: 'bg-sky-500/15 text-sky-400',
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.02 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
}

const ShopProductCard = memo(function ShopProductCard({ item, lang, onClick }: { item: ShopItem; lang: string; onClick: (item: ShopItem) => void }) {
  const { t } = useTranslation('shop')
  const title = tf(item._translations, lang, 'title', item.title)
  return (
    <motion.article
      variants={cardVariants}
      layout
      role="button"
      tabIndex={0}
      onClick={() => onClick(item)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(item) } }}
      aria-label={`${title} — €${item.price}`}
      className={`cursor-pointer group ${!item.in_stock ? 'opacity-50' : ''}`}
    >
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/5 hover:border-gold/20 transition-all">
        <ImageWithPlaceholder
          id={item.id}
          src={item.image_url}
          variant="shop"
          alt={title}
          className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
        <div className="absolute top-2.5 left-2.5">
          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-medium uppercase tracking-wider ${CATEGORY_COLORS[item.category]}`}>
            {t(`categoryLabels.${item.category}`)}
          </span>
        </div>
        {!item.in_stock && (
          <div className="absolute top-2.5 right-2.5">
            <span className="px-2 py-0.5 rounded-lg bg-red-500/20 text-red-400 text-[9px] font-medium uppercase tracking-wider">
              {t('outOfStock')}
            </span>
          </div>
        )}
        {item.in_stock && item.sizes && (
          <div className="absolute top-10 right-2.5">
            <span className="px-1.5 py-0.5 rounded-md bg-ink/70 backdrop-blur-sm text-[9px] text-cream-dark">
              {t('sizesCount', { count: item.sizes.length })}
            </span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3">
          <h3 className="font-serif text-cream text-xs sm:text-sm font-medium line-clamp-2 leading-snug mb-0.5">
            {title}
          </h3>
          <span className="text-gold font-semibold text-sm sm:text-base">€{item.price}</span>
        </div>
      </div>
    </motion.article>
  )
})

export default function Shop() {
  const { t, i18n } = useTranslation('shop')
  const { t: tc } = useTranslation()
  const { items: shopItems, loading, error: shopError } = useShop()
  const { create: createOrder } = useOrders(undefined, { skip: true })
  const { user, requireAuth, authPrompt } = useRequireAuth()

  const CATEGORY_TABS = useMemo(() => CATEGORY_ICONS.map(({ value, icon }) => ({
    label: value === '' ? t('categories.all') : t(`categories.${value}`),
    value,
    icon,
  })), [t])
  const [categoryFilter, setCategoryFilter] = useState<Category>('')
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null)
  const [cart, setCart] = useState<CartLine[]>([])
  const [showCart, setShowCart] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [notifyEmail, setNotifyEmail] = useState('')
  const [notifyError, setNotifyError] = useState<string | null>(null)
  const [notifyLoading, setNotifyLoading] = useState(false)
  const [notifiedItems, setNotifiedItems] = useState<Set<string>>(new Set())
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'form' | 'success'>('cart')
  const [checkoutForm, setCheckoutForm] = useState({ name: '', email: '', phone: '', address: '' })
  const [shopSearch, setShopSearch] = useState('')
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const cartPanelRef = useRef<HTMLDivElement>(null)
  const detailPanelRef = useRef<HTMLDivElement>(null)
  const closeCart = useCallback(() => { setShowCart(false); setCheckoutStep('cart') }, [])
  const closeDetail = useCallback(() => { setSelectedItem(null); setSelectedSize(''); setSelectedColor('') }, [])
  useScrollLock(showCart || selectedItem !== null)

  useFocusTrap(cartPanelRef, showCart, closeCart)
  useFocusTrap(detailPanelRef, selectedItem !== null, closeDetail)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    const q = query(collection(db, 'stock_notifications'), where('user_id', '==', user.uid), limit(100))
    getDocs(q).then(snap => {
      if (cancelled) return
      setNotifiedItems(new Set(snap.docs.map(d => d.data().item_id as string)))
    }).catch((e) => { console.warn('Error cargando preferencias de stock:', e) })
    return () => { cancelled = true }
  }, [user])

  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0)

  const filteredItems = useMemo(() => {
    let items = categoryFilter === '' ? shopItems : shopItems.filter(item => item.category === categoryFilter)
    if (shopSearch.trim()) {
      const q = shopSearch.toLowerCase()
      items = items.filter(item => item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q))
    }
    return items
  }, [shopItems, categoryFilter, shopSearch])

  const categoryCount = (cat: Category) =>
    cat === '' ? shopItems.length : shopItems.filter((i) => i.category === cat).length

  const handleAddToCart = () => {
    if (!selectedItem?.in_stock) return
    const size = selectedSize || (selectedItem.sizes?.[0] ?? '')
    const color = selectedColor || (selectedItem.colors?.[0] ?? '')
    setCart((prev) => {
      const idx = prev.findIndex(
        (c) => c.item.id === selectedItem.id && c.size === size && c.color === color
      )
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 }
        return next
      }
      return [...prev, { item: selectedItem, size, color, qty: 1 }]
    })
    setSelectedItem(null)
    setSelectedSize('')
    setSelectedColor('')
    setShowCart(true)
  }

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index))
  }

  const handleNotifyStock = async () => {
    if (!selectedItem || !notifyEmail.trim() || notifyLoading) return
    if (!user) { requireAuth('/shop'); return }
    setNotifyError(null)
    setNotifyLoading(true)
    try {
      await addDoc(collection(db, 'stock_notifications'), {
        item_id: selectedItem.id,
        email: notifyEmail.trim(),
        user_id: user?.uid ?? null,
        created_at: new Date().toISOString(),
      })
      setNotifiedItems(prev => new Set(prev).add(selectedItem.id))
      setNotifyEmail('')
    } catch {
      setNotifyError(t('notifyError'))
    } finally {
      setNotifyLoading(false)
    }
  }

  const handleCheckoutSubmit = async () => {
    if (!requireAuth('/shop') || checkoutLoading) return
    if (!checkoutForm.name.trim() || !checkoutForm.email.trim()) {
      setCheckoutError(tc('errors.requiredFields'))
      return
    }
    setCheckoutError(null)
    setCheckoutLoading(true)
    try {
      const { error } = await createOrder({
        client_name: checkoutForm.name,
        client_email: checkoutForm.email,
        client_phone: checkoutForm.phone,
        client_address: checkoutForm.address,
        total: cart.reduce((sum, c) => sum + c.item.price * c.qty, 0),
        items: cart.map(c => ({
          shop_item_id: c.item.id,
          quantity: c.qty,
          size: c.size,
          color: c.color,
          price: c.item.price,
        })),
      })
      if (error) {
        setCheckoutError(error)
        return
      }
      setCheckoutStep('success')
      setCart([])
      setCheckoutForm({ name: '', email: '', phone: '', address: '' })
    } finally {
      setCheckoutLoading(false)
    }
  }

  const closeCartDrawer = () => {
    setShowCart(false)
    setCheckoutStep('cart')
  }

  const openDetail = useCallback((item: ShopItem) => {
    setSelectedItem(item)
    setSelectedSize(item.sizes?.[0] ?? '')
    setSelectedColor(item.colors?.[0] ?? '')
  }, [])

  if (loading) {
    return (
      <div className="min-h-dvh pb-6">
        <div className="h-20 bg-ink-light/50 animate-pulse" />
        <div className="grid grid-cols-2 gap-3 px-5 pt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] rounded-2xl bg-ink-medium/40 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh pb-6">
      {authPrompt}
      {shopError && (
        <div className="mx-5 mt-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm">{shopError}</div>
      )}
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        action={
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCart((s) => !s)}
              aria-label={t('cart')}
              aria-expanded={showCart}
              className="w-11 h-11 rounded-full bg-ink-medium flex items-center justify-center text-cream hover:bg-ink-medium/80 transition-colors"
            >
              <ShoppingCart size={18} />
            </button>
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-gold text-ink text-[10px] font-bold flex items-center justify-center px-1"
              >
                {cartCount}
              </motion.span>
            )}
          </div>
        }
      />

      {/* Search */}
      <div className="px-5 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
          <input
            type="text"
            value={shopSearch}
            onChange={e => setShopSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            aria-label={t('searchAria')}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-ink-light border border-white/5 text-cream placeholder:text-subtle text-sm focus:outline-none focus:border-gold/40 transition-colors"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="px-5 pt-1 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORY_TABS.map(({ label, value, icon: Icon }) => (
            <button
              key={value || 'all'}
              type="button"
              onClick={() => setCategoryFilter(value)}
              aria-pressed={categoryFilter === value}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                categoryFilter === value
                  ? 'bg-gold text-ink shadow-lg shadow-gold/20'
                  : 'bg-ink-light text-cream-dark border border-white/5 hover:border-gold/20'
              }`}
            >
              <Icon size={15} strokeWidth={1.5} />
              {label}
              <span className={`text-[10px] ml-0.5 ${categoryFilter === value ? 'text-ink/60' : 'text-subtle'}`}>
                {categoryCount(value)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Category banner */}
      {categoryFilter && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-5 pb-4"
        >
          <div className="p-4 rounded-2xl bg-ink-light border border-white/5">
            <h3 className="font-serif text-cream text-base mb-1">
              {CATEGORY_TABS.find((t) => t.value === categoryFilter)?.label}
            </h3>
            <p className="text-subtle text-xs">
              {t(`categoryDescriptions.${categoryFilter}`)}
            </p>
          </div>
        </motion.div>
      )}

      {/* Product grid — auto-fill minmax so columns use full width (same band as search), not fixed skinny cols */}
      <motion.div
        key={categoryFilter}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid w-full gap-3 sm:gap-4 px-5 [grid-template-columns:repeat(auto-fill,minmax(min(100%,158px),1fr))]"
      >
        {filteredItems.map((item) => (
          <ShopProductCard key={item.id} item={item} lang={i18n.language} onClick={openDetail} />
        ))}
      </motion.div>

      {filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-5">
          <p className="text-subtle text-sm">{t('noProducts')}</p>
        </div>
      )}

      {/* Cart + product modals: portal to body so they stack above Layout bottom nav (z-50) */}
      {createPortal(
        <>
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeCartDrawer}
              className="fixed inset-0 z-[100] bg-ink/80 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none sm:px-4 sm:pb-4">
            <motion.div
              ref={cartPanelRef}
              tabIndex={-1}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              role="dialog"
              aria-modal="true"
              aria-label={t('cartTitle')}
              className="pointer-events-auto flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border-t border-white/10 bg-ink-light shadow-2xl focus:outline-none"
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-white/10" />
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain p-5 pb-[max(2rem,env(safe-area-inset-bottom))]">
                <h3 className="font-serif text-cream text-lg mb-4">{t('cart')}</h3>
                {checkoutStep === 'success' ? (
                  <div className="py-8 text-center">
                    <p className="text-gold font-medium mb-2">{t('orderConfirmed')}</p>
                    <p className="text-cream-dark text-sm">{t('contactSoon')}</p>
                    <button
                      type="button"
                      onClick={closeCartDrawer}
                      className="mt-6 px-6 py-2.5 rounded-xl bg-gold text-ink font-medium text-sm hover:bg-gold-light transition-colors"
                    >
                      {tc('close')}
                    </button>
                  </div>
                ) : checkoutStep === 'form' ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder={t('checkoutForm.name')}
                      aria-label={t('checkoutForm.name')}
                      value={checkoutForm.name}
                      onChange={(e) => setCheckoutForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-ink border border-white/10 text-cream placeholder:text-subtle text-sm"
                    />
                    <input
                      type="email"
                      placeholder={t('checkoutForm.email')}
                      aria-label={t('checkoutForm.email')}
                      value={checkoutForm.email}
                      onChange={(e) => setCheckoutForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-ink border border-white/10 text-cream placeholder:text-subtle text-sm"
                    />
                    <input
                      type="tel"
                      placeholder={t('checkoutForm.phone')}
                      aria-label={t('checkoutForm.phone')}
                      value={checkoutForm.phone}
                      onChange={(e) => setCheckoutForm((f) => ({ ...f, phone: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-ink border border-white/10 text-cream placeholder:text-subtle text-sm"
                    />
                    <input
                      type="text"
                      placeholder={t('checkoutForm.address')}
                      aria-label={t('checkoutForm.address')}
                      value={checkoutForm.address}
                      onChange={(e) => setCheckoutForm((f) => ({ ...f, address: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-ink border border-white/10 text-cream placeholder:text-subtle text-sm"
                    />
                    {checkoutError && <p className="text-rose text-sm text-center mb-2">{checkoutError}</p>}
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setCheckoutStep('cart')}
                        className="flex-1 py-3 rounded-xl border border-white/20 text-cream text-sm font-medium"
                      >
                        {tc('back')}
                      </button>
                      <button
                        type="button"
                        onClick={handleCheckoutSubmit}
                        disabled={checkoutLoading}
                        className="flex-1 py-3 rounded-xl bg-gold text-ink font-medium text-sm hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {checkoutLoading ? t('processing') : t('confirmOrder')}
                      </button>
                    </div>
                  </div>
                ) : cart.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-subtle text-sm">{t('cartEmpty')}</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {cart.map((line, i) => (
                        <div
                          key={`${line.item.id}-${line.size}-${line.color}-${i}`}
                          className="flex gap-3 p-3 rounded-xl bg-ink border border-white/5"
                        >
                          <ImageWithPlaceholder
                            id={line.item.id}
                            src={line.item.image_url}
                            variant="shop"
                            alt={tf(line.item._translations, i18n.language, 'title', line.item.title)}
                            className="w-14 h-14 rounded-lg object-cover shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-cream text-sm line-clamp-2">{tf(line.item._translations, i18n.language, 'title', line.item.title)}</p>
                            <p className="text-subtle text-xs mt-0.5">
                              {line.size && t('size', { size: line.size })}
                              {line.size && line.color && ' · '}
                              {line.color}
                            </p>
                            <p className="text-gold text-sm font-medium mt-1">€{line.item.price} × {line.qty}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(i)}
                            aria-label={t('removeFromCart')}
                            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-subtle hover:text-rose hover:bg-rose/10 transition-colors shrink-0"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <p className="flex justify-between text-cream font-medium">
                        {t('total')} <span className="text-gold">€{cart.reduce((sum, c) => sum + c.item.price * c.qty, 0)}</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => setCheckoutStep('form')}
                        className="w-full mt-4 py-3.5 rounded-2xl bg-gold text-ink font-medium text-sm hover:bg-gold-light active:scale-[0.98] shadow-lg shadow-gold/20"
                      >
                        {t('checkout')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelectedItem(null); setSelectedSize(''); setSelectedColor('') }}
              className="fixed inset-0 z-[100] bg-ink/80 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-4 sm:p-6">
            <motion.div
              ref={detailPanelRef}
              tabIndex={-1}
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              role="dialog"
              aria-modal="true"
              aria-label={t('productDetail')}
              className="pointer-events-auto flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-light shadow-2xl focus:outline-none"
            >
              <div className="flex justify-center pt-2.5 pb-1 shrink-0">
                <div className="h-1 w-10 rounded-full bg-white/15" aria-hidden />
              </div>

              {/* Top bar — like reference app headers */}
              <div className="flex shrink-0 items-center justify-between px-4 pb-2 pt-1 sm:px-5">
                <button
                  type="button"
                  onClick={() => { setSelectedItem(null); setSelectedSize(''); setSelectedColor('') }}
                  aria-label={t('backToShop')}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-ink text-cream transition-colors hover:border-gold/30 hover:bg-ink-medium"
                >
                  <ChevronLeft size={20} strokeWidth={1.5} />
                </button>
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-subtle">{t('product')}</span>
                <button
                  type="button"
                  onClick={() => { setSelectedItem(null); setSelectedSize(''); setSelectedColor('') }}
                  aria-label={tc('close')}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-ink text-cream transition-colors hover:border-gold/30"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                {/* Image “stage” — rounded tray + contain, similar to reference PDPs */}
                <div className="px-4 pb-2 sm:px-5">
                  <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-ink-medium/90 p-5 sm:p-6">
                    <ImageWithPlaceholder
                      id={selectedItem.id}
                      src={selectedItem.image_url}
                      variant="shop"
                      alt={tf(selectedItem._translations, i18n.language, 'title', selectedItem.title)}
                      className="max-h-[min(36dvh,320px)] w-full object-contain object-center drop-shadow-lg"
                    />
                  </div>
                  <div className="mt-3 flex justify-center" aria-hidden>
                    <span className="h-1 w-8 rounded-full bg-gold/70" />
                  </div>
                </div>

                <div className="space-y-5 px-4 pb-6 pt-2 sm:px-5">
                  <div>
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gold/90">
                      {t(`categoryLabels.${selectedItem.category}`)}
                    </p>
                    <h2 className="font-serif text-[1.35rem] leading-snug tracking-tight text-cream sm:text-2xl">
                      {tf(selectedItem._translations, i18n.language, 'title', selectedItem.title)}
                    </h2>
                    <p className="mt-3 font-sans text-3xl font-semibold tracking-tight text-gold sm:text-[2rem]">
                      €{selectedItem.price}
                    </p>
                  </div>

                  <p className="text-sm leading-relaxed text-cream-dark/95">{tf(selectedItem._translations, i18n.language, 'description', selectedItem.description)}</p>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-3 py-1.5 text-[11px] font-medium ${
                        selectedItem.in_stock
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          : 'border-red-500/25 bg-red-500/10 text-red-400'
                      }`}
                    >
                      {selectedItem.in_stock ? t('inStock') : t('outOfStock')}
                    </span>
                    <span className="rounded-full border border-white/10 bg-ink px-3 py-1.5 text-[11px] text-cream-dark">
                      {t('shippingNote')}
                    </span>
                  </div>

                  {selectedItem.sizes && selectedItem.sizes.length > 0 && (
                    <div>
                      <div className="mb-2.5 flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wide text-cream">{t('sizeLabel')}</p>
                        <span className="text-[10px] text-subtle">{t('chooseOne')}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.sizes.map((size) => (
                          <button
                            type="button"
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            aria-pressed={selectedSize === size}
                            className={`min-h-[44px] min-w-[48px] rounded-xl border px-4 text-sm font-medium transition-all ${
                              selectedSize === size
                                ? 'border-gold bg-gold/15 text-gold shadow-sm shadow-gold/10'
                                : 'border-white/12 bg-ink text-cream hover:border-white/25'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedItem.colors && selectedItem.colors.length > 0 && (
                    <div>
                      <div className="mb-2.5 flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wide text-cream">{t('color')}</p>
                        <span className="text-[11px] text-cream-dark">{selectedColor || '—'}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.colors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setSelectedColor(color)}
                            aria-label={color}
                            aria-pressed={selectedColor === color}
                            className={`rounded-xl border px-4 py-2.5 text-xs font-medium transition-all ${
                              selectedColor === color
                                ? 'border-gold bg-gold/15 text-gold'
                                : 'border-white/12 bg-ink text-cream-dark hover:border-white/25'
                            }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {!selectedItem.in_stock && (
                    <div className="space-y-3 rounded-2xl border border-red-500/15 bg-red-500/[0.06] p-4">
                      {notifiedItems.has(selectedItem.id) ? (
                        <p className="text-sm font-medium text-gold">{t('notifyAvailable')}</p>
                      ) : (
                        <>
                          <p className="text-sm leading-snug text-red-400/95">
                            {t('outOfStockNotify')}
                          </p>
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <input
                              type="email"
                              placeholder="tu@email.com"
                              aria-label={t('stockEmailAria')}
                              value={notifyEmail}
                              onChange={(e) => setNotifyEmail(e.target.value)}
                              className="min-h-[44px] flex-1 rounded-xl border border-white/10 bg-ink px-3 text-sm text-cream placeholder:text-subtle"
                            />
                            <button
                              type="button"
                              onClick={handleNotifyStock}
                              disabled={!notifyEmail.trim() || notifyLoading}
                              className="min-h-[44px] shrink-0 rounded-xl bg-gold px-5 text-sm font-medium text-ink hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {notifyLoading ? tc('sending') : t('notifyMe')}
                            </button>
                          </div>
                          {notifyError && <p className="text-xs text-red-400">{notifyError}</p>}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Sticky-style bar — price + primary CTA like reference footers */}
              <div className="shrink-0 border-t border-white/10 bg-ink-light/95 px-4 py-3 backdrop-blur-md sm:px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-subtle">{t('price')}</p>
                    <p className="truncate font-semibold text-gold text-xl">€{selectedItem.price}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!selectedItem.in_stock}
                    className={`flex min-h-[48px] flex-[1.4] items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all ${
                      selectedItem.in_stock
                        ? 'bg-gold text-ink shadow-lg shadow-gold/25 hover:bg-gold-light active:scale-[0.99]'
                        : 'cursor-not-allowed bg-ink-medium text-subtle'
                    }`}
                  >
                    <ShoppingCart size={18} strokeWidth={1.75} />
                    {selectedItem.in_stock ? t('addToCart') : t('outOfStock')}
                  </button>
                </div>
              </div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
        </>,
        document.body,
      )}
    </div>
  )
}
