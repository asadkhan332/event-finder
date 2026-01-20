'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Mail, ArrowLeft, Shield } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:3000/reset-password'
      })

      if (resetError) {
        throw resetError
      }

      setSuccess(true)
    } catch (err) {
      console.error('Error sending reset email:', err)
      setError(err instanceof Error ? err.message : 'Failed to send reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full h-screen flex">
      {/* Left Side - Vibrant Gradient */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-yellow-400 to-orange-600 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-300/20 rounded-full blur-2xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="mb-8">
            <span className="text-white text-lg font-semibold tracking-wide uppercase drop-shadow-md">Account Recovery</span>
            <h1 className="text-5xl xl:text-6xl font-extrabold text-white mt-2 leading-tight [text-shadow:_2px_2px_8px_rgb(0_0_0_/_40%)]">
              Reset Your<br />Password
            </h1>
          </div>

          <p className="text-xl text-white max-w-md leading-relaxed mb-10 drop-shadow-md">
            Don&apos;t worry, it happens to the best of us. We&apos;ll help you get back into your account.
          </p>

          {/* Security Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-white">
              <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <Mail size={24} />
              </div>
              <span className="text-lg font-semibold drop-shadow-md">Check Your Email</span>
            </div>
            <div className="flex items-center gap-4 text-white">
              <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <Shield size={24} />
              </div>
              <span className="text-lg font-semibold drop-shadow-md">Secure Reset Process</span>
            </div>
            <div className="flex items-center gap-4 text-white">
              <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <ArrowLeft size={24} />
              </div>
              <span className="text-lg font-semibold drop-shadow-md">Quick & Easy Recovery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:flex-1 flex flex-col bg-[#0B1120]">
        {/* Mobile Header with Gradient */}
        <div className="lg:hidden bg-gradient-to-r from-yellow-400 to-orange-600 px-6 py-8 text-center">
          <h1 className="text-2xl font-extrabold text-white">Reset Password</h1>
          <p className="text-white/90 text-sm mt-2">We&apos;ll send you a reset link</p>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 sm:px-12 py-12">
          <div className="w-full max-w-md">
            {/* Logo/Brand for Desktop */}
            <div className="hidden lg:block text-center mb-8">
              <h2 className="text-3xl font-bold text-white">
                Forgot Password?
              </h2>
              <p className="text-gray-400 mt-2">
                Enter your email and we&apos;ll send you a reset link
              </p>
            </div>

            {/* Card */}
            <div className="bg-[#141d2f] rounded-2xl shadow-xl p-8 border border-gray-700/50">
              <h3 className="text-xl font-bold text-white text-center mb-6 lg:hidden">
                Reset Password
              </h3>

              {error && (
                <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-xl">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {success ? (
                <div className="text-center">
                  <div className="mb-6 p-6 bg-teal-900/30 border border-teal-700 rounded-xl">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-teal-900/50 rounded-full flex items-center justify-center">
                        <Mail size={32} className="text-teal-400" />
                      </div>
                    </div>
                    <p className="text-teal-300 font-semibold text-lg">
                      Check your email!
                    </p>
                    <p className="text-teal-400/80 text-sm mt-2">
                      We&apos;ve sent a password reset link to <strong className="text-white">{email}</strong>
                    </p>
                    <p className="text-gray-500 text-xs mt-3">
                      If you don&apos;t see it, check your spam folder.
                    </p>
                  </div>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 font-medium transition-colors"
                  >
                    <ArrowLeft size={18} />
                    Back to Login
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-[#1a2438] text-white border border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder-gray-500 outline-none transition-all"
                      placeholder="you@example.com"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-600 text-white py-3.5 px-6 rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#141d2f] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Sending...
                      </span>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-[#141d2f] text-gray-400">
                        Remember your password?
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/login"
                    className="w-full flex items-center justify-center py-3.5 px-6 border-2 border-orange-500 text-orange-400 rounded-xl font-bold text-lg hover:bg-orange-500 hover:text-white transition-all transform hover:scale-[1.02]"
                  >
                    Back to Sign In
                  </Link>
                </form>
              )}
            </div>

            {/* Footer */}
            <p className="text-center text-sm text-gray-500 mt-8">
              Need help? Contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
