import type { Catalog } from './catalog-en'
import { formatSpeciesName, formatWeatherName } from '../engine/config'
import type { ContributionReason } from '../types'

export function speciesName(cat: Catalog, species: string): string {
  const key = species.toLowerCase().trim().replace(/\s+/g, '_')
  const hit = (cat.engine.species as Record<string, string>)[key]
  return hit ?? formatSpeciesName(species)
}

export function speciesDesc(cat: Catalog, species: string): string | null {
  const key = species.toLowerCase().trim().replace(/\s+/g, '_')
  return (cat.engine.speciesDesc as Record<string, string>)[key] ?? null
}

export function weatherName(cat: Catalog, weather: string): string {
  const hit = (cat.engine.weather as Record<string, string>)[weather]
  return hit ?? formatWeatherName(weather)
}

export function weatherDesc(cat: Catalog, weather: string): string | null {
  return (cat.engine.weatherDesc as Record<string, string>)[weather] ?? null
}

export function statusLabel(cat: Catalog, status: string): string {
  return (cat.statuses as Record<string, string>)[status] ?? status
}

export function riskLevelLabel(cat: Catalog, level: string): string {
  return (cat.riskLevels as Record<string, string>)[level] ?? level
}

export function reasonLabel(cat: Catalog, reason: ContributionReason): string {
  if (!reason.key) return reason.label
  return (cat.engine.reasons as Record<string, string>)[reason.key] ?? reason.label
}

export function reasonDescription(
  cat: Catalog,
  reason: ContributionReason,
  event: { species: string; weather_condition: string; movement_toward_farm: boolean },
): string {
  if (reason.key === 'species') {
    return speciesDesc(cat, event.species) ?? reason.description
  }
  if (reason.key === 'weather') {
    return weatherDesc(cat, event.weather_condition) ?? reason.description
  }
  if (reason.key === 'movement_toward') return cat.engine.desc.movementToward
  if (reason.key === 'movement_away') return cat.engine.desc.movementAway
  if (reason.key === 'time_peak') return cat.engine.desc.timePeak
  if (reason.key === 'time_outside') return cat.engine.desc.timeOutside
  if (reason.key === 'uncertainty') return cat.engine.desc.uncertaintyMissing
  return reason.description
}

export function uncertaintyWarning(cat: Catalog, warning: string | null): string | null {
  if (!warning) return null
  return (cat.engine.uncertainty as Record<string, string>)[warning] ?? warning
}