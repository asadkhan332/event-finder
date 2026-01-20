# Server-Side Error Handling

Gracefully handle database connection, authentication, and server errors.

## Trigger Phrases

- "handle server errors"
- "database error handling"
- "auth error management"
- "graceful error handling"
- "/server-errors"

## Instructions

Implement comprehensive server-side error handling for database, authentication, and API operations.

### Context Gathering

1. Identify error-prone operations (DB, auth, external APIs)
2. Determine error reporting requirements (logging, monitoring)
3. Check existing error handling patterns
4. Identify user-facing vs internal errors

### Execution Steps

#### Step 1: Error Handling Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ERROR HANDLING FLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Operation (DB/Auth/API)                                         │
│       ↓                                                          │
│  Try/Catch Block                                                 │
│       ↓                                                          │
│  ┌─────────────────────────────────────────────┐                │
│  │ Error Occurred?                              │                │
│  │  ├── Yes → Identify Error Type               │                │
│  │  │         ├── Auth Error → Handle Auth      │                │
│  │  │         ├── DB Error → Handle DB          │                │
│  │  │         ├── Validation → Handle Validation│                │
│  │  │         └── Unknown → Handle Generic      │                │
│  │  │                ↓                          │                │
│  │  │         Log Error (Server)                │                │
│  │  │                ↓                          │                │
│  │  │         Return Safe Response (Client)     │                │
│  │  │                                           │                │
│  │  └── No → Return Success                     │                │
│  └─────────────────────────────────────────────┘                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Step 2: Custom Error Classes

```typescript
// lib/errors/index.ts

// Base application error
export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly isOperational: boolean
  public readonly details?: Record<string, any>

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    details?: Record<string, any>
  ) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = isOperational
    this.details = details

    Error.captureStackTrace(this, this.constructor)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

// Authentication errors
export class AuthError extends AppError {
  constructor(
    message: string = 'Authentication failed',
    code: string = 'AUTH_ERROR',
    details?: Record<string, any>
  ) {
    super(message, 401, code, true, details)
  }
}

export class UnauthorizedError extends AuthError {
  constructor(message: string = 'You must be logged in to access this resource') {
    super(message, 'UNAUTHORIZED')
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'You do not have permission to perform this action') {
    super(message, 403, 'FORBIDDEN')
  }
}

export class SessionExpiredError extends AuthError {
  constructor() {
    super('Your session has expired. Please log in again.', 'SESSION_EXPIRED')
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor() {
    super('Invalid email or password', 'INVALID_CREDENTIALS')
  }
}

// Database errors
export class DatabaseError extends AppError {
  constructor(
    message: string = 'Database operation failed',
    code: string = 'DATABASE_ERROR',
    details?: Record<string, any>
  ) {
    super(message, 500, code, true, details)
  }
}

export class ConnectionError extends DatabaseError {
  constructor() {
    super('Unable to connect to database. Please try again later.', 'CONNECTION_ERROR')
  }
}

export class RecordNotFoundError extends AppError {
  constructor(resource: string = 'Record') {
    super(`${resource} not found`, 404, 'NOT_FOUND')
  }
}

export class DuplicateRecordError extends AppError {
  constructor(field: string = 'record') {
    super(`A ${field} with this value already exists`, 409, 'DUPLICATE_RECORD')
  }
}

export class ForeignKeyError extends DatabaseError {
  constructor(message: string = 'Related record does not exist') {
    super(message, 'FOREIGN_KEY_ERROR')
  }
}

// Validation errors
export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>

  constructor(errors: Record<string, string[]>) {
    super('Validation failed', 400, 'VALIDATION_ERROR', true, { errors })
    this.errors = errors
  }
}

// Rate limiting
export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super(
      'Too many requests. Please try again later.',
      429,
      'RATE_LIMIT_EXCEEDED',
      true,
      { retryAfter }
    )
  }
}

// External service errors
export class ExternalServiceError extends AppError {
  constructor(service: string, originalError?: Error) {
    super(
      `External service error: ${service}`,
      502,
      'EXTERNAL_SERVICE_ERROR',
      true,
      { service, originalError: originalError?.message }
    )
  }
}
```

