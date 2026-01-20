'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Review, ReviewWithProfile, Profile } from '@/lib/database.types'
import { User } from '@supabase/supabase-js'

type ReviewSectionProps = {
  eventId: string
}

function StarRating({
  rating,
  onRatingChange,
  readonly = false,
  size = 'md',
}: {
  rating: number
  onRatingChange?: (rating: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}) {
  const [hoverRating, setHoverRating] = useState(0)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onRatingChange?.(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-colors`}
        >
          <svg
            className={`${sizeClasses[size]} ${
              (hoverRating || rating) >= star
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300 fill-gray-300'
            }`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        </button>
      ))}
    </div>
  )
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function ReviewSection({ eventId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [userReview, setUserReview] = useState<ReviewWithProfile | null>(null)

  // Form state
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    // Check auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    fetchReviews()
  }, [eventId])

  useEffect(() => {
    // Check if current user has already reviewed
    if (user && reviews.length > 0) {
      const existing = reviews.find((r) => r.user_id === user.id)
      if (existing) {
        setUserReview(existing)
        setRating(existing.rating)
        setComment(existing.comment || '')
      } else {
        setUserReview(null)
        setRating(0)
        setComment('')
      }
    }
  }, [user, reviews])

  const fetchReviews = async () => {
    setLoading(true)
    console.log('Fetching reviews for event:', eventId)

    // Step 1: Fetch reviews without join first
    const { data: reviewsData, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError)
      console.error('Error message:', reviewsError.message)
      console.error('Error details:', reviewsError.details)
      console.error('Error hint:', reviewsError.hint)
      console.error('Error code:', reviewsError.code)
      setLoading(false)
      return
    }

    console.log('Reviews fetched successfully:', reviewsData)

    const typedReviewsData = (reviewsData as Review[]) || []

    if (typedReviewsData.length === 0) {
      setReviews([])
      setLoading(false)
      return
    }

    // Step 2: Fetch profiles for each review's user_id
    const userIds = [...new Set(typedReviewsData.map(r => r.user_id))]
    console.log('Fetching profiles for user IDs:', userIds)

    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .in('id', userIds)

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      console.error('Error message:', profilesError.message)
      // Still show reviews without profile info
      setReviews(typedReviewsData.map(r => ({ ...r, profile: null })) as ReviewWithProfile[])
      setLoading(false)
      return
    }

    console.log('Profiles fetched successfully:', profilesData)

    // Step 3: Combine reviews with profiles
    type ProfileData = Pick<Profile, 'id' | 'full_name' | 'email' | 'avatar_url'>
    const typedProfilesData = (profilesData as ProfileData[]) || []
    const profilesMap = new Map(typedProfilesData.map(p => [p.id, p]))
    const reviewsWithProfiles = typedReviewsData.map(review => ({
      ...review,
      profile: profilesMap.get(review.user_id) || null
    }))

    console.log('Combined reviews with profiles:', reviewsWithProfiles)
    setReviews(reviewsWithProfiles as ReviewWithProfile[])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setError('You must be logged in to leave a review')
      return
    }

    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      if (userReview) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update({
            rating,
            comment: comment.trim() || null,
          } as never)
          .eq('id', userReview.id)

        if (error) throw error
      } else {
        // Create new review
        const { error } = await supabase
          .from('reviews')
          .insert({
            user_id: user.id,
            event_id: eventId,
            rating,
            comment: comment.trim() || null,
          } as never)

        if (error) throw error
      }

      // Refresh reviews
      await fetchReviews()
      setIsEditing(false)
    } catch (err) {
      console.error('Error submitting review:', err)
      setError('Failed to submit review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!userReview) return

    if (!confirm('Are you sure you want to delete your review?')) return

    setSubmitting(true)

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', userReview.id)

      if (error) throw error

      setUserReview(null)
      setRating(0)
      setComment('')
      setIsEditing(false)
      await fetchReviews()
    } catch (err) {
      console.error('Error deleting review:', err)
      setError('Failed to delete review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

  return (
    <div className="border-t border-gray-200 pt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={Math.round(averageRating)} readonly size="sm" />
              <span className="text-sm text-gray-600">
                {averageRating.toFixed(1)} out of 5 ({reviews.length} review
                {reviews.length !== 1 ? 's' : ''})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Leave a Review Form - Only for logged in users */}
      {user ? (
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          {userReview && !isEditing ? (
            <div>
              <p className="text-sm text-gray-600 mb-2">Your review:</p>
              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={userReview.rating} readonly size="sm" />
                <span className="text-sm text-gray-500">
                  {formatDate(userReview.created_at)}
                </span>
              </div>
              {userReview.comment && (
                <p className="text-gray-700 mb-4">{userReview.comment}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-karachi-orange hover:text-orange-600 font-medium"
                >
                  Edit Review
                </button>
                <button
                  onClick={handleDelete}
                  disabled={submitting}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {userReview ? 'Edit Your Review' : 'Leave a Review'}
              </h3>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Rating
                </label>
                <StarRating rating={rating} onRatingChange={setRating} size="lg" />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Review (optional)
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder="Share your experience at this event..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-karachi-blue focus:border-karachi-blue resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting || rating === 0}
                  className="px-6 py-2 bg-gradient-to-r from-karachi-blue to-teal-500 text-white font-medium rounded-lg hover:from-[#006666] hover:to-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? 'Submitting...'
                    : userReview
                    ? 'Update Review'
                    : 'Submit Review'}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false)
                      setRating(userReview?.rating || 0)
                      setComment(userReview?.comment || '')
                      setError(null)
                    }}
                    className="px-6 py-2 bg-karachi-orange text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-center">
          <p className="text-gray-600 mb-3">Log in to leave a review</p>
          <a
            href="/login"
            className="inline-block px-6 py-2 bg-gradient-to-r from-karachi-blue to-teal-500 text-white font-medium rounded-lg hover:from-[#006666] hover:to-teal-600 transition-colors"
          >
            Login
          </a>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p>No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews
            .filter((review) => review.user_id !== user?.id) // Don't show user's own review in list
            .map((review) => (
              <div
                key={review.id}
                className="border-b border-gray-200 pb-6 last:border-0"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  {review.profile?.avatar_url ? (
                    <img
                      src={review.profile.avatar_url}
                      alt={review.profile.full_name || 'User'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {review.profile?.full_name?.charAt(0).toUpperCase() ||
                        review.profile?.email?.charAt(0).toUpperCase() ||
                        'U'}
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">
                        {review.profile?.full_name ||
                          review.profile?.email?.split('@')[0] ||
                          'Anonymous'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.created_at)}
                      </span>
                    </div>

                    <StarRating rating={review.rating} readonly size="sm" />

                    {review.comment && (
                      <p className="mt-2 text-gray-700">{review.comment}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
