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
      <motion.div
        variants={itemVariants}
        className="flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="shrink-0 w-40 h-52 rounded-xl bg-ink-medium/40 animate-pulse" />
          ))
        ) : items.length === 0 ? (
          <p className="text-subtle text-sm px-1">Próximamente productos disponibles</p>
        ) : items.map((item) => (
          <Link
            key={item.id}
            to="/shop"
            className="shrink-0 w-40 group"
          >
            <div className="relative w-40 h-52 rounded-xl overflow-hidden border border-white/5 group-hover:border-gold/30 transition-all">
              <img
                src={item.image_url}
                alt={item.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-cream text-xs font-medium truncate">{item.title}</p>
                <span className="text-gold font-semibold text-sm">€{item.price}</span>
              </div>
            </div>
          </Link>
        ))}
      </motion.div>
    </motion.section>
  )
})