#### Step 3: Supabase Error Parser

```typescript
// lib/errors/supabase-errors.ts
import {
  AppError,
  AuthError,
  UnauthorizedError,
  SessionExpiredError,
  InvalidCredentialsError,
  DatabaseError,
  ConnectionError,
  RecordNotFoundError,
  DuplicateRecordError,
  ForeignKeyError,
  ValidationError,
  RateLimitError,
} from './index'

interface SupabaseError {
  message: string
  code?: string
  details?: string
  hint?: string
  status?: number
}

// Map Supabase auth error codes to our errors
const AUTH_ERROR_MAP: Record<string, () => AuthError> = {
  'invalid_credentials': () => new InvalidCredentialsError(),
  'user_not_found': () => new AuthError('User not found', 'USER_NOT_FOUND'),
  'email_not_confirmed': () => new AuthError('Please verify your email address', 'EMAIL_NOT_CONFIRMED'),
  'user_already_exists': () => new AuthError('An account with this email already exists', 'USER_EXISTS'),
  'invalid_grant': () => new SessionExpiredError(),
  'session_not_found': () => new SessionExpiredError(),
  'refresh_token_not_found': () => new SessionExpiredError(),
  'user_banned': () => new AuthError('Your account has been suspended', 'USER_BANNED'),
  'over_request_rate_limit': () => new RateLimitError(),
  'over_email_send_rate_limit': () => new RateLimitError(),
}

// Map PostgreSQL error codes to our errors
const PG_ERROR_MAP: Record<string, (err: SupabaseError) => AppError> = {
  '23505': (err) => { // unique_violation
    const match = err.details?.match(/Key \((\w+)\)/)
    const field = match ? match[1] : 'record'
    return new DuplicateRecordError(field)
  },
  '23503': (err) => { // foreign_key_violation
    return new ForeignKeyError(err.message)
  },
  '23502': (err) => { // not_null_violation
    const match = err.message?.match(/column "(\w+)"/)
    const field = match ? match[1] : 'field'
    return new ValidationError({ [field]: ['This field is required'] })
  },
  '23514': (err) => { // check_violation
    return new ValidationError({ _form: [err.message || 'Validation failed'] })
  },
  '42501': () => new ForbiddenError('Insufficient privileges'),
  '42P01': () => new DatabaseError('Database table not found', 'TABLE_NOT_FOUND'),
  '57014': () => new DatabaseError('Query cancelled due to timeout', 'QUERY_TIMEOUT'),
  '08000': () => new ConnectionError(),
  '08003': () => new ConnectionError(),
  '08006': () => new ConnectionError(),
  'PGRST116': () => new RecordNotFoundError(), // PostgREST: no rows returned
  'PGRST301': () => new ConnectionError(), // PostgREST: connection error
}

export function parseSupabaseError(error: any): AppError {
  // Handle null/undefined
  if (!error) {
    return new AppError('An unknown error occurred')
  }

  // Already an AppError
  if (error instanceof AppError) {
    return error
  }

  const supaError = error as SupabaseError
  const code = supaError.code || ''
  const message = supaError.message || 'An error occurred'

  // Check auth errors
  if (AUTH_ERROR_MAP[code]) {
    return AUTH_ERROR_MAP[code]()
  }

  // Check PostgreSQL errors
  if (PG_ERROR_MAP[code]) {
    return PG_ERROR_MAP[code](supaError)
  }

  // Check for common error patterns in message
  if (message.includes('JWT')) {
    return new SessionExpiredError()
  }

  if (message.includes('duplicate key')) {
    return new DuplicateRecordError()
  }

  if (message.includes('violates foreign key')) {
    return new ForeignKeyError(message)
  }

  if (message.includes('permission denied') || message.includes('RLS')) {
    return new ForbiddenError()
  }

  if (message.includes('connection') || message.includes('ECONNREFUSED')) {
    return new ConnectionError()
  }

  // Check HTTP status
  if (supaError.status === 401) {
    return new UnauthorizedError()
  }

  if (supaError.status === 403) {
    return new ForbiddenError()
  }

  if (supaError.status === 404) {
    return new RecordNotFoundError()
  }

  if (supaError.status === 429) {
    return new RateLimitError()
  }

  // Default database error
  return new DatabaseError(message, code || 'UNKNOWN_DB_ERROR', {
    details: supaError.details,
    hint: supaError.hint,
  })
}
```

