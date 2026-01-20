import Link from 'next/link'
import { useState } from 'react'
import { Event } from '@/lib/database.types'
import { formatDistance } from '@/lib/location'
import { Calendar, MapPin, Navigation, Clock, MessageCircle } from 'lucide-react'

type EventCardProps = {
  event: Event
  distance?: number // Distance in kilometers
}

export default function EventCard({ event, distance }: EventCardProps) {
  const [isShared, setIsShared] = useState(false)
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const formattedTime = new Date(`2000-01-01T${event.time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    const encodedTitle = encodeURIComponent(event.title)
    const encodedUrl = encodeURIComponent(`${window.location.origin}/events/${event.id}`)
    const shareText = `Check%20out%20this%20event:%20${encodedTitle}%0A${encodedUrl}`
    window.open(`https://wa.me/?text=${shareText}`, '_blank')
    setIsShared(true)
    setTimeout(() => setIsShared(false), 2000)
  }

  return (
    <Link
      href={`/events/${event.id}`}
      className="block group relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl hover:shadow-teal-500/20 transition-all duration-300 hover:scale-[1.02]"
    >
      {/* Decorative glow effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-400/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Image section */}
      {event.image_url && (
        <div className="relative overflow-hidden">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {event.is_featured && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              Featured
            </div>
          )}
        </div>
      )}
      {!event.image_url && (
        <div className="relative w-full h-48 bg-gradient-to-br from-teal-500 to-orange-500 flex items-center justify-center">
          {event.is_featured && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              Featured
            </div>
          )}
          <span className="text-white text-5xl font-bold opacity-80">
            {event.title.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      {/* Content section */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex-1 line-clamp-2 leading-tight group-hover:text-teal-600 transition-colors duration-300">
            {event.title}
          </h3>

          {/* WhatsApp Share Button */}
          <button
            onClick={handleWhatsAppShare}
            className={`ml-3 p-2 rounded-full transition-all duration-200 ${
              isShared
                ? 'bg-[#25D366] text-white'
                : 'bg-[#25D366] hover:bg-[#128C7E] text-white'
            } shadow-md hover:shadow-lg`}
            aria-label="Share on WhatsApp"
          >
            <MessageCircle size={16} />
          </button>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0 text-[#008080]" />
            <span className="truncate">{formattedDate}</span>
          </div>

          <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
            <Clock className="w-4 h-4 mr-2 flex-shrink-0 text-[#008080]" />
            <span className="truncate">{formattedTime}</span>
          </div>

          <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0 text-[#008080]" />
            <span className="truncate">{event.location_name}</span>
          </div>

          {distance !== undefined && (
            <div className="flex items-center text-[#008080] dark:text-[#008080] text-sm">
              <Navigation className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="font-medium">{formatDistance(distance)} away</span>
            </div>
          )}
        </div>

        <div className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl font-semibold text-center block hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer">
          View Details
        </div>
      </div>
    </Link>
  )
}
