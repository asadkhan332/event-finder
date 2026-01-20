# Advanced SQL Queries

Fetch data from multiple tables using joins and provide to frontend (e.g., event with organizer name).

## Trigger Phrases

- "write advanced sql query"
- "join multiple tables"
- "fetch related data from database"
- "sql query with joins"
- "/advanced-sql"

## Instructions

Write efficient SQL queries to fetch data from multiple related tables and integrate with frontend applications.

### Context Gathering

1. Identify tables and their relationships
2. Determine required fields for frontend
3. Check indexes on join columns
4. Identify filtering and sorting requirements

### Execution Steps

#### Step 1: JOIN Types Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                       JOIN TYPES                                 │
├─────────────────────────────────────────────────────────────────┤
│ INNER JOIN  → Only matching rows from both tables               │
│ LEFT JOIN   → All from left + matching from right (NULL if none)│
│ RIGHT JOIN  → All from right + matching from left               │
│ FULL JOIN   → All rows from both tables                         │
│ CROSS JOIN  → Cartesian product (every combination)             │
├─────────────────────────────────────────────────────────────────┤
│ Most Common: LEFT JOIN (get all primary records + related data) │
└─────────────────────────────────────────────────────────────────┘
```

```sql
-- Visual representation
-- INNER JOIN: Only where A and B overlap
-- LEFT JOIN:  All of A, matching parts of B
-- RIGHT JOIN: All of B, matching parts of A
-- FULL JOIN:  All of A and all of B
```

#### Step 2: Basic Joins

**Event with Organizer Name:**
```sql
-- Simple join
SELECT
  e.id,
  e.title,
  e.start_date,
  e.cover_image,
  p.full_name AS organizer_name,
  p.avatar_url AS organizer_avatar
FROM public.events e
LEFT JOIN public.profiles p ON e.organizer_id = p.id
WHERE e.status = 'published'
ORDER BY e.start_date ASC;
```

**Event with Category:**
```sql
SELECT
  e.*,
  c.name AS category_name,
  c.slug AS category_slug,
  c.icon AS category_icon
FROM public.events e
LEFT JOIN public.categories c ON e.category_id = c.id
WHERE e.status = 'published';
```

**Event with Organizer AND Category:**
```sql
SELECT
  e.id,
  e.title,
  e.slug,
  e.description,
  e.start_date,
  e.end_date,
  e.location_name,
  e.city,
  e.cover_image,
  e.price,
  e.is_free,
  e.capacity,
  e.attendee_count,
  e.status,
  -- Organizer info
  p.id AS organizer_id,
  p.full_name AS organizer_name,
  p.avatar_url AS organizer_avatar,
  p.is_verified AS organizer_verified,
  -- Category info
  c.name AS category_name,
  c.slug AS category_slug
FROM public.events e
LEFT JOIN public.profiles p ON e.organizer_id = p.id
LEFT JOIN public.categories c ON e.category_id = c.id
WHERE e.status = 'published'
ORDER BY e.start_date ASC;
```

#### Step 3: Aggregations with Joins

**Events with Attendee Count (Calculated):**
```sql
SELECT
  e.*,
  p.full_name AS organizer_name,
  COUNT(a.id) AS total_attendees,
  COUNT(a.id) FILTER (WHERE a.status = 'confirmed') AS confirmed_attendees
FROM public.events e
LEFT JOIN public.profiles p ON e.organizer_id = p.id
LEFT JOIN public.attendees a ON e.id = a.event_id
WHERE e.status = 'published'
GROUP BY e.id, p.full_name
ORDER BY e.start_date ASC;
```

**Organizer with Event Statistics:**
```sql
SELECT
  p.id,
  p.full_name,
  p.avatar_url,
  p.is_verified,
  COUNT(e.id) AS total_events,
  COUNT(e.id) FILTER (WHERE e.status = 'published') AS published_events,
  SUM(e.attendee_count) AS total_attendees,
  AVG(e.attendee_count)::INTEGER AS avg_attendees_per_event
