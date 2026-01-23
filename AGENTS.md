# Local Event Finder - AI Agent Context

> Universal project documentation for any AI coding agent. This file contains project context, architecture, and guidelines that apply regardless of which AI assistant is being used.

---

## Project Overview

A web application to discover and manage local events, built with Next.js, Tailwind CSS, and Supabase.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16 (App Router), React, TypeScript |
| **Styling** | Tailwind CSS |
| **Backend** | Supabase (Database + Authentication) |
| **Icons** | Lucide React |

---

## Project Structure

```
event-finder/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Event list page
│   │   ├── globals.css
│   │   ├── dashboard/
│   │   │   └── page.tsx        # Organizer dashboard
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
│   │   └── AttendeeButton.tsx  # Attendee button component
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
├── frontend-agent/             # Frontend skill definitions
│   └── frontend-skills/
├── backend-agent/              # Backend skill definitions
│   └── backend-skills/
├── .env.local                  # Environment variables
├── .env.example                # Env template
├── tailwind.config.ts
└── package.json
```

---

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

### attendees
| Column     | Type        | Description                         |
|------------|-------------|-------------------------------------|
| id         | UUID (PK)   | Auto-generated                      |
| user_id    | UUID (FK)   | References profiles(id)             |
| event_id   | UUID (FK)   | References events(id)               |
| created_at | TIMESTAMPTZ | Record creation timestamp           |
| updated_at | TIMESTAMPTZ | Record update timestamp             |

---

## Project Progress

### Completed Features
- [x] Database schema design (SQL migration script)
- [x] Supabase project configuration
- [x] Next.js project with TypeScript & Tailwind
- [x] Supabase client configuration (`src/lib/supabase.ts`)
- [x] Database TypeScript types (`src/lib/database.types.ts`)
- [x] Home page with event listings (grid layout)
- [x] EventCard component
- [x] Sample events seed data (8 events)
- [x] Event detail page (`/events/[id]`)
- [x] AttendeeButton component (with full database integration)
- [x] Event creation form (`/events/new`)
- [x] Navigation bar with Create Event button
- [x] Authentication pages (Login/Signup)
- [x] Edit event page (`/events/[id]/edit`) with organizer-only access
- [x] EditEventButton component
- [x] User profile page (with My Events and My RSVPs sections)
- [x] RSVP functionality (database integration)
- [x] Event search and filtering
- [x] Featured events section
- [x] Location-based event discovery

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_ADMIN_EMAIL=your-admin-email
```

---

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env.local` and add your Supabase credentials
3. Run the SQL migration in Supabase dashboard
4. Install dependencies: `npm install`
5. Start dev server: `npm run dev`
6. Open http://localhost:3000

---

## Skill System

This project uses a modular skill system for AI agents. Skills are reusable instruction sets that define patterns and best practices for specific tasks.

### Frontend Skills (`frontend-agent/frontend-skills/`)

| Skill | Purpose |
|-------|---------|
| `ui-ux-designer` | UI design tasks |
| `tailwind-css-mastery` | Complex layouts, responsive design |
| `teal-accenting` | Teal color accent patterns |
| `vibrant-gradient-mastery` | Gradient backgrounds |
| `two-tone-layout` | Two-color page layouts |
| `premium-typography` | Font styling, text hierarchy |
| `lucide-icons` | Icon usage patterns |
| `nextjs-14-expert` | Next.js App Router patterns |
| `typescript-error-free` | Type safety enforcement |
| `navbar-guard` | Protected navigation |
| `auth-ui-integration` | Auth UI components |
| `password-visibility` | Password toggle functionality |
| `toaster-feedback` | Toast notifications |
| `zero-margin-design` | Edge-to-edge layouts |

### Backend Skills (`backend-agent/backend-skills/`)

| Skill | Purpose |
|-------|---------|
| `supabase-auth-manager` | Authentication flows |
| `google-oauth-setup` | Google OAuth integration |
| `auth-callback-redirect` | OAuth callback handling |
| `user-metadata-handler` | User profile/metadata |
| `row-level-security` | RLS policies |
| `database-policies` | Database access policies |
| `event-schema-design` | Event table schema |
| `data-validation` | Input validation |
| `storage-policies` | File storage policies |
| `advanced-sql-queries` | Complex SQL queries |
| `middleware-protection` | API route protection |
| `server-error-handling` | Error handling patterns |
| `Backend-Logic` | General backend patterns |

### Using Skills

1. **Before any task**, read the relevant `SKILL.md` file
2. **Apply patterns** from the skill's Instructions section
3. **Follow execution steps** defined in the skill
4. **Combine skills** when tasks span multiple domains

### Main Architecture Files
- Frontend: Read skills in `frontend-agent/frontend-skills/`
- Backend: Read `backend-agent/supabase-backend-architect.md` for overall guidance

---

## Code Conventions

### TypeScript
- All components must be type-safe
- Use interfaces for props and data types
- Import types from `src/lib/database.types.ts`

### Styling
- Use Tailwind CSS utility classes
- Mobile-first responsive design
- Follow existing component patterns

### Components
- Functional components with React hooks
- Client components marked with `'use client'`
- Server components by default in App Router

### Database
- Use Supabase client from `src/lib/supabase.ts`
- Implement Row Level Security (RLS) for all tables
- Handle errors gracefully with user feedback

---

## Key Patterns

### Authentication Flow
- Uses Supabase Auth
- Protected routes check session
- Profile created on signup

### Event Management
- Organizers can create/edit/delete their events
- Users can RSVP (attend) events
- Featured events displayed prominently

### Location Features
- Browser geolocation for distance calculation
- Events sortable by distance
- Location stored as lat/long coordinates
