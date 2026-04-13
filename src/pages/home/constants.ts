import {
  Sparkles,
  PenTool,
  Eye,
  ShoppingBag,
  GraduationCap,
  Lightbulb,
} from 'lucide-react'

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

export const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

export const lineVariants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: {
    scaleX: 1,
    originX: 0,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export const quickActions = [
  { to: '/book', icon: Sparkles },
  { to: '/designer', icon: PenTool },
  { to: '/visualizer', icon: Eye },
  { to: '/shop', icon: ShoppingBag },
  { to: '/courses', icon: GraduationCap },
  { to: '/suggestions', icon: Lightbulb },
]
