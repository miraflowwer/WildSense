import type { DetectionEvent, FilterState } from '../types'

export function sortedEvents(events: DetectionEvent[]): DetectionEvent[] {
  return [...events].sort(
    (a, b) =>
      b.risk_score - a.risk_score ||
      Date.parse(b.timestamp) - Date.parse(a.timestamp),
  )
}

export function filterEvents(
  events: DetectionEvent[],
  filter: FilterState,
): DetectionEvent[] {
  return events.filter(
    (e) =>
      (filter.species === '' || e.species === filter.species) &&
      (filter.risk === '' || e.risk_level === filter.risk) &&
      (filter.status === '' || e.status === filter.status) &&
      (filter.zone === '' || e.sensor_zone === filter.zone) &&
      (filter.community === '' || e.community === filter.community),
  )
}

export function findById(
  events: DetectionEvent[],
  id: string | null,
): DetectionEvent | null {
  if (!id) return null
  return events.find((e) => e.event_id === id) ?? null
}