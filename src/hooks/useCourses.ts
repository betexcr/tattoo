import { useState, useEffect, useCallback } from 'react'
import {
  collection, query, orderBy, getDocs, addDoc, updateDoc, doc,
} from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import type { Course } from '../types'

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const q = query(collection(db, 'courses'), orderBy('date', 'asc'))
      const snap = await getDocs(q)
      setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Course))
    } catch (e: unknown) {
      setError((e as Error).message)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const reserve = async (courseId: string, name: string, email: string, phone: string) => {
    try {
      const user = auth.currentUser

      await addDoc(collection(db, 'course_reservations'), {
        course_id: courseId,
        client_id: user?.uid ?? null,
        name,
        email,
        phone,
        created_at: new Date().toISOString(),
      })

      const course = courses.find(c => c.id === courseId)
      if (course && course.spots > 0) {
        await updateDoc(doc(db, 'courses', courseId), { spots: course.spots - 1 })
        setCourses(prev => prev.map(c => c.id === courseId ? { ...c, spots: c.spots - 1 } : c))
      }

      return { error: null }
    } catch (e: unknown) {
      return { error: (e as Error).message }
    }
  }

  return { courses, loading, error, refetch: fetch, reserve }
}
