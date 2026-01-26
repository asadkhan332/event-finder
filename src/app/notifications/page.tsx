'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Filter, Trash2, CheckCheck, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useNotifications } from '@/hooks/useNotifications'
import NotificationList from '@/components/NotificationList'
import { deleteAllNotifications } from '@/lib/notifications'
import type { NotificationType } from '@/lib/database.types'
import toast from 'react-hot-toast'

type FilterType = 'all' | NotificationType

export default function NotificationsPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [loading, setLoading] = useState(true)

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUserId(session.user.id)
      setLoading(false)
    }
    checkAuth()
  }, [router])

  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead,
    refetch
  } = useNotifications(userId, { limit: 100 })

  // Filter notifications
  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => n.type === filter)

  // Handle clear all
  const handleClearAll = async () => {
    if (!userId) return

    const confirmed = window.confirm('Are you sure you want to delete all notifications? This cannot be undone.')
    if (!confirmed) return

    const result = await deleteAllNotifications(userId)
    if (result.error) {
      toast.error('Failed to clear notifications')
      return
    }

    toast.success('All notifications cleared')
    refetch()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Bell className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Notifications</h1>
              <p className="text-white/80 mt-1">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                  : 'You\'re all caught up!'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filter === 'all'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('reminder')}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filter === 'reminder'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Reminders
            </button>
            <button
              onClick={() => setFilter('confirmation')}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filter === 'confirmation'
                  ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Confirmations
            </button>
            <button
              onClick={() => setFilter('update')}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filter === 'update'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Updates
            </button>
            <button
              onClick={() => setFilter('cancellation')}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filter === 'cancellation'
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Cancellations
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-600 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Notification List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <NotificationList
            notifications={filteredNotifications}
            loading={notificationsLoading}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            maxHeight="calc(100vh - 350px)"
            showMarkAllButton={false}
          />
        </div>

        {/* Empty state for filtered results */}
        {!notificationsLoading && filteredNotifications.length === 0 && notifications.length > 0 && (
          <div className="text-center py-8">
            <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              No {filter} notifications found
            </p>
            <button
              onClick={() => setFilter('all')}
              className="mt-2 text-sm text-orange-500 hover:text-orange-600 font-medium"
            >
              Show all notifications
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
