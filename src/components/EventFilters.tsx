'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useTransition, useEffect } from 'react'
import { useGeolocation } from '@/hooks/useGeolocation'
import { DISTANCE_OPTIONS } from '@/lib/location'

const CATEGORIES = [
  'All Categories',
  'Technology',
  'Food & Drink',
  'Music',
  'Health & Wellness',
  'Business',
  'Arts & Culture',
  'Community',
  'Sports',
  'Education',
]

const DATE_FILTERS = [
  { value: 'all', label: 'All Dates' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
]

export default function EventFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const {
    location,
    loading: locationLoading,
    error: locationError,
    requestLocation,
    clearLocation,
  } = useGeolocation()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const category = searchParams.get('category') || ''
  const dateFilter = searchParams.get('date') || 'all'
  const nearbyFilter = searchParams.get('nearby') || ''
  const distanceFilter = searchParams.get('distance') || 'any'

  const createQueryString = useCallback(
    (params: Record<string, string>) => {
      const newParams = new URLSearchParams(searchParams.toString())

      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          newParams.set(key, value)
        } else {
          newParams.delete(key)
        }
      })

      return newParams.toString()
    },
    [searchParams]
  )

  const handleSearch = (value: string) => {
    setSearch(value)
    startTransition(() => {
      const queryString = createQueryString({ search: value })
      router.push(queryString ? `/?${queryString}` : '/')
    })
  }

  const handleCategoryChange = (value: string) => {
    startTransition(() => {
      const categoryValue = value === 'All Categories' ? '' : value
      const queryString = createQueryString({ category: categoryValue })
      router.push(queryString ? `/?${queryString}` : '/')
    })
  }

  const handleDateChange = (value: string) => {
    startTransition(() => {
      const dateValue = value === 'all' ? '' : value
      const queryString = createQueryString({ date: dateValue })
      router.push(queryString ? `/?${queryString}` : '/')
    })
  }

  const handleNearbyToggle = () => {
    if (nearbyFilter) {
      // Turn off nearby filter
      clearLocation()
      startTransition(() => {
        const queryString = createQueryString({
          nearby: '',
          distance: '',
          lat: '',
          lng: '',
        })
        router.push(queryString ? `/?${queryString}` : '/')
      })
    } else {
      // Request location and enable nearby filter
      requestLocation()
    }
  }

  // When location is obtained, update URL params
  useEffect(() => {
    if (location && !nearbyFilter) {
      startTransition(() => {
        const queryString = createQueryString({
          nearby: 'true',
          lat: location.latitude.toString(),
          lng: location.longitude.toString(),
          distance: distanceFilter === 'any' ? '' : distanceFilter,
        })
        router.push(queryString ? `/?${queryString}` : '/')
      })
    }
  }, [location])

  const handleDistanceChange = (value: string) => {
    startTransition(() => {
      const distanceValue = value === 'any' ? '' : value
      const queryString = createQueryString({ distance: distanceValue })
      router.push(queryString ? `/?${queryString}` : '/')
    })
  }

  const clearFilters = () => {
    setSearch('')
    clearLocation()
    startTransition(() => {
      router.push('/')
    })
  }

  const hasActiveFilters =
    search || category || (dateFilter && dateFilter !== 'all') || nearbyFilter

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">
            Search events
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              id="search"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search events by title, description, or location..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="w-full lg:w-48">
          <label htmlFor="category" className="sr-only">
            Category
          </label>
          <select
            id="category"
            value={category || 'All Categories'}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div className="w-full lg:w-40">
          <label htmlFor="date" className="sr-only">
            Date
          </label>
          <select
            id="date"
            value={dateFilter || 'all'}
            onChange={(e) => handleDateChange(e.target.value)}
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {DATE_FILTERS.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div className="w-full lg:w-auto flex items-center gap-2">
          <button
            onClick={handleNearbyToggle}
            disabled={locationLoading}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
              nearbyFilter
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
            } ${locationLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {locationLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : (
              <svg
                className="w-5 h-5"
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
            )}
            <span className="hidden sm:inline">
              {nearbyFilter ? 'Nearby' : 'Near Me'}
            </span>
          </button>

          {nearbyFilter && (
            <select
              id="distance"
              value={distanceFilter || 'any'}
              onChange={(e) => handleDistanceChange(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {DISTANCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Location Error Message */}
      {locationError && (
        <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {locationError}
        </div>
      )}

      {/* Active Filters & Clear */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Active filters:</span>

          {search && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              Search: &quot;{search}&quot;
              <button
                onClick={() => handleSearch('')}
                className="hover:text-blue-600"
                aria-label="Remove search filter"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
          )}

          {category && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-800 text-sm rounded-full">
              {category}
              <button
                onClick={() => handleCategoryChange('All Categories')}
                className="hover:text-green-600"
                aria-label="Remove category filter"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
          )}

          {dateFilter && dateFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
              {DATE_FILTERS.find((f) => f.value === dateFilter)?.label}
              <button
                onClick={() => handleDateChange('all')}
                className="hover:text-purple-600"
                aria-label="Remove date filter"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
          )}

          {nearbyFilter && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
              <svg
                className="w-4 h-4"
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
              </svg>
              Nearby
              {distanceFilter && distanceFilter !== 'any'
                ? ` (${distanceFilter} km)`
                : ''}
              <button
                onClick={handleNearbyToggle}
                className="hover:text-orange-600"
                aria-label="Remove location filter"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
          )}

          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-800 font-medium ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Loading indicator */}
      {isPending && (
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          Filtering...
        </div>
      )}
    </div>
  )
}
