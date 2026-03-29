import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  type User,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import type { Profile } from '../types'
import { mapFirestoreError } from '../utils/mapFirestoreError'

const authErrorMessages: Record<string, string> = {
  'auth/invalid-credential': 'Credenciales incorrectas',
  'auth/user-not-found': 'Usuario no encontrado',
  'auth/wrong-password': 'Contraseña incorrecta',
  'auth/email-already-in-use': 'Este correo ya está registrado',
  'auth/weak-password': 'La contraseña es demasiado débil',
  'auth/too-many-requests': 'Demasiados intentos. Inténtalo más tarde',
  'auth/invalid-email': 'Correo electrónico no válido',
  'auth/network-request-failed': 'Error de conexión. Revisa tu internet',
}

function mapAuthError(e: unknown): string {
  if (e && typeof e === 'object' && 'code' in e) {
    const code = (e as { code: string }).code
    return authErrorMessages[code] ?? 'Error de autenticación. Inténtalo de nuevo'
  }
  if (import.meta.env.DEV) console.warn('[mapAuthError] unmapped error:', e)
  return 'Error de autenticación. Inténtalo de nuevo'
}

interface AuthState {
  user: User | null
  profile: Profile | null
  isArtist: boolean
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const profileRequestId = useRef(0)

  const fetchProfile = useCallback(async (uid: string) => {
    const requestId = ++profileRequestId.current
    try {
      const snap = await getDoc(doc(db, 'profiles', uid))
      if (profileRequestId.current !== requestId) return
      if (snap.exists()) {
        setProfile({ id: snap.id, ...snap.data() } as Profile)
      } else {
        setProfile(null)
      }
      setError(null)
    } catch (e: unknown) {
      if (profileRequestId.current !== requestId) return
      setProfile(null)
      setError(mapFirestoreError(e))
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.uid)
  }, [user, fetchProfile])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        try {
          await fetchProfile(u.uid)
          if (auth.currentUser?.uid !== u.uid) return
        } finally {
          setLoading(false)
        }
      } else {
        ++profileRequestId.current
        setProfile(null)
        setLoading(false)
      }
    })
    return unsub
  }, [fetchProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return { error: null }
    } catch (e: unknown) {
      return { error: mapAuthError(e) }
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await setDoc(doc(db, 'profiles', cred.user.uid), {
        full_name: fullName,
        phone: '',
        role: 'client',
        avatar_url: '',
        created_at: new Date().toISOString(),
      })
      return { error: null }
    } catch (e: unknown) {
      return { error: mapAuthError(e) }
    }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
      return { error: null }
    } catch (e: unknown) {
      return { error: mapAuthError(e) }
    }
  }, [])

  const handleSignOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth)
      setProfile(null)
      setError(null)
    } catch (e: unknown) {
      setError(mapFirestoreError(e))
    }
  }, [])

  const isArtist = profile?.role === 'artist'

  const value = useMemo(
    () => ({ user, profile, isArtist, loading, error, signIn, signUp, resetPassword, signOut: handleSignOut, refreshProfile }),
    [user, profile, isArtist, loading, error, signIn, signUp, resetPassword, handleSignOut, refreshProfile],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