#### Step 4: Error Handler Utility

```typescript
// lib/errors/handler.ts
import { NextResponse } from 'next/server'
import { AppError } from './index'
import { parseSupabaseError } from './supabase-errors'

interface ErrorResponse {
  success: false
  error: {
    message: string
    code: string
    details?: Record<string, any>
  }
}

// Format error for API response
export function formatErrorResponse(error: AppError): ErrorResponse {
  return {
    success: false,
    error: {
      message: error.message,
      code: error.code,
      details: error.details,
    },
  }
}

// Log error (server-side only)
export function logError(error: Error, context?: Record<string, any>): void {
  const timestamp = new Date().toISOString()
  const isAppError = error instanceof AppError

  const logData = {
    timestamp,
    message: error.message,
    code: isAppError ? (error as AppError).code : 'UNKNOWN',
    stack: error.stack,
    isOperational: isAppError ? (error as AppError).isOperational : false,
    context,
  }

  // In production, send to logging service (e.g., Sentry, LogRocket)
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error, { extra: logData })
    console.error('[ERROR]', JSON.stringify(logData))
  } else {
    console.error('[ERROR]', logData)
  }
}

// Main error handler for API routes
export function handleError(error: unknown, context?: Record<string, any>): NextResponse {
  // Parse to AppError
  let appError: AppError

  if (error instanceof AppError) {
    appError = error
  } else if (error instanceof Error) {
    appError = parseSupabaseError(error)
  } else {
    appError = new AppError(
      typeof error === 'string' ? error : 'An unexpected error occurred'
    )
  }

  // Log the error
  logError(appError, context)

  // Return formatted response
  return NextResponse.json(formatErrorResponse(appError), {
    status: appError.statusCode,
  })
}

// Wrapper for async API handlers
export function withErrorHandler<T extends (...args: any[]) => Promise<any>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleError(error)
    }
  }) as T
}
```

#### Step 5: Database Operation Wrapper

