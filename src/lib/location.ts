// Haversine formula to calculate distance between two coordinates
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in kilometers

  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in kilometers
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`
  }
  if (km < 10) {
    return `${km.toFixed(1)} km`
  }
  return `${Math.round(km)} km`
}

export type UserLocation = {
  latitude: number
  longitude: number
}

export const DISTANCE_OPTIONS = [
  { value: '5', label: 'Within 5 km' },
  { value: '10', label: 'Within 10 km' },
  { value: '25', label: 'Within 25 km' },
  { value: '50', label: 'Within 50 km' },
  { value: '100', label: 'Within 100 km' },
  { value: 'any', label: 'Any Distance' },
]
