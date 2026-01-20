# Event Schema Design

Design PostgreSQL schema for Events, Profiles, and Attendees with proper relationships.

## Trigger Phrases

- "design event database schema"
- "create events and attendees tables"
- "postgresql schema for events"
- "event management database design"
- "/event-schema"

## Instructions

Design and implement a complete PostgreSQL database schema for event management with Profiles, Events, and Attendees tables.

### Context Gathering

1. Identify the database platform (Supabase, raw PostgreSQL)
2. Determine event types (single, recurring, multi-day)
3. Check if ticketing/pricing is needed
4. Identify additional features (categories, locations, reviews)

### Execution Steps

#### Step 1: Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    PROFILES     │       │     EVENTS      │       │   ATTENDEES     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │──┐    │ id (PK)         │──┐    │ id (PK)         │
│ email           │  │    │ organizer_id(FK)│◄─┘    │ event_id (FK)   │◄─┐
│ full_name       │  │    │ title           │       │ user_id (FK)    │◄─┼─┐
│ avatar_url      │  │    │ description     │       │ status          │  │ │
│ role            │  │    │ location        │       │ ticket_type     │  │ │
│ created_at      │  │    │ start_date      │       │ registered_at   │  │ │
└─────────────────┘  │    │ end_date        │       └─────────────────┘  │ │
                     │    │ capacity        │                            │ │
                     │    │ status          │────────────────────────────┘ │
                     │    │ created_at      │                              │
                     │    └─────────────────┘                              │
                     │                                                     │
                     └─────────────────────────────────────────────────────┘

Relationships:
- PROFILES 1:N EVENTS (organizer creates many events)
- PROFILES N:M EVENTS through ATTENDEES (users attend many events)
- EVENTS 1:N ATTENDEES (event has many attendees)
```

#### Step 2: Complete Schema Implementation

```sql
-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================

-- User roles
CREATE TYPE user_role AS ENUM ('user', 'organizer', 'admin');

-- Event status
CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');

-- Attendance status
CREATE TYPE attendance_status AS ENUM ('registered', 'confirmed', 'attended', 'cancelled', 'no_show');

-- Ticket types
CREATE TYPE ticket_type AS ENUM ('free', 'standard', 'vip', 'early_bird');

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  role user_role DEFAULT 'user',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_public"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO public.categories (name, slug, icon) VALUES
  ('Technology', 'technology', 'laptop'),
  ('Music', 'music', 'music'),
  ('Sports', 'sports', 'trophy'),
  ('Business', 'business', 'briefcase'),
  ('Education', 'education', 'book'),
  ('Food & Drink', 'food-drink', 'utensils'),
  ('Arts', 'arts', 'palette'),
  ('Health', 'health', 'heart');

-- RLS (public read)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select_all"
  ON public.categories FOR SELECT
  USING (true);

-- ============================================
-- EVENTS TABLE
-- ============================================
CREATE TABLE public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Organizer relationship
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Basic info
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,

  -- Category
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,

  -- Location
  location_name TEXT,
  location_address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Pakistan',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_online BOOLEAN DEFAULT false,
  online_url TEXT,

  -- Date & Time
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'Asia/Karachi',

  -- Capacity & Tickets
  capacity INTEGER,
  attendee_count INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT true,
  price DECIMAL(10, 2) DEFAULT 0,
  currency TEXT DEFAULT 'PKR',

  -- Media
  cover_image TEXT,
  images TEXT[], -- Array of image URLs

  -- Status
  status event_status DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT false,

  -- Metadata
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_dates CHECK (end_date >= start_date),
  CONSTRAINT valid_capacity CHECK (capacity IS NULL OR capacity > 0),
  CONSTRAINT valid_price CHECK (price >= 0)
);

-- Indexes for common queries
CREATE INDEX idx_events_organizer ON public.events(organizer_id);
CREATE INDEX idx_events_category ON public.events(category_id);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_events_city ON public.events(city);
CREATE INDEX idx_events_featured ON public.events(is_featured) WHERE is_featured = true;
CREATE INDEX idx_events_slug ON public.events(slug);

-- Full text search index
CREATE INDEX idx_events_search ON public.events
  USING GIN (to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Anyone can view published events
CREATE POLICY "events_select_published"
  ON public.events FOR SELECT
  USING (status = 'published' OR auth.uid() = organizer_id);

-- Organizers can create events
CREATE POLICY "events_insert_organizer"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = organizer_id);

