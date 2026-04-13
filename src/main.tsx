import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'

function isFirebaseConfigured(): boolean {
  const key = import.meta.env.VITE_FIREBASE_API_KEY?.trim() ?? ''
  const pid = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() ?? ''
  if (!key || !pid) return false
  if (key === 'your-api-key' || pid === 'your-project-id') return false
  return true
}

function FirebaseConfigMissing() {
  return (
    <div className="min-h-dvh bg-ink flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full space-y-5 text-center">
        <h1 className="font-serif text-2xl text-cream">Configure Firebase</h1>
        <p className="text-cream-dark text-sm leading-relaxed">
          To run the app locally you need the environment variables from your Firebase project. Copy the example and fill in the real values.
        </p>
        <div className="rounded-xl bg-ink-light border border-white/10 p-4 text-left space-y-2">
          <p className="text-subtle text-xs">In the project root, create <code className="text-gold/90 font-mono">.env.local</code> (you can copy <code className="text-cream-dark font-mono text-[11px]">.env.local.example</code>) and replace the values with those from your Firebase Console project.</p>
        </div>
        <p className="text-subtle text-xs">
          Then save the file and restart the server (<span className="text-cream-dark">npm run dev</span>).
        </p>
      </div>
    </div>
  )
}

const rootEl = document.getElementById('root')
if (!rootEl) {
  throw new Error('Missing #root element')
}

if (!isFirebaseConfigured()) {
  createRoot(rootEl).render(
    <StrictMode>
      <FirebaseConfigMissing />
    </StrictMode>,
  )
} else {
  void import('./bootstrap').then(({ mountApp }) => {
    mountApp(rootEl)
  })
}
