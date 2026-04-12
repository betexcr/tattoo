import { memo } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { containerVariants, itemVariants } from './constants'
import type { ShopItem } from '../../types'

interface Props {
  items: ShopItem[]
  loading: boolean
}

export default memo(function ShopPreviewRow({ items, loading }: Props) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={containerVariants}
      className="py-8"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between px-5 mb-4">
        <h2 className="font-serif text-xl text-cream">Tienda</h2>
        <Link
          to="/shop"
          className="text-xs text-gold hover:text-gold-light transition-colors flex items-center gap-1"
        >
          Ver todo
          <ChevronRight size={14} />
        </Link>
      </motion.div>
      <div className="px-5">
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-6xl mx-auto"
        >
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-ink-medium/40 animate-pulse" />
            ))
          ) : items.length === 0 ? (
            <p className="text-subtle text-sm col-span-full">Próximamente productos disponibles</p>
          ) : (
            items.map((item) => (
              <Link key={item.id} to="/shop" className="group min-w-0">
                <div className="relative aspect-square rounded-xl overflow-hidden border border-white/5 group-hover:border-gold/30 transition-all">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-2.5">
                    <p className="text-cream text-[11px] sm:text-xs font-medium line-clamp-2 leading-tight">{item.title}</p>
                    <span className="text-gold font-semibold text-xs sm:text-sm">€{item.price}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </motion.div>
      </div>
    </motion.section>
  )
})
