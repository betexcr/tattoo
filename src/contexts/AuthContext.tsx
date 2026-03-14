import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import type { Profile } from '../types'

interface AuthState {
  user: User | null
  session: unknown
  profile: Profile | null
  isArtist: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName: string, role?: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (uid: string) => {
    const snap = await getDoc(doc(db, 'profiles', uid))
    if (snap.exists()) {
      setProfile({ id: snap.id, ...snap.data() } as Profile)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.uid)
  }, [user, fetchProfile])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        await fetchProfile(u.uid)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [fetchProfile])

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return { error: null }
    } catch (e: unknown) {
      return { error: (e as Error).message }
    }
  }

  const signUp = async (email: string, password: string, fullName: string, role = 'client') => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await setDoc(doc(db, 'profiles', cred.user.uid), {
        full_name: fullName,
        phone: '',
        role,
        avatar_url: '',
        created_at: new Date().toISOString(),
      })
      return { error: null }
    } catch (e: unknown) {
      return { error: (e as Error).message }
    }
  }

  const handleSignOut = async () => {
    await firebaseSignOut(auth)
    setProfile(null)
  }

  const isArtist = profile?.role === 'artist'

  return (
    <AuthContext.Provider
      value={{ user, session: null, profile, isArtist, loading, signIn, signUp, signOut: handleSignOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
