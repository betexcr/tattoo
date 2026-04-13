import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import { initializeApp } from 'firebase-admin/app'
import { v2 } from '@google-cloud/translate'

initializeApp()
const translate = new v2.Translate()

const SUPPORTED_LANGS = ['es', 'en']

const SIMPLE_FIELDS: Record<string, string[]> = {
  studio_settings: [
    'bio',
    'home_content.subtitle',
    'home_content.tagline',
    'about_content.bio',
    'about_content.artist_title',
    'chat_config.welcome_message',
  ],
  portfolio_items: ['title', 'description'],
  shop_items: ['title', 'description'],
}

interface ArrayFieldConfig {
  path: string
  idField: string
  textFields: string[]
}

const ARRAY_FIELDS: Record<string, ArrayFieldConfig[]> = {
  studio_settings: [
    { path: 'suggestions', idField: 'id', textFields: ['title', 'description'] },
  ],
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  let current: unknown = obj
  for (const part of path.split('.')) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

function extractTexts(
  data: Record<string, unknown>,
  collection: string,
): Map<string, string> {
  const texts = new Map<string, string>()

  for (const field of SIMPLE_FIELDS[collection] ?? []) {
    const value = getNestedValue(data, field)
    if (typeof value === 'string' && value.trim()) {
      texts.set(field, value)
    }
  }

  for (const cfg of ARRAY_FIELDS[collection] ?? []) {
    const arr = getNestedValue(data, cfg.path)
    if (!Array.isArray(arr)) continue
    for (const item of arr) {
      if (!item || typeof item !== 'object') continue
      const rec = item as Record<string, unknown>
      const id = rec[cfg.idField]
      if (!id) continue
      for (const tf of cfg.textFields) {
        const val = rec[tf]
        if (typeof val === 'string' && val.trim()) {
          texts.set(`${cfg.path}.${id}.${tf}`, val)
        }
      }
    }
  }

  return texts
}

function hasChanged(before: Map<string, string>, after: Map<string, string>): boolean {
  if (before.size !== after.size) return true
  for (const [key, value] of after) {
    if (before.get(key) !== value) return true
  }
  return false
}

async function translateAll(texts: Map<string, string>) {
  if (texts.size === 0) return { translations: {}, sourceLang: 'es' }

  const entries = [...texts.entries()]
  const allTexts = entries.map(([, t]) => t)

  const longest = entries.reduce((a, b) => (a[1].length > b[1].length ? a : b))[1]
  const [detections] = await translate.detect(longest)
  const det = Array.isArray(detections) ? detections[0] : detections
  const sourceLang = SUPPORTED_LANGS.includes(det.language) ? det.language : 'es'

  const translations: Record<string, Record<string, string>> = {}

  for (const targetLang of SUPPORTED_LANGS) {
    if (targetLang === sourceLang) continue
    const [translated] = await translate.translate(allTexts, {
      from: sourceLang,
      to: targetLang,
    })
    const results = Array.isArray(translated) ? translated : [translated]
    translations[targetLang] = {}
    entries.forEach(([key], i) => {
      translations[targetLang][key] = results[i]
    })
  }

  return { translations, sourceLang }
}

function createHandler(collection: string) {
  return onDocumentWritten(`${collection}/{docId}`, async (event) => {
    const beforeData = event.data?.before?.data() as Record<string, unknown> | undefined
    const afterData = event.data?.after?.data() as Record<string, unknown> | undefined
    if (!afterData) return

    const beforeTexts = beforeData ? extractTexts(beforeData, collection) : new Map<string, string>()
    const afterTexts = extractTexts(afterData, collection)
    if (!hasChanged(beforeTexts, afterTexts)) return

    const { translations, sourceLang } = await translateAll(afterTexts)
    if (Object.keys(translations).length === 0) return

    await event.data!.after!.ref.update({
      _translations: translations,
      _source_lang: sourceLang,
      _translated_at: new Date().toISOString(),
    })
  })
}

export const translateStudioSettings = createHandler('studio_settings')
export const translatePortfolioItem = createHandler('portfolio_items')
export const translateShopItem = createHandler('shop_items')
