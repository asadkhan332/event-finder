# Middleware Protection

Secure routes to prevent unauthorized access to private pages without login.

## Trigger Phrases

- "protect routes with middleware"
- "secure private pages"
- "middleware authentication"
- "route protection setup"
- "/middleware-protection"

## Instructions

Implement middleware to protect routes and ensure only authenticated users can access private pages.

### Context Gathering

1. Identify the framework (Next.js App Router / Pages Router)
2. Determine auth provider (Supabase, NextAuth, custom)
3. List public vs protected routes
4. Check for role-based access requirements

### Execution Steps

#### Step 1: Route Protection Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    REQUEST FLOW                                  │
├─────────────────────────────────────────────────────────────────┤
│  User Request                                                    │
│       ↓                                                          │
│  Middleware (runs on Edge)                                       │
│       ↓                                                          │
│  ┌─────────────────────────────────────────────┐                │
│  │ Check Route Type                             │                │
│  │  ├── Public Route → Allow                    │                │
│  │  ├── Auth Route (login) → Redirect if logged │                │
│  │  └── Protected Route → Check Session         │                │
│  │       ├── Has Session → Allow                │                │
│  │       └── No Session → Redirect to Login     │                │
│  └─────────────────────────────────────────────┘                │
│       ↓                                                          │
│  Page / API Route                                                │
└─────────────────────────────────────────────────────────────────┘
```

**Route Categories:**
```typescript
// Public routes - accessible to everyone
const publicRoutes = ['/', '/events', '/events/[slug]', '/about', '/contact']

// Auth routes - only for non-authenticated users
const authRoutes = ['/login', '/signup', '/forgot-password', '/auth/callback']

// Protected routes - require authentication
const protectedRoutes = ['/dashboard', '/profile', '/my-events', '/settings']

// Admin routes - require admin role
const adminRoutes = ['/admin', '/admin/users', '/admin/events']

