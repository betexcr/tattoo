import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Calendar, Clock, MessageCircle, Euro, Check, X,
  ImagePlus, CalendarPlus, BarChart3, Settings,
  LayoutDashboard, Users, Package, Image, ChevronRight,
  Star, TrendingUp, Smartphone, Palette, PenTool, Eye,
  ShoppingBag, GraduationCap, ArrowLeft, Sparkles,
} from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

const mockRevenue = [35, 80, 45, 120, 90, 150, 65]

const features = [
  { icon: LayoutDashboard, key: 'dashboard' },
  { icon: Calendar, key: 'appointments' },
  { icon: Users, key: 'clients' },
  { icon: MessageCircle, key: 'chat' },
  { icon: Package, key: 'shop' },
  { icon: Image, key: 'portfolio' },
  { icon: BarChart3, key: 'analytics' },
  { icon: Settings, key: 'settings' },
]

const clientFeatures = [
  { icon: Palette, key: 'portfolio' },
  { icon: PenTool, key: 'designer' },
  { icon: Eye, key: 'visualizer' },
  { icon: ShoppingBag, key: 'shop' },
  { icon: GraduationCap, key: 'courses' },
  { icon: Smartphone, key: 'pwa' },
]

const quickActionItems = [
  { icon: ImagePlus, key: 'addPortfolio' },
  { icon: CalendarPlus, key: 'newAppointment' },
  { icon: BarChart3, key: 'viewAnalytics' },
  { icon: Settings, key: 'settings' },
]

type DemoTab = 'dashboard' | 'features'

export default function Demo() {
  const { t } = useTranslation('demo')
  const [tab, setTab] = useState<DemoTab>('dashboard')
  const maxRev = Math.max(...mockRevenue, 1)

  return (
    <div className="min-h-dvh bg-ink">
      <header className="sticky top-0 z-40 bg-ink-light/95 backdrop-blur-lg border-b border-white/5 pt-[env(safe-area-inset-top,0px)]">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/" className="flex items-center gap-2 text-gold/70 hover:text-gold transition-colors">
            <ArrowLeft size={16} />
            <span className="text-sm">{t('back')}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-gold" />
            <span className="text-cream font-serif text-sm">{t('title')}</span>
          </div>
          <div className="w-16" />
        </div>
        <div className="flex border-b border-white/5">
          <button
            type="button"
            onClick={() => setTab('dashboard')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'dashboard' ? 'text-gold border-b-2 border-gold' : 'text-subtle'}`}
          >
            {t('tabs.admin')}
          </button>
          <button
            type="button"
            onClick={() => setTab('features')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'features' ? 'text-gold border-b-2 border-gold' : 'text-subtle'}`}
          >
            {t('tabs.features')}
          </button>
        </div>
      </header>

      <main className="pb-8">
        {tab === 'dashboard' ? <DashboardPreview maxRev={maxRev} /> : <FeaturesPreview />}
      </main>
    </div>
  )
}