FROM public.profiles p
LEFT JOIN public.events e ON p.id = e.organizer_id
WHERE p.role IN ('organizer', 'admin')
GROUP BY p.id
ORDER BY total_events DESC;
```

**Category with Event Count:**
```sql
SELECT
  c.*,
  COUNT(e.id) AS event_count,
  COUNT(e.id) FILTER (WHERE e.start_date > NOW()) AS upcoming_events
FROM public.categories c
LEFT JOIN public.events e ON c.id = e.category_id AND e.status = 'published'
GROUP BY c.id
ORDER BY event_count DESC;
```

#### Step 4: Subqueries

**Events with Latest Attendees:**
```sql
SELECT
  e.*,
  p.full_name AS organizer_name,
  (
    SELECT json_agg(json_build_object(
      'id', a.id,
      'name', ap.full_name,
      'avatar', ap.avatar_url
    ))
    FROM (
      SELECT * FROM public.attendees
      WHERE event_id = e.id
      ORDER BY registered_at DESC
      LIMIT 5
    ) a
    JOIN public.profiles ap ON a.user_id = ap.id
  ) AS recent_attendees
FROM public.events e
LEFT JOIN public.profiles p ON e.organizer_id = p.id
WHERE e.status = 'published';
```

**User's Events with Registration Status:**
```sql
SELECT
  e.*,
  p.full_name AS organizer_name,
  c.name AS category_name,
  (
    SELECT a.status
    FROM public.attendees a
    WHERE a.event_id = e.id AND a.user_id = $1
  ) AS registration_status,
  (
    SELECT a.ticket_code
    FROM public.attendees a
    WHERE a.event_id = e.id AND a.user_id = $1
  ) AS ticket_code
FROM public.events e
LEFT JOIN public.profiles p ON e.organizer_id = p.id
LEFT JOIN public.categories c ON e.category_id = c.id
WHERE e.status = 'published'
ORDER BY e.start_date ASC;
```

**Events User Might Like (Based on Past Registrations):**
```sql
SELECT DISTINCT e.*
FROM public.events e
WHERE e.status = 'published'
  AND e.start_date > NOW()
  AND e.category_id IN (
    SELECT DISTINCT ev.category_id
    FROM public.attendees a
    JOIN public.events ev ON a.event_id = ev.id
    WHERE a.user_id = $1
  )
  AND e.id NOT IN (
    SELECT event_id FROM public.attendees WHERE user_id = $1
  )
ORDER BY e.start_date ASC
LIMIT 10;
```

#### Step 5: Common Table Expressions (CTEs)

**Event Details with All Related Data:**
```sql
WITH event_stats AS (
  SELECT
    event_id,
    COUNT(*) AS total_registrations,
    COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed,
    COUNT(*) FILTER (WHERE status = 'attended') AS attended,
    COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled
  FROM public.attendees
  GROUP BY event_id
),
recent_attendees AS (
  SELECT
    a.event_id,
    json_agg(
      json_build_object(
        'id', p.id,
        'name', p.full_name,
        'avatar', p.avatar_url
      ) ORDER BY a.registered_at DESC
    ) FILTER (WHERE p.id IS NOT NULL) AS attendees
  FROM public.attendees a
  JOIN public.profiles p ON a.user_id = p.id
  WHERE a.status IN ('registered', 'confirmed')
  GROUP BY a.event_id
)
SELECT
  e.*,
  -- Organizer
  org.full_name AS organizer_name,
  org.avatar_url AS organizer_avatar,
  org.is_verified AS organizer_verified,
  -- Category
  c.name AS category_name,
  c.slug AS category_slug,
  c.icon AS category_icon,
  -- Stats
  COALESCE(es.total_registrations, 0) AS total_registrations,
  COALESCE(es.confirmed, 0) AS confirmed_count,
  COALESCE(es.attended, 0) AS attended_count,
  -- Recent attendees
  COALESCE(ra.attendees, '[]'::json) AS recent_attendees
