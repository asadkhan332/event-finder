'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getOrCreatePreferences, updatePreferences } from '@/lib/notifications'
import type { NotificationPreference } from '@/lib/database.types'
import { Bell, Mail, Clock, Calendar, CheckCircle, RefreshCw, Loader2, Save } from 'lucide-react'
import toast from 'react-hot-toast'

interface NotificationPreferencesProps {
  userId: string
}

export default function NotificationPreferences({ userId }: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [emailEnabled, setEmailEnabled] = useState(false)
  const [remindersEnabled, setRemindersEnabled] = useState(true)
  const [confirmationsEnabled, setConfirmationsEnabled] = useState(true)
  const [updatesEnabled, setUpdatesEnabled] = useState(true)
  const [reminderHours, setReminderHours] = useState<number[]>([24, 1])

  useEffect(() => {
    const loadPreferences = async () => {
      setLoading(true)
      const result = await getOrCreatePreferences(userId)

      if (result.error) {
        toast.error('Failed to load notification preferences')
        setLoading(false)
        return
      }

      if (result.data) {
        setPreferences(result.data)
        setEmailEnabled(result.data.email_enabled)
        setRemindersEnabled(result.data.reminders_enabled)
        setConfirmationsEnabled(result.data.confirmations_enabled)
        setUpdatesEnabled(result.data.updates_enabled)
        setReminderHours(result.data.reminder_hours)
      }

      setLoading(false)
    }

    loadPreferences()
  }, [userId])

  const handleSave = async () => {
    setSaving(true)

    const result = await updatePreferences(userId, {
      email_enabled: emailEnabled,
      reminders_enabled: remindersEnabled,
      confirmations_enabled: confirmationsEnabled,
      updates_enabled: updatesEnabled,
      reminder_hours: reminderHours
    })

    if (result.error) {
      toast.error('Failed to save preferences')
    } else {
      toast.success('Notification preferences saved!', {
        icon: '🔔',
        duration: 3000
      })
      if (result.data) {
        setPreferences(result.data)
      }
    }

    setSaving(false)
  }

  const toggleReminderHour = (hour: number) => {
    setReminderHours(prev => {
      if (prev.includes(hour)) {
        return prev.filter(h => h !== hour)
      } else {
        return [...prev, hour].sort((a, b) => b - a)
      }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
          <Bell className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Notification Preferences</h3>
          <p className="text-sm text-gray-500">Control how you receive notifications</p>
        </div>
      </div>

      {/* Notification Types */}
      <div className="space-y-4">
        {/* Email Notifications */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={emailEnabled}
              onChange={(e) => setEmailEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
          </label>
        </div>

        {/* Event Reminders */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-orange-500" />
            <div>
              <p className="font-medium text-gray-900">Event Reminders</p>
              <p className="text-sm text-gray-500">Get reminded before events you're attending</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={remindersEnabled}
              onChange={(e) => setRemindersEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
          </label>
        </div>

        {/* Reminder Timing - Only show if reminders are enabled */}
        {remindersEnabled && (
          <div className="ml-8 p-4 bg-orange-50 rounded-xl border border-orange-100">
            <p className="text-sm font-medium text-gray-700 mb-3">Remind me:</p>
            <div className="flex flex-wrap gap-2">
              {[48, 24, 12, 6, 1].map((hour) => (
                <button
                  key={hour}
                  type="button"
                  onClick={() => toggleReminderHour(hour)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                    reminderHours.includes(hour)
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
                  }`}
                >
                  {hour >= 24 ? `${hour / 24} day${hour > 24 ? 's' : ''}` : `${hour} hour${hour > 1 ? 's' : ''}`} before
                </button>
              ))}
            </div>
          </div>
        )}

        {/* RSVP Confirmations */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-teal-500" />
            <div>
              <p className="font-medium text-gray-900">RSVP Confirmations</p>
              <p className="text-sm text-gray-500">Get notified when you join or leave events</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={confirmationsEnabled}
              onChange={(e) => setConfirmationsEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
          </label>
        </div>

        {/* Event Updates */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-blue-500" />
            <div>
              <p className="font-medium text-gray-900">Event Updates</p>
              <p className="text-sm text-gray-500">Get notified when event details change</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={updatesEnabled}
              onChange={(e) => setUpdatesEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/25"
      >
        {saving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            Save Preferences
          </>
        )}
      </button>
    </div>
  )
}
