# Event Finder - Current State Specification

> Last Updated: 2026-01-26

---

## Project Overview

Event Finder is a fully functional web application for discovering and managing local events. Built with Next.js 16, Tailwind CSS, and Supabase.

---

## Tech Stack (Implemented)

| Category | Technology | Version |
|----------|------------|---------|
| Frontend | Next.js (App Router) | 16.1.1 |
| UI Library | React | 19.2.3 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Animations | Framer Motion | 12.29.0 |
| Icons | Lucide React | 0.562.0 |
| Notifications | react-hot-toast | 2.6.0 |
| Maps | Leaflet + react-leaflet | 1.9.4 / 5.0.0 |
| Backend | Supabase | 2.90.1 |
| Auth SSR | @supabase/ssr | 0.8.0 |

---

## Frontend Features

### Pages Implemented

| Route | Page | Status | Features |
|-------|------|--------|----------|
| `/` | Home | ✅ Complete | Hero section, featured events, event grid, search/filters, location sorting |
| `/login` | Login | ✅ Complete | Email/password, Google OAuth, password visibility toggle |
| `/signup` | Signup | ✅ Complete | Email/password, Google OAuth, auto-profile creation |
| `/forgot-password` | Forgot Password | ✅ Complete | Password reset email flow |
| `/reset-password` | Reset Password | ✅ Complete | New password form |
| `/auth/callback` | OAuth Callback | ✅ Complete | Google OAuth redirect handling |
| `/role-selection` | Role Selection | ✅ Complete | Seeker/Host card selection, animated states |
| `/profile` | User Profile | ✅ Complete | Teal header, stats cards, events grid, avatar |
| `/profile/settings` | Settings | ✅ Complete | Name/photo editing, real-time updates |
| `/events/new` | Create Event | ✅ Complete | Orange/teal form, category grid, image upload |
| `/events/[id]` | Event Detail | ✅ Complete | Full info, map, RSVP, reviews, share |
| `/events/[id]/edit` | Edit Event | ✅ Complete | Pre-filled form, organizer-only |
| `/dashboard` | General Dashboard | ✅ Complete | Dashboard layout |
| `/dashboard/host` | Host Dashboard | ✅ Complete | Stats, event management, attendee counts |

### Components Implemented

#### Navigation
| Component | File | Features |
|-----------|------|----------|
| Navbar | `src/components/Navbar.tsx` | Logo, profile dropdown, mobile menu, session management |
| BottomNav | `src/components/BottomNav.tsx` | Mobile bottom navigation |
| MobileHeader | `src/components/MobileHeader.tsx` | Mobile top header |

#### Event Components
| Component | File | Features |
|-----------|------|----------|
| EventCard | `src/components/EventCard.tsx` | Glass-morphism, WhatsApp share, distance, teal glow |
| MobileEventCard | `src/components/MobileEventCard.tsx` | Mobile-optimized card |
| EventList | `src/components/EventList.tsx` | Distance sorting, client filtering |
| EventFilters | `src/components/EventFilters.tsx` | Search, category pills, date, distance |
| FeaturedEvents | `src/components/FeaturedEvents.tsx` | Carousel/grid display |

#### Interactive Components
| Component | File | Features |
|-----------|------|----------|
| AttendeeButton | `src/components/AttendeeButton.tsx` | Toggle RSVP, real-time count |
| EditEventButton | `src/components/EditEventButton.tsx` | Organizer-only visibility |
| DeleteEventButton | `src/components/DeleteEventButton.tsx` | Confirmation, image cleanup |
| ShareButton | `src/components/ShareButton.tsx` | Social sharing options |
| ReviewSection | `src/components/ReviewSection.tsx` | Star ratings, CRUD reviews |

#### UI Components
| Component | File | Features |
|-----------|------|----------|
| Hero | `src/components/Hero.tsx` | Animated mesh gradient, Framer Motion |
| MapWrapper | `src/components/MapWrapper.tsx` | Client-side map rendering |
| EventMap | `src/components/EventMap.tsx` | Leaflet with custom markers |

### UI/UX Patterns
- **Color Scheme:** Orange/teal accent colors
- **Effects:** Glass-morphism, teal glow on hover
- **Animations:** Framer Motion breathing gradients
- **Design:** Mobile-first responsive
- **Feedback:** Toast notifications, loading spinners
- **Icons:** Lucide React throughout

---

## Backend Features

### Database Schema

#### profiles
```sql
| Column     | Type        | Constraints              |
|------------|-------------|--------------------------|
| id         | UUID        | PK, FK → auth.users(id)  |
| email      | TEXT        | UNIQUE                   |
| full_name  | TEXT        | nullable                 |
| avatar_url | TEXT        | nullable                 |
| role       | TEXT        | 'seeker' | 'host' | null |
| created_at | TIMESTAMPTZ | DEFAULT now()            |
| updated_at | TIMESTAMPTZ | DEFAULT now()            |
```

#### events
```sql
| Column        | Type        | Constraints           |
|---------------|-------------|-----------------------|
| id            | UUID        | PK, auto-generated    |
| title         | TEXT        | NOT NULL              |
| description   | TEXT        | nullable              |
| date          | DATE        | NOT NULL              |
| time          | TIME        | NOT NULL              |
| location_name | TEXT        | NOT NULL              |
| latitude      | DECIMAL     | nullable              |
| longitude     | DECIMAL     | nullable              |
| category      | TEXT        | NOT NULL              |
| image_url     | TEXT        | nullable              |
| organizer_id  | UUID        | FK → profiles(id)     |
| is_featured   | BOOLEAN     | DEFAULT false         |
| created_at    | TIMESTAMPTZ | DEFAULT now()         |
| updated_at    | TIMESTAMPTZ | DEFAULT now()         |
```