FROM public.events e
LEFT JOIN public.profiles org ON e.organizer_id = org.id
LEFT JOIN public.categories c ON e.category_id = c.id
LEFT JOIN event_stats es ON e.id = es.event_id
LEFT JOIN recent_attendees ra ON e.id = ra.event_id
WHERE e.id = $1;
```

**Dashboard Statistics:**
```sql
WITH user_events AS (
  SELECT * FROM public.events WHERE organizer_id = $1
),
event_stats AS (
  SELECT
    COUNT(*) AS total_events,
    COUNT(*) FILTER (WHERE status = 'published') AS published,
    COUNT(*) FILTER (WHERE status = 'draft') AS drafts,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed,
    COUNT(*) FILTER (WHERE start_date > NOW() AND status = 'published') AS upcoming
  FROM user_events
),
attendee_stats AS (
  SELECT
    COUNT(*) AS total_attendees,
    COUNT(DISTINCT a.user_id) AS unique_attendees
  FROM public.attendees a
  JOIN user_events e ON a.event_id = e.id
  WHERE a.status IN ('registered', 'confirmed', 'attended')
),
revenue_stats AS (
  SELECT
    COALESCE(SUM(a.amount_paid), 0) AS total_revenue,
    COUNT(*) FILTER (WHERE a.amount_paid > 0) AS paid_tickets
  FROM public.attendees a
  JOIN user_events e ON a.event_id = e.id
  WHERE a.payment_status = 'completed'
)
SELECT
  es.*,
  ast.total_attendees,
  ast.unique_attendees,
  rs.total_revenue,
  rs.paid_tickets
FROM event_stats es
CROSS JOIN attendee_stats ast
CROSS JOIN revenue_stats rs;
```

#### Step 6: Database Views

**Create Reusable Views:**
```sql
-- Events with all related data
CREATE OR REPLACE VIEW public.events_detailed AS
SELECT
  e.*,
  -- Organizer
  org.full_name AS organizer_name,
  org.avatar_url AS organizer_avatar,
  org.is_verified AS organizer_verified,
  org.bio AS organizer_bio,
  -- Category
  c.name AS category_name,
  c.slug AS category_slug,
  c.icon AS category_icon,
  -- Computed
  CASE
    WHEN e.start_date > NOW() THEN 'upcoming'
    WHEN e.end_date < NOW() THEN 'past'
    ELSE 'ongoing'
  END AS time_status,
  CASE
    WHEN e.capacity IS NULL THEN false
    WHEN e.attendee_count >= e.capacity THEN true
    ELSE false
  END AS is_full,
  e.capacity - e.attendee_count AS spots_left
FROM public.events e
LEFT JOIN public.profiles org ON e.organizer_id = org.id
LEFT JOIN public.categories c ON e.category_id = c.id;

-- User registrations with event details
CREATE OR REPLACE VIEW public.user_registrations AS
SELECT
  a.id AS registration_id,
  a.user_id,
  a.status AS registration_status,
  a.ticket_type,
  a.ticket_code,
  a.amount_paid,
  a.registered_at,
  -- Event details
  e.id AS event_id,
  e.title AS event_title,
  e.slug AS event_slug,
  e.start_date,
  e.end_date,
  e.location_name,
  e.city,
  e.cover_image,
  e.status AS event_status,
  -- Organizer
  org.full_name AS organizer_name
FROM public.attendees a
JOIN public.events e ON a.event_id = e.id
LEFT JOIN public.profiles org ON e.organizer_id = org.id;

-- Event attendee list (for organizers)
CREATE OR REPLACE VIEW public.event_attendee_list AS
SELECT
  a.*,
  p.full_name,
  p.email,
  p.avatar_url,
  p.phone,
  e.organizer_id
FROM public.attendees a
JOIN public.profiles p ON a.user_id = p.id
JOIN public.events e ON a.event_id = e.id;
```

**Use Views in Queries:**
```sql
-- Simple query using view
SELECT * FROM public.events_detailed
WHERE status = 'published' AND time_status = 'upcoming'
ORDER BY start_date ASC
LIMIT 10;

