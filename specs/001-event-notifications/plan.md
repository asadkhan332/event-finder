# Implementation Plan: Event Notifications

**Branch**: `001-event-notifications` | **Date**: 2026-01-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-event-notifications/spec.md`

## Summary

Implement a comprehensive notification system for the Event Finder application that sends reminders before RSVP'd events, confirmations on RSVP actions, and updates when event details change. The system will support both in-app notifications (stored in Supabase) and email notifications (via Supabase Edge Functions + Resend).

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: Next.js 16, Supabase 2.x, Resend (email), Lucide React (icons)
**Storage**: Supabase PostgreSQL (notifications, notification_preferences tables)
**Testing**: Manual testing, Supabase local development
**Target Platform**: Web (responsive, mobile-first)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Notification delivery within 5 seconds for confirmations, scheduled jobs for reminders
**Constraints**: Must work with existing Supabase setup, follow constitution principles
**Scale/Scope**: Support existing user base, 1000+ notifications/day capacity

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| I. Type-Safe Development | TypeScript types for all notification entities | ✅ PASS | Will add types to `database.types.ts` |
| II. Mobile-First Responsive | Notification UI components mobile-first | ✅ PASS | NotificationBell, NotificationList, Preferences UI |
| III. Supabase-First Backend | Use Supabase for storage & Edge Functions | ✅ PASS | notifications table + pg_cron for scheduling |
| IV. Role-Based Access Control | Notifications respect user permissions | ✅ PASS | Users only see their own notifications |
| V. Design System Consistency | Orange/Teal theme, Lucide icons, toast feedback | ✅ PASS | Bell icon, notification badges, consistent styling |
| VI. Component-Based Architecture | Reusable notification components | ✅ PASS | NotificationBell, NotificationItem, NotificationList |

**Gate Status**: ✅ ALL PRINCIPLES SATISFIED - Proceeding to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/001-event-notifications/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api.md           # API endpoints specification
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── notifications/
│   │   └── page.tsx              # Notification history page
│   └── profile/
│       └── settings/
│           └── page.tsx          # Add notification preferences section
├── components/
│   ├── NotificationBell.tsx      # Navbar notification icon with badge
│   ├── NotificationItem.tsx      # Single notification display
│   ├── NotificationList.tsx      # List of notifications
│   └── NotificationPreferences.tsx # Preferences form component
├── hooks/
│   └── useNotifications.ts       # Real-time notification subscription
├── lib/
│   ├── database.types.ts         # Add notification types
│   └── notifications.ts          # Notification helper functions
└── middleware.ts                 # No changes needed

supabase/
├── migrations/
│   └── 20260126000000_notifications.sql  # New tables
└── functions/
    ├── send-notification-email/   # Edge function for emails
    └── schedule-reminders/        # Edge function for cron job
```

**Structure Decision**: Following existing Next.js App Router structure. New components in `src/components/`, new page at `/notifications`, notification preferences integrated into existing settings page.

## Complexity Tracking

> No constitution violations - no complexity justification needed.

---

## Phase 0: Research Summary

See [research.md](./research.md) for detailed findings.

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Email Provider | Resend | Simple API, good free tier, works with Supabase Edge Functions |
| Scheduling | Supabase pg_cron | Native PostgreSQL, no external service needed |
| Real-time | Supabase Realtime | Already integrated, subscription-based updates |
| Notification Storage | PostgreSQL table | Consistent with existing architecture |

---

## Phase 1: Design Summary

See [data-model.md](./data-model.md) for entity details.
See [contracts/api.md](./contracts/api.md) for API specifications.
See [quickstart.md](./quickstart.md) for developer setup guide.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      NOTIFICATION SYSTEM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│  │   Trigger   │     │   Process   │     │   Deliver   │       │
│  │   Events    │────▶│   Logic     │────▶│   Channel   │       │
│  └─────────────┘     └─────────────┘     └─────────────┘       │
│                                                                 │
│  Triggers:            Processing:          Channels:            │
│  - RSVP action        - Check prefs        - In-app (DB)       │
│  - Event update       - Create record      - Email (Resend)    │
│  - Cron schedule      - Queue email        - Toast (immediate) │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### New Database Tables

1. **notifications** - Stores all notification instances
2. **notification_preferences** - User notification settings

### New Components

1. **NotificationBell** - Navbar icon with unread count badge
2. **NotificationItem** - Single notification card
3. **NotificationList** - Scrollable notification list
4. **NotificationPreferences** - Settings form

### New API Endpoints (via Supabase)

1. `GET /notifications` - List user's notifications
2. `PATCH /notifications/:id` - Mark as read
3. `GET /notification-preferences` - Get user preferences
4. `PUT /notification-preferences` - Update preferences

---

## Next Steps

Run `/sp.tasks` to generate implementation tasks from this plan.
