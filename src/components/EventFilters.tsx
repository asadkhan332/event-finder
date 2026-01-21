'use client'

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition, useEffect, useState } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';

const categories = [
  { id: 'all', name: 'All Events', iconBg: 'bg-teal-100', activeBg: 'bg-teal-50', borderColor: 'border-teal-400', activeBorder: 'border-teal-500' },
  { id: 'food', name: 'Food & Drink', iconBg: 'bg-orange-100', activeBg: 'bg-orange-50', borderColor: 'border-orange-400', activeBorder: 'border-orange-500' },
  { id: 'music', name: 'Concerts', iconBg: 'bg-purple-100', activeBg: 'bg-purple-50', borderColor: 'border-purple-400', activeBorder: 'border-purple-500' },
  { id: 'tech', name: 'Tech/Work', iconBg: 'bg-blue-100', activeBg: 'bg-blue-50', borderColor: 'border-blue-400', activeBorder: 'border-blue-500' },
  { id: 'arts', name: 'Art & Culture', iconBg: 'bg-pink-100', activeBg: 'bg-rose-50', borderColor: 'border-rose-400', activeBorder: 'border-rose-500' },
  { id: 'sports', name: 'Sports', iconBg: 'bg-emerald-100', activeBg: 'bg-emerald-50', borderColor: 'border-emerald-400', activeBorder: 'border-emerald-500' },
  { id: 'theater', name: 'Theater', iconBg: 'bg-red-100', activeBg: 'bg-red-50', borderColor: 'border-red-400', activeBorder: 'border-red-500' },
  { id: 'photography', name: 'Workshops', iconBg: 'bg-indigo-100', activeBg: 'bg-indigo-50', borderColor: 'border-indigo-400', activeBorder: 'border-indigo-500' },
  { id: 'social', name: 'Meetups', iconBg: 'bg-yellow-100', activeBg: 'bg-yellow-50', borderColor: 'border-yellow-400', activeBorder: 'border-yellow-500' },
];

const DISTANCE_OPTIONS = [
  { value: 'any', label: 'Any Distance' },
  { value: '5', label: '5 km' },
  { value: '10', label: '10 km' },
  { value: '25', label: '25 km' },
  { value: '50', label: '50 km' },
];

const EventFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const {
    location,
    loading: locationLoading,
    error: locationError,
    requestLocation,
    clearLocation,
  } = useGeolocation();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const category = searchParams.get('category') || 'all';
  const dateFilter = searchParams.get('date') || 'all';
  const nearbyFilter = searchParams.get('nearby') || '';
  const distanceFilter = searchParams.get('distance') || 'any';

  const createQueryString = useCallback(
    (params: Record<string, string>) => {
      const newParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      });

      return newParams.toString();
    },
    [searchParams]
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    startTransition(() => {
      const queryString = createQueryString({ search: value });
      router.push(queryString ? `/?${queryString}` : '/');
    });
  };

  const handleCategoryChange = (value: string) => {
    startTransition(() => {
      const queryString = createQueryString({ category: value });
      router.push(queryString ? `/?${queryString}` : '/');
    });
  };

  const handleDateChange = (value: string) => {
    startTransition(() => {
      const queryString = createQueryString({ date: value });
      router.push(queryString ? `/?${queryString}` : '/');
    });
  };

  const handleNearbyToggle = () => {
    if (nearbyFilter) {
      // Turn off nearby filter
      clearLocation();
      startTransition(() => {
        const queryString = createQueryString({
          nearby: '',
          distance: '',
          lat: '',
          lng: '',
        });
        router.push(queryString ? `/?${queryString}` : '/');
      });
    } else {
      // Request location and enable nearby filter
      requestLocation();
    }
  };


  const handleDistanceChange = (value: string) => {
    startTransition(() => {
      const distanceValue = value === 'any' ? '' : value;
      const queryString = createQueryString({ distance: distanceValue });
      router.push(queryString ? `/?${queryString}` : '/');
    });
  };

  const clearFilters = () => {
    setSearch('');
    clearLocation();
    startTransition(() => {
      router.push('/');
    });
  };


  const hasActiveFilters =
    search || category !== 'all' || dateFilter !== 'all' || nearbyFilter;

  return (
    <div className="w-full">
      {/* Search Input */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-teal-500"
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
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search events by keyword..."
            className="block w-full pl-10 pr-3 py-3 border-2 border-teal-500/30 dark:border-gray-600 rounded-full bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-[0_15px_50px_rgba(0,128,128,0.15)]"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="w-full py-6 md:py-8">
        <h2 className="text-lg md:text-xl font-bold text-foreground mb-4 md:mb-6 flex items-center">
          <span className="w-1.5 md:w-2 h-6 md:h-8 bg-teal-500 rounded-full mr-2 md:mr-3"></span>
          Explore by Category
        </h2>

        {/* Pill Buttons - Horizontal scroll on mobile */}
        <div className="flex overflow-x-auto whitespace-nowrap gap-2 md:gap-3 pb-2 scrollbar-hide">
          {categories.map((cat) => {
            const isActive = category === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-teal-500 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-teal-500 hover:text-teal-500'
                  }
                `}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date and Location Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="w-full sm:w-40">
          <label htmlFor="date" className="sr-only">
            Date
          </label>
          <select
            id="date"
            value={dateFilter || 'all'}
            onChange={(e) => handleDateChange(e.target.value)}
            className="block w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-full bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-lg"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2">
          <button
            onClick={handleNearbyToggle}
            disabled={locationLoading}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-colors ${
              nearbyFilter
                ? 'bg-gradient-to-r from-[#008080] to-[#00a3a3] text-white hover:from-[#006666] hover:to-[#008080]'
                : 'bg-gradient-to-r from-[#008080] to-[#00a3a3] text-white hover:from-[#006666] hover:to-[#008080] shadow-lg'
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
              className="px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-full bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-lg"
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
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">Active filters:</span>

          {search && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-sm rounded-full">
              Search: &quot;{search}&quot;
              <button
                onClick={() => handleSearch('')}
                className="hover:text-blue-600 dark:hover:text-blue-200"
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

          {category !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 text-sm rounded-full">
              {categories.find(c => c.id === category)?.name || 'Category'}
              <button
                onClick={() => handleCategoryChange('all')}
                className="hover:text-green-600 dark:hover:text-green-200"
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

          {dateFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 text-sm rounded-full">
              {dateFilter === 'today' && 'Today'}
              {dateFilter === 'week' && 'This Week'}
              {dateFilter === 'month' && 'This Month'}
              <button
                onClick={() => handleDateChange('all')}
                className="hover:text-purple-600 dark:hover:text-purple-200"
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
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 text-sm rounded-full">
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
              {distanceFilter !== 'any'
                ? ` (${distanceFilter} km)`
                : ''}
              <button
                onClick={handleNearbyToggle}
                className="hover:text-orange-600 dark:hover:text-orange-200"
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
            className="text-sm text-[#FF7F50] dark:text-[#FF7F50] hover:text-orange-700 dark:hover:text-orange-400 font-medium ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Loading indicator */}
      {isPending && (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          Filtering...
        </div>
      )}
    </div>
  );
};

export default EventFilters;
