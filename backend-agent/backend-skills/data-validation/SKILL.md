# Data Validation

Implement database-level checks and constraints to prevent invalid data from being saved.

## Trigger Phrases

- "add database validation"
- "create check constraints"
- "validate data at database level"
- "prevent invalid data in database"
- "/data-validation"

## Instructions

Implement comprehensive data validation at the PostgreSQL database level using constraints, checks, and triggers.

### Context Gathering

1. Identify tables requiring validation
2. Determine validation rules for each column
3. Check existing constraints
4. Identify business logic validations needed

### Execution Steps

#### Step 1: Constraint Types Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONSTRAINT TYPES                              │
├─────────────────────────────────────────────────────────────────┤
│ NOT NULL      → Column cannot be empty                          │
│ UNIQUE        → No duplicate values allowed                     │
│ PRIMARY KEY   → Unique + Not Null identifier                    │
│ FOREIGN KEY   → Must reference existing row in another table    │
│ CHECK         → Custom condition must be true                   │
│ EXCLUDE       → Prevent overlapping ranges/values               │
│ DEFAULT       → Auto-fill if no value provided                  │
├─────────────────────────────────────────────────────────────────┤
│ TRIGGERS      → Complex validation with custom functions        │
│ DOMAINS       → Reusable data types with constraints            │
└─────────────────────────────────────────────────────────────────┘
```

#### Step 2: NOT NULL Constraints

```sql
-- At table creation
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add to existing column
ALTER TABLE public.profiles
  ALTER COLUMN email SET NOT NULL;

-- Remove NOT NULL
ALTER TABLE public.profiles
  ALTER COLUMN full_name DROP NOT NULL;

-- Conditional NOT NULL (using CHECK)
ALTER TABLE public.events
  ADD CONSTRAINT online_event_needs_url
  CHECK (
    (is_online = false) OR
    (is_online = true AND online_url IS NOT NULL)
  );
```

#### Step 3: UNIQUE Constraints

```sql
-- Single column unique
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE
);

-- Add unique to existing table
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- Composite unique (combination must be unique)
ALTER TABLE public.attendees
  ADD CONSTRAINT attendees_event_user_unique
  UNIQUE (event_id, user_id);

-- Partial unique (unique only when condition met)
CREATE UNIQUE INDEX profiles_username_unique
  ON public.profiles (username)
  WHERE username IS NOT NULL;

-- Case-insensitive unique
CREATE UNIQUE INDEX profiles_email_lower_unique
  ON public.profiles (LOWER(email));
```

#### Step 4: CHECK Constraints

**Basic Value Checks:**
```sql
-- Positive number
ALTER TABLE public.events
  ADD CONSTRAINT events_capacity_positive
  CHECK (capacity IS NULL OR capacity > 0);

-- Price validation
ALTER TABLE public.events
  ADD CONSTRAINT events_price_valid
  CHECK (price >= 0 AND price <= 1000000);

-- Percentage range
ALTER TABLE public.discounts
  ADD CONSTRAINT discounts_percentage_range
  CHECK (percentage >= 0 AND percentage <= 100);

-- Non-empty string
ALTER TABLE public.events
  ADD CONSTRAINT events_title_not_empty
  CHECK (length(trim(title)) > 0);
```

**String Length Checks:**
```sql
-- Minimum length
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_username_min_length
  CHECK (length(username) >= 3);

-- Maximum length
ALTER TABLE public.events
  ADD CONSTRAINT events_title_max_length
  CHECK (length(title) <= 200);

-- Range
ALTER TABLE public.events
  ADD CONSTRAINT events_description_length
  CHECK (
    description IS NULL OR
    (length(description) >= 10 AND length(description) <= 5000)
  );
```

**Pattern Matching:**
```sql
-- Email format
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_email_format
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Phone number format (Pakistan)
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_phone_format
  CHECK (
    phone IS NULL OR
    phone ~ '^\+92[0-9]{10}$' OR
    phone ~ '^03[0-9]{9}$'
  );

-- Slug format (lowercase, hyphens, no spaces)
ALTER TABLE public.events
  ADD CONSTRAINT events_slug_format
  CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

-- URL format
ALTER TABLE public.events
  ADD CONSTRAINT events_url_format
  CHECK (
    online_url IS NULL OR
    online_url ~ '^https?://[^\s/$.?#].[^\s]*$'
  );

-- No special characters in name
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_name_alphanumeric
  CHECK (full_name ~ '^[A-Za-z\s\.\-]+$');
```

**Date/Time Checks:**
```sql
-- End date after start date
ALTER TABLE public.events
  ADD CONSTRAINT events_dates_valid
  CHECK (end_date >= start_date);

-- Future date only
ALTER TABLE public.events
  ADD CONSTRAINT events_start_future
  CHECK (start_date > NOW());