function DashboardPreview({ maxRev }: { maxRev: number }) {
  const { t } = useTranslation('demo')

  const mockAppointments = [
    { id: '1', client: 'María López', date: t('mockData.today'), time: '10:00', style: 'Realismo', part: t('mockData.forearm'), status: 'pending' as const },
    { id: '2', client: 'Carlos Ramírez', date: t('mockData.today'), time: '14:30', style: 'Blackwork', part: t('mockData.back'), status: 'pending' as const },
    { id: '3', client: 'Ana Vargas', date: t('mockData.today'), time: '16:00', style: 'Minimalista', part: t('mockData.wrist'), status: 'confirmed' as const },
  ]

  const mockMessages = [
    { id: '1', name: 'María López', msg: t('mockData.msg1'), unread: 3 },
    { id: '2', name: 'Diego Solano', msg: t('mockData.msg2'), unread: 1 },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 space-y-6"
    >
      <motion.div variants={itemVariants} className="rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 p-5">
        <p className="text-gold text-xs font-medium uppercase tracking-widest mb-1">{t('dashboard.preview')}</p>
        <h2 className="font-serif text-2xl text-cream mb-1">{t('dashboard.adminPanel')}</h2>
        <p className="text-cream/60 text-sm">{t('dashboard.adminPanelDesc')}</p>
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shrink-0">
          <span className="text-ink font-serif font-bold text-sm">IS</span>
        </div>
        <div>
          <h2 className="font-serif text-xl text-cream">{t('dashboard.greeting')}</h2>
          <p className="text-subtle text-sm">{t('dashboard.date')}</p>
        </div>
      </motion.div>

      <motion.section variants={itemVariants} className="grid grid-cols-2 gap-3">
        <StatCard icon={Calendar} value="3" label={t('stats.todayAppointments')} color="gold" />
        <StatCard icon={Clock} value="2" label={t('stats.pending')} color="amber" />
        <StatCard icon={MessageCircle} value="4" label={t('stats.messages')} color="rose" />
        <StatCard icon={Euro} value="€1,250" label={t('stats.monthRevenue')} color="emerald" />
      </motion.section>

      <motion.section variants={itemVariants}>
        <h3 className="font-serif text-lg text-cream mb-3">{t('sections.pendingRequests')}</h3>
        <div className="space-y-3">
          {mockAppointments.filter(a => a.status === 'pending').map(apt => (
            <div key={apt.id} className="rounded-xl bg-ink-light border border-white/5 p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-cream">{apt.client}</p>
                  <p className="text-xs text-subtle">{apt.date} · {apt.time} · {apt.style} · {apt.part}</p>
                </div>
                <div className="flex gap-2">
                  <div className="w-11 h-11 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Check size={16} />
                  </div>
                  <div className="w-11 h-11 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                    <X size={16} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section variants={itemVariants}>
        <h3 className="font-serif text-lg text-cream mb-3">{t('sections.todaySchedule')}</h3>
        <div className="space-y-3">
          {mockAppointments.filter(a => a.status === 'confirmed').map(apt => (
            <div key={apt.id} className="rounded-xl bg-ink-light border border-white/5 p-4 flex gap-4">
              <div className="shrink-0 w-14 text-center">
                <p className="text-lg font-serif font-semibold text-gold">{apt.time}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-cream">{apt.client}</p>
                <p className="text-xs text-subtle truncate mt-0.5">{apt.style} — {apt.part}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section variants={itemVariants}>
        <h3 className="font-serif text-lg text-cream mb-3">{t('sections.unreadMessages')}</h3>
        <div className="space-y-2">
          {mockMessages.map(conv => (
            <div key={conv.id} className="flex items-center gap-3 p-3 rounded-xl bg-ink-light border border-white/5">
              <div className="w-10 h-10 rounded-full bg-rose/20 flex items-center justify-center shrink-0">
                <span className="text-rose-dark text-sm font-medium">{conv.name.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-cream truncate">{conv.name}</p>
                <p className="text-xs text-subtle truncate">{conv.msg}</p>
              </div>
              <span className="shrink-0 w-6 h-6 rounded-full bg-rose text-ink text-xs font-bold flex items-center justify-center">{conv.unread}</span>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section variants={itemVariants}>
        <h3 className="font-serif text-lg text-cream mb-3">{t('sections.quickActions')}</h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActionItems.map(({ icon, key }) => (
            <QuickAction key={key} icon={icon} label={t(`quickActions.${key}`)} />
          ))}
        </div>
      </motion.section>

      <motion.section variants={itemVariants}>
        <h3 className="font-serif text-lg text-cream mb-3">{t('sections.revenueChart')}</h3>
        <div className="rounded-xl bg-ink-light border border-white/5 p-4">
          <div className="flex items-end justify-between gap-2 h-20">
            {mockRevenue.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end items-center h-full">
                <div
                  className="w-full rounded-t bg-gradient-to-t from-gold-dark to-gold transition-all duration-500"
                  style={{ height: val > 0 ? `${(val / maxRev) * 100}%` : '4px' }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-subtle">
            {(t('weekdays', { returnObjects: true }) as string[]).map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section variants={itemVariants}>
        <div className="rounded-2xl bg-gradient-to-br from-gold/10 to-transparent border border-gold/20 p-5 text-center">
          <Star className="w-8 h-8 text-gold mx-auto mb-3" />
          <p className="font-serif text-lg text-cream mb-2">{t('cta.title')}</p>
          <p className="text-cream/60 text-sm mb-4">{t('cta.price')}</p>
          <a
            href="https://instagram.com/betexcr"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gold text-ink font-semibold py-3 px-6 rounded-xl hover:bg-gold/90 transition-colors"
          >
            {t('cta.contactInstagram')}
            <ChevronRight size={16} />
          </a>
        </div>
      </motion.section>
    </motion.div>
  )
}

function FeaturesPreview() {
  const { t } = useTranslation('demo')
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 space-y-8"
    >
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={16} className="text-gold" />
          <p className="text-gold text-xs font-medium uppercase tracking-widest">{t('features.artistTitle')}</p>
        </div>
        <h2 className="font-serif text-2xl text-cream mb-1">{t('features.artistHeading')}</h2>
        <p className="text-cream/60 text-sm">{t('features.artistDesc')}</p>
      </motion.div>

      <motion.section variants={itemVariants} className="space-y-3">
        {features.map(f => (
          <div key={f.key} className="flex items-start gap-4 p-4 rounded-xl bg-ink-light border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
              <f.icon size={18} className="text-gold" />
            </div>
            <div>
              <p className="text-sm font-medium text-cream">{t(`features.admin.${f.key}.label`)}</p>
              <p className="text-xs text-subtle mt-0.5">{t(`features.admin.${f.key}.desc`)}</p>
            </div>
          </div>
        ))}
      </motion.section>

      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-1">
          <Smartphone size={16} className="text-gold" />
          <p className="text-gold text-xs font-medium uppercase tracking-widest">{t('features.clientTitle')}</p>
        </div>
        <h2 className="font-serif text-2xl text-cream mb-1">{t('features.clientHeading')}</h2>
        <p className="text-cream/60 text-sm">{t('features.clientDesc')}</p>
      </motion.div>

      <motion.section variants={itemVariants} className="space-y-3">
        {clientFeatures.map(f => (
          <div key={f.key} className="flex items-start gap-4 p-4 rounded-xl bg-ink-light border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
              <f.icon size={18} className="text-cream/70" />
            </div>
            <div>
              <p className="text-sm font-medium text-cream">{t(`features.client.${f.key}.label`)}</p>
              <p className="text-xs text-subtle mt-0.5">{t(`features.client.${f.key}.desc`)}</p>
            </div>
          </div>
        ))}
      </motion.section>

      <motion.section variants={itemVariants}>
        <div className="rounded-2xl bg-gradient-to-br from-gold/10 to-transparent border border-gold/20 p-5 text-center">
          <Star className="w-8 h-8 text-gold mx-auto mb-3" />
          <p className="font-serif text-lg text-cream mb-2">{t('cta.title')}</p>
          <p className="text-cream/60 text-sm mb-4">{t('cta.price')}</p>
          <a
            href="https://instagram.com/betexcr"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gold text-ink font-semibold py-3 px-6 rounded-xl hover:bg-gold/90 transition-colors"
          >
            {t('cta.contactInstagram')}
            <ChevronRight size={16} />
          </a>
        </div>
      </motion.section>
    </motion.div>
  )
}

function StatCard({ icon: Icon, value, label, color }: { icon: typeof Calendar; value: string; label: string; color: string }) {
  const colorMap: Record<string, { icon: string; bar: string }> = {
    gold: { icon: 'text-gold/60', bar: 'bg-gold/40' },
    amber: { icon: 'text-amber-400/70', bar: 'bg-amber-400/40' },
    rose: { icon: 'text-rose/60', bar: 'bg-rose/40' },
    emerald: { icon: 'text-emerald-400/70', bar: 'bg-emerald-400/40' },
  }
  const c = colorMap[color] || colorMap.gold

  return (
    <div className="rounded-xl bg-ink-light border border-white/5 p-4 relative overflow-hidden">
      <Icon className={`absolute top-3 right-3 w-5 h-5 ${c.icon}`} />
      <p className="text-2xl font-serif font-semibold text-cream">{value}</p>
      <p className="text-xs text-subtle mt-0.5">{label}</p>
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${c.bar}`} />
    </div>
  )
}

function QuickAction({ icon: Icon, label }: { icon: typeof ImagePlus; label: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-ink-light border border-white/5">
      <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-gold" />
      </div>
      <span className="text-sm font-medium text-cream">{label}</span>
    </div>
  )
}
