import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function RequireArtist() {
  const { user, isArtist, loading, error } = useAuth()

  if (loading) {
    return (
      <div className="min-h-dvh bg-ink flex items-center justify-center" role="status">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        <span className="sr-only">Cargando...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-dvh bg-ink flex items-center justify-center px-4">
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-center max-w-sm">
          <p className="text-red-400 text-sm font-medium mb-1">Error al verificar acceso</p>
          <p className="text-subtle text-xs">{error}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!isArtist) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
