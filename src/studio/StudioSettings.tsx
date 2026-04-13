import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Save,
  Image as ImageIcon,
  CheckCircle,
  User,
  BookOpen,
  Lightbulb,
  FileText,
  MessageCircle,
  Bell,
  Plus,
  X,
  Languages,
} from 'lucide-react'
import { useStudioSettings } from '../hooks/useStudioSettings'
import type {
  Suggestion,
  ReviewDisplay,
  AboutStat,
  QuickReply,
  QuizQuestion,
  StyleRecommendation,
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

interface DaySchedule {
  open: boolean
  start: string
  end: string
}

interface PriceRange {
  min: number
  max: number
}

const DAY_KEYS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'] as const
const DAY_I18N_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

const SIZE_I18N_MAP: Record<string, string> = {
  tiny: 'tiny', small: 'small', medium: 'medium', large: 'large', xl: 'xlarge',
}

const defaultSchedule: Record<string, DaySchedule> = {
  lunes: { open: true, start: '10:00', end: '19:00' },
  martes: { open: true, start: '10:00', end: '19:00' },
  miercoles: { open: true, start: '10:00', end: '19:00' },
  jueves: { open: true, start: '10:00', end: '19:00' },
  viernes: { open: true, start: '10:00', end: '19:00' },
  sabado: { open: true, start: '10:00', end: '15:00' },
  domingo: { open: false, start: '10:00', end: '19:00' },
}

const defaultPrices: Record<string, PriceRange> = {
  tiny: { min: 50, max: 80 },
  small: { min: 80, max: 150 },
  medium: { min: 150, max: 300 },
  large: { min: 300, max: 500 },
  xl: { min: 500, max: 800 },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

const TAB_DEFS = [
  { id: 'perfil', i18nKey: 'settings.tabs.profile', icon: User },
  { id: 'catalogo', i18nKey: 'settings.tabs.catalog', icon: BookOpen },
  { id: 'sugerencias', i18nKey: 'settings.tabs.suggestions', icon: Lightbulb },
  { id: 'contenido', i18nKey: 'settings.tabs.content', icon: FileText },
  { id: 'chat', i18nKey: 'settings.tabs.chat', icon: MessageCircle },
  { id: 'notificaciones', i18nKey: 'settings.tabs.notifications', icon: Bell },
] as const

type TabId = (typeof TAB_DEFS)[number]['id']

const inputClass =
  'w-full px-4 py-2.5 rounded-xl bg-ink border border-white/10 text-cream placeholder:text-subtle focus:outline-none focus:border-gold/50'
const labelClass = 'block text-xs text-subtle mb-1'

export default function StudioSettings() {
  const { t } = useTranslation('studio')
  const { settings: dbSettings, loading: settingsLoading, error: fetchError, save } = useStudioSettings()
  const [activeTab, setActiveTab] = useState<TabId>('perfil')
  const [savedTab, setSavedTab] = useState<TabId | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const successTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => { clearTimeout(successTimerRef.current) }, [])

  // Perfil state
  const [studioName, setStudioName] = useState('INK & SOUL')
  const [artistName, setArtistName] = useState('Valentina Reyes')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('+34 612 345 678')
  const [email, setEmail] = useState('hola@inkandsoul.com')
  const [address, setAddress] = useState('Calle del Arte 12, Madrid')
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>({ ...defaultSchedule })
  const [prices, setPrices] = useState<Record<string, PriceRange>>({ ...defaultPrices })
  const [instagram, setInstagram] = useState('')
  const [tiktok, setTiktok] = useState('')
  const [website, setWebsite] = useState('')

  // Catálogo state
  const [tattooStyles, setTattooStyles] = useState<string[]>(defaultTattooStyles)
  const [bodyParts, setBodyParts] = useState<string[]>(defaultBodyParts)
  const [newStyleInput, setNewStyleInput] = useState('')
  const [newBodyPartInput, setNewBodyPartInput] = useState('')

  // Sugerencias y Quiz state
  const [suggestions, setSuggestions] = useState<Suggestion[]>(defaultSuggestions)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(defaultQuizConfig.questions)
  const [styleRecommendations, setStyleRecommendations] = useState<Record<string, StyleRecommendation>>(
    defaultQuizConfig.style_recommendations
  )
  const [trendingThreshold, setTrendingThreshold] = useState(defaultQuizConfig.trending_threshold)
  const [newRecKey, setNewRecKey] = useState('')
  const [newRecStyle, setNewRecStyle] = useState('')
  const [newRecDesc, setNewRecDesc] = useState('')

  // Contenido state
  const [homeSubtitle, setHomeSubtitle] = useState(defaultHomeContent.subtitle)
  const [homeTagline, setHomeTagline] = useState(defaultHomeContent.tagline)
  const [reviews, setReviews] = useState<ReviewDisplay[]>(defaultHomeContent.reviews)
  const [aboutHeroImage, setAboutHeroImage] = useState(defaultAboutContent.hero_image)
  const [aboutArtistTitle, setAboutArtistTitle] = useState(defaultAboutContent.artist_title)
  const [aboutBio, setAboutBio] = useState(defaultAboutContent.bio)
  const [aboutStats, setAboutStats] = useState<AboutStat[]>(defaultAboutContent.stats)
  const [aboutSpecialties, setAboutSpecialties] = useState<string[]>(defaultAboutContent.specialties)
  const [aboutCertifications, setAboutCertifications] = useState<string[]>(defaultAboutContent.certifications)
  const [newSpecialtyInput, setNewSpecialtyInput] = useState('')
  const [newCertInput, setNewCertInput] = useState('')

  // Chat state
  const [chatArtistName, setChatArtistName] = useState(defaultChatConfig.artist_name)
  const [chatArtistInitials, setChatArtistInitials] = useState(defaultChatConfig.artist_initials)
  const [welcomeMessage, setWelcomeMessage] = useState(defaultChatConfig.welcome_message)
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>(defaultChatConfig.quick_replies)
  const [chatbotResponses, setChatbotResponses] = useState<Record<string, string>>(defaultChatbotResponses)
  const [cannedResponses, setCannedResponses] = useState<string[]>(defaultChatConfig.canned_responses)
  const [fallbackResponse, setFallbackResponse] = useState(defaultChatConfig.fallback_response)
  const [responseTimeText, setResponseTimeText] = useState(defaultChatConfig.response_time_text)
  const [newChatbotKey, setNewChatbotKey] = useState('')
  const [newChatbotValue, setNewChatbotValue] = useState('')

  // Notificaciones state
  const [newBooking, setNewBooking] = useState(true)
  const [messageNotification, setMessageNotification] = useState(true)
  const [reminderNotification, setReminderNotification] = useState(true)
  const [depositReceived, setDepositReceived] = useState(true)

  // Sync from DB
  useEffect(() => {
    if (!dbSettings) return
    const social = (dbSettings.social_links ?? {}) as Record<string, string>
    const notif = (dbSettings.notifications ?? {}) as Record<string, boolean>
    const sched = (dbSettings.schedule ?? {}) as Record<string, DaySchedule>
    const prc = (dbSettings.prices ?? {}) as Record<string, PriceRange>

    setStudioName(dbSettings.studio_name ?? 'INK & SOUL')
    setArtistName(dbSettings.artist_name ?? 'Valentina Reyes')
    setBio(dbSettings.bio ?? '')
    setPhone(dbSettings.phone ?? '')
    setEmail(dbSettings.email ?? '')
    setAddress(dbSettings.address ?? '')
    setSchedule({ ...defaultSchedule, ...sched })
    setPrices({ ...defaultPrices, ...prc })
    setInstagram(social.instagram ?? '')
    setTiktok(social.tiktok ?? '')
    setWebsite(social.website ?? '')

    setTattooStyles((dbSettings.tattoo_styles ?? defaultTattooStyles) as string[])
    setBodyParts((dbSettings.body_parts ?? defaultBodyParts) as string[])

    setSuggestions((dbSettings.suggestions ?? defaultSuggestions) as Suggestion[])
    const qc = (dbSettings.quiz_config ?? defaultQuizConfig) as QuizConfig
    setQuizQuestions(qc.questions ?? defaultQuizConfig.questions)
    setStyleRecommendations(qc.style_recommendations ?? defaultQuizConfig.style_recommendations)
    setTrendingThreshold(qc.trending_threshold ?? defaultQuizConfig.trending_threshold)

    const hc = (dbSettings.home_content ?? defaultHomeContent) as HomeContent
    setHomeSubtitle(hc.subtitle ?? defaultHomeContent.subtitle)
    setHomeTagline(hc.tagline ?? defaultHomeContent.tagline)
    setReviews(hc.reviews ?? defaultHomeContent.reviews)

    const ac = (dbSettings.about_content ?? defaultAboutContent) as AboutContent
    setAboutHeroImage(ac.hero_image ?? defaultAboutContent.hero_image)
    setAboutArtistTitle(ac.artist_title ?? defaultAboutContent.artist_title)
    setAboutBio(ac.bio ?? defaultAboutContent.bio)
    setAboutStats(ac.stats ?? defaultAboutContent.stats)
    setAboutSpecialties(ac.specialties ?? defaultAboutContent.specialties)
    setAboutCertifications(ac.certifications ?? defaultAboutContent.certifications)

    const cc = (dbSettings.chat_config ?? defaultChatConfig) as ChatConfig
    setChatArtistName(cc.artist_name ?? defaultChatConfig.artist_name)
    setChatArtistInitials(cc.artist_initials ?? defaultChatConfig.artist_initials)
    setWelcomeMessage(cc.welcome_message ?? defaultChatConfig.welcome_message)
    setQuickReplies(cc.quick_replies ?? defaultChatConfig.quick_replies)
    setCannedResponses(cc.canned_responses ?? defaultChatConfig.canned_responses)
    setFallbackResponse(cc.fallback_response ?? defaultChatConfig.fallback_response)
    setResponseTimeText(cc.response_time_text ?? defaultChatConfig.response_time_text)
    setChatbotResponses((dbSettings.chatbot_responses ?? defaultChatbotResponses) as Record<string, string>)

    setNewBooking(notif.new_booking ?? true)
    setMessageNotification(notif.message_notification ?? true)
    setReminderNotification(notif.reminder_notification ?? true)
    setDepositReceived(notif.deposit_received ?? true)
  }, [dbSettings])

  const showSuccess = (tab: TabId) => {
    setSavedTab(tab)
    clearTimeout(successTimerRef.current)
    successTimerRef.current = setTimeout(() => setSavedTab(null), 3000)
  }

  const updateSchedule = (day: string, updates: Partial<DaySchedule>) => {
    setSchedule((s) => ({
      ...s,
      [day]: { ...s[day], ...updates },
    }))
  }

  const updatePrice = (size: string, field: 'min' | 'max', value: number) => {
    setPrices((s) => ({
      ...s,
      [size]: { ...s[size], [field]: value },
    }))
  }

  const wrappedSave = async (data: Parameters<typeof save>[0], tab: TabId) => {
    setSaving(true)
    setSaveError(null)
    try {
      const { error } = await save(data)
      if (error) {
        setSaveError(error)
      } else {
        showSuccess(tab)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleSavePerfil = () => wrappedSave({
    studio_name: studioName,
    artist_name: artistName,
    bio,
    phone,
    email,
    address,
    schedule: schedule as Record<string, DaySchedule | string>,
    prices: prices as Record<string, PriceRange | number>,
    social_links: { instagram, tiktok, website },
  }, 'perfil')

  const handleSaveCatalogo = () => wrappedSave({
    tattoo_styles: tattooStyles,
    body_parts: bodyParts,
  }, 'catalogo')

  const handleSaveSugerencias = () => wrappedSave({
    suggestions,
    quiz_config: {
      questions: quizQuestions,
      style_recommendations: styleRecommendations,
      trending_threshold: trendingThreshold,
    },
  }, 'sugerencias')

  const handleSaveContenido = () => wrappedSave({
    home_content: {
      subtitle: homeSubtitle,
      tagline: homeTagline,
      reviews,
    },
    about_content: {
      hero_image: aboutHeroImage,
      artist_title: aboutArtistTitle,
      bio: aboutBio,
      stats: aboutStats,
      specialties: aboutSpecialties,
      certifications: aboutCertifications,
    },
  }, 'contenido')

  const handleSaveChat = () => wrappedSave({
    chatbot_responses: chatbotResponses,
    chat_config: {
      artist_name: chatArtistName,
      artist_initials: chatArtistInitials,
      welcome_message: welcomeMessage,
      quick_replies: quickReplies,
      canned_responses: cannedResponses,
      fallback_response: fallbackResponse,
      response_time_text: responseTimeText,
    },
  }, 'chat')

  const handleSaveNotificaciones = () => wrappedSave({
    notifications: {
      new_booking: newBooking,
      message_notification: messageNotification,
      reminder_notification: reminderNotification,
      deposit_received: depositReceived,
    },
  }, 'notificaciones')

  const addStyle = () => {
    const v = newStyleInput.trim()
    if (v && !tattooStyles.includes(v)) {
      setTattooStyles((s) => [...s, v])
      setNewStyleInput('')
    }
  }

  const removeStyle = (style: string) => {
    setTattooStyles((s) => s.filter((x) => x !== style))
  }

  const addBodyPart = () => {
    const v = newBodyPartInput.trim()
    if (v && !bodyParts.includes(v)) {
      setBodyParts((s) => [...s, v])
      setNewBodyPartInput('')
    }
  }

  const removeBodyPart = (bp: string) => {
    setBodyParts((s) => s.filter((x) => x !== bp))
  }

  const addSuggestion = () => {
    setSuggestions((s) => [
      ...s,
      {
        id: crypto.randomUUID(),
        title: '',
        description: '',
        style: tattooStyles[0] ?? 'Línea Fina',
        popularity: 50,
      },
    ])
  }

  const updateSuggestion = (id: string, updates: Partial<Suggestion>) => {
    setSuggestions((s) =>
      s.map((x) => (x.id === id ? { ...x, ...updates } : x))
    )
  }

  const removeSuggestion = (id: string) => {
    setSuggestions((s) => s.filter((x) => x.id !== id))
  }

  const addQuizQuestion = () => {
    setQuizQuestions((s) => [
      ...s,
      { id: crypto.randomUUID(), question: '', options: [''] },
    ])
  }

  const updateQuizQuestion = (id: string, updates: Partial<QuizQuestion>) => {
    setQuizQuestions((s) =>
      s.map((x) => (x.id === id ? { ...x, ...updates } : x))
    )
  }

  const updateQuizQuestionOption = (qId: string, idx: number, value: string) => {
    setQuizQuestions((s) =>
      s.map((q) => {
        if (q.id !== qId) return q
        const opts = [...q.options]
        opts[idx] = value
        return { ...q, options: opts }
      })
    )
  }

  const addQuizQuestionOption = (qId: string) => {
    setQuizQuestions((s) =>
      s.map((q) =>
        q.id === qId ? { ...q, options: [...q.options, ''] } : q
      )
    )
  }

  const removeQuizQuestionOption = (qId: string, idx: number) => {
    setQuizQuestions((s) =>
      s.map((q) => {
        if (q.id !== qId) return q
        const opts = q.options.filter((_, i) => i !== idx)
        return { ...q, options: opts.length ? opts : [''] }
      })
    )
  }

  const removeQuizQuestion = (id: string) => {
    setQuizQuestions((s) => s.filter((x) => x.id !== id))
  }

  const addStyleRecommendation = () => {
    if (newRecKey.trim() && newRecStyle.trim() && newRecDesc.trim()) {
      setStyleRecommendations((s) => ({
        ...s,
        [newRecKey.trim()]: {
          style: newRecStyle.trim(),
          description: newRecDesc.trim(),
        },
      }))
      setNewRecKey('')
      setNewRecStyle('')
      setNewRecDesc('')
    }
  }

  const removeStyleRecommendation = (key: string) => {
    setStyleRecommendations((s) => {
      const next = { ...s }
      delete next[key]
      return next
    })
  }

  const addReview = () => {
    setReviews((s) => [
      ...s,
      { name: '', text: '', rating: 5, style: tattooStyles[0] ?? 'Línea Fina' },
    ])
  }

  const updateReview = (idx: number, updates: Partial<ReviewDisplay>) => {
    setReviews((s) =>
      s.map((r, i) => (i === idx ? { ...r, ...updates } : r))
    )
  }

  const removeReview = (idx: number) => {
    setReviews((s) => s.filter((_, i) => i !== idx))
  }

  const addAboutStat = () => {
    setAboutStats((s) => [...s, { value: '', label: '' }])
  }

  const updateAboutStat = (idx: number, updates: Partial<AboutStat>) => {
    setAboutStats((s) =>
      s.map((st, i) => (i === idx ? { ...st, ...updates } : st))
    )
  }

  const removeAboutStat = (idx: number) => {
    setAboutStats((s) => s.filter((_, i) => i !== idx))
  }

  const addSpecialty = () => {
    const v = newSpecialtyInput.trim()
    if (v && !aboutSpecialties.includes(v)) {
      setAboutSpecialties((s) => [...s, v])
      setNewSpecialtyInput('')
    }
  }

  const removeSpecialty = (sp: string) => {
    setAboutSpecialties((s) => s.filter((x) => x !== sp))
  }

  const addCertification = () => {
    const v = newCertInput.trim()
    if (v && !aboutCertifications.includes(v)) {
      setAboutCertifications((s) => [...s, v])
      setNewCertInput('')
    }
  }

  const removeCertification = (c: string) => {
    setAboutCertifications((s) => s.filter((x) => x !== c))
  }

  const addQuickReply = () => {
    setQuickReplies((s) => [...s, { label: '', key: '' }])
  }

  const updateQuickReply = (idx: number, updates: Partial<QuickReply>) => {
    setQuickReplies((s) =>
      s.map((qr, i) => (i === idx ? { ...qr, ...updates } : qr))
    )
  }

  const removeQuickReply = (idx: number) => {
    setQuickReplies((s) => s.filter((_, i) => i !== idx))
  }

  const addChatbotResponse = () => {
    if (newChatbotKey.trim()) {
      setChatbotResponses((s) => ({
        ...s,
        [newChatbotKey.trim()]: newChatbotValue,
      }))
      setNewChatbotKey('')
      setNewChatbotValue('')
    }
  }

  const updateChatbotResponse = (key: string, value: string) => {
    setChatbotResponses((s) => ({ ...s, [key]: value }))
  }

  const removeChatbotResponse = (key: string) => {
    setChatbotResponses((s) => {
      const next = { ...s }
      delete next[key]
      return next
    })
  }

  const addCannedResponse = () => {
    setCannedResponses((s) => [...s, ''])
  }

  const updateCannedResponse = (idx: number, value: string) => {
    setCannedResponses((s) =>
      s.map((c, i) => (i === idx ? value : c))
    )
  }

  const removeCannedResponse = (idx: number) => {
    setCannedResponses((s) => s.filter((_, i) => i !== idx))
  }

  if (settingsLoading) {
    return (
      <div className="p-4 pb-28 flex items-center justify-center min-h-[200px]">
        <p className="text-subtle">{t('settings.loading')}</p>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 pb-28"
    >
      {fetchError && (
        <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm">{fetchError}</div>
      )}
      {/* Tab pills */}
      <div className="overflow-x-auto -mx-4 px-4 mb-6 scrollbar-hide">
        <div className="flex gap-2 min-w-max pb-2">
          {TAB_DEFS.map(({ id, i18nKey, icon: Icon }) => (
            <button
              type="button"
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === id
                  ? 'bg-gold text-ink'
                  : 'bg-ink-light text-subtle hover:text-cream border border-white/5'
              }`}
            >
              <Icon size={16} />
              {t(i18nKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Auto-translation status */}
      {dbSettings?._translations && Object.keys(dbSettings._translations).length > 0 && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <Languages size={14} className="text-emerald-400 shrink-0" />
          <p className="text-emerald-400 text-xs">
            {t('settings.autoTranslationActive', { lang: dbSettings._source_lang === 'es' ? 'English' : 'Español' })}
          </p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {activeTab === 'perfil' && (
          <motion.div
            key="perfil"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <motion.section variants={itemVariants}>
              <h2 className="font-serif text-lg text-cream mb-3">{t('settings.profile.title')}</h2>
              <div className="rounded-xl bg-ink-light border border-white/5 p-4 space-y-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl bg-ink-medium border border-white/10 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-8 h-8 text-subtle" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <label htmlFor="settings-studio-name" className={labelClass}>{t('settings.profile.studioName')}</label>
                      <input
                        id="settings-studio-name"
                        type="text"
                        value={studioName}
                        onChange={(e) => setStudioName(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="settings-artist-name" className={labelClass}>{t('settings.profile.artistName')}</label>
                      <input
                        id="settings-artist-name"
                        type="text"
                        value={artistName}
                        onChange={(e) => setArtistName(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="settings-bio" className={labelClass}>{t('settings.profile.bio')}</label>
                  <textarea
                    id="settings-bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className={`${inputClass} resize-none`}
                    placeholder="Cuéntanos sobre tu estudio..."
                  />
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label htmlFor="settings-phone" className={labelClass}>{t('settings.profile.phone')}</label>
                    <input
                      id="settings-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="settings-email" className={labelClass}>{t('settings.profile.email')}</label>
                    <input
                      id="settings-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="settings-address" className={labelClass}>{t('settings.profile.address')}</label>
                    <input
                      id="settings-address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="font-serif text-lg text-cream mb-3">{t('settings.profile.schedule')}</h2>
              <div className="rounded-xl bg-ink-light border border-white/5 p-4 space-y-3">
                {DAY_KEYS.map((key, idx) => {
                  const label = t(`settings.weekdays.${DAY_I18N_KEYS[idx]}`)
                  return (
                  <div
                    key={key}
                    className="flex items-center gap-4 py-2 border-b border-white/5 last:border-0"
                  >
                    <span className="text-cream text-sm w-24">{label}</span>
                    <button
                      type="button"
                      onClick={() => updateSchedule(key, { open: !schedule[key].open })}
                      role="switch"
                      aria-checked={schedule[key].open}
                      aria-label={label}
                      className={`relative w-12 h-7 rounded-full transition-colors ${
                        schedule[key].open ? 'bg-gold' : 'bg-ink-medium'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-5 h-5 rounded-full bg-cream transition-all duration-200 ${
                          schedule[key].open ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                    {schedule[key].open ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="time"
                          value={schedule[key].start}
                          onChange={(e) => updateSchedule(key, { start: e.target.value })}
                          className="px-3 py-1.5 rounded-lg bg-ink border border-white/10 text-cream text-sm focus:outline-none focus:border-gold/50"
                        />
                        <span className="text-subtle text-sm">-</span>
                        <input
                          type="time"
                          value={schedule[key].end}
                          onChange={(e) => updateSchedule(key, { end: e.target.value })}
                          className="px-3 py-1.5 rounded-lg bg-ink border border-white/10 text-cream text-sm focus:outline-none focus:border-gold/50"
                        />
                      </div>
                    ) : (
                      <span className="text-subtle text-sm">{t('settings.profile.closed')}</span>
                    )}
                  </div>
                  )
                })}
                <div className="mt-4 rounded-lg bg-ink p-3">
                  <p className="text-xs text-subtle mb-2">{t('settings.profile.preview')}</p>
                  <p className="text-cream-dark text-sm">
                    {DAY_KEYS.map((key, idx) => {
                      const dayLabel = t(`settings.weekdays.${DAY_I18N_KEYS[idx]}`)
                      const s = schedule[key]
                      const short = dayLabel.slice(0, 2)
                      return s.open ? `${short} ${s.start}-${s.end}` : `${short} ${t('settings.profile.closed')}`
                    }).join(' · ')}
                  </p>
                </div>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="font-serif text-lg text-cream mb-3">{t('settings.profile.basePrices')}</h2>
              <div className="rounded-xl bg-ink-light border border-white/5 p-4 space-y-4">
                {Object.entries(prices).map(([size, range]) => (
                  <div
                    key={size}
                    className="flex items-center gap-4 py-2 border-b border-white/5 last:border-0"
                  >
                    <span className="text-cream text-sm w-32">{SIZE_I18N_MAP[size] ? t(`settings.sizeLabels.${SIZE_I18N_MAP[size]}`) : size}</span>
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="number"
                        min={0}
                        value={range.min}
                        onChange={(e) => updatePrice(size, 'min', parseInt(e.target.value, 10) || 0)}
                        className="w-20 px-3 py-1.5 rounded-lg bg-ink border border-white/10 text-cream text-sm focus:outline-none focus:border-gold/50"
                      />
                      <span className="text-subtle text-sm">-</span>
                      <input
                        type="number"
                        min={0}
                        value={range.max}
                        onChange={(e) => updatePrice(size, 'max', parseInt(e.target.value, 10) || 0)}
                        className="w-20 px-3 py-1.5 rounded-lg bg-ink border border-white/10 text-cream text-sm focus:outline-none focus:border-gold/50"
                      />
                      <span className="text-subtle text-xs">€</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="font-serif text-lg text-cream mb-3">{t('settings.profile.socialLinks')}</h2>
              <div className="rounded-xl bg-ink-light border border-white/5 p-4 space-y-3">
                <div>
                  <label htmlFor="settings-instagram" className={labelClass}>Instagram</label>
                  <input
                    id="settings-instagram"
                    type="url"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/..."
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="settings-tiktok" className={labelClass}>TikTok</label>
                  <input
                    id="settings-tiktok"
                    type="url"
                    value={tiktok}
                    onChange={(e) => setTiktok(e.target.value)}
                    placeholder="https://tiktok.com/@..."
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="settings-website" className={labelClass}>Sitio web</label>
                  <input
                    id="settings-website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://..."
                    className={inputClass}
                  />
                </div>
              </div>
            </motion.section>

            <SaveButton
              onSave={handleSavePerfil}
              saved={savedTab === 'perfil'}
              disabled={settingsLoading || saving}
              error={saveError}
            />
          </motion.div>
        )}

        {activeTab === 'catalogo' && (
          <motion.div
            key="catalogo"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <motion.section variants={itemVariants}>
              <h2 className="font-serif text-lg text-cream mb-3">{t('settings.catalog.tattooStyles')}</h2>
              <div className="rounded-xl bg-ink-light border border-white/5 p-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {tattooStyles.map((style) => (
                    <span
                      key={style}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ink border border-white/10 text-cream text-sm"
                    >
                      {style}
                      <button
                        type="button"
                        onClick={() => removeStyle(style)}
                        className="p-1.5 rounded hover:bg-white/10 text-subtle hover:text-cream inline-flex items-center justify-center min-w-[44px] min-h-[44px]"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newStyleInput}
                    onChange={(e) => setNewStyleInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addStyle()}
                    placeholder={t('settings.catalog.newStyle')}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={addStyle}
                    className="px-4 py-2.5 rounded-xl bg-gold text-ink font-medium flex items-center gap-2 shrink-0 hover:bg-gold-light"
                  >
                    <Plus size={18} />
                    Añadir
                  </button>
                </div>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="font-serif text-lg text-cream mb-3">{t('settings.catalog.bodyParts')}</h2>
              <div className="rounded-xl bg-ink-light border border-white/5 p-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {bodyParts.map((bp) => (
                    <span
                      key={bp}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ink border border-white/10 text-cream text-sm"
                    >
                      {bp}
                      <button
                        type="button"
                        onClick={() => removeBodyPart(bp)}
                        className="p-1.5 rounded hover:bg-white/10 text-subtle hover:text-cream inline-flex items-center justify-center min-w-[44px] min-h-[44px]"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBodyPartInput}
                    onChange={(e) => setNewBodyPartInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addBodyPart()}
                    placeholder={t('settings.catalog.newBodyPart')}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={addBodyPart}
                    className="px-4 py-2.5 rounded-xl bg-gold text-ink font-medium flex items-center gap-2 shrink-0 hover:bg-gold-light"
                  >
                    <Plus size={18} />
                    Añadir
                  </button>
                </div>
              </div>
            </motion.section>

            <SaveButton
              onSave={handleSaveCatalogo}
              saved={savedTab === 'catalogo'}
              disabled={settingsLoading || saving}
              error={saveError}
            />
          </motion.div>
        )}

        {activeTab === 'sugerencias' && (
          <motion.div
            key="sugerencias"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <motion.section variants={itemVariants}>
              <h2 className="font-serif text-lg text-cream mb-3">{t('settings.suggestions.title')}</h2>
              <div className="rounded-xl bg-ink-light border border-white/5 p-4 space-y-4">
                {suggestions.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-xl bg-ink border border-white/5 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <input
                        type="text"
                        value={s.title}
                        onChange={(e) => updateSuggestion(s.id, { title: e.target.value })}
                        placeholder={t('settings.suggestions.titlePlaceholder')}
                        className={`${inputClass} flex-1 mr-2`}
                      />
                      <button
                        type="button"
                        onClick={() => removeSuggestion(s.id)}
                        className="p-2 rounded-lg hover:bg-white/10 text-subtle hover:text-cream"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <textarea
                      value={s.description}
                      onChange={(e) => updateSuggestion(s.id, { description: e.target.value })}
                      placeholder={t('settings.suggestions.descriptionPlaceholder')}
                      rows={2}
                      className={`${inputClass} resize-none`}
                    />
                    <div className="flex gap-3 flex-wrap">
                      <div className="flex-1 min-w-[120px]">
                        <label className={labelClass}>{t('settings.content.reviewStyle')}</label>
                        <select
                          value={s.style}
                          onChange={(e) => updateSuggestion(s.id, { style: e.target.value })}
                          className={inputClass}
                        >
                          {tattooStyles.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24">
                        <label className={labelClass}>Popularidad (0-100)</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={s.popularity}
                          onChange={(e) =>
                            updateSuggestion(s.id, {
                              popularity: parseInt(e.target.value, 10) || 0,
                            })
                          }
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSuggestion}
                  className="w-full py-3 rounded-xl border border-dashed border-white/20 text-subtle hover:text-cream hover:border-gold/50 flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  {t('settings.suggestions.addSuggestion')}
                </button>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="font-serif text-lg text-cream mb-3">{t('settings.suggestions.quizTitle')}</h2>
              <div className="rounded-xl bg-ink-light border border-white/5 p-4 space-y-4">
                {quizQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl bg-ink border border-white/5 space-y-3"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => updateQuizQuestion(q.id, { question: e.target.value })}
                        placeholder={t('settings.suggestions.questionPlaceholder')}
                        className={`${inputClass} flex-1`}
                      />
                      <button
                        type="button"
                        onClick={() => removeQuizQuestion(q.id)}
                        className="p-2 rounded-lg hover:bg-white/10 text-subtle hover:text-cream shrink-0"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div>
                      <label className={labelClass}>Opciones</label>
                      <div className="space-y-2">
                        {q.options.map((opt, i) => (
                          <div key={i} className="flex gap-2">
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) =>
                                updateQuizQuestionOption(q.id, i, e.target.value)
                              }
                              placeholder={t('settings.suggestions.optionPlaceholder', { index: i + 1 })}
                              className={inputClass}
                            />
                            <button
                              type="button"
                              onClick={() => removeQuizQuestionOption(q.id, i)}
                              className="p-2 rounded-lg hover:bg-white/10 text-subtle hover:text-cream shrink-0"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addQuizQuestionOption(q.id)}
                          className="text-sm text-gold hover:underline"
                        >
                          {t('settings.suggestions.addOption')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addQuizQuestion}
                  className="w-full py-3 rounded-xl border border-dashed border-white/20 text-subtle hover:text-cream hover:border-gold/50 flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  {t('settings.suggestions.addQuestion')}
                </button>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="font-serif text-lg text-cream mb-3">{t('settings.suggestions.recommendations')}</h2>
              <div className="rounded-xl bg-ink-light border border-white/5 p-4 space-y-4">
                {Object.entries(styleRecommendations).map(([key, rec]) => (
                  <div
                    key={key}
                    className="flex items-start gap-3 p-3 rounded-lg bg-ink border border-white/5"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-cream text-sm font-medium truncate">{key}</p>
                      <p className="text-subtle text-xs">
                        {rec.style} — {rec.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeStyleRecommendation(key)}
                      className="p-2 rounded-lg hover:bg-white/10 text-subtle hover:text-cream shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2 flex-wrap">
                  <input
                    type="text"
                    value={newRecKey}
                    onChange={(e) => setNewRecKey(e.target.value)}
                    placeholder="Clave (ej: Naturaleza-Minimalista)"
                    className={`${inputClass} flex-1 min-w-[140px]`}
                  />
                  <input
                    type="text"
                    value={newRecStyle}
                    onChange={(e) => setNewRecStyle(e.target.value)}
                    placeholder="Estilo"
                    className={`${inputClass} w-32`}
                  />
                  <input
                    type="text"
                    value={newRecDesc}
                    onChange={(e) => setNewRecDesc(e.target.value)}
                    placeholder="Descripción"
                    className={`${inputClass} flex-1 min-w-[140px]`}
                  />
                  <button
                    type="button"
                    onClick={addStyleRecommendation}
                    className="px-4 py-2.5 rounded-xl bg-gold text-ink font-medium flex items-center gap-2 shrink-0 hover:bg-gold-light"
                  >
                    <Plus size={18} />
                    Añadir
                  </button>
                </div>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="font-serif text-lg text-cream mb-3">{t('settings.suggestions.trendingThreshold')}</h2>
              <div className="rounded-xl bg-ink-light border border-white/5 p-4">
                <label className={labelClass}>
                  {t('settings.suggestions.trendingDescription')}
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={trendingThreshold}
                  onChange={(e) =>
                    setTrendingThreshold(parseInt(e.target.value, 10) || 0)
                  }
                  className={`${inputClass} max-w-[120px]`}
                />
              </div>
            </motion.section>

            <SaveButton
              onSave={handleSaveSugerencias}
              saved={savedTab === 'sugerencias'}
              disabled={settingsLoading || saving}
              error={saveError}
            />
          </motion.div>
        )}

        {activeTab === 'contenido' && (
          <motion.div
            key="contenido"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <motion.section variants={itemVariants}>
              <h2 className="font-serif text-lg text-cream mb-3">{t('settings.content.homePage')}</h2>
              <div className="rounded-xl bg-ink-light border border-white/5 p-4 space-y-3">
                <div>
                  <label className={labelClass}>{t('settings.content.subtitleLabel')}</label>
                  <input
                    type="text"
                    value={homeSubtitle}
                    onChange={(e) => setHomeSubtitle(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('settings.content.tagline')}</label>
                  <input
                    type="text"
                    value={homeTagline}
                    onChange={(e) => setHomeTagline(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="font-serif text-lg text-cream mb-3">{t('settings.content.reviews')}</h2>
              <div className="rounded-xl bg-ink-light border border-white/5 p-4 space-y-4">
                {reviews.map((r, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-ink border border-white/5 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <input
                        type="text"
                        value={r.name}
                        onChange={(e) => updateReview(idx, { name: e.target.value })}
                        placeholder={t('settings.content.reviewName')}
                        className={`${inputClass} flex-1 mr-2`}
                      />
                      <button
                        type="button"
                        onClick={() => removeReview(idx)}
                        className="p-2 rounded-lg hover:bg-white/10 text-subtle hover:text-cream"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <textarea
                      value={r.text}
                      onChange={(e) => updateReview(idx, { text: e.target.value })}
                      placeholder={t('settings.content.reviewText')}
                      rows={2}
                      className={`${inputClass} resize-none`}
                    />
                    <div className="flex gap-3">
                      <div className="w-24">
                        <label className={labelClass}>{t('settings.content.reviewRating')}</label>
                        <input
                          type="number"
                          min={1}
                          max={5}
                          value={r.rating}
                          onChange={(e) =>
                            updateReview(idx, {
                              rating: parseInt(e.target.value, 10) || 1,
                            })
                          }
                          className={inputClass}
                        />
                      </div>
                      <div className="flex-1">
                        <label className={labelClass}>{t('settings.content.reviewStyle')}</label>
                        <select
                          value={r.style}
                          onChange={(e) => updateReview(idx, { style: e.target.value })}
                          className={inputClass}
                        >
                          {tattooStyles.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addReview}
                  className="w-full py-3 rounded-xl border border-dashed border-white/20 text-subtle hover:text-cream hover:border-gold/50 flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  {t('settings.content.addReview')}
                </button>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="font-serif text-lg text-cream mb-3">{t('settings.content.aboutPage')}</h2>
              <div className="rounded-xl bg-ink-light border border-white/5 p-4 space-y-4">
                <div>
                  <label className={labelClass}>{t('settings.content.heroImage')}</label>
                  <input
                    type="url"
                    value={aboutHeroImage}
                    onChange={(e) => setAboutHeroImage(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('settings.content.artistTitle')}</label>
                  <input
                    type="text"
                    value={aboutArtistTitle}
                    onChange={(e) => setAboutArtistTitle(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('settings.content.bio')}</label>
                  <textarea
                    value={aboutBio}
                    onChange={(e) => setAboutBio(e.target.value)}
                    rows={4}
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('settings.content.stats')}</label>
                  <div className="space-y-3">
                    {aboutStats.map((st, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={st.value}
                          onChange={(e) => updateAboutStat(idx, { value: e.target.value })}
                          placeholder={t('settings.content.statValue')}
                          className={`${inputClass} w-24`}
                        />
                        <input
                          type="text"
                          value={st.label}
                          onChange={(e) => updateAboutStat(idx, { label: e.target.value })}
                          placeholder={t('settings.content.statLabel')}
                          className={`${inputClass} flex-1`}
                        />
                        <button
                          type="button"
                          onClick={() => removeAboutStat(idx)}
                          className="p-2 rounded-lg hover:bg-white/10 text-subtle hover:text-cream"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addAboutStat}
                      className="text-sm text-gold hover:underline"
                    >
                      {t('settings.content.addStat')}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('settings.content.specialties')}</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {aboutSpecialties.map((sp) => (
                      <span
                        key={sp}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ink border border-white/10 text-cream text-sm"
                      >
                        {sp}
                        <button
                          type="button"
                          onClick={() => removeSpecialty(sp)}
                          className="p-1.5 rounded hover:bg-white/10 text-subtle hover:text-cream inline-flex items-center justify-center min-w-[44px] min-h-[44px]"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSpecialtyInput}
                      onChange={(e) => setNewSpecialtyInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addSpecialty()}
                      placeholder={t('settings.content.newSpecialty')}
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={addSpecialty}
                      className="px-4 py-2.5 rounded-xl bg-gold text-ink font-medium flex items-center gap-2 shrink-0 hover:bg-gold-light"
                    >
                      <Plus size={18} />
                      Añadir
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('settings.content.certifications')}</label>
                  <div className="space-y-2 mb-2">
                    {aboutCertifications.map((c) => (
                      <div
                        key={c}
                        className="flex items-center justify-between p-2 rounded-lg bg-ink border border-white/5"
                      >
                        <span className="text-cream text-sm">{c}</span>
                        <button
                          type="button"
                          onClick={() => removeCertification(c)}
                          className="p-1 rounded hover:bg-white/10 text-subtle hover:text-cream"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCertInput}
                      onChange={(e) => setNewCertInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCertification()}
                      placeholder={t('settings.content.newCertification')}
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={addCertification}
                      className="px-4 py-2.5 rounded-xl bg-gold text-ink font-medium flex items-center gap-2 shrink-0 hover:bg-gold-light"
                    >
                      <Plus size={18} />
                      Añadir
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>

            <SaveButton
              onSave={handleSaveContenido}
              saved={savedTab === 'contenido'}
              disabled={settingsLoading || saving}
              error={saveError}
            />
          </motion.div>
        )}

        {activeTab === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <motion.section variants={itemVariants}>
              <h2 className="font-serif text-lg text-cream mb-3">{t('settings.chatConfig.title')}</h2>
              <div className="rounded-xl bg-ink-light border border-white/5 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>{t('settings.chatConfig.artistName')}</label>
                    <input
                      type="text"
                      value={chatArtistName}
                      onChange={(e) => setChatArtistName(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('settings.chatConfig.initials')}</label>
                    <input
                      type="text"
                      value={chatArtistInitials}
                      onChange={(e) => setChatArtistInitials(e.target.value)}
                      placeholder={t('settings.chatConfig.initialsDefault')}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('settings.chatConfig.welcomeMessage')}</label>
                  <textarea
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('settings.chatConfig.responseTime')}</label>
                  <input
                    type="text"
                    value={responseTimeText}
                    onChange={(e) => setResponseTimeText(e.target.value)}
                    placeholder={t('settings.chatConfig.responseTimeDefault')}
                    className={inputClass}
                  />
                </div>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="font-serif text-lg text-cream mb-3">{t('settings.chatConfig.quickReplies')}</h2>
              <div className="rounded-xl bg-ink-light border border-white/5 p-4 space-y-3">
                {quickReplies.map((qr, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={qr.label}
                      onChange={(e) => updateQuickReply(idx, { label: e.target.value })}
                      placeholder={t('settings.chatConfig.replyLabel')}
                      className={`${inputClass} flex-1`}
                    />
                    <input
                      type="text"
                      value={qr.key}
                      onChange={(e) => updateQuickReply(idx, { key: e.target.value })}
                      placeholder={t('settings.chatConfig.replyKey')}
                      className={`${inputClass} w-32`}
                    />
                    <button
                      type="button"
                      onClick={() => removeQuickReply(idx)}
                      className="p-2 rounded-lg hover:bg-white/10 text-subtle hover:text-cream"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addQuickReply}
                  className="w-full py-3 rounded-xl border border-dashed border-white/20 text-subtle hover:text-cream hover:border-gold/50 flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  {t('settings.chatConfig.addQuickReply')}
                </button>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="font-serif text-lg text-cream mb-3">{t('settings.chatConfig.botResponses')}</h2>
              <div className="rounded-xl bg-ink-light border border-white/5 p-4 space-y-4">
                {Object.entries(chatbotResponses).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-cream text-sm font-medium">{key}</span>
                      <button
                        type="button"
                        onClick={() => removeChatbotResponse(key)}
                        className="p-1 rounded hover:bg-white/10 text-subtle hover:text-cream"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <textarea
                      value={value}
                      onChange={(e) => updateChatbotResponse(key, e.target.value)}
                      rows={4}
                      className={`${inputClass} resize-none text-sm`}
                    />
                  </div>
                ))}
                <div className="pt-3 border-t border-white/5 space-y-2">
                  <label className={labelClass}>{t('settings.chatConfig.addBotResponse')}</label>
                  <input
                    type="text"
                    value={newChatbotKey}
                    onChange={(e) => setNewChatbotKey(e.target.value)}
                    placeholder={t('settings.chatConfig.botKey')}
                    className={inputClass}
                  />
                  <textarea
                    value={newChatbotValue}
                    onChange={(e) => setNewChatbotValue(e.target.value)}
                    placeholder={t('settings.chatConfig.botValue')}
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                  <button
                    type="button"
                    onClick={addChatbotResponse}
                    className="px-4 py-2.5 rounded-xl bg-gold text-ink font-medium flex items-center gap-2 hover:bg-gold-light"
                  >
                    <Plus size={18} />
                    {t('settings.chatConfig.addBotResponseBtn')}
                  </button>
                </div>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="font-serif text-lg text-cream mb-3">{t('settings.chatConfig.cannedResponses')}</h2>
              <div className="rounded-xl bg-ink-light border border-white/5 p-4 space-y-3">
                {cannedResponses.map((c, idx) => (
                  <div key={idx} className="flex gap-2">
                    <textarea
                      value={c}
                      onChange={(e) => updateCannedResponse(idx, e.target.value)}
                      rows={2}
                      placeholder={t('settings.chatConfig.cannedPlaceholder')}
                      className={`${inputClass} flex-1 resize-none`}
                    />
                    <button
                      type="button"
                      onClick={() => removeCannedResponse(idx)}
                      className="p-2 rounded-lg hover:bg-white/10 text-subtle hover:text-cream shrink-0"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCannedResponse}
                  className="w-full py-3 rounded-xl border border-dashed border-white/20 text-subtle hover:text-cream hover:border-gold/50 flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  {t('settings.chatConfig.addCanned')}
                </button>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="font-serif text-lg text-cream mb-3">{t('settings.chatConfig.fallbackResponse')}</h2>
              <div className="rounded-xl bg-ink-light border border-white/5 p-4">
                <label className={labelClass}>
                  {t('settings.chatConfig.fallbackHint')}
                </label>
                <textarea
                  value={fallbackResponse}
                  onChange={(e) => setFallbackResponse(e.target.value)}
                  rows={4}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </motion.section>

            <SaveButton
              onSave={handleSaveChat}
              saved={savedTab === 'chat'}
              disabled={settingsLoading || saving}
              error={saveError}
            />
          </motion.div>
        )}

        {activeTab === 'notificaciones' && (
          <motion.div
            key="notificaciones"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <motion.section variants={itemVariants}>
              <h2 className="font-serif text-lg text-cream mb-3">{t('settings.tabs.notifications')}</h2>
              <div className="rounded-xl bg-ink-light border border-white/5 p-4 space-y-4">
                {[
                  {
                    key: 'newBooking' as const,
                    label: t('settings.notificationSettings.newBooking'),
                    desc: t('settings.notificationSettings.newBookingDesc'),
                    value: newBooking,
                    setter: setNewBooking,
                  },
                  {
                    key: 'messageNotification' as const,
                    label: t('settings.notificationSettings.newMessage'),
                    desc: t('settings.notificationSettings.newMessageDesc'),
                    value: messageNotification,
                    setter: setMessageNotification,
                  },
                  {
                    key: 'reminderNotification' as const,
                    label: t('settings.notificationSettings.reminders'),
                    desc: t('settings.notificationSettings.remindersDesc'),
                    value: reminderNotification,
                    setter: setReminderNotification,
                  },
                  {
                    key: 'depositReceived' as const,
                    label: t('settings.notificationSettings.depositReceived'),
                    desc: t('settings.notificationSettings.depositReceivedDesc'),
                    value: depositReceived,
                    setter: setDepositReceived,
                  },
                ].map(({ label, desc, value, setter }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                  >
                    <div>
                      <p className="text-cream text-sm font-medium">{label}</p>
                      <p className="text-subtle text-xs">{desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setter(!value)}
                      role="switch"
                      aria-checked={value}
                      aria-label={label}
                      className={`relative w-12 h-7 rounded-full transition-colors ${
                        value ? 'bg-gold' : 'bg-ink-medium'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-5 h-5 rounded-full bg-cream transition-all duration-200 ${
                          value ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </motion.section>

            <SaveButton
              onSave={handleSaveNotificaciones}
              saved={savedTab === 'notificaciones'}
              disabled={settingsLoading || saving}
              error={saveError}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function SaveButton({
  onSave,
  saved,
  disabled,
  error,
}: {
  onSave: () => void
  saved: boolean
  disabled: boolean
  error?: string | null
}) {
  const { t } = useTranslation('studio')
  return (
    <motion.section variants={itemVariants}>
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2"
          >
            <CheckCircle size={16} className="text-emerald-400" />
            <p className="text-emerald-400 text-sm">{t('settings.saveButton.saved')}</p>
          </motion.div>
        )}
      </AnimatePresence>
      {error && (
        <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}
      <button
        type="button"
        onClick={onSave}
        disabled={disabled}
        className="w-full py-4 rounded-xl bg-gold text-ink font-serif font-semibold flex items-center justify-center gap-2 hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Save size={20} />
        {t('settings.saveButton.saveChanges')}
      </button>
    </motion.section>
  )
}
