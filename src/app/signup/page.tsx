'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff, Calendar, MapPin, Users } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName
          }
        }
      })

      if (signUpError) {
        throw signUpError
      }

      setSuccess(true)
    } catch (err) {
      console.error('Error signing up:', err)
      setError(err instanceof Error ? err.message : 'Failed to sign up. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#1E3A8A]">
        <div className="max-w-md w-full mx-4">
          <div className="bg-[#1E40AF]/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center border border-blue-400/20">
            <div className="mx-auto w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
            <p className="text-gray-300 mb-6">
              We&apos;ve sent a confirmation link to <strong className="text-white">{formData.email}</strong>.
              Please check your inbox and click the link to activate your account.
            </p>
            <Link
              href="/login"
              className="inline-block bg-[#FBBF24] text-[#1E3A8A] py-3 px-6 rounded-xl font-bold hover:bg-[#F59E0B] transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              Go to Login
            </Link>
          </div>
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
            <span className="text-[#1E3A8A] text-lg font-semibold tracking-wide uppercase">Join</span>
            <h1 className="text-5xl xl:text-6xl font-extrabold text-[#1E3A8A] mt-2 leading-tight">
              Pakistan&apos;s<br />Event Portal
            </h1>
          </div>

          <p className="text-xl text-[#1E40AF] max-w-md leading-relaxed mb-10">
            Create an account to discover food festivals, concerts, and tech meetups across the country.
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

      {/* Right Side - Signup Form */}
      <div className="bg-[#1E3A8A] flex flex-col m-0 p-0 min-h-screen lg:min-h-0">
        {/* Mobile Header - Yellow */}
        <div className="lg:hidden bg-[#FBBF24] px-6 py-8 text-center m-0">
          <h1 className="text-2xl font-extrabold text-[#1E3A8A]">Pakistan&apos;s Event Portal</h1>
          <p className="text-[#1E40AF] text-sm mt-2 font-medium">Create your account today</p>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-10">
          <div className="w-full max-w-md">
            {/* Header for Desktop */}
            <div className="hidden lg:block text-center mb-8">
              <h2 className="text-3xl font-bold text-[#FBBF24]">
                Create Account
              </h2>
              <p className="text-blue-200 mt-2">
                Join us and start exploring events
              </p>
            </div>

            {/* Signup Card */}
            <div className="bg-[#1E40AF]/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-blue-400/20">
              <h3 className="text-xl font-bold text-[#FBBF24] text-center mb-6 lg:hidden">
                Sign Up
              </h3>

              {error && (
                <div className="mb-6 p-4 bg-red-900/40 border border-red-400 rounded-xl">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-blue-100 mb-2">
                    Full name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#1E3A8A] text-white border border-blue-400/40 rounded-xl focus:ring-2 focus:ring-[#FBBF24] focus:border-[#FBBF24] placeholder-blue-300/50 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>

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
                      placeholder="At least 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-[#FBBF24] z-10 p-1 cursor-pointer transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-blue-100 mb-2">
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pr-12 bg-[#1E3A8A] text-white border border-blue-400/40 rounded-xl focus:ring-2 focus:ring-[#FBBF24] focus:border-[#FBBF24] placeholder-blue-300/50 outline-none transition-all"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-[#FBBF24] z-10 p-1 cursor-pointer transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#FBBF24] text-[#1E3A8A] py-3.5 px-6 rounded-xl font-bold text-lg hover:bg-[#F59E0B] focus:outline-none focus:ring-2 focus:ring-[#FBBF24] focus:ring-offset-2 focus:ring-offset-[#1E40AF] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#1E3A8A]/30 border-t-[#1E3A8A] rounded-full animate-spin"></div>
                      Creating account...
                    </span>
                  ) : (
                    'Sign Up'
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
                    Already have an account?
                  </span>
                </div>
              </div>

              <Link
                href="/login"
                className="mt-6 w-full flex items-center justify-center py-3.5 px-6 border-2 border-[#FBBF24] text-[#FBBF24] rounded-xl font-bold text-lg hover:bg-[#FBBF24] hover:text-[#1E3A8A] transition-all transform hover:scale-[1.02]"
              >
                Sign In
              </Link>
            </div>

            {/* Footer */}
            <p className="text-center text-sm text-blue-300/70 mt-8">
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
