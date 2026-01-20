import { supabase } from '@/lib/supabase'
import { Event } from '@/lib/database.types'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import MapWrapper from '@/components/MapWrapper'
import DeleteEventButton from '@/components/DeleteEventButton'
import EditEventButton from '@/components/EditEventButton'
import ReviewSection from '@/components/ReviewSection'
import ShareButton from '@/components/ShareButton'
import AttendeeButton from '@/components/AttendeeButton'

type Props = {
  params: Promise<{ id: string }>
}

async function getEvent(id: string): Promise<Event | null> {
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !event) {
    return null
  }

  return event as Event
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params
  const event = await getEvent(id)

  if (!event) {
    notFound()
  }

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const formattedTime = event.time
    ? new Date(`2000-01-01T${event.time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors">
      <header className="bg-white dark:bg-dark-surface shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Events
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-md overflow-hidden">
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-64 sm:h-80 object-cover"
            />
          ) : (
            <div className="w-full h-64 sm:h-80 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-6xl font-bold">
                {event.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-sm font-medium rounded-full">
                {event.category}
              </span>
              {event.is_featured && (
                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 text-sm font-medium rounded-full">
                  Featured
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {event.title}
            </h1>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <svg
                  className="w-6 h-6 mr-3 text-gray-500 dark:text-gray-400"
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
                <div>
                  <p className="font-medium">{formattedDate}</p>
                  {formattedTime && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formattedTime}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <svg
                  className="w-6 h-6 mr-3 text-gray-500 dark:text-gray-400"
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
                <p className="font-medium">{event.location_name}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                About this event
              </h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {event.description || 'No description available.'}
              </p>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Location
              </h2>
              {!event.latitude && !event.longitude && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Exact location not available. Showing default Karachi map.
                </p>
              )}
              <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <MapWrapper
                  latitude={event.latitude ?? undefined}
                  longitude={event.longitude ?? undefined}
                  eventTitle={event.title}
                />
              </div>
            </div>

            <AttendeeButton eventId={event.id} />

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-3">
              <ShareButton eventTitle={event.title} eventId={event.id} />
              <EditEventButton eventId={event.id} organizerId={event.organizer_id} />
            </div>

            <DeleteEventButton eventId={event.id} organizerId={event.organizer_id} imageUrl={event.image_url} />

            <ReviewSection eventId={event.id} />
          </div>
        </div>
      </main>
    </div>
  )
}
