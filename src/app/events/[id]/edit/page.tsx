'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Event } from '@/lib/database.types'

const categories = [
  'Music',
  'Sports',
  'Arts & Culture',
  'Food & Drink',
  'Technology',
  'Business',
  'Health & Wellness',
  'Community',
  'Education',
  'Other'
]

type Props = {
  params: Promise<{ id: string }>
}

export default function EditEventPage({ params }: Props) {
  const router = useRouter()
  const [eventId, setEventId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '18:00',
    location_name: '',
    category: 'Community'
  })

  useEffect(() => {
    async function loadEvent() {
      try {
        const { id } = await params
        setEventId(id)

        // Check if user is authenticated
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          router.push('/login')
          return
        }

        // Fetch the event
        const { data: event, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single()

        if (eventError || !event) {
          setError('Event not found')
          setIsLoading(false)
          return
        }

        const typedEvent = event as Event

        // Security check: Only the organizer can edit
        if (typedEvent.organizer_id !== user.id) {
          router.push('/')
          return
        }

        // Pre-fill form with existing data
        setFormData({
          title: typedEvent.title,
          description: typedEvent.description || '',
          date: typedEvent.date,
          time: typedEvent.time,
          location_name: typedEvent.location_name,
          category: typedEvent.category
        })

        if (typedEvent.image_url) {
          setOriginalImageUrl(typedEvent.image_url)
          setImagePreview(typedEvent.image_url)
        }

        setIsLoading(false)
      } catch (err) {
        console.error('Error loading event:', err)
        setError('Failed to load event')
        setIsLoading(false)
      }
    }

    loadEvent()
  }, [params, router])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
      setRemoveCurrentImage(false)
      setError(null)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setRemoveCurrentImage(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const restoreOriginalImage = () => {
    setImageFile(null)
    setImagePreview(originalImageUrl)
    setRemoveCurrentImage(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const deleteImageFromStorage = async (imageUrl: string) => {
    const bucketName = 'Event-images'
    const urlParts = imageUrl.split(`${bucketName}/`)

    if (urlParts.length > 1) {
      const filePath = urlParts[1]
      const { error: storageError } = await supabase.storage
        .from(bucketName)
        .remove([filePath])

      if (storageError) {
        console.error('Failed to delete old image:', storageError.message)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error('You must be logged in to edit an event')
      }

      // Re-verify ownership before updating
      const { data: existingEvent, error: fetchError } = await supabase
        .from('events')
        .select('organizer_id, image_url')
        .eq('id', eventId)
        .single()

      if (fetchError || !existingEvent) {
        throw new Error('Event not found')
      }

      if (existingEvent.organizer_id !== user.id) {
        throw new Error('You do not have permission to edit this event')
      }

      let newImageUrl: string | null = originalImageUrl

      // Handle image changes
      if (imageFile) {
        // Upload new image
        const fileExt = imageFile.name.split('.').pop()?.toLowerCase()
        const uniqueId = Math.random().toString(36).substring(2) + Date.now()
        const fileName = `${user.id}/${uniqueId}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('Event-images')
          .upload(fileName, imageFile, {
            contentType: imageFile.type,
            upsert: false
          })

        if (uploadError) {
          throw new Error(`Image upload error: ${uploadError.message}`)
        }

        const { data: urlData } = supabase.storage
          .from('Event-images')
          .getPublicUrl(fileName)

        newImageUrl = urlData.publicUrl

        // Delete old image if it existed
        if (originalImageUrl) {
          await deleteImageFromStorage(originalImageUrl)
        }
      } else if (removeCurrentImage && originalImageUrl) {
        // User wants to remove the image without replacing it
        await deleteImageFromStorage(originalImageUrl)
        newImageUrl = null
      }

      // Update the event
      const { error: updateError } = await supabase
        .from('events')
        .update({
          title: formData.title,
          description: formData.description || null,
          date: formData.date,
          time: formData.time,
          location_name: formData.location_name,
          category: formData.category,
          image_url: newImageUrl
        })
        .eq('id', eventId)
        .eq('organizer_id', user.id) // Extra security check

      if (updateError) {
        throw new Error(`Database error: ${updateError.message}`)
      }

      router.push(`/events/${eventId}`)
      router.refresh()
    } catch (err) {
      console.error('Error updating event:', err)
      const errorMessage = err instanceof Error ? err.message : JSON.stringify(err)
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event...</p>
        </div>
      </div>
    )
  }

  if (error && !formData.title) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-3xl font-bold text-gray-900 hover:text-blue-600">
                Local Event Finder
              </Link>
              <p className="mt-2 text-gray-600">Edit your event</p>
            </div>
            <Link
              href={`/events/${eventId}`}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Cancel
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Event</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                placeholder="Enter event title"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                placeholder="Describe your event"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                  Time *
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  required
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="location_name" className="block text-sm font-medium text-gray-700 mb-1">
                Location Name *
              </label>
              <input
                type="text"
                id="location_name"
                name="location_name"
                required
                value={formData.location_name}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                placeholder="e.g., Central Park, Community Center"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Image
              </label>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 text-white p-1 rounded-full hover:bg-blue-700"
                      title="Change image"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                      title="Remove image"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {imageFile && originalImageUrl && (
                    <button
                      type="button"
                      onClick={restoreOriginalImage}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      Restore original image
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-48 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                  >
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">Click to upload an image</p>
                    <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                  </div>
                  {originalImageUrl && removeCurrentImage && (
                    <button
                      type="button"
                      onClick={restoreOriginalImage}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Restore original image
                    </button>
                  )}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <Link
                href={`/events/${eventId}`}
                className="px-6 py-3 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
