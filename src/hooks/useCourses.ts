import { useState, useEffect, useCallback, useRef } from 'react'
import {
  collection, query, orderBy, where, getDocs, doc, runTransaction, limit,
} from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import type { Course } from '../types'
import { mapFirestoreError } from '../utils/mapFirestoreError'

export function useCourses() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [reservedIds, setReservedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchIdRef = useRef(0)
  const userId = user?.uid ?? null

  const fetch = useCallback(async () => {
    const id = ++fetchIdRef.current
    setLoading(true)
    setError(null)
    try {
      const q = query(collection(db, 'courses'), orderBy('date', 'asc'), limit(50))
      const snap = await getDocs(q)
      if (fetchIdRef.current !== id) return

      setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Course))

      if (userId) {
        const rq = query(
          collection(db, 'course_reservations'),
          where('client_id', '==', userId),
          limit(100),
        )
        const rsnap = await getDocs(rq)
        if (fetchIdRef.current !== id) return
        setReservedIds(new Set(rsnap.docs.map(d => d.data().course_id as string)))
      } else {
        setReservedIds(new Set())
      }
      setLoading(false)
    } catch (e: unknown) {
      if (fetchIdRef.current !== id) return
      setError(mapFirestoreError(e))
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  const reserve = async (courseId: string, name: string, email: string, phone: string) => {
    try {
      const user = auth.currentUser
      await runTransaction(db, async (transaction) => {
        const courseRef = doc(db, 'courses', courseId)
        const courseSnap = await transaction.get(courseRef)
        if (!courseSnap.exists()) throw new Error('Curso no encontrado')
        const currentSpots = courseSnap.data().spots as number
        if (currentSpots <= 0) throw new Error('No quedan plazas disponibles')

        const resRef = doc(collection(db, 'course_reservations'))
        transaction.set(resRef, {
          course_id: courseId,
          client_id: user?.uid ?? null,
          name,
          email,
          phone,
          created_at: new Date().toISOString(),
        })
        transaction.update(courseRef, { spots: currentSpots - 1 })
      })
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, spots: c.spots - 1 } : c))
      setReservedIds(prev => new Set(prev).add(courseId))
      return { error: null }
    } catch (e: unknown) {
      return { error: mapFirestoreError(e) }
    }
  }

  return { courses, reservedIds, loading, error, refetch: fetch, reserve }
}
