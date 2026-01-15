'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Session } from '@supabase/supabase-js'

export default function Navbar() {
  const [session, setSession] = useState<Session | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchUserName(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        if (session?.user) {
          fetchUserName(session.user.id)
        } else {
          setUserName(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserName = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single()

    setUserName(data?.full_name || null)
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/">
              <h1 className="text-3xl font-bold text-gray-900">Local Event Finder</h1>
            </Link>
            <p className="mt-2 text-gray-600">Discover events happening near you</p>
          </div>
          <nav className="flex items-center gap-4">
            {loading ? (
              <div className="w-24 h-8 bg-gray-200 animate-pulse rounded" />
            ) : session ? (
              <>
                <Link
                  href="/profile"
                  className="text-gray-700 hover:text-gray-900 font-medium flex items-center gap-2"
                >
                  <span className="text-gray-500">Hello,</span>
                  <span className="font-semibold">{userName || session.user.email?.split('@')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-200 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
            <Link
              href="/events/new"
              className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Create Event
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
