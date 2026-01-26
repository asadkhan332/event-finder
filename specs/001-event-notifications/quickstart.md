# Quickstart: Event Notifications

**Feature**: 001-event-notifications
**Date**: 2026-01-26

## Prerequisites

- Event Finder project running locally
- Supabase project configured
- Node.js 18+ installed

## Setup Steps

### 1. Run Database Migration

Apply the notification tables migration:

```bash
# Using Supabase CLI
supabase db push

# Or manually run in Supabase SQL Editor:
# Copy contents of supabase/migrations/20260126000000_notifications.sql
```

### 2. Update TypeScript Types

Add notification types to `src/lib/database.types.ts`:

```typescript
// Copy types from data-model.md
export type NotificationType = 'reminder' | 'confirmation' | 'update' | 'cancellation';

export interface Notification {
  // ... (see data-model.md for full type)
}
```

### 3. Enable Supabase Realtime

In Supabase Dashboard:
1. Go to Database → Replication
2. Enable replication for `notifications` table
3. Select "Insert" events

### 4. Configure Email (Optional)

For email notifications:

1. Sign up for [Resend](https://resend.com)
2. Get API key
3. Add to Supabase secrets:

```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
```

4. Deploy Edge Function:

```bash
supabase functions deploy send-notification-email
```

### 5. Configure Cron Job (Optional)

For scheduled reminders:

1. Enable pg_cron extension in Supabase
2. Run the cron setup SQL:

```sql
SELECT cron.schedule(
  'send-event-reminders',
  '*/15 * * * *',
  $$ SELECT process_due_reminders(); $$
);
```

## Verification

### Test Notification Creation

```typescript
// In browser console or test file
const { data, error } = await supabase
  .from('notifications')
  .insert({
    user_id: 'your-user-id',
    type: 'confirmation',
    title: 'Test Notification',
    message: 'This is a test notification'
  })
  .select()
  .single();

console.log(data); // Should show created notification
```

### Test Real-time Subscription

```typescript
// Subscribe to notifications
const subscription = supabase
  .channel('test-notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('New notification:', payload.new);
    }
  )
  .subscribe();

// Create a notification in another tab/window
// Should see console log in subscribed tab
```

### Test Preferences

```typescript
// Create preferences
const { data, error } = await supabase
  .from('notification_preferences')
  .upsert({
    user_id: 'your-user-id',
    email_enabled: true,
    reminders_enabled: true
  })
  .select()
  .single();

console.log(data); // Should show preferences
```

## Development Workflow

### Adding a New Notification Type

1. Add type to enum in `database.types.ts`
2. Update migration if needed
3. Add helper function in `src/lib/notifications.ts`
4. Update UI components if needed

### Testing Notifications Locally

1. Use Supabase local development:
   ```bash
   supabase start
   ```

2. Insert test notifications via SQL or client

3. Check UI for notification display

### Debugging Real-time

If real-time not working:
1. Check Supabase Dashboard → Realtime logs
2. Verify table replication is enabled
3. Check browser console for subscription errors
4. Ensure user_id filter matches authenticated user

## File Checklist

After implementation, verify these files exist:

- [x] `src/components/NotificationBell.tsx`
- [x] `src/components/NotificationItem.tsx`
- [x] `src/components/NotificationList.tsx`
- [x] `src/components/NotificationPreferences.tsx`
- [x] `src/hooks/useNotifications.ts`
- [x] `src/lib/notifications.ts`
- [x] `src/app/notifications/page.tsx`
- [x] `supabase/migrations/20260126000000_notifications.sql`
- [x] `supabase/functions/send-notification-email/index.ts`

## Troubleshooting

### "Permission denied" errors

- Check RLS policies are correctly applied
- Verify user is authenticated
- Check user_id matches in queries

### Notifications not appearing in real-time

- Enable replication for notifications table
- Check subscription filter matches user_id
- Verify channel is subscribed (not just created)

### Emails not sending

- Verify RESEND_API_KEY is set correctly
- Check Edge Function logs in Supabase Dashboard
- Verify email_enabled is true in preferences

## Next Steps

1. Run `/sp.tasks` to generate implementation tasks
2. Follow task order: Setup → Backend → Components → Integration
3. Test each user story independently
