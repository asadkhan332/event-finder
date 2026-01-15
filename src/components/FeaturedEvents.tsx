'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Event } from '@/lib/database.types'

type FeaturedEventsProps = {
  events: Event[]
}

export default function FeaturedEvents({ events }: FeaturedEventsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % events.length)
  }, [events.length])

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
  }

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || events.length <= 1) return

    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, events.length, nextSlide])

  if (events.length === 0) return null

  const currentEvent = events[currentIndex]

  const formattedDate = new Date(currentEvent.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const formattedTime = currentEvent.time
    ? new Date(`2000-01-01T${currentEvent.time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : null

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <svg
            className="w-6 h-6 text-yellow-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          Featured Events
        </h2>
        {events.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                prevSlide()
                setIsAutoPlaying(false)
              }}
              className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
              aria-label="Previous event"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => {
                nextSlide()
                setIsAutoPlaying(false)
              }}
              className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
              aria-label="Next event"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="relative overflow-hidden rounded-xl shadow-lg">
        <Link href={`/events/${currentEvent.id}`} className="block">
          <div className="relative h-64 sm:h-80 md:h-96">
            {currentEvent.image_url ? (
              <img
                src={currentEvent.image_url}
                alt={currentEvent.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
                <span className="text-white text-8xl font-bold opacity-30">
                  {currentEvent.title.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-yellow-500 text-yellow-900 text-xs font-bold rounded-full uppercase tracking-wide">
                  Featured
                </span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                  {currentEvent.category}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 line-clamp-2">
                {currentEvent.title}
              </h3>

              <div className="flex flex-wrap items-center gap-4 text-sm sm:text-base text-gray-200">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{formattedDate}</span>
                  {formattedTime && <span>at {formattedTime}</span>}
                </div>

                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="line-clamp-1">{currentEvent.location_name}</span>
                </div>
              </div>

              {currentEvent.description && (
                <p className="mt-3 text-gray-300 text-sm sm:text-base line-clamp-2 max-w-3xl hidden sm:block">
                  {currentEvent.description}
                </p>
              )}
            </div>
          </div>
        </Link>

        {/* Slide indicators */}
        {events.length > 1 && (
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            {events.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