-- Organizers can update their own events
CREATE POLICY "events_update_organizer"
  ON public.events FOR UPDATE
  USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

-- Organizers can delete their own events
CREATE POLICY "events_delete_organizer"
  ON public.events FOR DELETE
  USING (auth.uid() = organizer_id);

-- ============================================
-- ATTENDEES TABLE (Junction Table)
-- ============================================
CREATE TABLE public.attendees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Relationships
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Attendance details
  status attendance_status DEFAULT 'registered',
  ticket_type ticket_type DEFAULT 'free',
  ticket_code TEXT UNIQUE,

  -- Payment (if applicable)
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  payment_status TEXT DEFAULT 'none', -- none, pending, completed, refunded
  payment_id TEXT, -- External payment reference

  -- Timestamps
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  attended_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  -- Prevent duplicate registrations
  UNIQUE(event_id, user_id)
);

-- Indexes
CREATE INDEX idx_attendees_event ON public.attendees(event_id);
CREATE INDEX idx_attendees_user ON public.attendees(user_id);
CREATE INDEX idx_attendees_status ON public.attendees(status);
CREATE INDEX idx_attendees_ticket_code ON public.attendees(ticket_code);

-- RLS
ALTER TABLE public.attendees ENABLE ROW LEVEL SECURITY;

-- Users can see their own registrations
CREATE POLICY "attendees_select_own"
  ON public.attendees FOR SELECT
  USING (auth.uid() = user_id);

-- Organizers can see attendees for their events
CREATE POLICY "attendees_select_organizer"
  ON public.attendees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = attendees.event_id
      AND events.organizer_id = auth.uid()
    )
  );

-- Users can register themselves
CREATE POLICY "attendees_insert_own"
  ON public.attendees FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own registration (cancel)
CREATE POLICY "attendees_update_own"
  ON public.attendees FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Organizers can update attendee status
CREATE POLICY "attendees_update_organizer"
  ON public.attendees FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = attendees.event_id
      AND events.organizer_id = auth.uid()
    )
  );

-- Users can delete their registration
CREATE POLICY "attendees_delete_own"
  ON public.attendees FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-generate event slug