#### attendees
```sql
| Column     | Type        | Constraints                    |
|------------|-------------|--------------------------------|
| id         | UUID        | PK, auto-generated             |
| user_id    | UUID        | FK → profiles(id)              |
| event_id   | UUID        | FK → events(id)                |
| created_at | TIMESTAMPTZ | DEFAULT now()                  |
| UNIQUE     | -           | (user_id, event_id)            |
```

#### reviews
```sql
| Column     | Type        | Constraints           |
|------------|-------------|-----------------------|
| id         | UUID        | PK, auto-generated    |
| user_id    | UUID        | FK → profiles(id)     |
| event_id   | UUID        | FK → events(id)       |
| rating     | INTEGER     | 1-5                   |
| comment    | TEXT        | nullable              |
| created_at | TIMESTAMPTZ | DEFAULT now()         |
| updated_at | TIMESTAMPTZ | DEFAULT now()         |
```

### Row Level Security (RLS)

| Table | Policy | Access |
|-------|--------|--------|
| profiles | Public read | Anyone can view profiles |
| profiles | Self write | Users can update own profile |
| events | Public read | Anyone can view events |
| events | Auth create | Logged-in users can create |
| events | Organizer update/delete | Only organizer can modify |
| attendees | Public read | Anyone can see attendance |
| attendees | Self manage | Users manage own RSVPs |
| reviews | Public read | Anyone can view reviews |
| reviews | Self manage | Users manage own reviews |

### Authentication

| Feature | Status | Implementation |
|---------|--------|----------------|
| Email/Password | ✅ | Supabase Auth |
| Google OAuth | ✅ | OAuth 2.0 flow |
| Password Reset | ✅ | Email-based reset |
| Session Management | ✅ | @supabase/ssr |
| Auto Profile Creation | ✅ | Database trigger |

### Storage Buckets

| Bucket | Purpose | Max Size |
|--------|---------|----------|
| Avatar | Profile pictures | 5MB |
| Event-images | Event cover images | 5MB |

### Middleware Protection

```
src/middleware.ts
├── Session validation (server-side)
├── Public routes: /, /events/[id], /login, /signup
├── Protected routes: /profile, /dashboard, /events/new
├── Role enforcement: redirect to /role-selection if no role
└── Role-based redirects:
    ├── seeker → /
    └── host → /dashboard/host
```

### Utility Functions

| File | Functions |
|------|-----------|
| `src/lib/supabase.ts` | Type-safe Supabase client |
| `src/lib/database.types.ts` | TypeScript interfaces |
| `src/lib/location.ts` | Haversine distance calculation, formatting |

### Hooks

| Hook | File | Purpose |
|------|------|---------|
| useGeolocation | `src/hooks/useGeolocation.ts` | Browser location access |

---

## Feature Matrix

### User Features
| Feature | Seeker | Host |
|---------|--------|------|
| Browse events | ✅ | ✅ |
| View event details | ✅ | ✅ |
| RSVP to events | ✅ | ✅ |
| Write reviews | ✅ | ✅ |
| Share events | ✅ | ✅ |
| Create events | ❌ | ✅ |
| Edit own events | ❌ | ✅ |
| Delete own events | ❌ | ✅ |
| View dashboard | ❌ | ✅ |
| Edit profile | ✅ | ✅ |
| Upload avatar | ✅ | ✅ |

### Event Features
| Feature | Status |
|---------|--------|
| Event listing grid | ✅ |
| Featured events carousel | ✅ |
| Category filtering | ✅ |
| Search by title | ✅ |
| Date filtering | ✅ |
| Distance-based sorting | ✅ |
| Location on map | ✅ |
| Image upload | ✅ |
| RSVP/Attendance tracking | ✅ |
| Attendee count | ✅ |
| Review & ratings | ✅ |
| WhatsApp sharing | ✅ |

---

## Database Migrations

| Migration | Date | Changes |
|-----------|------|---------|
| 20260109000000_initial_schema.sql | 2026-01-09 | profiles, events, attendees tables, RLS policies, indexes |
| 20260124000000_add_role_column.sql | 2026-01-24 | Added role column to profiles |

---

## Seed Data

- 1 demo organizer account
- 8 sample events across categories:
  - Tech, Food, Music, Health, Business, Arts, Community
- Events with Unsplash images
- Featured events flagged

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL      # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY # Supabase anonymous key
NEXT_PUBLIC_ADMIN_EMAIL       # Admin email for special access
```

---

## Project Structure

```
event-finder/
├── src/
│   ├── app/                 # 14 pages implemented
│   ├── components/          # 15+ components
│   ├── hooks/               # 1 custom hook
│   ├── lib/                 # 3 utility files
│   └── middleware.ts        # Auth & role protection
├── supabase/
│   ├── migrations/          # 2 migrations
│   └── seed.sql             # Sample data
├── frontend-agent/          # AI agent skills
├── backend-agent/           # AI agent skills
├── AGENTS.md                # Universal project docs
├── CLAUDE.md                # Claude-specific docs
└── current_state.md         # This file
```

---

## Summary

**Frontend:** 14 pages, 15+ components, full responsive design with orange/teal theme, Framer Motion animations, glass-morphism effects.

**Backend:** 4 database tables with RLS, Supabase Auth (email + Google OAuth), 2 storage buckets, middleware protection, role-based access.

**Status:** Production-ready MVP with complete event discovery, creation, and management features.
