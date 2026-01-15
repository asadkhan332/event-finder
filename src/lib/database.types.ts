export type Profile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
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

export type RSVP = {
  id: string
  user_id: string
  event_id: string
  status: 'going' | 'interested' | 'not_going'
  created_at: string
  updated_at: string
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
      rsvps: {
        Row: RSVP
        Insert: Omit<RSVP, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<RSVP, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}
