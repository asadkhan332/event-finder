# Auth Callback Redirect

Handle post-login callback logic to redirect users to the correct /dashboard.

## Trigger Phrases

- "auth callback redirect"
- "redirect after login"
- "login callback logic"
- "dashboard redirect after auth"
- "/auth-callback"

## Instructions

Implement proper authentication callback handling to redirect users to /dashboard or intended destination after successful login.

### Context Gathering

1. Identify the auth provider (Supabase, NextAuth, Firebase, custom)
2. Determine the framework (Next.js, React, Node.js Express)
3. Check for existing callback routes
4. Identify if role-based redirects are needed (admin vs user dashboards)

### Execution Steps

#### Step 1: Understand Callback Flow

```
User clicks Login
    ↓
Redirect to Auth Provider (Google, etc.)
    ↓
User authenticates
    ↓
Provider redirects to /auth/callback
    ↓
Callback handler processes tokens
    ↓
Redirect to /dashboard (or saved returnUrl)
```

#### Step 2: Implementation by Platform

**For Supabase (Next.js App Router):**

```typescript
// app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'
  const error = requestUrl.searchParams.get('error')

  // Handle auth errors
  if (error) {
    console.error('Auth error:', error)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, requestUrl.origin)
    )
  }

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Exchange code for session
    const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
      console.error('Session error:', sessionError)
      return NextResponse.redirect(
        new URL('/login?error=session_failed', requestUrl.origin)
      )
    }

    // Optional: Role-based redirect
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', requestUrl.origin))
      }
    }

    // Default redirect to dashboard
    return NextResponse.redirect(new URL(next, requestUrl.origin))
  }

  // No code provided, redirect to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin))
}
```

**For Supabase (Next.js Pages Router):**

```typescript
// pages/auth/callback.tsx
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AuthCallback() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleCallback = async () => {
      const { error } = await supabase.auth.getSession()

      if (error) {
        console.error('Auth callback error:', error)
        router.push('/login?error=auth_failed')
        return
      }

      // Get return URL from localStorage or default to dashboard
      const returnUrl = localStorage.getItem('authReturnUrl') || '/dashboard'
      localStorage.removeItem('authReturnUrl')

      router.push(returnUrl)
    }

    handleCallback()
  }, [router, supabase])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4">Completing login...</p>
      </div>
    </div>
  )
}
```

**For NextAuth.js:**

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allow relative URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      // Allow URLs on the same origin
      if (new URL(url).origin === baseUrl) {
        return url
      }
      // Default to dashboard
      return `${baseUrl}/dashboard`
    },
    async session({ session, token }) {
      // Add user role to session for role-based redirects
      if (token.role) {
        session.user.role = token.role
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

**Client-side login with return URL:**

```typescript
// components/LoginButton.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function LoginButton() {
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  const handleLogin = async () => {
    // Save current page as return URL
    const returnUrl = searchParams.get('returnUrl') || '/dashboard'

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(returnUrl)}`,
      },
    })
  }

  return (
    <button onClick={handleLogin} className="btn btn-primary">
      Login with Google
    </button>
  )
}
```

#### Step 3: Middleware for Protected Routes

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isAuthPage = req.nextUrl.pathname.startsWith('/login')
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard')
  const isCallbackRoute = req.nextUrl.pathname.startsWith('/auth/callback')

  // Allow callback route to process
  if (isCallbackRoute) {
    return res
  }

  // Redirect logged-in users away from login page
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Redirect unauthenticated users to login with return URL
  if (isProtectedRoute && !session) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('returnUrl', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/auth/callback'],
}
```

#### Step 4: Error Handling Component

```typescript
// app/login/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { LoginButton } from '@/components/LoginButton'

const errorMessages: Record<string, string> = {
  auth_failed: 'Authentication failed. Please try again.',
  session_failed: 'Could not create session. Please try again.',
  access_denied: 'Access was denied. Please contact support.',
  default: 'An error occurred during login.',
}

export default function LoginPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {error && (
        <div className="alert alert-error mb-4">
          {errorMessages[error] || errorMessages.default}
        </div>
      )}

      <div className="card p-8">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        <LoginButton />
      </div>
    </div>
  )
}
```

### Output Format

Provide implementation with:
- Complete callback route handler code
- Middleware configuration for route protection
- Client-side login component with return URL handling
- Error handling patterns
- Role-based redirect logic if needed

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Redirect loop | Check middleware matcher config, exclude callback route |
| Lost return URL | Store in searchParams, not just localStorage |
| Session not persisting | Verify cookie settings in Supabase client |
| CORS errors | Ensure redirect URIs match exactly in provider config |
| User stuck on callback | Add timeout and fallback redirect |

## Notes

- Always validate redirect URLs to prevent open redirect vulnerabilities
- Use server-side session checks for security
- Handle edge cases: expired sessions, revoked access, network errors
- Consider adding loading states during callback processing
- Log authentication events for debugging
