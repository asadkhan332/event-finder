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
    }
  }
}