// Organizer routes - require organizer role
const organizerRoutes = ['/organizer', '/organizer/events', '/organizer/analytics']
```

#### Step 2: Basic Middleware (Supabase + Next.js App Router)

```typescript
// middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if exists
  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl

  // Define route patterns
  const isAuthRoute = pathname.startsWith('/login') ||
                      pathname.startsWith('/signup') ||
                      pathname.startsWith('/forgot-password')

  const isProtectedRoute = pathname.startsWith('/dashboard') ||
                           pathname.startsWith('/profile') ||
                           pathname.startsWith('/my-events') ||
                           pathname.startsWith('/settings')

  const isAuthCallback = pathname.startsWith('/auth/callback')

  // Allow auth callback to process
  if (isAuthCallback) {
    return response
  }

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('returnUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

#### Step 3: Advanced Middleware with Role-Based Access

```typescript
// middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Route configuration
const routeConfig = {
  // Public routes - no auth required
  public: [
    '/',
    '/events',
    '/events/(.*)',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
  ],

  // Auth routes - only for non-authenticated
  auth: [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/auth/callback',
    '/auth/verify',
  ],

  // Protected routes - any authenticated user
  protected: [
    '/dashboard',
    '/profile',
    '/profile/(.*)',
    '/my-events',
    '/my-events/(.*)',
    '/settings',
    '/settings/(.*)',
  ],

  // Role-specific routes
  roles: {
    admin: [
      '/admin',
      '/admin/(.*)',
    ],
    organizer: [
      '/organizer',
      '/organizer/(.*)',
      '/create-event',
    ],
  },
}

// Helper to check if path matches patterns
function matchesPattern(pathname: string, patterns: string[]): boolean {
  return patterns.some(pattern => {
    const regex = new RegExp(`^${pattern.replace(/\(.*\)/g, '.*')}$`)
    return regex.test(pathname)
  })
}

// Helper to get route type
function getRouteType(pathname: string): {
  type: 'public' | 'auth' | 'protected' | 'role'
  requiredRole?: string
} {
  if (matchesPattern(pathname, routeConfig.public)) {
    return { type: 'public' }
  }

  if (matchesPattern(pathname, routeConfig.auth)) {
    return { type: 'auth' }
  }

  // Check role-specific routes
  for (const [role, patterns] of Object.entries(routeConfig.roles)) {
    if (matchesPattern(pathname, patterns)) {
      return { type: 'role', requiredRole: role }
    }
  }

  if (matchesPattern(pathname, routeConfig.protected)) {
    return { type: 'protected' }
  }

  // Default to public for unmatched routes
  return { type: 'public' }
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Get session
  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl
  const routeInfo = getRouteType(pathname)

  // Handle based on route type
  switch (routeInfo.type) {
    case 'public':
      // Allow access
      return response

    case 'auth':
      // Redirect to dashboard if already logged in
      if (session) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      return response

    case 'protected':
      // Redirect to login if not authenticated
      if (!session) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('returnUrl', pathname)
        return NextResponse.redirect(loginUrl)
      }
      return response

    case 'role':
      // Check authentication first
      if (!session) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('returnUrl', pathname)
        return NextResponse.redirect(loginUrl)
      }

      // Get user role from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      const userRole = profile?.role || 'user'
      const requiredRole = routeInfo.requiredRole

      // Check role permission
      const roleHierarchy = ['user', 'organizer', 'admin']
      const userRoleIndex = roleHierarchy.indexOf(userRole)
      const requiredRoleIndex = roleHierarchy.indexOf(requiredRole || 'user')

      if (userRoleIndex < requiredRoleIndex) {
        // User doesn't have required role
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }

      return response

    default:
      return response
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

#### Step 4: Middleware with Session Caching

```typescript
// middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Cache session check results for performance
const sessionCache = new Map<string, { session: any; timestamp: number }>()
const CACHE_TTL = 60 * 1000 // 1 minute

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Get session (with caching for performance)
  const accessToken = request.cookies.get('sb-access-token')?.value
  const cacheKey = accessToken ? `session:${accessToken.substring(0, 20)}` : 'no-session'

  let session = null
  const cached = sessionCache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    session = cached.session
  } else {
    const { data } = await supabase.auth.getSession()
    session = data.session
    sessionCache.set(cacheKey, { session, timestamp: Date.now() })
  }

  const { pathname } = request.nextUrl

  // Quick path checks
  const isAuthRoute = /^\/(login|signup|forgot-password|auth\/)/.test(pathname)
  const isProtectedRoute = /^\/(dashboard|profile|my-events|settings|organizer|admin)/.test(pathname)
  const isAdminRoute = pathname.startsWith('/admin')
  const isOrganizerRoute = pathname.startsWith('/organizer')

  // Auth routes - redirect if logged in
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Protected routes - redirect if not logged in
  if (isProtectedRoute && !session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('returnUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based routes
  if ((isAdminRoute || isOrganizerRoute) && session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    const role = profile?.role || 'user'

    if (isAdminRoute && role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    if (isOrganizerRoute && !['organizer', 'admin'].includes(role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

#### Step 5: API Route Protection

```typescript
// lib/auth/api-middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function getServerSession() {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session }, error } = await supabase.auth.getSession()

  return { session, error, supabase }
}

// Wrapper for protected API routes
export function withAuth(
  handler: (
    request: Request,
    context: { session: any; supabase: any; user: any }
  ) => Promise<Response>
) {
  return async (request: Request) => {
    const { session, supabase } = await getServerSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return handler(request, {
      session,
      supabase,
      user: session.user,
    })
  }
}

// Wrapper for role-protected API routes
export function withRole(
  allowedRoles: string[],
  handler: (
    request: Request,
    context: { session: any; supabase: any; user: any; profile: any }
  ) => Promise<Response>
) {
  return async (request: Request) => {
    const { session, supabase } = await getServerSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile with role
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (error || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    if (!allowedRoles.includes(profile.role)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    return handler(request, {
      session,
      supabase,
      user: session.user,
      profile,
    })
  }
}
```

**Using API Protection:**
```typescript
// app/api/events/route.ts
import { withAuth, withRole } from '@/lib/auth/api-middleware'
import { NextResponse } from 'next/server'

// Protected route - any authenticated user
export const GET = withAuth(async (request, { supabase, user }) => {
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('organizer_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(events)
})

// Organizer only route
export const POST = withRole(['organizer', 'admin'], async (request, { supabase, user }) => {
  const body = await request.json()

  const { data, error } = await supabase
    .from('events')
    .insert({ ...body, organizer_id: user.id })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
})

// app/api/admin/users/route.ts
import { withRole } from '@/lib/auth/api-middleware'

// Admin only route
export const GET = withRole(['admin'], async (request, { supabase }) => {
  const { data: users, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(users)
})
```

#### Step 6: Server Component Protection

```typescript
// lib/auth/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function getSession() {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  return { session, supabase }
}

// Require auth - redirect to login if not authenticated
export async function requireAuth(returnUrl?: string) {
  const { session, supabase } = await getSession()

  if (!session) {
    const url = returnUrl ? `/login?returnUrl=${encodeURIComponent(returnUrl)}` : '/login'
    redirect(url)
  }

  return { session, supabase, user: session.user }
}

// Require specific role
export async function requireRole(allowedRoles: string[], returnUrl?: string) {
  const { session, supabase, user } = await requireAuth(returnUrl)

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || !allowedRoles.includes(profile.role)) {
    redirect('/unauthorized')
  }

  return { session, supabase, user, profile }
}

// Redirect if authenticated (for login/signup pages)
export async function redirectIfAuthenticated(redirectTo = '/dashboard') {
  const { session } = await getSession()

  if (session) {
    redirect(redirectTo)
  }
}
```

**Using in Server Components:**
```typescript
// app/dashboard/page.tsx
import { requireAuth } from '@/lib/auth/server'

export default async function DashboardPage() {
  const { user, supabase } = await requireAuth('/dashboard')

  // Fetch user-specific data
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('organizer_id', user.id)

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <EventList events={events} />
    </div>
  )
}

// app/admin/page.tsx
import { requireRole } from '@/lib/auth/server'

export default async function AdminPage() {
  const { profile, supabase } = await requireRole(['admin'], '/admin')

  const { data: stats } = await supabase.rpc('get_admin_stats')

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {profile.full_name}</p>
      <AdminStats stats={stats} />
    </div>
  )
}

// app/login/page.tsx
import { redirectIfAuthenticated } from '@/lib/auth/server'
import LoginForm from '@/components/LoginForm'

export default async function LoginPage() {
  await redirectIfAuthenticated()

  return <LoginForm />
}
```

#### Step 7: Client-Side Protection (Fallback)

```typescript
// components/ProtectedRoute.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
  fallback?: React.ReactNode
}

export function ProtectedRoute({
  children,
  allowedRoles,
  fallback = <LoadingSpinner />
}: ProtectedRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`)
        return
      }

      if (allowedRoles && allowedRoles.length > 0) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (!profile || !allowedRoles.includes(profile.role)) {
          router.push('/unauthorized')
          return
        }
      }

      setIsAuthorized(true)
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          router.push('/login')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, router, pathname, allowedRoles])

  if (isAuthorized === null) {
    return fallback
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}

// Loading spinner component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
```

**Using Client Protection:**
```typescript
// app/dashboard/layout.tsx
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="dashboard-layout">
        <Sidebar />
        <main>{children}</main>
      </div>
    </ProtectedRoute>
  )
}