CREATE OR REPLACE FUNCTION generate_event_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate base slug from title
  base_slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  final_slug := base_slug;

  -- Check for uniqueness and add counter if needed
  WHILE EXISTS (SELECT 1 FROM public.events WHERE slug = final_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_generate_slug
  BEFORE INSERT OR UPDATE OF title ON public.events
  FOR EACH ROW EXECUTE FUNCTION generate_event_slug();

-- Auto-generate ticket code
CREATE OR REPLACE FUNCTION generate_ticket_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ticket_code := 'TKT-' || upper(substr(md5(random()::text), 1, 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER attendees_generate_ticket
  BEFORE INSERT ON public.attendees
  FOR EACH ROW EXECUTE FUNCTION generate_ticket_code();

-- Update attendee count on events
CREATE OR REPLACE FUNCTION update_attendee_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.events
    SET attendee_count = attendee_count + 1
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.events
    SET attendee_count = attendee_count - 1
    WHERE id = OLD.event_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER attendees_count_insert
  AFTER INSERT ON public.attendees
  FOR EACH ROW EXECUTE FUNCTION update_attendee_count();

CREATE TRIGGER attendees_count_delete
  AFTER DELETE ON public.attendees
  FOR EACH ROW EXECUTE FUNCTION update_attendee_count();

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Events with organizer info
CREATE OR REPLACE VIEW public.events_with_organizer AS
SELECT
  e.*,
  p.full_name AS organizer_name,
  p.avatar_url AS organizer_avatar,
  c.name AS category_name,
  c.slug AS category_slug
FROM public.events e
LEFT JOIN public.profiles p ON e.organizer_id = p.id
LEFT JOIN public.categories c ON e.category_id = c.id;

-- User's registered events
CREATE OR REPLACE VIEW public.user_events AS
SELECT
  a.id AS registration_id,
  a.status AS registration_status,
  a.ticket_type,
  a.ticket_code,
  a.registered_at,
  e.*
FROM public.attendees a
JOIN public.events e ON a.event_id = e.id;

-- Event attendee list (for organizers)
CREATE OR REPLACE VIEW public.event_attendees AS
SELECT
  a.*,
  p.full_name,
  p.email,
  p.avatar_url,
  p.phone
FROM public.attendees a
JOIN public.profiles p ON a.user_id = p.id;
```

#### Step 3: Common Queries

```sql
-- Get upcoming published events
SELECT * FROM public.events
WHERE status = 'published'
  AND start_date > NOW()
ORDER BY start_date ASC
LIMIT 10;

-- Get events by category
SELECT * FROM public.events_with_organizer
WHERE category_slug = 'technology'
  AND status = 'published'
ORDER BY start_date ASC;

-- Get user's registered events
SELECT * FROM public.user_events
WHERE user_id = auth.uid()
ORDER BY start_date ASC;

-- Get attendees for an event (organizer only)
SELECT * FROM public.event_attendees
WHERE event_id = 'event-uuid-here'
ORDER BY registered_at DESC;

-- Search events
SELECT * FROM public.events
WHERE status = 'published'
  AND to_tsvector('english', title || ' ' || COALESCE(description, ''))
      @@ plainto_tsquery('english', 'search term')
ORDER BY start_date ASC;

-- Get events in a city
SELECT * FROM public.events
WHERE city = 'Karachi'
  AND status = 'published'
  AND start_date > NOW()
ORDER BY start_date ASC;

-- Check if user is registered for event
SELECT EXISTS (
  SELECT 1 FROM public.attendees
  WHERE event_id = 'event-uuid' AND user_id = auth.uid()
) AS is_registered;

-- Get event statistics for organizer
SELECT
  COUNT(*) AS total_events,
  SUM(attendee_count) AS total_attendees,
  COUNT(*) FILTER (WHERE status = 'published') AS published_events,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_events
FROM public.events
WHERE organizer_id = auth.uid();
```

#### Step 4: TypeScript Types

```typescript
// types/database.ts

export type UserRole = 'user' | 'organizer' | 'admin'
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed'
export type AttendanceStatus = 'registered' | 'confirmed' | 'attended' | 'cancelled' | 'no_show'
export type TicketType = 'free' | 'standard' | 'vip' | 'early_bird'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  bio: string | null
  role: UserRole
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  created_at: string
}

export interface Event {
  id: string
  organizer_id: string
  title: string
  slug: string
  description: string | null
  short_description: string | null
  category_id: string | null
  location_name: string | null
  location_address: string | null
  city: string | null
  country: string
  latitude: number | null
  longitude: number | null
  is_online: boolean
  online_url: string | null
  start_date: string
  end_date: string
  timezone: string
  capacity: number | null
  attendee_count: number
  is_free: boolean
  price: number
  currency: string
  cover_image: string | null
  images: string[] | null
  status: EventStatus
  is_featured: boolean
  tags: string[] | null
  created_at: string
  updated_at: string
  published_at: string | null
}

export interface EventWithOrganizer extends Event {
  organizer_name: string | null
  organizer_avatar: string | null
  category_name: string | null
  category_slug: string | null
}

export interface Attendee {
  id: string
  event_id: string
  user_id: string
  status: AttendanceStatus
  ticket_type: TicketType
  ticket_code: string
  amount_paid: number
  payment_status: string
  payment_id: string | null
  registered_at: string
  confirmed_at: string | null
  attended_at: string | null
  cancelled_at: string | null
}

export interface AttendeeWithProfile extends Attendee {
  full_name: string | null
  email: string
  avatar_url: string | null
  phone: string | null
}
```

### Schema Relationships Summary

| Relationship | Type | Description |
|--------------|------|-------------|
| profiles → events | 1:N | Organizer creates many events |
| profiles → attendees | 1:N | User has many registrations |
| events → attendees | 1:N | Event has many attendees |
| profiles ↔ events | N:M | Users attend many events (via attendees) |
| categories → events | 1:N | Category has many events |

### Output Format

Provide implementation with:
- Complete SQL schema with all tables
- Proper indexes for performance
- RLS policies for security
- Triggers for automation
- Views for common queries
- TypeScript types for type safety

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Slow event listing | Add composite index on (status, start_date) |
| Duplicate registrations | UNIQUE constraint on (event_id, user_id) |
| Orphaned attendees | ON DELETE CASCADE on foreign keys |
| Attendee count mismatch | Use trigger to auto-update count |
| Search performance | Use GIN index with tsvector |

## Notes

- Use UUIDs for all primary keys (better for distributed systems)
- Always add ON DELETE CASCADE for user-related foreign keys
- Create indexes on columns used in WHERE clauses
- Use ENUM types for fixed status values
- Consider partitioning events table by date for large scale
- Add soft delete (deleted_at) instead of hard delete for audit trails
