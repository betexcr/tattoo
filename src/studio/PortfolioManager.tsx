import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Pencil,
  Trash2,
  Plus,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
} from 'lucide-react'
import { tattooStyles } from '../data/constants'
import { usePortfolio } from '../hooks/usePortfolio'
import type { PortfolioItem } from '../types'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

export default function PortfolioManager() {
  const { items: portfolio, create, update, remove } = usePortfolio(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null)
  const [formData, setFormData] = useState<Partial<PortfolioItem>>({
    title: '',
    style: '',
    description: '',
    image_url: '',
  })
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const totalItems = portfolio.length
  const styleBreakdown = portfolio.reduce<Record<string, number>>((acc, item) => {
    acc[item.style] = (acc[item.style] ?? 0) + 1
    return acc
  }, {})

  const handleEdit = (item: PortfolioItem) => {
    setSelectedItem(item)
    setFormData({
      title: item.title,
      style: item.style,
      description: item.description,
      image_url: item.image_url,
    })
    setEditModalOpen(true)
  }

  const handleAdd = () => {
    setSelectedItem(null)
    setFormData({
      title: '',
      style: tattooStyles[0] ?? '',
      description: '',
      image_url: '',
    })
    setEditModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.title || !formData.style || !formData.image_url) return
    if (selectedItem) {
      const { error } = await update(selectedItem.id, {
        title: formData.title,
        style: formData.style,
        description: formData.description ?? '',
        image_url: formData.image_url,
      })
      if (!error) setEditModalOpen(false)
    } else {
      const { error } = await create({
        title: formData.title as string,
        style: formData.style as string,
        description: (formData.description ?? '') as string,
        image_url: formData.image_url as string,
        published: true,
        sort_order: portfolio.length,
      })
      if (!error) setEditModalOpen(false)
    }
  }

  const handleDelete = async (id: string) => {
    await remove(id)
    setDeleteConfirmId(null)
  }

  const moveItem = async (id: string, dir: -1 | 1) => {
    const idx = portfolio.findIndex((p) => p.id === id)
    if (idx < 0) return
    const targetIdx = idx + dir
    if (targetIdx < 0 || targetIdx >= portfolio.length) return
    const targetItem = portfolio[targetIdx]
    const currentItem = portfolio[idx]
    await update(id, { sort_order: targetItem.sort_order })
    await update(targetItem.id, { sort_order: currentItem.sort_order })
  }

  const togglePublished = async (item: PortfolioItem) => {
    await update(item.id, { published: !item.published })
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 pb-28"
    >
      {/* Stats */}
      <motion.section variants={itemVariants} className="mb-6">
        <div className="rounded-xl bg-ink-light border border-white/5 p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-2xl font-serif font-semibold text-gold">
              {totalItems}
            </p>
            <p className="text-sm text-subtle">Total items</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(styleBreakdown).map(([style, count]) => (
              <span
                key={style}
                className="px-2.5 py-1 rounded-lg bg-ink-medium text-cream-dark text-xs"
              >
                {style}: {count}
              </span>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Grid */}
      <motion.section variants={itemVariants}>
        <div className="grid grid-cols-2 gap-3">
          {portfolio.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              className="group relative rounded-xl overflow-hidden bg-ink-light border border-white/5 aspect-[3/4]"
            >
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="font-medium text-cream text-sm truncate">
                  {item.title}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-gold/20 text-gold text-[10px]">
                  {item.style}
                </span>
              </div>

              {/* Move buttons */}
              <div className="absolute top-2 left-2 flex flex-col gap-0.5">
                <button
                  onClick={(e) => { e.stopPropagation(); moveItem(item.id, -1) }}
                  className="w-6 h-6 rounded-md bg-black/50 flex items-center justify-center text-cream hover:bg-black/70 transition-colors"
                >
                  <ChevronUp size={12} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); moveItem(item.id, 1) }}
                  className="w-6 h-6 rounded-md bg-black/50 flex items-center justify-center text-cream hover:bg-black/70 transition-colors"
                >
                  <ChevronDown size={12} />
                </button>
              </div>

              {/* Published toggle */}
              <button
                onClick={() => togglePublished(item)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors"
                title={item.published ? 'Publicado' : 'Borrador'}
              >
                {item.published ? (
                  <Eye size={14} className="text-emerald-400" />
                ) : (
                  <EyeOff size={14} className="text-subtle" />
                )}
              </button>

              {/* Actions overlay */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity bg-black/50">
                <button
                  onClick={() => handleEdit(item)}
                  className="w-10 h-10 rounded-full bg-gold/80 text-ink flex items-center justify-center hover:bg-gold transition-colors"
                >
                  <Pencil size={18} />
                </button>
                {deleteConfirmId === item.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium"
                    >
                      Sí
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-3 py-1.5 rounded-lg bg-ink-medium text-cream text-xs"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirmId(item.id)}
                    className="w-10 h-10 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        onClick={handleAdd}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-gold text-ink flex items-center justify-center shadow-lg shadow-gold/30 hover:bg-gold-light transition-colors z-30"
      >
        <Plus size={24} strokeWidth={2.5} />
      </motion.button>

      {/* Edit modal (bottom sheet) */}
      <AnimatePresence>
        {editModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setEditModalOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-ink-light rounded-t-3xl max-h-[85dvh] overflow-y-auto"
            >
              <div className="p-5 border-b border-white/5">
                <h2 className="font-serif text-lg text-cream">
                  {selectedItem ? 'Editar item' : 'Nuevo item'}
                </h2>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs text-subtle mb-1.5">
                    Título
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, title: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-ink border border-white/10 text-cream placeholder:text-subtle focus:outline-none focus:border-gold/50"
                    placeholder="Nombre del diseño"
                  />
                </div>
                <div>
                  <label className="block text-xs text-subtle mb-1.5">
                    Estilo
                  </label>
                  <select
                    value={formData.style}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, style: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-ink border border-white/10 text-cream focus:outline-none focus:border-gold/50"
                  >
                    {tattooStyles.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-subtle mb-1.5">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((f) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-ink border border-white/10 text-cream placeholder:text-subtle focus:outline-none focus:border-gold/50 resize-none"
                    placeholder="Descripción del tatuaje"
                  />
                </div>
                <div>
                  <label className="block text-xs text-subtle mb-1.5">
                    URL de imagen
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, image_url: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-ink border border-white/10 text-cream placeholder:text-subtle focus:outline-none focus:border-gold/50"
                    placeholder="https://..."
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setEditModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-ink-medium text-cream font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={
                      !formData.title || !formData.style || !formData.image_url
                    }
                    className="flex-1 py-3 rounded-xl bg-gold text-ink font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gold-light transition-colors"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
