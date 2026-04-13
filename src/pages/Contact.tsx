import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import PageHeader from '../components/PageHeader'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, Mail, MapPin, Clock, Instagram, Video, LayoutGrid, CheckCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useStudioConfig } from '../contexts/StudioConfigContext'
import { useContactForm } from '../hooks/useContactForm'
import { safeHref } from '../utils/safeHref'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

export default function Contact() {
  const { t } = useTranslation('contact')
  const { t: tc } = useTranslation()
  const { config } = useStudioConfig()

  const formatScheduleDisplay = useCallback((schedule: Record<string, unknown>): string => {
    if (!schedule || Object.keys(schedule).length === 0) {
      return t('checkSchedule')
    }
    const parts: string[] = []
    const dayMap: Record<string, string> = {
      monday: t('days.monday'), tuesday: t('days.tuesday'), wednesday: t('days.wednesday'), thursday: t('days.thursday'),
      friday: t('days.friday'), saturday: t('days.saturday'), sunday: t('days.sunday'),
    }
    for (const [k, v] of Object.entries(schedule)) {
      const day = dayMap[k.toLowerCase()] ?? k
      if (v && typeof v === 'object' && v !== null) {
        const obj = v as { open?: boolean; start?: string; end?: string }
        if (obj.open === false) continue
        if (obj.start && obj.end) {
          parts.push(`${day} ${obj.start}–${obj.end}`)
        }
      } else if (typeof v === 'string' && v) {
        parts.push(`${day} ${v}`)
      }
    }
    return parts.length > 0 ? parts.join(', ') : t('checkSchedule')
  }, [t])
  const { submit, loading: submitting } = useContactForm()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    tattooStyle: '',
    bodyPart: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const submittedTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => { clearTimeout(submittedTimerRef.current) }, [])

  const contactInfo = useMemo(
    () => [
      { icon: Phone as LucideIcon, label: t('info.phone'), value: config.phone },
      { icon: Mail as LucideIcon, label: t('info.email'), value: config.email },
      { icon: MapPin as LucideIcon, label: t('info.location'), value: config.address },
      { icon: Clock as LucideIcon, label: t('info.schedule'), value: formatScheduleDisplay(config.schedule) },
    ],
    [config.phone, config.email, config.address, config.schedule, t, formatScheduleDisplay]
  )

  const socialLinks = useMemo(() => {
    const links: { label: string; icon: LucideIcon; href: string }[] = []
    if (config.social_links.instagram) {
      links.push({ label: 'Instagram', icon: Instagram, href: config.social_links.instagram })
    }
    if (config.social_links.tiktok) {
      links.push({ label: 'TikTok', icon: Video, href: config.social_links.tiktok })
    }
    if (config.social_links.website) {
      links.push({ label: 'Web', icon: LayoutGrid, href: config.social_links.website })
    }
    return links
  }, [config.social_links])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await submit({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
      tattoo_style: formData.tattooStyle,
      body_part: formData.bodyPart,
    })
    if (error) {
      setSubmitError(error)
      return
    }
    setSubmitError(null)
    setSubmitted(true)
    setFormData({ name: '', email: '', phone: '', message: '', tattooStyle: '', bodyPart: '' })
    submittedTimerRef.current = setTimeout(() => setSubmitted(false), 4000)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="min-h-dvh bg-ink">
      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      <div className="px-5 pb-12">
        {/* Contact info cards */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-2 gap-3 py-6"
        >
          {contactInfo.map(({ icon: Icon, label, value }) => (
            <motion.div
              key={label}
              variants={itemVariants}
              className="p-4 rounded-xl bg-ink-medium/40 border border-white/5"
            >
              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold mb-2">
                <Icon size={16} strokeWidth={1.5} />
              </div>
              <p className="text-subtle text-[11px] uppercase tracking-wide">{label}</p>
              <p className="text-cream text-sm font-medium mt-0.5">{value}</p>
            </motion.div>
          ))}
        </motion.section>

        {/* Success feedback */}
        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3"
            >
              <CheckCircle size={20} className="text-emerald-400 shrink-0" />
              <div>
                <p className="text-emerald-400 text-sm font-medium">{t('success.title')}</p>
                <p className="text-emerald-400/70 text-xs">{t('success.description')}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {submitError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
            <p className="text-red-400 text-sm">{submitError}</p>
          </motion.div>
        )}

        {/* Contact form */}
        <motion.form
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={containerVariants}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <motion.div variants={itemVariants}>
            <label htmlFor="name" className="block text-cream-dark text-sm mb-1.5">
              {t('form.name')}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-ink-medium border border-white/5 text-cream placeholder:text-subtle focus:border-gold/40 focus:outline-none transition-colors"
              placeholder={t('form.namePlaceholder')}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label htmlFor="email" className="block text-cream-dark text-sm mb-1.5">
              {t('form.email')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-ink-medium border border-white/5 text-cream placeholder:text-subtle focus:border-gold/40 focus:outline-none transition-colors"
              placeholder={t('form.emailPlaceholder')}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label htmlFor="phone" className="block text-cream-dark text-sm mb-1.5">
              {t('form.phone')}
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-ink-medium border border-white/5 text-cream placeholder:text-subtle focus:border-gold/40 focus:outline-none transition-colors"
              placeholder={t('form.phonePlaceholder')}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label htmlFor="tattooStyle" className="block text-cream-dark text-sm mb-1.5">
              {t('form.tattooStyle')}
            </label>
            <select
              id="tattooStyle"
              name="tattooStyle"
              value={formData.tattooStyle}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-ink-medium border border-white/5 text-cream focus:border-gold/40 focus:outline-none transition-colors appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b6b6b' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                paddingRight: '36px',
              }}
            >
              <option value="">{t('form.selectStyle')}</option>
              {config.tattoo_styles.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label htmlFor="bodyPart" className="block text-cream-dark text-sm mb-1.5">
              {t('form.bodyZone')}
            </label>
            <select
              id="bodyPart"
              name="bodyPart"
              value={formData.bodyPart}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-ink-medium border border-white/5 text-cream focus:border-gold/40 focus:outline-none transition-colors appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b6b6b' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                paddingRight: '36px',
              }}
            >
              <option value="">{t('form.selectZone')}</option>
              {config.body_parts.map((part) => (
                <option key={part} value={part}>
                  {part}
                </option>
              ))}
            </select>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label htmlFor="message" className="block text-cream-dark text-sm mb-1.5">
              {t('form.message')}
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-ink-medium border border-white/5 text-cream placeholder:text-subtle focus:border-gold/40 focus:outline-none transition-colors resize-none"
              placeholder={t('form.messagePlaceholder')}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl font-medium text-ink bg-gradient-to-r from-gold to-gold-dark hover:from-gold-light hover:to-gold transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? tc('sending') : t('form.submit')}
            </button>
          </motion.div>
        </motion.form>

        {/* Social links */}
        {socialLinks.length > 0 && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={containerVariants}
            className="pt-10"
          >
            <motion.div
              variants={itemVariants}
              className="flex justify-center gap-4"
            >
              {socialLinks.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={safeHref(href)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full bg-ink-medium border border-white/5 flex items-center justify-center text-gold hover:bg-gold/10 hover:border-gold/30 transition-colors"
                  aria-label={label}
                >
                  <Icon size={18} strokeWidth={1.5} />
                </a>
              ))}
            </motion.div>
          </motion.section>
        )}
      </div>
    </div>
  )
}
