# API Contracts: Event Notifications

**Feature**: 001-event-notifications
**Date**: 2026-01-26

## Overview

This document defines the API contracts for the notification system. All endpoints use the Supabase client library, not custom API routes.

## Supabase Client Operations

### Notifications

#### List User Notifications

```typescript
// Get all notifications for current user
const { data, error } = await supabase
  .from('notifications')
  .select(`
    *,
    event:events (
      id,
      title,
      date,
      time,
      location_name
    )
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(50);
```

**Response Type**: `NotificationWithEvent[]`

**Filters Available**:
- `is_read`: Filter by read status
- `type`: Filter by notification type
- `created_at`: Date range filtering

---

#### Get Unread Count

```typescript
// Get count of unread notifications
const { count, error } = await supabase
  .from('notifications')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId)
  .eq('is_read', false);
```

**Response**: `{ count: number }`

---

#### Mark Notification as Read

```typescript
// Mark single notification as read
const { data, error } = await supabase
  .from('notifications')
  .update({
    is_read: true,
    read_at: new Date().toISOString()
  })
  .eq('id', notificationId)
  .eq('user_id', userId)
  .select()
  .single();
```

**Request**: `{ is_read: true, read_at: string }`

**Response**: `Notification`

---

#### Mark All as Read

```typescript
// Mark all notifications as read for user
const { data, error } = await supabase
  .from('notifications')
  .update({
    is_read: true,
    read_at: new Date().toISOString()
  })
  .eq('user_id', userId)
  .eq('is_read', false)
  .select();
```

**Response**: `Notification[]`

---

#### Delete Notification

```typescript
// Delete a notification
const { error } = await supabase
  .from('notifications')
  .delete()
  .eq('id', notificationId)
  .eq('user_id', userId);
```

**Response**: `void`

---

#### Create Notification (Internal/Service)

```typescript
// Create notification (used by triggers/Edge Functions)
const { data, error } = await supabase
  .from('notifications')
  .insert({
    user_id: userId,
    event_id: eventId,
    type: 'reminder',
    title: 'Event Reminder',
    message: 'Your event starts in 1 hour',
    metadata: { reminder_type: '1h' }
  })
  .select()
  .single();
```

**Request**: `NotificationInsert`

**Response**: `Notification`

---

### Notification Preferences

#### Get User Preferences

```typescript
// Get preferences for current user
const { data, error } = await supabase
  .from('notification_preferences')
  .select('*')
  .eq('user_id', userId)
  .single();

// If no preferences exist, return defaults
if (error?.code === 'PGRST116') {
  return {
    email_enabled: true,
    reminders_enabled: true,
    confirmations_enabled: true,
    updates_enabled: true,
    reminder_hours: [24, 1]
  };
}
```

**Response**: `NotificationPreference | DefaultPreferences`

---

#### Update/Create Preferences (Upsert)

```typescript
// Upsert notification preferences
const { data, error } = await supabase
  .from('notification_preferences')
  .upsert({
    user_id: userId,
    email_enabled: true,
    reminders_enabled: true,
    confirmations_enabled: true,
    updates_enabled: true,
    reminder_hours: [24, 1]
  }, {
    onConflict: 'user_id'
  })
  .select()
  .single();
```

**Request**: `NotificationPreferenceInsert`

**Response**: `NotificationPreference`

---

### Real-time Subscriptions

#### Subscribe to New Notifications

```typescript
// Subscribe to notifications for current user
const subscription = supabase
  .channel('notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      // Handle new notification
      const newNotification = payload.new as Notification;
      onNewNotification(newNotification);
    }
  )
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

---

## Edge Function Contracts

### send-notification-email

**Trigger**: Called by database trigger or cron job

**Input**:
```typescript
interface EmailNotificationRequest {
  notification_id: string;
  user_email: string;
  subject: string;
  body_html: string;
  body_text: string;
}
```

**Output**:
```typescript
interface EmailNotificationResponse {
  success: boolean;
  message_id?: string;
  error?: string;
}
```

**Implementation**:
```typescript
// supabase/functions/send-notification-email/index.ts
import { Resend } from 'resend';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

Deno.serve(async (req) => {
  const { notification_id, user_email, subject, body_html, body_text } = await req.json();

  const { data, error } = await resend.emails.send({
    from: 'Event Finder <notifications@yourdomain.com>',
    to: user_email,
    subject: subject,
    html: body_html,
    text: body_text,
  });

  if (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Update notification email_sent status
  // ... update database

  return new Response(JSON.stringify({ success: true, message_id: data.id }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

---

### schedule-reminders

**Trigger**: pg_cron (every 15 minutes)

**Process**:
1. Query attendees with events starting in reminder windows (24h, 1h)
2. Check notification preferences for each user
3. Create notification records
4. Queue email notifications

**SQL (pg_cron job)**:
```sql
-- Run every 15 minutes
SELECT cron.schedule(
  'send-event-reminders',
  '*/15 * * * *',
  $$
    SELECT net.http_post(
      url := 'https://your-project.supabase.co/functions/v1/schedule-reminders',
      headers := '{"Authorization": "Bearer YOUR_SERVICE_KEY"}'::jsonb
    );
  $$
);
```

---

## Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `NOTIFICATION_NOT_FOUND` | Notification does not exist | 404 |
| `UNAUTHORIZED` | User not authorized to access | 401 |
| `FORBIDDEN` | User cannot access this notification | 403 |
| `VALIDATION_ERROR` | Invalid input data | 400 |
| `EMAIL_FAILED` | Email delivery failed | 500 |

## Rate Limits

| Operation | Limit |
|-----------|-------|
| List notifications | 100 requests/minute |
| Create notification | 50 requests/minute |
| Email sending | 100 emails/day (Resend free tier) |