```typescript
// lib/db/safe-query.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import {
  AppError,
  DatabaseError,
  RecordNotFoundError,
  ConnectionError,
} from '@/lib/errors'
import { parseSupabaseError } from '@/lib/errors/supabase-errors'

// Get server-side Supabase client
function getSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient(
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
}

// Result type for safe operations
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: AppError }

// Safe query wrapper
export async function safeQuery<T>(
  queryFn: (supabase: ReturnType<typeof getSupabaseClient>) => Promise<{
    data: T | null
    error: any
  }>,
  options?: {
    notFoundMessage?: string
    errorMessage?: string
  }
): Promise<Result<T>> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await queryFn(supabase)

    if (error) {
      return {
        success: false,
        error: parseSupabaseError(error),
      }
    }

    if (data === null) {
      return {
        success: false,
        error: new RecordNotFoundError(options?.notFoundMessage),
      }
    }

    return { success: true, data }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error }
    }

    return {
      success: false,
      error: new DatabaseError(
        options?.errorMessage || 'Database operation failed'
      ),
    }
  }
}

// Safe single record query
export async function safeFindOne<T>(
  table: string,
  conditions: Record<string, any>,
  options?: {
    select?: string
    notFoundMessage?: string
  }
): Promise<Result<T>> {
  return safeQuery<T>(
    async (supabase) => {
      let query = supabase
        .from(table)
        .select(options?.select || '*')

      // Apply conditions
      for (const [key, value] of Object.entries(conditions)) {
        query = query.eq(key, value)
      }

      return query.single()
    },
    { notFoundMessage: options?.notFoundMessage || `${table} not found` }
  )
}

// Safe list query
export async function safeFindMany<T>(
  table: string,
  options?: {
    select?: string
    filters?: Record<string, any>
    orderBy?: { column: string; ascending?: boolean }
    limit?: number
    offset?: number
  }
): Promise<Result<T[]>> {
  return safeQuery<T[]>(async (supabase) => {
    let query = supabase.from(table).select(options?.select || '*')

    // Apply filters
    if (options?.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        query = query.eq(key, value)
      }
    }

    // Apply ordering
    if (options?.orderBy) {
      query = query.order(options.orderBy.column, {
        ascending: options.orderBy.ascending ?? true,
      })
    }

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 10) - 1
      )
    }

    const { data, error } = await query
    return { data: data as T[] | null, error }
  })
}

// Safe insert
export async function safeInsert<T>(
  table: string,
  data: Record<string, any>,
  options?: {
    select?: string
  }
): Promise<Result<T>> {
  return safeQuery<T>(async (supabase) => {
    return supabase
      .from(table)
      .insert(data)
      .select(options?.select || '*')
      .single()
  })
}

// Safe update
export async function safeUpdate<T>(
  table: string,
  conditions: Record<string, any>,
  data: Record<string, any>,
  options?: {
    select?: string
  }
): Promise<Result<T>> {
  return safeQuery<T>(async (supabase) => {
    let query = supabase.from(table).update(data)

    for (const [key, value] of Object.entries(conditions)) {
      query = query.eq(key, value)
    }

    return query.select(options?.select || '*').single()
  })
}

// Safe delete
export async function safeDelete(
  table: string,
  conditions: Record<string, any>
): Promise<Result<null>> {
  return safeQuery<null>(async (supabase) => {
    let query = supabase.from(table).delete()

    for (const [key, value] of Object.entries(conditions)) {
      query = query.eq(key, value)
    }

    const { error } = await query
    return { data: null, error }
  })
}
```

#### Step 6: Auth Error Handler

```typescript
// lib/auth/error-handler.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  AppError,
  AuthError,
  UnauthorizedError,
  SessionExpiredError,
  ForbiddenError,
} from '@/lib/errors'
import { parseSupabaseError } from '@/lib/errors/supabase-errors'
import { logError } from '@/lib/errors/handler'

type AuthResult<T> =
  | { success: true; data: T }
  | { success: false; error: AppError }

// Safe auth operation wrapper
export async function safeAuthOperation<T>(
  operation: (supabase: any) => Promise<{ data: T; error: any }>
): Promise<AuthResult<T>> {
  try {
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

    const { data, error } = await operation(supabase)

    if (error) {
      const appError = parseSupabaseError(error)
      logError(appError, { operation: 'auth' })
      return { success: false, error: appError }
    }

    return { success: true, data }
  } catch (error) {
    const appError = error instanceof AppError
      ? error
      : new AuthError('Authentication operation failed')
    logError(appError)
    return { success: false, error: appError }
  }
}

// Get session with error handling
export async function getSessionSafe() {
  return safeAuthOperation(async (supabase) => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { data: session, error }
  })
}

// Require session or redirect
export async function requireSessionOrRedirect(returnUrl?: string) {
  const result = await getSessionSafe()

  if (!result.success || !result.data) {
    const url = returnUrl
      ? `/login?returnUrl=${encodeURIComponent(returnUrl)}&error=session_required`
      : '/login?error=session_required'
    redirect(url)
  }

  return result.data
}

// Require role or redirect
export async function requireRoleOrRedirect(
  allowedRoles: string[],
  returnUrl?: string
) {
  const session = await requireSessionOrRedirect(returnUrl)

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

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (error || !profile || !allowedRoles.includes(profile.role)) {
    redirect('/unauthorized')
  }

  return { session, profile }
}

// Sign in with error handling
export async function signInSafe(email: string, password: string) {
  return safeAuthOperation(async (supabase) => {
    return supabase.auth.signInWithPassword({ email, password })
  })
}

// Sign up with error handling
export async function signUpSafe(email: string, password: string, metadata?: Record<string, any>) {
  return safeAuthOperation(async (supabase) => {
    return supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    })
  })
}

// Sign out with error handling
export async function signOutSafe() {
  return safeAuthOperation(async (supabase) => {
    const { error } = await supabase.auth.signOut()
    return { data: null, error }
  })
}

// Password reset with error handling
export async function resetPasswordSafe(email: string) {
  return safeAuthOperation(async (supabase) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    })
    return { data: null, error }
  })
}
```

