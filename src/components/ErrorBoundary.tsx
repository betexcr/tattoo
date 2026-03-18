import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh bg-ink flex items-center justify-center px-6">
          <div className="max-w-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
              <span className="text-2xl">⚠</span>
            </div>
            <h1 className="font-serif text-xl text-cream">Algo salió mal</h1>
            <p className="text-cream-dark text-sm leading-relaxed">
              Ha ocurrido un error inesperado. Intenta recargar la página.
            </p>
            {this.state.error && (
              <p className="text-xs text-subtle bg-ink-light rounded-lg p-3 text-left break-all">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-full bg-gold text-ink text-sm font-medium hover:bg-gold-light transition-colors"
            >
              Recargar página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