-- User's upcoming registrations
SELECT * FROM public.user_registrations
WHERE user_id = $1 AND start_date > NOW()
ORDER BY start_date ASC;
```

#### Step 7: Database Functions

**Get Event with Full Details:**
```sql
CREATE OR REPLACE FUNCTION get_event_details(event_slug TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'id', e.id,
    'title', e.title,
    'slug', e.slug,
    'description', e.description,
    'start_date', e.start_date,
    'end_date', e.end_date,
    'location', json_build_object(
      'name', e.location_name,
      'address', e.location_address,
      'city', e.city,
      'is_online', e.is_online,
      'online_url', e.online_url
    ),
    'capacity', e.capacity,
    'attendee_count', e.attendee_count,
    'spots_left', CASE WHEN e.capacity IS NOT NULL THEN e.capacity - e.attendee_count ELSE NULL END,
    'is_free', e.is_free,
    'price', e.price,
    'cover_image', e.cover_image,
    'images', e.images,
    'status', e.status,
    'organizer', json_build_object(
      'id', p.id,
      'name', p.full_name,
      'avatar', p.avatar_url,
      'is_verified', p.is_verified
    ),
    'category', json_build_object(
      'name', c.name,
      'slug', c.slug,
      'icon', c.icon
    )
  ) INTO result
  FROM public.events e
  LEFT JOIN public.profiles p ON e.organizer_id = p.id
  LEFT JOIN public.categories c ON e.category_id = c.id
  WHERE e.slug = event_slug;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Search Events with Filters:**
```sql
CREATE OR REPLACE FUNCTION search_events(
  search_query TEXT DEFAULT NULL,
  category_slug TEXT DEFAULT NULL,
  city_filter TEXT DEFAULT NULL,
  is_free_filter BOOLEAN DEFAULT NULL,
  start_after TIMESTAMPTZ DEFAULT NOW(),
  page_number INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  short_description TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  location_name TEXT,
  city TEXT,
  is_online BOOLEAN,
  cover_image TEXT,
  price DECIMAL,
  is_free BOOLEAN,
  attendee_count INTEGER,
  capacity INTEGER,
  organizer_name TEXT,
  organizer_avatar TEXT,
  category_name TEXT,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH filtered_events AS (
    SELECT e.*
    FROM public.events e
    LEFT JOIN public.categories c ON e.category_id = c.id
    WHERE e.status = 'published'
      AND e.start_date >= start_after
      AND (search_query IS NULL OR (
        e.title ILIKE '%' || search_query || '%' OR
        e.description ILIKE '%' || search_query || '%' OR
        e.location_name ILIKE '%' || search_query || '%'
      ))
      AND (category_slug IS NULL OR c.slug = category_slug)
      AND (city_filter IS NULL OR e.city ILIKE city_filter)
      AND (is_free_filter IS NULL OR e.is_free = is_free_filter)
  )
  SELECT
    fe.id,
    fe.title,
    fe.slug,
    fe.short_description,
    fe.start_date,
    fe.end_date,
    fe.location_name,
    fe.city,
    fe.is_online,
    fe.cover_image,
    fe.price,
    fe.is_free,
    fe.attendee_count,
    fe.capacity,
    p.full_name AS organizer_name,
    p.avatar_url AS organizer_avatar,
    cat.name AS category_name,
    COUNT(*) OVER() AS total_count
  FROM filtered_events fe
  LEFT JOIN public.profiles p ON fe.organizer_id = p.id
  LEFT JOIN public.categories cat ON fe.category_id = cat.id
  ORDER BY fe.start_date ASC
  LIMIT page_size
  OFFSET (page_number - 1) * page_size;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Get User Dashboard Data:**
```sql
CREATE OR REPLACE FUNCTION get_user_dashboard(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'upcoming_events', (
      SELECT COALESCE(json_agg(row_to_json(r)), '[]'::json)
      FROM (
        SELECT
          e.id, e.title, e.slug, e.start_date, e.cover_image,
          e.location_name, a.ticket_code, a.status AS registration_status
        FROM public.attendees a
        JOIN public.events e ON a.event_id = e.id
        WHERE a.user_id = user_uuid
          AND e.start_date > NOW()
          AND a.status IN ('registered', 'confirmed')
        ORDER BY e.start_date ASC
        LIMIT 5
      ) r
    ),
    'past_events', (
      SELECT COALESCE(json_agg(row_to_json(r)), '[]'::json)
      FROM (
        SELECT
          e.id, e.title, e.slug, e.start_date, e.cover_image,
          a.status AS attendance_status
        FROM public.attendees a
        JOIN public.events e ON a.event_id = e.id
        WHERE a.user_id = user_uuid
          AND e.end_date < NOW()
        ORDER BY e.start_date DESC
        LIMIT 5
      ) r
    ),
    'stats', (
      SELECT json_build_object(
        'total_events_attended', COUNT(*) FILTER (WHERE e.end_date < NOW()),
        'upcoming_events', COUNT(*) FILTER (WHERE e.start_date > NOW()),
        'total_spent', COALESCE(SUM(a.amount_paid), 0)
      )
      FROM public.attendees a
      JOIN public.events e ON a.event_id = e.id
      WHERE a.user_id = user_uuid
        AND a.status IN ('registered', 'confirmed', 'attended')
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Step 8: Supabase Client Integration

**TypeScript Types:**
```typescript
// types/database.ts
export interface EventDetailed {
  id: string
  title: string
  slug: string
  description: string | null
  short_description: string | null
  start_date: string
  end_date: string
  location_name: string | null
  city: string | null
  is_online: boolean
  cover_image: string | null
  price: number
  is_free: boolean
  capacity: number | null
  attendee_count: number
  status: string
  // Joined fields
  organizer_name: string | null
  organizer_avatar: string | null
  organizer_verified: boolean
  category_name: string | null
  category_slug: string | null
  // Computed
  time_status: 'upcoming' | 'ongoing' | 'past'
  is_full: boolean
  spots_left: number | null
}

export interface UserRegistration {
  registration_id: string
  registration_status: string
  ticket_type: string
  ticket_code: string
  registered_at: string
  event_id: string
  event_title: string
  event_slug: string
  start_date: string
  cover_image: string | null
  organizer_name: string | null
}
```

**Fetch Functions:**
```typescript
// lib/queries/events.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { EventDetailed } from '@/types/database'

const supabase = createClientComponentClient()

// Get upcoming events with organizer and category
export async function getUpcomingEvents(limit = 10): Promise<EventDetailed[]> {
  const { data, error } = await supabase
    .from('events_detailed')
    .select('*')
    .eq('status', 'published')
    .eq('time_status', 'upcoming')
    .order('start_date', { ascending: true })
    .limit(limit)

  if (error) throw error
  return data || []
}

// Get single event by slug
export async function getEventBySlug(slug: string): Promise<EventDetailed | null> {
  const { data, error } = await supabase
    .from('events_detailed')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  return data
}

// Get events with custom join query
export async function getEventsWithAttendees() {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      organizer:profiles!organizer_id (
        id,
        full_name,
        avatar_url,
        is_verified
      ),
      category:categories (
        name,
        slug,
        icon
      ),
      attendees (
        id,
        user_id,
        status,
        profiles (
          full_name,
          avatar_url
        )
      )
    `)
    .eq('status', 'published')
    .order('start_date', { ascending: true })

  if (error) throw error
  return data
}

