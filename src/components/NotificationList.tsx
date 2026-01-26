'use client'

import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import NotificationItem from './NotificationItem'
import type { NotificationWithEvent } from '@/lib/database.types'

interface NotificationListProps {
  notifications: NotificationWithEvent[]
  loading?: boolean
  onMarkAsRead?: (id: string) => void
  onMarkAllAsRead?: () => void
  compact?: boolean
  maxHeight?: string
  showMarkAllButton?: boolean
}

export default function NotificationList({
  notifications,
  loading = false,
  onMarkAsRead,
  onMarkAllAsRead,
  compact = false,
  maxHeight = '400px',
  showMarkAllButton = true
}: NotificationListProps) {
  const hasUnread = notifications.some(n => !n.is_read)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Bell className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          No notifications
        </h3>
        <p className="text-sm text-gray-500">
          You&apos;re all caught up! Check back later.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Header with Mark All as Read */}
      {showMarkAllButton && hasUnread && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
          <span className="text-sm text-gray-500">
            {notifications.filter(n => !n.is_read).length} unread
          </span>
          <button
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        </div>
      )}

      {/* Notification List */}
      <div
        className="overflow-y-auto"
        style={{ maxHeight }}
      >
        <div className="divide-y divide-gray-100">
          {notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              compact={compact}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
