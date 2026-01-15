'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { RSVP } from '@/lib/database.types'

type RSVPStatus = 'going' | 'interested' | 'not_going'

type RSVPButtonProps = {
  eventId: string
}

export default function RSVPButton({ eventId }: RSVPButtonProps) {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [currentRsvp, setCurrentRsvp] = useState<RSVP | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  useEffect(() => {
    const checkAuthAndFetchRsvp = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        setUserId(session.user.id)

        // Fetch existing RSVP
        const { data: rsvp } = await supabase
          .from('rsvps')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('event_id', eventId)
          .maybeSingle()

        if (rsvp) {
          setCurrentRsvp(rsvp as RSVP)
        }
      }

      setLoading(false)
    }

    checkAuthAndFetchRsvp()
  }, [eventId])

  const handleRSVP = async (status: RSVPStatus) => {
    if (!userId) {
      router.push('/login')
      return
    }

    setSaving(true)

    if (currentRsvp) {
      // Update existing RSVP
      const { data, error } = await supabase
        .from('rsvps')
        .update({ status } as never)
        .eq('id', currentRsvp.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating RSVP:', error)
        alert('Failed to update RSVP. Please try again.')
      } else {
        setCurrentRsvp(data as RSVP)
      }
    } else {
      // Create new RSVP
      const { data, error } = await supabase
        .from('rsvps')
        .insert({
          user_id: userId,
          event_id: eventId,
          status,
        } as never)
        .select()
        .single()

      if (error) {
        console.error('Error creating RSVP:', error)
        alert('Failed to RSVP. Please try again.')
      } else {
        setCurrentRsvp(data as RSVP)
      }
    }

    setSaving(false)
    setShowOptions(false)
  }

  const handleCancelRsvp = async () => {
    if (!currentRsvp) return

    setSaving(true)

    const { error } = await supabase
      .from('rsvps')
      .delete()
      .eq('id', currentRsvp.id)

    if (error) {
      console.error('Error canceling RSVP:', error)
      alert('Failed to cancel RSVP. Please try again.')
    } else {
      setCurrentRsvp(null)
    }

    setSaving(false)
    setShowOptions(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const statusConfig = {
    going: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: 'text-green-600',
      label: "You're going!",
    },
    interested: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: 'text-yellow-600',
      label: "You're interested",
    },
    not_going: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-700',
      icon: 'text-gray-500',
      label: 'Not going',
    },
  }

  // Show current RSVP status with options to change
  if (currentRsvp) {
    const config = statusConfig[currentRsvp.status]

    return (
      <div className="space-y-3">
        <div className={`flex items-center justify-between gap-3 ${config.bg} border ${config.border} rounded-lg p-4`}>
          <div className="flex items-center gap-3">
            {currentRsvp.status === 'going' && (
              <svg className={`w-6 h-6 ${config.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {currentRsvp.status === 'interested' && (
              <svg className={`w-6 h-6 ${config.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            )}
            {currentRsvp.status === 'not_going' && (
              <svg className={`w-6 h-6 ${config.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className={`${config.text} font-medium`}>{config.label}</span>
          </div>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            disabled={saving}
          >
            {showOptions ? 'Cancel' : 'Change'}
          </button>
        </div>

        {showOptions && (
          <div className="flex flex-wrap gap-2">
            {currentRsvp.status !== 'going' && (
              <button
                onClick={() => handleRSVP('going')}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Going
              </button>
            )}
            {currentRsvp.status !== 'interested' && (
              <button
                onClick={() => handleRSVP('interested')}
                disabled={saving}
                className="px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
              >
                Interested
              </button>
            )}
            {currentRsvp.status !== 'not_going' && (
              <button
                onClick={() => handleRSVP('not_going')}
                disabled={saving}
                className="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Not Going
              </button>
            )}
            <button
              onClick={handleCancelRsvp}
              disabled={saving}
              className="px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
            >
              Remove RSVP
            </button>
          </div>
        )}
      </div>
    )
  }

  // Show RSVP options for users who haven't RSVPed yet
  return (
    <div className="space-y-3">
      {!userId ? (
        <button
          onClick={() => router.push('/login')}
          className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Login to RSVP
        </button>
      ) : (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleRSVP('going')}
            disabled={saving}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {saving ? 'Saving...' : "I'm Going"}
          </button>
          <button
            onClick={() => handleRSVP('interested')}
            disabled={saving}
            className="px-6 py-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Interested
          </button>
          <button
            onClick={() => handleRSVP('not_going')}
            disabled={saving}
            className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Not Going
          </button>
        </div>
      )}
    </div>
  )
}
