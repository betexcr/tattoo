import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { StudioConfigProvider } from './contexts/StudioConfigContext'
import ErrorBoundary from './components/ErrorBoundary'
import App from './App'

export function mountApp(rootEl: HTMLElement): void {
  createRoot(rootEl).render(
    <StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <StudioConfigProvider>
              <App />
            </StudioConfigProvider>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </StrictMode>,
  )
}
