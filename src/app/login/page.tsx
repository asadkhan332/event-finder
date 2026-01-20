'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff, Calendar, MapPin, Users } from 'lucide-react'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  // Check for existing session and auto-redirect if logged in
  useEffect(() => {
    let cancelled = false

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (cancelled) return

      if (session) {
        window.location.href = '/'
        return
      }
      setIsCheckingSession(false)
    }
    checkSession()

    // No auth state listener to avoid loops
    return () => {
      cancelled = true
    }
  }, []) // Empty dependency array

  useEffect(() => {
    const resetParam = searchParams.get('reset')
    const oauthError = searchParams.get('error')

    if (resetParam === 'success') {
      setSuccessMessage('Password reset successful! Please sign in with your new password.')
      // Clear the URL params without causing a re-render loop
      window.history.replaceState({}, '', '/login')
    }

    if (oauthError) {
      setError(decodeURIComponent(oauthError))
      // Clear the URL params without causing a re-render loop
      window.history.replaceState({}, '', '/login')
    }
  }, [searchParams]) // Removed router from dependencies

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (signInError) {
        throw signInError
      }

      window.location.href = '/'
    } catch (err) {
      console.error('Error signing in:', err)
      setError('Authentication failed. Please check your email and password and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    setError(null)

    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback'
        }
      })

      if (googleError) {
        throw googleError
      }
    } catch (err) {
      console.error('Error signing in with Google:', err)
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google. Please try again.')
      setIsGoogleLoading(false)
    }
  }

  // Show loading state while checking session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-[#1E3A8A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#FBBF24]/30 border-t-[#FBBF24] rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-blue-200">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-2 min-h-screen w-full m-0 p-0 overflow-x-hidden">
      {/* Left Side - Yellow (Two-Tone) */}
      <div className="hidden lg:flex bg-[#FBBF24] items-center justify-center p-0 m-0 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-300/40 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-500/30 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-200/30 rounded-full blur-2xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-12 xl:px-16 py-12 max-w-xl">
          <div className="mb-8">
            <span className="text-[#1E3A8A] text-lg font-semibold tracking-wide uppercase">Welcome to</span>
            <h1 className="text-5xl xl:text-6xl font-extrabold text-[#1E3A8A] mt-2 leading-tight">
              Pakistan&apos;s<br />Event Portal
            </h1>
          </div>

          <p className="text-xl text-[#1E40AF] max-w-md leading-relaxed mb-10">
            Login to explore food festivals, concerts, and tech meetups across the country.
          </p>

          {/* Feature Highlights */}
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#1E3A8A] rounded-2xl flex items-center justify-center shadow-lg">
                <Calendar size={26} className="text-[#FBBF24]" />
              </div>
              <span className="text-lg font-bold text-[#1E3A8A]">Discover Events Daily</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#1E3A8A] rounded-2xl flex items-center justify-center shadow-lg">
                <MapPin size={26} className="text-[#FBBF24]" />
              </div>
              <span className="text-lg font-bold text-[#1E3A8A]">Events Across Pakistan</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#1E3A8A] rounded-2xl flex items-center justify-center shadow-lg">
                <Users size={26} className="text-[#FBBF24]" />
              </div>
              <span className="text-lg font-bold text-[#1E3A8A]">Join a Vibrant Community</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Deep Blue (Two-Tone) */}
      <div className="bg-[#1E3A8A] flex flex-col m-0 p-0 min-h-screen lg:min-h-0">
        {/* Mobile Header - Yellow */}
        <div className="lg:hidden bg-[#FBBF24] px-6 py-8 text-center m-0">
          <h1 className="text-2xl font-extrabold text-[#1E3A8A]">Pakistan&apos;s Event Portal</h1>
          <p className="text-[#1E40AF] text-sm mt-2 font-medium">Explore events across the country</p>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-10">
          <div className="w-full max-w-md">
            {/* Header for Desktop */}
            <div className="hidden lg:block text-center mb-8">
              <h2 className="text-3xl font-bold text-[#FBBF24]">
                Welcome Back!
              </h2>
              <p className="text-blue-200 mt-2">
                Sign in to continue your journey
              </p>
            </div>

            {/* Login Card */}
            <div className="bg-[#1E40AF]/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-blue-400/20">
              <h3 className="text-xl font-bold text-[#FBBF24] text-center mb-6 lg:hidden">
                Sign In
              </h3>

              {successMessage && (
                <div className="mb-6 p-4 bg-teal-900/40 border border-teal-400 rounded-xl flex items-center gap-3">
                  <svg className="w-5 h-5 text-teal-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-teal-200 text-sm">{successMessage}</p>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-900/40 border border-red-400 rounded-xl">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-blue-100 mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#1E3A8A] text-white border border-blue-400/40 rounded-xl focus:ring-2 focus:ring-[#FBBF24] focus:border-[#FBBF24] placeholder-blue-300/50 outline-none transition-all"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-blue-100 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pr-12 bg-[#1E3A8A] text-white border border-blue-400/40 rounded-xl focus:ring-2 focus:ring-[#FBBF24] focus:border-[#FBBF24] placeholder-blue-300/50 outline-none transition-all"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-[#FBBF24] z-10 p-1 cursor-pointer transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-[#FCD34D] hover:text-[#FBBF24] hover:underline mt-2 inline-block font-medium">
                    Forgot Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#FBBF24] text-[#1E3A8A] py-3.5 px-6 rounded-xl font-bold text-lg hover:bg-[#F59E0B] focus:outline-none focus:ring-2 focus:ring-[#FBBF24] focus:ring-offset-2 focus:ring-offset-[#1E40AF] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#1E3A8A]/30 border-t-[#1E3A8A] rounded-full animate-spin"></div>
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-blue-400/30"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#1E40AF]/50 text-blue-200">
                    or continue with
                  </span>
                </div>
              </div>

              {/* Google Login Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 py-3.5 px-6 rounded-xl font-semibold text-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#1E40AF] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              >
                {isGoogleLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                    Connecting...
                  </span>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Login with Google
                  </>
                )}
              </button>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-blue-400/30"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-[#1E40AF]/50 text-blue-200">
                      New to our platform?
                    </span>
                  </div>
                </div>

                <Link
                  href="/signup"
                  className="mt-6 w-full flex items-center justify-center py-3.5 px-6 border-2 border-[#FBBF24] text-[#FBBF24] rounded-xl font-bold text-lg hover:bg-[#FBBF24] hover:text-[#1E3A8A] transition-all transform hover:scale-[1.02]"
                >
                  Create an Account
                </Link>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-sm text-blue-300/70 mt-8">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1E3A8A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#FBBF24]/30 border-t-[#FBBF24] rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-blue-200">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
