'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User, LayoutDashboard, Calendar, Plus, LogOut, Settings } from 'lucide-react'

// Minimal session type to avoid importing heavy types
type MinimalSession = {
  user: {
    id: string
    email?: string
  }
} | null

export default function Navbar() {
  const [session, setSession] = useState<MinimalSession>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Prevent double initialization
  const hasInitialized = useRef(false)
  const currentUserId = useRef<string | null>(null)

  // Single initialization - runs ONCE only
  useEffect(() => {
    // Guard against double execution
    if (hasInitialized.current) return
    hasInitialized.current = true

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        const currentSession = data?.session

        // Only update if we have a new user ID
        const newUserId = currentSession?.user?.id || null
        if (newUserId === currentUserId.current) {
          setLoading(false)
          return
        }

        currentUserId.current = newUserId

        if (currentSession?.user) {
          setSession({
            user: {
              id: currentSession.user.id,
              email: currentSession.user.email
            }
          })

          // Fetch profile
          const { data: profileData } = await (supabase.from('profiles') as any)
            .select('full_name, avatar_url')
            .eq('id', currentSession.user.id)
            .single()

          if (profileData) {
            setUserName(profileData.full_name || null)
            setAvatarUrl(profileData.avatar_url || null)
          }
        }
      } catch (error) {
        console.error('Navbar init error:', error)
      }

      setLoading(false)
    }

    init()

    // NO cleanup, NO auth listeners, NO dependencies
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Logout - uses window.location for clean redirect
  const handleLogout = async () => {
    setIsDropdownOpen(false)
    setIsMobileMenuOpen(false)
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const closeMenus = () => {
    setIsDropdownOpen(false)
    setIsMobileMenuOpen(false)
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const getLinkClasses = (href: string) => {
    const base = 'font-medium transition-all duration-200'
    if (isActive(href)) {
      return `${base} text-[#008080] drop-shadow-[0_0_8px_rgba(0,128,128,0.5)]`
    }
    return `${base} text-white/80 hover:text-[#008080]`
  }

  return (
    <header className="sticky top-0 z-[100] bg-[#0B1120]/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo with Yellow-Orange Gradient */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center group" onClick={closeMenus}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-[#FBBF24] to-[#F97316] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 group-hover:scale-105 transition-all duration-300">
                  <svg className="w-6 h-6 text-[#0B1120]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#FBBF24] to-[#F97316] bg-clip-text text-transparent drop-shadow-sm">
                  Event Finder
                </h1>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-7">
            {loading ? (
              <div className="flex items-center gap-4">
                <div className="w-20 h-8 bg-white/5 animate-pulse rounded-lg" />
                <div className="w-24 h-10 bg-white/5 animate-pulse rounded-xl" />
              </div>
            ) : session ? (
              <>
                <Link href="/" className={getLinkClasses('/')}>
                  Explore
                </Link>
                <Link href="/dashboard" className={getLinkClasses('/dashboard')}>
                  Dashboard
                </Link>

                {/* User Dropdown with Teal Border */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2.5 px-3 py-2 text-white hover:bg-white/5 rounded-xl transition-all duration-200"
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover border-2 border-[#008080] shadow-[0_0_12px_rgba(0,128,128,0.4)]"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-[#FBBF24] to-[#F97316] rounded-full flex items-center justify-center text-[#0B1120] text-sm font-bold border-2 border-[#008080] shadow-[0_0_12px_rgba(0,128,128,0.4)]">
                        {userName?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="font-medium max-w-[120px] truncate text-white/90">
                      {userName || session.user.email?.split('@')[0]}
                    </span>
                    <svg
                      className={`w-4 h-4 text-white/60 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu - Professional White Theme */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 w-64 mt-2 origin-top-right bg-white rounded-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.2)] ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
                      {/* Header Section with Avatar, Name, Email */}
                      <div className="flex items-center p-4 border-b border-gray-100">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover border-2 border-orange-200"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-[#FBBF24] to-[#F97316] rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {userName?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {userName || 'User'}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {session.user.email}
                          </p>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <Link
                          href="/profile"
                          onClick={closeMenus}
                          className="group flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User className="mr-3 h-5 w-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                          Profile
                        </Link>

                        <Link
                          href="/dashboard"
                          onClick={closeMenus}
                          className="group flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <LayoutDashboard className="mr-3 h-5 w-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                          Dashboard
                        </Link>

                        <Link
                          href="/events/new"
                          onClick={closeMenus}
                          className="group flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="mr-3 h-5 w-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                          Create Event
                        </Link>
                      </div>

                      {/* Logout Button - Separated */}
                      <div className="border-t border-gray-100">
                        <button
                          onClick={handleLogout}
                          className="group flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                        >
                          <LogOut className="mr-3 h-5 w-5" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Create Event CTA */}
                <Link
                  href="/events/new"
                  className="bg-gradient-to-r from-[#FBBF24] to-[#F97316] text-[#0B1120] px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/25 hover:-translate-y-0.5 transition-all duration-300"
                >
                  + Create Event
                </Link>
              </>
            ) : (
              <>
                <Link href="/" className={getLinkClasses('/')}>
                  Explore
                </Link>
                <Link href="/login" className={getLinkClasses('/login')}>
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2.5 bg-gradient-to-r from-[#FBBF24] to-[#F97316] text-[#0B1120] rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/25 hover:-translate-y-0.5 transition-all duration-300"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 py-4 -mx-4 px-4 sm:-mx-6 sm:px-6">
            {loading ? (
              <div className="space-y-3">
                <div className="w-full h-14 bg-white/5 animate-pulse rounded-xl" />
                <div className="w-full h-12 bg-white/5 animate-pulse rounded-xl" />
              </div>
            ) : session ? (
              <div className="space-y-2">
                {/* User Card */}
                <div className="flex items-center gap-3 px-4 py-4 bg-gradient-to-r from-[#008080]/10 to-transparent rounded-xl mb-4 border border-white/5">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#008080] shadow-[0_0_12px_rgba(0,128,128,0.4)]"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-[#FBBF24] to-[#F97316] rounded-full flex items-center justify-center text-[#0B1120] text-lg font-bold border-2 border-[#008080] shadow-[0_0_12px_rgba(0,128,128,0.4)]">
                      {userName?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{userName || 'User'}</p>
                    <p className="text-sm text-white/50 truncate">{session.user.email}</p>
                  </div>
                </div>

                <Link
                  href="/"
                  onClick={closeMenus}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/') ? 'bg-[#008080]/15 text-[#008080]' : 'text-white/80 hover:bg-white/5'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Explore Events
                </Link>

                <Link
                  href="/profile"
                  onClick={closeMenus}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/profile') ? 'bg-[#008080]/15 text-[#008080]' : 'text-white/80 hover:bg-white/5'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </Link>

                <Link
                  href="/dashboard"
                  onClick={closeMenus}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/dashboard') ? 'bg-[#008080]/15 text-[#008080]' : 'text-white/80 hover:bg-white/5'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  My Events
                </Link>

                <Link
                  href="/events/new"
                  onClick={closeMenus}
                  className="flex items-center justify-center gap-2 px-4 py-3 mt-3 bg-gradient-to-r from-[#FBBF24] to-[#F97316] text-[#0B1120] rounded-xl font-semibold shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Event
                </Link>

                <div className="border-t border-white/5 mt-4 pt-4">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/"
                  onClick={closeMenus}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/') ? 'bg-[#008080]/15 text-[#008080]' : 'text-white/80 hover:bg-white/5'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Explore Events
                </Link>
                <Link
                  href="/login"
                  onClick={closeMenus}
                  className={`block px-4 py-3 rounded-xl font-medium transition-all ${isActive('/login') ? 'bg-[#008080]/15 text-[#008080]' : 'text-white/80 hover:bg-white/5'}`}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={closeMenus}
                  className="block px-4 py-3 bg-gradient-to-r from-[#FBBF24] to-[#F97316] text-[#0B1120] rounded-xl font-semibold text-center shadow-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
