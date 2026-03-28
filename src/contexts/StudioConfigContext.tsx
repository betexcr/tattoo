import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type {
  StudioSettings,
  Suggestion,
  ChatConfig,
  HomeContent,
  AboutContent,
  QuizConfig,
} from '../types'
import {
  defaultTattooStyles,
  defaultBodyParts,
  defaultSuggestions,
  defaultChatbotResponses,
  defaultChatConfig,
  defaultHomeContent,
  defaultAboutContent,
  defaultQuizConfig,
} from '../data/defaults'

export interface StudioConfig {
  studio_name: string
  artist_name: string
  bio: string
  phone: string
  email: string
  address: string
  schedule: Record<string, unknown>
  prices: Record<string, unknown>
  social_links: Record<string, string>
  notifications: Record<string, boolean>
  tattoo_styles: string[]
  body_parts: string[]
  suggestions: Suggestion[]
  chatbot_responses: Record<string, string>
  chat_config: ChatConfig
  home_content: HomeContent
  about_content: AboutContent
  quiz_config: QuizConfig
}

const defaultConfig: StudioConfig = {
  studio_name: 'INK & SOUL',
  artist_name: 'Valentina Reyes',
  bio: '',
  phone: '+34 612 345 678',
  email: 'hola@inkandsoul.com',
  address: 'Calle del Arte 12, Madrid',
  schedule: {},
  prices: {},
  social_links: {},
  notifications: {},
  tattoo_styles: defaultTattooStyles,
  body_parts: defaultBodyParts,
  suggestions: defaultSuggestions,
  chatbot_responses: defaultChatbotResponses,
  chat_config: defaultChatConfig,
  home_content: defaultHomeContent,
  about_content: defaultAboutContent,
  quiz_config: defaultQuizConfig,
}

interface StudioConfigContextValue {
  config: StudioConfig
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const StudioConfigContext = createContext<StudioConfigContextValue>({
  config: defaultConfig,
  loading: true,
  error: null,
  refetch: async () => {},
})

function mergeConfig(raw: StudioSettings): StudioConfig {
  return {
    studio_name: raw.studio_name || defaultConfig.studio_name,
    artist_name: raw.artist_name || defaultConfig.artist_name,
    bio: raw.bio ?? '',
    phone: raw.phone || defaultConfig.phone,
    email: raw.email || defaultConfig.email,
    address: raw.address || defaultConfig.address,
    schedule: raw.schedule ?? {},
    prices: raw.prices ?? {},
    social_links: (raw.social_links ?? {}) as Record<string, string>,
    notifications: (raw.notifications ?? {}) as Record<string, boolean>,
    tattoo_styles: raw.tattoo_styles?.length ? raw.tattoo_styles : defaultTattooStyles,
    body_parts: raw.body_parts?.length ? raw.body_parts : defaultBodyParts,
    suggestions: raw.suggestions?.length ? raw.suggestions : defaultSuggestions,
    chatbot_responses: raw.chatbot_responses && Object.keys(raw.chatbot_responses).length > 0
      ? raw.chatbot_responses
      : defaultChatbotResponses,
    chat_config: raw.chat_config?.artist_name
      ? { ...defaultChatConfig, ...raw.chat_config }
      : defaultChatConfig,
    home_content: raw.home_content?.tagline
      ? { ...defaultHomeContent, ...raw.home_content }
      : defaultHomeContent,
    about_content: raw.about_content?.bio
      ? { ...defaultAboutContent, ...raw.about_content }
      : defaultAboutContent,
    quiz_config: raw.quiz_config?.questions?.length
      ? { ...defaultQuizConfig, ...raw.quiz_config }
      : defaultQuizConfig,
  }
}

const SETTINGS_DOC = doc(db, 'studio_settings', 'main')

export function StudioConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<StudioConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConfig = useCallback(async () => {
    try {
      const snap = await getDoc(SETTINGS_DOC)
      if (snap.exists()) {
        setConfig(mergeConfig({ id: snap.id, ...snap.data() } as StudioSettings))
      }
      setError(null)
    } catch (e: unknown) {
      setError((e as Error).message)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchConfig() }, [fetchConfig])

  return (
    <StudioConfigContext.Provider value={{ config, loading, error, refetch: fetchConfig }}>
      {children}
    </StudioConfigContext.Provider>
  )
}

export function useStudioConfig() {
  return useContext(StudioConfigContext)
}
