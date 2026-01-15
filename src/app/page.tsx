import { supabase } from '@/lib/supabase'
import { Event } from '@/lib/database.types'
import Navbar from '@/components/Navbar'
import EventFilters from '@/components/EventFilters'
import FeaturedEvents from '@/components/FeaturedEvents'
import EventList from '@/components/EventList'
import { Suspense } from 'react'

export const revalidate = 0

async function getFeaturedEvents(): Promise<Event[]> {
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_featured', true)
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })
    .limit(5)

  if (error) {
    console.error('Error fetching featured events:', error)
    return []
  }

  return (events as Event[]) || []
}

type SearchParams = {
  search?: string
  category?: string
  date?: string
  nearby?: string
  lat?: string
  lng?: string
  distance?: string
}

function getDateRange(dateFilter: string): { start: string; end: string } | null {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  switch (dateFilter) {
    case 'today': {
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      return {
        start: today.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0],
      }
    }
    case 'week': {
      const endOfWeek = new Date(today)
      endOfWeek.setDate(endOfWeek.getDate() + 7)
      return {
        start: today.toISOString().split('T')[0],
        end: endOfWeek.toISOString().split('T')[0],
      }
    }
    case 'month': {
      const endOfMonth = new Date(today)
      endOfMonth.setMonth(endOfMonth.getMonth() + 1)
      return {
        start: today.toISOString().split('T')[0],
        end: endOfMonth.toISOString().split('T')[0],
      }
    }
    default:
      return null
  }
}

async function getEvents(searchParams: SearchParams): Promise<Event[]> {
  let query = supabase.from('events').select('*')

  // Apply search filter (search in title, description, and location)
  if (searchParams.search) {
    const searchTerm = `%${searchParams.search}%`
    query = query.or(
      `title.ilike.${searchTerm},description.ilike.${searchTerm},location_name.ilike.${searchTerm}`
    )
  }

  // Apply category filter
  if (searchParams.category) {
    query = query.eq('category', searchParams.category)
  }

  // Apply date filter
  if (searchParams.date) {
    const dateRange = getDateRange(searchParams.date)
    if (dateRange) {
      query = query.gte('date', dateRange.start).lte('date', dateRange.end)
    }
  }

  // Order by date
  query = query.order('date', { ascending: true })

  const { data: events, error } = await query

  if (error) {
    console.error('Error fetching events:', error)
    return []
  }

  return (events as Event[]) || []
}

type Props = {
  searchParams: Promise<SearchParams>
}

export default async function Home({ searchParams }: Props) {
  const params = await searchParams
  const hasFilters = params.search || params.category || params.date || params.nearby

  // Parse location params
  const userLat = params.lat ? parseFloat(params.lat) : undefined
  const userLng = params.lng ? parseFloat(params.lng) : undefined
  const maxDistance = params.distance ? parseFloat(params.distance) : undefined
  const isNearbyMode = params.nearby === 'true' && userLat && userLng

  // Fetch events and featured events in parallel
  const [events, featuredEvents] = await Promise.all([
    getEvents(params),
    hasFilters ? Promise.resolve([]) : getFeaturedEvents(),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Events Section - only show when no filters are active */}
        {!hasFilters && featuredEvents.length > 0 && (
          <FeaturedEvents events={featuredEvents} />
        )}

        <Suspense fallback={<div className="bg-white rounded-lg shadow-md p-4 mb-6 h-20 animate-pulse" />}>
          <EventFilters />
        </Suspense>

        {events.length === 0 ? (
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {hasFilters ? (
              <>
                <h2 className="mt-4 text-xl font-semibold text-gray-900">No events found</h2>
                <p className="mt-2 text-gray-600">
                  Try adjusting your search or filters to find what you&apos;re looking for.
                </p>
              </>
            ) : (
              <>
                <h2 className="mt-4 text-xl font-semibold text-gray-900">No events yet</h2>
                <p className="mt-2 text-gray-600">
                  Check back later or create your own event!
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            {hasFilters ? (
              <div className="flex items-center gap-2 mb-4">
                <p className="text-sm text-gray-600">
                  Found {events.length} event{events.length !== 1 ? 's' : ''}
                </p>
                {isNearbyMode && (
                  <span className="text-sm text-blue-600 font-medium">
                    (sorted by distance)
                  </span>
                )}
              </div>
            ) : featuredEvents.length > 0 ? (
              <h2 className="text-2xl font-bold text-gray-900 mb-4">All Events</h2>
            ) : null}
            <EventList
              events={events}
              userLat={isNearbyMode ? userLat : undefined}
              userLng={isNearbyMode ? userLng : undefined}
              maxDistance={isNearbyMode ? maxDistance : undefined}
            />
          </>
        )}
      </main>
    </div>
  )
}
