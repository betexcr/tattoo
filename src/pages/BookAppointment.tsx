import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Upload,
  CalendarDays,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../lib/firebase'
import { useStudioConfig } from '../contexts/StudioConfigContext'
import { defaultTattooStyles, defaultBodyParts } from '../data/defaults'
import { useAppointments } from '../hooks/useAppointments'
import { useRequireAuth } from '../hooks/useRequireAuth'
import { mapFirestoreError } from '../utils/mapFirestoreError'
import { useNotifications } from '../hooks/useNotifications'

const SIZE_IDS = ['tiny', 'small', 'medium', 'large', 'xlarge'] as const
const SIZE_ICONS: Record<string, string> = { tiny: '·', small: '●', medium: '⬤', large: '⬤', xlarge: '⬤' }
const STEP_IDS = ['style', 'design', 'body', 'size', 'datetime', 'contact', 'confirm'] as const

const WEEKDAY_SLOTS = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']
const SATURDAY_SLOTS = ['10:00', '11:00', '12:00', '13:00', '14:00']
const BOOKING_STORAGE_KEY = 'booking-draft'

function formatDateKey(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${year}-${m}-${d}`
}

function getDayOfWeek(date: Date): number {
  return (date.getDay() + 6) % 7
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
}

export default function BookAppointment() {
  const { t, i18n: i18nInstance } = useTranslation('booking')
  const { t: tDefaults } = useTranslation('defaults')
  const navigate = useNavigate()
  const { config } = useStudioConfig()
  const { create, getOccupiedSlots } = useAppointments()
  const { user, requireAuth, authPrompt } = useRequireAuth()
  const { create: createNotification } = useNotifications(user?.uid)
  const occupiedSlots = getOccupiedSlots()

  const STEPS = useMemo(() => STEP_IDS.map(id => ({
    id,
    title: t(`steps.${id}.title`),
    subtitle: t(`steps.${id}.subtitle`),
  })), [t])

  const sizes = useMemo(() => SIZE_IDS.map(id => ({
    id,
    label: t(`sizes.${id}.label`),
    desc: t(`sizes.${id}.desc`),
    icon: SIZE_ICONS[id],
    estimate: t(`sizes.${id}.estimate`),
    price: t(`sizes.${id}.price`),
  })), [t])

  const WEEKDAY_LABELS = t('weekdays', { returnObjects: true }) as string[]
  const monthNames = t('monthNames', { returnObjects: true }) as string[]

  const translateStyle = useMemo(() => {
    const translated = tDefaults('tattooStyles', { returnObjects: true }) as string[]
    const map = new Map(defaultTattooStyles.map((s, i) => [s, translated[i]]))
    return (key: string) => map.get(key) ?? key
  }, [tDefaults])

  const translateBodyPart = useMemo(() => {
    const translated = tDefaults('bodyParts', { returnObjects: true }) as string[]
    const map = new Map(defaultBodyParts.map((p, i) => [p, translated[i]]))
    return (key: string) => map.get(key) ?? key
  }, [tDefaults])

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)

  const [selectedStyle, setSelectedStyle] = useState('')
  const [description, setDescription] = useState('')
  const [referenceImages, setReferenceImages] = useState<string[]>([])
  const [selectedBodyPart, setSelectedBodyPart] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [contact, setContact] = useState({ name: '', phone: '', email: '', notes: '' })
  const [booked, setBooked] = useState(false)

  const today = useMemo(() => {
    const t = new Date()
    return formatDateKey(t.getFullYear(), t.getMonth(), t.getDate())
  }, [])

  const [calendarView, setCalendarView] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  const timeSlotsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(BOOKING_STORAGE_KEY)
      if (!saved) return
      const s = JSON.parse(saved)
      if (s.selectedStyle) setSelectedStyle(s.selectedStyle)
      if (s.description) setDescription(s.description)
      if (s.referenceImages) setReferenceImages(s.referenceImages)
      if (s.selectedBodyPart) setSelectedBodyPart(s.selectedBodyPart)
      if (s.selectedSize) setSelectedSize(s.selectedSize)
      if (s.selectedDate) setSelectedDate(s.selectedDate)
      if (s.selectedTime) setSelectedTime(s.selectedTime)
      if (s.contact) setContact(s.contact)
      if (typeof s.step === 'number') setStep(s.step)
      sessionStorage.removeItem(BOOKING_STORAGE_KEY)
    } catch { /* ignore corrupt data */ }
  }, [])

  useEffect(() => {
    if (selectedDate && timeSlotsRef.current) {
      setTimeout(() => {
        timeSlotsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 150)
    }
  }, [selectedDate])

  const currentStep = STEPS[step]

  const canProceed = () => {
    switch (step) {
      case 0: return selectedStyle !== ''
      case 1: return description.trim().length > 0
      case 2: return selectedBodyPart !== ''
      case 3: return selectedSize !== ''
      case 4: return selectedDate !== '' && selectedTime !== ''
      case 5: return contact.name.trim() !== '' && contact.phone.trim() !== ''
      case 6: return true
      default: return false
    }
  }

  const [bookingError, setBookingError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const goNext = async () => {
    if (step === STEPS.length - 1) {
      if (!user) {
        sessionStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify({
          selectedStyle, description, referenceImages, selectedBodyPart,
          selectedSize, selectedDate, selectedTime, contact, step,
        }))
        requireAuth('/book')
        return
      }
      if (submitting) return
      setBookingError('')
      setSubmitting(true)
      try {
        const result = await create({
          client_id: user?.uid ?? null,
          client_name: contact.name,
          date: selectedDate,
          time: selectedTime,
          description,
          body_part: selectedBodyPart,
          style: selectedStyle,
          status: 'pending',
          deposit: 0,
          phone: contact.phone,
          email: contact.email,
          reference_images: referenceImages,
          size: selectedSize,
          notes: contact.notes,
        })
        if (result?.error) {
          setBookingError(t('errors.bookingFailed'))
          return
        }
        try {
          await createNotification({
            user_id: user?.uid ?? '',
            title: t('notification.title'),
            body: t('notification.body', { style: selectedStyle, date: selectedDate, time: selectedTime }),
            type: 'appointment',
            link: '/agenda',
          })
        } catch { /* notification is best-effort */ }
        sessionStorage.removeItem(BOOKING_STORAGE_KEY)
        setBooked(true)
        return
      } catch (e: unknown) {
        setBookingError(mapFirestoreError(e))
      } finally {
        setSubmitting(false)
      }
    }
    setDirection(1)
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const goBack = () => {
    if (step === 0) {
      navigate(-1)
      return
    }
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 0))
  }

  const handleImageUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = async () => {
      if (!input.files) return
      const files = Array.from(input.files)
      const uploaded: string[] = []
      for (const file of files) {
        try {
          const path = `booking-refs/${Date.now()}-${file.name}`
          const storageRef = ref(storage, path)
          await uploadBytes(storageRef, file)
          const url = await getDownloadURL(storageRef)
          uploaded.push(url)
        } catch {
          setBookingError(t('errors.uploadFailed', { name: file.name }))
        }
      }
      setReferenceImages(prev => [...prev, ...uploaded])
    }
    input.click()
  }

  const selectedSizeData = sizes.find((s) => s.id === selectedSize)

  const calendarDays = useMemo(() => {
    const { year, month } = calendarView
    const first = new Date(year, month, 1)
    const last = new Date(year, month + 1, 0)
    const daysInMonth = last.getDate()
    const startOffset = getDayOfWeek(first)
    const cells: { date: string; day: number; isCurrentMonth: boolean; isPast: boolean; isSunday: boolean; isSaturday: boolean; isFullyBooked: boolean; isSelectable: boolean }[] = []

    for (let i = 0; i < startOffset; i++) {
      const prevMonth = new Date(year, month, -startOffset + i + 1)
      const d = prevMonth.getDate()
      const dateKey = formatDateKey(prevMonth.getFullYear(), prevMonth.getMonth(), d)
      const isPast = dateKey < today
      const isSunday = prevMonth.getDay() === 0
      const isSaturday = prevMonth.getDay() === 6
      const occupied = occupiedSlots[dateKey] ?? []
      const slots = isSaturday ? SATURDAY_SLOTS : isSunday ? [] : WEEKDAY_SLOTS
      const isFullyBooked = slots.length > 0 && slots.every((s) => occupied.includes(s))
      const isSelectable = !isPast && !isSunday && !isFullyBooked

      cells.push({ date: dateKey, day: d, isCurrentMonth: false, isPast, isSunday, isSaturday, isFullyBooked, isSelectable })
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = formatDateKey(year, month, d)
      const dateObj = new Date(year, month, d)
      const isPast = dateKey < today
      const isSunday = dateObj.getDay() === 0
      const isSaturday = dateObj.getDay() === 6
      const occupied = occupiedSlots[dateKey] ?? []
      const slots = isSaturday ? SATURDAY_SLOTS : isSunday ? [] : WEEKDAY_SLOTS
      const isFullyBooked = slots.length > 0 && slots.every((s) => occupied.includes(s))
      const isSelectable = !isPast && !isSunday && !isFullyBooked

      cells.push({ date: dateKey, day: d, isCurrentMonth: true, isPast, isSunday, isSaturday, isFullyBooked, isSelectable })
    }

    const remaining = 42 - cells.length
    for (let i = 0; i < remaining; i++) {
      const nextMonth = new Date(year, month + 1, i + 1)
      const d = nextMonth.getDate()
      const dateKey = formatDateKey(nextMonth.getFullYear(), nextMonth.getMonth(), d)
      const isPast = dateKey < today
      const isSunday = nextMonth.getDay() === 0
      const isSaturday = nextMonth.getDay() === 6
      const occupied = occupiedSlots[dateKey] ?? []
      const slots = isSaturday ? SATURDAY_SLOTS : isSunday ? [] : WEEKDAY_SLOTS
      const isFullyBooked = slots.length > 0 && slots.every((s) => occupied.includes(s))
      const isSelectable = !isPast && !isSunday && !isFullyBooked

      cells.push({ date: dateKey, day: d, isCurrentMonth: false, isPast, isSunday, isSaturday, isFullyBooked, isSelectable })
    }

    return cells
  }, [calendarView, today, occupiedSlots])

  const filteredCalendarDays = useMemo(() => {
    const weeks: typeof calendarDays[number][][] = []
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7))
    }
    let startIdx = 0
    for (const week of weeks) {
      if (week.every(cell => cell.isPast)) startIdx++
      else break
    }
    return weeks.slice(startIdx).flat()
  }, [calendarDays])

  const timeSlotsForDate = useMemo(() => {
    if (!selectedDate) return []
    const [y, m, d] = selectedDate.split('-').map(Number)
    const dateObj = new Date(y, m - 1, d)
    const isSaturday = dateObj.getDay() === 6
    return isSaturday ? SATURDAY_SLOTS : WEEKDAY_SLOTS
  }, [selectedDate])

  const selectedDateLabel = useMemo(() => {
    if (!selectedDate) return ''
    const [y, m, d] = selectedDate.split('-').map(Number)
    const dateObj = new Date(y, m - 1, d)
    const days = t('shortDays', { returnObjects: true }) as string[]
    const months = t('shortMonths', { returnObjects: true }) as string[]
    return `${days[dateObj.getDay()]} ${d} ${months[dateObj.getMonth()]}`
  }, [selectedDate, t])

  if (booked) {
    return (
      <div className="min-h-dvh bg-ink flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center mb-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
          >
            <Check size={36} className="text-gold" />
          </motion.div>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="font-serif text-2xl text-cream mb-2"
        >
          {t('success.title')}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-subtle text-sm mb-8 max-w-xs"
        >
          {t('success.description')}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-xs space-y-4 p-5 rounded-2xl bg-ink-light border border-white/5"
        >
          <div className="flex justify-between text-sm">
            <span className="text-subtle">{t('summary.style')}</span>
            <span className="text-cream">{translateStyle(selectedStyle)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-subtle">{t('summary.zone')}</span>
            <span className="text-cream">{translateBodyPart(selectedBodyPart)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-subtle">{t('summary.size')}</span>
            <span className="text-cream">{sizes.find((s) => s.id === selectedSize)?.label}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-subtle">{t('summary.date')}</span>
            <span className="text-cream">{selectedDateLabel}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-subtle">{t('summary.time')}</span>
            <span className="text-cream">{selectedTime}</span>
          </div>
          <div className="border-t border-white/5 pt-3 flex justify-between text-sm">
            <span className="text-subtle">{t('summary.estimate')}</span>
            <span className="text-gold font-medium">{selectedSizeData?.price}</span>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 space-y-3 w-full max-w-xs"
        >
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full py-3.5 rounded-xl bg-gold text-ink font-medium hover:bg-gold-light transition-colors"
          >
            {t('success.goHome')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/reminders')}
            className="w-full py-3.5 rounded-xl border border-gold/30 text-gold font-medium hover:bg-gold/5 transition-colors"
          >
            {t('success.viewReminders')}
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-ink flex flex-col">
      {authPrompt}
      {/* Header */}
      <header className="sticky top-0 z-40 bg-ink/90 backdrop-blur-lg border-b border-white/5 pt-[env(safe-area-inset-top,0px)]">
        <div className="flex items-center justify-between px-5 h-14">
          <button
            type="button"
            onClick={goBack}
            aria-label={t('prevStep')}
            className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center text-subtle hover:text-cream transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="text-center">
            <p className="text-cream text-sm font-medium">{currentStep.title}</p>
            <p className="text-subtle text-[10px]">{t('stepOf', { current: step + 1, total: STEPS.length })}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label={t('closeBooking')}
            className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center text-subtle hover:text-cream transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 bg-ink-medium">
          <motion.div
            className="h-full bg-gradient-to-r from-gold to-gold-light"
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>
      </header>

      {/* Step content */}
      <div className="flex-1 overflow-x-hidden relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="px-5 pt-6 pb-32"
          >
            <p className="text-subtle text-sm mb-6">{currentStep.subtitle}</p>

            {/* Step 0: Style */}
            {step === 0 && (
              <div className="grid grid-cols-2 gap-2.5">
                {config.tattoo_styles.map((style) => (
                  <button
                    type="button"
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    aria-pressed={selectedStyle === style}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedStyle === style
                        ? 'border-gold bg-gold/10 text-gold'
                        : 'border-white/5 bg-ink-light text-cream hover:border-white/10'
                    }`}
                  >
                    <span className="text-sm font-medium">{translateStyle(style)}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Step 1: Design description */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label htmlFor="book-description" className="block text-xs text-subtle mb-2">{t('design.describeIdea')}</label>
                  <textarea
                    id="book-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('design.placeholder')}
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl bg-ink-light border border-white/5 text-cream placeholder:text-subtle/50 focus:outline-none focus:border-gold/50 resize-none text-sm leading-relaxed"
                  />
                  <p className="text-subtle text-[11px] mt-1.5">
                    {t('design.helper')}
                  </p>
                </div>

                <div>
                  <label className="block text-xs text-subtle mb-2">{t('design.referenceImages')}</label>
                  <div className="flex gap-3 flex-wrap">
                    {referenceImages.map((img, i) => (
                      <div key={img} className="relative w-20 h-20 rounded-xl overflow-visible border border-white/10">
                        <img src={img} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover rounded-xl" />
                        <button
                          type="button"
                          onClick={() => setReferenceImages((prev) => prev.filter((_, idx) => idx !== i))}
                          aria-label={t('design.removeImage')}
                          className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-ink/80 flex items-center justify-center shadow-sm border border-white/10"
                        >
                          <X size={14} className="text-cream" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleImageUpload}
                      className="w-20 h-20 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-1 text-subtle hover:text-cream hover:border-gold/30 transition-colors"
                    >
                      <Upload size={16} />
                      <span className="text-[9px]">{t('design.upload')}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Body part */}
            {step === 2 && (
              <div className="grid grid-cols-3 gap-2.5">
                {config.body_parts.map((part) => (
                  <button
                    type="button"
                    key={part}
                    onClick={() => setSelectedBodyPart(part)}
                    aria-pressed={selectedBodyPart === part}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selectedBodyPart === part
                        ? 'border-gold bg-gold/10 text-gold'
                        : 'border-white/5 bg-ink-light text-cream hover:border-white/10'
                    }`}
                  >
                    <span className="text-xs font-medium">{translateBodyPart(part)}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Step 3: Size */}
            {step === 3 && (
              <div className="space-y-3">
                {sizes.map((size) => (
                  <button
                    type="button"
                    key={size.id}
                    onClick={() => setSelectedSize(size.id)}
                    aria-pressed={selectedSize === size.id}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      selectedSize === size.id
                        ? 'border-gold bg-gold/10'
                        : 'border-white/5 bg-ink-light hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium text-sm ${selectedSize === size.id ? 'text-gold' : 'text-cream'}`}>
                        {size.label}
                      </span>
                      <span className="text-gold text-xs font-medium">{size.price}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-subtle text-xs">{size.desc}</span>
                      <span className="text-subtle text-[11px]">{size.estimate}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 4: Date & Time - Full Calendar + Occupied Slots */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CalendarDays size={14} className="text-gold" />
                    <span className="text-xs text-subtle">{t('calendar.chooseDate')}</span>
                  </div>

                  {/* Calendar header with month navigation */}
                  <div className="flex items-center justify-between mb-3">
                    <button
                      type="button"
                      onClick={() => setCalendarView((v) => ({
                        ...v,
                        month: v.month === 0 ? 11 : v.month - 1,
                        year: v.month === 0 ? v.year - 1 : v.year,
                      }))}
                      aria-label={t('calendar.prevMonth')}
                      className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center text-subtle hover:text-cream transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="font-serif text-cream text-sm">
                      {monthNames[calendarView.month]} {calendarView.year}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCalendarView((v) => ({
                        ...v,
                        month: v.month === 11 ? 0 : v.month + 1,
                        year: v.month === 11 ? v.year + 1 : v.year,
                      }))}
                      aria-label={t('calendar.nextMonth')}
                      className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center text-subtle hover:text-cream transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Day names row */}
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {WEEKDAY_LABELS.map((label) => (
                      <div key={label} className="text-center text-[10px] text-subtle font-medium py-1">
                        {label}
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {filteredCalendarDays.map((cell) => {
                      const isToday = cell.date === today
                      const isSelected = cell.date === selectedDate

                      const fullDate = new Date(cell.date + 'T12:00:00')
                      const dateLabel = fullDate.toLocaleDateString(i18nInstance.language, { day: 'numeric', month: 'long', year: 'numeric' })

                      return (
                        <button
                          key={cell.date}
                          type="button"
                          onClick={() => {
                            if (cell.isSelectable) {
                              setSelectedDate(cell.date)
                              setSelectedTime('')
                            }
                          }}
                          disabled={!cell.isSelectable}
                          aria-label={dateLabel}
                          aria-selected={isSelected}
                          className={`
                            h-10 rounded-lg text-sm font-medium transition-all
                            ${!cell.isCurrentMonth ? 'text-subtle/40' : ''}
                            ${cell.isPast ? 'opacity-40 cursor-not-allowed' : ''}
                            ${cell.isSunday ? 'opacity-30 cursor-not-allowed' : ''}
                            ${cell.isFullyBooked ? 'opacity-50 text-subtle cursor-not-allowed bg-ink-medium/50' : ''}
                            ${cell.isSelectable ? 'cursor-pointer hover:border-gold/50' : 'cursor-not-allowed'}
                            ${isSelected ? 'border-2 border-gold bg-gold/20 text-gold' : ''}
                            ${!isSelected && cell.isSelectable && !cell.isFullyBooked ? 'border border-white/5 bg-ink-light text-cream' : ''}
                            ${isToday && !isSelected ? 'ring-1 ring-gold/50' : ''}
                          `}
                        >
                          {cell.day}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {selectedDate && (
                  <motion.div
                    ref={timeSlotsRef}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Clock size={14} className="text-gold" />
                      <span className="text-xs text-subtle">{t('calendar.slotsFor', { date: selectedDateLabel })}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                      {timeSlotsForDate.map((time) => {
                        const occupied = (occupiedSlots[selectedDate] ?? []).includes(time)
                        const isSelected = selectedTime === time

                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => !occupied && setSelectedTime(time)}
                            disabled={occupied}
                            className={`
                              py-3 rounded-xl border text-center transition-all relative
                              ${occupied
                                ? 'bg-red-500/5 border-red-500/10 text-subtle line-through pointer-events-none opacity-50'
                                : isSelected
                                  ? 'border-gold bg-gold/10 text-gold'
                                  : 'border-white/5 bg-ink-light text-cream hover:border-white/10'
                              }
                            `}
                          >
                            <span className="text-sm font-medium">{time}</span>
                            {occupied && (
                              <span className="absolute -top-1 -right-1 text-[8px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">
                                {t('calendar.occupied')}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Step 5: Contact info */}
            {step === 5 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="book-name" className="block text-xs text-subtle mb-1.5">{t('contactForm.fullName')}</label>
                  <input
                    id="book-name"
                    type="text"
                    value={contact.name}
                    onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
                    placeholder={t('contactForm.namePlaceholder')}
                    className="w-full px-4 py-3 rounded-xl bg-ink-light border border-white/5 text-cream placeholder:text-subtle/50 focus:outline-none focus:border-gold/50 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="book-phone" className="block text-xs text-subtle mb-1.5">{t('contactForm.whatsapp')}</label>
                  <input
                    id="book-phone"
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
                    placeholder={t('contactForm.phonePlaceholder')}
                    className="w-full px-4 py-3 rounded-xl bg-ink-light border border-white/5 text-cream placeholder:text-subtle/50 focus:outline-none focus:border-gold/50 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="book-email" className="block text-xs text-subtle mb-1.5">{t('contactForm.email')}</label>
                  <input
                    id="book-email"
                    type="email"
                    value={contact.email}
                    onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                    placeholder={t('contactForm.emailPlaceholder')}
                    className="w-full px-4 py-3 rounded-xl bg-ink-light border border-white/5 text-cream placeholder:text-subtle/50 focus:outline-none focus:border-gold/50 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="book-notes" className="block text-xs text-subtle mb-1.5">{t('contactForm.notes')}</label>
                  <textarea
                    id="book-notes"
                    value={contact.notes}
                    onChange={(e) => setContact((c) => ({ ...c, notes: e.target.value }))}
                    placeholder={t('contactForm.notesPlaceholder')}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-ink-light border border-white/5 text-cream placeholder:text-subtle/50 focus:outline-none focus:border-gold/50 resize-none text-sm"
                  />
                </div>
              </div>
            )}

            {/* Step 6: Confirmation summary */}
            {step === 6 && (
              <div className="space-y-5">
                <div className="p-5 rounded-2xl bg-ink-light border border-white/5 space-y-4">
                  <h3 className="font-serif text-cream text-lg flex items-center gap-2">
                    <Sparkles size={16} className="text-gold" />
                    {t('confirmStep.summaryTitle')}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-subtle">{t('summary.style')}</span>
                      <span className="text-cream font-medium">{translateStyle(selectedStyle)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-subtle">{t('summary.zone')}</span>
                      <span className="text-cream font-medium">{translateBodyPart(selectedBodyPart)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-subtle">{t('summary.size')}</span>
                      <span className="text-cream font-medium">{selectedSizeData?.label} ({selectedSizeData?.desc})</span>
                    </div>
                    <div className="border-t border-white/5 my-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-subtle">{t('summary.date')}</span>
                      <span className="text-cream font-medium">{selectedDateLabel}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-subtle">{t('summary.time')}</span>
                      <span className="text-cream font-medium">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-subtle">{t('summary.duration')}</span>
                      <span className="text-cream font-medium">{selectedSizeData?.estimate}</span>
                    </div>
                    <div className="border-t border-white/5 my-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-subtle">{t('summary.client')}</span>
                      <span className="text-cream font-medium">{contact.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-subtle">{t('summary.contactLabel')}</span>
                      <span className="text-cream font-medium">{contact.phone}</span>
                    </div>
                    <div className="border-t border-white/5 my-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-subtle">{t('summary.estimatedPrice')}</span>
                      <span className="text-gold font-serif text-lg">{selectedSizeData?.price}</span>
                    </div>
                  </div>
                </div>

                {description && (
                  <div className="p-4 rounded-xl bg-ink-medium/60 border border-white/5">
                    <p className="text-[11px] text-subtle mb-1">{t('confirmStep.designDescription')}</p>
                    <p className="text-cream text-sm leading-relaxed">{description}</p>
                  </div>
                )}

                <p className="text-subtle text-[11px] text-center leading-relaxed">
                  {t('confirmStep.disclaimer')}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-ink/95 backdrop-blur-lg border-t border-white/5 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {bookingError && (
          <p className="text-rose text-sm text-center mb-2">{bookingError}</p>
        )}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={goBack}
              aria-label={t('prevStep')}
              className="px-5 py-3.5 rounded-xl border border-white/10 text-cream text-sm font-medium hover:bg-white/5 transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={goNext}
            disabled={!canProceed() || submitting}
            className={`flex-1 py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
              canProceed() && !submitting
                ? 'bg-gold text-ink hover:bg-gold-light'
                : 'bg-ink-medium text-subtle cursor-not-allowed'
            }`}
          >
            {step === STEPS.length - 1 ? (
              <>
                <Check size={16} />
                {submitting ? t('reserving') : t('confirmReservation')}
              </>
            ) : (
              <>
                {t('continue')}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
