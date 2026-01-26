'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/lib/database.types'
import { User } from '@supabase/supabase-js'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Camera,
  User as UserIcon,
  Mail,
  Save,
  Loader2,
  X,
  Bell
} from 'lucide-react'
import NotificationPreferences from '@/components/NotificationPreferences'

// Extend Window interface to include our custom event
declare global {
  interface WindowEventMap {
    'profileUpdated': CustomEvent<{ fullName: string | null; avatarUrl: string | null }>;
  }
}

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Form fields
  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let cancelled = false

    const checkAuthAndFetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (cancelled) return

      if (!session) {
        window.location.href = '/login'
        return
      }

      setUser(session.user)

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle() as { data: Profile | null; error: any }

      if (cancelled) return

      if (error) {
        console.error('Error fetching profile:', error)
        toast.error('Failed to load profile')
      } else if (profileData) {
        setProfile(profileData)
        setFullName(profileData.full_name || '')
        setAvatarUrl(profileData.avatar_url || null)
      }

      setLoading(false)
    }

    checkAuthAndFetchProfile()

    return () => {
      cancelled = true
    }
  }, [])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload an image file (JPEG, PNG, GIF, or WebP)')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setSelectedFile(file)

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    setAvatarPreview(previewUrl)
  }

  const removeSelectedImage = () => {
    setSelectedFile(null)
    setAvatarPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadAvatar = async (): Promise<string | null> => {
    if (!selectedFile || !user) return avatarUrl

    setUploadingAvatar(true)

    try {
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('Avatar')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        toast.error(`Failed to upload image: ${uploadError.message}`)
        return null
      }

      const { data: { publicUrl } } = supabase.storage
        .from('Avatar')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Avatar upload error:', error)
      toast.error('An error occurred while uploading')
      return null
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    const loadingToast = toast.loading('Saving changes...')

    try {
      // Upload new avatar if selected
      let newAvatarUrl = avatarUrl
      if (selectedFile) {
        const uploadedUrl = await uploadAvatar()
        if (uploadedUrl) {
          newAvatarUrl = uploadedUrl
        } else {
          toast.dismiss(loadingToast)
          setSaving(false)
          return
        }
      }

      // Update profile in database
      const { error: updateError } = await (supabase.from('profiles') as any)
        .update({
          full_name: fullName.trim() || null,
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Profile update error:', updateError)
        toast.error('Failed to update profile', { id: loadingToast })
        return
      }

      // Update local state
      setAvatarUrl(newAvatarUrl)
      setAvatarPreview(null)
      setSelectedFile(null)
      setProfile(prev => prev ? {
        ...prev,
        full_name: fullName.trim() || null,
        avatar_url: newAvatarUrl
      } : null)

      toast.success('Profile updated successfully!', { id: loadingToast })

      // Notify other components that profile was updated
      window.dispatchEvent(new CustomEvent('profileUpdated', {
        detail: {
          fullName: fullName.trim() || null,
          avatarUrl: newAvatarUrl
        }
      }));

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

    } catch (error) {
      console.error('Save error:', error)
      toast.error('An error occurred', { id: loadingToast })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d9488]"></div>
      </div>
    )
  }

  const displayAvatar = avatarPreview || avatarUrl

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#0d9488] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            <Link
              href="/profile"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
              />

              {/* Avatar Display */}
              <div className="relative">
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-[#0d9488] shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center border-4 border-[#0d9488] shadow-lg">
                    <UserIcon className="w-16 h-16 text-white/70" />
                  </div>
                )}

                {/* Camera Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-[#0d9488] hover:bg-[#0b7a6e] rounded-full flex items-center justify-center shadow-lg transition-colors disabled:opacity-50"
                  title="Change profile picture"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 text-white" />
                  )}
                </button>

                {/* Remove Preview Button */}
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={removeSelectedImage}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-colors"
                    title="Remove selected image"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
            </div>

            {avatarPreview && (
              <p className="text-sm text-amber-600 font-medium">
                New image selected - Click Save to apply
              </p>
            )}

            <p className="text-sm text-gray-500 mt-2">
              Click the camera icon to upload a new photo
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0d9488] focus:border-[#0d9488] transition-colors text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || uploadingAvatar}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0d9488] hover:bg-[#0b7a6e] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>

            <Link
              href="/profile"
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>

        {/* Notification Preferences Section */}
        {user && (
          <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 mt-6">
            <NotificationPreferences userId={user.id} />
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Your profile information is visible to other users when you create or join events.</p>
        </div>
      </main>
    </div>
  )
}
