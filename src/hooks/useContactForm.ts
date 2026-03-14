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
  const submit = async (input: ContactInput) => {
    try {
      await addDoc(collection(db, 'contact_submissions'), {
        ...input,
        created_at: new Date().toISOString(),
      })
      return { error: null }
    } catch (e: unknown) {
      return { error: (e as Error).message }
    }
  }

  return { submit }
}
