'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Profile, Event, Attendee } from '@/lib/database.types'
import { User } from '@supabase/supabase-js'
import {
  Camera,
  LayoutDashboard,
  Settings,
  Users,
  Calendar,
  Star,
  Clock,
  MapPin,
  X
} from 'lucide-react'

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

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload an image file (JPEG, PNG, GIF, or WebP)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setUploadingAvatar(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

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

      const { data: { publicUrl } } = supabase.storage
        .from('Avatar')
        .getPublicUrl(filePath)

      const { error: updateError } = await (supabase.from('profiles') as any)
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (updateError) {
        console.error('Profile update error:', updateError)
        alert('Failed to update profile. Please try again.')
        return
      }

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null)
    } catch (error) {
      console.error('Avatar upload error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setUploadingAvatar(false)
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

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatEventTime = (timeString: string) => {
    if (!timeString) return ''
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
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

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d9488]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner - Solid Teal */}
      <header className="bg-[#0d9488] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Profile Info */}
            <div className="flex items-center gap-5">
              {/* Avatar with Camera Edit Icon */}
              <div className="relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                />

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
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-[#0d9488] text-4xl font-bold border-4 border-white shadow-xl">
                    {profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}

                {/* Camera Icon */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-all disabled:opacity-50"
                  title="Upload profile picture"
                >
                  <Camera className="w-4 h-4 text-[#0d9488]" />
                </button>
              </div>

              {/* Name, Email, Member Since */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {profile?.full_name || 'Anonymous User'}
                </h1>
                <p className="text-white/90 mt-1">{user?.email}</p>
                <p className="text-white/70 text-sm mt-1">
                  Member since {formatMemberSince(profile?.created_at || user?.created_at)}
                </p>
              </div>
            </div>

            {/* Action Buttons - Ghost/Outline Style */}
            <div className="flex gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-white/50 text-white font-medium rounded-lg hover:bg-white/10 transition-all"
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </Link>

              <button
                onClick={() => setShowSettingsModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-white/50 text-white font-medium rounded-lg hover:bg-white/10 transition-all"
              >
                <Settings className="w-5 h-5" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards Grid - White Background with Shadow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Events Joined */}
          <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-[#0d9488]" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{joinedEventsCount}</h3>
              <p className="text-gray-500 mt-1">Events Joined</p>
            </div>
          </div>

          {/* Events Created */}
          <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-7 h-7 text-[#0d9488]" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{createdEventsCount}</h3>
              <p className="text-gray-500 mt-1">Events Created</p>
            </div>
          </div>

          {/* Total Reviews */}
          <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mb-4">
                <Star className="w-7 h-7 text-[#0d9488]" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{reviews.length}</h3>
              <p className="text-gray-500 mt-1">Total Reviews</p>
            </div>
          </div>
        </div>

        {/* Events Joined Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Events Joined</h2>
            <span className="text-gray-500">{joinedEvents.length} events</span>
          </div>

          {eventsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d9488]"></div>
            </div>
          ) : joinedEvents.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-md text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">You haven't joined any events yet.</p>
              <Link
                href="/"
                className="inline-block bg-[#0d9488] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0b7a6e] transition-colors"
              >
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {joinedEvents.map((event) => (
                <div key={event.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Event Image with Joined Badge */}
                  <div className="relative h-48">
                    {event.image_url ? (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                        <Calendar className="w-16 h-16 text-white/50" />
                      </div>
                    )}
                    {/* Joined Badge */}
                    <div className="absolute top-3 left-3 bg-[#0d9488] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      Joined
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-1">
                      {event.title}
                    </h3>

                    {/* Date & Time */}
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                      <Calendar className="w-4 h-4 text-[#0d9488]" />
                      <span>{formatEventDate(event.date)}</span>
                    </div>

                    {event.time && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                        <Clock className="w-4 h-4 text-[#0d9488]" />
                        <span>{formatEventTime(event.time)}</span>
                      </div>
                    )}

                    {/* Location */}
                    {event.location_name && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                        <MapPin className="w-4 h-4 text-[#0d9488]" />
                        <span className="line-clamp-1">{event.location_name}</span>
                      </div>
                    )}

                    {/* View Details Button - Orange */}
                    <Link
                      href={`/events/${event.id}`}
                      className="block w-full bg-orange-600 hover:bg-orange-700 text-white text-center py-3 rounded-xl font-semibold transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings Modal */}
        {showSettingsModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Account Settings</h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-3">
                <Link
                  href="/profile/edit"
                  className="flex items-center gap-3 w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 transition-colors"
                >
                  <Settings className="w-5 h-5 text-gray-500" />
                  Edit Profile
                </Link>

                <Link
                  href="/profile/security"
                  className="flex items-center gap-3 w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Security Settings
                </Link>

                <button
                  onClick={async () => {
                    await supabase.auth.signOut()
                    router.push('/')
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 bg-red-50 hover:bg-red-100 rounded-xl text-red-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
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
