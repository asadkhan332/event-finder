# Research: Event Notifications

**Feature**: 001-event-notifications
**Date**: 2026-01-26
**Status**: Complete

## Research Questions

### 1. Email Service Provider

**Question**: Which email service to use for transactional emails?

**Options Evaluated**:

| Provider | Pros | Cons |
|----------|------|------|
| Resend | Simple API, great DX, good free tier (100 emails/day) | Newer service |
| SendGrid | Mature, high volume | Complex setup, overkill for our scale |
| Mailgun | Reliable, good docs | Pricing not ideal for small scale |
| Supabase SMTP | Built-in | Limited features, no templates |

**Decision**: **Resend**

**Rationale**:
- Simple REST API that works well with Supabase Edge Functions
- Free tier sufficient for MVP (100 emails/day)
- Great TypeScript SDK
- Modern, developer-friendly documentation

---

### 2. Notification Scheduling

**Question**: How to schedule reminder notifications (24h and 1h before events)?

**Options Evaluated**:

| Approach | Pros | Cons |
|----------|------|------|
| Supabase pg_cron | Native PostgreSQL, no external deps | Runs on database server |
| Vercel Cron | Integrated with Next.js hosting | Requires Vercel deployment |
| External (Inngest, Trigger.dev) | Feature-rich | Additional service to manage |
| Client-side scheduling | Simple | Unreliable, requires app to be open |

**Decision**: **Supabase pg_cron + Edge Functions**

**Rationale**:
- Already using Supabase, no new service needed
- pg_cron runs directly in PostgreSQL
- Edge Function triggered by cron to process due notifications
- Reliable server-side execution

---

### 3. Real-time Notification Updates

**Question**: How to show new notifications instantly in the UI?

**Options Evaluated**:

| Approach | Pros | Cons |
|----------|------|------|
| Supabase Realtime | Already integrated, subscription-based | Requires client connection |
| Polling | Simple, works everywhere | Not instant, wastes resources |
| WebSockets (custom) | Full control | Additional infrastructure |
| Server-Sent Events | One-way, efficient | Limited browser support |

**Decision**: **Supabase Realtime**

**Rationale**:
- Already have Supabase client configured
- Built-in support for table subscriptions
- Instant updates when notification inserted
- No additional setup required

---

### 4. Notification Data Model

**Question**: How to structure notification storage?

**Options Evaluated**:

| Approach | Pros | Cons |
|----------|------|------|
| Single notifications table | Simple, all in one place | May need joins for event data |
| Separate tables per type | Type-specific fields | Complex queries |
| JSON content field | Flexible | Harder to query |

**Decision**: **Single notifications table with type enum and JSON metadata**

**Rationale**:
- Simple schema, easy to query
- Type field for filtering (reminder, confirmation, update)
- JSON metadata field for type-specific data (event_id, changes, etc.)
- Consistent with existing table patterns

---

### 5. Notification Preferences Storage

**Question**: Where to store user notification preferences?

**Options Evaluated**:

| Approach | Pros | Cons |
|----------|------|------|
| Separate preferences table | Clean separation, easy queries | Additional table |
| JSON field in profiles | No new table | Harder to validate, query |
| Local storage | No backend changes | Not synced across devices |

**Decision**: **Separate notification_preferences table**

**Rationale**:
- Clean separation of concerns
- Easy to add new preference fields
- RLS policies match existing patterns
- Foreign key to profiles.id

---

## Technology Summary

| Component | Technology | Version/Details |
|-----------|------------|-----------------|
| Email Delivery | Resend | Via Supabase Edge Function |
| Scheduling | pg_cron | PostgreSQL extension |
| Real-time | Supabase Realtime | Table subscriptions |
| Storage | PostgreSQL | notifications + notification_preferences |
| UI Framework | Next.js 16 | App Router |
| Icons | Lucide React | Bell, BellRing, Settings |

## Dependencies to Add

```json
{
  "resend": "^2.0.0"
}
```

Note: Resend SDK only needed in Supabase Edge Function, not in main Next.js app.

## Environment Variables (New)

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
```

This will be configured in Supabase Edge Function secrets, not in the Next.js app.

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Email delivery failures | Medium | Medium | Retry logic, fallback to in-app only |
| Cron job timing issues | Low | Low | Buffer time, run every 15 minutes |
| Real-time connection drops | Low | Low | Polling fallback on reconnect |
| Rate limiting (email) | Low | Medium | Queue emails, batch processing |

## Open Questions (Resolved)

All research questions have been answered. No open items remaining.
