'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Event } from '@/lib/database.types'
import { User } from '@supabase/supabase-js'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [attendeeCounts, setAttendeeCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    let cancelled = false

    const checkAuthAndFetchEvents = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (cancelled) return

      if (!session) {
        window.location.href = '/login'
        return
      }

      setUser(session.user)

      // Fetch events where organizer_id matches current user
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', session.user.id)
        .order('date', { ascending: true })

      if (cancelled) return

      if (error) {
        console.error('Error fetching events:', error)
      } else {
        const eventsData = (data as Event[]) || []
        setEvents(eventsData)

        // Fetch attendee counts for all events
        if (eventsData.length > 0) {
          const eventIds = eventsData.map(e => e.id)
          const { data: attendeesData, error: attendeesError } = await supabase
            .from('attendees')
            .select('event_id')
            .in('event_id', eventIds)

          if (!attendeesError && attendeesData && !cancelled) {
            // Count attendees per event
            const counts: Record<string, number> = {}
            ;(attendeesData as { event_id: string }[]).forEach(a => {
              counts[a.event_id] = (counts[a.event_id] || 0) + 1
            })
            setAttendeeCounts(counts)
          }
        }
      }

      if (!cancelled) setLoading(false)
    }

    checkAuthAndFetchEvents()

    // No auth state listener - handled by initial check only
    return () => {
      cancelled = true
    }
  }, []) // Empty dependency array

  const handleDelete = async (eventId: string, imageUrl: string | null) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return
    }

    setDeletingId(eventId)

    try {
      // Delete image from storage if exists
      if (imageUrl && imageUrl.includes('supabase')) {
        const path = imageUrl.split('/').pop()
        if (path) {
          await supabase.storage.from('event-images').remove([path])
        }
      }

      // Delete the event
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (error) {
        throw error
      }

      // Remove from local state
      setEvents(events.filter(e => e.id !== eventId))
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Failed to delete event. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-karachi-bg">
      <header className="bg-karachi-blue shadow-sm glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-3xl font-bold text-white hover:text-karachi-orange transition-colors">
                Karachi Event Finder
              </Link>
              <p className="mt-1 text-sm text-karachi-orange/80">Organizer Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/profile"
                className="text-white hover:text-karachi-orange transition-colors"
              >
                Profile
              </Link>
              <Link
                href="/events/new"
                className="px-4 py-2 bg-karachi-orange text-white font-medium rounded-lg hover:bg-orange-500 transition-colors"
              >
                Create Event
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Summary Section */}
        <div className="mb-8 bg-gradient-to-r from-karachi-blue to-karachi-orange rounded-2xl p-6 sm:p-8 text-white shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back! 👋</h1>
          <p className="text-white/80 text-lg mb-6">
            {events.length === 0
              ? "You haven't created any events yet. Start organizing!"
              : `You have ${events.filter(e => new Date(e.date) >= new Date(new Date().setHours(0, 0, 0, 0))).length} active event${events.filter(e => new Date(e.date) >= new Date(new Date().setHours(0, 0, 0, 0))).length !== 1 ? 's' : ''}`}
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-3xl sm:text-4xl font-bold">{events.length}</p>
              <p className="text-white/80 text-sm">Total Events</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-3xl sm:text-4xl font-bold">
                {events.filter(e => new Date(e.date) >= new Date(new Date().setHours(0, 0, 0, 0))).length}
              </p>
              <p className="text-white/80 text-sm">Upcoming</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-3xl sm:text-4xl font-bold">
                {events.filter(e => new Date(e.date) < new Date(new Date().setHours(0, 0, 0, 0))).length}
              </p>
              <p className="text-white/80 text-sm">Completed</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-3xl sm:text-4xl font-bold">
                {Object.values(attendeeCounts).reduce((sum, count) => sum + count, 0)}
              </p>
              <p className="text-white/80 text-sm">Total Attendees</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-karachi-blue">My Events</h2>
          <p className="text-karachi-blue/70">Manage all the events you&apos;ve created</p>
        </div>

        {events.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-karachi-blue/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h2 className="mt-4 text-xl font-semibold text-karachi-blue">
              You haven&apos;t created any events yet
            </h2>
            <p className="mt-2 text-karachi-blue/70">
              Get started by creating your first event and share it with the community.
            </p>
            <Link
              href="/events/new"
              className="mt-6 inline-flex items-center px-6 py-3 bg-karachi-orange text-white font-semibold rounded-lg hover:bg-orange-500 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Event
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-karachi-blue/20">
                <thead className="bg-karachi-blue/5">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-karachi-blue uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-karachi-blue uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-karachi-blue uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-karachi-blue uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-karachi-blue uppercase tracking-wider">
                      Going
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-karachi-blue uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-karachi-blue uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-karachi-blue/20">
                  {events.map((event) => {
                    const eventDate = new Date(event.date)
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const isPast = eventDate < today
                    const isToday = eventDate.toDateString() === today.toDateString()

                    return (
                      <tr key={event.id} className="hover:bg-karachi-blue/5">
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center">
                            {event.image_url ? (
                              <img
                                src={event.image_url}
                                alt={event.title}
                                className="h-10 w-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-karachi-blue to-karachi-orange flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                  {event.title.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-karachi-blue line-clamp-1 max-w-xs">
                                {event.title}
                              </div>
                              {event.is_featured && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-karachi-orange text-white">
                                  Featured
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="text-sm text-karachi-blue">{formatDate(event.date)}</div>
                          <div className="text-sm text-karachi-blue/70">{formatTime(event.time)}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="text-sm text-karachi-blue line-clamp-1 max-w-xs">
                            {event.location_name}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-karachi-blue/10 text-karachi-blue">
                            {event.category}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4 text-karachi-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span className="text-sm font-semibold text-karachi-orange">
                                {attendeeCounts[event.id] || 0}
                              </span>
                            </div>
                            {(attendeeCounts[event.id] || 0) > 0 && (
                              <span className="text-xs text-karachi-blue/70">
                                {attendeeCounts[event.id] === 1 ? 'person' : 'people'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          {isPast ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                              Past
                            </span>
                          ) : isToday ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              Today
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-karachi-blue/10 text-karachi-blue">
                              Upcoming
                            </span>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-right text-sm font-medium">
                          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-1">
                            <Link
                              href={`/events/${event.id}`}
                              className="px-3 py-1.5 text-karachi-blue hover:text-karachi-orange hover:bg-karachi-blue/10 rounded-md transition-colors text-sm"
                            >
                              View
                            </Link>
                            <Link
                              href={`/events/${event.id}/edit`}
                              className="px-3 py-1.5 text-karachi-blue hover:text-karachi-orange hover:bg-karachi-blue/10 rounded-md transition-colors text-sm"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(event.id, event.image_url)}
                              disabled={deletingId === event.id}
                              className="px-3 py-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 text-sm"
                            >
                              {deletingId === event.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary Footer */}
            <div className="bg-karachi-blue/5 px-4 sm:px-6 py-4 border-t border-karachi-blue/20">
              <p className="text-sm text-karachi-blue/70">
                Total: <span className="font-medium">{events.length}</span> event{events.length !== 1 ? 's' : ''}
                {' | '}
                Upcoming: <span className="font-medium">
                  {events.filter(e => new Date(e.date) >= new Date(new Date().setHours(0, 0, 0, 0))).length}
                </span>
                {' | '}
                Past: <span className="font-medium">
                  {events.filter(e => new Date(e.date) < new Date(new Date().setHours(0, 0, 0, 0))).length}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 gap-4">
          <Link
            href="/events/new"
            className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="p-2 bg-karachi-blue/10 rounded-lg">
              <svg className="w-6 h-6 text-karachi-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-karachi-blue">Create Event</p>
              <p className="text-sm text-karachi-blue/70">Add a new event</p>
            </div>
          </Link>

          <Link
            href="/profile"
            className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="p-2 bg-karachi-blue/10 rounded-lg">
              <svg className="w-6 h-6 text-karachi-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-karachi-blue">My Profile</p>
              <p className="text-sm text-karachi-blue/70">View your RSVPs</p>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="p-2 bg-karachi-blue/10 rounded-lg">
              <svg className="w-6 h-6 text-karachi-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-karachi-blue">Browse Events</p>
              <p className="text-sm text-karachi-blue/70">Discover events</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}
