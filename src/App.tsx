import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import RequireArtist from './components/RequireArtist'
import StudioLayout from './studio/StudioLayout'

const Dashboard = lazy(() => import('./studio/Dashboard'))
const PortfolioManager = lazy(() => import('./studio/PortfolioManager'))
const Analytics = lazy(() => import('./studio/Analytics'))
const StudioSettings = lazy(() => import('./studio/StudioSettings'))
const Appointments = lazy(() => import('./studio/Appointments'))
const Clients = lazy(() => import('./studio/Clients'))
const Messages = lazy(() => import('./studio/Messages'))
const Orders = lazy(() => import('./studio/Orders'))
const Home = lazy(() => import('./pages/Home'))
const Portfolio = lazy(() => import('./pages/Portfolio'))
const Agenda = lazy(() => import('./pages/Agenda'))
const Reminders = lazy(() => import('./pages/Reminders'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Shop = lazy(() => import('./pages/Shop'))
const TattooDesigner = lazy(() => import('./pages/TattooDesigner'))
const BodyVisualizer = lazy(() => import('./pages/BodyVisualizer'))
const Suggestions = lazy(() => import('./pages/Suggestions'))
const Courses = lazy(() => import('./pages/Courses'))
const BookAppointment = lazy(() => import('./pages/BookAppointment'))
const Chat = lazy(() => import('./pages/Chat'))
const MyAccount = lazy(() => import('./pages/MyAccount'))
const Login = lazy(() => import('./pages/Login'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <>
    <ScrollToTop />
    <Suspense fallback={<div className="min-h-dvh bg-ink flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>}>
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/designer" element={<TattooDesigner />} />
        <Route path="/visualizer" element={<BodyVisualizer />} />
        <Route path="/suggestions" element={<Suggestions />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/account" element={<MyAccount />} />
      </Route>
      <Route path="/book" element={<BookAppointment />} />
      <Route path="/login" element={<Login />} />
      <Route element={<RequireArtist />}>
        <Route element={<StudioLayout />}>
          <Route path="/studio" element={<Dashboard />} />
          <Route path="/studio/appointments" element={<Appointments />} />
          <Route path="/studio/clients" element={<Clients />} />
          <Route path="/studio/messages" element={<Messages />} />
          <Route path="/studio/orders" element={<Orders />} />
          <Route path="/studio/portfolio" element={<PortfolioManager />} />
          <Route path="/studio/analytics" element={<Analytics />} />
          <Route path="/studio/settings" element={<StudioSettings />} />
        </Route>
      </Route>
    </Routes>
    </Suspense>
    </>
  )
}
