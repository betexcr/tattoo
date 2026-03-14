export interface Profile {
  id: string
  full_name: string
  phone: string
  role: 'artist' | 'client'
  avatar_url: string
  created_at: string
}

export interface PortfolioItem {
  id: string
  title: string
  style: string
  image_url: string
  description: string
  published: boolean
  sort_order: number
  created_at: string
}

export interface Appointment {
  id: string
  client_id: string | null
  client_name: string
  date: string
  time: string
  description: string
  body_part: string
  style: string
  status: 'confirmed' | 'pending' | 'completed' | 'rejected'
  deposit: number
  phone: string
  email: string
  reference_images: string[]
  size: string
  notes: string
  created_at: string
}

export interface ChatMessage {
  id: string
  client_id: string
  sender_role: 'client' | 'artist'
  text: string
  read: boolean
  created_at: string
}

export interface ChatConversation {
  client_id: string
  client_name: string
  last_message: string
  last_timestamp: string
  unread: number
}

export interface Reminder {
  id: string
  title: string
  date: string
  time: string
  type: 'appointment' | 'followup' | 'custom'
  completed: boolean
  created_at: string
}

export interface ShopItem {
  id: string
  title: string
  price: number
  image_url: string
  category: 'cuadros' | 'ropa' | 'zapatos' | 'accesorios'
  description: string
  in_stock: boolean
  sizes: string[]
  colors: string[]
  created_at: string
}

export interface Order {
  id: string
  client_id: string | null
  client_name: string
  client_email: string
  client_phone: string
  client_address: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered'
  total: number
  created_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  shop_item_id: string
  quantity: number
  size: string
  color: string
  price: number
}

export interface Course {
  id: string
  title: string
  description: string
  date: string
  duration: string
  price: number
  spots: number
  image_url: string
  level: 'beginner' | 'intermediate' | 'advanced'
  created_at: string
}

export interface CourseReservation {
  id: string
  course_id: string
  client_id: string | null
  name: string
  email: string
  phone: string
  created_at: string
}

export interface ContactSubmission {
  id: string
  name: string
  email: string
  phone: string
  message: string
  tattoo_style: string
  body_part: string
  created_at: string
}

export interface StudioSettings {
  id: string
  studio_name: string
  artist_name: string
  bio: string
  phone: string
  email: string
  address: string
  schedule: Record<string, unknown>
  prices: Record<string, unknown>
  social_links: Record<string, unknown>
  notifications: Record<string, unknown>
  updated_at: string
}
