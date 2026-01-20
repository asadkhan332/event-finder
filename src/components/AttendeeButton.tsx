'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

type AttendeeButtonProps = {
  eventId: string
}

export default function AttendeeButton({ eventId }: AttendeeButtonProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isGoing, setIsGoing] = useState(false)
  const [attendeeCount, setAttendeeCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    // Check auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    fetchAttendeeData()
  }, [eventId, user])

  const fetchAttendeeData = async () => {
    setLoading(true)

    // Get total count
    const { count, error: countError } = await supabase
      .from('attendees')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)

    if (countError) {
      console.error('Error fetching attendee count:', countError)
    } else {
      setAttendeeCount(count || 0)
    }

    // Check if current user is going
    if (user) {
      const { data, error } = await supabase
        .from('attendees')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Error checking attendance:', error)
      } else {
        setIsGoing(!!data)
      }
    }

    setLoading(false)
  }

  const handleToggleAttendance = async () => {
    if (!user) {
      window.location.href = '/login'
      return
    }

    setProcessing(true)

    try {
      if (isGoing) {
        // Remove attendance
        const { error } = await supabase
          .from('attendees')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id)

        if (error) throw error

        setIsGoing(false)
        setAttendeeCount(prev => Math.max(0, prev - 1))
      } else {
        // Add attendance
        const { error } = await supabase
          .from('attendees')
          .insert({
            event_id: eventId,
            user_id: user.id,
          } as never)

        if (error) throw error

        setIsGoing(true)
        setAttendeeCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error updating attendance:', error)
      alert('Failed to update attendance. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-6">
      {/* Attendee Count */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex -space-x-2">
          {[...Array(Math.min(3, attendeeCount))].map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
            >
              {String.fromCharCode(65 + i)}
            </div>
          ))}
          {attendeeCount > 3 && (
            <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-gray-600 text-xs font-bold">
              +{attendeeCount - 3}
            </div>
          )}
        </div>
        <p className="text-gray-700 font-medium">
          {attendeeCount === 0 ? (
            'Be the first to join!'
          ) : attendeeCount === 1 ? (
            <span><span className="text-purple-600 font-bold">1</span> person is going to this event</span>
          ) : (
            <span><span className="text-purple-600 font-bold">{attendeeCount}</span> people are going to this event</span>
          )}
        </p>
      </div>

      {/* Action Button */}
      {!user ? (
        <a
          href="/login"
          className="block w-full text-center px-6 py-3 bg-gradient-to-r from-karachi-blue to-teal-500 text-white font-semibold rounded-xl shadow-md hover:from-[#006666] hover:to-teal-600 transition-all"
        >
          Login to Join
        </a>
      ) : isGoing ? (
        <button
          onClick={handleToggleAttendance}
          disabled={processing}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
              Processing...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              I&apos;m not going anymore
            </>
          )}
        </button>
      ) : (
        <button
          onClick={handleToggleAttendance}
          disabled={processing}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-karachi-blue to-teal-500 text-white font-semibold rounded-xl shadow-md hover:from-[#006666] hover:to-teal-600 hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Count Me In!
            </>
          )}
        </button>
      )}

      {isGoing && (
        <p className="mt-3 text-center text-sm text-purple-600 font-medium">
          You&apos;re going to this event!
        </p>
      )}
    </div>
  )
}
