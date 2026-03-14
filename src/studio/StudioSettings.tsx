import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, Image as ImageIcon, CheckCircle } from 'lucide-react'
import { useStudioSettings } from '../hooks/useStudioSettings'

interface DaySchedule {
  open: boolean
  start: string
  end: string
}

interface PriceRange {
  min: number
  max: number
}

const DAYS = [
  { key: 'lunes', label: 'Lunes' },
  { key: 'martes', label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves', label: 'Jueves' },
  { key: 'viernes', label: 'Viernes' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
] as const

const SIZE_LABELS: Record<string, string> = {
  tiny: 'Tiny (2-5cm)',
  small: 'Small (5-10cm)',
  medium: 'Medium (10-20cm)',
  large: 'Large (20-35cm)',
  xl: 'XL (35+cm)',
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

export default function StudioSettings() {
  const { settings: dbSettings, loading: settingsLoading, save: saveSettings } = useStudioSettings()
  const [settings, setSettings] = useState({
    studioName: 'INK & SOUL',
    artistName: 'Valentina Reyes',
    bio: '',
    phone: '+34 612 345 678',
    email: 'hola@inkandsoul.com',
    address: 'Calle del Arte 12, Madrid',
    schedule: { ...defaultSchedule },
    prices: { ...defaultPrices },
    instagram: '',
    tiktok: '',
    website: '',
    newBooking: true,
    messageNotification: true,
    reminderNotification: true,
    depositReceived: true,
  })

  useEffect(() => {
    if (dbSettings) {
      const social = (dbSettings.social_links ?? {}) as Record<string, string>
      const notif = (dbSettings.notifications ?? {}) as Record<string, boolean>
      setSettings((prev) => ({
        ...prev,
        studioName: dbSettings.studio_name,
        artistName: dbSettings.artist_name,
        bio: dbSettings.bio ?? '',
        phone: dbSettings.phone ?? '',
        email: dbSettings.email ?? '',
        address: dbSettings.address ?? '',
        schedule: (dbSettings.schedule as Record<string, DaySchedule>) ?? prev.schedule,
        prices: (dbSettings.prices as Record<string, PriceRange>) ?? prev.prices,
        instagram: social.instagram ?? '',
        tiktok: social.tiktok ?? '',
        website: social.website ?? '',
        newBooking: notif.new_booking ?? true,
        messageNotification: notif.message_notification ?? true,
        reminderNotification: notif.reminder_notification ?? true,
        depositReceived: notif.deposit_received ?? true,
      }))
    }
  }, [dbSettings])

  const updateSchedule = (day: string, updates: Partial<DaySchedule>) => {
    setSettings((s) => ({
      ...s,
      schedule: {
        ...s.schedule,
        [day]: { ...s.schedule[day], ...updates },
      },
    }))
  }

  const updatePrice = (size: string, field: 'min' | 'max', value: number) => {
    setSettings((s) => ({
      ...s,
      prices: {
        ...s.prices,
        [size]: { ...s.prices[size], [field]: value },
      },
    }))
  }

  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    const { error } = await saveSettings({
      studio_name: settings.studioName,
      artist_name: settings.artistName,
      bio: settings.bio,
      phone: settings.phone,
      email: settings.email,
      address: settings.address,
      schedule: settings.schedule as Record<string, unknown>,
      prices: settings.prices as Record<string, unknown>,
      social_links: {
        instagram: settings.instagram,
        tiktok: settings.tiktok,
        website: settings.website,
      },
      notifications: {
        new_booking: settings.newBooking,
        message_notification: settings.messageNotification,
        reminder_notification: settings.reminderNotification,
        deposit_received: settings.depositReceived,
      },
    })
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  if (settingsLoading) {
    return (
      <div className="p-4 pb-28 flex items-center justify-center min-h-[200px]">
        <p className="text-subtle">Cargando configuración...</p>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 pb-28 space-y-6"
    >
      {/* 1. Perfil del Estudio */}
      <motion.section variants={itemVariants}>
        <h2 className="font-serif text-lg text-cream mb-3">Perfil del Estudio</h2>
        <div className="rounded-xl bg-ink-light border border-white/5 p-4 space-y-4">
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-xl bg-ink-medium border border-white/10 flex items-center justify-center shrink-0">
              <ImageIcon className="w-8 h-8 text-subtle" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <label className="block text-xs text-subtle mb-1">Nombre del estudio</label>
                <input
                  type="text"
                  value={settings.studioName}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, studioName: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-ink border border-white/10 text-cream placeholder:text-subtle focus:outline-none focus:border-gold/50"
                />
              </div>
              <div>
                <label className="block text-xs text-subtle mb-1">Nombre del artista</label>
                <input
                  type="text"
                  value={settings.artistName}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, artistName: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-ink border border-white/10 text-cream placeholder:text-subtle focus:outline-none focus:border-gold/50"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs text-subtle mb-1">Bio</label>
            <textarea
              value={settings.bio}
              onChange={(e) =>
                setSettings((s) => ({ ...s, bio: e.target.value }))
              }
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-ink border border-white/10 text-cream placeholder:text-subtle focus:outline-none focus:border-gold/50 resize-none"
              placeholder="Cuéntanos sobre tu estudio..."
            />
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs text-subtle mb-1">Teléfono</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, phone: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-xl bg-ink border border-white/10 text-cream placeholder:text-subtle focus:outline-none focus:border-gold/50"
              />
            </div>
            <div>
              <label className="block text-xs text-subtle mb-1">Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, email: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-xl bg-ink border border-white/10 text-cream placeholder:text-subtle focus:outline-none focus:border-gold/50"
              />
            </div>
            <div>
              <label className="block text-xs text-subtle mb-1">Dirección</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, address: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-xl bg-ink border border-white/10 text-cream placeholder:text-subtle focus:outline-none focus:border-gold/50"
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* 2. Horario de Trabajo */}
      <motion.section variants={itemVariants}>
        <h2 className="font-serif text-lg text-cream mb-3">Horario de Trabajo</h2>
        <div className="rounded-xl bg-ink-light border border-white/5 p-4 space-y-3">
          {DAYS.map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center gap-4 py-2 border-b border-white/5 last:border-0"
            >
              <span className="text-cream text-sm w-24">{label}</span>
              <button
                onClick={() =>
                  updateSchedule(key, {
                    open: !settings.schedule[key].open,
                  })
                }
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  settings.schedule[key].open ? 'bg-gold' : 'bg-ink-medium'
                }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 rounded-full bg-cream transition-all duration-200 ${
                    settings.schedule[key].open ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
              {settings.schedule[key].open ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={settings.schedule[key].start}
                    onChange={(e) =>
                      updateSchedule(key, { start: e.target.value })
                    }
                    className="px-3 py-1.5 rounded-lg bg-ink border border-white/10 text-cream text-sm focus:outline-none focus:border-gold/50"
                  />
                  <span className="text-subtle text-sm">-</span>
                  <input
                    type="time"
                    value={settings.schedule[key].end}
                    onChange={(e) =>
                      updateSchedule(key, { end: e.target.value })
                    }
                    className="px-3 py-1.5 rounded-lg bg-ink border border-white/10 text-cream text-sm focus:outline-none focus:border-gold/50"
                  />
                </div>
              ) : (
                <span className="text-subtle text-sm">Cerrado</span>
              )}
            </div>
          ))}
          <div className="mt-4 rounded-lg bg-ink p-3">
            <p className="text-xs text-subtle mb-2">Vista previa</p>
            <p className="text-cream-dark text-sm">
              {DAYS.map(({ key, label }) => {
                const s = settings.schedule[key]
                const short = label.slice(0, 2)
                return s.open
                  ? `${short} ${s.start}-${s.end}`
                  : `${short} Cerrado`
              }).join(' · ')}
            </p>
          </div>
        </div>
      </motion.section>

      {/* 3. Precios Base */}
      <motion.section variants={itemVariants}>
        <h2 className="font-serif text-lg text-cream mb-3">Precios Base</h2>
        <div className="rounded-xl bg-ink-light border border-white/5 p-4 space-y-4">
          {Object.entries(settings.prices).map(([size, range]) => (
            <div
              key={size}
              className="flex items-center gap-4 py-2 border-b border-white/5 last:border-0"
            >
              <span className="text-cream text-sm w-32">
                {SIZE_LABELS[size] ?? size}
              </span>
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="number"
                  min={0}
                  value={range.min}
                  onChange={(e) =>
                    updatePrice(size, 'min', parseInt(e.target.value, 10) || 0)
                  }
                  className="w-20 px-3 py-1.5 rounded-lg bg-ink border border-white/10 text-cream text-sm focus:outline-none focus:border-gold/50"
                />
                <span className="text-subtle text-sm">-</span>
                <input
                  type="number"
                  min={0}
                  value={range.max}
                  onChange={(e) =>
                    updatePrice(size, 'max', parseInt(e.target.value, 10) || 0)
                  }
                  className="w-20 px-3 py-1.5 rounded-lg bg-ink border border-white/10 text-cream text-sm focus:outline-none focus:border-gold/50"
                />
                <span className="text-subtle text-xs">€</span>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* 4. Redes Sociales */}
      <motion.section variants={itemVariants}>
        <h2 className="font-serif text-lg text-cream mb-3">Redes Sociales</h2>
        <div className="rounded-xl bg-ink-light border border-white/5 p-4 space-y-3">
          <div>
            <label className="block text-xs text-subtle mb-1">Instagram</label>
            <input
              type="url"
              value={settings.instagram}
              onChange={(e) =>
                setSettings((s) => ({ ...s, instagram: e.target.value }))
              }
              placeholder="https://instagram.com/..."
              className="w-full px-4 py-2.5 rounded-xl bg-ink border border-white/10 text-cream placeholder:text-subtle focus:outline-none focus:border-gold/50"
            />
          </div>
          <div>
            <label className="block text-xs text-subtle mb-1">TikTok</label>
            <input
              type="url"
              value={settings.tiktok}
              onChange={(e) =>
                setSettings((s) => ({ ...s, tiktok: e.target.value }))
              }
              placeholder="https://tiktok.com/@..."
              className="w-full px-4 py-2.5 rounded-xl bg-ink border border-white/10 text-cream placeholder:text-subtle focus:outline-none focus:border-gold/50"
            />
          </div>
          <div>
            <label className="block text-xs text-subtle mb-1">Sitio web</label>
            <input
              type="url"
              value={settings.website}
              onChange={(e) =>
                setSettings((s) => ({ ...s, website: e.target.value }))
              }
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-xl bg-ink border border-white/10 text-cream placeholder:text-subtle focus:outline-none focus:border-gold/50"
            />
          </div>
        </div>
      </motion.section>

      {/* 5. Notificaciones */}
      <motion.section variants={itemVariants}>
        <h2 className="font-serif text-lg text-cream mb-3">Notificaciones</h2>
        <div className="rounded-xl bg-ink-light border border-white/5 p-4 space-y-4">
          {[
            {
              key: 'newBooking' as const,
              label: 'Nueva reserva',
              desc: 'Recibir aviso cuando un cliente reserve una cita',
            },
            {
              key: 'messageNotification' as const,
              label: 'Nuevo mensaje',
              desc: 'Aviso cuando recibas un mensaje en el chat',
            },
            {
              key: 'reminderNotification' as const,
              label: 'Recordatorios',
              desc: 'Recordatorios de citas pendientes',
            },
            {
              key: 'depositReceived' as const,
              label: 'Depósito recibido',
              desc: 'Confirmación cuando se reciba un depósito',
            },
          ].map(({ key, label, desc }) => (
            <div
              key={key}
              className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
            >
              <div>
                <p className="text-cream text-sm font-medium">{label}</p>
                <p className="text-subtle text-xs">{desc}</p>
              </div>
              <button
                onClick={() =>
                  setSettings((s) => ({ ...s, [key]: !s[key] }))
                }
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  settings[key] ? 'bg-gold' : 'bg-ink-medium'
                }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 rounded-full bg-cream transition-all duration-200 ${
                    settings[key] ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </motion.section>

      {/* 6. Save button */}
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
              <p className="text-emerald-400 text-sm">Cambios guardados correctamente</p>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={handleSave}
          disabled={!dbSettings}
          className="w-full py-4 rounded-xl bg-gold text-ink font-serif font-semibold flex items-center justify-center gap-2 hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={20} />
          Guardar Cambios
        </button>
      </motion.section>
    </motion.div>
  )
}
