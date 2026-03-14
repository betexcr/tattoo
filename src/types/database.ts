export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          phone: string
          role: string
          avatar_url: string
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string
          phone?: string
          role?: string
          avatar_url?: string
          created_at?: string
        }
        Update: {
          full_name?: string
          phone?: string
          role?: string
          avatar_url?: string
        }
      }
      appointments: {
        Row: {
          id: string
          client_id: string | null
          client_name: string
          date: string
          time: string
          description: string
          body_part: string
          style: string
          status: string
          deposit: number
          phone: string
          email: string
          reference_images: string[]
          size: string
          notes: string
          created_at: string
        }
        Insert: {
          id?: string
          client_id?: string | null
          client_name: string
          date: string
          time: string
          description?: string
          body_part?: string
          style?: string
          status?: string
          deposit?: number
          phone?: string
          email?: string
          reference_images?: string[]
          size?: string
          notes?: string
        }
        Update: {
          client_name?: string
          date?: string
          time?: string
          description?: string
          body_part?: string
          style?: string
          status?: string
          deposit?: number
          phone?: string
          email?: string
          reference_images?: string[]
          size?: string
          notes?: string
        }
      }
      portfolio_items: {
        Row: {
          id: string
          title: string
          style: string
          description: string
          image_url: string
          published: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          style?: string
          description?: string
          image_url: string
          published?: boolean
          sort_order?: number
        }
        Update: {
          title?: string
          style?: string
          description?: string
          image_url?: string
          published?: boolean
          sort_order?: number
        }
      }
      shop_items: {
        Row: {
          id: string
          title: string
          price: number
          image_url: string
          category: string
          description: string
          in_stock: boolean
          sizes: string[]
          colors: string[]
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          price: number
          image_url: string
          category: string
          description?: string
          in_stock?: boolean
          sizes?: string[]
          colors?: string[]
        }
        Update: {
          title?: string
          price?: number
          image_url?: string
          category?: string
          description?: string
          in_stock?: boolean
          sizes?: string[]
          colors?: string[]
        }
      }
      orders: {
        Row: {
          id: string
          client_id: string | null
          client_name: string
          client_email: string
          client_phone: string
          client_address: string
          status: string
          total: number
          created_at: string
        }
        Insert: {
          id?: string
          client_id?: string | null
          client_name: string
          client_email: string
          client_phone?: string
          client_address?: string
          status?: string
          total: number
        }
        Update: {
          client_name?: string
          client_email?: string
          client_phone?: string
          client_address?: string
          status?: string
          total?: number
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          shop_item_id: string
          quantity: number
          size: string
          color: string
          price: number
        }
        Insert: {
          id?: string
          order_id: string
          shop_item_id: string
          quantity?: number
          size?: string
          color?: string
          price: number
        }
        Update: {
          quantity?: number
          size?: string
          color?: string
          price?: number
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string
          date: string
          duration: string
          price: number
          spots: number
          image_url: string
          level: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          date: string
          duration?: string
          price: number
          spots?: number
          image_url: string
          level?: string
        }
        Update: {
          title?: string
          description?: string
          date?: string
          duration?: string
          price?: number
          spots?: number
          image_url?: string
          level?: string
        }
      }
      course_reservations: {
        Row: {
          id: string
          course_id: string
          client_id: string | null
          name: string
          email: string
          phone: string
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          client_id?: string | null
          name: string
          email: string
          phone?: string
        }
        Update: {
          name?: string
          email?: string
          phone?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          client_id: string
          sender_role: string
          text: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          sender_role: string
          text: string
          read?: boolean
        }
        Update: {
          text?: string
          read?: boolean
        }
      }
      reminders: {
        Row: {
          id: string
          title: string
          date: string
          time: string
          type: string
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          date: string
          time: string
          type?: string
          completed?: boolean
        }
        Update: {
          title?: string
          date?: string
          time?: string
          type?: string
          completed?: boolean
        }
      }
      contact_submissions: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          message: string
          tattoo_style: string
          body_part: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string
          message?: string
          tattoo_style?: string
          body_part?: string
        }
        Update: {
          name?: string
          email?: string
          phone?: string
          message?: string
          tattoo_style?: string
          body_part?: string
        }
      }
      studio_settings: {
        Row: {
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
        Insert: {
          id?: string
          studio_name?: string
          artist_name?: string
          bio?: string
          phone?: string
          email?: string
          address?: string
          schedule?: Record<string, unknown>
          prices?: Record<string, unknown>
          social_links?: Record<string, unknown>
          notifications?: Record<string, unknown>
        }
        Update: {
          studio_name?: string
          artist_name?: string
          bio?: string
          phone?: string
          email?: string
          address?: string
          schedule?: Record<string, unknown>
          prices?: Record<string, unknown>
          social_links?: Record<string, unknown>
          notifications?: Record<string, unknown>
        }
      }
    }
    Functions: {
      is_artist: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
  }
}
