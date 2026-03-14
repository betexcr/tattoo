import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { tattooStyles, bodyParts } from '../data/constants'
import { useAppointments } from '../hooks/useAppointments'
import { useAuth } from '../contexts/AuthContext'

const STEPS = [
  { id: 'style', title: 'Estilo', subtitle: 'Elige tu estilo de tatuaje' },
  { id: 'design', title: 'Diseño', subtitle: 'Describe tu idea' },
  { id: 'body', title: 'Ubicación', subtitle: '¿Dónde lo quieres?' },
  { id: 'size', title: 'Tamaño', subtitle: 'Elige el tamaño' },
  { id: 'datetime', title: 'Fecha y Hora', subtitle: 'Escoge tu horario' },
  { id: 'contact', title: 'Tus Datos', subtitle: 'Para confirmar tu cita' },
  { id: 'confirm', title: 'Confirmación', subtitle: '¡Todo listo!' },
]

const sizes = [
  { id: 'tiny', label: 'Tiny', desc: '2-5 cm', icon: '·', estimate: '30-60 min', price: '€50-80' },
  { id: 'small', label: 'Pequeño', desc: '5-10 cm', icon: '●', estimate: '1-2 horas', price: '€80-150' },
  { id: 'medium', label: 'Mediano', desc: '10-20 cm', icon: '⬤', estimate: '2-4 horas', price: '€150-300' },
  { id: 'large', label: 'Grande', desc: '20-35 cm', icon: '⬤', estimate: '4-6 horas', price: '€300-500' },
  { id: 'xlarge', label: 'Extra Grande', desc: '35+ cm', icon: '⬤', estimate: '6+ horas (varias sesiones)', price: '€500+' },
]

const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

