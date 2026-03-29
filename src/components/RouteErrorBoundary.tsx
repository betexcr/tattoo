import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  section?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`RouteErrorBoundary [${this.props.section ?? 'unknown'}]:`, error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="flex-1 flex items-center justify-center px-6 py-20">
          <div className="max-w-sm text-center space-y-4">
            <h2 className="font-serif text-lg text-cream">Algo salió mal</h2>
            <p className="text-cream-dark text-sm leading-relaxed">
              Ha ocurrido un error en esta sección. Puedes intentar de nuevo o volver al inicio.
            </p>
            {import.meta.env.DEV && this.state.error?.message && (
              <p className="text-subtle text-xs font-mono bg-ink-light rounded-lg p-3 text-left break-all">
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-5 py-2.5 rounded-full bg-gold text-ink text-sm font-medium hover:bg-gold-light transition-colors"
              >
                Reintentar
              </button>
              <a
                href="/"
                className="px-5 py-2.5 rounded-full border border-white/20 text-cream text-sm font-medium hover:bg-white/5 transition-colors"
              >
                Ir al inicio
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
