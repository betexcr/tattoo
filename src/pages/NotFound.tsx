import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import PageHeader from '../components/PageHeader'

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-ink">
      <PageHeader title="Página no encontrada" />
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <p className="text-6xl font-serif font-bold text-gold mb-4">404</p>
        <p className="text-cream-dark mb-8">
          La página que buscas no existe o ha sido movida.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold text-ink font-medium hover:bg-gold-light transition-colors"
        >
          <Home size={18} />
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