#### Step 7: API Route Error Handling

```typescript
// app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { handleError, withErrorHandler } from '@/lib/errors/handler'
import { safeFindMany, safeInsert } from '@/lib/db/safe-query'
import { ValidationError, UnauthorizedError, ForbiddenError } from '@/lib/errors'
import { getSessionSafe } from '@/lib/auth/error-handler'

// GET /api/events
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const city = searchParams.get('city')

  const filters: Record<string, any> = { status: 'published' }
  if (category) filters.category_slug = category
  if (city) filters.city = city

  const result = await safeFindMany('events_detailed', {
    filters,
    orderBy: { column: 'start_date', ascending: true },
    limit: 20,
  })

  if (!result.success) {
    return handleError(result.error)
  }

  return NextResponse.json({
    success: true,
    data: result.data,
  })
})

// POST /api/events
export const POST = withErrorHandler(async (request: NextRequest) => {
  // Check authentication
  const sessionResult = await getSessionSafe()
  if (!sessionResult.success || !sessionResult.data) {
    throw new UnauthorizedError()
  }

  const session = sessionResult.data

  // Check if user is organizer
  const profileResult = await safeFindOne<{ role: string }>('profiles', {
    id: session.user.id,
  })

  if (!profileResult.success) {
    throw profileResult.error
  }

  if (!['organizer', 'admin'].includes(profileResult.data.role)) {
    throw new ForbiddenError('Only organizers can create events')
  }

  // Parse and validate body
  const body = await request.json()

  const errors: Record<string, string[]> = {}

  if (!body.title?.trim()) {
    errors.title = ['Title is required']
  } else if (body.title.length < 5) {
    errors.title = ['Title must be at least 5 characters']
  }

  if (!body.start_date) {
    errors.start_date = ['Start date is required']
  } else if (new Date(body.start_date) <= new Date()) {
    errors.start_date = ['Start date must be in the future']
  }

  if (!body.end_date) {
    errors.end_date = ['End date is required']
  } else if (body.start_date && new Date(body.end_date) < new Date(body.start_date)) {
    errors.end_date = ['End date must be after start date']
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors)
  }

  // Create event
  const result = await safeInsert('events', {
    ...body,
    organizer_id: session.user.id,
    status: 'draft',
  })

  if (!result.success) {
    throw result.error
  }

  return NextResponse.json(
    { success: true, data: result.data },
    { status: 201 }
  )
})
```

#### Step 8: Server Action Error Handling

