export interface LatLngPair {
  lat: number
  lng: number
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}

export function haversineKm(a: LatLngPair, b: LatLngPair): number {
  const earthRadiusKm = 6371
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng
  return 2 * earthRadiusKm * Math.asin(Math.min(1, Math.sqrt(h)))
}

export function distanceToCircleKm(
  pt: LatLngPair,
  circleCenter: LatLngPair,
  radiusKm: number,
): number {
  return Math.max(0, haversineKm(pt, circleCenter) - radiusKm)
}

function two(n: number): string {
  return String(n).padStart(2, '0')
}

export function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${two(d.getUTCHours())}:${two(d.getUTCMinutes())}`
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function formatLocalTime(iso: string): string {
  const d = new Date(iso)
  return `${DAY_NAMES[d.getUTCDay()]} ${formatTime(iso)}`
}

export function formatUtcClock(d: Date = new Date()): string {
  return `${two(d.getUTCHours())}:${two(d.getUTCMinutes())}:${two(d.getUTCSeconds())} UTC`
}
