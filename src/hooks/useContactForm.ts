import { supabase } from '../lib/supabase'

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
    const { error } = await supabase
      .from('contact_submissions')
      .insert(input)
    return { error: error?.message ?? null }
  }

  return { submit }
}
