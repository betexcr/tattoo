import { useState, useEffect, useCallback } from 'react'
import {
  collection, query, orderBy, where, getDocs, doc, runTransaction,
} from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import type { Course } from '../types'

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [reservedIds, setReservedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const q = query(collection(db, 'courses'), orderBy('date', 'asc'))
      const snap = await getDocs(q)
      setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Course))

      const user = auth.currentUser
      if (user) {
        const rq = query(
          collection(db, 'course_reservations'),
          where('client_id', '==', user.uid),
        )
        const rsnap = await getDocs(rq)
        setReservedIds(new Set(rsnap.docs.map(d => d.data().course_id as string)))
      }
    } catch (e: unknown) {
      setError((e as Error).message)
    }
    setLoading(false)
  }, [])

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
      return { error: (e as Error).message }
    }
  }

  return { courses, reservedIds, loading, error, refetch: fetch, reserve }
}
