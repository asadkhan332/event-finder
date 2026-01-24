'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Event, Profile } from '@/lib/database.types'
import { User } from '@supabase/supabase-js'
import {
  CalendarPlus,
  Calendar,
  Users,
  TrendingUp,
  Trash2,
  Edit3,
  Eye,
  Plus,
  MapPin,
  Clock,
  Star
} from 'lucide-react'

export default function HostDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
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
        router.push('/login')
        return
      }

      setUser(session.user)

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle() as { data: Profile | null }

      if (cancelled) return

      if (profileData) {
        setProfile(profileData)

        // Redirect if not a host
        if (profileData.role !== 'host') {
          router.push('/')
          return
        }
      }

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

    return () => {
      cancelled = true
    }
  }, [router])

  const handleDelete = async (eventId: string, imageUrl: string | null) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return
    }

    setDeletingId(eventId)

    try {
      if (imageUrl && imageUrl.includes('supabase')) {
        const path = imageUrl.split('/').pop()
        if (path) {
          await supabase.storage.from('event-images').remove([path])
        }
      }

      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (error) {
        throw error
      }

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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
  const pastEvents = events.filter(e => new Date(e.date) < new Date(new Date().setHours(0, 0, 0, 0)))
  const totalAttendees = Object.values(attendeeCounts).reduce((sum, count) => sum + count, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Orange Theme */}
      <header className="bg-gradient-to-r from-orange-500 to-orange-600 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <CalendarPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">Host Dashboard</h1>
                  <p className="text-white/80">Welcome back, {profile?.full_name || 'Host'}</p>
                </div>
              </div>
            </div>

            <Link
              href="/events/new"
              className="inline-flex items-center gap-2 px-5 py-3 bg-white text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Create Event
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{events.length}</p>
                <p className="text-gray-500 text-sm">Total Events</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{upcomingEvents.length}</p>
                <p className="text-gray-500 text-sm">Upcoming</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalAttendees}</p>
                <p className="text-gray-500 text-sm">Total Attendees</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{events.filter(e => e.is_featured).length}</p>
                <p className="text-gray-500 text-sm">Featured</p>
              </div>
            </div>
          </div>
        </div>

        {/* Events Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Your Events</h2>
          <p className="text-gray-500">Manage and track all your created events</p>
        </div>

        {events.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarPlus className="w-10 h-10 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No events yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Start creating amazing events and share them with the community!
            </p>
            <Link
              href="/events/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Event
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const eventDate = new Date(event.date)
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              const isPast = eventDate < today
              const isToday = eventDate.toDateString() === today.toDateString()

              return (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Event Image */}
                  <div className="relative h-40">
                    {event.image_url ? (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                        <Calendar className="w-12 h-12 text-white/50" />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      {isPast ? (
                        <span className="px-3 py-1 bg-gray-800/80 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                          Past
                        </span>
                      ) : isToday ? (
                        <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                          Today
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                          Upcoming
                        </span>
                      )}
                    </div>

                    {/* Featured Badge */}
                    {event.is_featured && (
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-semibold rounded-full">
                          Featured
                        </span>
                      </div>
                    )}

                    {/* Attendee Count */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm backdrop-blur-sm">
                      <Users className="w-4 h-4" />
                      <span className="font-semibold">{attendeeCounts[event.id] || 0}</span>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-1">
                      {event.title}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        <span>{formatDate(event.date)}</span>
                      </div>

                      {event.time && (
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Clock className="w-4 h-4 text-orange-500" />
                          <span>{formatTime(event.time)}</span>
                        </div>
                      )}

                      {event.location_name && (
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <MapPin className="w-4 h-4 text-orange-500" />
                          <span className="line-clamp-1">{event.location_name}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/events/${event.id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>

                      <Link
                        href={`/events/${event.id}/edit`}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-orange-100 text-orange-700 font-medium rounded-lg hover:bg-orange-200 transition-colors text-sm"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </Link>

                      <button
                        onClick={() => handleDelete(event.id, event.image_url)}
                        disabled={deletingId === event.id}
                        className="flex items-center justify-center px-3 py-2 bg-red-100 text-red-600 font-medium rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 text-sm"
                      >
                        {deletingId === event.id ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/events/new"
            className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Create Event</p>
              <p className="text-gray-500 text-sm">Add a new event</p>
            </div>
          </Link>

          <Link
            href="/profile"
            className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">My Profile</p>
              <p className="text-gray-500 text-sm">View your profile</p>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Browse Events</p>
              <p className="text-gray-500 text-sm">Discover events</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}
