import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

export default function LoadingSpinner({ message }: { message?: string }) {
  const { t } = useTranslation()
  const text = message ?? t('loading')

  return (
    <div role="status" className="flex flex-col items-center justify-center py-20 gap-4">
      <motion.div
        aria-hidden
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full"
      />
      <p aria-hidden="true" className="text-subtle text-sm">{text}</p>
      <span className="sr-only">{text}</span>
    </div>
  )
}
