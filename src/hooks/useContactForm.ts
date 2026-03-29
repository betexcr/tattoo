import { useState, useRef } from 'react'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { mapFirestoreError } from '../utils/mapFirestoreError'

interface ContactInput {
  name: string
  email: string
  phone?: string
  message: string
  tattoo_style?: string
  body_part?: string
}

export function useContactForm() {
  const [loading, setLoading] = useState(false)
  const loadingRef = useRef(false)

  const submit = async (input: ContactInput) => {
    if (loadingRef.current) return { error: 'Enviando, por favor espera...' }
    loadingRef.current = true
    setLoading(true)
    try {
      await addDoc(collection(db, 'contact_submissions'), {
        ...input,
        created_at: new Date().toISOString(),
      })
      return { error: null }
    } catch (e: unknown) {
      return { error: mapFirestoreError(e) }
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }

  return { submit, loading }
}
