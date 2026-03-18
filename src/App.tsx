import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import RequireArtist from './components/RequireArtist'
import StudioLayout from './studio/StudioLayout'
import Dashboard from './studio/Dashboard'
import PortfolioManager from './studio/PortfolioManager'
import Analytics from './studio/Analytics'
import StudioSettings from './studio/StudioSettings'
import Appointments from './studio/Appointments'
import Clients from './studio/Clients'
import Messages from './studio/Messages'
import Orders from './studio/Orders'
import Home from './pages/Home'
import Portfolio from './pages/Portfolio'
import Agenda from './pages/Agenda'
import Reminders from './pages/Reminders'
import About from './pages/About'
import Contact from './pages/Contact'
import Shop from './pages/Shop'
import TattooDesigner from './pages/TattooDesigner'
import BodyVisualizer from './pages/BodyVisualizer'
import Suggestions from './pages/Suggestions'
import Courses from './pages/Courses'
import BookAppointment from './pages/BookAppointment'
import Chat from './pages/Chat'
import MyAccount from './pages/MyAccount'
import Login from './pages/Login'

export default function App() {
  return (
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
  )
}
