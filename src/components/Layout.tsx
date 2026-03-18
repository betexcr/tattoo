import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import MenuDrawer from './MenuDrawer'
import NotificationBell from './NotificationBell'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user } = useAuth()

  return (
    <div className="flex flex-col min-h-dvh bg-ink">
      {user && (
        <div className="fixed top-2 right-3 z-40">
          <NotificationBell />
        </div>
      )}
      <main className="flex-1 pb-20 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav onMenuToggle={() => setMenuOpen(true)} />
      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  )
}
