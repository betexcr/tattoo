import { motion } from 'framer-motion'

export default function LoadingSpinner({ message = 'Cargando...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full"
      />
      <p className="text-subtle text-sm">{message}</p>
    </div>
  )
}