// Search events using database function
export async function searchEvents(params: {
  query?: string
  category?: string
  city?: string
  isFree?: boolean
  page?: number
  pageSize?: number
}) {
  const { data, error } = await supabase.rpc('search_events', {
    search_query: params.query || null,
    category_slug: params.category || null,
    city_filter: params.city || null,
    is_free_filter: params.isFree ?? null,
    page_number: params.page || 1,
    page_size: params.pageSize || 10,
  })

  if (error) throw error

  const totalCount = data?.[0]?.total_count || 0
  return {
    events: data || [],
    totalCount,
    totalPages: Math.ceil(totalCount / (params.pageSize || 10)),
  }
}

// Get event details using database function
export async function getEventDetails(slug: string) {
  const { data, error } = await supabase.rpc('get_event_details', {
    event_slug: slug,
  })

  if (error) throw error
  return data
}
```

**User Queries:**
```typescript
// lib/queries/user.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()

// Get user's registrations
export async function getUserRegistrations(userId: string) {
  const { data, error } = await supabase
    .from('user_registrations')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: true })

  if (error) throw error
  return data || []
}

// Get user dashboard data
export async function getUserDashboard(userId: string) {
  const { data, error } = await supabase.rpc('get_user_dashboard', {
    user_uuid: userId,
  })

  if (error) throw error
  return data
}

