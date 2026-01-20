# Supabase Storage Policies

Configure storage buckets and permissions for event images and user avatars.

## Trigger Phrases

- "setup storage policies"
- "configure supabase storage"
- "create image upload buckets"
- "storage permissions for avatars"
- "/storage-policies"

## Instructions

Set up Supabase Storage buckets with proper policies for secure file uploads and access control.

### Context Gathering

1. Identify file types to be stored (images, documents, videos)
2. Determine access patterns (public, private, user-specific)
3. Check file size limits needed
4. Identify who can upload/delete files

### Execution Steps

#### Step 1: Storage Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE STORAGE                              │
├─────────────────────────────────────────────────────────────────┤
│  BUCKETS                                                         │
│  ├── avatars (public)      → User profile pictures              │
│  ├── event-images (public) → Event cover images & galleries     │
│  ├── event-files (private) → Event documents & attachments      │
│  └── tickets (private)     → Generated ticket PDFs              │
├─────────────────────────────────────────────────────────────────┤
│  FOLDER STRUCTURE                                                │
│  avatars/                                                        │
│  └── {user_id}/avatar.jpg                                       │
│                                                                  │
│  event-images/                                                   │
│  └── {event_id}/                                                │
│      ├── cover.jpg                                              │
│      └── gallery/                                               │
│          ├── 1.jpg                                              │
│          └── 2.jpg                                              │
└─────────────────────────────────────────────────────────────────┘
```

#### Step 2: Create Storage Buckets (SQL)

```sql
-- ============================================
-- AVATARS BUCKET (Public)
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,  -- Public bucket
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- ============================================
-- EVENT IMAGES BUCKET (Public)
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images',
  true,  -- Public bucket
  10485760,  -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- ============================================
-- EVENT FILES BUCKET (Private)
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-files',
  'event-files',
  false,  -- Private bucket
  52428800,  -- 50MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ]
);

-- ============================================
-- TICKETS BUCKET (Private)
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tickets',
  'tickets',
  false,  -- Private bucket
  2097152,  -- 2MB limit
  ARRAY['application/pdf', 'image/png']
);
```

#### Step 3: Avatars Bucket Policies

```sql
-- ============================================
-- AVATARS STORAGE POLICIES
-- ============================================

-- Anyone can VIEW avatars (public bucket)
CREATE POLICY "avatars_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Users can UPLOAD their own avatar
CREATE POLICY "avatars_user_upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can UPDATE their own avatar
CREATE POLICY "avatars_user_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can DELETE their own avatar
CREATE POLICY "avatars_user_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Step 4: Event Images Bucket Policies

```sql
-- ============================================
-- EVENT IMAGES STORAGE POLICIES
-- ============================================

-- Anyone can VIEW event images (public bucket)
CREATE POLICY "event_images_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

-- Event organizers can UPLOAD images to their events
CREATE POLICY "event_images_organizer_upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'event-images'
  AND EXISTS (
    SELECT 1 FROM public.events
    WHERE id::text = (storage.foldername(name))[1]
    AND organizer_id = auth.uid()
  )
);

-- Event organizers can UPDATE their event images
CREATE POLICY "event_images_organizer_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'event-images'
  AND EXISTS (
    SELECT 1 FROM public.events
    WHERE id::text = (storage.foldername(name))[1]
    AND organizer_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'event-images'
  AND EXISTS (
    SELECT 1 FROM public.events
    WHERE id::text = (storage.foldername(name))[1]
    AND organizer_id = auth.uid()
  )
);

-- Event organizers can DELETE their event images
CREATE POLICY "event_images_organizer_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'event-images'
  AND EXISTS (
    SELECT 1 FROM public.events
    WHERE id::text = (storage.foldername(name))[1]
    AND organizer_id = auth.uid()
  )
);

-- Admin can manage all event images
CREATE POLICY "event_images_admin_all"
ON storage.objects FOR ALL
USING (
  bucket_id = 'event-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

#### Step 5: Event Files Bucket Policies (Private)

```sql
-- ============================================
-- EVENT FILES STORAGE POLICIES (Private)
-- ============================================

-- Organizer can view their event files
CREATE POLICY "event_files_organizer_read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'event-files'
  AND EXISTS (
    SELECT 1 FROM public.events
    WHERE id::text = (storage.foldername(name))[1]
    AND organizer_id = auth.uid()
  )
);

