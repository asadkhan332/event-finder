'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Compass, CalendarPlus, Loader2 } from 'lucide-react'
import { User } from '@supabase/supabase-js'
import { UserRole, Profile } from '@/lib/database.types'

export default function RoleSelectionPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      // Check if user already has a role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle() as { data: Pick<Profile, 'role'> | null }

      if (profile?.role) {
        // User already has a role, redirect accordingly
        if (profile.role === 'host') {
          router.push('/dashboard/host')
        } else {
          router.push('/')
        }
        return
      }

      setUser(session.user)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const handleRoleSelect = async (role: 'seeker' | 'host') => {
    if (!user || updating) return

    setUpdating(true)
    setSelectedRole(role)

    try {
      const { error } = await (supabase
        .from('profiles') as any)
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (error) {
        console.error('Error updating role:', error)
        alert('Failed to update role. Please try again.')
        setUpdating(false)
        setSelectedRole(null)
        return
      }

      // Redirect based on role
      if (role === 'host') {
        router.push('/dashboard/host')
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred. Please try again.')
      setUpdating(false)
      setSelectedRole(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d9488]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How will you use EventFinder?
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Choose your role to personalize your experience. You can always change this later.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Experience Seeker Card */}
          <button
            onClick={() => handleRoleSelect('seeker')}
            disabled={updating}
            className={`group relative bg-teal-50 border-2 rounded-3xl p-8 text-left transition-all duration-300
              ${updating && selectedRole === 'seeker'
                ? 'border-teal-500 ring-4 ring-teal-200'
                : 'border-teal-200 hover:border-teal-400 hover:shadow-xl hover:shadow-teal-100 hover:-translate-y-1'
              }
              ${updating && selectedRole !== 'seeker' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {/* Icon Container */}
            <div className="w-20 h-20 bg-teal-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-teal-200 transition-colors">
              {updating && selectedRole === 'seeker' ? (
                <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
              ) : (
                <Compass className="w-10 h-10 text-teal-600" />
              )}
            </div>

            {/* Content */}
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Experience Seeker
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Explore and attend Karachi&apos;s best events. Discover concerts, workshops, meetups, and more happening near you.
            </p>

            {/* Features */}
            <ul className="mt-6 space-y-2">
              <li className="flex items-center gap-2 text-teal-700">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                Browse local events
              </li>
              <li className="flex items-center gap-2 text-teal-700">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                RSVP and join events
              </li>
              <li className="flex items-center gap-2 text-teal-700">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                Save favorites
              </li>
            </ul>

            {/* Selection Indicator */}
            <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 transition-all
              ${updating && selectedRole === 'seeker'
                ? 'bg-teal-500 border-teal-500'
                : 'border-teal-300 group-hover:border-teal-500'
              }
            `}>
              {updating && selectedRole === 'seeker' && (
                <svg className="w-full h-full text-white p-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </button>

          {/* Event Host Card */}
          <button
            onClick={() => handleRoleSelect('host')}
            disabled={updating}
            className={`group relative bg-orange-50 border-2 rounded-3xl p-8 text-left transition-all duration-300
              ${updating && selectedRole === 'host'
                ? 'border-orange-500 ring-4 ring-orange-200'
                : 'border-orange-200 hover:border-orange-400 hover:shadow-xl hover:shadow-orange-100 hover:-translate-y-1'
              }
              ${updating && selectedRole !== 'host' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {/* Icon Container */}
            <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-200 transition-colors">
              {updating && selectedRole === 'host' ? (
                <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
              ) : (
                <CalendarPlus className="w-10 h-10 text-orange-600" />
              )}
            </div>

            {/* Content */}
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Event Host
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Create and manage your own events. Build your audience and share your experiences with the community.
            </p>

            {/* Features */}
            <ul className="mt-6 space-y-2">
              <li className="flex items-center gap-2 text-orange-700">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                Create unlimited events
              </li>
              <li className="flex items-center gap-2 text-orange-700">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                Manage attendees
              </li>
              <li className="flex items-center gap-2 text-orange-700">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                Host dashboard
              </li>
            </ul>

            {/* Selection Indicator */}
            <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 transition-all
              ${updating && selectedRole === 'host'
                ? 'bg-orange-500 border-orange-500'
                : 'border-orange-300 group-hover:border-orange-500'
              }
            `}>
              {updating && selectedRole === 'host' && (
                <svg className="w-full h-full text-white p-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-center text-gray-500 mt-8 text-sm">
          Both roles can browse and attend events. Hosts get additional tools to create and manage events.
        </p>
      </div>
    </div>
  )
}
