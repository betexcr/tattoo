import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  action?: ReactNode
}

export default function PageHeader({ title, subtitle, showBack = true, action }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 bg-ink/90 backdrop-blur-lg border-b border-white/5"
    >
      <div className="flex items-center justify-between px-5 h-14">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-subtle hover:text-cream transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div>
            <h1 className="font-serif text-lg leading-tight text-cream">{title}</h1>
            {subtitle && (
              <p className="text-[11px] text-subtle tracking-wide">{subtitle}</p>
            )}
          </div>
        </div>
        {action}
      </div>
    </motion.header>
  )
}
