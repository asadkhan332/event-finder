# Database Policies

Set INSERT, UPDATE, and DELETE permissions using SQL policy commands.

## Trigger Phrases

- "set database policies"
- "configure crud permissions"
- "create insert update delete policies"
- "database permission management"
- "/db-policies"

## Instructions

Configure granular database policies for INSERT, UPDATE, and DELETE operations to control data access.

### Context Gathering

1. Identify tables requiring policy configuration
2. Determine user roles and their permission levels
3. Check existing policies on tables
4. Identify specific CRUD requirements per table

### Execution Steps

#### Step 1: Policy Basics

```sql
-- Policy Syntax
CREATE POLICY "policy_name"
  ON schema.table_name
  FOR [SELECT | INSERT | UPDATE | DELETE | ALL]
  TO [role_name | PUBLIC]
  USING (condition)        -- Filter existing rows (SELECT, UPDATE, DELETE)
  WITH CHECK (condition);  -- Validate new/modified rows (INSERT, UPDATE)
```

**When to use USING vs WITH CHECK:**

| Operation | USING | WITH CHECK |
|-----------|-------|------------|
| SELECT | Filters visible rows | Not applicable |
| INSERT | Not applicable | Validates new row |
| UPDATE | Filters which rows can be updated | Validates the updated row |
| DELETE | Filters which rows can be deleted | Not applicable |
| ALL | Both apply | Both apply |

#### Step 2: INSERT Policies

**Basic: User can only insert their own data**
```sql
CREATE POLICY "insert_own_data"
  ON public.posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

**With role check: Only authenticated users**
```sql
CREATE POLICY "insert_authenticated_only"
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

**With multiple conditions**
```sql
CREATE POLICY "insert_with_validation"
  ON public.posts
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND length(title) >= 3
    AND length(title) <= 200
  );
```

**Organizer can create events**
```sql
CREATE POLICY "organizer_create_event"
  ON public.events
  FOR INSERT
  WITH CHECK (
    auth.uid() = organizer_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('organizer', 'admin')
    )
  );
```

**User can register for events (with capacity check)**
```sql
CREATE POLICY "user_register_event"
  ON public.attendees
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_id
      AND e.status = 'published'
      AND (e.capacity IS NULL OR e.attendee_count < e.capacity)
    )
  );
```

#### Step 3: UPDATE Policies

**Basic: User can only update their own data**
```sql
CREATE POLICY "update_own_data"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

**Prevent changing ownership**
```sql
CREATE POLICY "update_own_posts"
  ON public.posts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND user_id = (SELECT user_id FROM public.posts WHERE id = posts.id)
  );
```

**Restrict which columns can be updated**
```sql
-- Users cannot change their role
CREATE POLICY "update_profile_limited"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );
```

**Organizer can update their events**
```sql
CREATE POLICY "organizer_update_event"
  ON public.events
  FOR UPDATE
  USING (auth.uid() = organizer_id)
  WITH CHECK (
    auth.uid() = organizer_id
    -- Cannot change organizer
    AND organizer_id = (SELECT organizer_id FROM public.events WHERE id = events.id)
  );
```

**Status-based update restrictions**
```sql
-- Cannot update completed or cancelled events
CREATE POLICY "update_active_events_only"
  ON public.events
  FOR UPDATE
  USING (
    auth.uid() = organizer_id
    AND status NOT IN ('completed', 'cancelled')
  )
  WITH CHECK (
    auth.uid() = organizer_id
  );
```

**Attendee can update their registration (limited)**
```sql
CREATE POLICY "attendee_update_registration"
  ON public.attendees
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    -- Can only cancel, not change other fields
    AND (
      status = 'cancelled'
      OR status = (SELECT status FROM public.attendees WHERE id = attendees.id)
    )
  );
```

**Admin can update anything**
```sql
CREATE POLICY "admin_update_all"
  ON public.events
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### Step 4: DELETE Policies

**Basic: User can only delete their own data**
```sql
CREATE POLICY "delete_own_data"
  ON public.posts
  FOR DELETE
  USING (auth.uid() = user_id);
```

**Soft delete approach (recommended)**
```sql
-- Instead of DELETE policy, use UPDATE for soft delete
ALTER TABLE public.posts ADD COLUMN deleted_at TIMESTAMPTZ;

CREATE POLICY "soft_delete_own_posts"
  ON public.posts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Modify SELECT to exclude deleted
CREATE POLICY "select_non_deleted"
  ON public.posts
  FOR SELECT
  USING (deleted_at IS NULL OR auth.uid() = user_id);
```

**Time-restricted delete**
```sql
-- Can only delete within 24 hours of creation
CREATE POLICY "delete_recent_only"
  ON public.posts
  FOR DELETE
  USING (
    auth.uid() = user_id
    AND created_at > NOW() - INTERVAL '24 hours'
  );
```

**Organizer can delete draft events only**
```sql
CREATE POLICY "delete_draft_events"
  ON public.events
  FOR DELETE
  USING (
    auth.uid() = organizer_id
    AND status = 'draft'
  );
```

**User can cancel registration (delete)**
```sql
CREATE POLICY "cancel_registration"
  ON public.attendees
  FOR DELETE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_id
      AND e.start_date > NOW() + INTERVAL '24 hours'
    )
  );
```

**Admin can delete anything**
```sql
CREATE POLICY "admin_delete_all"
  ON public.posts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### Step 5: Complete Policy Sets by Table

```sql
-- ============================================
-- PROFILES TABLE - Complete Policy Set
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: Anyone can view profiles
CREATE POLICY "profiles_select"
  ON public.profiles FOR SELECT
  USING (true);

