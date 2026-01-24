'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { EventInsert, Profile } from '@/lib/database.types'
import { User } from '@supabase/supabase-js'
import toast, { Toaster } from 'react-hot-toast'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Type,
  FileText,
  Tag,
  ImagePlus,
  X,
  Loader2,
  Sparkles,
  CalendarPlus
} from 'lucide-react'

const categories = [
  { value: 'Concerts', label: 'Concerts', icon: '🎵' },
  { value: 'Food', label: 'Food & Dining', icon: '🍔' },
  { value: 'Tech', label: 'Technology', icon: '💻' },
  { value: 'Sports', label: 'Sports', icon: '⚽' },
  { value: 'Arts', label: 'Arts & Culture', icon: '🎨' },
  { value: 'Business', label: 'Business', icon: '💼' },
  { value: 'Health', label: 'Health & Wellness', icon: '🧘' },
  { value: 'Education', label: 'Education', icon: '📚' },
  { value: 'Community', label: 'Community', icon: '🤝' },
  { value: 'Other', label: 'Other', icon: '✨' }
]

export default function CreateEventPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
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
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        toast.error('Please login to create an event')
        router.push('/login')
        return
      }

      // Check if user is a host
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle() as { data: Pick<Profile, 'role'> | null }

      if (profile?.role !== 'host') {
        toast.error('Only hosts can create events')
        router.push('/')
        return
      }

      setUser(session.user)
      setLoading(false)
    }

    checkAuth()
  }, [router])

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
        toast.error('Please select an image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error('You must be logged in to create an event')
      return
    }

    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter an event title')
      return
    }
    if (!formData.date) {
      toast.error('Please select a date')
      return
    }
    if (!formData.location_name.trim()) {
      toast.error('Please enter a location')
      return
    }

    setIsSubmitting(true)
    const loadingToast = toast.loading('Creating your event...')

    try {
      let imageUrl: string | null = null

      // Upload image if selected
      if (imageFile) {
        setUploadProgress(10)
        const fileExt = imageFile.name.split('.').pop()?.toLowerCase()
        const uniqueId = Math.random().toString(36).substring(2) + Date.now()
        const fileName = `${user.id}/${uniqueId}.${fileExt}`

        setUploadProgress(30)
        const { error: uploadError } = await supabase.storage
          .from('Event-images')
          .upload(fileName, imageFile, {
            contentType: imageFile.type,
            upsert: false
          })

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`)
        }

        setUploadProgress(70)
        const { data: urlData } = supabase.storage
          .from('Event-images')
          .getPublicUrl(fileName)

        imageUrl = urlData.publicUrl
        setUploadProgress(90)
      }

      const eventData: EventInsert = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        date: formData.date,
        time: formData.time,
        location_name: formData.location_name.trim(),
        category: formData.category,
        organizer_id: user.id,
        image_url: imageUrl
      }

      const { error: insertError } = await supabase
        .from('events')
        .insert(eventData as never)

      if (insertError) {
        throw new Error(`Failed to create event: ${insertError.message}`)
      }

      setUploadProgress(100)
      toast.dismiss(loadingToast)

      // Celebration toast
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-gradient-to-r from-orange-500 to-orange-600 shadow-2xl rounded-2xl pointer-events-auto flex items-center p-4`}
        >
          <div className="flex-shrink-0">
            <span className="text-4xl">🎉</span>
          </div>
          <div className="ml-4 flex-1">
            <p className="text-lg font-bold text-white">Event Created!</p>
            <p className="text-white/90 text-sm">Your event is now live and ready for attendees.</p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="ml-4 text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ), { duration: 4000 })

      // Redirect to Host Dashboard
      setTimeout(() => {
        router.push('/dashboard/host')
      }, 1500)

    } catch (err) {
      console.error('Error creating event:', err)
      toast.dismiss(loadingToast)
      toast.error(err instanceof Error ? err.message : 'Failed to create event')
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-center" />

      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-orange-600 py-6 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/host"
                className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <CalendarPlus className="w-7 h-7" />
                  Create Event
                </h1>
                <p className="text-white/80 text-sm">Share your event with the community</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Form Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              Event Details
            </h2>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Type className="w-4 h-4 text-teal-500" />
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900 placeholder-gray-400"
                  placeholder="Give your event a catchy title"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="w-4 h-4 text-teal-500" />
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900 placeholder-gray-400 resize-none"
                  placeholder="Tell people what your event is about..."
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 text-teal-500" />
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="time" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Clock className="w-4 h-4 text-teal-500" />
                    Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    required
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location_name" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 text-teal-500" />
                  Location in Karachi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="location_name"
                  name="location_name"
                  required
                  value={formData.location_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900 placeholder-gray-400"
                  placeholder="e.g., Arts Council, Clifton Beach, PIDC"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Tag className="w-4 h-4 text-teal-500" />
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                      className={`p-3 rounded-xl border-2 transition-all text-center ${
                        formData.category === cat.value
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xl block mb-1">{cat.icon}</span>
                      <span className="text-xs font-medium">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ImagePlus className="w-5 h-5 text-orange-500" />
              Event Image
            </h2>

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="font-semibold">{imageFile?.name}</p>
                  <p className="text-sm text-white/80">
                    {imageFile && (imageFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-64 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all group"
              >
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                  <ImagePlus className="w-8 h-8 text-orange-500" />
                </div>
                <p className="text-gray-700 font-semibold mb-1">Click to upload an image</p>
                <p className="text-gray-500 text-sm">PNG, JPG, WebP up to 5MB</p>
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

          {/* Upload Progress */}
          {isSubmitting && uploadProgress > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                <span className="font-semibold text-gray-700">Uploading...</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-orange-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2 text-right">{uploadProgress}%</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Event...
                </>
              ) : (
                <>
                  <CalendarPlus className="w-5 h-5" />
                  Create Event
                </>
              )}
            </button>

            <Link
              href="/dashboard/host"
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 text-gray-700 font-semibold rounded-2xl hover:bg-gray-200 transition-all"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
