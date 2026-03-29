import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
  onClose?: () => void,
) {
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active) return

    previouslyFocused.current = document.activeElement as HTMLElement | null

    const el = containerRef.current
    if (!el) return

    const focusables = () =>
      Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (n) => n.offsetParent !== null,
      )

    const first = focusables()[0]
    if (first) first.focus()
    else el.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        e.stopPropagation()
        onClose()
        return
      }

      if (e.key !== 'Tab') return

      const nodes = focusables()
      if (nodes.length === 0) {
        e.preventDefault()
        return
      }

      const firstNode = nodes[0]
      const lastNode = nodes[nodes.length - 1]

      if (e.shiftKey && document.activeElement === firstNode) {
        e.preventDefault()
        lastNode.focus()
      } else if (!e.shiftKey && document.activeElement === lastNode) {
        e.preventDefault()
        firstNode.focus()
      }
    }

    el.addEventListener('keydown', onKeyDown)

    return () => {
      el.removeEventListener('keydown', onKeyDown)
      previouslyFocused.current?.focus()
    }
  }, [active, containerRef, onClose])
}
