import { useState, useEffect, useMemo, useRef, useCallback, memo } from 'react'
import { useScrollLock } from '../hooks/useScrollLock'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, X, Frame, Shirt, Footprints, Watch, Trash2, Search } from 'lucide-react'
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import PageHeader from '../components/PageHeader'
import { useShop } from '../hooks/useShop'
import { useOrders } from '../hooks/useOrders'
import { useRequireAuth } from '../hooks/useRequireAuth'
import type { ShopItem } from '../types'

type Category = ShopItem['category'] | ''
type CartLine = { item: ShopItem; size: string; color: string; qty: number }

const CATEGORY_TABS: { label: string; value: Category; icon: typeof Frame }[] = [
  { label: 'Todos', value: '', icon: ShoppingCart },
  { label: 'Cuadros', value: 'cuadros', icon: Frame },
  { label: 'Ropa', value: 'ropa', icon: Shirt },
  { label: 'Zapatos', value: 'zapatos', icon: Footprints },
  { label: 'Accesorios', value: 'accesorios', icon: Watch },
]

const CATEGORY_LABELS: Record<ShopItem['category'], string> = {
  cuadros: 'Cuadro',
  ropa: 'Ropa',
  zapatos: 'Zapatos',
  accesorios: 'Accesorio',
}

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

