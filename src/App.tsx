import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import RequireArtist from './components/RequireArtist'
import RouteErrorBoundary from './components/RouteErrorBoundary'
import StudioLayout from './studio/StudioLayout'
import LoadingSpinner from './components/LoadingSpinner'

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
const NotFound = lazy(() => import('./pages/NotFound'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    document.querySelector('main')?.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
    <ScrollToTop />
    <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<RouteErrorBoundary section="consumer"><Home /></RouteErrorBoundary>} />
        <Route path="/portfolio" element={<RouteErrorBoundary section="consumer"><Portfolio /></RouteErrorBoundary>} />
        <Route path="/agenda" element={<RouteErrorBoundary section="consumer"><Agenda /></RouteErrorBoundary>} />
        <Route path="/reminders" element={<RouteErrorBoundary section="consumer"><Reminders /></RouteErrorBoundary>} />
        <Route path="/chat" element={<RouteErrorBoundary section="consumer"><Chat /></RouteErrorBoundary>} />
        <Route path="/about" element={<RouteErrorBoundary section="consumer"><About /></RouteErrorBoundary>} />
        <Route path="/contact" element={<RouteErrorBoundary section="consumer"><Contact /></RouteErrorBoundary>} />
        <Route path="/shop" element={<RouteErrorBoundary section="consumer"><Shop /></RouteErrorBoundary>} />
        <Route path="/designer" element={<RouteErrorBoundary section="consumer"><TattooDesigner /></RouteErrorBoundary>} />
        <Route path="/visualizer" element={<RouteErrorBoundary section="consumer"><BodyVisualizer /></RouteErrorBoundary>} />
        <Route path="/suggestions" element={<RouteErrorBoundary section="consumer"><Suggestions /></RouteErrorBoundary>} />
        <Route path="/courses" element={<RouteErrorBoundary section="consumer"><Courses /></RouteErrorBoundary>} />
        <Route path="/account" element={<RouteErrorBoundary section="consumer"><MyAccount /></RouteErrorBoundary>} />
      </Route>
      <Route path="/book" element={<RouteErrorBoundary section="booking"><BookAppointment /></RouteErrorBoundary>} />
      <Route path="/login" element={<RouteErrorBoundary section="login"><Login /></RouteErrorBoundary>} />
      <Route element={<RequireArtist />}>
        <Route element={<StudioLayout />}>
          <Route path="/studio" element={<RouteErrorBoundary section="studio"><Dashboard /></RouteErrorBoundary>} />
          <Route path="/studio/appointments" element={<RouteErrorBoundary section="studio"><Appointments /></RouteErrorBoundary>} />
          <Route path="/studio/clients" element={<RouteErrorBoundary section="studio"><Clients /></RouteErrorBoundary>} />
          <Route path="/studio/messages" element={<RouteErrorBoundary section="studio"><Messages /></RouteErrorBoundary>} />
          <Route path="/studio/orders" element={<RouteErrorBoundary section="studio"><Orders /></RouteErrorBoundary>} />
          <Route path="/studio/portfolio" element={<RouteErrorBoundary section="studio"><PortfolioManager /></RouteErrorBoundary>} />
          <Route path="/studio/analytics" element={<RouteErrorBoundary section="studio"><Analytics /></RouteErrorBoundary>} />
          <Route path="/studio/settings" element={<RouteErrorBoundary section="studio"><StudioSettings /></RouteErrorBoundary>} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
    </>
  )
}
