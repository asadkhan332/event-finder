export type UserRole = 'seeker' | 'host' | null

export type Profile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export type Event = {
  id: string
  title: string
  description: string | null
  date: string
  time: string
  location_name: string
  latitude: number | null
  longitude: number | null
  category: string
  image_url: string | null
  organizer_id: string
  is_featured: boolean
  created_at: string
  updated_at: string
}


export type Review = {
  id: string
  user_id: string
  event_id: string
  rating: number
  comment: string | null
  created_at: string
  updated_at: string
}

export type ReviewWithProfile = Review & {
  profile: Pick<Profile, 'full_name' | 'email' | 'avatar_url'> | null
}

export type Attendee = {
  id: string
  user_id: string
  event_id: string
  created_at: string
}

export type EventInsert = {
  title: string
  description?: string | null
  date: string
  time: string
  location_name: string
  latitude?: number | null
  longitude?: number | null
  category: string
  image_url?: string | null
  organizer_id: string
  is_featured?: boolean
}

export type ProfileInsert = {
  id: string
  email: string
  full_name?: string | null
  avatar_url?: string | null
  role?: UserRole
}

// Notification Types
export type NotificationType = 'reminder' | 'confirmation' | 'update' | 'cancellation'

export type Notification = {
  id: string
  user_id: string
  event_id: string | null
  type: NotificationType
  title: string
  message: string
  metadata: Record<string, unknown>
  is_read: boolean
  email_sent: boolean
  created_at: string
  read_at: string | null
}

export type NotificationInsert = {
  user_id: string
  event_id?: string | null
  type: NotificationType
  title: string
  message: string
  metadata?: Record<string, unknown>
}

export type NotificationUpdate = {
  is_read?: boolean
  read_at?: string
}

export type NotificationPreference = {
  id: string
  user_id: string
  email_enabled: boolean
  reminders_enabled: boolean
  confirmations_enabled: boolean
  updates_enabled: boolean
  reminder_hours: number[]
  created_at: string
  updated_at: string
}

export type NotificationPreferenceInsert = {
  user_id: string
  email_enabled?: boolean
  reminders_enabled?: boolean
  confirmations_enabled?: boolean
  updates_enabled?: boolean
  reminder_hours?: number[]
}

export type NotificationPreferenceUpdate = {
  email_enabled?: boolean
  reminders_enabled?: boolean
  confirmations_enabled?: boolean
  updates_enabled?: boolean
  reminder_hours?: number[]
}

// Notification with event details (for display)
export type NotificationWithEvent = Notification & {
  event?: Pick<Event, 'id' | 'title' | 'date' | 'time' | 'location_name'> | null
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: ProfileInsert
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
      }
      events: {
        Row: Event
        Insert: EventInsert
        Update: Partial<Omit<Event, 'id' | 'created_at' | 'updated_at'>>
      }
      attendees: {
        Row: Attendee
        Insert: Omit<Attendee, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Attendee, 'id' | 'created_at' | 'updated_at'>>
      }
      reviews: {
        Row: Review
        Insert: Omit<Review, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Review, 'id' | 'created_at' | 'updated_at'>>
      }
      notifications: {
        Row: Notification
        Insert: NotificationInsert
        Update: NotificationUpdate
      }
      notification_preferences: {
        Row: NotificationPreference
        Insert: NotificationPreferenceInsert
        Update: NotificationPreferenceUpdate
      }
    }
  }
}
