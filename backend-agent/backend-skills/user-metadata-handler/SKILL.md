# User Metadata Handler

Save user profile data (profile picture, email, name) from Google OAuth to database.

## Trigger Phrases

- "save user metadata"
- "store google profile data"
- "handle user profile from oauth"
- "save profile picture and email"
- "/user-metadata"

## Instructions

Implement logic to extract and store user metadata (profile picture, email, name) from Google OAuth response into the database.

### Context Gathering

1. Identify the database (Supabase, PostgreSQL, MongoDB, Prisma)
2. Check existing user/profile table schema
3. Determine auth provider (Supabase Auth, NextAuth, custom)
4. Identify if profile table exists or needs creation

### Execution Steps

#### Step 1: Database Schema Setup

**For Supabase (SQL):**

```sql
-- Create profiles table linked to auth.users
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  provider TEXT DEFAULT 'google',
  provider_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create index for faster lookups
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

**For Prisma:**

```prisma
// schema.prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  fullName      String?   @map("full_name")
  avatarUrl     String?   @map("avatar_url")
  provider      String    @default("google")
  providerId    String?   @map("provider_id")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  @@map("profiles")
}
```

#### Step 2: Auto-Save on Signup (Supabase Trigger)

```sql
-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, provider, provider_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    COALESCE(NEW.raw_app_meta_data->>'provider', 'google'),
    NEW.raw_user_meta_data->>'provider_id'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

#### Step 3: Manual Save in Auth Callback

**For Supabase (Next.js):**

```typescript
// app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

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
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error || !user) {
      return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin))
    }

    // Extract metadata from Google
    const metadata = user.user_metadata
    const profileData = {
      id: user.id,
      email: user.email!,
      full_name: metadata?.full_name || metadata?.name || null,
      avatar_url: metadata?.avatar_url || metadata?.picture || null,
      provider: user.app_metadata?.provider || 'google',
      provider_id: metadata?.provider_id || metadata?.sub || null,
    }

    // Upsert profile (insert or update if exists)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(profileData, {
        onConflict: 'id',
        ignoreDuplicates: false,
      })

    if (profileError) {
      console.error('Profile save error:', profileError)
      // Continue anyway - user is authenticated
    }

    return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
  }

  return NextResponse.redirect(new URL('/login', requestUrl.origin))
}
```

**For NextAuth.js:**

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && profile) {
        try {
          // Save or update user metadata
          await prisma.user.upsert({
            where: { email: user.email! },
            update: {
              fullName: profile.name,
              avatarUrl: profile.picture,
              updatedAt: new Date(),
            },
            create: {
              email: user.email!,
              fullName: profile.name,
              avatarUrl: profile.picture,
              provider: 'google',
              providerId: profile.sub,
            },
          })
        } catch (error) {
          console.error('Error saving user metadata:', error)
          // Return true to allow sign in even if DB save fails
        }
      }
      return true
    },
    async session({ session, token }) {
      // Fetch fresh profile data for session
      if (session.user?.email) {
        const profile = await prisma.user.findUnique({
          where: { email: session.user.email },
        })
        if (profile) {
          session.user.id = profile.id
          session.user.image = profile.avatarUrl
          session.user.name = profile.fullName
        }
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

#### Step 4: Utility Functions

```typescript
// lib/user-metadata.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  provider: string
  created_at: string
  updated_at: string
}

// Fetch user profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createClientComponentClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<UserProfile, 'full_name' | 'avatar_url'>>
): Promise<UserProfile | null> {
  const supabase = createClientComponentClient()

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    return null
  }

  return data
}

// Sync metadata from auth to profile (useful for existing users)
export async function syncUserMetadata(userId: string): Promise<void> {
  const supabase = createClientComponentClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Could not fetch auth user')
  }

  const metadata = user.user_metadata

  await supabase
    .from('profiles')
    .update({
      full_name: metadata?.full_name || metadata?.name,
      avatar_url: metadata?.avatar_url || metadata?.picture,
    })
    .eq('id', userId)
}
```

#### Step 5: Display User Profile Component

```typescript
// components/UserAvatar.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'

interface UserProfile {
  full_name: string | null
  avatar_url: string | null
  email: string
}

export function UserAvatar() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, email')
          .eq('id', user.id)
          .single()

        setProfile(data)
      }
    }

    loadProfile()
  }, [supabase])

  if (!profile) {
    return <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
  }

  return (
    <div className="flex items-center gap-3">
      {profile.avatar_url ? (
        <Image
          src={profile.avatar_url}
          alt={profile.full_name || 'User'}
          width={40}
          height={40}
          className="rounded-full"
          referrerPolicy="no-referrer" // Important for Google images
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
          {profile.full_name?.[0] || profile.email[0].toUpperCase()}
        </div>
      )}
      <div>
        <p className="font-medium">{profile.full_name || 'User'}</p>
        <p className="text-sm text-gray-500">{profile.email}</p>
      </div>
    </div>
  )
}
```

### Google Metadata Fields Reference

| Google Field | Description | Access Path |
|--------------|-------------|-------------|
| `email` | User's email | `user.email` |
| `name` | Full name | `user_metadata.name` or `user_metadata.full_name` |
| `picture` | Profile photo URL | `user_metadata.picture` or `user_metadata.avatar_url` |
| `sub` | Google user ID | `user_metadata.sub` or `user_metadata.provider_id` |
| `email_verified` | Email verification status | `user_metadata.email_verified` |

### Output Format

Provide implementation with:
- Database schema (SQL or Prisma)
- Auto-trigger for new user signup
- Manual save in callback route
- Utility functions for profile operations
- UI component to display profile data

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Avatar not displaying | Add `referrerPolicy="no-referrer"` to img tag |
| Duplicate key error | Use upsert instead of insert |
| Missing metadata | Check both `name`/`full_name` and `picture`/`avatar_url` keys |
| RLS blocking insert | Use `SECURITY DEFINER` on trigger function |
| Stale profile data | Sync metadata on each login, not just signup |

## Notes

- Google avatar URLs may expire; consider storing in your own storage
- Always handle null/undefined metadata gracefully
- Use upsert to handle both new and returning users
- Add `referrerPolicy="no-referrer"` for Google profile images
- Consider GDPR compliance when storing user data
