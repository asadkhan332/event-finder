'use client'

import { Bell, Calendar, CheckCircle, XCircle, Edit, Clock } from 'lucide-react'
import Link from 'next/link'
import type { NotificationWithEvent } from '@/lib/database.types'

interface NotificationItemProps {
  notification: NotificationWithEvent
  onMarkAsRead?: (id: string) => void
  compact?: boolean
}

export default function NotificationItem({
  notification,
  onMarkAsRead,
  compact = false
}: NotificationItemProps) {
  const { id, type, title, message, is_read, created_at, event } = notification

  // Get icon based on notification type
  const getIcon = () => {
    const iconClass = compact ? 'w-4 h-4' : 'w-5 h-5'
    switch (type) {
      case 'reminder':
        return <Clock className={`${iconClass} text-orange-500`} />
      case 'confirmation':
        return <CheckCircle className={`${iconClass} text-teal-500`} />
      case 'update':
        return <Edit className={`${iconClass} text-blue-500`} />
      case 'cancellation':
        return <XCircle className={`${iconClass} text-red-500`} />
      default:
        return <Bell className={`${iconClass} text-gray-500`} />
    }
  }

  // Format time ago
  const getTimeAgo = () => {
    const now = new Date()
    const created = new Date(created_at)
    const diffMs = now.getTime() - created.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return created.toLocaleDateString()
  }

  // Handle click
  const handleClick = () => {
    if (!is_read && onMarkAsRead) {
      onMarkAsRead(id)
    }
  }

  const content = (
    <div
      className={`
        flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer
        ${is_read ? 'bg-gray-50' : 'bg-orange-50 border-l-4 border-orange-500'}
        hover:bg-gray-100
        ${compact ? 'p-2' : 'p-3'}
      `}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className={`
        flex-shrink-0 p-2 rounded-full
        ${is_read ? 'bg-gray-200' : 'bg-white shadow-sm'}
      `}>
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className={`
            font-medium text-gray-900 truncate
            ${compact ? 'text-sm' : 'text-base'}
            ${!is_read ? 'font-semibold' : ''}
          `}>
            {title}
          </h4>
          <span className={`
            flex-shrink-0 text-gray-500
            ${compact ? 'text-xs' : 'text-sm'}
          `}>
            {getTimeAgo()}
          </span>
        </div>

        <p className={`
          text-gray-600 mt-1
          ${compact ? 'text-xs line-clamp-1' : 'text-sm line-clamp-2'}
        `}>
          {message}
        </p>

        {/* Event link */}
        {event && !compact && (
          <div className="flex items-center gap-2 mt-2 text-sm text-teal-600">
            <Calendar className="w-4 h-4" />
            <span>{event.title}</span>
          </div>
        )}
      </div>

      {/* Unread indicator */}
      {!is_read && (
        <div className="flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-orange-500" />
        </div>
      )}
    </div>
  )

  // If there's an event, wrap in link
  if (event) {
    return (
      <Link href={`/events/${event.id}`} className="block">
        {content}
      </Link>
    )
  }

  return content
}
