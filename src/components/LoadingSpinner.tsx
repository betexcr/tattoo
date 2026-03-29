import { motion } from 'framer-motion'

export default function LoadingSpinner({ message = 'Cargando...' }: { message?: string }) {
  return (
    <div role="status" className="flex flex-col items-center justify-center py-20 gap-4">
      <motion.div
        aria-hidden
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full"
      />
      <p aria-hidden="true" className="text-subtle text-sm">{message}</p>
      <span className="sr-only">{message || 'Cargando...'}</span>
    </div>
  )
}
