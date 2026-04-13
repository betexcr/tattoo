import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import commonEs from './locales/es/common.json'
import homeEs from './locales/es/home.json'
import portfolioEs from './locales/es/portfolio.json'
import agendaEs from './locales/es/agenda.json'
import remindersEs from './locales/es/reminders.json'
import aboutEs from './locales/es/about.json'
import contactEs from './locales/es/contact.json'
import shopEs from './locales/es/shop.json'
import designerEs from './locales/es/designer.json'
import visualizerEs from './locales/es/visualizer.json'
import suggestionsEs from './locales/es/suggestions.json'
import bookingEs from './locales/es/booking.json'
import chatEs from './locales/es/chat.json'
import accountEs from './locales/es/account.json'
import coursesEs from './locales/es/courses.json'
import loginEs from './locales/es/login.json'
import studioEs from './locales/es/studio.json'
import demoEs from './locales/es/demo.json'
import defaultsEs from './locales/es/defaults.json'

import commonEn from './locales/en/common.json'
import homeEn from './locales/en/home.json'
import portfolioEn from './locales/en/portfolio.json'
import agendaEn from './locales/en/agenda.json'
import remindersEn from './locales/en/reminders.json'
import aboutEn from './locales/en/about.json'
import contactEn from './locales/en/contact.json'
import shopEn from './locales/en/shop.json'
import designerEn from './locales/en/designer.json'
import visualizerEn from './locales/en/visualizer.json'
import suggestionsEn from './locales/en/suggestions.json'
import bookingEn from './locales/en/booking.json'
import chatEn from './locales/en/chat.json'
import accountEn from './locales/en/account.json'
import coursesEn from './locales/en/courses.json'
import loginEn from './locales/en/login.json'
import studioEn from './locales/en/studio.json'
import demoEn from './locales/en/demo.json'
import defaultsEn from './locales/en/defaults.json'

export const supportedLngs = ['es', 'en'] as const
export type SupportedLng = (typeof supportedLngs)[number]

export const lngLabels: Record<SupportedLng, string> = {
  es: 'Español',
  en: 'English',
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        common: commonEs, home: homeEs, portfolio: portfolioEs, agenda: agendaEs,
        reminders: remindersEs, about: aboutEs, contact: contactEs, shop: shopEs,
        designer: designerEs, visualizer: visualizerEs, suggestions: suggestionsEs,
        booking: bookingEs, chat: chatEs, account: accountEs, courses: coursesEs,
        login: loginEs, studio: studioEs, demo: demoEs, defaults: defaultsEs,
      },
      en: {
        common: commonEn, home: homeEn, portfolio: portfolioEn, agenda: agendaEn,
        reminders: remindersEn, about: aboutEn, contact: contactEn, shop: shopEn,
        designer: designerEn, visualizer: visualizerEn, suggestions: suggestionsEn,
        booking: bookingEn, chat: chatEn, account: accountEn, courses: coursesEn,
        login: loginEn, studio: studioEn, demo: demoEn, defaults: defaultsEn,
      },
    },
    fallbackLng: 'es',
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng
})

export default i18n