-- Attendees can view files for events they're registered for
CREATE POLICY "event_files_attendee_read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'event-files'
  AND EXISTS (
    SELECT 1 FROM public.attendees a
    JOIN public.events e ON a.event_id = e.id
    WHERE e.id::text = (storage.foldername(name))[1]
    AND a.user_id = auth.uid()
    AND a.status IN ('registered', 'confirmed', 'attended')
  )
);

-- Organizer can upload files to their events
CREATE POLICY "event_files_organizer_upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'event-files'
  AND EXISTS (
    SELECT 1 FROM public.events
    WHERE id::text = (storage.foldername(name))[1]
    AND organizer_id = auth.uid()
  )
);

-- Organizer can delete their event files
CREATE POLICY "event_files_organizer_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'event-files'
  AND EXISTS (
    SELECT 1 FROM public.events
    WHERE id::text = (storage.foldername(name))[1]
    AND organizer_id = auth.uid()
  )
);
```

#### Step 6: Tickets Bucket Policies (Private)

```sql
-- ============================================
-- TICKETS STORAGE POLICIES (Private)
-- ============================================

-- Users can view their own tickets
CREATE POLICY "tickets_user_read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'tickets'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- System can create tickets (via service role)
-- No INSERT policy for regular users - tickets generated server-side

-- Organizer can view tickets for their events
CREATE POLICY "tickets_organizer_read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'tickets'
  AND EXISTS (
    SELECT 1 FROM public.attendees a
    JOIN public.events e ON a.event_id = e.id
    WHERE a.user_id::text = (storage.foldername(name))[1]
    AND e.organizer_id = auth.uid()
  )
);
```

#### Step 7: TypeScript Implementation

**Storage Client Setup:**
```typescript
// lib/storage.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()

// Bucket names
export const BUCKETS = {
  AVATARS: 'avatars',
  EVENT_IMAGES: 'event-images',
  EVENT_FILES: 'event-files',
  TICKETS: 'tickets',
} as const

// File path helpers
export const getAvatarPath = (userId: string, fileName: string) =>
  `${userId}/${fileName}`

export const getEventImagePath = (eventId: string, fileName: string) =>
  `${eventId}/${fileName}`

export const getEventGalleryPath = (eventId: string, fileName: string) =>
  `${eventId}/gallery/${fileName}`

export const getTicketPath = (userId: string, ticketCode: string) =>
  `${userId}/${ticketCode}.pdf`
```

**Avatar Upload:**
```typescript
// lib/upload-avatar.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { BUCKETS, getAvatarPath } from './storage'

interface UploadAvatarResult {
  url: string | null
  error: string | null
}

export async function uploadAvatar(
  userId: string,
  file: File
): Promise<UploadAvatarResult> {
  const supabase = createClientComponentClient()

  // Validate file
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

  if (file.size > maxSize) {
    return { url: null, error: 'File size must be less than 5MB' }
  }

  if (!allowedTypes.includes(file.type)) {
    return { url: null, error: 'Only JPEG, PNG, WebP, and GIF images are allowed' }
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `avatar.${fileExt}`
  const filePath = getAvatarPath(userId, fileName)

  // Delete existing avatar first
  await supabase.storage.from(BUCKETS.AVATARS).remove([filePath])

  // Upload new avatar
  const { data, error } = await supabase.storage
    .from(BUCKETS.AVATARS)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (error) {
    return { url: null, error: error.message }
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKETS.AVATARS)
    .getPublicUrl(filePath)

  // Update profile with new avatar URL
  await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', userId)

  return { url: publicUrl, error: null }
}
```

**Event Image Upload:**
```typescript
// lib/upload-event-image.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { BUCKETS, getEventImagePath, getEventGalleryPath } from './storage'
import { v4 as uuidv4 } from 'uuid'

interface UploadEventImageResult {
  url: string | null
  error: string | null
}

export async function uploadEventCover(
  eventId: string,
  file: File
): Promise<UploadEventImageResult> {
  const supabase = createClientComponentClient()

  // Validate
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

  if (file.size > maxSize) {
    return { url: null, error: 'File size must be less than 10MB' }
  }

  if (!allowedTypes.includes(file.type)) {
    return { url: null, error: 'Only JPEG, PNG, and WebP images are allowed' }
  }

  const fileExt = file.name.split('.').pop()
  const filePath = getEventImagePath(eventId, `cover.${fileExt}`)

  // Upload
  const { error } = await supabase.storage
    .from(BUCKETS.EVENT_IMAGES)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (error) {
    return { url: null, error: error.message }
  }

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKETS.EVENT_IMAGES)
    .getPublicUrl(filePath)

  // Update event
  await supabase
    .from('events')
    .update({ cover_image: publicUrl })
    .eq('id', eventId)

  return { url: publicUrl, error: null }
}

