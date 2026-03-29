import type { KeyboardEvent as ReactKE } from 'react'

export type BodyZone =
  | 'head'
  | 'neck'
  | 'chest'
  | 'left-arm'
  | 'right-arm'
  | 'left-forearm'
  | 'right-forearm'
  | 'left-hand'
  | 'right-hand'
  | 'stomach'
  | 'left-thigh'
  | 'right-thigh'
  | 'left-calf'
  | 'right-calf'
  | 'left-foot'
  | 'right-foot'
  | 'back'

export type ViewMode = 'front' | 'back'

export const ZONE_LABELS: Record<BodyZone, string> = {
  head: 'Cabeza',
  neck: 'Cuello',
  chest: 'Pecho',
  'left-arm': 'Brazo izquierdo',
  'right-arm': 'Brazo derecho',
  'left-forearm': 'Antebrazo izquierdo',
  'right-forearm': 'Antebrazo derecho',
  'left-hand': 'Mano izquierda',
  'right-hand': 'Mano derecha',
  stomach: 'Estómago',
  'left-thigh': 'Muslo izquierdo',
  'right-thigh': 'Muslo derecho',
  'left-calf': 'Pantorrilla izquierda',
  'right-calf': 'Pantorrilla derecha',
  'left-foot': 'Pie izquierdo',
  'right-foot': 'Pie derecho',
  back: 'Espalda',
}

export const PAIN_LEVELS: Record<BodyZone, { level: number; label: string }> = {
  head: { level: 2, label: 'Bajo - Piel fina' },
  neck: { level: 4, label: 'Alto - Zona sensible' },
  chest: { level: 3, label: 'Medio - Cerca del esternón' },
  'left-arm': { level: 2, label: 'Bajo - Buena tolerancia' },
  'right-arm': { level: 2, label: 'Bajo - Buena tolerancia' },
  'left-forearm': { level: 2, label: 'Bajo - Zona popular' },
  'right-forearm': { level: 2, label: 'Bajo - Zona popular' },
  'left-hand': { level: 4, label: 'Alto - Huesos y nervios' },
  'right-hand': { level: 4, label: 'Alto - Huesos y nervios' },
  stomach: { level: 4, label: 'Alto - Piel muy sensible' },
  'left-thigh': { level: 2, label: 'Bajo - Carnoso' },
  'right-thigh': { level: 2, label: 'Bajo - Carnoso' },
  'left-calf': { level: 3, label: 'Medio - Musculatura' },
  'right-calf': { level: 3, label: 'Medio - Musculatura' },
  'left-foot': { level: 5, label: 'Muy alto - Muy sensible' },
  'right-foot': { level: 5, label: 'Muy alto - Muy sensible' },
  back: { level: 2, label: 'Bajo - Zona amplia' },
}

export const TATTOO_DOT_POSITIONS: Record<BodyZone, { cx: number; cy: number }> = {
  head: { cx: 50, cy: 18 },
  neck: { cx: 50, cy: 38 },
  chest: { cx: 50, cy: 75 },
  'left-arm': { cx: 22, cy: 55 },
  'right-arm': { cx: 78, cy: 55 },
  'left-forearm': { cx: 18, cy: 95 },
  'right-forearm': { cx: 82, cy: 95 },
  'left-hand': { cx: 12, cy: 125 },
  'right-hand': { cx: 88, cy: 125 },
  stomach: { cx: 50, cy: 130 },
  'left-thigh': { cx: 38, cy: 175 },
  'right-thigh': { cx: 62, cy: 175 },
  'left-calf': { cx: 38, cy: 235 },
  'right-calf': { cx: 62, cy: 235 },
  'left-foot': { cx: 35, cy: 278 },
  'right-foot': { cx: 65, cy: 278 },
  back: { cx: 50, cy: 100 },
}

export const FRONT_ZONES: BodyZone[] = [
  'head',
  'neck',
  'chest',
  'left-arm',
  'right-arm',
  'left-forearm',
  'right-forearm',
  'left-hand',
  'right-hand',
  'stomach',
  'left-thigh',
  'right-thigh',
  'left-calf',
  'right-calf',
  'left-foot',
  'right-foot',
]

export function zoneA11y(zone: BodyZone, onZoneClick: (z: BodyZone) => void) {
  return {
    tabIndex: 0,
    role: 'button' as const,
    'aria-label': ZONE_LABELS[zone],
    onKeyDown: (e: ReactKE<SVGPathElement>) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onZoneClick(zone) }
    },
  }
}
