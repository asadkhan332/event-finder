'use client'

import { MapPin, Bell } from 'lucide-react'

const MobileHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 block md:hidden">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Location - Left */}
        <button className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
          <MapPin size={18} className="text-teal-500" />
          <span className="text-sm font-medium">Pakistan</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Title - Center */}
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">
          Event<span className="text-teal-500">Finder</span>
        </h1>

        {/* Notification - Right */}
        <button className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-teal-500 transition-colors">
          <Bell size={22} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </header>
  )
}

export default MobileHeader
