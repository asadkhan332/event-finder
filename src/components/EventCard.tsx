import Link from 'next/link'
import { Event } from '@/lib/database.types'
import { formatDistance } from '@/lib/location'

type EventCardProps = {
  event: Event
  distance?: number // Distance in kilometers
}

export default function EventCard({ event, distance }: EventCardProps) {
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <Link
      href={`/events/${event.id}`}
      className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {event.image_url && (
        <img
          src={event.image_url}
          alt={event.title}
          className="w-full h-48 object-cover"
        />
      )}
      {!event.image_url && (
        <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <span className="text-white text-4xl font-bold">
            {event.title.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {event.title}
        </h3>
        <div className="flex items-center text-gray-600 text-sm mb-2">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center text-gray-600 text-sm">
          <svg
            className="w-4 h-4 mr-2 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
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
          <span className="line-clamp-1">{event.location_name}</span>
        </div>

        {distance !== undefined && (
          <div className="flex items-center text-blue-600 text-sm mt-2">
            <svg
              className="w-4 h-4 mr-2 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            <span className="font-medium">{formatDistance(distance)} away</span>
          </div>
        )}
      </div>
    </Link>
  )
}
