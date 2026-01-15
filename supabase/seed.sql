-- Seed Data for Local Event Finder
-- Run this in Supabase SQL Editor after running the migration

-- First, create a test user in auth.users (this simulates a signed-up user)
-- Note: In production, users are created via Supabase Auth
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'demo@eventfinder.com',
  '$2a$10$abcdefghijklmnopqrstuvwxyz123456789',
  NOW(),
  NOW(),
  NOW(),
  '{"full_name": "Demo Organizer"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- The trigger should auto-create the profile, but let's ensure it exists
INSERT INTO profiles (id, email, full_name, avatar_url)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'demo@eventfinder.com',
  'Demo Organizer',
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Insert sample events
INSERT INTO events (title, description, date, time, location_name, latitude, longitude, category, image_url, organizer_id, is_featured)
VALUES
  (
    'Tech Meetup: AI & Machine Learning',
    'Join us for an evening of discussions about the latest trends in AI and machine learning. Network with fellow tech enthusiasts and learn from industry experts.',
    '2026-01-15',
    '18:00',
    'Innovation Hub, Downtown',
    31.5204,
    74.3587,
    'Technology',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    true
  ),
  (
    'Weekend Farmers Market',
    'Fresh produce, artisanal goods, and local crafts. Support local farmers and small businesses every weekend.',
    '2026-01-18',
    '08:00',
    'Central Park Plaza',
    31.5497,
    74.3436,
    'Food & Drink',
    'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    false
  ),
  (
    'Live Jazz Night',
    'Experience the smooth sounds of local jazz musicians in an intimate setting. Drinks and appetizers available.',
    '2026-01-20',
    '20:00',
    'Blue Note Lounge',
    31.5120,
    74.3290,
    'Music',
    'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    true
  ),
  (
    'Yoga in the Park',
    'Start your morning with a refreshing outdoor yoga session. All skill levels welcome. Bring your own mat.',
    '2026-01-22',
    '07:00',
    'Riverside Gardens',
    31.5300,
    74.3500,
    'Health & Wellness',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    false
  ),
  (
    'Startup Pitch Competition',
    'Watch innovative startups pitch their ideas to investors. Great networking opportunity for entrepreneurs.',
    '2026-01-25',
    '14:00',
    'Business Center Hall A',
    31.5150,
    74.3400,
    'Business',
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    true
  ),
  (
    'Art Exhibition: Modern Perspectives',
    'Explore contemporary artworks from emerging local artists. Opening night includes meet and greet with artists.',
    '2026-01-28',
    '17:00',
    'City Art Gallery',
    31.5250,
    74.3550,
    'Arts & Culture',
    'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    false
  ),
  (
    'Community Book Club',
    'Monthly book club meeting. This month we are discussing "The Midnight Library" by Matt Haig.',
    '2026-01-30',
    '19:00',
    'Public Library, Room 201',
    31.5180,
    74.3480,
    'Community',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    false
  ),
  (
    'Food Truck Festival',
    'Over 20 food trucks serving cuisines from around the world. Live music and family activities included.',
    '2026-02-01',
    '12:00',
    'Stadium Parking Lot',
    31.5350,
    74.3600,
    'Food & Drink',
    'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    true
  );
