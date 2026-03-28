import { useState } from 'react'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

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

  const submit = async (input: ContactInput) => {
    setLoading(true)
    try {
      await addDoc(collection(db, 'contact_submissions'), {
        ...input,
        created_at: new Date().toISOString(),
      })
      setLoading(false)
      return { error: null }
    } catch (e: unknown) {
      setLoading(false)
      return { error: (e as Error).message }
    }
  }

  return { submit, loading }
}
