'use client'

import Link from 'next/link'
import { Event } from '@/lib/database.types'
import { formatDistance } from '@/lib/location'
import { MapPin, ChevronRight } from 'lucide-react'

type MobileEventCardProps = {
  event: Event
  distance?: number
}

export default function MobileEventCard({ event, distance }: MobileEventCardProps) {
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  return (
    <Link
      href={`/events/${event.id}`}
      className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
    >
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-teal-500 to-orange-500">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {event.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 dark:text-white truncate">
          {event.title}
        </h3>
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mt-1">
          <MapPin size={14} className="mr-1 flex-shrink-0 text-teal-500" />
          <span className="truncate">{event.location_name}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-400">{formattedDate}</span>
          {distance !== undefined && (
            <>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-teal-500 font-medium">
                {formatDistance(distance)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
    </Link>
  )
}
