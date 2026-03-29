import type { LucideIcon } from 'lucide-react'
import {
  Rose, Flower2, Sun, Bird, Fish, Cat,
  Triangle, Circle, Diamond, Moon, Star, Heart,
} from 'lucide-react'

export type SizeOption = 'small' | 'medium' | 'large'
export type ColorMode = 'negro' | 'color'

export interface DesignElement {
  id: string
  name: string
  icon: LucideIcon
  category: string
}

export const designElements: DesignElement[] = [
  { id: 'rose', name: 'Rosa', icon: Rose, category: 'Flores' },
  { id: 'lotus', name: 'Loto', icon: Flower2, category: 'Flores' },
  { id: 'sunflower', name: 'Girasol', icon: Sun, category: 'Flores' },
  { id: 'bird', name: 'Pájaro', icon: Bird, category: 'Animales' },
  { id: 'fish', name: 'Pez', icon: Fish, category: 'Animales' },
  { id: 'cat', name: 'Gato', icon: Cat, category: 'Animales' },
  { id: 'triangle', name: 'Triángulo', icon: Triangle, category: 'Geometría' },
  { id: 'circle', name: 'Círculo', icon: Circle, category: 'Geometría' },
  { id: 'diamond', name: 'Diamante', icon: Diamond, category: 'Geometría' },
  { id: 'moon', name: 'Luna', icon: Moon, category: 'Símbolos' },
  { id: 'star', name: 'Estrella', icon: Star, category: 'Símbolos' },
  { id: 'heart', name: 'Corazón', icon: Heart, category: 'Símbolos' },
]

export const colorPalette = [
  { id: 'black', hex: '#0a0a0a', label: 'Negro' },
  { id: 'gold', hex: '#c9956b', label: 'Oro' },
  { id: 'rose', hex: '#e8a0bf', label: 'Rosa' },
  { id: 'blue', hex: '#5b8def', label: 'Azul' },
  { id: 'green', hex: '#5bc98a', label: 'Verde' },
  { id: 'red', hex: '#e85b5b', label: 'Rojo' },
]

export const sizeConfig = {
  small: { label: 'Pequeño', size: 24 },
  medium: { label: 'Mediano', size: 36 },
  large: { label: 'Grande', size: 48 },
}

export function getStyleBorderClass(style: string | null): string {
  if (!style) return 'border-cream-dark/30'
  const styleMap: Record<string, string> = {
    'Línea Fina': 'border-cream-dark/50 border-2',
    Blackwork: 'border-ink border-4',
    Tradicional: 'border-gold border-2',
    'Neo Tradicional': 'border-gold border-2 border-double',
    'Japonés': 'border-ink border-2',
    'Geométrico': 'border-gold/60 border-2',
    Puntillismo: 'border-cream-dark/40 border-2 border-dashed',
    Acuarela: 'border-rose/40 border-2',
    Realismo: 'border-cream-dark/60 border-2',
    Tribal: 'border-gold-dark border-2',
    Lettering: 'border-cream-dark/50 border-2',
    Mandala: 'border-gold/50 border-2',
    Minimalista: 'border-cream-dark/30 border',
    Ornamental: 'border-gold border-2',
    Sketch: 'border-cream-dark/50 border-2 border-dashed',
    Surrealismo: 'border-rose/30 border-2',
  }
  return styleMap[style] ?? 'border-cream-dark/30'
}
