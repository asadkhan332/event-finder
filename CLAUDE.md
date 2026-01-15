# Local Event Finder

A web application to discover and manage local events, built with Next.js, Tailwind CSS, and Supabase.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React, TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Supabase (Database + Authentication)

## Project Progress

### Completed Tasks

- [x] Database schema design (SQL migration script)
- [x] Supabase project configuration (.env.local)
- [x] Next.js project initialization with TypeScript & Tailwind
- [x] Supabase client library installation
- [x] Supabase client configuration (src/lib/supabase.ts)
- [x] Database TypeScript types (src/lib/database.types.ts)
- [x] Home page with event listings (grid layout)
- [x] EventCard component
- [x] Sample events seed data (8 events)
- [x] Event detail page (/events/[id])
- [x] RSVPButton component (with full database integration)
- [x] Event creation form (/events/new)
- [x] Navigation bar with Create Event button
- [x] Authentication pages (Login/Signup)
- [x] Edit event page (/events/[id]/edit) with organizer-only access
- [x] EditEventButton component

### Pending Tasks
- [x] User profile page (with My Events and My RSVPs sections)
- [x] RSVP functionality (database integration)
- [x] Event search and filtering
- [x] Featured events section
- [x] Location-based event discovery

## Database Schema

### profiles
| Column     | Type        | Description                    |
|------------|-------------|--------------------------------|
| id         | UUID (PK)   | References auth.users(id)      |
| email      | TEXT        | User's email (unique)          |
| full_name  | TEXT        | User's full name               |
| avatar_url | TEXT        | URL to profile picture         |
| created_at | TIMESTAMPTZ | Record creation timestamp      |
| updated_at | TIMESTAMPTZ | Record update timestamp        |

### events
| Column        | Type         | Description                    |
|---------------|--------------|--------------------------------|
| id            | UUID (PK)    | Auto-generated                 |
| title         | TEXT         | Event title                    |
| description   | TEXT         | Event description              |
| date          | DATE         | Event date                     |
| time          | TIME         | Event time                     |
| location_name | TEXT         | Venue name                     |
| latitude      | DECIMAL      | Location latitude              |
| longitude     | DECIMAL      | Location longitude             |
| category      | TEXT         | Event category                 |
| image_url     | TEXT         | Event cover image              |
| organizer_id  | UUID (FK)    | References profiles(id)        |
| is_featured   | BOOLEAN      | Featured event flag            |
| created_at    | TIMESTAMPTZ  | Record creation timestamp      |
| updated_at    | TIMESTAMPTZ  | Record update timestamp        |

### rsvps
| Column     | Type        | Description                         |
|------------|-------------|-------------------------------------|
| id         | UUID (PK)   | Auto-generated                      |
| user_id    | UUID (FK)   | References profiles(id)             |
| event_id   | UUID (FK)   | References events(id)               |
| status     | TEXT        | 'going', 'interested', 'not_going'  |
| created_at | TIMESTAMPTZ | Record creation timestamp           |
| updated_at | TIMESTAMPTZ | Record update timestamp             |

## Project Structure

```
event-finder/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Event list page
│   │   ├── globals.css
│   │   ├── login/
│   │   │   └── page.tsx        # Login page
│   │   ├── signup/
│   │   │   └── page.tsx        # Signup page
│   │   └── events/
│   │       ├── new/
│   │       │   └── page.tsx    # Create event page
│   │       └── [id]/
│   │           ├── page.tsx    # Event detail page
│   │           └── edit/
│   │               └── page.tsx # Edit event page
│   ├── components/
│   │   ├── EventCard.tsx       # Event card component
│   │   ├── EventFilters.tsx    # Search and filter component
│   │   ├── EventList.tsx       # Event list with distance sorting
│   │   ├── FeaturedEvents.tsx  # Featured events carousel
│   │   ├── EditEventButton.tsx # Edit button (organizer only)
│   │   ├── DeleteEventButton.tsx # Delete button component
│   │   └── RSVPButton.tsx      # RSVP button component
│   ├── hooks/
│   │   └── useGeolocation.ts   # Browser geolocation hook
│   └── lib/
│       ├── supabase.ts         # Supabase client
│       ├── location.ts         # Location utilities & distance calc
│       └── database.types.ts   # TypeScript types
├── supabase/
│   ├── migrations/
│   │   └── 20260109000000_initial_schema.sql
│   └── seed.sql                # Sample events data
├── .env.local                  # Environment variables
├── .env.example                # Env template
├── tailwind.config.ts
└── package.json
```

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env.local` and add your Supabase credentials
3. Run the SQL migration in Supabase dashboard
4. Install dependencies: `npm install`
5. Start dev server: `npm run dev`
6. Open http://localhost:3000

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_ADMIN_EMAIL=your-admin-email
```
