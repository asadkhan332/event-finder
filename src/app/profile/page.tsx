'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Profile, Event, RSVP } from '@/lib/database.types'
import { User } from '@supabase/supabase-js'

type RSVPWithEvent = RSVP & { event: Event }

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [myEvents, setMyEvents] = useState<Event[]>([])
  const [myRsvps, setMyRsvps] = useState<RSVPWithEvent[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [rsvpsLoading, setRsvpsLoading] = useState(true)

  const fetchMyEvents = async (userId: string) => {
    setEventsLoading(true)
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('organizer_id', userId)
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching my events:', error)
    } else {
      setMyEvents((data as Event[]) || [])
    }
    setEventsLoading(false)
  }

  const fetchMyRsvps = async (userId: string) => {
    setRsvpsLoading(true)
    const { data, error } = await supabase
      .from('rsvps')
      .select('*, event:events(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching my RSVPs:', error)
    } else {
      const validRsvps = (data || []).filter(rsvp => rsvp.event !== null)
      setMyRsvps(validRsvps as RSVPWithEvent[])
    }
    setRsvpsLoading(false)
  }

  useEffect(() => {
    const checkAuthAndFetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      setUser(session.user)

      // Fetch profile data
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle()

      if (error) {
        console.error('Error fetching profile:', error)
      } else if (profileData) {
        const typedProfile = profileData as Profile
        setProfile(typedProfile)
        setFullName(typedProfile.full_name || '')
      }
      // If no profile exists yet, that's okay - user can create one via the edit form

      setLoading(false)

      // Fetch events and RSVPs in parallel
      fetchMyEvents(session.user.id)
      fetchMyRsvps(session.user.id)
    }

    checkAuthAndFetchProfile()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          router.push('/login')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSaving(true)
    setMessage(null)

    const profileData = {
      id: user.id,
      email: user.email!,
      full_name: fullName,
    }

    const { error } = await supabase
      .from('profiles')
      .upsert(profileData as never, { onConflict: 'id' })

    if (error) {
      console.error('Update Error:', JSON.stringify(error, null, 2))
      alert(error.message)
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
    } else {
      setProfile((prev) => prev
        ? { ...prev, full_name: fullName }
        : { id: user.id, email: user.email!, full_name: fullName, avatar_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      )
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setIsEditing(false)
    }

    setIsSaving(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="text-3xl font-bold text-gray-900 hover:text-blue-600">
            Local Event Finder
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-blue-600 px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold">
                {profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {profile?.full_name || 'Anonymous User'}
                </h1>
                <p className="text-blue-100">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            {message && (
              <div
                className={`mb-6 p-4 rounded-md ${
                  message.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="space-y-6">
              {/* User Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
                <dl className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500 sm:w-32">Email</dt>
                    <dd className="text-sm text-gray-900">{user?.email}</dd>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500 sm:w-32">Full Name</dt>
                    <dd className="text-sm text-gray-900">
                      {profile?.full_name || <span className="text-gray-400 italic">Not set</span>}
                    </dd>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500 sm:w-32">Joined Date</dt>
                    <dd className="text-sm text-gray-900">
                      {profile?.created_at ? formatDate(profile.created_at) : 'Unknown'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Divider */}
              <hr className="border-gray-200" />

              {/* Edit Profile Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                      <label
                        htmlFor="fullName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false)
                          setFullName(profile?.full_name || '')
                          setMessage(null)
                        }}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="text-sm text-gray-500">
                    Click &quot;Edit&quot; to update your display name.
                  </p>
                )}
              </div>

              {/* Divider */}
              <hr className="border-gray-200" />

              {/* My Events Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">My Events</h2>
                  <Link
                    href="/events/new"
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Create New
                  </Link>
                </div>

                {eventsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : myEvents.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
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
                    <p className="mt-2 text-sm text-gray-600">You haven&apos;t created any events yet.</p>
                    <Link
                      href="/events/new"
                      className="mt-3 inline-block text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Create your first event
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {myEvents.map((event) => {
                      const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                      return (
                        <div key={event.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          {event.image_url ? (
                            <img
                              src={event.image_url}
                              alt={event.title}
                              className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xl font-bold">
                                {event.title.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/events/${event.id}`}
                              className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1"
                            >
                              {event.title}
                            </Link>
                            <p className="text-sm text-gray-500">{formattedDate}</p>
                            <div className="flex gap-2 mt-1">
                              <Link
                                href={`/events/${event.id}/edit`}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                Edit
                              </Link>
                              <Link
                                href={`/events/${event.id}`}
                                className="text-xs text-gray-600 hover:text-gray-800"
                              >
                                View
                              </Link>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Divider */}
              <hr className="border-gray-200" />

              {/* My RSVPs Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">My RSVPs</h2>

                {rsvpsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : myRsvps.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">You haven&apos;t RSVPed to any events yet.</p>
                    <Link
                      href="/"
                      className="mt-3 inline-block text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Browse events
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myRsvps.map((rsvp) => {
                      const { event, status } = rsvp
                      const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                      const statusStyles: Record<string, string> = {
                        going: 'bg-green-100 text-green-800',
                        interested: 'bg-yellow-100 text-yellow-800',
                        not_going: 'bg-gray-100 text-gray-600',
                      }
                      const statusLabels: Record<string, string> = {
                        going: 'Going',
                        interested: 'Interested',
                        not_going: 'Not Going',
                      }
                      return (
                        <div key={rsvp.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          {event.image_url ? (
                            <img
                              src={event.image_url}
                              alt={event.title}
                              className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xl font-bold">
                                {event.title.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <Link
                                href={`/events/${event.id}`}
                                className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1"
                              >
                                {event.title}
                              </Link>
                              <span
                                className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${statusStyles[status]}`}
                              >
                                {statusLabels[status]}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">{formattedDate}</p>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{event.location_name}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            Back to Events
          </Link>
        </div>
      </main>
    </div>
  )
}