export async function uploadEventGalleryImage(
  eventId: string,
  file: File
): Promise<UploadEventImageResult> {
  const supabase = createClientComponentClient()

  const fileExt = file.name.split('.').pop()
  const fileName = `${uuidv4()}.${fileExt}`
  const filePath = getEventGalleryPath(eventId, fileName)

  const { error } = await supabase.storage
    .from(BUCKETS.EVENT_IMAGES)
    .upload(filePath, file, {
      cacheControl: '3600',
    })

  if (error) {
    return { url: null, error: error.message }
  }

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKETS.EVENT_IMAGES)
    .getPublicUrl(filePath)

  // Add to event images array
  const { data: event } = await supabase
    .from('events')
    .select('images')
    .eq('id', eventId)
    .single()

  const images = event?.images || []
  images.push(publicUrl)

  await supabase
    .from('events')
    .update({ images })
    .eq('id', eventId)

  return { url: publicUrl, error: null }
}
```

**Delete Images:**
```typescript
// lib/delete-storage.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { BUCKETS } from './storage'

export async function deleteAvatar(userId: string): Promise<boolean> {
  const supabase = createClientComponentClient()

  // List all files in user's avatar folder
  const { data: files } = await supabase.storage
    .from(BUCKETS.AVATARS)
    .list(userId)

  if (!files || files.length === 0) return true

  const filePaths = files.map(f => `${userId}/${f.name}`)

  const { error } = await supabase.storage
    .from(BUCKETS.AVATARS)
    .remove(filePaths)

  if (!error) {
    // Clear avatar_url in profile
    await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', userId)
  }

  return !error
}

export async function deleteEventImages(eventId: string): Promise<boolean> {
  const supabase = createClientComponentClient()

  // List all files in event's folder
  const { data: files } = await supabase.storage
    .from(BUCKETS.EVENT_IMAGES)
    .list(eventId, { recursive: true })

  if (!files || files.length === 0) return true

  const filePaths = files.map(f => `${eventId}/${f.name}`)

  const { error } = await supabase.storage
    .from(BUCKETS.EVENT_IMAGES)
    .remove(filePaths)

  return !error
}
```

#### Step 8: React Upload Components

**Avatar Upload Component:**
```typescript
// components/AvatarUpload.tsx
'use client'

import { useState, useRef } from 'react'
import { uploadAvatar } from '@/lib/upload-avatar'
import Image from 'next/image'

interface AvatarUploadProps {
  userId: string
  currentAvatarUrl?: string | null
  onUploadComplete?: (url: string) => void
}

