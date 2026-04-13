import i18n from '../i18n'

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso)
  if (isNaN(date.getTime())) return ''
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return i18n.t('time.now')
  if (diffMins < 60) return i18n.t('time.minutesAgo', { count: diffMins })
  if (diffHours < 24) return i18n.t('time.hoursAgo', { count: diffHours })
  if (diffDays < 7) return i18n.t('time.daysAgo', { count: diffDays })
  return date.toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' })
}