```typescript
// actions/events.ts
'use server'

import { revalidatePath } from 'next/cache'
import { safeInsert, safeUpdate, safeDelete, safeFindOne } from '@/lib/db/safe-query'
import { requireSessionOrRedirect, requireRoleOrRedirect } from '@/lib/auth/error-handler'
import { ValidationError, ForbiddenError, AppError } from '@/lib/errors'
import { logError } from '@/lib/errors/handler'

// Action result type
type ActionResult<T = void> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; code: string; details?: Record<string, any> }

// Helper to format action error
function formatActionError(error: unknown): ActionResult {
  if (error instanceof AppError) {
    logError(error)
    return {
      success: false,
      error: error.message,
      code: error.code,
      details: error.details,
    }
  }

  if (error instanceof Error) {
    logError(error)
    return {
      success: false,
      error: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    }
  }

  return {
    success: false,
    error: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  }
}

// Create event action
export async function createEvent(formData: FormData): Promise<ActionResult> {
  try {
    // Require organizer role
    const { session } = await requireRoleOrRedirect(['organizer', 'admin'])

    // Validate input
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const startDate = formData.get('start_date') as string
    const endDate = formData.get('end_date') as string

    const errors: Record<string, string[]> = {}

    if (!title?.trim()) {
      errors.title = ['Title is required']
    }

    if (!startDate) {
      errors.start_date = ['Start date is required']
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors)
    }

    // Create event
    const result = await safeInsert('events', {
      title: title.trim(),
      description: description?.trim(),
      start_date: startDate,
      end_date: endDate || startDate,
      organizer_id: session.user.id,
      status: 'draft',
    })

    if (!result.success) {
      throw result.error
    }

    revalidatePath('/organizer/events')

    return {
      success: true,
      data: result.data,
      message: 'Event created successfully',
    }
  } catch (error) {
    return formatActionError(error)
  }
}

// Register for event action
export async function registerForEvent(eventId: string): Promise<ActionResult> {
  try {
    const session = await requireSessionOrRedirect()

    // Check if event exists and is published
    const eventResult = await safeFindOne<{
      id: string
      status: string
      capacity: number | null
      attendee_count: number
      start_date: string
    }>('events', { id: eventId })

    if (!eventResult.success) {
      throw eventResult.error
    }

    const event = eventResult.data

    if (event.status !== 'published') {
      throw new ForbiddenError('Cannot register for unpublished event')
    }

    if (new Date(event.start_date) <= new Date()) {
      throw new ForbiddenError('Cannot register for past events')
    }

    if (event.capacity && event.attendee_count >= event.capacity) {
      throw new ForbiddenError('Event is at full capacity')
    }

    // Check existing registration
    const existingResult = await safeFindOne('attendees', {
      event_id: eventId,
      user_id: session.user.id,
    })

    if (existingResult.success) {
      throw new ForbiddenError('You are already registered for this event')
    }

    // Create registration
    const result = await safeInsert('attendees', {
      event_id: eventId,
      user_id: session.user.id,
      status: 'registered',
    })

    if (!result.success) {
      throw result.error
    }

    revalidatePath(`/events/${eventId}`)
    revalidatePath('/my-events')

    return {
      success: true,
      message: 'Successfully registered for event',
    }
  } catch (error) {
    return formatActionError(error)
  }
}

// Cancel registration action
export async function cancelRegistration(registrationId: string): Promise<ActionResult> {
  try {
    const session = await requireSessionOrRedirect()

    // Find registration
    const regResult = await safeFindOne<{
      id: string
      user_id: string
      event_id: string
    }>('attendees', { id: registrationId })

    if (!regResult.success) {
      throw regResult.error
    }

    // Check ownership
    if (regResult.data.user_id !== session.user.id) {
      throw new ForbiddenError('You can only cancel your own registration')
    }

    // Delete registration
    const deleteResult = await safeDelete('attendees', { id: registrationId })

    if (!deleteResult.success) {
      throw deleteResult.error
    }

    revalidatePath('/my-events')

    return {
      success: true,
      message: 'Registration cancelled successfully',
    }
  } catch (error) {
    return formatActionError(error)
  }
}
```

#### Step 9: Client-Side Error Display

