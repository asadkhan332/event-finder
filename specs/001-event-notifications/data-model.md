# Data Model: Event Notifications

**Feature**: 001-event-notifications
**Date**: 2026-01-26

## Entity Relationship Diagram

```
┌─────────────────────┐       ┌─────────────────────┐
│      profiles       │       │       events        │
├─────────────────────┤       ├─────────────────────┤
│ id (PK)             │       │ id (PK)             │
│ email               │       │ title               │
│ full_name           │       │ date                │
│ ...                 │       │ ...                 │
└──────────┬──────────┘       └──────────┬──────────┘
           │                             │
           │ 1:N                         │ 1:N
           │                             │
           ▼                             │
┌─────────────────────────────────────────────────────┐
│                    notifications                     │
├─────────────────────────────────────────────────────┤
│ id (PK)                                             │
│ user_id (FK → profiles.id)                          │
│ event_id (FK → events.id, nullable)                 │
│ type (enum: reminder, confirmation, update, cancel) │
│ title                                               │
│ message                                             │
│ metadata (JSONB)                                    │
│ is_read (boolean)                                   │
│ email_sent (boolean)                                │
│ created_at                                          │
│ read_at (nullable)                                  │
└─────────────────────────────────────────────────────┘
           │
           │ 1:1
           ▼
┌─────────────────────────────────────────────────────┐
│              notification_preferences                │
├─────────────────────────────────────────────────────┤
│ id (PK)                                             │
│ user_id (FK → profiles.id, UNIQUE)                  │
│ email_enabled (boolean, default true)               │
│ reminders_enabled (boolean, default true)           │
│ confirmations_enabled (boolean, default true)       │
│ updates_enabled (boolean, default true)             │
│ reminder_hours (integer[], default [24, 1])         │
│ created_at                                          │
│ updated_at                                          │
└─────────────────────────────────────────────────────┘
```

## Table Definitions

### notifications

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | UUID | FK → profiles(id), NOT NULL | Recipient user |
| event_id | UUID | FK → events(id), NULL | Related event (nullable for system notifications) |
| type | TEXT | NOT NULL, CHECK | Notification type enum |
| title | TEXT | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification body |
| metadata | JSONB | DEFAULT '{}' | Type-specific data |
| is_read | BOOLEAN | DEFAULT false | Read status |
| email_sent | BOOLEAN | DEFAULT false | Email delivery status |
| created_at | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| read_at | TIMESTAMPTZ | NULL | When marked as read |

**Type Enum Values**:
- `reminder` - Event reminder (24h, 1h before)
- `confirmation` - RSVP confirmation
- `update` - Event details changed
- `cancellation` - Event cancelled

**Metadata Examples**:

```json
// Reminder
{
  "reminder_type": "24h",
  "event_date": "2026-01-27",
  "event_time": "18:00"
}

// Update
{
  "changes": {
    "date": { "old": "2026-01-27", "new": "2026-01-28" },
    "location": { "old": "Room A", "new": "Room B" }
  }
}

// Confirmation
{
  "action": "rsvp",
  "attendee_count": 45
}
```

**Indexes**:
- `idx_notifications_user_id` on (user_id)
- `idx_notifications_user_unread` on (user_id, is_read) WHERE is_read = false
- `idx_notifications_created_at` on (created_at DESC)
- `idx_notifications_event_id` on (event_id) WHERE event_id IS NOT NULL

### notification_preferences

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | UUID | FK → profiles(id), UNIQUE, NOT NULL | User reference |
| email_enabled | BOOLEAN | DEFAULT true | Enable email notifications |
| reminders_enabled | BOOLEAN | DEFAULT true | Enable reminder notifications |
| confirmations_enabled | BOOLEAN | DEFAULT true | Enable RSVP confirmations |
| updates_enabled | BOOLEAN | DEFAULT true | Enable event update notifications |
| reminder_hours | INTEGER[] | DEFAULT '{24, 1}' | Hours before event to send reminders |
| created_at | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

**Indexes**:
- `idx_notification_preferences_user_id` on (user_id) UNIQUE

## Row Level Security (RLS) Policies

### notifications

```sql
-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

-- System can insert notifications (via service role)
CREATE POLICY "Service can insert notifications"
ON notifications FOR INSERT
WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON notifications FOR DELETE
USING (auth.uid() = user_id);
```

### notification_preferences

```sql
-- Users can view their own preferences
CREATE POLICY "Users can view own preferences"
ON notification_preferences FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
ON notification_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
ON notification_preferences FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

## TypeScript Types

```typescript
// Add to src/lib/database.types.ts

export type NotificationType = 'reminder' | 'confirmation' | 'update' | 'cancellation';

export interface Notification {
  id: string;
  user_id: string;
  event_id: string | null;
  type: NotificationType;
  title: string;
  message: string;
  metadata: Record<string, unknown>;
  is_read: boolean;
  email_sent: boolean;
  created_at: string;
  read_at: string | null;
}

export interface NotificationInsert {
  user_id: string;
  event_id?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationUpdate {
  is_read?: boolean;
  read_at?: string;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  email_enabled: boolean;
  reminders_enabled: boolean;
  confirmations_enabled: boolean;
  updates_enabled: boolean;
  reminder_hours: number[];
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferenceInsert {
  user_id: string;
  email_enabled?: boolean;
  reminders_enabled?: boolean;
  confirmations_enabled?: boolean;
  updates_enabled?: boolean;
  reminder_hours?: number[];
}

export interface NotificationPreferenceUpdate {
  email_enabled?: boolean;
  reminders_enabled?: boolean;
  confirmations_enabled?: boolean;
  updates_enabled?: boolean;
  reminder_hours?: number[];
}

// Notification with event details (for display)
export interface NotificationWithEvent extends Notification {
  event?: {
    id: string;
    title: string;
    date: string;
    time: string;
    location_name: string;
  } | null;
}
```

## Migration SQL

```sql
-- Migration: 20260126000000_notifications.sql

-- Create notification type enum
CREATE TYPE notification_type AS ENUM ('reminder', 'confirmation', 'update', 'cancellation');

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  read_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_event_id ON notifications(event_id) WHERE event_id IS NOT NULL;

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can insert notifications"
ON notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
ON notifications FOR DELETE USING (auth.uid() = user_id);

-- Create notification_preferences table
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  email_enabled BOOLEAN DEFAULT true,
  reminders_enabled BOOLEAN DEFAULT true,
  confirmations_enabled BOOLEAN DEFAULT true,
  updates_enabled BOOLEAN DEFAULT true,
  reminder_hours INTEGER[] DEFAULT '{24, 1}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index
CREATE UNIQUE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Enable RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own preferences"
ON notification_preferences FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
ON notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
ON notification_preferences FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Validation Rules

### notifications

| Field | Validation |
|-------|------------|
| title | Max 200 characters |
| message | Max 1000 characters |
| type | Must be valid enum value |
| metadata | Valid JSON object |

### notification_preferences

| Field | Validation |
|-------|------------|
| reminder_hours | Array of integers between 1-168 (1 hour to 1 week) |
| user_id | Must be unique (one preferences record per user) |
