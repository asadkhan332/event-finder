'use client'

import { useMemo } from 'react'
import { Event } from '@/lib/database.types'
import { calculateDistance } from '@/lib/location'
import EventCard from './EventCard'

type EventWithDistance = Event & { distance?: number }

type EventListProps = {
  events: Event[]
  userLat?: number
  userLng?: number
  maxDistance?: number // in kilometers
}

export default function EventList({ events, userLat, userLng, maxDistance }: EventListProps) {
  const eventsWithDistance = useMemo(() => {
    if (!userLat || !userLng) {
      return events.map((event) => ({ ...event, distance: undefined }))
    }

    // Calculate distance for each event
    const eventsWithDist: EventWithDistance[] = events.map((event) => {
      if (event.latitude && event.longitude) {
        const distance = calculateDistance(
          userLat,
          userLng,
          event.latitude,
          event.longitude
        )
        return { ...event, distance }
      }
      return { ...event, distance: undefined }
    })

    // Filter by max distance if specified
    let filtered = eventsWithDist
    if (maxDistance) {
      filtered = eventsWithDist.filter(
        (event) => event.distance === undefined || event.distance <= maxDistance
      )
    }

    // Sort by distance (events without location go to the end)
    filtered.sort((a, b) => {
      if (a.distance === undefined && b.distance === undefined) return 0
      if (a.distance === undefined) return 1
      if (b.distance === undefined) return -1
      return a.distance - b.distance
    })

    return filtered
  }, [events, userLat, userLng, maxDistance])

  if (eventsWithDistance.length === 0) {
    return (
      <div className="text-center py-16">
        <svg
          className="mx-auto h-16 w-16 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <h2 className="mt-4 text-xl font-semibold text-gray-900">No nearby events</h2>
        <p className="mt-2 text-gray-600">
          Try increasing the distance or removing the location filter.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {eventsWithDistance.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          distance={userLat && userLng ? event.distance : undefined}
        />
      ))}
    </div>
  )
}
