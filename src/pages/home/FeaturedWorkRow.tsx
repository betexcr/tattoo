import { memo } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { containerVariants, itemVariants } from './constants'
import type { PortfolioItem } from '../../types'

interface Props {
  items: PortfolioItem[]
  loading: boolean
}

export default memo(function FeaturedWorkRow({ items, loading }: Props) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={containerVariants}
      className="py-8"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between px-5 mb-4">
        <h2 className="font-serif text-xl text-cream">Trabajos Recientes</h2>
        <Link
          to="/portfolio"
          className="text-xs text-gold hover:text-gold-light transition-colors flex items-center gap-1"
        >
          Ver todos
          <ChevronRight size={14} />
        </Link>
      </motion.div>
      <motion.div
        variants={itemVariants}
        className="flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="shrink-0 w-36 h-48 rounded-xl bg-ink-medium/40 animate-pulse" />
          ))
        ) : items.length === 0 ? (
          <p className="text-subtle text-sm px-1">No hay trabajos disponibles aún</p>
        ) : items.map((item) => (
          <Link
            key={item.id}
            to="/portfolio"
            className="shrink-0 w-36 group"
          >
            <div className="relative w-36 h-48 rounded-xl overflow-hidden border border-white/5 group-hover:border-gold/30 transition-all">
              <img
                src={item.image_url}
                alt={item.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-2.5">
                <p className="text-cream text-xs font-medium truncate">{item.title}</p>
                <span className="text-gold/70 text-[10px]">{item.style}</span>
              </div>
            </div>
          </Link>
        ))}
      </motion.div>
    </motion.section>
  )
})