const WEEKDAY_SLOTS = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']
const SATURDAY_SLOTS = ['10:00', '11:00', '12:00', '13:00', '14:00']

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
  const navigate = useNavigate()
  const { create, getOccupiedSlots } = useAppointments()
  const { user } = useAuth()
  const occupiedSlots = getOccupiedSlots()
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

  const [calendarView, setCalendarView] = useState({ year: 2026, month: 2 })

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

  const goNext = async () => {
    if (step === STEPS.length - 1) {
      await create({
        client_id: user?.id ?? null,
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
      } as any)
      setBooked(true)
      return
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
    input.onchange = () => {
      if (!input.files) return
      const urls = Array.from(input.files).map((file) => URL.createObjectURL(file))
      setReferenceImages((prev) => [...prev, ...urls])
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
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    return `${days[dateObj.getDay()]} ${d} ${months[dateObj.getMonth()]}`
  }, [selectedDate])

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

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
          ¡Cita Reservada!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-subtle text-sm mb-8 max-w-xs"
        >
          Te enviaremos una confirmación por WhatsApp. Recuerda que el depósito
          se coordina directamente con la artista.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-xs space-y-4 p-5 rounded-2xl bg-ink-light border border-white/5"
        >
          <div className="flex justify-between text-sm">
            <span className="text-subtle">Estilo</span>
            <span className="text-cream">{selectedStyle}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-subtle">Zona</span>
            <span className="text-cream">{selectedBodyPart}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-subtle">Tamaño</span>
            <span className="text-cream">{sizes.find((s) => s.id === selectedSize)?.label}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-subtle">Fecha</span>
            <span className="text-cream">{selectedDateLabel}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-subtle">Hora</span>
            <span className="text-cream">{selectedTime}</span>
          </div>
          <div className="border-t border-white/5 pt-3 flex justify-between text-sm">
            <span className="text-subtle">Estimado</span>
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
            onClick={() => navigate('/')}
            className="w-full py-3.5 rounded-xl bg-gold text-ink font-medium hover:bg-gold-light transition-colors"
          >
            Volver al inicio
          </button>
          <button
            onClick={() => navigate('/reminders')}
            className="w-full py-3.5 rounded-xl border border-gold/30 text-gold font-medium hover:bg-gold/5 transition-colors"
          >
            Ver mis recordatorios
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-ink flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-ink/90 backdrop-blur-lg border-b border-white/5">
        <div className="flex items-center justify-between px-5 h-14">
          <button
            onClick={goBack}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-subtle hover:text-cream transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="text-center">
            <p className="text-cream text-sm font-medium">{currentStep.title}</p>
            <p className="text-subtle text-[10px]">Paso {step + 1} de {STEPS.length}</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-subtle hover:text-cream transition-colors"
          >
            <X size={16} />
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
      <div className="flex-1 overflow-hidden relative">
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
                {tattooStyles.map((style) => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedStyle === style
                        ? 'border-gold bg-gold/10 text-gold'
                        : 'border-white/5 bg-ink-light text-cream hover:border-white/10'
                    }`}
                  >
                    <span className="text-sm font-medium">{style}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Step 1: Design description */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs text-subtle mb-2">Describe tu idea de tatuaje</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ej: Quiero una rosa pequeña con hojas delicadas en estilo fine line, con un toque de geometría en los pétalos..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl bg-ink-light border border-white/5 text-cream placeholder:text-subtle/50 focus:outline-none focus:border-gold/50 resize-none text-sm leading-relaxed"
                  />
                  <p className="text-subtle text-[11px] mt-1.5">
                    Cuanto más detalle nos des, mejor podremos preparar tu diseño
                  </p>
                </div>

                <div>
                  <label className="block text-xs text-subtle mb-2">Imágenes de referencia (opcional)</label>
                  <div className="flex gap-3 flex-wrap">
                    {referenceImages.map((img, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => setReferenceImages((prev) => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-ink/80 flex items-center justify-center"
                        >
                          <X size={10} className="text-cream" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={handleImageUpload}
                      className="w-20 h-20 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-1 text-subtle hover:text-cream hover:border-gold/30 transition-colors"
                    >
                      <Upload size={16} />
                      <span className="text-[9px]">Subir</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Body part */}
            {step === 2 && (
              <div className="grid grid-cols-3 gap-2.5">
                {bodyParts.map((part) => (
                  <button
                    key={part}
                    onClick={() => setSelectedBodyPart(part)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selectedBodyPart === part
                        ? 'border-gold bg-gold/10 text-gold'
                        : 'border-white/5 bg-ink-light text-cream hover:border-white/10'
                    }`}
                  >
                    <span className="text-xs font-medium">{part}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Step 3: Size */}
            {step === 3 && (
              <div className="space-y-3">
                {sizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size.id)}
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
                    <span className="text-xs text-subtle">Elige una fecha disponible</span>
                  </div>

                  {/* Calendar header with month navigation */}
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => setCalendarView((v) => ({
                        ...v,
                        month: v.month === 0 ? 11 : v.month - 1,
                        year: v.month === 0 ? v.year - 1 : v.year,
                      }))}
                      className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-subtle hover:text-cream transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="font-serif text-cream text-sm">
                      {monthNames[calendarView.month]} {calendarView.year}
                    </span>
                    <button
                      onClick={() => setCalendarView((v) => ({
                        ...v,
                        month: v.month === 11 ? 0 : v.month + 1,
                        year: v.month === 11 ? v.year + 1 : v.year,
                      }))}
                      className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-subtle hover:text-cream transition-colors"
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
                    {calendarDays.map((cell) => {
                      const isToday = cell.date === today
                      const isSelected = cell.date === selectedDate

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
                          className={`
                            aspect-square rounded-lg text-sm font-medium transition-all
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
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Clock size={14} className="text-gold" />
                      <span className="text-xs text-subtle">Horarios para {selectedDateLabel}</span>
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
                                Ocupado
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
                  <label className="block text-xs text-subtle mb-1.5">Nombre completo *</label>
                  <input
                    type="text"
                    value={contact.name}
                    onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
                    placeholder="Tu nombre"
                    className="w-full px-4 py-3 rounded-xl bg-ink-light border border-white/5 text-cream placeholder:text-subtle/50 focus:outline-none focus:border-gold/50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-subtle mb-1.5">WhatsApp / Teléfono *</label>
                  <input
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
                    placeholder="+34 612 345 678"
                    className="w-full px-4 py-3 rounded-xl bg-ink-light border border-white/5 text-cream placeholder:text-subtle/50 focus:outline-none focus:border-gold/50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-subtle mb-1.5">Email (opcional)</label>
                  <input
                    type="email"
                    value={contact.email}
                    onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                    placeholder="tu@email.com"
                    className="w-full px-4 py-3 rounded-xl bg-ink-light border border-white/5 text-cream placeholder:text-subtle/50 focus:outline-none focus:border-gold/50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-subtle mb-1.5">Notas adicionales</label>
                  <textarea
                    value={contact.notes}
                    onChange={(e) => setContact((c) => ({ ...c, notes: e.target.value }))}
                    placeholder="Alergias, preferencias, preguntas..."
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
                    Resumen de tu cita
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-subtle">Estilo</span>
                      <span className="text-cream font-medium">{selectedStyle}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-subtle">Zona</span>
                      <span className="text-cream font-medium">{selectedBodyPart}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-subtle">Tamaño</span>
                      <span className="text-cream font-medium">{selectedSizeData?.label} ({selectedSizeData?.desc})</span>
                    </div>
                    <div className="border-t border-white/5 my-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-subtle">Fecha</span>
                      <span className="text-cream font-medium">{selectedDateLabel}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-subtle">Hora</span>
                      <span className="text-cream font-medium">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-subtle">Duración estimada</span>
                      <span className="text-cream font-medium">{selectedSizeData?.estimate}</span>
                    </div>
                    <div className="border-t border-white/5 my-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-subtle">Cliente</span>
                      <span className="text-cream font-medium">{contact.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-subtle">Contacto</span>
                      <span className="text-cream font-medium">{contact.phone}</span>
                    </div>
                    <div className="border-t border-white/5 my-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-subtle">Precio estimado</span>
                      <span className="text-gold font-serif text-lg">{selectedSizeData?.price}</span>
                    </div>
                  </div>
                </div>

                {description && (
                  <div className="p-4 rounded-xl bg-ink-medium/60 border border-white/5">
                    <p className="text-[11px] text-subtle mb-1">Descripción del diseño</p>
                    <p className="text-cream text-sm leading-relaxed">{description}</p>
                  </div>
                )}

                <p className="text-subtle text-[11px] text-center leading-relaxed">
                  Al confirmar, la artista revisará tu solicitud y te contactará
                  por WhatsApp para coordinar el depósito y los detalles finales del diseño.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-ink/95 backdrop-blur-lg border-t border-white/5 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={goBack}
              className="px-5 py-3.5 rounded-xl border border-white/10 text-cream text-sm font-medium hover:bg-white/5 transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <button
            onClick={goNext}
            disabled={!canProceed()}
            className={`flex-1 py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
              canProceed()
                ? 'bg-gold text-ink hover:bg-gold-light'
                : 'bg-ink-medium text-subtle cursor-not-allowed'
            }`}
          >
            {step === STEPS.length - 1 ? (
              <>
                <Check size={16} />
                Confirmar Reserva
              </>
            ) : (
              <>
                Continuar
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
