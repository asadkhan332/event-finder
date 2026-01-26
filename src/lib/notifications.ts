import { supabase } from './supabase'
import type {
  Notification,
  NotificationInsert,
  NotificationType,
  NotificationPreference,
  NotificationPreferenceUpdate,
  NotificationWithEvent,
  Event
} from './database.types'

// Default notification preferences
const DEFAULT_PREFERENCES: Omit<NotificationPreference, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  email_enabled: true,
  reminders_enabled: true,
  confirmations_enabled: true,
  updates_enabled: true,
  reminder_hours: [24, 1]
}

// Send notification email via Edge Function (T032)
export async function sendNotificationEmail(
  notification: Notification,
  userEmail: string,
  userName: string | null,
  eventDetails?: {
    title: string
    date: string
    time: string
    location_name: string
  }
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { data, error } = await supabase.functions.invoke('send-notification-email', {
      body: {
        notification_id: notification.id,
        user_email: userEmail,
        user_name: userName,
        notification_type: notification.type,
        title: notification.title,
        message: notification.message,
        event_title: eventDetails?.title,
        event_date: eventDetails?.date,
        event_time: eventDetails?.time,
        event_location: eventDetails?.location_name
      }
    })

    if (error) {
      console.error('Error sending notification email:', error)
      return { success: false, error: new Error(error.message) }
    }

    return { success: true, error: null }
  } catch (err) {
    console.error('Error invoking email function:', err)
    return { success: false, error: err instanceof Error ? err : new Error('Unknown error') }
  }
}

// Create a new notification
export async function createNotification(
  notification: NotificationInsert
): Promise<{ data: Notification | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single()

  return { data, error: error ? new Error(error.message) : null }
}

// Get user's notifications with event details
export async function getNotifications(
  userId: string,
  options?: { limit?: number; offset?: number; type?: NotificationType; unreadOnly?: boolean }
): Promise<{ data: NotificationWithEvent[]; error: Error | null }> {
  let query = supabase
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

  if (options?.type) {
    query = query.eq('type', options.type)
  }

  if (options?.unreadOnly) {
    query = query.eq('is_read', false)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 50) - 1)
  }

  const { data, error } = await query

  return { data: (data as NotificationWithEvent[]) || [], error: error ? new Error(error.message) : null }
}

// Get unread notification count
export async function getUnreadCount(userId: string): Promise<{ count: number; error: Error | null }> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  return { count: count || 0, error: error ? new Error(error.message) : null }
}

// Mark notification as read
export async function markAsRead(
  notificationId: string,
  userId: string
): Promise<{ data: Notification | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString()
    })
    .eq('id', notificationId)
    .eq('user_id', userId)
    .select()
    .single()

  return { data, error: error ? new Error(error.message) : null }
}

// Mark all notifications as read
export async function markAllAsRead(userId: string): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('is_read', false)

  return { error: error ? new Error(error.message) : null }
}

// Delete a notification
export async function deleteNotification(
  notificationId: string,
  userId: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', userId)

  return { error: error ? new Error(error.message) : null }
}

// Delete all notifications for user
export async function deleteAllNotifications(userId: string): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', userId)

  return { error: error ? new Error(error.message) : null }
}

// Get or create user notification preferences
export async function getOrCreatePreferences(
  userId: string
): Promise<{ data: NotificationPreference | null; error: Error | null }> {
  // Try to get existing preferences
  const { data: existing, error: fetchError } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (existing) {
    return { data: existing, error: null }
  }

  // If not found (PGRST116), create default preferences
  if (fetchError?.code === 'PGRST116') {
    const { data: created, error: createError } = await supabase
      .from('notification_preferences')
      .insert({
        user_id: userId,
        ...DEFAULT_PREFERENCES
      })
      .select()
      .single()

    return { data: created, error: createError ? new Error(createError.message) : null }
  }

  return { data: null, error: fetchError ? new Error(fetchError.message) : null }
}

// Update user notification preferences
export async function updatePreferences(
  userId: string,
  updates: NotificationPreferenceUpdate
): Promise<{ data: NotificationPreference | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert({
      user_id: userId,
      ...updates
    }, { onConflict: 'user_id' })
    .select()
    .single()

  return { data, error: error ? new Error(error.message) : null }
}

// Notification template formatters
export function formatReminderNotification(
  event: Pick<Event, 'id' | 'title' | 'date' | 'time' | 'location_name'>,
  reminderType: '24h' | '1h'
): NotificationInsert & { event_id: string } {
  const is24h = reminderType === '24h'
  return {
    user_id: '', // Will be set by caller
    event_id: event.id,
    type: 'reminder',
    title: is24h ? `Event Tomorrow: ${event.title}` : `Event Starting Soon: ${event.title}`,
    message: is24h
      ? `Your event "${event.title}" is tomorrow at ${event.time} at ${event.location_name}`
      : `Your event "${event.title}" starts in 1 hour at ${event.location_name}`,
    metadata: {
      reminder_type: reminderType,
      event_date: event.date,
      event_time: event.time
    }
  }
}

