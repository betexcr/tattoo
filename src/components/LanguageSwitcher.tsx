import { useTranslation } from 'react-i18next'
import { supportedLngs, lngLabels, type SupportedLng } from '../i18n'

export default function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n } = useTranslation()

  return (
    <div className={`flex gap-1 ${className ?? ''}`}>
      {supportedLngs.map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => i18n.changeLanguage(lng)}
          aria-pressed={i18n.language === lng}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            i18n.language === lng
              ? 'bg-gold/20 text-gold border border-gold/30'
              : 'bg-white/5 text-subtle border border-transparent hover:text-cream-dark hover:border-white/10'
          }`}
        >
          {lngLabels[lng as SupportedLng]}
        </button>
      ))}
    </div>
  )
}
