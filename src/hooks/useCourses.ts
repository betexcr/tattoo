import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Course } from '../types'

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('courses')
      .select('*')
      .order('date', { ascending: true })
    if (err) setError(err.message)
    else setCourses((data ?? []) as unknown as Course[])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const reserve = async (courseId: string, name: string, email: string, phone: string) => {
    const user = (await supabase.auth.getUser()).data.user

    const { error: err } = await supabase
      .from('course_reservations')
      .insert({
        course_id: courseId,
        client_id: user?.id ?? null,
        name,
        email,
        phone,
      })

    if (err) return { error: err.message }

    const course = courses.find(c => c.id === courseId)
    if (course && course.spots > 0) {
      await supabase
        .from('courses')
        .update({ spots: course.spots - 1 })
        .eq('id', courseId)
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, spots: c.spots - 1 } : c))
    }

    return { error: null }
  }

  return { courses, loading, error, refetch: fetch, reserve }
}
