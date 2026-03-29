import { useMemo } from 'react'
import PageHeader from '../components/PageHeader'
import { motion } from 'framer-motion'
import { Instagram, Video, LayoutGrid } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useStudioConfig } from '../contexts/StudioConfigContext'
import { safeHref } from '../utils/safeHref'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function About() {
  const { config } = useStudioConfig()

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

  const stats = config.about_content.stats
  const specialties = config.about_content.specialties
  const certifications = config.about_content.certifications

  return (
    <div className="min-h-dvh bg-ink">
      <PageHeader title="La Artista" subtitle="Mi historia" />

      <div className="pb-12">
        {/* Hero image */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative h-[320px] overflow-hidden"
        >
          <motion.div variants={itemVariants} className="absolute inset-0">
            <img
              src={config.about_content.hero_image}
              alt={config.artist_name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent"
              aria-hidden
            />
          </motion.div>
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <motion.h2
              variants={itemVariants}
              className="font-serif text-3xl text-gold mb-1"
            >
              {config.artist_name}
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-cream-dark text-sm tracking-wide"
            >
              {config.about_content.artist_title}
            </motion.p>
          </div>
        </motion.section>

        {/* Bio */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={containerVariants}
          className="px-5 py-8"
        >
          <motion.p
            variants={itemVariants}
            className="text-cream text-[15px] leading-relaxed"
          >
            {config.about_content.bio}
          </motion.p>
        </motion.section>

        {/* Stats */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={containerVariants}
          className="px-5 py-6"
        >
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="text-center p-4 rounded-xl bg-ink-medium/60 border border-white/5"
              >
                <p className="font-serif text-2xl text-gold">{stat.value}</p>
                <p className="text-cream-dark text-xs mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Specialties */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={containerVariants}
          className="px-5 py-6"
        >
          <motion.h3
            variants={itemVariants}
            className="font-serif text-lg text-cream mb-3"
          >
            Especialidades
          </motion.h3>
          <div className="flex flex-wrap gap-2">
            {specialties.map((spec) => (
              <motion.span
                key={spec}
                variants={itemVariants}
                className="px-3 py-1.5 rounded-full bg-ink-medium border border-gold/20 text-gold text-sm"
              >
                {spec}
              </motion.span>
            ))}
          </div>
        </motion.section>

        {/* Certifications */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={containerVariants}
          className="px-5 py-6"
        >
          <motion.h3
            variants={itemVariants}
            className="font-serif text-lg text-cream mb-3"
          >
            Certificaciones
          </motion.h3>
          <ul className="space-y-2">
            {certifications.map((cert) => (
              <motion.li
                key={cert}
                variants={itemVariants}
                className="flex items-start gap-2 text-cream-dark text-sm"
              >
                <span className="text-gold mt-0.5">•</span>
                <span>{cert}</span>
              </motion.li>
            ))}
          </ul>
        </motion.section>

        {/* Social links */}
        {socialLinks.length > 0 && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={containerVariants}
            className="px-5 py-8"
          >
            <motion.div
              variants={itemVariants}
              className="flex justify-center gap-6"
            >
              {socialLinks.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={safeHref(href)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-ink-medium border border-gold/20 flex items-center justify-center text-gold hover:bg-gold/10 hover:border-gold/40 transition-colors"
                  aria-label={label}
                >
                  <Icon size={20} strokeWidth={1.5} />
                </a>
              ))}
            </motion.div>
          </motion.section>
        )}
      </div>
    </div>
  )
}
