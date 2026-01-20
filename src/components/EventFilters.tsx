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
      <div className="w-full py-8">
        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center">
          <span className="w-2 h-8 bg-teal-500 rounded-full mr-3"></span>
          Explore by Category
        </h2>

        {/* Horizontal Scrollable Grid */}
        <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar">
          {categories.map((cat) => {
            const isActive = category === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`
                  flex-shrink-0 flex flex-col items-center justify-center
                  w-28 h-28 rounded-3xl transition-all duration-300
                  ${isActive
                    ? `${cat.activeBg} dark:bg-[#1A1A1A] text-gray-800 dark:text-gray-200 shadow-lg scale-105 border-2 ${cat.activeBorder} dark:border-gray-600`
                    : `bg-white dark:bg-[#1A1A1A] text-gray-600 hover:shadow-lg dark:hover:bg-gray-800 border-2 ${cat.borderColor} dark:border-gray-700`
                  }
                `}
              >
                <div className={`p-3 rounded-2xl mb-2 ${cat.iconBg}`}>
                  <div className="w-6 h-6">
                    {cat.id === 'music' && (
                      <svg fill="#6B21A8" viewBox="0 0 24 24">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                      </svg>
                    )}
                    {cat.id === 'food' && (
                      <svg fill="#C2410C" viewBox="0 0 24 24">
                        <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
                      </svg>
                    )}
                    {cat.id === 'tech' && (
                      <svg fill="#1E40AF" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    )}
                    {cat.id === 'arts' && (
                      <svg fill="#BE185D" viewBox="0 0 24 24">
                        <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
                      </svg>
                    )}
                    {cat.id === 'sports' && (
                      <svg fill="#047857" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z"/>
                      </svg>
                    )}
                    {cat.id === 'theater' && (
                      <svg fill="#B91C1C" viewBox="0 0 24 24">
                        <path d="M8.5 7V1h1v6h-1V7z"/>
                        <path d="M11.5 7V1h1v6h-1V7z"/>
                        <path d="M14.5 7V1h1v6h-1V7z"/>
                        <path d="M7.5 10v6h-1V9h7v7h-1v-6h-5z"/>
                        <path d="M16.5 10v6h-1V9h1v1z"/>
                        <path d="M12 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-3-3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                      </svg>
                    )}
                    {cat.id === 'photography' && (
                      <svg fill="#3730A3" viewBox="0 0 24 24">
                        <path d="M9 2 7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                      </svg>
                    )}
                    {cat.id === 'social' && (
                      <svg fill="#A16207" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                      </svg>
                    )}
                    {cat.id === 'all' && (
                      <svg fill="#0F766E" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">
                  {cat.name}
                </span>
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
