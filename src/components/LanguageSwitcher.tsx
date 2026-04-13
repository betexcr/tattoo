import { useTranslation } from 'react-i18next'
import { supportedLngs, lngLabels, type SupportedLng } from '../i18n'
import { Globe } from 'lucide-react'

export default function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n } = useTranslation()

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <Globe size={14} className="text-subtle shrink-0" />
      {supportedLngs.map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => i18n.changeLanguage(lng)}
          aria-pressed={i18n.language === lng}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            i18n.language === lng
              ? 'bg-gold/15 text-gold border border-gold/30'
              : 'bg-white/5 text-subtle border border-white/5 hover:text-cream-dark hover:border-white/10'
          }`}
        >
          {lngLabels[lng as SupportedLng]}
        </button>
      ))}
    </div>
  )
}
