import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, Mail, MapPin, Clock, Instagram, Video, LayoutGrid, CheckCircle } from 'lucide-react'
import { bodyParts, tattooStyles } from '../data/constants'
import { useContactForm } from '../hooks/useContactForm'

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

const contactInfo = [
  {
    icon: Phone,
    label: 'Teléfono',
    value: '+34 612 345 678',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'hola@inkandsoul.art',
  },
  {
    icon: MapPin,
    label: 'Ubicación',
    value: 'Calle del Arte 42, Madrid',
  },
  {
    icon: Clock,
    label: 'Horario',
    value: 'Lun-Vie 10:00-19:00, Sáb 10:00-15:00',
  },
]

const socialLinks = [
  { label: 'Instagram', icon: Instagram, href: 'https://instagram.com/inkandsoul.art' },
  { label: 'TikTok', icon: Video, href: 'https://tiktok.com/@inkandsoul.art' },
  { label: 'Behance', icon: LayoutGrid, href: 'https://behance.net/inkandsoul' },
]

export default function Contact() {
  const { submit } = useContactForm()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    tattooStyle: '',
    bodyPart: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submit({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
      tattoo_style: formData.tattooStyle,
      body_part: formData.bodyPart,
    })
    setSubmitted(true)
    setFormData({ name: '', email: '', phone: '', message: '', tattooStyle: '', bodyPart: '' })
    setTimeout(() => setSubmitted(false), 4000)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="min-h-dvh bg-ink">
      <PageHeader title="Contacto" subtitle="Hablemos" />

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
                <p className="text-emerald-400 text-sm font-medium">Mensaje enviado</p>
                <p className="text-emerald-400/70 text-xs">Te responderemos lo antes posible.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
              Nombre
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-ink-medium border border-white/5 text-cream placeholder:text-subtle focus:border-gold/40 focus:outline-none transition-colors"
              placeholder="Tu nombre"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label htmlFor="email" className="block text-cream-dark text-sm mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-ink-medium border border-white/5 text-cream placeholder:text-subtle focus:border-gold/40 focus:outline-none transition-colors"
              placeholder="tu@email.com"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label htmlFor="phone" className="block text-cream-dark text-sm mb-1.5">
              Teléfono
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-ink-medium border border-white/5 text-cream placeholder:text-subtle focus:border-gold/40 focus:outline-none transition-colors"
              placeholder="+34 600 000 000"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label htmlFor="tattooStyle" className="block text-cream-dark text-sm mb-1.5">
              Estilo de tatuaje de interés
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
              <option value="">Selecciona un estilo</option>
              {tattooStyles.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label htmlFor="bodyPart" className="block text-cream-dark text-sm mb-1.5">
              Zona del cuerpo preferida
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
              <option value="">Selecciona una zona</option>
              {bodyParts.map((part) => (
                <option key={part} value={part}>
                  {part}
                </option>
              ))}
            </select>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label htmlFor="message" className="block text-cream-dark text-sm mb-1.5">
              Mensaje
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-ink-medium border border-white/5 text-cream placeholder:text-subtle focus:border-gold/40 focus:outline-none transition-colors resize-none"
              placeholder="Cuéntame tu idea..."
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-medium text-ink bg-gradient-to-r from-gold to-gold-dark hover:from-gold-light hover:to-gold transition-all active:scale-[0.99]"
            >
              Enviar Mensaje
            </button>
          </motion.div>
        </motion.form>

        {/* Social links */}
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
                href={href}
                className="w-11 h-11 rounded-full bg-ink-medium border border-white/5 flex items-center justify-center text-gold hover:bg-gold/10 hover:border-gold/30 transition-colors"
                aria-label={label}
              >
                <Icon size={18} strokeWidth={1.5} />
              </a>
            ))}
          </motion.div>
        </motion.section>
      </div>
    </div>
  )
}
