-- Add role column to profiles table
-- Possible values: 'seeker', 'host', or NULL (not yet selected)

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('seeker', 'host'));

-- Add comment for documentation
COMMENT ON COLUMN profiles.role IS 'User role: seeker (event attendee) or host (event organizer)';

-- Create an index for faster role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