-- Within reasonable range
ALTER TABLE public.events
  ADD CONSTRAINT events_date_range
  CHECK (
    start_date > '2020-01-01'::timestamptz
    AND start_date < '2100-01-01'::timestamptz
  );

-- Duration limit (max 30 days)
ALTER TABLE public.events
  ADD CONSTRAINT events_max_duration
  CHECK (end_date - start_date <= INTERVAL '30 days');

-- Born in past (for DOB)
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_dob_valid
  CHECK (
    date_of_birth IS NULL OR
    (date_of_birth < CURRENT_DATE AND date_of_birth > '1900-01-01')
  );
```

**ENUM-like Checks:**
```sql
-- Status values
ALTER TABLE public.events
  ADD CONSTRAINT events_status_valid
  CHECK (status IN ('draft', 'published', 'cancelled', 'completed'));

-- Or use actual ENUM type
CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');

ALTER TABLE public.events
  ALTER COLUMN status TYPE event_status
  USING status::event_status;

-- Currency codes
ALTER TABLE public.events
  ADD CONSTRAINT events_currency_valid
  CHECK (currency IN ('PKR', 'USD', 'EUR', 'GBP'));

-- Country codes
ALTER TABLE public.events
  ADD CONSTRAINT events_country_valid
  CHECK (country ~ '^[A-Z]{2}$' OR country IN ('Pakistan', 'India', 'UAE'));
```

**Conditional Checks:**
```sql
-- If free, price must be 0
ALTER TABLE public.events
  ADD CONSTRAINT events_free_price
  CHECK (
    (is_free = true AND price = 0) OR
    (is_free = false AND price > 0)
  );

-- Online events need URL, physical need address
ALTER TABLE public.events
  ADD CONSTRAINT events_location_required
  CHECK (
    (is_online = true AND online_url IS NOT NULL) OR
    (is_online = false AND location_address IS NOT NULL)
  );

-- VIP ticket must cost more
ALTER TABLE public.tickets
  ADD CONSTRAINT tickets_vip_premium
  CHECK (
    ticket_type != 'vip' OR price >= 1000
  );
```

**Array Checks:**
```sql
-- Non-empty array
ALTER TABLE public.events
  ADD CONSTRAINT events_tags_not_empty
  CHECK (
    tags IS NULL OR
    array_length(tags, 1) > 0
  );

-- Maximum array length
ALTER TABLE public.events
  ADD CONSTRAINT events_images_max
  CHECK (
    images IS NULL OR
    array_length(images, 1) <= 10
  );

-- Array values format
ALTER TABLE public.events
  ADD CONSTRAINT events_tags_lowercase
  CHECK (
    tags IS NULL OR
    tags = ARRAY(SELECT lower(unnest(tags)))
  );
```

#### Step 5: FOREIGN KEY Constraints

```sql
-- Basic foreign key
CREATE TABLE public.events (
  id UUID PRIMARY KEY,
  organizer_id UUID NOT NULL REFERENCES public.profiles(id),
  category_id UUID REFERENCES public.categories(id)
);

