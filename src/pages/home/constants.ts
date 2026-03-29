import {
  Image,
  CalendarPlus,
  PenTool,
  User,
  ShoppingBag,
  GraduationCap,
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
  { to: '/portfolio', label: 'Portafolio', icon: Image, desc: 'Ver trabajos' },
  { to: '/book', label: 'Reservar', icon: CalendarPlus, desc: 'Agendar cita' },
  { to: '/designer', label: 'Diseñador', icon: PenTool, desc: 'Crea tu tatuaje' },
  { to: '/visualizer', label: 'Visualizar', icon: User, desc: 'En tu cuerpo' },
  { to: '/shop', label: 'Tienda', icon: ShoppingBag, desc: 'Arte exclusivo' },
  { to: '/courses', label: 'Cursos', icon: GraduationCap, desc: 'Aprende' },
]
