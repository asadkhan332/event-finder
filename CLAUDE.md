# Local Event Finder

A web application to discover and manage local events, built with Next.js, Tailwind CSS, and Supabase.

---

## 🎯 Frontend Agent - Orchestrator Instructions

**IMPORTANT:** When working on frontend tasks, ALWAYS read and apply the relevant skills from:
`frontend-agent/frontend-skills/`

### Available Skills (Read SKILL.md before any UI work):

| Skill | When to Use | Path |
|-------|-------------|------|
| **ui-ux-designer** | Any UI design task | `frontend-skills/ui-ux-designer/SKILL.md` |
| **tailwind-css-mastery** | Complex layouts, responsive design | `frontend-skills/tailwind-css-mastery/SKILL.md` |
| **teal-accenting** | Adding teal color accents | `frontend-skills/teal-accenting/SKILL.md` |
| **vibrant-gradient-mastery** | Gradient backgrounds | `frontend-skills/vibrant-gradient-mastery/SKILL.md` |
| **two-tone-layout** | Two-color page layouts | `frontend-skills/two-tone-layout/SKILL.md` |
| **premium-typography** | Font styling, text hierarchy | `frontend-skills/premium-typography/SKILL.md` |
| **lucide-icons** | Icon usage | `frontend-skills/lucide-icons/SKILL.md` |
| **nextjs-14-expert** | Next.js App Router patterns | `frontend-skills/nextjs-14-expert/SKILL.md` |
| **typescript-error-free** | Type safety | `frontend-skills/typescript-error-free/SKILL.md` |
| **navbar-guard** | Protected navigation | `frontend-skills/navbar-guard/SKILL.md` |
| **auth-ui-integration** | Auth UI components | `frontend-skills/auth-ui-integration/SKILL.md` |
| **password-visibility** | Password toggle | `frontend-skills/password-visibility/SKILL.md` |
| **toaster-feedback** | Toast notifications | `frontend-skills/toaster-feedback/SKILL.md` |
| **zero-margin-design** | Edge-to-edge layouts | `frontend-skills/zero-margin-design/SKILL.md` |

### How to Use Skills:

1. **Before ANY frontend task**, read the relevant skill file
2. **Apply the patterns** from the skill's Instructions section
3. **Follow the execution steps** defined in the skill
4. **Use sub-agents** for complex multi-step tasks:
   ```
   Task tool → subagent_type: "general-purpose"
   Prompt: "Read frontend-skills/[skill-name]/SKILL.md and apply it to [task]"
   ```

### Orchestration Pattern:

When user says "Activate frontend-ui-expert" or similar:
1. Read ALL relevant skills for the task
2. Combine knowledge from multiple skills
3. Apply patterns consistently
4. Ensure TypeScript error-free code
5. Test responsive behavior

---

## 🔧 Backend Agent - Orchestrator Instructions

**IMPORTANT:** When working on backend/Supabase tasks, ALWAYS read and apply the relevant skills from:
`backend-agent/backend-skills/`

### Available Backend Skills:

| Skill | When to Use | Path |
|-------|-------------|------|
| **supabase-auth-manager** | Authentication flows | `backend-skills/supabase-auth-manager/SKILL.md` |
| **google-oauth-setup** | Google OAuth integration | `backend-skills/google-oauth-setup/SKILL.md` |
| **auth-callback-redirect** | OAuth callback handling | `backend-skills/auth-callback-redirect/SKILL.md` |
| **user-metadata-handler** | User profile/metadata | `backend-skills/user-metadata-handler/SKILL.md` |
| **row-level-security** | RLS policies | `backend-skills/row-level-security/SKILL.md` |
| **database-policies** | Database access policies | `backend-skills/database-policies/SKILL.md` |
| **event-schema-design** | Event table schema | `backend-skills/event-schema-design/SKILL.md` |
| **data-validation** | Input validation | `backend-skills/data-validation/SKILL.md` |
| **storage-policies** | File storage policies | `backend-skills/storage-policies/SKILL.md` |
| **advanced-sql-queries** | Complex SQL queries | `backend-skills/advanced-sql-queries/SKILL.md` |
| **middleware-protection** | API route protection | `backend-skills/middleware-protection/SKILL.md` |
| **server-error-handling** | Error handling patterns | `backend-skills/server-error-handling/SKILL.md` |
| **Backend-Logic** | General backend patterns | `backend-skills/Backend-Logic/SKILL.md` |

### Backend Orchestration Pattern:

When user says "Activate backend-expert" or similar:
1. Read relevant backend skills for the task
2. Follow Supabase best practices
3. Implement proper RLS policies
4. Handle errors gracefully
5. Validate all user inputs

### Main Architect File:
`backend-agent/supabase-backend-architect.md` - Read this for overall backend architecture guidance.

---

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
- [x] AttendeeButton component (with full database integration)
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

### attendees
| Column     | Type        | Description                         |
|------------|-------------|-------------------------------------|
| id         | UUID (PK)   | Auto-generated                      |
| user_id    | UUID (FK)   | References profiles(id)             |
| event_id   | UUID (FK)   | References events(id)               |
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
│   │   └── AttendeeButton.tsx      # Attendee button component
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
