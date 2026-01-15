'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// Admin email that can delete any event (loaded from environment variable)
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL

type DeleteEventButtonProps = {
  eventId: string
  organizerId: string
  imageUrl: string | null
}

export default function DeleteEventButton({ eventId, organizerId, imageUrl }: DeleteEventButtonProps) {
  const router = useRouter()
  const [canDelete, setCanDelete] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkPermissions() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const isOwner = user.id === organizerId
        const userIsAdmin = user.email === ADMIN_EMAIL
        setIsAdmin(userIsAdmin)
        setCanDelete(isOwner || userIsAdmin)
      }
    }
    checkPermissions()
  }, [organizerId])

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('You must be logged in to delete an event')
      }

      const userIsAdmin = user.email === ADMIN_EMAIL
      const isOwner = user.id === organizerId

      if (!isOwner && !userIsAdmin) {
        throw new Error('You do not have permission to delete this event')
      }

      // Step 1: Delete the image from storage if it exists
      if (imageUrl) {
        // Extract the file path from the public URL
        // URL format: https://xxx.supabase.co/storage/v1/object/public/Event-images/user-id/filename.ext
        const bucketName = 'Event-images'
        const urlParts = imageUrl.split(`${bucketName}/`)

        if (urlParts.length > 1) {
          const filePath = urlParts[1]

          const { error: storageError } = await supabase.storage
            .from(bucketName)
            .remove([filePath])

          if (storageError) {
            console.error('Failed to delete image:', storageError.message)
            // Continue with event deletion even if image deletion fails
          }
        }
      }

      // Step 2: Delete the event from the database
      let query = supabase.from('events').delete().eq('id', eventId)

      // If not admin, add organizer_id check for extra security
      if (!userIsAdmin) {
        query = query.eq('organizer_id', user.id)
      }

      const { error: deleteError } = await query

      if (deleteError) {
        throw new Error(`Failed to delete event: ${deleteError.message}`)
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      console.error('Error deleting event:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete event')
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  // Don't render anything if user cannot delete
  if (!canDelete) {
    return null
  }

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {showConfirm ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium mb-3">
            Are you sure you want to delete this event?
          </p>
          <p className="text-red-600 text-sm mb-4">
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
              className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete Event
          </button>
          {isAdmin && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
              Admin
            </span>
          )}
        </div>
      )}
    </div>
  )
}