export function formatConfirmationNotification(
  event: Pick<Event, 'id' | 'title' | 'date' | 'time' | 'location_name'>,
  action: 'rsvp' | 'cancel'
): NotificationInsert & { event_id: string } {
  const isRsvp = action === 'rsvp'
  return {
    user_id: '', // Will be set by caller
    event_id: event.id,
    type: 'confirmation',
    title: isRsvp ? `RSVP Confirmed: ${event.title}` : `RSVP Cancelled: ${event.title}`,
    message: isRsvp
      ? `You're going to "${event.title}" on ${event.date} at ${event.time}. Location: ${event.location_name}`
      : `You've cancelled your RSVP for "${event.title}"`,
    metadata: {
      action,
      event_date: event.date,
      event_time: event.time
    }
  }
}

export function formatUpdateNotification(
  event: Pick<Event, 'id' | 'title'>,
  changes: Record<string, { old: string; new: string }>
): NotificationInsert & { event_id: string } {
  const changesList = Object.entries(changes)
    .map(([field, { old, new: newVal }]) => `${field}: ${old} → ${newVal}`)
    .join(', ')

  return {
    user_id: '', // Will be set by caller
    event_id: event.id,
    type: 'update',
    title: `Event Updated: ${event.title}`,
    message: `The event "${event.title}" has been updated. Changes: ${changesList}`,
    metadata: { changes }
  }
}

export function formatCancellationNotification(
  event: Pick<Event, 'id' | 'title' | 'date' | 'time'>
): NotificationInsert & { event_id: string } {
  return {
    user_id: '', // Will be set by caller
    event_id: event.id,
    type: 'cancellation',
    title: `Event Cancelled: ${event.title}`,
    message: `The event "${event.title}" scheduled for ${event.date} at ${event.time} has been cancelled by the organizer.`,
    metadata: {
      cancelled_at: new Date().toISOString()
    }
  }
}

// Notify all attendees of an event
export async function notifyEventAttendees(
  eventId: string,
  notificationTemplate: Omit<NotificationInsert, 'user_id'>
): Promise<{ count: number; error: Error | null }> {
  // Get all attendees for the event
  const { data: attendees, error: fetchError } = await supabase
    .from('attendees')
    .select('user_id')
    .eq('event_id', eventId)

  if (fetchError) {
    return { count: 0, error: new Error(fetchError.message) }
  }

  if (!attendees || attendees.length === 0) {
    return { count: 0, error: null }
  }

  // Create notifications for all attendees
  const notifications = attendees.map(attendee => ({
    ...notificationTemplate,
    user_id: attendee.user_id
  }))

  const { error: insertError } = await supabase
    .from('notifications')
    .insert(notifications)

  return {
    count: notifications.length,
    error: insertError ? new Error(insertError.message) : null
  }
}

// Check if notification type is enabled for user
export async function isNotificationEnabled(
  userId: string,
  type: NotificationType
): Promise<boolean> {
  const { data: prefs } = await getOrCreatePreferences(userId)

  if (!prefs) return true // Default to enabled

  switch (type) {
    case 'reminder':
      return prefs.reminders_enabled
    case 'confirmation':
      return prefs.confirmations_enabled
    case 'update':
    case 'cancellation':
      return prefs.updates_enabled
    default:
      return true
  }
}

// Create notification with preference check and optional email (T032)
export async function createNotificationWithPrefCheck(
  notification: NotificationInsert
): Promise<{ data: Notification | null; error: Error | null; skipped: boolean; emailSent: boolean }> {
  const isEnabled = await isNotificationEnabled(notification.user_id, notification.type)

  if (!isEnabled) {
    return { data: null, error: null, skipped: true, emailSent: false }
  }

  const result = await createNotification(notification)

  // Check if email should be sent
  let emailSent = false
  if (result.data) {
    const { data: prefs } = await getOrCreatePreferences(notification.user_id)

    if (prefs?.email_enabled) {
      // Get user email and name
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', notification.user_id)
        .single()

      if (profile?.email) {
        // Get event details if event_id is present
        let eventDetails: { title: string; date: string; time: string; location_name: string } | undefined
        if (notification.event_id) {
          const { data: event } = await supabase
            .from('events')
            .select('title, date, time, location_name')
            .eq('id', notification.event_id)
            .single()
          if (event) {
            eventDetails = event
          }
        }

        const emailResult = await sendNotificationEmail(
          result.data,
          profile.email,
          profile.full_name,
          eventDetails
        )
        emailSent = emailResult.success
      }
    }
  }

  return { ...result, skipped: false, emailSent }
}
