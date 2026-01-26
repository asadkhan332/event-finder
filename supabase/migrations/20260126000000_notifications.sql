-- Migration: 20260126000000_notifications.sql
-- Feature: Event Notifications System

-- Create notification type enum
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('reminder', 'confirmation', 'update', 'cancellation');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
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

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_event_id ON notifications(event_id) WHERE event_id IS NOT NULL;

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
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
CREATE TABLE IF NOT EXISTS notification_preferences (
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

-- Create unique index for notification_preferences
CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Enable RLS on notification_preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for notification_preferences
CREATE POLICY "Users can view own preferences"
ON notification_preferences FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
ON notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
ON notification_preferences FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for notification_preferences updated_at
DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON notification_preferences;
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to schedule event reminders (called by cron)
CREATE OR REPLACE FUNCTION schedule_event_reminders()
RETURNS INTEGER AS $$
DECLARE
  reminder_count INTEGER := 0;
  attendee_record RECORD;
  event_record RECORD;
  hours_until_event NUMERIC;
  reminder_type TEXT;
  pref_record RECORD;
BEGIN
  -- Find all upcoming events with attendees
  FOR event_record IN
    SELECT e.id, e.title, e.date, e.time, e.location_name
    FROM events e
    WHERE e.date >= CURRENT_DATE
    AND e.date <= CURRENT_DATE + INTERVAL '2 days'
  LOOP
    -- Calculate hours until event
    hours_until_event := EXTRACT(EPOCH FROM (
      (event_record.date + event_record.time::time) - NOW()
    )) / 3600;

    -- Skip past events
    IF hours_until_event < 0 THEN
      CONTINUE;
    END IF;

    -- Determine reminder type based on hours
    IF hours_until_event >= 23 AND hours_until_event <= 25 THEN
      reminder_type := '24h';
    ELSIF hours_until_event >= 0.5 AND hours_until_event <= 1.5 THEN
      reminder_type := '1h';
    ELSE
      CONTINUE;
    END IF;

    -- Get all attendees for this event
    FOR attendee_record IN
      SELECT a.user_id, p.email, p.full_name
      FROM attendees a
      JOIN profiles p ON p.id = a.user_id
      WHERE a.event_id = event_record.id
    LOOP
      -- Check user preferences
      SELECT * INTO pref_record
      FROM notification_preferences
      WHERE user_id = attendee_record.user_id;

      -- If no preferences, use defaults (reminders enabled)
      IF pref_record IS NULL OR pref_record.reminders_enabled THEN
        -- Check if this reminder was already sent
        IF NOT EXISTS (
          SELECT 1 FROM notifications
          WHERE user_id = attendee_record.user_id
          AND event_id = event_record.id
          AND type = 'reminder'
          AND metadata->>'reminder_type' = reminder_type
        ) THEN
          -- Create the reminder notification
          INSERT INTO notifications (user_id, event_id, type, title, message, metadata)
          VALUES (
            attendee_record.user_id,
            event_record.id,
            'reminder',
            CASE reminder_type
              WHEN '24h' THEN 'Event Tomorrow: ' || event_record.title
              ELSE 'Event Starting Soon: ' || event_record.title
            END,
            CASE reminder_type
              WHEN '24h' THEN 'Your event "' || event_record.title || '" is tomorrow at ' || event_record.time || ' at ' || event_record.location_name
              ELSE 'Your event "' || event_record.title || '" starts in 1 hour at ' || event_record.location_name
            END,
            jsonb_build_object(
              'reminder_type', reminder_type,
              'event_date', event_record.date,
              'event_time', event_record.time
            )
          );
          reminder_count := reminder_count + 1;
        END IF;
      END IF;
    END LOOP;
  END LOOP;

  RETURN reminder_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Function to archive/delete old notifications (T038)
-- Called by pg_cron to clean up notifications older than 30 days
CREATE OR REPLACE FUNCTION archive_old_notifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete read notifications older than 30 days
  WITH deleted AS (
    DELETE FROM notifications
    WHERE is_read = true
    AND created_at < NOW() - INTERVAL '30 days'
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: To enable automatic cleanup, run in Supabase SQL Editor:
-- SELECT cron.schedule(
--   'archive-old-notifications',
--   '0 3 * * *',  -- Run daily at 3 AM
--   $$SELECT archive_old_notifications()$$
-- );
