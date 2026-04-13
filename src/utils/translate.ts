import type { TranslationsMap } from '../types'

export function tf(
  translations: TranslationsMap | undefined,
  lang: string,
  key: string,
  fallback: string,
): string {
  return translations?.[lang]?.[key] ?? fallback
}

export function createTranslator(
  translations: TranslationsMap | undefined,
  lang: string,
) {
  return (key: string, fallback: string): string =>
    translations?.[lang]?.[key] ?? fallback
}