export function AvatarUpload({
  userId,
  currentAvatarUrl,
  onUploadComplete
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    const result = await uploadAvatar(userId, file)

    if (result.error) {
      setError(result.error)
    } else if (result.url) {
      setAvatarUrl(result.url)
      onUploadComplete?.(result.url)
    }

    setUploading(false)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="Avatar"
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleUpload}
        className="hidden"
        disabled={uploading}
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="text-sm text-blue-600 hover:underline disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Change Avatar'}
      </button>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
```

**Event Image Upload Component:**
```typescript
// components/EventImageUpload.tsx
'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { uploadEventCover, uploadEventGalleryImage } from '@/lib/upload-event-image'
import Image from 'next/image'

interface EventImageUploadProps {
  eventId: string
  type: 'cover' | 'gallery'
  currentUrl?: string | null
  onUploadComplete?: (url: string) => void
}

export function EventImageUpload({
  eventId,
  type,
  currentUrl,
  onUploadComplete
}: EventImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState(currentUrl)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    setError(null)

    const uploadFn = type === 'cover' ? uploadEventCover : uploadEventGalleryImage
    const result = await uploadFn(eventId, file)

    if (result.error) {
      setError(result.error)
    } else if (result.url) {
      setImageUrl(result.url)
      onUploadComplete?.(result.url)
    }

    setUploading(false)
  }, [eventId, type, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    disabled: uploading,
  })

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />

        {imageUrl ? (
          <div className="relative aspect-video w-full max-w-md mx-auto">
            <Image
              src={imageUrl}
              alt="Event image"
              fill
              className="object-cover rounded"
            />
          </div>
        ) : (
          <div className="py-8">
            <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              {isDragActive ? 'Drop image here' : 'Drag & drop or click to upload'}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              JPEG, PNG, WebP up to 10MB
            </p>
          </div>
        )}

        {uploading && (
          <div className="mt-4">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-2 text-sm text-gray-600">Uploading...</p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
```

#### Step 9: Server-Side Operations (Service Role)

```typescript
// lib/storage-admin.ts
import { createClient } from '@supabase/supabase-js'

// Server-side only - never expose to client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Generate and upload ticket PDF (server-side)
export async function uploadTicket(
  userId: string,
  ticketCode: string,
  pdfBuffer: Buffer
): Promise<string | null> {
  const filePath = `${userId}/${ticketCode}.pdf`

  const { error } = await supabaseAdmin.storage
    .from('tickets')
    .upload(filePath, pdfBuffer, {
      contentType: 'application/pdf',
      cacheControl: '3600',
    })

  if (error) {
    console.error('Ticket upload error:', error)
    return null
  }

  // Create signed URL for private bucket
  const { data } = await supabaseAdmin.storage
    .from('tickets')
    .createSignedUrl(filePath, 60 * 60 * 24 * 7) // 7 days

  return data?.signedUrl || null
}

// Cleanup old files (cron job)
export async function cleanupOldFiles(): Promise<void> {
  // List files older than 30 days in tickets bucket
  const { data: files } = await supabaseAdmin.storage
    .from('tickets')
    .list('', {
      limit: 1000,
      sortBy: { column: 'created_at', order: 'asc' }
    })

  // Filter and delete old files
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const oldFiles = files?.filter(f =>
    new Date(f.created_at) < thirtyDaysAgo
  ) || []

  if (oldFiles.length > 0) {
    await supabaseAdmin.storage
      .from('tickets')
      .remove(oldFiles.map(f => f.name))
  }
}
```

### Storage Policies Quick Reference

| Bucket | Public | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|--------|
| avatars | Yes | Anyone | Owner | Owner | Owner |
| event-images | Yes | Anyone | Organizer | Organizer | Organizer |
| event-files | No | Organizer/Attendee | Organizer | Organizer | Organizer |
| tickets | No | Owner/Organizer | Service Role | - | Service Role |

### Folder Structure Patterns

| Pattern | Example | Use Case |
|---------|---------|----------|
| `{user_id}/file` | `abc123/avatar.jpg` | User-owned files |
| `{entity_id}/file` | `event456/cover.jpg` | Entity-owned files |
| `{entity_id}/subfolder/file` | `event456/gallery/1.jpg` | Categorized files |
| `{user_id}/{entity_id}/file` | `user123/ticket456.pdf` | User-entity relationship |

### Output Format

Provide implementation with:
- Bucket creation SQL with proper settings
- Complete storage policies for all operations
- TypeScript upload/delete functions
- React upload components
- Server-side operations for private files

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "new row violates RLS" | Check storage policy WITH CHECK |
| Cannot read private file | Use signed URLs for private buckets |
| File size error | Check bucket file_size_limit |
| MIME type error | Check bucket allowed_mime_types |
| Policy not working | Verify folder path matches policy |
| CORS error | Configure CORS in Supabase dashboard |

## Notes

- Public buckets allow direct URL access, private require signed URLs
- Use `storage.foldername(name)` to extract folder path from file name
- Always validate file type and size on client before upload
- Use `upsert: true` to replace existing files
- Signed URLs have expiration - regenerate as needed
- Service role bypasses all storage policies
- Consider CDN caching for frequently accessed public files
