# Row Level Security (RLS)

Implement RLS policies to ensure users can only access and modify their own data.

## Trigger Phrases

- "setup row level security"
- "implement RLS policies"
- "protect user data with RLS"
- "prevent unauthorized data access"
- "/rls"

## Instructions

Configure Row Level Security policies in Supabase/PostgreSQL to ensure data isolation between users.

### Context Gathering

1. Identify all tables that contain user-specific data
2. Determine the user identifier column (user_id, owner_id, created_by)
3. Check existing RLS policies
4. Identify access patterns (read-only, full CRUD, shared access)

### Execution Steps

#### Step 1: Understanding RLS Basics

```
RLS = Row Level Security
- Controls which rows users can SELECT, INSERT, UPDATE, DELETE
- Policies are evaluated for every query
- No policy = No access (when RLS is enabled)
- Multiple policies = OR logic (any policy can grant access)
```

**Key Concepts:**
```sql
-- auth.uid() = Current logged-in user's ID
-- auth.role() = Current user's role ('authenticated', 'anon', 'service_role')
-- auth.jwt() = Full JWT token with claims
```

#### Step 2: Enable RLS on Tables

```sql
-- Enable RLS on a table (REQUIRED first step)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners too (recommended for security)
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
```

#### Step 3: Common RLS Policy Patterns

**Pattern 1: User Owns Their Data**
```sql
-- Users can only see their own data
CREATE POLICY "Users can view own data"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can only update their own data
CREATE POLICY "Users can update own data"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can only delete their own data
CREATE POLICY "Users can delete own data"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);

-- Users can insert their own data
CREATE POLICY "Users can insert own data"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);
```

**Pattern 2: User ID in Foreign Key Column**
```sql
-- For tables where user_id is a column (not the primary key)
CREATE POLICY "Users can view own posts"
  ON public.posts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own posts"
  ON public.posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON public.posts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON public.posts
  FOR DELETE
  USING (auth.uid() = user_id);
```

**Pattern 3: Public Read, Owner Write**
```sql
-- Anyone can read (even anonymous)
CREATE POLICY "Public read access"
  ON public.posts
  FOR SELECT
  USING (true);

-- Only owner can modify
CREATE POLICY "Owner can update"
  ON public.posts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can delete"
  ON public.posts
  FOR DELETE
  USING (auth.uid() = user_id);
```

**Pattern 4: Authenticated Users Only**
```sql
-- Only logged-in users can read
CREATE POLICY "Authenticated users can read"
  ON public.posts
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only logged-in users can create (for their own data)
CREATE POLICY "Authenticated users can create"
  ON public.posts
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND auth.uid() = user_id
  );
```

**Pattern 5: Role-Based Access**
```sql
-- Admin can do anything
CREATE POLICY "Admin full access"
  ON public.posts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Regular users can only access own data
CREATE POLICY "Users access own data"
  ON public.posts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**Pattern 6: Shared Access (Team/Organization)**
```sql
-- Users can access data from their organization
CREATE POLICY "Team members can view"
  ON public.projects
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Only project owner can edit
CREATE POLICY "Owner can edit"
  ON public.projects
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);
```

**Pattern 7: Visibility Column**
```sql
-- Public posts visible to all, private only to owner
CREATE POLICY "Visibility based access"
  ON public.posts
  FOR SELECT
  USING (
    is_public = true
    OR auth.uid() = user_id
  );
```

#### Step 4: Complete Table Security Setup

```sql
-- ============================================
-- PROFILES TABLE - Complete RLS Setup
-- ============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- No delete policy = users cannot delete their profile

-- ============================================
-- POSTS TABLE - Complete RLS Setup
-- ============================================
CREATE TABLE public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Select: Public posts for all, private posts for owner
CREATE POLICY "posts_select"
  ON public.posts FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

-- Insert: Only authenticated users, only for themselves
CREATE POLICY "posts_insert"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Update: Only owner
CREATE POLICY "posts_update"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Delete: Only owner
CREATE POLICY "posts_delete"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- USER_SETTINGS TABLE - Strict Owner Only
-- ============================================
CREATE TABLE public.user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  theme TEXT DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT true,
  language TEXT DEFAULT 'en'
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- All operations: Owner only
CREATE POLICY "user_settings_all"
  ON public.user_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### Step 5: Testing RLS Policies

```sql
-- Test as a specific user
SET request.jwt.claim.sub = 'user-uuid-here';
SET request.jwt.claims = '{"role": "authenticated"}';

-- Try to select another user's data (should return empty)
SELECT * FROM public.profiles WHERE id != 'user-uuid-here';

-- Try to update another user's data (should fail)
UPDATE public.profiles SET full_name = 'Hacked' WHERE id = 'other-user-uuid';

-- Reset
RESET request.jwt.claim.sub;
RESET request.jwt.claims;
```

**Testing in Application:**
```typescript
// lib/test-rls.ts
import { createClient } from '@supabase/supabase-js'

async function testRLS() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Login as user A
  await supabase.auth.signInWithPassword({
    email: 'usera@test.com',
    password: 'password123'
  })

  // Try to read user B's data
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'userb@test.com')

  console.log('Data (should be empty):', data)
  console.log('Error:', error)

  // Try to update user B's data
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ full_name: 'Hacked!' })
    .eq('email', 'userb@test.com')

  console.log('Update error (should fail):', updateError)
}
```

#### Step 6: Managing RLS Policies

```sql
-- View all policies on a table
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Drop a policy
DROP POLICY "policy_name" ON public.profiles;

-- Disable RLS (NOT recommended for production)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Check if RLS is enabled
SELECT relname, relrowsecurity, relforcerowsecurity
FROM pg_class
WHERE relname IN ('profiles', 'posts', 'user_settings');
```

#### Step 7: Bypass RLS (Service Role)

```typescript
// For admin operations that need to bypass RLS
// Use service_role key (NEVER expose to client)
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Server-side only!
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// This bypasses RLS - use carefully!
async function adminGetAllUsers() {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')

  return data
}
```

### RLS Policy Cheat Sheet

| Operation | USING Clause | WITH CHECK Clause |
|-----------|--------------|-------------------|
| SELECT | Required | Not used |
| INSERT | Not used | Required |
| UPDATE | Required (filter rows) | Required (validate new data) |
| DELETE | Required | Not used |
| ALL | Required | Required |

### Output Format

Provide implementation with:
- Table schema with proper foreign keys
- Complete RLS policy set for each table
- Test queries to verify policies work
- Common policy patterns for the use case

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| No rows returned | Check if RLS is enabled and policy exists |
| "new row violates RLS" | Check WITH CHECK clause |
| Policy not working | Verify auth.uid() matches column correctly |
| Admin can't access | Use service_role key or add admin policy |
| Infinite recursion | Avoid SELECT on same table in policy |
| Performance issues | Add indexes on columns used in policies |

### Security Checklist

- [ ] RLS enabled on ALL tables with user data
- [ ] Every table has explicit policies (no missing operations)
- [ ] Tested policies with different user accounts
- [ ] Service role key not exposed to client
- [ ] No overly permissive policies (USING (true) for sensitive data)
- [ ] WITH CHECK prevents inserting data for other users
- [ ] Indexes exist on policy filter columns

## Notes

- RLS is enforced at database level - cannot be bypassed from client
- Always test with multiple user accounts
- Use USING for filtering existing rows, WITH CHECK for validating new/updated rows
- service_role key bypasses RLS - keep it server-side only
- Consider performance impact of complex policy conditions
- Policies use OR logic - if ANY policy passes, access is granted
