'use client'

import { useState, useEffect, useCallback } from 'react'
import { UserLocation } from '@/lib/location'

type GeolocationState = {
  location: UserLocation | null
  error: string | null
  loading: boolean
  permissionDenied: boolean
}

const LOCATION_STORAGE_KEY = 'user_location'
const LOCATION_EXPIRY = 30 * 60 * 1000 // 30 minutes

type StoredLocation = {
  location: UserLocation
  timestamp: number
}

function getStoredLocation(): UserLocation | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(LOCATION_STORAGE_KEY)
    if (!stored) return null

    const parsed: StoredLocation = JSON.parse(stored)
    const now = Date.now()

    if (now - parsed.timestamp < LOCATION_EXPIRY) {
      return parsed.location
    }

    localStorage.removeItem(LOCATION_STORAGE_KEY)
    return null
  } catch {
    return null
  }
}

function storeLocation(location: UserLocation): void {
  if (typeof window === 'undefined') return

  try {
    const data: StoredLocation = {
      location,
      timestamp: Date.now(),
    }
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Ignore storage errors
  }
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: false,
    permissionDenied: false,
  })

  // Check for stored location on mount
  useEffect(() => {
    const stored = getStoredLocation()
    if (stored) {
      setState((prev) => ({ ...prev, location: stored }))
    }
  }, [])

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        loading: false,
      }))
      return
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: UserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }
        storeLocation(location)
        setState({
          location,
          error: null,
          loading: false,
          permissionDenied: false,
        })
      },
      (error) => {
        let errorMessage = 'Unable to get your location'
        let permissionDenied = false

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied'
            permissionDenied = true
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
        }

        setState({
          location: null,
          error: errorMessage,
          loading: false,
          permissionDenied,
        })
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: LOCATION_EXPIRY,
      }
    )
  }, [])

  const clearLocation = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCATION_STORAGE_KEY)
    }
    setState({
      location: null,
      error: null,
      loading: false,
      permissionDenied: false,
    })
  }, [])

  return {
    ...state,
    requestLocation,
    clearLocation,
  }
}
