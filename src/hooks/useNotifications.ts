'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} from '@/lib/notifications'
import type { NotificationWithEvent } from '@/lib/database.types'
import toast from 'react-hot-toast'

interface UseNotificationsOptions {
  limit?: number
  autoRefresh?: boolean
}

export function useNotifications(userId: string | null, options: UseNotificationsOptions = {}) {
  const { limit = 20, autoRefresh = true } = options

  const [notifications, setNotifications] = useState<NotificationWithEvent[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
      return
    }

    try {
      const [notifResult, countResult] = await Promise.all([
        getNotifications(userId, { limit }),
        getUnreadCount(userId)
      ])

      if (notifResult.error) throw notifResult.error
      if (countResult.error) throw countResult.error

      setNotifications(notifResult.data)
      setUnreadCount(countResult.count)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch notifications'))
    } finally {
      setLoading(false)
    }
  }, [userId, limit])

  // Mark single notification as read
  const handleMarkAsRead = useCallback(async (notificationId: string) => {
    if (!userId) return

    const result = await markAsRead(notificationId, userId)
    if (result.error) {
      toast.error('Failed to mark as read')
      return
    }

    // Update local state
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId
          ? { ...n, is_read: true, read_at: new Date().toISOString() }
          : n
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [userId])

  // Mark all as read
  const handleMarkAllAsRead = useCallback(async () => {
    if (!userId) return

    const result = await markAllAsRead(userId)
    if (result.error) {
      toast.error('Failed to mark all as read')
      return
    }

    // Update local state
    setNotifications(prev =>
      prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
    )
    setUnreadCount(0)
    toast.success('All notifications marked as read')
  }, [userId])

  // Initial fetch
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Real-time subscription
  useEffect(() => {
    if (!userId || !autoRefresh) return

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          const newNotification = payload.new as NotificationWithEvent

          // Fetch event details if event_id exists
          if (newNotification.event_id) {
            const { data: event } = await supabase
              .from('events')
              .select('id, title, date, time, location_name')
              .eq('id', newNotification.event_id)
              .single()

            if (event) {
              newNotification.event = event
            }
          }

          // Add to notifications list
          setNotifications(prev => [newNotification, ...prev].slice(0, limit))
          setUnreadCount(prev => prev + 1)

          // Show toast for new notification
          toast(newNotification.title, {
            icon: getNotificationIcon(newNotification.type),
            duration: 5000
          })

          // Play sound and vibrate (T036)
          notifyUser()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const updated = payload.new as NotificationWithEvent
          setNotifications(prev =>
            prev.map(n => (n.id === updated.id ? { ...n, ...updated } : n))
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const deleted = payload.old as { id: string; is_read: boolean }
          setNotifications(prev => prev.filter(n => n.id !== deleted.id))
          if (!deleted.is_read) {
            setUnreadCount(prev => Math.max(0, prev - 1))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, autoRefresh, limit])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead
  }
}

// Helper to get icon for notification type
function getNotificationIcon(type: string): string {
  switch (type) {
    case 'reminder':
      return '⏰'
    case 'confirmation':
      return '✅'
    case 'update':
      return '📝'
    case 'cancellation':
      return '❌'
    default:
      return '🔔'
  }
}

// Play notification sound (T036)
function playNotificationSound() {
  try {
    // Create a simple notification sound using Web Audio API
    if (typeof window !== 'undefined' && window.AudioContext) {
      const audioContext = new AudioContext()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      gainNode.gain.value = 0.1

      oscillator.start()

      // Fade out
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      oscillator.stop(audioContext.currentTime + 0.3)
    }
  } catch (error) {
    // Silently fail if audio is not supported
    console.debug('Audio notification not supported')
  }
}

// Trigger vibration for mobile (T036)
function triggerVibration() {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100])
    }
  } catch (error) {
    // Silently fail if vibration is not supported
    console.debug('Vibration not supported')
  }
}

// Combined notification alert (sound + vibration)
export function notifyUser() {
  playNotificationSound()
  triggerVibration()
}
