import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function RequireArtist() {
  const { user, isArtist, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-dvh bg-ink flex items-center justify-center" role="status">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        <span className="sr-only">Cargando...</span>
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