-- With cascade options
ALTER TABLE public.events
  ADD CONSTRAINT events_organizer_fk
  FOREIGN KEY (organizer_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE      -- Delete events when profile deleted
  ON UPDATE CASCADE;     -- Update if profile id changes

-- Set null on delete
ALTER TABLE public.events
  ADD CONSTRAINT events_category_fk
  FOREIGN KEY (category_id)
  REFERENCES public.categories(id)
  ON DELETE SET NULL;    -- Set category_id to NULL when category deleted

-- Restrict delete (prevent if referenced)
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_events_restrict
  FOREIGN KEY (id)
  REFERENCES auth.users(id)
  ON DELETE RESTRICT;    -- Cannot delete user if profile exists

-- Self-referencing (parent-child)
ALTER TABLE public.categories
  ADD COLUMN parent_id UUID REFERENCES public.categories(id);
```

#### Step 6: Custom Domains (Reusable Types)

```sql
-- Email domain
CREATE DOMAIN email_address AS TEXT
  CHECK (VALUE ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Pakistan phone domain
CREATE DOMAIN pk_phone AS TEXT
  CHECK (VALUE ~ '^\+92[0-9]{10}$' OR VALUE ~ '^03[0-9]{9}$');

-- Positive integer domain
CREATE DOMAIN positive_int AS INTEGER
  CHECK (VALUE > 0);

-- URL domain
CREATE DOMAIN url AS TEXT
  CHECK (VALUE ~ '^https?://[^\s/$.?#].[^\s]*$');

-- Price domain
CREATE DOMAIN price AS DECIMAL(10, 2)
  CHECK (VALUE >= 0);

-- Slug domain
CREATE DOMAIN slug AS TEXT
  CHECK (VALUE ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

-- Use domains in tables
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  email email_address NOT NULL UNIQUE,
  phone pk_phone,
  website url
);

CREATE TABLE public.events (
  id UUID PRIMARY KEY,
  slug slug UNIQUE NOT NULL,
  price price DEFAULT 0,
  capacity positive_int
);
```

#### Step 7: Trigger-Based Validation

```sql
-- Validation function
CREATE OR REPLACE FUNCTION validate_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Title validation
  IF length(trim(NEW.title)) < 5 THEN
    RAISE EXCEPTION 'Event title must be at least 5 characters';
  END IF;

  -- Date validation
  IF NEW.start_date <= NOW() AND TG_OP = 'INSERT' THEN
    RAISE EXCEPTION 'Event start date must be in the future';
  END IF;

  -- Capacity vs attendees
  IF NEW.capacity IS NOT NULL AND NEW.attendee_count > NEW.capacity THEN
    RAISE EXCEPTION 'Attendee count cannot exceed capacity';
  END IF;

  -- Organizer must exist and have correct role
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = NEW.organizer_id
    AND role IN ('organizer', 'admin')
  ) THEN
    RAISE EXCEPTION 'Organizer must have organizer or admin role';
  END IF;

  -- Auto-set published_at
  IF NEW.status = 'published' AND OLD.status != 'published' THEN
    NEW.published_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger
CREATE TRIGGER events_validate
  BEFORE INSERT OR UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION validate_event();

-- Registration validation
CREATE OR REPLACE FUNCTION validate_registration()
RETURNS TRIGGER AS $$
DECLARE
  event_record RECORD;
BEGIN
  -- Get event details
  SELECT * INTO event_record
  FROM public.events
  WHERE id = NEW.event_id;

  -- Event must exist
  IF event_record IS NULL THEN
    RAISE EXCEPTION 'Event not found';
  END IF;

  -- Event must be published
  IF event_record.status != 'published' THEN
    RAISE EXCEPTION 'Cannot register for unpublished event';
  END IF;

  -- Event must not have started
  IF event_record.start_date <= NOW() THEN
    RAISE EXCEPTION 'Cannot register for past or ongoing event';
  END IF;

  -- Check capacity
  IF event_record.capacity IS NOT NULL
     AND event_record.attendee_count >= event_record.capacity THEN
    RAISE EXCEPTION 'Event is at full capacity';
  END IF;

  -- Check duplicate registration
  IF EXISTS (
    SELECT 1 FROM public.attendees
    WHERE event_id = NEW.event_id
    AND user_id = NEW.user_id
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) THEN
    RAISE EXCEPTION 'User already registered for this event';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER attendees_validate
  BEFORE INSERT OR UPDATE ON public.attendees
  FOR EACH ROW
  EXECUTE FUNCTION validate_registration();
```

#### Step 8: Auto-Sanitization Triggers

```sql
-- Sanitize and normalize data
CREATE OR REPLACE FUNCTION sanitize_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Trim whitespace
  NEW.full_name = trim(NEW.full_name);
  NEW.email = lower(trim(NEW.email));

  -- Normalize phone
  IF NEW.phone IS NOT NULL THEN
    NEW.phone = regexp_replace(NEW.phone, '[^0-9+]', '', 'g');
    -- Convert 03xx to +923xx
    IF NEW.phone ~ '^03[0-9]{9}$' THEN
      NEW.phone = '+92' || substring(NEW.phone from 2);
    END IF;
  END IF;

  -- Capitalize name
  NEW.full_name = initcap(NEW.full_name);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_sanitize
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION sanitize_profile();

-- Sanitize event data
CREATE OR REPLACE FUNCTION sanitize_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Trim strings
  NEW.title = trim(NEW.title);
  NEW.description = trim(NEW.description);
  NEW.location_name = trim(NEW.location_name);

  -- Normalize tags (lowercase, unique)
  IF NEW.tags IS NOT NULL THEN
    NEW.tags = ARRAY(
      SELECT DISTINCT lower(trim(tag))
      FROM unnest(NEW.tags) AS tag
      WHERE trim(tag) != ''
    );
  END IF;

  -- Generate slug if empty
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug = lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
    NEW.slug = trim(both '-' from NEW.slug);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_sanitize
  BEFORE INSERT OR UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION sanitize_event();
```

#### Step 9: Complete Validated Table Example

```sql
-- ============================================
-- FULLY VALIDATED EVENTS TABLE
-- ============================================

CREATE TABLE public.events (
  -- Primary key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Foreign keys
  organizer_id UUID NOT NULL
    REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID
    REFERENCES public.categories(id) ON DELETE SET NULL,

  -- Required strings with length validation
  title TEXT NOT NULL
    CONSTRAINT title_length CHECK (length(trim(title)) BETWEEN 5 AND 200),

  slug TEXT NOT NULL UNIQUE
    CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),

  -- Optional strings with validation
  description TEXT
    CONSTRAINT description_length CHECK (
      description IS NULL OR length(description) BETWEEN 10 AND 10000
    ),

  short_description TEXT
    CONSTRAINT short_desc_length CHECK (
      short_description IS NULL OR length(short_description) <= 300
    ),

  -- Location with conditional requirement
  location_name TEXT,
  location_address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Pakistan',
  is_online BOOLEAN NOT NULL DEFAULT false,
  online_url TEXT
    CONSTRAINT url_format CHECK (
      online_url IS NULL OR online_url ~ '^https?://'
    ),

  CONSTRAINT location_required CHECK (
    (is_online = true AND online_url IS NOT NULL) OR
    (is_online = false AND location_address IS NOT NULL)
  ),

  -- Coordinates validation
  latitude DECIMAL(10, 8)
    CONSTRAINT lat_range CHECK (latitude BETWEEN -90 AND 90),
  longitude DECIMAL(11, 8)
    CONSTRAINT lng_range CHECK (longitude BETWEEN -180 AND 180),

  -- Date validation
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'Asia/Karachi',

  CONSTRAINT dates_valid CHECK (end_date >= start_date),
  CONSTRAINT duration_limit CHECK (end_date - start_date <= INTERVAL '30 days'),

  -- Capacity and pricing
  capacity INTEGER
    CONSTRAINT capacity_positive CHECK (capacity IS NULL OR capacity > 0),
  attendee_count INTEGER DEFAULT 0
    CONSTRAINT attendee_count_valid CHECK (attendee_count >= 0),

  is_free BOOLEAN NOT NULL DEFAULT true,
  price DECIMAL(10, 2) DEFAULT 0
    CONSTRAINT price_valid CHECK (price >= 0 AND price <= 10000000),
  currency TEXT DEFAULT 'PKR'
    CONSTRAINT currency_valid CHECK (currency IN ('PKR', 'USD', 'EUR')),

  CONSTRAINT free_price_match CHECK (
    (is_free = true AND price = 0) OR (is_free = false AND price > 0)
  ),

  -- Media
  cover_image TEXT
    CONSTRAINT cover_url CHECK (
      cover_image IS NULL OR cover_image ~ '^https?://'
    ),
  images TEXT[]
    CONSTRAINT images_limit CHECK (
      images IS NULL OR array_length(images, 1) <= 10
    ),

  -- Status enum
  status TEXT DEFAULT 'draft'
    CONSTRAINT status_valid CHECK (
      status IN ('draft', 'published', 'cancelled', 'completed')
    ),
  is_featured BOOLEAN DEFAULT false,

  -- Tags
  tags TEXT[]
    CONSTRAINT tags_limit CHECK (
      tags IS NULL OR array_length(tags, 1) <= 20
    ),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  published_at TIMESTAMPTZ,

  -- Capacity check
  CONSTRAINT attendees_within_capacity CHECK (
    capacity IS NULL OR attendee_count <= capacity
  )
);
```

### Validation Quick Reference

| Validation Type | SQL Example |
|-----------------|-------------|
| Not empty | `CHECK (length(trim(col)) > 0)` |
| Min length | `CHECK (length(col) >= 3)` |
| Max length | `CHECK (length(col) <= 200)` |
| Range | `CHECK (col BETWEEN 0 AND 100)` |
| Positive | `CHECK (col > 0)` |
| Email format | `CHECK (col ~* '^[A-Za-z0-9._%+-]+@...')` |
| Future date | `CHECK (col > NOW())` |
| Date range | `CHECK (end_date >= start_date)` |
| Enum values | `CHECK (col IN ('a', 'b', 'c'))` |
| Conditional | `CHECK ((a = true AND b IS NOT NULL) OR ...)` |
| Array length | `CHECK (array_length(col, 1) <= 10)` |
| URL format | `CHECK (col ~ '^https?://')` |

### Output Format

Provide implementation with:
- Appropriate constraint types for each validation
- Named constraints for clear error messages
- Trigger functions for complex validations
- Sanitization triggers for data normalization
- Domain types for reusable validations

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Constraint name conflict | Use unique descriptive names |
| Existing data violates new constraint | Clean data first or add WHERE clause |
| Complex validation not possible | Use trigger function |
| Performance issues | Index columns used in constraints |
| Cryptic error messages | Use RAISE EXCEPTION with clear message |

## Notes

- Constraints are enforced at database level - cannot be bypassed
- Name constraints for clearer error messages
- Use triggers for complex cross-table validation
- Sanitization triggers normalize data automatically
- Domains create reusable validation types
- Test constraints with invalid data before deploying
- Consider partial indexes for conditional uniqueness
