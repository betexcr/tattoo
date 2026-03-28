import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCallback } from 'react'

export function useRequireAuth() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const requireAuth = useCallback((returnTo?: string) => {
    if (!user) {
      navigate(`/login${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`)
      return false
    }
    return true
  }, [user, navigate])

  return { user, requireAuth }
}
