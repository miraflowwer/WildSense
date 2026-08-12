import { useEffect, useState } from 'react'
import { useGahm } from '../store/store'
import {
  SPECIES_IMPACT,
  WEATHER_FACTOR,
  GROUP_SIZE_POINTS,
  thresholdsForZone,
} from '../engine/config'
import { computeRisk } from '../engine/riskEngine'
import { distanceToCircleKm } from '../engine/geo'
import { farmZones, nearestCommunityName } from '../data/demoData'
import type { DetectionEvent } from '../types'
import LocationPickerMap from './LocationPickerMap'

interface NewDetectionFormProps {
  onClose: () => void
}

const inputCls =
  'w-full rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm text-neutral-900 focus:border-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40'

const labelCls = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-600'

function NewDetectionForm({ onClose }: NewDetectionFormProps) {
  const { dispatch } = useGahm()
  const [species, setSpecies] = useState('elephant')
  const [count, setCount] = useState('1')
  const [confidence, setConfidence] = useState(0.8)
  const [weather, setWeather] = useState('dry')
  const [towardFarm, setTowardFarm] = useState(true)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [picking, setPicking] = useState(false)

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (picking) return
      if (ev.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, picking])

  const submit = () => {
    if (!location) return
    const timestamp = new Date().toISOString()
    const distance = Math.min(
      ...farmZones.map((f) =>
        distanceToCircleKm(location, { lat: f.center[0], lng: f.center[1] }, f.radiusKm),
      ),
    )
    const risk = computeRisk(
      {
        species,
        detection_confidence: confidence,
        estimated_count: Number(count),
        distance_to_farm_km: distance,
        movement_toward_farm: towardFarm,
        movementKnown: true,
        historical_incidents_nearby: 0,
        weather_condition: weather,
        trailLength: 1,
        hour: new Date(timestamp).getUTCHours(),
      },
      thresholdsForZone('Manual Detection'),
    )
    const event: DetectionEvent = {
      event_id: `EVT-${Date.now().toString(36).toUpperCase()}`,
      timestamp,
      sensor_zone: 'Manual Detection',
      species,
      detection_confidence: confidence,
      estimated_count: Number(count),
      distance_to_farm_km: distance,
      movement_toward_farm: towardFarm,
      movementKnown: true,
      historical_incidents_nearby: 0,
      weather_condition: weather,
      position: { lat: location.lat, lng: location.lng },
      trail: [{ lat: location.lat, lng: location.lng, ts: timestamp }],
      speed_kmh: null,
      community: nearestCommunityName(location),
      risk_score: risk.risk_score,
      risk_level: risk.risk_level,
      reasons: risk.reasons,
      uncertainty: risk.uncertainty,
      status: 'awaiting_review',
      acknowledgedAt: null,
      rangerContactedAt: null,
      owner: null,
      outcome: null,
    }
    dispatch({ type: 'ADD_EVENT', event })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Log detection</h3>
            <p className="font-mono text-xs text-neutral-500">Manual field report</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md px-2 py-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="nd-species" className={labelCls}>
              Species
            </label>
            <select
              id="nd-species"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              className={inputCls}
            >
              {Object.keys(SPECIES_IMPACT).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="nd-count" className={labelCls}>
              Estimated count
            </label>
            <select
              id="nd-count"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className={inputCls}
            >
              {Object.keys(GROUP_SIZE_POINTS).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="nd-confidence" className={labelCls}>
              Detection confidence — {Math.round(confidence * 100)}%
            </label>
            <input
              id="nd-confidence"
              type="range"
              min={0.5}
              max={1}
              step={0.01}
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
          </div>

          <div>
            <label htmlFor="nd-weather" className={labelCls}>
              Weather
            </label>
            <select
              id="nd-weather"
              value={weather}
              onChange={(e) => setWeather(e.target.value)}
              className={inputCls}
            >
              {Object.keys(WEATHER_FACTOR).map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-neutral-800">
            <input
              type="checkbox"
              checked={towardFarm}
              onChange={(e) => setTowardFarm(e.target.checked)}
              className="h-4 w-4 accent-emerald-600"
            />
            Moving toward farm?
          </label>

          <div className="rounded-lg border border-neutral-200 p-3">
            <span className={labelCls}>Location</span>
            <p className="font-mono text-sm text-neutral-900">
              {location
                ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
                : 'No location yet'}
            </p>
            <button
              type="button"
              onClick={() => setPicking(true)}
              className="mt-3 w-full rounded-md border border-emerald-600 px-3 py-2 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
            >
              {location ? 'Change location' : 'Select location'}
            </button>
            <p className="mt-2 text-[11px] text-neutral-500">
              Distance to the nearest farm boundary is computed automatically.
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!location}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Log detection
          </button>
        </div>
      </div>

      {picking ? (
        <LocationPickerMap
          initial={location}
          onConfirm={(pos) => {
            setLocation(pos)
            setPicking(false)
          }}
          onClose={() => setPicking(false)}
        />
      ) : null}
    </div>
  )
}

export default NewDetectionForm