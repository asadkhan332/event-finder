'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Profile, Event, Attendee } from '@/lib/database.types'
import { User } from '@supabase/supabase-js'
import EventCard from '@/components/EventCard'

type AttendeeWithEvent = Attendee & { event: Event }

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [joinedEvents, setJoinedEvents] = useState<Event[]>([])
  const [createdEvents, setCreatedEvents] = useState<Event[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [joinedEventsCount, setJoinedEventsCount] = useState(0)
  const [createdEventsCount, setCreatedEventsCount] = useState(0)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchJoinedEvents = async (userId: string) => {
    const { data: attendeeData, error: attendeeError } = await supabase
      .from('attendees')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (attendeeError) {
      console.error('Error fetching attending events:', attendeeError)
      return
    }

    const typedAttendeeData = (attendeeData as Attendee[]) || []

    if (typedAttendeeData.length === 0) {
      setJoinedEvents([])
      return
    }

    const eventIds = typedAttendeeData.map(a => a.event_id)
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .in('id', eventIds)

    if (eventsError) {
      console.error('Error fetching event details:', eventsError)
      return
    }

    setJoinedEvents(eventsData as Event[])
  }

  const fetchCreatedEvents = async (userId: string) => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('organizer_id', userId)
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching created events:', error)
    } else {
      setCreatedEvents(data as Event[])
    }
  }

  const fetchReviews = async (userId: string) => {
    // Placeholder for reviews - assuming there's a reviews table
    // For now, just setting to empty array
    setReviews([])
  }

  const fetchJoinedEventsCount = async (userId: string) => {
    const { count, error } = await supabase
      .from('attendees')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching joined events count:', error)
      return
    }
    setJoinedEventsCount(count || 0)
  }

  const fetchCreatedEventsCount = async (userId: string) => {
    const { count, error } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('organizer_id', userId)

    if (error) {
      console.error('Error fetching created events count:', error)
      return
    }
    setCreatedEventsCount(count || 0)
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload an image file (JPEG, PNG, GIF, or WebP)')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setUploadingAvatar(true)

    try {
      // Create unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // Upload to Supabase Storage (bucket: avatars)
      const { error: uploadError } = await supabase.storage
        .from('Avatar')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        alert(`Failed to upload image: ${uploadError.message}`)
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('Avatar')
        .getPublicUrl(filePath)

      // Update profile with new avatar URL
      const { error: updateError } = await (supabase.from('profiles') as any)
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (updateError) {
        console.error('Profile update error:', updateError)
        alert('Failed to update profile. Please try again.')
        return
      }

      // Update local state
      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null)
    } catch (error) {
      console.error('Avatar upload error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setUploadingAvatar(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const formatMemberSince = (dateString: string | null | undefined) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    })
  }

  useEffect(() => {
    let cancelled = false

    const checkAuthAndFetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (cancelled) return

      if (!session) {
        window.location.href = '/login'
        return
      }

      setUser(session.user)

      // Fetch profile data
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle()

      if (cancelled) return

      if (error) {
        console.error('Error fetching profile:', error)
      } else if (profileData) {
        setProfile(profileData as Profile)
      }

      setLoading(false)

      // Fetch all user data in parallel
      await Promise.all([
        fetchJoinedEvents(session.user.id),
        fetchCreatedEvents(session.user.id),
        fetchReviews(session.user.id),
        fetchJoinedEventsCount(session.user.id),
        fetchCreatedEventsCount(session.user.id)
      ])

      if (!cancelled) setEventsLoading(false)
    }

    checkAuthAndFetchProfile()

    // No auth state listener to avoid loops
    return () => {
      cancelled = true
    }
  }, []) // Empty dependency array

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center transition-colors">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008080]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header with Karachi Teal Gradient */}
      <header className="bg-gradient-to-r from-[#008080] to-[#00a3a3] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative group">
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                />

                {/* Profile Picture */}
                {uploadingAvatar ? (
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                ) : profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Profile'}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl"
                  />
                ) : (
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-[#008080] text-4xl font-bold border-4 border-white shadow-xl">
                    {profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}

                {/* Camera Icon Overlay */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-[#008080] hover:bg-[#006666] rounded-full flex items-center justify-center border-2 border-white shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Upload profile picture"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>

              <div>
                <h1 className="text-3xl font-bold text-white">
                  {profile?.full_name || 'Anonymous User'}
                </h1>
                <p className="text-white/90 mt-1">{user?.email}</p>
                <p className="text-white/80 text-sm mt-2">
                  Member since {formatMemberSince(profile?.created_at || user?.created_at)}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/30 transition-all shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Dashboard
              </Link>

              <button
                onClick={() => setShowSettingsModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/30 transition-all shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="bg-[#008080]/20 p-3 rounded-xl">
                <svg className="w-8 h-8 text-[#008080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{joinedEventsCount}</h3>
                <p className="text-white/70">Events Joined</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="bg-[#008080]/20 p-3 rounded-xl">
                <svg className="w-8 h-8 text-[#008080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{createdEventsCount}</h3>
                <p className="text-white/70">Events Created</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="bg-[#008080]/20 p-3 rounded-xl">
                <svg className="w-8 h-8 text-[#008080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{reviews.length}</h3>
                <p className="text-white/70">Total Reviews</p>
              </div>
            </div>
          </div>
        </div>

        {/* Joined Events Grid */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Events Joined</h2>
            <span className="text-white/70">{joinedEvents.length} events</span>
          </div>

          {eventsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008080]"></div>
            </div>
          ) : joinedEvents.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-16 w-16 text-white/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className="mt-4 text-white/70">You haven't joined any events yet.</p>
              <Link
                href="/"
                className="mt-4 inline-block bg-[#008080] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#006666] transition-colors"
              >
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {joinedEvents.map((event) => (
                <div key={event.id} className="relative">
                  <EventCard event={event} />
                  <div className="absolute top-4 left-4 bg-[#008080] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    Joined
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings Modal */}
        {showSettingsModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Account Settings</h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="text-white/70 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <Link
                  href="/profile/edit"
                  className="block w-full text-left px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
                >
                  Edit Profile
                </Link>

                <Link
                  href="/profile/security"
                  className="block w-full text-left px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
                >
                  Security Settings
                </Link>

                <button
                  onClick={async () => {
                    await supabase.auth.signOut()
                    router.push('/')
                  }}
                  className="w-full text-left px-4 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-200 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}