-- INSERT: Users can only create their own profile
CREATE POLICY "profiles_insert"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- UPDATE: Users can only update their own profile, cannot change role
CREATE POLICY "profiles_update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- DELETE: No delete allowed (or admin only)
CREATE POLICY "profiles_delete_admin"
  ON public.profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- EVENTS TABLE - Complete Policy Set
-- ============================================
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- SELECT: Published events public, drafts only for organizer
CREATE POLICY "events_select"
  ON public.events FOR SELECT
  USING (
    status = 'published'
    OR auth.uid() = organizer_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- INSERT: Organizers and admins can create
CREATE POLICY "events_insert"
  ON public.events FOR INSERT
  WITH CHECK (
    auth.uid() = organizer_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('organizer', 'admin')
    )
  );

-- UPDATE: Organizer can update own events, admin can update all
CREATE POLICY "events_update_organizer"
  ON public.events FOR UPDATE
  USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "events_update_admin"
  ON public.events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- DELETE: Only draft events by organizer, or admin
CREATE POLICY "events_delete_organizer"
  ON public.events FOR DELETE
  USING (
    auth.uid() = organizer_id
    AND status = 'draft'
  );

CREATE POLICY "events_delete_admin"
  ON public.events FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- ATTENDEES TABLE - Complete Policy Set
-- ============================================
ALTER TABLE public.attendees ENABLE ROW LEVEL SECURITY;

-- SELECT: User sees own, organizer sees their event's attendees
CREATE POLICY "attendees_select_own"
  ON public.attendees FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "attendees_select_organizer"
  ON public.attendees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = attendees.event_id
      AND organizer_id = auth.uid()
    )
  );

-- INSERT: User can register for published events with capacity
CREATE POLICY "attendees_insert"
  ON public.attendees FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_id
      AND e.status = 'published'
      AND e.start_date > NOW()
      AND (e.capacity IS NULL OR e.attendee_count < e.capacity)
    )
    -- Prevent duplicate registration
    AND NOT EXISTS (
      SELECT 1 FROM public.attendees a
      WHERE a.event_id = attendees.event_id
      AND a.user_id = auth.uid()
    )
  );

-- UPDATE: User can cancel, organizer can update status
CREATE POLICY "attendees_update_user"
  ON public.attendees FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND status IN ('cancelled')
  );

CREATE POLICY "attendees_update_organizer"
  ON public.attendees FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = attendees.event_id
      AND organizer_id = auth.uid()
    )
  );

-- DELETE: User can delete if event hasn't started
CREATE POLICY "attendees_delete"
  ON public.attendees FOR DELETE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_id
      AND e.start_date > NOW() + INTERVAL '24 hours'
    )
  );
```

#### Step 6: Policy Management Commands

```sql
-- View all policies on a table
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  qual AS using_expression,
  with_check
FROM pg_policies
WHERE tablename = 'events';

-- Drop a specific policy
DROP POLICY "policy_name" ON public.events;

-- Drop all policies on a table
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'events'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.events', pol.policyname);
  END LOOP;
END $$;

-- Temporarily disable RLS (testing only)
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Check RLS status
SELECT
  relname AS table_name,
  relrowsecurity AS rls_enabled,
  relforcerowsecurity AS rls_forced
FROM pg_class
WHERE relname IN ('profiles', 'events', 'attendees');
```

#### Step 7: Testing Policies

```sql
-- Test as specific user
SET request.jwt.claim.sub = 'user-uuid-here';
SET request.jwt.claims = '{"role": "authenticated"}';

-- Test INSERT
INSERT INTO public.posts (user_id, title) VALUES ('other-user-uuid', 'Test');
-- Should fail: new row violates row-level security policy

-- Test UPDATE
UPDATE public.posts SET title = 'Hacked' WHERE user_id = 'other-user-uuid';
-- Should update 0 rows

-- Test DELETE
DELETE FROM public.posts WHERE user_id = 'other-user-uuid';
-- Should delete 0 rows

-- Reset
RESET request.jwt.claim.sub;
RESET request.jwt.claims;
```

### Policy Patterns Quick Reference

| Pattern | INSERT | UPDATE | DELETE |
|---------|--------|--------|--------|
| Owner only | `WITH CHECK (uid = user_id)` | `USING (uid = user_id)` | `USING (uid = user_id)` |
| Role-based | `WITH CHECK (role = 'admin')` | `USING (role = 'admin')` | `USING (role = 'admin')` |
| Time-limited | `WITH CHECK (true)` | `USING (created_at > NOW() - '1h')` | `USING (created_at > NOW() - '1h')` |
| Status-based | `WITH CHECK (status = 'draft')` | `USING (status != 'locked')` | `USING (status = 'draft')` |
| Conditional | `WITH CHECK (capacity > 0)` | `USING (NOT is_locked)` | `USING (NOT has_children)` |

### Output Format

Provide implementation with:
- Complete policy sets for each table
- Separate policies for each operation (INSERT, UPDATE, DELETE)
- Role-based access control
- Business logic constraints in policies
- Testing commands to verify policies

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "new row violates RLS" | Check WITH CHECK condition |
| "0 rows updated/deleted" | Check USING condition |
| Policy not applying | Ensure RLS is enabled on table |
| Infinite recursion | Avoid querying same table in policy |
| Performance issues | Add indexes on policy columns |
| Multiple policies conflict | Remember policies use OR logic |

## Notes

- Always enable RLS before creating policies
- Use separate policies for each operation for clarity
- WITH CHECK validates data being written
- USING filters which rows are accessible
- Multiple policies = OR logic (any can grant access)
- Test policies with different user contexts
- Consider soft delete instead of hard delete
- Use service_role to bypass RLS for admin operations