// app/admin/layout.tsx
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="admin-layout">
        <AdminSidebar />
        <main>{children}</main>
      </div>
    </ProtectedRoute>
  )
}
```

#### Step 8: Auth Context Provider

```typescript
// contexts/AuthContext.tsx
'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { User, Session } from '@supabase/supabase-js'

interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isOrganizer: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClientComponentClient()

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    setProfile(data)
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }

        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  const value: AuthContextType = {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: !!session,
    isAdmin: profile?.role === 'admin',
    isOrganizer: ['organizer', 'admin'].includes(profile?.role || ''),
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

**Using Auth Context:**
```typescript
// components/Navbar.tsx
'use client'

import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export function Navbar() {
  const { isAuthenticated, isAdmin, isOrganizer, profile, signOut } = useAuth()

  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/events">Events</Link>

      {isAuthenticated ? (
        <>
          <Link href="/dashboard">Dashboard</Link>
          {isOrganizer && <Link href="/organizer">Organizer Panel</Link>}
          {isAdmin && <Link href="/admin">Admin Panel</Link>}
          <span>{profile?.full_name}</span>
          <button onClick={signOut}>Logout</button>
        </>
      ) : (
        <>
          <Link href="/login">Login</Link>
          <Link href="/signup">Sign Up</Link>
        </>
      )}
    </nav>
  )
}
```

#### Step 9: Unauthorized Page

```typescript
// app/unauthorized/page.tsx
import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-500">403</h1>
        <h2 className="text-2xl font-semibold mt-4">Access Denied</h2>
        <p className="text-gray-600 mt-2">
          You don't have permission to access this page.
        </p>
        <div className="mt-8 space-x-4">
          <Link
            href="/dashboard"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
```

### Route Protection Summary

| Layer | Purpose | When to Use |
|-------|---------|-------------|
| Middleware | First line of defense, redirects | Always (main protection) |
| Server Components | Double-check auth, fetch user data | Protected pages |
| API Routes | Protect data endpoints | All protected APIs |
| Client Components | UI state, auth context | Conditional rendering |

### Protection Layers

```
Request → Middleware (Edge) → Server Component → Client Component
              ↓                    ↓                   ↓
         Redirect if         Redirect if          Show/hide UI
         not authenticated   role mismatch        based on auth
```

### Output Format

Provide implementation with:
- Middleware configuration with route patterns
- Role-based access control
- Server-side session helpers
- API route protection wrappers
- Client-side auth context
- Unauthorized page

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Middleware not running | Check matcher config |
| Redirect loop | Exclude auth routes from protection |
| Session not refreshing | Call getSession() in middleware |
| Role check slow | Cache profile in session/cookie |
| Client flash | Use loading state, server-side redirect |

## Notes

- Middleware runs on Edge - keep it lightweight
- Always protect both routes AND API endpoints
- Use server components for initial auth check
- Client protection is UI-only (not secure alone)
- Store return URL for post-login redirect
- Consider session refresh strategy
- Test with different user roles