// Check if user is registered for event
export async function checkRegistration(eventId: string, userId: string) {
  const { data, error } = await supabase
    .from('attendees')
    .select('id, status, ticket_code')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}
```

**React Hook Example:**
```typescript
// hooks/useEventDetails.ts
import { useQuery } from '@tanstack/react-query'
import { getEventBySlug } from '@/lib/queries/events'

export function useEventDetails(slug: string) {
  return useQuery({
    queryKey: ['event', slug],
    queryFn: () => getEventBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Usage in component
function EventPage({ slug }: { slug: string }) {
  const { data: event, isLoading, error } = useEventDetails(slug)

  if (isLoading) return <Skeleton />
  if (error) return <Error message={error.message} />
  if (!event) return <NotFound />

  return (
    <div>
      <h1>{event.title}</h1>
      <p>By {event.organizer_name}</p>
      <p>Category: {event.category_name}</p>
      <p>{event.spots_left} spots left</p>
    </div>
  )
}
```

#### Step 9: Performance Optimization

**Create Indexes for Joins:**
```sql
-- Indexes on foreign keys (usually auto-created, but verify)
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_category_id ON public.events(category_id);
CREATE INDEX IF NOT EXISTS idx_attendees_event_id ON public.attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_attendees_user_id ON public.attendees(user_id);

-- Composite indexes for common queries
CREATE INDEX idx_events_status_date ON public.events(status, start_date)
  WHERE status = 'published';

CREATE INDEX idx_attendees_event_status ON public.attendees(event_id, status);

-- Partial index for upcoming events
CREATE INDEX idx_events_upcoming ON public.events(start_date)
  WHERE status = 'published' AND start_date > NOW();
```

**Use EXPLAIN ANALYZE:**
```sql
-- Check query performance
EXPLAIN ANALYZE
SELECT e.*, p.full_name
FROM public.events e
LEFT JOIN public.profiles p ON e.organizer_id = p.id
WHERE e.status = 'published'
ORDER BY e.start_date ASC
LIMIT 10;
```

### Query Patterns Quick Reference

| Need | Pattern |
|------|---------|
| Related data | `LEFT JOIN table ON fk = pk` |
| Count related | `COUNT(*)` with `GROUP BY` |
| JSON object | `json_build_object('key', value)` |
| JSON array | `json_agg(row_to_json(t))` |
| Conditional count | `COUNT(*) FILTER (WHERE condition)` |
| Pagination | `LIMIT n OFFSET (page-1)*n` |
| Total with pagination | `COUNT(*) OVER()` |
| Reusable query | `CREATE VIEW` |
| Complex logic | `CREATE FUNCTION` |
| Pre-compute | CTE with `WITH` |

### Supabase Select Syntax

```typescript
// Basic join
.select('*, profiles(*)')

// Specific fields from relation
.select('*, profiles(id, full_name, avatar_url)')

// Renamed relation
.select('*, organizer:profiles!organizer_id(*)')

// Multiple relations
.select(`
  *,
  organizer:profiles!organizer_id(full_name, avatar_url),
  category:categories(name, slug)
`)

// Nested relations
.select(`
  *,
  attendees(
    id,
    status,
    profiles(full_name, avatar_url)
  )
`)
```

### Output Format

Provide implementation with:
- Optimized SQL queries with proper JOINs
- Database views for reusable queries
- Database functions for complex operations
- TypeScript types for query results
- Supabase client integration code
- React hooks for data fetching

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| N+1 queries | Use JOINs or embed relations in single query |
| Slow joins | Add indexes on join columns |
| Too much data | Select only needed columns |
| Pagination issues | Use `COUNT(*) OVER()` for total |
| NULL in aggregation | Use `COALESCE(value, default)` |
| Complex filters | Use database functions with parameters |

## Notes

- Always select only needed columns to reduce data transfer
- Use views for frequently used complex queries
- Use database functions for complex business logic
- Add indexes on columns used in JOINs and WHERE
- Use EXPLAIN ANALYZE to optimize slow queries
- Consider materialized views for expensive aggregations
- Supabase auto-generates types from schema with CLI