```typescript
// components/ErrorDisplay.tsx
'use client'

import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface ErrorDisplayProps {
  title?: string
  message: string
  code?: string
  showRetry?: boolean
  showHome?: boolean
  onRetry?: () => void
}

export function ErrorDisplay({
  title = 'Something went wrong',
  message,
  code,
  showRetry = true,
  showHome = true,
  onRetry,
}: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-600 mb-4 max-w-md">{message}</p>
      {code && (
        <p className="text-sm text-gray-400 mb-4">Error code: {code}</p>
      )}
      <div className="flex gap-4">
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        )}
        {showHome && (
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        )}
      </div>
    </div>
  )
}

// Error messages mapping
export const ERROR_MESSAGES: Record<string, { title: string; message: string }> = {
  UNAUTHORIZED: {
    title: 'Login Required',
    message: 'Please log in to access this page.',
  },
  FORBIDDEN: {
    title: 'Access Denied',
    message: 'You do not have permission to access this resource.',
  },
  SESSION_EXPIRED: {
    title: 'Session Expired',
    message: 'Your session has expired. Please log in again.',
  },
  NOT_FOUND: {
    title: 'Not Found',
    message: 'The requested resource could not be found.',
  },
  CONNECTION_ERROR: {
    title: 'Connection Error',
    message: 'Unable to connect to the server. Please check your internet connection.',
  },
  RATE_LIMIT_EXCEEDED: {
    title: 'Too Many Requests',
    message: 'You have made too many requests. Please wait a moment and try again.',
  },
  VALIDATION_ERROR: {
    title: 'Validation Failed',
    message: 'Please check your input and try again.',
  },
  DEFAULT: {
    title: 'Error',
    message: 'An unexpected error occurred. Please try again later.',
  },
}

export function getErrorMessage(code: string): { title: string; message: string } {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES.DEFAULT
}
```

**Form Error Display:**
```typescript
// components/FormError.tsx
'use client'

import { AlertCircle } from 'lucide-react'

interface FormErrorProps {
  errors?: Record<string, string[]>
  message?: string
}

export function FormError({ errors, message }: FormErrorProps) {
  if (!errors && !message) return null

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          {message && (
            <p className="text-red-700 font-medium">{message}</p>
          )}
          {errors && Object.keys(errors).length > 0 && (
            <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
              {Object.entries(errors).map(([field, messages]) =>
                messages.map((msg, i) => (
                  <li key={`${field}-${i}`}>
                    {field !== '_form' && <span className="font-medium">{field}:</span>} {msg}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
```

#### Step 10: Error Boundary for React

```typescript
// components/ErrorBoundary.tsx
'use client'

import { Component, type ReactNode } from 'react'
import { ErrorDisplay } from './ErrorDisplay'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error reporting service
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorDisplay
          title="Something went wrong"
          message={this.state.error?.message || 'An unexpected error occurred'}
          onRetry={() => this.setState({ hasError: false })}
        />
      )
    }

    return this.props.children
  }
}

// app/error.tsx (Next.js App Router error boundary)
'use client'

import { useEffect } from 'react'
import { ErrorDisplay, getErrorMessage } from '@/components/ErrorDisplay'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string; code?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error
    console.error('Page error:', error)
  }, [error])

  const { title, message } = getErrorMessage(error.code || 'DEFAULT')

  return (
    <div className="min-h-screen flex items-center justify-center">
      <ErrorDisplay
        title={title}
        message={message}
        code={error.digest}
        onRetry={reset}
      />
    </div>
  )
}
```

### Error Code Quick Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | User not authenticated |
| `FORBIDDEN` | 403 | User lacks permission |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `DUPLICATE_RECORD` | 409 | Record already exists |
| `SESSION_EXPIRED` | 401 | Auth session expired |
| `CONNECTION_ERROR` | 500 | Database connection failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### Output Format

Provide implementation with:
- Custom error classes for different error types
- Supabase error parser
- Safe database operation wrappers
- Auth operation error handlers
- API route error handling
- Server action error handling
- Client-side error display components

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Generic error messages | Use error parser to identify specific errors |
| Error details exposed | Return safe messages, log full details |
| Silent failures | Always handle and log errors |
| Inconsistent responses | Use standardized error format |
| Client shows raw errors | Map error codes to user-friendly messages |

## Notes

- Never expose sensitive error details to client
- Log full error details server-side for debugging
- Use consistent error response format
- Map database errors to user-friendly messages
- Implement retry logic for transient errors
- Consider error monitoring service (Sentry, LogRocket)
- Test error handling with intentional failures