const ShopProductCard = memo(function ShopProductCard({ item, onClick }: { item: ShopItem; onClick: (item: ShopItem) => void }) {
  return (
    <motion.article
      variants={cardVariants}
      layout
      role="button"
      tabIndex={0}
      onClick={() => onClick(item)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(item) } }}
      aria-label={`${item.title} — €${item.price}`}
      className={`cursor-pointer group ${!item.in_stock ? 'opacity-50' : ''}`}
    >
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/5 hover:border-gold/20 transition-all">
        <img
          src={item.image_url}
          alt={item.title}
          loading="lazy"
          decoding="async"
          className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
        <div className="absolute top-2.5 left-2.5">
          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-medium uppercase tracking-wider ${CATEGORY_COLORS[item.category]}`}>
            {CATEGORY_LABELS[item.category]}
          </span>
        </div>
        {!item.in_stock && (
          <div className="absolute top-2.5 right-2.5">
            <span className="px-2 py-0.5 rounded-lg bg-red-500/20 text-red-400 text-[9px] font-medium uppercase tracking-wider">
              Agotado
            </span>
          </div>
        )}
        {item.in_stock && item.sizes && (
          <div className="absolute top-10 right-2.5">
            <span className="px-1.5 py-0.5 rounded-md bg-ink/70 backdrop-blur-sm text-[9px] text-cream-dark">
              {item.sizes.length} tallas
            </span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3">
          <h3 className="font-serif text-cream text-xs sm:text-sm font-medium line-clamp-2 leading-snug mb-0.5">
            {item.title}
          </h3>
          <span className="text-gold font-semibold text-sm sm:text-base">€{item.price}</span>
        </div>
      </div>
    </motion.article>
  )
})

export default function Shop() {
  const { items: shopItems, loading, error: shopError } = useShop()
  const { create: createOrder } = useOrders()
  const { user, requireAuth, authPrompt } = useRequireAuth()
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
    const q = query(collection(db, 'stock_notifications'), where('user_id', '==', user.uid))
    getDocs(q).then(snap => {
      setNotifiedItems(new Set(snap.docs.map(d => d.data().item_id as string)))
    }).catch((e) => { console.warn('Error cargando preferencias de stock:', e) })
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
      setNotifyError('No se pudo registrar la notificación')
    } finally {
      setNotifyLoading(false)
    }
  }

  const handleCheckoutSubmit = async () => {
    if (!requireAuth('/shop') || checkoutLoading) return
    if (!checkoutForm.name.trim() || !checkoutForm.email.trim()) {
      setCheckoutError('Completa todos los campos obligatorios')
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
      <div className="min-h-dvh pb-6 flex items-center justify-center">
        <p className="text-subtle text-sm">Cargando...</p>
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
        title="Tienda"
        subtitle="Arte para llevar"
        action={
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCart((s) => !s)}
              aria-label="Carrito"
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
            placeholder="Buscar productos..."
            aria-label="Buscar productos"
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
              {categoryFilter === 'cuadros' && 'Obras de arte originales y ediciones limitadas para decorar tu espacio.'}
              {categoryFilter === 'ropa' && 'Prendas exclusivas con diseños de la artista. Algodón orgánico y piezas únicas.'}
              {categoryFilter === 'zapatos' && 'Calzado personalizado y pintado a mano. Cada par es una obra de arte.'}
              {categoryFilter === 'accesorios' && 'Complementos únicos: joyería, bolsos, pins y más con diseños exclusivos.'}
            </p>
          </div>
        </motion.div>
      )}

      {/* Product grid */}
      <motion.div
        key={categoryFilter}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 px-5 max-w-6xl mx-auto w-full"
      >
        {filteredItems.map((item) => (
          <ShopProductCard key={item.id} item={item} onClick={openDetail} />
        ))}
      </motion.div>

      {filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-5">
          <p className="text-subtle text-sm">No hay productos en esta categoría</p>
        </div>
      )}

      {/* Cart drawer */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeCartDrawer}
              className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm"
            />
            <motion.div
              ref={cartPanelRef}
              tabIndex={-1}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              role="dialog"
              aria-modal="true"
              aria-label="Carrito de compras"
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[90dvh] bg-ink-light rounded-t-3xl overflow-hidden border-t border-white/10 shadow-2xl flex flex-col focus:outline-none"
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-white/10" />
              </div>
              <div className="flex-1 overflow-y-auto p-5 pb-[max(2rem,env(safe-area-inset-bottom))]">
                <h3 className="font-serif text-cream text-lg mb-4">Carrito</h3>
                {checkoutStep === 'success' ? (
                  <div className="py-8 text-center">
                    <p className="text-gold font-medium mb-2">¡Pedido confirmado!</p>
                    <p className="text-cream-dark text-sm">Te contactaremos pronto.</p>
                    <button
                      type="button"
                      onClick={closeCartDrawer}
                      className="mt-6 px-6 py-2.5 rounded-xl bg-gold text-ink font-medium text-sm hover:bg-gold-light transition-colors"
                    >
                      Cerrar
                    </button>
                  </div>
                ) : checkoutStep === 'form' ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Nombre"
                      aria-label="Nombre"
                      value={checkoutForm.name}
                      onChange={(e) => setCheckoutForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-ink border border-white/10 text-cream placeholder:text-subtle text-sm"
                    />
                    <input
                      type="email"
                      placeholder="Correo electrónico"
                      aria-label="Correo electrónico"
                      value={checkoutForm.email}
                      onChange={(e) => setCheckoutForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-ink border border-white/10 text-cream placeholder:text-subtle text-sm"
                    />
                    <input
                      type="tel"
                      placeholder="Teléfono"
                      aria-label="Teléfono"
                      value={checkoutForm.phone}
                      onChange={(e) => setCheckoutForm((f) => ({ ...f, phone: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-ink border border-white/10 text-cream placeholder:text-subtle text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Dirección"
                      aria-label="Dirección"
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
                        Volver
                      </button>
                      <button
                        type="button"
                        onClick={handleCheckoutSubmit}
                        disabled={checkoutLoading}
                        className="flex-1 py-3 rounded-xl bg-gold text-ink font-medium text-sm hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {checkoutLoading ? 'Procesando...' : 'Confirmar Pedido'}
                      </button>
                    </div>
                  </div>
                ) : cart.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-subtle text-sm">Tu carrito está vacío</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {cart.map((line, i) => (
                        <div
                          key={`${line.item.id}-${line.size}-${line.color}-${i}`}
                          className="flex gap-3 p-3 rounded-xl bg-ink border border-white/5"
                        >
                          <img
                            src={line.item.image_url}
                            alt={line.item.title}
                            loading="lazy"
                            decoding="async"
                            className="w-14 h-14 rounded-lg object-cover shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-cream text-sm line-clamp-2">{line.item.title}</p>
                            <p className="text-subtle text-xs mt-0.5">
                              {line.size && `Talla ${line.size}`}
                              {line.size && line.color && ' · '}
                              {line.color}
                            </p>
                            <p className="text-gold text-sm font-medium mt-1">€{line.item.price} × {line.qty}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(i)}
                            aria-label="Eliminar del carrito"
                            className="p-2 rounded-lg text-subtle hover:text-rose hover:bg-rose/10 transition-colors shrink-0"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <p className="flex justify-between text-cream font-medium">
                        Total <span className="text-gold">€{cart.reduce((sum, c) => sum + c.item.price * c.qty, 0)}</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => setCheckoutStep('form')}
                        className="w-full mt-4 py-3.5 rounded-2xl bg-gold text-ink font-medium text-sm hover:bg-gold-light active:scale-[0.98] shadow-lg shadow-gold/20"
                      >
                        Finalizar Compra
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Detail modal */}
      <AnimatePresence>
        {selectedItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelectedItem(null); setSelectedSize(''); setSelectedColor('') }}
              className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm"
            />
            <motion.div
              ref={detailPanelRef}
              tabIndex={-1}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              role="dialog"
              aria-modal="true"
              aria-label="Detalle del producto"
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[90dvh] bg-ink-light rounded-t-3xl overflow-hidden border-t border-white/10 shadow-2xl flex flex-col focus:outline-none"
            >
              {/* Close handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-white/10" />
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* Image — bounded frame so the sheet is not one giant square */}
                <div className="px-5 pt-1 pb-3 flex flex-col items-center">
                  <div className="relative w-full max-w-[300px] h-[min(32vh,240px)] sm:h-[min(34vh,280px)] rounded-2xl overflow-hidden border border-white/10 bg-ink ring-1 ring-white/5 shadow-inner flex items-center justify-center p-2 sm:p-3">
                    <img
                      src={selectedItem.image_url}
                      alt={selectedItem.title}
                      loading="lazy"
                      decoding="async"
                      className="max-w-full max-h-full w-auto h-auto object-contain object-center rounded-lg"
                    />
                    <div className="absolute top-2.5 left-2.5 z-[1]">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-medium uppercase tracking-wider shadow-sm ${CATEGORY_COLORS[selectedItem.category]}`}>
                        {CATEGORY_LABELS[selectedItem.category]}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSelectedItem(null); setSelectedSize(''); setSelectedColor('') }}
                      aria-label="Cerrar detalle de producto"
                      className="absolute top-2.5 right-2.5 z-[1] w-9 h-9 rounded-full bg-ink/85 backdrop-blur-sm border border-white/10 flex items-center justify-center text-cream hover:bg-ink transition-colors"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>

                <div className="px-5 pb-5 space-y-4">
                  {/* Title & price */}
                  <div>
                    <h2 className="font-serif text-xl text-cream mb-1">{selectedItem.title}</h2>
                    <span className="text-gold font-serif text-2xl">€{selectedItem.price}</span>
                  </div>

                  {/* Description */}
                  <p className="text-cream-dark text-sm leading-relaxed">{selectedItem.description}</p>

                  {/* Size selector */}
                  {selectedItem.sizes && selectedItem.sizes.length > 0 && (
                    <div>
                      <p className="text-xs text-subtle mb-2 font-medium">Talla</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.sizes.map((size) => (
                          <button
                            type="button"
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            aria-pressed={selectedSize === size}
                            className={`min-w-[42px] h-10 px-3 rounded-xl border text-sm font-medium transition-all ${
                              selectedSize === size
                                ? 'border-gold bg-gold/10 text-gold'
                                : 'border-white/10 bg-ink text-cream hover:border-white/20'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Color selector */}
                  {selectedItem.colors && selectedItem.colors.length > 0 && (
                    <div>
                      <p className="text-xs text-subtle mb-2 font-medium">Color: <span className="text-cream">{selectedColor}</span></p>
                      <div className="flex gap-2">
                        {selectedItem.colors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setSelectedColor(color)}
                            aria-label={color}
                            aria-pressed={selectedColor === color}
                            className={`px-4 py-2 rounded-xl border text-xs font-medium transition-all ${
                              selectedColor === color
                                ? 'border-gold bg-gold/10 text-gold'
                                : 'border-white/10 bg-ink text-cream-dark hover:border-white/20'
                            }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {!selectedItem.in_stock && (
                    <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 space-y-2">
                      {notifiedItems.has(selectedItem.id) ? (
                        <p className="text-gold text-xs font-medium">Te avisaremos cuando esté disponible.</p>
                      ) : (
                        <>
                          <p className="text-red-400 text-xs font-medium">Este producto está agotado. Déjanos tu correo y te avisamos cuando vuelva.</p>
                          <div className="flex gap-2 mt-2">
                            <input
                              type="email"
                              placeholder="tu@email.com"
                              aria-label="Correo electrónico para notificación de stock"
                              value={notifyEmail}
                              onChange={(e) => setNotifyEmail(e.target.value)}
                              className="flex-1 px-3 py-2 rounded-lg bg-ink border border-white/10 text-cream placeholder:text-subtle text-xs"
                            />
                            <button
                              type="button"
                              onClick={handleNotifyStock}
                              disabled={!notifyEmail.trim() || notifyLoading}
                              className="px-4 py-2 rounded-lg bg-gold text-ink text-xs font-medium hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {notifyLoading ? 'Enviando...' : 'Notificarme'}
                            </button>
                          </div>
                          {notifyError && <p className="text-red-400 text-xs mt-1">{notifyError}</p>}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="p-5 pt-3 pb-[max(2rem,env(safe-area-inset-bottom))] border-t border-white/5">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!selectedItem.in_stock}
                  className={`w-full py-3.5 rounded-2xl font-medium transition-all text-sm ${
                    selectedItem.in_stock
                      ? 'bg-gold text-ink hover:bg-gold-light active:scale-[0.98] shadow-lg shadow-gold/20'
                      : 'bg-ink-medium text-subtle cursor-not-allowed'
                  }`}
                >
                  {selectedItem.in_stock ? `Añadir al Carrito · €${selectedItem.price}` : 'Agotado'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
